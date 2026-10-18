import { prisma } from "@/lib/prisma";

// ── Query ───────────────────────────────────────────

export async function listInterviews(params: {
  company?: string;
  result?: string;
  page?: number;
  limit?: number;
}) {
  const { company, result, page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (company) where.company = { contains: company };
  if (result) where.result = result;

  const [data, total] = await Promise.all([
    prisma.interviewLog.findMany({
      where,
      orderBy: { interviewDate: "desc" },
      skip,
      take: limit,
      include: {
        _count: { select: { questions: true, audioRecordings: true } },
      },
    }),
    prisma.interviewLog.count({ where }),
  ]);

  return { data, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getInterview(id: string) {
  return prisma.interviewLog.findUnique({
    where: { id },
    include: {
      questions: {
        include: { question: true },
        orderBy: { sortOrder: "asc" },
      },
      audioRecordings: {
        include: { transcript: true },
      },
    },
  });
}

// ── Mutations ───────────────────────────────────────

export async function createInterview(data: {
  company: string;
  position: string;
  round?: string;
  interviewDate?: string;
  result?: string;
  resultReason?: string;
  overallNotes?: string;
}) {
  return prisma.interviewLog.create({
    data: {
      ...data,
      interviewDate: data.interviewDate ? new Date(data.interviewDate) : new Date(),
    },
  });
}

export async function updateInterview(
  id: string,
  data: {
    company?: string;
    position?: string;
    round?: string;
    interviewDate?: string;
    result?: string;
    resultReason?: string;
    overallNotes?: string;
  }
) {
  return prisma.interviewLog.update({
    where: { id },
    data: {
      ...data,
      ...(data.interviewDate ? { interviewDate: new Date(data.interviewDate) } : {}),
    },
  });
}

export async function deleteInterview(id: string) {
  return prisma.interviewLog.delete({ where: { id } });
}

// ── Interview Questions ─────────────────────────────

export async function linkQuestionToInterview(
  interviewId: string,
  data: {
    questionId?: string;
    questionText?: string;
    selfScore?: number;
    wasCorrect?: boolean;
    interviewerNote?: string;
    sortOrder?: number;
  }
) {
  return prisma.interviewQuestion.create({
    data: {
      interviewId,
      ...data,
    },
    include: { question: true },
  });
}

export async function updateInterviewQuestion(
  id: string,
  data: {
    questionId?: string;
    questionText?: string;
    selfScore?: number;
    wasCorrect?: boolean;
    interviewerNote?: string;
    sortOrder?: number;
  }
) {
  return prisma.interviewQuestion.update({
    where: { id },
    data,
    include: { question: true },
  });
}

export async function unlinkQuestion(id: string) {
  return prisma.interviewQuestion.delete({ where: { id } });
}
