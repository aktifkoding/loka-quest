import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/response";
import { adminContentSchema } from "@/lib/validation/admin";
import { auditLog } from "@/lib/audit";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const user = await requireRole(["admin", "educator"]);
    const { id } = await params;
    const input = await parseJsonBody(request, adminContentSchema);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("cultural_contents")
      .update({
        region_id: input.regionId,
        title: input.title,
        description: input.description,
        content_type: input.contentType,
        body: input.body ?? null,
        media_url: input.mediaUrl ?? null,
        media_type: input.mediaType ?? null,
        source_id: input.sourceId ?? null,
        sort_order: input.sortOrder,
        status: input.status,
      })
      .eq("id", id)
      .select("id, title, status")
      .maybeSingle();

    if (error) throw new Error(`Failed to update content: ${error.code}`);
    if (!data) {
      return Response.json(
        { success: false, error: "Content not found" },
        { status: 404 }
      );
    }

    await auditLog({
      actorId: user.id,
      action: "cultural_content.updated",
      resourceType: "cultural_content",
      resourceId: id,
      details: { status: data.status },
    });

    return Response.json({ success: true, data });
  });
}
