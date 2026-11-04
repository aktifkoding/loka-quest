import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service-role";
import { requireRole } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/response";

const assignmentSchema = z.object({
  missionId: z.string().uuid(),
  dueAt: z.string().datetime().optional().nullable(),
});

async function assertOwnership(groupId: string, educatorId: string) {
  const service = createServiceClient();
  const { data } = await service
    .from("educator_groups")
    .select("id")
    .eq("id", groupId)
    .eq("educator_id", educatorId)
    .maybeSingle();
  return Boolean(data);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const user = await requireRole(["educator", "admin"]);
    const { id } = await params;
    if (!(await assertOwnership(id, user.id)) && user.role !== "admin") {
      return Response.json(
        { success: false, error: "Group not found" },
        { status: 404 }
      );
    }

    const service = createServiceClient();
    const { data, error } = await service
      .from("educator_assignments")
      .select(
        "id, due_at, created_at, mission:missions (id, slug, title, xp_reward, difficulty)"
      )
      .eq("group_id", id)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to load assignments: ${error.code}`);
    return Response.json({ success: true, data: data ?? [] });
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const user = await requireRole(["educator", "admin"]);
    const { id } = await params;
    if (!(await assertOwnership(id, user.id)) && user.role !== "admin") {
      return Response.json(
        { success: false, error: "Group not found" },
        { status: 404 }
      );
    }

    const input = await parseJsonBody(request, assignmentSchema);
    const service = createServiceClient();

    const { data, error } = await service
      .from("educator_assignments")
      .upsert(
        {
          group_id: id,
          mission_id: input.missionId,
          due_at: input.dueAt ?? null,
          created_by: user.id,
        },
        { onConflict: "group_id,mission_id" }
      )
      .select("id, due_at, mission_id")
      .single();

    if (error) throw new Error(`Failed to create assignment: ${error.code}`);
    return Response.json({ success: true, data }, { status: 201 });
  });
}
