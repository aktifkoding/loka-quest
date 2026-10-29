import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/session";
import { attemptSubmitSchema } from "@/lib/validation";
import { isAnswerCorrect, calculateScore, calculateXp } from "@/lib/scoring";
import { withErrorHandling } from "@/lib/api/handler";
import { rateLimit, clientKey } from "@/lib/security/rate-limit";

type SubmitBody = {
  missionId: string;
  answers: { questionId: string; answer: Record<string, unknown> }[];
};

type AchievementRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  xp_bonus: number;
  criteria: {
    type?: string;
    count?: number;
    mission_slug?: string;
  };
};

/** Evaluate achievement criteria against this attempt's outcome. */
function evaluateAchievements(
  achievements: AchievementRow[],
  ctx: {
    missionSlug: string;
    score: number;
    completed: boolean;
    missionsCompleted: number;
  }
): AchievementRow[] {
  return achievements.filter((a) => {
    const c = a.criteria ?? {};
    switch (c.type) {
      case "mission_complete":
        if (!ctx.completed) return false;
        if (c.mission_slug && c.mission_slug !== ctx.missionSlug) return false;
        if (c.count && ctx.missionsCompleted < c.count) return false;
        return true;
      case "mission_perfect":
        return (
          ctx.completed &&
          c.mission_slug === ctx.missionSlug &&
          ctx.score === 100
        );
      case "mission_complete_total":
        return ctx.completed && ctx.missionsCompleted >= (c.count ?? Infinity);
      default:
        return false;
    }
  });
}

export async function POST(request: Request) {
  return withErrorHandling(async () => {
    const rl = rateLimit(clientKey(request, "attempts"), 30, 60_000);
    if (!rl.ok) {
      return Response.json(
        { success: false, error: "Terlalu banyak percobaan. Coba lagi nanti." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    const user = await requireAuth();
    const supabase = await createClient();

    const body = (await request.json()) as SubmitBody;
    const parsed = attemptSubmitSchema.parse(body);

    // Load mission (must be published)
    const { data: mission, error: missionError } = await supabase
      .from("missions")
      .select("id, slug, title, xp_reward, region_id, status")
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
      .eq("mission_id", mission.id);

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

    // Persist individual answers (rollback attempt on failure)
    const { error: answersError } = await supabase.from("mission_answers").insert(
      results.map((r) => ({
        attempt_id: attempt.id,
        question_id: r.questionId,
        answer: r.submittedAnswer,
        is_correct: r.isCorrect,
      }))
    );

    if (answersError) {
      await supabase.from("mission_attempts").delete().eq("id", attempt.id);
      throw new Error("Failed to save answers");
    }

    // Aggregate progress (idempotent upsert)
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

    /* ---------------- Achievement processing ---------------- */

    const { data: catalog } = await supabase
      .from("achievements")
      .select("id, slug, title, description, icon, xp_bonus, criteria");

    const earned: AchievementRow[] = [];
    if (catalog && catalog.length > 0) {
      const eligible = evaluateAchievements(catalog as AchievementRow[], {
        missionSlug: mission.slug,
        score,
        completed: true,
        missionsCompleted: newMissionsCompleted,
      });

      if (eligible.length > 0) {
        const { data: inserted } = await supabase
          .from("user_achievements")
          .upsert(
            eligible.map((a) => ({ profile_id: user.id, achievement_id: a.id })),
            { onConflict: "profile_id,achievement_id", ignoreDuplicates: true }
          )
          .select("achievement_id");

        const insertedIds = new Set((inserted ?? []).map((r) => r.achievement_id));
        earned.push(...eligible.filter((a) => insertedIds.has(a.id)));
      }
    }

    /* ---------------- Artifact awarding ---------------- */

    // First completion of a mission in a region grants that region's artifact
    let artifact: { id: string; name: string; description: string; rarity: string; image_url: string | null } | null = null;
    const { data: regionArtifact } = await supabase
      .from("cultural_artifacts")
      .select("id, name, description, rarity, image_url")
      .eq("region_id", mission.region_id)
      .limit(1)
      .maybeSingle();

    if (regionArtifact) {
      const { data: owned } = await supabase
        .from("user_artifacts")
        .select("id")
        .eq("profile_id", user.id)
        .eq("artifact_id", regionArtifact.id)
        .maybeSingle();

      if (!owned) {
        const { error: artifactError } = await supabase
          .from("user_artifacts")
          .upsert(
            { profile_id: user.id, artifact_id: regionArtifact.id },
            { onConflict: "profile_id,artifact_id", ignoreDuplicates: true }
          );
        if (!artifactError) artifact = regionArtifact;
      }
    }

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
        earnedAchievements: earned.map((a) => ({
          slug: a.slug,
          title: a.title,
          description: a.description,
          icon: a.icon,
          xpBonus: a.xp_bonus,
        })),
        earnedArtifact: artifact
          ? {
              name: artifact.name,
              description: artifact.description,
              rarity: artifact.rarity,
              imageUrl: artifact.image_url,
            }
          : null,
      },
    });
  });
}
