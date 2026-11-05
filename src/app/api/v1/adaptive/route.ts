import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";
import {
  generateAdaptiveProfile,
  type AttemptSummary,
  type SpacedRepetitionItem,
} from "@/lib/adaptive";

export async function GET() {
  return withErrorHandling(async () => {
    let userId: string | null = null;
    try {
      const user = await requireAuth();
      userId = user.id;
    } catch {
      // Guest fallback: provide default beginner profile
      const defaultProfile = generateAdaptiveProfile([], [], 0);
      return Response.json({
        success: true,
        data: defaultProfile,
        isGuest: true,
      });
    }

    const supabase = await createClient();

    const [attemptsRes, reviewsRes, progressRes] = await Promise.all([
      supabase
        .from("mission_attempts")
        .select("score, xp_earned, completed, completed_at")
        .eq("profile_id", userId)
        .order("completed_at", { ascending: false, nullsFirst: false })
        .limit(10),
      supabase
        .from("review_items")
        .select("question_id, mission_id, interval_days, ease, lapses, due_at, last_reviewed_at")
        .eq("profile_id", userId),
      supabase
        .from("player_progress")
        .select("missions_completed")
        .eq("profile_id", userId)
        .maybeSingle(),
    ]);

    const attempts: AttemptSummary[] = (attemptsRes.data ?? []).map((a) => ({
      score: a.score,
      xp_earned: a.xp_earned,
      completed: a.completed,
      completed_at: a.completed_at,
    }));

    const reviewItems: SpacedRepetitionItem[] = (reviewsRes.data ?? []).map((r) => ({
      question_id: r.question_id,
      mission_id: r.mission_id,
      interval_days: r.interval_days,
      ease: Number(r.ease) || 2.5,
      lapses: r.lapses,
      due_at: r.due_at,
      last_reviewed_at: r.last_reviewed_at,
    }));

    const missionsCompleted = progressRes.data?.missions_completed ?? 0;

    const profile = generateAdaptiveProfile(attempts, reviewItems, missionsCompleted);

    return Response.json(
      { success: true, data: profile, isGuest: false },
      { headers: { "Cache-Control": "private, no-cache" } }
    );
  });
}
