import { createServiceClient } from "@/lib/supabase/service-role";
import { requireRole } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";
import { rateLimit, clientKey } from "@/lib/security/rate-limit";
import { auditLog } from "@/lib/audit";
import { z } from "zod";

const patchSchema = z.object({
  role: z.enum(["player", "educator", "admin"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  return withErrorHandling(async () => {
    const rl = rateLimit(clientKey(request, "admin-role"), 20, 60_000);
    if (!rl.ok) {
      return Response.json(
        { success: false, error: "Terlalu banyak permintaan." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    const admin = await requireRole(["admin"]);
    const { userId } = await params;
    const body = patchSchema.parse(await request.json());

    if (userId === admin.id) {
      return Response.json(
        { success: false, error: "Tidak bisa mengubah peran akun sendiri." },
        { status: 400 }
      );
    }

    // Role changes bypass RLS by design — privileged, audited operation.
    const service = createServiceClient();
    const { data: updated, error } = await service
      .from("profiles")
      .update({ role: body.role })
      .eq("id", userId)
      .select("id, email, role")
      .single();

    if (error || !updated) {
      return Response.json(
        { success: false, error: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    await auditLog({
      actorId: admin.id,
      action: "role_change",
      resourceType: "profile",
      resourceId: userId,
      details: { newRole: body.role },
      ipAddress:
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    });

    return Response.json({ success: true, data: updated });
  });
}
