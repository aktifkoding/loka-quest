import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";

export async function GET() {
  return withErrorHandling(async () => {
    const user = await requireAuth();
    const supabase = await createClient();

    const { data: assignments, error } = await supabase
      .from("educator_assignments")
      .select(
        "id, group_id, mission_id, due_at, group:educator_groups (name), mission:missions (id, slug, title, xp_reward, difficulty, status)"
      )
      .order("due_at", { ascending: true, nullsFirst: false });

    if (error) {
      throw new Error(`Failed to load assignments: ${error.code}`);
    }

    const missionIds = (assignments ?? [])
      .map((row) => row.mission_id)
      .filter(Boolean);

    const { data: attempts } = missionIds.length
      ? await supabase
          .from("mission_attempts")
          .select("mission_id, score, completed_at")
          .eq("profile_id", user.id)
          .in("mission_id", missionIds)
          .eq("completed", true)
          .order("completed_at", { ascending: false })
      : { data: [] };

    const best = new Map<string, { score: number; completed_at: string }>();
    for (const attempt of attempts ?? []) {
      const current = best.get(attempt.mission_id);
      if (!current || attempt.score > current.score) {
        best.set(attempt.mission_id, {
          score: attempt.score,
          completed_at: attempt.completed_at,
        });
      }
    }

    return Response.json({
      success: true,
      data: (assignments ?? []).map((row) => ({
        ...row,
        bestScore: best.get(row.mission_id)?.score ?? null,
        completedAt: best.get(row.mission_id)?.completed_at ?? null,
      })),
    });
  });
}
