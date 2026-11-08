import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service-role";
import { requireRole } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/response";
import { getLangFromRequest } from "@/lib/i18n/server";
import { errorsDict as E } from "@/lib/i18n/dict/errors";

const createSchema = z.object({
  missionId: z.string().uuid(),
});

function makeCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function POST(request: Request) {
  return withErrorHandling(async () => {
    const lang = getLangFromRequest(request);
    const user = await requireRole(["educator", "admin"]);
    const input = await parseJsonBody(request, createSchema);
    const service = createServiceClient();

    const { data: mission } = await service
      .from("missions")
      .select("id, title, status")
      .eq("id", input.missionId)
      .eq("status", "published")
      .maybeSingle();

    if (!mission) {
      return Response.json(
        { success: false, error: E.missionNotAvailable[lang] },
        { status: 404 }
      );
    }

    let code = makeCode();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const { data: existing } = await service
        .from("quiz_sessions")
        .select("id")
        .eq("code", code)
        .maybeSingle();
      if (!existing) break;
      code = makeCode();
    }

    const { data, error } = await service
      .from("quiz_sessions")
      .insert({
        host_id: user.id,
        mission_id: mission.id,
        code,
        status: "lobby",
      })
      .select("id, code, status")
      .single();

    if (error) throw new Error(`Failed to create quiz: ${error.code}`);

    return Response.json(
      { success: true, data: { ...data, missionTitle: mission.title } },
      { status: 201 }
    );
  });
}
