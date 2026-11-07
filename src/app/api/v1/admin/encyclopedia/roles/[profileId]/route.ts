import { createServiceClient } from "@/lib/supabase/service-role";
import { requireRole } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";
import { auditLog } from "@/lib/audit";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ profileId: string }> }
) {
  return withErrorHandling(async () => {
    const admin = await requireRole(["admin"]);
    const { profileId } = await params;
    const service = createServiceClient();

    const { error } = await service
      .from("encyclopedia_editor_roles")
      .delete()
      .eq("profile_id", profileId);

    if (error) throw new Error(`Failed to remove editor role: ${error.code}`);

    await auditLog({
      actorId: admin.id,
      action: "encyclopedia.editor_role.removed",
      resourceType: "profile",
      resourceId: profileId,
    });

    return Response.json({ success: true, data: { removed: true } });
  });
}
