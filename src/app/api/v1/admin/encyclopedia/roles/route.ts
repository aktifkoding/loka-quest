import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service-role";
import { requireRole } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/response";
import { auditLog } from "@/lib/audit";

const roleSchema = z.object({
  email: z.string().trim().email(),
  editorRole: z.enum([
    "content_administrator",
    "cultural_editor",
    "reviewer",
    "contributor",
  ]),
});

export async function GET() {
  return withErrorHandling(async () => {
    await requireRole(["admin"]);
    const service = createServiceClient();

    const { data, error } = await service
      .from("encyclopedia_editor_roles")
      .select(
        "profile_id, editor_role, created_at, profiles:profile_id (email, full_name)"
      )
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to load editor roles: ${error.code}`);

    return Response.json(
      { success: true, data: data ?? [] },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  });
}

export async function POST(request: Request) {
  return withErrorHandling(async () => {
    const admin = await requireRole(["admin"]);
    const input = await parseJsonBody(request, roleSchema);
    const service = createServiceClient();

    const { data: profile } = await service
      .from("profiles")
      .select("id, email, role")
      .eq("email", input.email)
      .maybeSingle();

    if (!profile) {
      return Response.json(
        { success: false, error: "Pengguna dengan email tersebut tidak ditemukan." },
        { status: 404 }
      );
    }

    const { data, error } = await service
      .from("encyclopedia_editor_roles")
      .upsert(
        {
          profile_id: profile.id,
          editor_role: input.editorRole,
          created_by: admin.id,
        },
        { onConflict: "profile_id" }
      )
      .select("profile_id, editor_role")
      .single();

    if (error) throw new Error(`Failed to assign editor role: ${error.code}`);

    await auditLog({
      actorId: admin.id,
      action: "encyclopedia.editor_role.assigned",
      resourceType: "profile",
      resourceId: profile.id,
      details: { editorRole: input.editorRole },
    });

    return Response.json({ success: true, data }, { status: 201 });
  });
}
