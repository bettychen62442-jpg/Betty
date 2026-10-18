import { z } from "zod";

// ── Questions ───────────────────────────────────────

export const createQuestionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  answer: z.string().optional(),
  difficulty: z.number().int().min(1).max(5).default(3),
  status: z.enum(["UNFAMILIAR", "REVIEWING", "MASTERED"]).default("UNFAMILIAR"),
  categoryId: z.string().optional(),
  tagNames: z.array(z.string()).optional(),
  source: z.string().optional(),
  sourceCompany: z.string().optional(),
});

export const updateQuestionSchema = createQuestionSchema.partial();

// ── Categories ──────────────────────────────────────

function generateSlug(name: string): string {
  // Try to create a URL-safe slug from the name
  let slug = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    // Keep letters, numbers, and CJK characters in the slug
    .replace(/[^a-z0-9-一-鿿぀-ゟ゠-ヿ가-힯]/g, "");

  // If slug is empty after filtering (e.g., emoji-only), use a timestamp fallback
  if (!slug) {
    slug = `cat-${Date.now()}`;
  }
  return slug;
}

export const createCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  parentId: z.string().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

// ── Interviews ──────────────────────────────────────

export const createInterviewSchema = z.object({
  company: z.string().min(1, "Company is required"),
  position: z.string().min(1, "Position is required"),
  round: z
    .enum([
      "PHONE_SCREEN",
      "TECHNICAL_1",
      "TECHNICAL_2",
      "ONSITE",
      "BEHAVIORAL",
      "SYSTEM_DESIGN",
      "HR",
      "OTHER",
    ])
    .default("OTHER"),
  interviewDate: z.string().optional(),
  result: z.enum(["PASS", "FAIL", "PENDING"]).default("PENDING"),
  resultReason: z.string().optional(),
  overallNotes: z.string().optional(),
});

export const updateInterviewSchema = createInterviewSchema.partial();

// ── Interview Questions ─────────────────────────────

export const linkQuestionSchema = z.object({
  questionId: z.string().optional(),
  questionText: z.string().optional(),
  selfScore: z.number().int().min(1).max(5).optional(),
  wasCorrect: z.boolean().optional(),
  interviewerNote: z.string().optional(),
  sortOrder: z.number().int().default(0),
});

// ── Extractions ─────────────────────────────────────

export const updateExtractionSchema = z.object({
  status: z.enum(["PENDING_REVIEW", "ACCEPTED", "REJECTED", "MODIFIED"]).optional(),
  questionText: z.string().optional(),
  reviewNote: z.string().optional(),
});

export const promoteExtractionSchema = z.object({
  title: z.string().min(1).optional(),
  categoryId: z.string().optional(),
  tagNames: z.array(z.string()).optional(),
  difficulty: z.number().int().min(1).max(5).optional(),
});

// ── Study ───────────────────────────────────────────

export const gradeCardSchema = z.object({
  cardId: z.string(),
  grade: z.number().int().min(0).max(5),
});

// ── Knowledge ───────────────────────────────────────

export const createKnowledgeSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  type: z.enum(["general", "star_story", "system_design", "behavioral"]).default("general"),
  categoryId: z.string().optional(),
  tags: z.string().optional(), // JSON array
});

export const updateKnowledgeSchema = createKnowledgeSchema.partial();

// ── Company Intel ───────────────────────────────────

export const createCompanySchema = z.object({
  company: z.string().min(1),
  processNotes: z.string().optional(),
  commonQuestions: z.string().optional(),
  salaryNotes: z.string().optional(),
  cultureNotes: z.string().optional(),
});

export const updateCompanySchema = createCompanySchema.partial();
