import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";
import { missionUpdateSchema } from "@/lib/validation";
import { auditLog } from "@/lib/audit";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return withErrorHandling(async () => {
    const user = await requireRole(["admin"]);
    const parsed = missionUpdateSchema.parse(await request.json());
    const supabase = await createClient();

    const allowed = { ...parsed, updated_at: new Date().toISOString() };
    if (Object.keys(parsed).length === 0) {
      return Response.json(
        { success: false, error: "Tidak ada field yang bisa diperbarui" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("missions")
      .update(allowed)
      .eq("id", id)
      .select("id,slug,title,status")
      .single();

    if (error) {
      throw new Error("Failed to update mission");
    }

    await auditLog({
      actorId: user.id,
      action: "mission.updated",
      resourceType: "mission",
      resourceId: id,
      details: { fields: Object.keys(parsed) },
    });

    return Response.json({ success: true, data });
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return withErrorHandling(async () => {
    const user = await requireRole(["admin"]);
    const supabase = await createClient();

    const { count } = await supabase
      .from("mission_attempts")
      .select("*", { count: "exact", head: true })
      .eq("mission_id", id);

    if ((count ?? 0) > 0) {
      return Response.json(
        { success: false, error: "Misi sudah pernah dikerjakan pemain. Arsipkan saja alih-alih menghapus." },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from("missions")
      .delete()
      .eq("id", id)
      .select("id,slug,title")
      .single();

    if (error) {
      throw new Error("Failed to delete mission");
    }

    await auditLog({
      actorId: user.id,
      action: "mission.deleted",
      resourceType: "mission",
      resourceId: id,
      details: { slug: data.slug },
    });

    return Response.json({ success: true, data });
  });
}
