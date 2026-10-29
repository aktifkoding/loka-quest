import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";
import { calculateScore } from "@/lib/scoring";
import { rateLimit, clientKey } from "@/lib/security/rate-limit";
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
    const supabase = await createClient();

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
    const rl = rateLimit(clientKey(request, "assessments"), 20, 60_000);
    if (!rl.ok) {
      return Response.json(
        { success: false, error: "Terlalu banyak pengiriman. Coba lagi nanti." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    const user = await requireAuth();
    const supabase = await createClient();
    const body = submitSchema.parse(await request.json());

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

    const results = body.answers.map((a) => {
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
    const score = calculateScore(correctCount, body.answers.length);

    const { error } = await supabase
      .from("assessment_responses")
      .insert({
        assessment_id: body.assessmentId,
        profile_id: user.id,
        answers: body.answers,
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
          totalQuestions: body.answers.length,
          results,
        },
      },
      { status: 201 }
    );
  });
}
