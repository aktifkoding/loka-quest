import { z } from "zod";
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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  return withErrorHandling(async () => {
    const lang = getLangFromRequest(request);
    const user = await requireAuth();
    const { code } = await params;
    const input = await parseJsonBody(request, answerSchema);
    const service = createServiceClient();

    const { data: session } = await service
      .from("quiz_sessions")
      .select("id, status, current_index, mission_id")
      .eq("code", code.toUpperCase())
      .maybeSingle();

    if (!session || session.status !== "active") {
      return Response.json(
        { success: false, error: E.quizNotRunning[lang] },
        { status: 409 }
      );
    }

    const { data: questions } = await service
      .from("mission_questions")
      .select("id, correct_answer, options, explanation")
      .eq("mission_id", session.mission_id)
      .order("sort_order", { ascending: true });

    const current = questions?.[session.current_index];
    if (!current || current.id !== input.questionId) {
      return Response.json(
        { success: false, error: E.notActiveQuestion[lang] },
        { status: 409 }
      );
    }

    const { data: participant } = await service
      .from("quiz_participants")
      .select("profile_id, score")
      .eq("session_id", session.id)
      .eq("profile_id", user.id)
      .maybeSingle();

    if (!participant) {
      return Response.json(
        { success: false, error: E.notJoined[lang] },
        { status: 403 }
      );
    }

    const { data: existing } = await service
      .from("quiz_answers")
      .select("is_correct")
      .eq("session_id", session.id)
      .eq("question_id", current.id)
      .eq("profile_id", user.id)
      .maybeSingle();

    if (existing) {
      return Response.json(
        { success: false, error: E.answerAlreadySent[lang] },
        { status: 409 }
      );
    }

    const correct = isAnswerCorrect(
      input.answer,
      current.correct_answer,
      current.options
    );

    const { error } = await service.from("quiz_answers").insert({
      session_id: session.id,
      question_id: current.id,
      profile_id: user.id,
      is_correct: correct,
    });

    if (error) throw new Error(`Failed to save quiz answer: ${error.code}`);

    let score = participant.score;
    if (correct) {
      score += 1;
      await service
        .from("quiz_participants")
        .update({ score })
        .eq("session_id", session.id)
        .eq("profile_id", user.id);
    }

    return Response.json({
      success: true,
      data: {
        isCorrect: correct,
        score,
        explanation: current.explanation,
      },
    });
  });
}
