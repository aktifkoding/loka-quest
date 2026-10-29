import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/session";
import { attemptSubmitSchema } from "@/lib/validation";
import { isAnswerCorrect, calculateScore, calculateXp } from "@/lib/scoring";
import { withErrorHandling } from "@/lib/api/handler";

type SubmitBody = {
  missionId: string;
  answers: { questionId: string; answer: Record<string, unknown> }[];
};

export async function POST(request: Request) {
  return withErrorHandling(async () => {
    const user = await requireAuth();
    const supabase = await createClient();

    const body = (await request.json()) as SubmitBody;
    const parsed = attemptSubmitSchema.parse(body);

    // Load mission (must be published)
    const { data: mission, error: missionError } = await supabase
      .from("missions")
      .select("id, slug, title, xp_reward, status")
      .eq("id", parsed.missionId)
      .single();

    if (missionError || !mission || mission.status !== "published") {
      return Response.json(
        { success: false, error: "Mission not found or unavailable" },
        { status: 404 }
      );
    }

    // Load questions with correct answers (server-only)
    const { data: questions, error: questionsError } = await supabase
      .from("mission_questions")
      .select("id, correct_answer, explanation, options")
      .eq("mission_id", parsed.missionId);

    if (questionsError || !questions) {
      throw new Error("Failed to load mission questions");
    }

    const questionMap = new Map(questions.map((q) => [q.id, q]));

    // Score every submitted answer server-side; unknown question IDs are ignored
    const results = parsed.answers
      .filter((a) => questionMap.has(a.questionId))
      .map((a) => {
        const question = questionMap.get(a.questionId)!;
        const isCorrect = isAnswerCorrect(a.answer, question.correct_answer);
        return {
          questionId: a.questionId,
          isCorrect,
          explanation: question.explanation,
          submittedAnswer: a.answer,
        };
      });

    const correctCount = results.filter((r) => r.isCorrect).length;
    const totalQuestions = results.length;
    const score = calculateScore(correctCount, totalQuestions);
    const xpEarned = calculateXp(score, mission.xp_reward);

    // Persist attempt
    const { data: attempt, error: attemptError } = await supabase
      .from("mission_attempts")
      .insert({
        mission_id: mission.id,
        profile_id: user.id,
        score,
        xp_earned: xpEarned,
        completed: true,
        answers: parsed.answers,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (attemptError || !attempt) {
      throw new Error("Failed to save attempt");
    }

    // Persist individual answers
    const { error: answersError } = await supabase.from("mission_answers").insert(
      results.map((r) => ({
        attempt_id: attempt.id,
        question_id: r.questionId,
        answer: r.submittedAnswer,
        is_correct: r.isCorrect,
      }))
    );

    if (answersError) {
      // Roll back the attempt so we never keep an attempt without its answers
      await supabase.from("mission_attempts").delete().eq("id", attempt.id);
      throw new Error("Failed to save answers");
    }

    // Update aggregate progress (idempotent upsert)
    const { data: existingProgress } = await supabase
      .from("player_progress")
      .select("total_xp, missions_completed")
      .eq("profile_id", user.id)
      .single();

    const newTotalXp = (existingProgress?.total_xp ?? 0) + xpEarned;
    const newMissionsCompleted = (existingProgress?.missions_completed ?? 0) + 1;
    const newLevel = Math.floor(newTotalXp / 500) + 1;

    const { error: progressError } = await supabase
      .from("player_progress")
      .upsert({
        profile_id: user.id,
        total_xp: newTotalXp,
        missions_completed: newMissionsCompleted,
        current_level: newLevel,
        updated_at: new Date().toISOString(),
      });

    if (progressError) {
      console.error("[attempts] progress upsert failed:", progressError.code);
    }

    // Mirror XP/level onto the profile row
    await supabase
      .from("profiles")
      .update({ xp: newTotalXp, level: newLevel })
      .eq("id", user.id);

    return Response.json({
      success: true,
      data: {
        score,
        xpEarned,
        correctCount,
        totalQuestions,
        newTotalXp,
        newLevel,
        results: results.map((r) => ({
          questionId: r.questionId,
          isCorrect: r.isCorrect,
          explanation: r.explanation,
        })),
      },
    });
  });
}
