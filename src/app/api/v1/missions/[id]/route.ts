import { createClient } from "@/lib/supabase/server";
import { withErrorHandling } from "@/lib/api/handler";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id: missionId } = await params;
    const supabase = await createClient();
    const url = new URL(request.url);

    // Accept either UUID id or slug via ?slug=
    const slug = url.searchParams.get("slug");

    const { data: mission, error } = await supabase
      .from("missions")
      .select("*")
      .or(slug ? `slug.eq.${slug},id.eq.${missionId}` : `id.eq.${missionId}`)
      .eq("status", "published")
      .single();

    if (error || !mission) {
      return Response.json(
        { success: false, error: "Mission not found" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: mission });
  });
}
