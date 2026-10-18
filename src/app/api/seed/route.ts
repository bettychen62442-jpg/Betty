import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // Nuke and pave: delete all existing data
    await prisma.questionTag.deleteMany();
    await prisma.interviewQuestion.deleteMany();
    await prisma.extractedQuestion.deleteMany();
    await prisma.transcript.deleteMany();
    await prisma.audioRecording.deleteMany();
    await prisma.studyCard.deleteMany();
    await prisma.question.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.interviewLog.deleteMany();
    await prisma.knowledgeArticle.deleteMany();
    await prisma.jobApplication.deleteMany();
    await prisma.category.deleteMany();

    return Response.json({
      success: true,
      message: "All seed data cleared. Database is fresh — create your own categories and questions.",
    });
  } catch (error) {
    console.error("Seed error:", error);
    return Response.json({ error: "Seed failed", details: String(error) }, { status: 500 });
  }
}
