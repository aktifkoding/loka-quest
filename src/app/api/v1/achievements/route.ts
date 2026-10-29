import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";

export async function GET() {
  return withErrorHandling(async () => {
    const user = await requireAuth();
    const supabase = await createClient();

    const { data: userAchievements, error } = await supabase
      .from("user_achievements")
      .select(
        `
        achievement_id,
        earned_at,
        achievements (id, slug, title, description, icon, xp_bonus)
      `
      )
      .eq("profile_id", user.id);

    if (error) {
      throw new Error("Failed to load achievements");
    }

    const { data: allAchievements } = await supabase
      .from("achievements")
      .select("id, slug, title, description, icon, xp_bonus");

    return Response.json({
      success: true,
      data: {
        earned: userAchievements ?? [],
        all: allAchievements ?? [],
      },
    });
  });
}
