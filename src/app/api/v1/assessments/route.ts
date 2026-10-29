import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";
import { calculateScore } from "@/lib/scoring";
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

export async function GET() {
  return withErrorHandling(async () => {
    const supabase = await createClient();

    const { data: assessments, error } = await supabase
      .from("learning_assessments")
      .select("id, title, description, assessment_type, questions")
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error("Failed to load assessments");
    }

    return Response.json({ success: true, data: assessments ?? [] });
  });
}

export async function POST(request: Request) {
  return withErrorHandling(async () => {
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

    const questions = (assessment.questions as {
      id: string;
      correct: string;
    }[]) ?? [];

    const questionMap = new Map(questions.map((q) => [q.id, q]));

    const correctCount = body.answers.filter((a) => {
      const question = questionMap.get(a.questionId);
      if (!question) return false;
      return (
        a.selected.trim().toLowerCase() ===
        question.correct.trim().toLowerCase()
      );
    }).length;

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
        },
      },
      { status: 201 }
    );
  });
}
