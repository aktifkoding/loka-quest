import { z } from "zod";

const slug = z
  .string()
  .trim()
  .min(3)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Gunakan huruf kecil, angka, dan tanda hubung");

export const adminMissionSchema = z.object({
  slug,
  title: z.string().trim().min(3).max(180),
  description: z.string().trim().min(10).max(4000),
  regionId: z.string().uuid(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  xpReward: z.coerce.number().int().min(10).max(1000).default(100),
  status: z.enum(["draft", "review", "published", "archived"]).default("draft"),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  learningObjectives: z.array(z.string().trim().min(3).max(240)).max(10).default([]),
});

export const adminQuestionSchema = z.object({
  questionType: z.enum([
    "multiple_choice",
    "sequencing",
    "matching",
    "identification",
  ]),
  prompt: z.string().trim().min(5).max(2000),
  options: z.record(z.unknown()).default({}),
  correctAnswer: z.record(z.unknown()),
  explanation: z.string().trim().max(3000).optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export const adminRegionSchema = z.object({
  slug,
  name: z.string().trim().min(3).max(120),
  description: z.string().trim().min(20).max(4000),
  geographicContext: z.string().trim().max(4000).optional().nullable(),
  imageUrl: z.string().url().max(1000).optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  status: z.enum(["draft", "review", "published", "archived"]).default("draft"),
});

export const adminContentSchema = z.object({
  regionId: z.string().uuid(),
  title: z.string().trim().min(3).max(180),
  description: z.string().trim().min(10).max(4000),
  contentType: z.enum(["tradition", "artifact", "practice", "story"]),
  body: z.string().trim().max(50000).optional().nullable(),
  mediaUrl: z.string().url().max(1000).optional().nullable(),
  mediaType: z.string().trim().max(40).optional().nullable(),
  sourceId: z.string().uuid().optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  status: z.enum(["draft", "review", "published", "archived"]).default("draft"),
}).refine((value) => value.status !== "published" || Boolean(value.sourceId), {
  message: "Konten yang diterbitkan wajib memiliki sumber.",
  path: ["sourceId"],
});

export type AdminContentInput = z.infer<typeof adminContentSchema>;
export type AdminMissionInput = z.infer<typeof adminMissionSchema>;
export type AdminQuestionInput = z.infer<typeof adminQuestionSchema>;
export type AdminRegionInput = z.infer<typeof adminRegionSchema>;
