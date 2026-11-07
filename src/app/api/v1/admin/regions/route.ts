import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/response";
import { adminRegionSchema } from "@/lib/validation/admin";
import { auditLog } from "@/lib/audit";

export async function GET() {
  return withErrorHandling(async () => {
    await requireRole(["admin"]);
    const supabase = await createClient();

    const { data: regions, error } = await supabase
      .from("cultural_regions")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      throw new Error("Failed to load regions");
    }

    return Response.json({ success: true, data: regions ?? [] });
  });
}

export async function POST(request: Request) {
  return withErrorHandling(async () => {
    const user = await requireRole(["admin"]);
    const input = await parseJsonBody(request, adminRegionSchema);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("cultural_regions")
      .insert({
        slug: input.slug,
        name: input.name,
        description: input.description,
        geographic_context: input.geographicContext ?? null,
        image_url: input.imageUrl ?? null,
        sort_order: input.sortOrder,
        status: input.status,
      })
      .select("id, slug, name, status")
      .single();

    if (error) {
      if (error.code === "23505") {
        return Response.json(
          { success: false, error: "Slug wilayah sudah dipakai." },
          { status: 409 }
        );
      }
      throw new Error(`Failed to create region: ${error.code}`);
    }

    await auditLog({
      actorId: user.id,
      action: "region.created",
      resourceType: "cultural_region",
      resourceId: data.id,
      details: { slug: data.slug, status: data.status },
    });

    return Response.json({ success: true, data }, { status: 201 });
  });
}
