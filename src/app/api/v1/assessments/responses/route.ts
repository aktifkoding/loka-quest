import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";

/** Own assessment responses (score history) for the signed-in player. */
export async function GET() {
  return withErrorHandling(async () => {
    const user = await requireAuth();
    const supabase = await createClient();

    const { data: responses, error } = await supabase
      .from("assessment_responses")
      .select("assessment_id, score, submitted_at")
      .eq("profile_id", user.id)
      .order("submitted_at", { ascending: false });

    if (error) {
      throw new Error("Failed to load assessment responses");
    }

    return Response.json({ success: true, data: responses ?? [] });
  });
}
