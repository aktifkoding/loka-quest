import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service-role";
import { requireAuth } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/response";
import { getLangFromRequest } from "@/lib/i18n/server";
import { errorsDict as E } from "@/lib/i18n/dict/errors";

const controlSchema = z.object({
  action: z.enum(["start", "next", "finish"]),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  return withErrorHandling(async () => {
    const lang = getLangFromRequest(request);
    const user = await requireAuth();
    const { code } = await params;
    const input = await parseJsonBody(request, controlSchema);
    const service = createServiceClient();

    const { data: session } = await service
      .from("quiz_sessions")
      .select("id, host_id, status, current_index, mission_id")
      .eq("code", code.toUpperCase())
      .maybeSingle();

    if (!session || session.host_id !== user.id) {
      return Response.json(
        { success: false, error: E.hostOnly[lang] },
        { status: 403 }
      );
    }

    if (input.action === "start") {
      const { error } = await service
        .from("quiz_sessions")
        .update({ status: "active", current_index: 0, started_at: new Date().toISOString() })
        .eq("id", session.id);
      if (error) throw new Error(`Failed to start quiz: ${error.code}`);
      return Response.json({ success: true, data: { status: "active" } });
    }

    if (input.action === "finish") {
      const { error } = await service
        .from("quiz_sessions")
        .update({ status: "finished", finished_at: new Date().toISOString() })
        .eq("id", session.id);
      if (error) throw new Error(`Failed to finish quiz: ${error.code}`);
      return Response.json({ success: true, data: { status: "finished" } });
    }

    const { count } = await service
      .from("mission_questions")
      .select("id", { count: "exact", head: true })
      .eq("mission_id", session.mission_id);

    const nextIndex = session.current_index + 1;
    const finished = nextIndex >= (count ?? 0);

    const { error } = await service
      .from("quiz_sessions")
      .update({
        current_index: nextIndex,
        status: finished ? "finished" : "active",
        ...(finished ? { finished_at: new Date().toISOString() } : {}),
      })
      .eq("id", session.id);

    if (error) throw new Error(`Failed to advance quiz: ${error.code}`);

    return Response.json({
      success: true,
      data: { status: finished ? "finished" : "active", currentIndex: nextIndex },
    });
  });
}
