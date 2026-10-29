import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";

export async function GET() {
  return withErrorHandling(async () => {
    const user = await requireAuth();
    const supabase = await createClient();

    const { data: progress, error } = await supabase
      .from("player_progress")
      .select("total_xp, missions_completed, current_level, updated_at")
      .eq("profile_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error("Failed to load progress");
    }

    return Response.json({
      success: true,
      data: progress ?? {
        total_xp: 0,
        missions_completed: 0,
        current_level: 1,
      },
    });
  });
}
