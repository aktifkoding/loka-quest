import { createServiceClient } from "@/lib/supabase/service-role";
import { requireAuth } from "@/lib/auth/session";
import { attemptSubmitSchema } from "@/lib/validation";
import { isAnswerCorrect, calculateScore, calculateXp } from "@/lib/scoring";
import { withErrorHandling } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/response";
import { durableRateLimit } from "@/lib/security/rate-limit-db";
import { getDailyMission } from "@/lib/daily";
import { getLangFromRequest } from "@/lib/i18n/server";
import { errorsDict as E } from "@/lib/i18n/dict/errors";

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
    const lang = getLangFromRequest(request);
    const rl = await durableRateLimit(request, "attempts", 30, 60);
    if (!rl.ok) {
      return Response.json(
        { success: false, error: E.rateLimitAttempts[lang] },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    const user = await requireAuth();
    const parsed = await parseJsonBody(request, attemptSubmitSchema);

    // Privileged client: answer keys and game state are server-owned after the
    // security-hardening migration. Ownership is enforced with user.id below.
    const service = createServiceClient();

    const { data: mission, error: missionError } = await service
      .from("missions")
      .select("id, slug, title, xp_reward, region_id, status")
      .eq("id", parsed.missionId)
      .eq("status", "published")
      .maybeSingle();

    if (missionError || !mission) {
      return Response.json(
        { success: false, error: "Mission not found or unavailable" },
        { status: 404 }
      );
    }

    const { data: questions, error: questionsError } = await service
      .from("mission_questions")
      .select("id, correct_answer, explanation, options")
      .eq("mission_id", mission.id);

    if (questionsError || !questions) {
      throw new Error("Failed to load mission questions");
    }

    const questionMap = new Map(questions.map((q) => [q.id, q]));

    // Score every submitted answer server-side; unknown and duplicate question
    // IDs are ignored. The denominator is the full mission, so submitting a
    // single correct answer cannot yield 100%.
    const seenQuestionIds = new Set<string>();
    const results = parsed.answers
      .filter((a) => {
        if (!questionMap.has(a.questionId) || seenQuestionIds.has(a.questionId)) {
          return false;
        }
        seenQuestionIds.add(a.questionId);
        return true;
      })
      .map((a) => {
        const question = questionMap.get(a.questionId)!;
        const isCorrect = isAnswerCorrect(
          a.answer,
          question.correct_answer,
          question.options
        );
        return {
          questionId: a.questionId,
          isCorrect,
          explanation: question.explanation,
          submittedAnswer: a.answer,
        };
      });

    const correctCount = results.filter((r) => r.isCorrect).length;
    const totalQuestions = questions.length;
    const score = calculateScore(correctCount, totalQuestions);

    /* ---------------- XP economy: reward improvement only ---------------- */

    const { data: bestRows } = await service
      .from("mission_attempts")
      .select("score")
      .eq("profile_id", user.id)
      .eq("mission_id", mission.id)
      .order("score", { ascending: false })
      .limit(1);

    const bestPrevious = bestRows?.[0]?.score ?? null;
    // A prior attempt with score 0 still counts as an attempt; use the row
    // count rather than a null score to detect the first completion.
    const isFirstCompletion = !bestRows || bestRows.length === 0;
    const improvement = isFirstCompletion
      ? score
      : Math.max(0, score - (bestPrevious ?? 0));
    const missionXp = calculateXp(improvement, mission.xp_reward);

    /* ---------------- Achievements ---------------- */

    const { data: progressBefore } = await service
      .from("player_progress")
      .select("missions_completed")
      .eq("profile_id", user.id)
      .maybeSingle();

    const missionsCompleted =
      (progressBefore?.missions_completed ?? 0) + (isFirstCompletion ? 1 : 0);

    const { data: catalog } = await service
      .from("achievements")
      .select("id, slug, title, description, icon, xp_bonus, criteria");

    const earned: AchievementRow[] = [];
    let bonusXp = 0;

    if (catalog && catalog.length > 0) {
      const eligible = evaluateAchievements(catalog as AchievementRow[], {
        missionSlug: mission.slug,
        score,
        completed: true,
        missionsCompleted,
      });

      if (eligible.length > 0) {
        const { data: inserted } = await service
          .from("user_achievements")
          .upsert(
            eligible.map((a) => ({ profile_id: user.id, achievement_id: a.id })),
            { onConflict: "profile_id,achievement_id", ignoreDuplicates: true }
          )
          .select("achievement_id");

        const insertedIds = new Set((inserted ?? []).map((r) => r.achievement_id));
        earned.push(...eligible.filter((a) => insertedIds.has(a.id)));
        bonusXp = earned.reduce((sum, a) => sum + (a.xp_bonus ?? 0), 0);
      }
    }

    /* ---------------- Daily challenge bonus (once per day) ---------------- */

    let dailyBonus = 0;
    let dailyCompleted = false;
    const daily = await getDailyMission(service);
    if (daily && daily.mission.id === mission.id) {
      const { data: alreadyDone } = await service
        .from("daily_challenge_completions")
        .select("profile_id")
        .eq("profile_id", user.id)
        .eq("challenge_date", daily.date)
        .maybeSingle();

      if (!alreadyDone) {
        const { error: dailyError } = await service
          .from("daily_challenge_completions")
          .insert({
            profile_id: user.id,
            challenge_date: daily.date,
            mission_id: mission.id,
            bonus_xp: daily.bonusXp,
          });
        if (!dailyError) {
          dailyBonus = daily.bonusXp;
          dailyCompleted = true;
        }
      } else {
        dailyCompleted = true;
      }
    }

    const xpEarned = missionXp + bonusXp + dailyBonus;

    /* ---------------- Persist attempt + answers ---------------- */

    const { data: attempt, error: attemptError } = await service
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

    if (results.length > 0) {
      const { error: answersError } = await service
        .from("mission_answers")
        .insert(
          results.map((r) => ({
            attempt_id: attempt.id,
            question_id: r.questionId,
            answer: r.submittedAnswer,
            is_correct: r.isCorrect,
          }))
        );

      if (answersError) {
        await service.from("mission_attempts").delete().eq("id", attempt.id);
        throw new Error("Failed to save answers");
      }
    }

    /* ---------------- Atomic progress update ---------------- */

    let newTotalXp = 0;
    let newLevel = 1;
    let newMissionsCompleted = missionsCompleted;

    const { data: applied, error: xpError } = await service.rpc("apply_xp", {
      p_profile_id: user.id,
      p_xp: xpEarned,
      p_first_completion: isFirstCompletion,
    });

    if (!xpError && applied?.[0]) {
      newTotalXp = applied[0].total_xp;
      newLevel = applied[0].current_level;
      newMissionsCompleted = applied[0].missions_completed;
    } else {
      // Fallback for an environment where the migration is not applied yet.
      console.error("[attempts] apply_xp failed:", xpError?.message);
      const { data: current } = await service
        .from("player_progress")
        .select("total_xp, missions_completed, current_level")
        .eq("profile_id", user.id)
        .maybeSingle();
      newTotalXp = (current?.total_xp ?? 0) + xpEarned;
      newMissionsCompleted = missionsCompleted;
      newLevel = Math.floor(newTotalXp / 500) + 1;
      await service.from("player_progress").upsert({
        profile_id: user.id,
        total_xp: newTotalXp,
        missions_completed: newMissionsCompleted,
        current_level: newLevel,
        updated_at: new Date().toISOString(),
      });
    }

    await service
      .from("profiles")
      .update({ xp: newTotalXp, level: newLevel })
      .eq("id", user.id);

    /* ---------------- Streak ---------------- */

    let streak: { current: number; longest: number } | null = null;
    const { data: streakRows } = await service.rpc("touch_streak", {
      p_profile_id: user.id,
    });
    if (streakRows?.[0]) {
      streak = {
        current: streakRows[0].current_streak,
        longest: streakRows[0].longest_streak,
      };
    }

    /* ---------------- Artifact awarding (first completion only) ---------- */

    let artifact: {
      id: string;
      name: string;
      description: string;
      rarity: string;
      image_url: string | null;
    } | null = null;

    if (isFirstCompletion) {
      const { data: regionArtifact } = await service
        .from("cultural_artifacts")
        .select("id, name, description, rarity, image_url")
        .eq("region_id", mission.region_id)
        .limit(1)
        .maybeSingle();

      if (regionArtifact) {
        const { data: owned } = await service
          .from("user_artifacts")
          .select("id")
          .eq("profile_id", user.id)
          .eq("artifact_id", regionArtifact.id)
          .maybeSingle();

        if (!owned) {
          const { error: artifactError } = await service
            .from("user_artifacts")
            .upsert(
              { profile_id: user.id, artifact_id: regionArtifact.id },
              {
                onConflict: "profile_id,artifact_id",
                ignoreDuplicates: true,
              }
            );
          if (!artifactError) artifact = regionArtifact;
        }
      }
    }

    /* ---------------- Spaced repetition ---------------- */

    const wrong = results.filter((r) => !r.isCorrect);
    if (wrong.length > 0) {
      await service.from("review_items").upsert(
        wrong.map((r) => ({
          profile_id: user.id,
          question_id: r.questionId,
          mission_id: mission.id,
          interval_days: 1,
          ease: 2.3,
          due_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        })),
        { onConflict: "profile_id,question_id", ignoreDuplicates: false }
      );
    }

    return Response.json({
      success: true,
      data: {
        score,
        xpEarned,
        missionXp,
        bonusXp,
        dailyBonus,
        dailyCompleted,
        correctCount,
        totalQuestions,
        newTotalXp,
        newLevel,
        newMissionsCompleted,
        isFirstCompletion,
        bestScore: Math.max(score, bestPrevious ?? 0),
        streak,
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
