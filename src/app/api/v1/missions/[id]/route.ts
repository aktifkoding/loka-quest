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

    // The URL segment may be a slug (batik-detective) or a UUID
    const isUuid = UUID_RE.test(missionId);

    const { data: mission, error } = await supabase
      .from("missions")
      .select("*")
      .eq(isUuid ? "id" : "slug", missionId)
      .eq("status", "published")
      .maybeSingle();

    if (error || !mission) {
      return Response.json(
        { success: false, error: "Mission not found" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: mission });
  });
}
