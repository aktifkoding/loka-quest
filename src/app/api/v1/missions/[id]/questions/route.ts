import { createClient } from "@/lib/supabase/server";
import { withErrorHandling } from "@/lib/api/handler";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id: missionId } = await params;
    const supabase = await createClient();

    // Resolve the URL segment (slug or UUID) to a mission id
    let missionRowId = missionId;
    if (!UUID_RE.test(missionId)) {
      const { data: bySlug } = await supabase
        .from("missions")
        .select("id, status")
        .eq("slug", missionId)
        .maybeSingle();

      if (!bySlug) {
        return Response.json(
          { success: false, error: "Mission not found" },
          { status: 404 }
        );
      }
      missionRowId = bySlug.id;
    }

    const { data: mission, error: missionError } = await supabase
      .from("missions")
      .select("id, status")
      .eq("id", missionRowId)
      .maybeSingle();

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
      .select(
        "id, mission_id, question_type, prompt, options, explanation, sort_order"
      )
      .eq("mission_id", missionRowId)
      .order("sort_order", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch questions: ${error.code}`);
    }

    // Strip correct answers — they must never reach the client.
    // Validation happens server-side on submission.
    return Response.json({ success: true, data: questions ?? [] });
  });
}
