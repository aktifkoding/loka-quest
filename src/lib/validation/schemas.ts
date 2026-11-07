import { z } from "zod";

export const emailSchema = z.string().email("Invalid email address");
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z.string().min(2, "Full name is required"),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const missionAnswerSchema = z.object({
  questionId: z.string().uuid(),
  answer: z.record(z.unknown()),
});

export const attemptSubmitSchema = z.object({
  missionId: z.string().uuid(),
  answers: z.array(missionAnswerSchema).min(1).max(50),
});

const nullableInt = (schema: z.ZodTypeAny) =>
  z.preprocess(
    (value) => (value === null || value === "" ? undefined : value),
    schema
  );

export const paginationSchema = z.object({
  page: nullableInt(z.coerce.number().int().positive().default(1)),
  limit: nullableInt(z.coerce.number().int().positive().max(100).default(20)),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type MissionAnswerInput = z.infer<typeof missionAnswerSchema>;
export type AttemptSubmitInput = z.infer<typeof attemptSubmitSchema>;

export const encyclopediaArticleSchema = z.object({
  title: z.string().trim().min(3).max(180),
  slug: z.string().trim().min(3).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  summary: z.string().trim().min(20).max(500),
  body: z.string().trim().max(100000).default(""),
  categoryIds: z.array(z.string().uuid()).max(20).default([]),
  regionIds: z.array(z.string().uuid()).max(30).default([]),
  featuredImageUrl: z.string().url().nullable().optional(),
  featured: z.boolean().default(false),
  status: z.enum(["draft", "review", "approved", "published", "archived"]).default("draft"),
  background: z.string().max(20000).nullable().optional(),
  historicalContext: z.string().max(20000).nullable().optional(),
  culturalMeaning: z.string().max(20000).nullable().optional(),
  characteristics: z.string().max(20000).nullable().optional(),
  socialFunction: z.string().max(20000).nullable().optional(),
  practices: z.string().max(20000).nullable().optional(),
  preservation: z.string().max(20000).nullable().optional(),
  seoTitle: z.string().max(180).nullable().optional(),
  seoDescription: z.string().max(300).nullable().optional(),
});

export const encyclopediaBookmarkSchema = z.object({
  articleId: z.string().uuid(),
});

export type EncyclopediaArticleInput = z.infer<typeof encyclopediaArticleSchema>;

// --- Admin missions ---

const jsonRecord = z.record(z.unknown());

export const missionCreateSchema = z.object({
  region_id: z.string().uuid(),
  slug: z.string().trim().min(3).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().trim().min(3).max(180),
  description: z.string().trim().min(10).max(5000),
  learning_objectives: z
    .array(z.string().trim().min(1).max(300))
    .max(10)
    .default([]),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  xp_reward: z.coerce.number().int().min(0).max(10000).default(100),
  status: z.enum(["draft", "review", "published", "archived"]).default("draft"),
  sort_order: z.coerce.number().int().min(0).max(9999).default(0),
});

export const missionUpdateSchema = missionCreateSchema.partial();

export const missionQuestionSchema = z.object({
  question_type: z.enum(["multiple_choice", "sequencing", "matching", "identification"]),
  prompt: z.string().trim().min(3).max(2000),
  options: jsonRecord.default({}),
  correct_answer: jsonRecord,
  explanation: z.string().trim().max(4000).nullable().optional(),
  sort_order: z.coerce.number().int().min(0).max(999).default(0),
});

export const missionQuestionUpdateSchema = missionQuestionSchema.partial();

export type MissionCreateInput = z.infer<typeof missionCreateSchema>;
export type MissionUpdateInput = z.infer<typeof missionUpdateSchema>;
export type MissionQuestionInput = z.infer<typeof missionQuestionSchema>;
export type MissionQuestionUpdateInput = z.infer<typeof missionQuestionUpdateSchema>;
