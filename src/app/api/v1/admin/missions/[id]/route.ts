import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service-role";
import { requireRole } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/response";
import { adminMissionSchema } from "@/lib/validation/admin";
import { auditLog } from "@/lib/audit";
import { getLangFromRequest } from "@/lib/i18n/server";
import { errorsDict as E } from "@/lib/i18n/dict/errors";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    await requireRole(["admin", "educator"]);
    const { id } = await params;
    const service = createServiceClient();

    const { data: mission, error } = await service
      .from("missions")
      .select("*, cultural_regions (id, name, slug)")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(`Failed to load mission: ${error.code}`);
    if (!mission) {
      return Response.json(
        { success: false, error: "Mission not found" },
        { status: 404 }
      );
    }

    const { data: questions } = await service
      .from("mission_questions")
      .select(
        "id, question_type, prompt, options, correct_answer, explanation, sort_order"
      )
      .eq("mission_id", id)
      .order("sort_order", { ascending: true });

    return Response.json({
      success: true,
      data: { ...mission, questions: questions ?? [] },
    });
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const lang = getLangFromRequest(request);
    const user = await requireRole(["admin", "educator"]);
    const { id } = await params;
    const input = await parseJsonBody(request, adminMissionSchema);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("missions")
      .update({
        region_id: input.regionId,
        slug: input.slug,
        title: input.title,
        description: input.description,
        difficulty: input.difficulty,
        xp_reward: input.xpReward,
        status: input.status,
        sort_order: input.sortOrder,
        learning_objectives: input.learningObjectives,
      })
      .eq("id", id)
      .select("id, slug, title, status")
      .maybeSingle();

    if (error) {
      if (error.code === "23505") {
        return Response.json(
          { success: false, error: E.missionSlugTaken[lang] },
          { status: 409 }
        );
      }
      throw new Error(`Failed to update mission: ${error.code}`);
    }
    if (!data) {
      return Response.json(
        { success: false, error: "Mission not found" },
        { status: 404 }
      );
    }

    await auditLog({
      actorId: user.id,
      action: "mission.updated",
      resourceType: "mission",
      resourceId: id,
      details: { status: data.status },
    });

    return Response.json({ success: true, data });
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const user = await requireRole(["admin", "educator"]);
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("missions")
      .update({ status: "archived" })
      .eq("id", id)
      .select("id, status")
      .maybeSingle();

    if (error) throw new Error(`Failed to archive mission: ${error.code}`);
    if (!data) {
      return Response.json(
        { success: false, error: "Mission not found" },
        { status: 404 }
      );
    }

    await auditLog({
      actorId: user.id,
      action: "mission.archived",
      resourceType: "mission",
      resourceId: id,
    });

    return Response.json({ success: true, data });
  });
}
