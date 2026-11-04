import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/response";
import { adminContentSchema } from "@/lib/validation/admin";
import { auditLog } from "@/lib/audit";

export async function POST(request: Request) {
  return withErrorHandling(async () => {
    const user = await requireRole(["admin", "educator"]);
    const input = await parseJsonBody(request, adminContentSchema);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("cultural_contents")
      .insert({
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
      .select("id, title, status")
      .single();

    if (error) throw new Error(`Failed to create content: ${error.code}`);

    await auditLog({
      actorId: user.id,
      action: "cultural_content.created",
      resourceType: "cultural_content",
      resourceId: data.id,
      details: { status: data.status },
    });

    return Response.json({ success: true, data }, { status: 201 });
  });
}
