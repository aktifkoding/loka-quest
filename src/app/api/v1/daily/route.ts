import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service-role";
import { getSessionUser } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";
import { getDailyMission, jakartaDateKey } from "@/lib/daily";

export async function GET() {
  return withErrorHandling(async () => {
    const service = createServiceClient();
    const daily = await getDailyMission(service);

    if (!daily) {
      return Response.json({
        success: true,
        data: {
          date: jakartaDateKey(),
          mission: null,
          bonusXp: 0,
          completed: false,
          streak: null,
        },
      });
    }

    const user = await getSessionUser();
    if (!user) {
      return Response.json({
        success: true,
        data: { ...daily, completed: false, streak: null },
      });
    }

    const supabase = await createClient();
    const [{ data: completion }, { data: streak }] = await Promise.all([
      supabase
        .from("daily_challenge_completions")
        .select("challenge_date")
        .eq("profile_id", user.id)
        .eq("challenge_date", daily.date)
        .maybeSingle(),
      supabase
        .from("player_streaks")
        .select("current_streak, longest_streak, last_activity_date")
        .eq("profile_id", user.id)
        .maybeSingle(),
    ]);

    return Response.json({
      success: true,
      data: {
        ...daily,
        completed: Boolean(completion),
        streak: streak ?? {
          current_streak: 0,
          longest_streak: 0,
          last_activity_date: null,
        },
      },
    });
  });
}
