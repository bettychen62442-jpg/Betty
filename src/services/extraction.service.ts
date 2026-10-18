import { prisma } from "@/lib/prisma";
import { extractQuestions } from "@/ai/pipeline";
import { TranscriptionResult } from "@/ai/types";

// ── Trigger Extraction ──────────────────────────────

export async function triggerExtraction(audioId: string) {
  const audio = await prisma.audioRecording.findUnique({
    where: { id: audioId },
    include: { transcript: true },
  });
  if (!audio) throw new Error("Audio not found");
  if (!audio.transcript) throw new Error("No transcript available. Transcribe first.");

  // Update status
  await prisma.audioRecording.update({
    where: { id: audioId },
    data: { processingStatus: "EXTRACTING" },
  });

  try {
    // Parse transcript segments
    const transcript: TranscriptionResult = {
      fullText: audio.transcript.fullText,
      segments: audio.transcript.segments
        ? JSON.parse(audio.transcript.segments)
        : [],
      language: audio.transcript.language || "en",
    };

    // Extract questions
    const questions = await extractQuestions(transcript);

    // Save extracted questions
    for (const q of questions) {
      await prisma.extractedQuestion.create({
        data: {
          transcriptId: audio.transcript.id,
          questionText: q.questionText,
          answerText: q.answerText,
          suggestedCategory: q.suggestedCategory,
          suggestedTags: JSON.stringify(q.suggestedTags),
          suggestedDifficulty: q.suggestedDifficulty,
          status: "PENDING_REVIEW",
        },
      });
    }

    // Update status
    await prisma.audioRecording.update({
      where: { id: audioId },
      data: { processingStatus: "COMPLETED" },
    });

    return getExtractionsByAudio(audioId);
  } catch (error) {
    await prisma.audioRecording.update({
      where: { id: audioId },
      data: { processingStatus: "FAILED" },
    });
    throw error;
  }
}

// ── Query Extractions ───────────────────────────────

export async function getExtractionsByAudio(audioId: string) {
  const audio = await prisma.audioRecording.findUnique({
    where: { id: audioId },
    include: { transcript: true },
  });
  if (!audio?.transcript) return [];

  return prisma.extractedQuestion.findMany({
    where: { transcriptId: audio.transcript.id },
    orderBy: { createdAt: "asc" },
  });
}

export async function getExtraction(id: string) {
  return prisma.extractedQuestion.findUnique({ where: { id } });
}

// ── Review Extractions ──────────────────────────────

export async function updateExtraction(
  id: string,
  data: {
    status?: string;
    questionText?: string;
    reviewNote?: string;
  }
) {
  return prisma.extractedQuestion.update({
    where: { id },
    data,
  });
}

// ── Promote to Question Bank ────────────────────────

export async function promoteToQuestion(
  extractionId: string,
  data: {
    title?: string;
    categoryId?: string;
    tagNames?: string[];
    difficulty?: number;
  }
) {
  const extraction = await prisma.extractedQuestion.findUnique({
    where: { id: extractionId },
  });
  if (!extraction) throw new Error("Extraction not found");
  if (extraction.promotedQuestionId) throw new Error("Already promoted");

  const { tagNames, ...questionData } = data;

  // Create question in bank
  const question = await prisma.question.create({
    data: {
      title: data.title || extraction.questionText,
      content: extraction.questionText,
      answer: extraction.answerText,
      difficulty: data.difficulty || extraction.suggestedDifficulty || 3,
      status: "UNFAMILIAR",
      categoryId: data.categoryId || undefined,
      source: "AI Extracted from interview recording",
      tags: tagNames?.length
        ? {
            create: tagNames.map((name) => ({
              tag: {
                connectOrCreate: {
                  where: { name },
                  create: { name },
                },
              },
            })),
          }
        : undefined,
    },
  });

  // Update extraction status and link
  await prisma.extractedQuestion.update({
    where: { id: extractionId },
    data: {
      status: "ACCEPTED",
      promotedQuestionId: question.id,
    },
  });

  return question;
}
