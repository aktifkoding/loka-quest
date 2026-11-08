import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/response";
import { adminMissionSchema } from "@/lib/validation/admin";
import { auditLog } from "@/lib/audit";
import { paginationSchema } from "@/lib/validation";
import { getLangFromRequest } from "@/lib/i18n/server";
import { errorsDict as E } from "@/lib/i18n/dict/errors";

export async function GET(request: Request) {
  return withErrorHandling(async () => {
    await requireRole(["admin", "educator"]);
    const supabase = await createClient();
    const url = new URL(request.url);
    const { page, limit } = paginationSchema.parse({
      page: url.searchParams.get("page"),
      limit: url.searchParams.get("limit"),
    });
    const from = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from("missions")
      .select(
        "id, slug, title, description, difficulty, xp_reward, status, sort_order, updated_at, cultural_regions (id, name, slug)",
        { count: "exact" }
      )
      .order("updated_at", { ascending: false })
      .range(from, from + limit - 1);

    if (error) throw new Error(`Failed to load missions: ${error.code}`);

    const ids = (data ?? []).map((mission) => mission.id);
    const { data: questionRows } = ids.length
      ? await supabase
          .from("mission_questions")
          .select("mission_id")
          .in("mission_id", ids)
      : { data: [] };

    const questionCounts = new Map<string, number>();
    for (const row of questionRows ?? []) {
      questionCounts.set(
        row.mission_id,
        (questionCounts.get(row.mission_id) ?? 0) + 1
      );
    }

    return Response.json({
      success: true,
      data: (data ?? []).map((mission) => ({
        ...mission,
        questionCount: questionCounts.get(mission.id) ?? 0,
      })),
      pagination: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.max(1, Math.ceil((count ?? 0) / limit)),
      },
    });
  });
}

export async function POST(request: Request) {
  return withErrorHandling(async () => {
    const lang = getLangFromRequest(request);
    const user = await requireRole(["admin", "educator"]);
    const input = await parseJsonBody(request, adminMissionSchema);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("missions")
      .insert({
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
      .select("id, slug, title, status")
      .single();

    if (error) {
      if (error.code === "23505") {
        return Response.json(
          { success: false, error: E.missionSlugTaken[lang] },
          { status: 409 }
        );
      }
      throw new Error(`Failed to create mission: ${error.code}`);
    }

    await auditLog({
      actorId: user.id,
      action: "mission.created",
      resourceType: "mission",
      resourceId: data.id,
      details: { slug: data.slug, status: data.status },
    });

    return Response.json({ success: true, data }, { status: 201 });
  });
}
