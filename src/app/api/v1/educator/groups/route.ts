import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service-role";
import { requireRole } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/response";
import { auditLog } from "@/lib/audit";

const groupSchema = z.object({
  name: z.string().trim().min(3).max(120),
  description: z.string().trim().max(1000).optional().nullable(),
});

function makeCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function GET() {
  return withErrorHandling(async () => {
    const user = await requireRole(["educator", "admin"]);
    const supabase = await createClient();

    const { data: groups, error } = await supabase
      .from("educator_groups")
      .select("id, name, description, join_code, created_at")
      .eq("educator_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to load groups: ${error.code}`);

    const ids = (groups ?? []).map((group) => group.id);
    const { data: members } = ids.length
      ? await supabase
          .from("educator_group_members")
          .select("group_id")
          .in("group_id", ids)
      : { data: [] };

    const counts = new Map<string, number>();
    for (const member of members ?? []) {
      counts.set(member.group_id, (counts.get(member.group_id) ?? 0) + 1);
    }

    return Response.json({
      success: true,
      data: (groups ?? []).map((group) => ({
        ...group,
        memberCount: counts.get(group.id) ?? 0,
      })),
    });
  });
}

export async function POST(request: Request) {
  return withErrorHandling(async () => {
    const user = await requireRole(["educator", "admin"]);
    const input = await parseJsonBody(request, groupSchema);
    const service = createServiceClient();

    let code = makeCode();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const { data: existing } = await service
        .from("educator_groups")
        .select("id")
        .eq("join_code", code)
        .maybeSingle();
      if (!existing) break;
      code = makeCode();
    }

    const { data, error } = await service
      .from("educator_groups")
      .insert({
        name: input.name,
        description: input.description ?? null,
        educator_id: user.id,
        join_code: code,
      })
      .select("id, name, join_code, created_at")
      .single();

    if (error) throw new Error(`Failed to create group: ${error.code}`);

    await auditLog({
      actorId: user.id,
      action: "educator.group.created",
      resourceType: "educator_group",
      resourceId: data.id,
    });

    return Response.json({ success: true, data }, { status: 201 });
  });
}
