import { prisma } from "@/lib/prisma";

export async function GET() {
  const [totalQuestions, masteredCount, reviewingCount, unfamiliarCount, totalInterviews, passCount, totalWithResult] =
    await Promise.all([
      prisma.question.count(),
      prisma.question.count({ where: { status: "MASTERED" } }),
      prisma.question.count({ where: { status: "REVIEWING" } }),
      prisma.question.count({ where: { status: "UNFAMILIAR" } }),
      prisma.interviewLog.count(),
      prisma.interviewLog.count({ where: { result: "PASS" } }),
      prisma.interviewLog.count({
        where: { result: { in: ["PASS", "FAIL"] } },
      }),
    ]);

  return Response.json({
    data: {
      totalQuestions,
      masteredCount,
      reviewingCount,
      unfamiliarCount,
      totalInterviews,
      passRate: totalWithResult > 0 ? passCount / totalWithResult : 0,
    },
  });
}
