import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service-role";
import { requireAuth } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/response";
import { durableRateLimit } from "@/lib/security/rate-limit-db";
import { getLangFromRequest } from "@/lib/i18n/server";
import { errorsDict as E } from "@/lib/i18n/dict/errors";

const joinSchema = z.object({
  code: z.string().trim().min(4).max(12),
});

export async function POST(request: Request) {
  return withErrorHandling(async () => {
    const lang = getLangFromRequest(request);
    const rl = await durableRateLimit(request, "quiz-join", 20, 60);
    if (!rl.ok) {
      return Response.json(
        { success: false, error: E.rateLimitAttemptsShort[lang] },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    const user = await requireAuth();
    const input = await parseJsonBody(request, joinSchema);
    const service = createServiceClient();

    const { data: session } = await service
      .from("quiz_sessions")
      .select("id, code, status, host_id")
      .eq("code", input.code.toUpperCase())
      .maybeSingle();

    if (!session || session.status === "finished") {
      return Response.json(
        { success: false, error: E.quizSessionOver[lang] },
        { status: 404 }
      );
    }

    const { data: profile } = await service
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .maybeSingle();

    const { error } = await service.from("quiz_participants").upsert(
      {
        session_id: session.id,
        profile_id: user.id,
        display_name: profile?.full_name || profile?.email?.split("@")[0] || (lang === "en" ? "Player" : "Peserta"),
      },
      { onConflict: "session_id,profile_id", ignoreDuplicates: true }
    );

    if (error) throw new Error(`Failed to join quiz: ${error.code}`);

    return Response.json({
      success: true,
      data: { code: session.code, isHost: session.host_id === user.id },
    });
  });
}
