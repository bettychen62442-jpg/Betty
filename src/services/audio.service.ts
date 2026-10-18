import { prisma } from "@/lib/prisma";
import { getStorageProvider } from "@/storage/storage-factory";
import { transcribeAudio } from "@/ai/pipeline";

function generateId(): string {
  return crypto.randomUUID();
}

// ── Upload ──────────────────────────────────────────

export async function uploadAudio(file: File, interviewId: string) {
  const storage = getStorageProvider();
  const id = generateId();
  const ext = file.name.split(".").pop() || "webm";
  const relativePath = `${interviewId}/${id}.${ext}`;

  const { storagePath, fileSize } = await storage.save(file, relativePath);

  return prisma.audioRecording.create({
    data: {
      id,
      interviewId,
      fileName: `${id}.${ext}`,
      originalName: file.name,
      storagePath,
      fileSize,
      mimeType: file.type || "audio/webm",
      processingStatus: "UPLOADED",
    },
  });
}

// ── Query ───────────────────────────────────────────

export async function getAudio(id: string) {
  return prisma.audioRecording.findUnique({
    where: { id },
    include: {
      transcript: {
        include: { extractedQuestions: true },
      },
    },
  });
}

export async function getAudiosByInterview(interviewId: string) {
  return prisma.audioRecording.findMany({
    where: { interviewId },
    include: {
      transcript: {
        include: { _count: { select: { extractedQuestions: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ── Delete ──────────────────────────────────────────

export async function deleteAudio(id: string) {
  const audio = await prisma.audioRecording.findUnique({ where: { id } });
  if (!audio) throw new Error("Audio not found");

  const storage = getStorageProvider();
  await storage.delete(audio.storagePath);

  return prisma.audioRecording.delete({ where: { id } });
}

// ── Transcription ───────────────────────────────────

export async function triggerTranscription(audioId: string) {
  const audio = await prisma.audioRecording.findUnique({ where: { id: audioId } });
  if (!audio) throw new Error("Audio not found");

  // Update status to TRANSCRIBING
  await prisma.audioRecording.update({
    where: { id: audioId },
    data: { processingStatus: "TRANSCRIBING" },
  });

  try {
    // Load audio buffer
    const storage = getStorageProvider();
    const buffer = await storage.getBuffer(audio.storagePath);

    // Transcribe
    const result = await transcribeAudio(buffer);

    // Save transcript
    await prisma.transcript.create({
      data: {
        audioId,
        fullText: result.fullText,
        segments: JSON.stringify(result.segments),
        language: result.language,
        providerName: "mock-transcriber",
      },
    });

    // Update status
    await prisma.audioRecording.update({
      where: { id: audioId },
      data: { processingStatus: "TRANSCRIBED" },
    });

    return getAudio(audioId);
  } catch (error) {
    await prisma.audioRecording.update({
      where: { id: audioId },
      data: { processingStatus: "FAILED" },
    });
    throw error;
  }
}

// ── File Serving ────────────────────────────────────

export async function getAudioFile(path: string) {
  const storage = getStorageProvider();
  return storage.getBuffer(path);
}
