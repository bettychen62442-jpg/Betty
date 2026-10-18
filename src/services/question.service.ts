import { prisma } from "@/lib/prisma";
import { containsText } from "@/lib/search-filter";

// ── Query ───────────────────────────────────────────

export async function listQuestions(params: {
  search?: string;
  status?: string;
  categoryId?: string;
  difficulty?: number;
  tagName?: string;
  page?: number;
  limit?: number;
}) {
  const { search, status, categoryId, difficulty, tagName, page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { title: containsText(search) },
      { content: containsText(search) },
    ];
  }
  if (status) where.status = status;
  if (categoryId) where.categoryId = categoryId;
  if (difficulty) where.difficulty = difficulty;
  if (tagName) {
    where.tags = { some: { tag: { name: tagName } } };
  }

  const [data, total] = await Promise.all([
    prisma.question.findMany({
      where,
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.question.count({ where }),
  ]);

  return {
    data: data.map((q) => ({
      ...q,
      tags: q.tags.map((t) => t.tag),
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getQuestion(id: string) {
  return prisma.question.findUnique({
    where: { id },
    include: {
      category: true,
      tags: { include: { tag: true } },
      interviewQuestions: {
        include: { interview: true },
      },
    },
  });
}

// ── Mutations ───────────────────────────────────────

export async function createQuestion(data: {
  title: string;
  content: string;
  answer?: string;
  difficulty?: number;
  status?: string;
  categoryId?: string;
  tagNames?: string[];
  source?: string;
  sourceCompany?: string;
}) {
  const { tagNames, ...questionData } = data;

  return prisma.question.create({
    data: {
      ...questionData,
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
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  });
}

export async function updateQuestion(
  id: string,
  data: {
    title?: string;
    content?: string;
    answer?: string;
    difficulty?: number;
    status?: string;
    categoryId?: string;
    tagNames?: string[];
    source?: string;
    sourceCompany?: string;
    timesReviewed?: number;
    timesCorrect?: number;
    lastReviewed?: string;
  }
) {
  const { tagNames, ...questionData } = data;

  // If tagNames provided, replace all tags
  if (tagNames !== undefined) {
    // Delete existing tags
    await prisma.questionTag.deleteMany({ where: { questionId: id } });
  }

  return prisma.question.update({
    where: { id },
    data: {
      ...questionData,
      ...(data.lastReviewed ? { lastReviewed: new Date(data.lastReviewed) } : {}),
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
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  });
}

export async function deleteQuestion(id: string) {
  return prisma.question.delete({ where: { id } });
}

// ── Categories ──────────────────────────────────────

export async function listCategories() {
  return prisma.category.findMany({
    include: {
      children: true,
      _count: { select: { questions: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function createCategory(data: {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
}) {
  return prisma.category.create({ data });
}

export async function updateCategory(
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string;
    parentId?: string;
  }
) {
  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id: string) {
  return prisma.category.delete({ where: { id } });
}

// ── Tags ────────────────────────────────────────────

export async function listTags(search?: string) {
  return prisma.tag.findMany({
    where: search ? { name: containsText(search) } : undefined,
    include: { _count: { select: { questions: true } } },
    orderBy: { name: "asc" },
    take: 50,
  });
}
