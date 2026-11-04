import { createServiceClient } from "@/lib/supabase/service-role";
import { requireAuth } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  return withErrorHandling(async () => {
    const user = await requireAuth();
    const { code } = await params;
    const service = createServiceClient();

    const { data: session } = await service
      .from("quiz_sessions")
      .select(
        "id, code, status, current_index, host_id, mission_id, mission:missions (title, slug)"
      )
      .eq("code", code.toUpperCase())
      .maybeSingle();

    if (!session) {
      return Response.json(
        { success: false, error: "Sesi kuis tidak ditemukan." },
        { status: 404 }
      );
    }

    const { data: questions } = await service
      .from("mission_questions")
      .select("id, prompt, options, question_type, explanation, sort_order")
      .eq("mission_id", session.mission_id)
      .order("sort_order", { ascending: true });

    const { data: participants } = await service
      .from("quiz_participants")
      .select("profile_id, display_name, score")
      .eq("session_id", session.id)
      .order("score", { ascending: false })
      .limit(100);

    const isHost = session.host_id === user.id;
    const isParticipant = (participants ?? []).some(
      (participant) => participant.profile_id === user.id
    );

    if (!isHost && !isParticipant) {
      return Response.json(
        { success: false, error: "Anda belum bergabung ke sesi ini." },
        { status: 403 }
      );
    }

    const questionList = questions ?? [];
    const current =
      session.status === "active"
        ? questionList[session.current_index] ?? null
        : null;

    let myAnswer: { is_correct: boolean } | null = null;
    if (current) {
      const { data } = await service
        .from("quiz_answers")
        .select("is_correct")
        .eq("session_id", session.id)
        .eq("question_id", current.id)
        .eq("profile_id", user.id)
        .maybeSingle();
      myAnswer = data ?? null;
    }

    return Response.json(
      {
        success: true,
        data: {
          id: session.id,
          code: session.code,
          status: session.status,
          currentIndex: session.current_index,
          totalQuestions: questionList.length,
          isHost,
          mission: session.mission,
          currentQuestion: current
            ? {
                id: current.id,
                prompt: current.prompt,
                options: current.options,
                question_type: current.question_type,
              }
            : null,
          myAnswer,
          participants: participants ?? [],
          me: {
            profileId: user.id,
            score:
              participants?.find((p) => p.profile_id === user.id)?.score ?? 0,
          },
        },
      },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  });
}
