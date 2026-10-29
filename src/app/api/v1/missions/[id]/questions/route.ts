import { createClient } from "@/lib/supabase/server";
import { withErrorHandling } from "@/lib/api/handler";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id: missionId } = await params;
    const supabase = await createClient();

    // Verify mission exists and is published
    const { data: mission, error: missionError } = await supabase
      .from("missions")
      .select("id, status")
      .eq("id", missionId)
      .single();

    if (missionError || !mission) {
      return Response.json(
        { success: false, error: "Mission not found" },
        { status: 404 }
      );
    }

    if (mission.status !== "published") {
      return Response.json(
        { success: false, error: "Mission is not available" },
        { status: 403 }
      );
    }

    const { data: questions, error } = await supabase
      .from("mission_questions")
      .select("id, mission_id, question_type, prompt, options, explanation, sort_order")
      .eq("mission_id", missionId)
      .order("sort_order", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch questions: ${error.code}`);
    }

    // Strip correct answers — they must never reach the client.
    // Validation happens server-side on submission.
    return Response.json({ success: true, data: questions ?? [] });
  });
}
