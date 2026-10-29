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
