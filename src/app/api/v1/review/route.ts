import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service-role";
import { requireAuth } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/response";
import { isAnswerCorrect } from "@/lib/scoring";
import { getLangFromRequest } from "@/lib/i18n/server";
import { errorsDict as E } from "@/lib/i18n/dict/errors";

const answerSchema = z.object({
  questionId: z.string().uuid(),
  answer: z.record(z.unknown()),
});

export async function GET() {
  return withErrorHandling(async () => {
    const user = await requireAuth();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("review_items")
      .select(
        "question_id, mission_id, due_at, interval_days, ease, lapses, mission:missions (slug, title), question:mission_questions (prompt, options, question_type)"
      )
      .eq("profile_id", user.id)
      .lte("due_at", new Date().toISOString())
      .order("due_at", { ascending: true })
      .limit(20);

    if (error) {
      throw new Error(`Failed to load review queue: ${error.code}`);
    }

    return Response.json(
      { success: true, data: data ?? [] },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  });
}

export async function POST(request: Request) {
  return withErrorHandling(async () => {
    const lang = getLangFromRequest(request);
    const user = await requireAuth();
    const input = await parseJsonBody(request, answerSchema);
    const service = createServiceClient();

    const { data: review } = await service
      .from("review_items")
      .select("question_id, mission_id, interval_days, ease, lapses")
      .eq("profile_id", user.id)
      .eq("question_id", input.questionId)
      .maybeSingle();

    if (!review) {
      return Response.json(
        { success: false, error: E.questionNotInReview[lang] },
        { status: 404 }
      );
    }

    const { data: question } = await service
      .from("mission_questions")
      .select("correct_answer, explanation, options")
      .eq("id", input.questionId)
      .maybeSingle();

    if (!question) {
      return Response.json(
        { success: false, error: E.questionNotFound[lang] },
        { status: 404 }
      );
    }

    const isCorrect = isAnswerCorrect(
      input.answer,
      question.correct_answer,
      question.options
    );

    const previousInterval = Math.max(review.interval_days, 1);
    const previousEase = Number(review.ease) || 2.5;
    const nextEase = isCorrect
      ? Math.min(3, previousEase + 0.1)
      : Math.max(1.3, previousEase - 0.2);
    const nextInterval = isCorrect
      ? Math.min(60, Math.round(previousInterval * nextEase))
      : 1;

    const dueAt = new Date(
      Date.now() + nextInterval * 24 * 60 * 60 * 1000
    ).toISOString();

    await service
      .from("review_items")
      .update({
        interval_days: nextInterval,
        ease: nextEase,
        lapses: review.lapses + (isCorrect ? 0 : 1),
        due_at: dueAt,
        last_reviewed_at: new Date().toISOString(),
      })
      .eq("profile_id", user.id)
      .eq("question_id", input.questionId);

    return Response.json(
      {
        success: true,
        data: {
          isCorrect,
          explanation: question.explanation,
          nextIntervalDays: nextInterval,
          dueAt,
        },
      },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  });
}
