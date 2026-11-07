import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/response";
import { adminRegionSchema } from "@/lib/validation/admin";
import { auditLog } from "@/lib/audit";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const user = await requireRole(["admin"]);
    const { id } = await params;
    const input = await parseJsonBody(request, adminRegionSchema);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("cultural_regions")
      .update({
        slug: input.slug,
        name: input.name,
        description: input.description,
        geographic_context: input.geographicContext ?? null,
        image_url: input.imageUrl ?? null,
        sort_order: input.sortOrder,
        status: input.status,
      })
      .eq("id", id)
      .select("id, slug, name, status")
      .maybeSingle();

    if (error) {
      if (error.code === "23505") {
        return Response.json(
          { success: false, error: "Slug wilayah sudah dipakai." },
          { status: 409 }
        );
      }
      throw new Error(`Failed to update region: ${error.code}`);
    }
    if (!data) {
      return Response.json(
        { success: false, error: "Region not found" },
        { status: 404 }
      );
    }

    await auditLog({
      actorId: user.id,
      action: "region.updated",
      resourceType: "cultural_region",
      resourceId: id,
      details: { status: data.status },
    });

    return Response.json({ success: true, data });
  });
}
