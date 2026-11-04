import { createServiceClient } from "@/lib/supabase/service-role";
import { requireAuth } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/response";
import { calculateScore } from "@/lib/scoring";
import { durableRateLimit } from "@/lib/security/rate-limit-db";
import { z } from "zod";

const submitSchema = z.object({
  assessmentId: z.string().uuid(),
  answers: z
    .array(
      z.object({
        questionId: z.string(),
        selected: z.string().max(500),
      })
    )
    .min(1)
    .max(100),
});

type AssessmentQuestion = {
  id: string;
  prompt: string;
  choices: string[];
  correct: string;
  explanation?: string;
};

function stripAnswers(questions: unknown): AssessmentQuestion[] {
  return ((questions as AssessmentQuestion[]) ?? []).map((q) => ({
    id: q.id,
    prompt: q.prompt,
    choices: q.choices ?? [],
    correct: "", // never leave the server before submission
  }));
}

export async function GET() {
  return withErrorHandling(async () => {
    // The `questions` column holds the answer key, so it is not readable by
    // anon/authenticated after the security-hardening migration.
    const supabase = createServiceClient();

    const { data: assessments, error } = await supabase
      .from("learning_assessments")
      .select("id, title, description, assessment_type, questions")
      .order("assessment_type", { ascending: true });

    if (error) {
      throw new Error("Failed to load assessments");
    }

    return Response.json({
      success: true,
      data: (assessments ?? []).map((a) => ({
        ...a,
        questions: stripAnswers(a.questions),
      })),
    });
  });
}

export async function POST(request: Request) {
  return withErrorHandling(async () => {
    const rl = await durableRateLimit(request, "assessments", 20, 60);
    if (!rl.ok) {
      return Response.json(
        { success: false, error: "Terlalu banyak pengiriman. Coba lagi nanti." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    const user = await requireAuth();
    const supabase = createServiceClient();
    const body = await parseJsonBody(request, submitSchema);

    // Load the assessment to score server-side — never trust client scores
    const { data: assessment, error: assessmentError } = await supabase
      .from("learning_assessments")
      .select("id, questions")
      .eq("id", body.assessmentId)
      .single();

    if (assessmentError || !assessment) {
      return Response.json(
        { success: false, error: "Assessment not found" },
        { status: 404 }
      );
    }

    const questions = ((assessment.questions as AssessmentQuestion[]) ?? []) ?? [];
    const questionMap = new Map(questions.map((q) => [q.id, q]));

    const seen = new Set<string>();
    const submitted = body.answers.filter((a) => {
      if (seen.has(a.questionId)) return false;
      seen.add(a.questionId);
      return true;
    });

    const results = submitted.map((a) => {
      const question = questionMap.get(a.questionId);
      const isCorrect = question
        ? a.selected.trim().toLowerCase() === question.correct.trim().toLowerCase()
        : false;
      return {
        questionId: a.questionId,
        prompt: question?.prompt ?? "",
        selected: a.selected,
        isCorrect,
        correctAnswer: question?.correct ?? "",
        explanation: question?.explanation ?? null,
      };
    });

    const correctCount = results.filter((r) => r.isCorrect).length;
    const score = calculateScore(correctCount, questions.length);

    const { error } = await supabase
      .from("assessment_responses")
      .insert({
        assessment_id: body.assessmentId,
        profile_id: user.id,
        answers: submitted,
        score,
      });

    if (error) {
      throw new Error("Failed to save assessment response");
    }

    return Response.json(
      {
        success: true,
        data: {
          score,
          correctCount,
          totalQuestions: questions.length,
          results,
        },
      },
      { status: 201 }
    );
  });
}
