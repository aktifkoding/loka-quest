import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service-role";
import { requireAuth } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/response";
import { durableRateLimit } from "@/lib/security/rate-limit-db";

const joinSchema = z.object({
  code: z.string().trim().min(4).max(12),
});

export async function POST(request: Request) {
  return withErrorHandling(async () => {
    const rl = await durableRateLimit(request, "group-join", 10, 60);
    if (!rl.ok) {
      return Response.json(
        { success: false, error: "Terlalu banyak percobaan. Coba lagi nanti." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    const user = await requireAuth();
    const input = await parseJsonBody(request, joinSchema);
    const service = createServiceClient();

    const { data: group } = await service
      .from("educator_groups")
      .select("id, name")
      .eq("join_code", input.code.toUpperCase())
      .maybeSingle();

    if (!group) {
      return Response.json(
        { success: false, error: "Kode kelas tidak ditemukan." },
        { status: 404 }
      );
    }

    const { error } = await service.from("educator_group_members").upsert(
      { group_id: group.id, profile_id: user.id },
      { onConflict: "group_id,profile_id", ignoreDuplicates: true }
    );

    if (error) throw new Error(`Failed to join group: ${error.code}`);

    return Response.json({ success: true, data: { group } });
  });
}
