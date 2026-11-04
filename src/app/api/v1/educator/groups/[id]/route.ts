import { createServiceClient } from "@/lib/supabase/service-role";
import { requireRole } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const user = await requireRole(["educator", "admin"]);
    const { id } = await params;
    const service = createServiceClient();

    const { data: group } = await service
      .from("educator_groups")
      .select("id, name, description, join_code, educator_id, created_at")
      .eq("id", id)
      .maybeSingle();

    if (!group) {
      return Response.json(
        { success: false, error: "Group not found" },
        { status: 404 }
      );
    }

    if (group.educator_id !== user.id && user.role !== "admin") {
      return Response.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { data: members } = await service
      .from("educator_group_members")
      .select("profile_id, joined_at, profiles:profile_id (full_name, email, level, xp)")
      .eq("group_id", id)
      .order("joined_at", { ascending: true });

    return Response.json({
      success: true,
      data: { ...group, members: members ?? [] },
    });
  });
}
