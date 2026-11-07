import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";
import { missionQuestionSchema } from "@/lib/validation";
import { auditLog } from "@/lib/audit";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return withErrorHandling(async () => {
    await requireRole(["admin"]);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("mission_questions")
      .select("*")
      .eq("mission_id", id)
      .order("sort_order", { ascending: true });

    if (error) {
      throw new Error("Failed to load questions");
    }

    return Response.json({ success: true, data: data ?? [] });
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return withErrorHandling(async () => {
    const user = await requireRole(["admin"]);
    const parsed = missionQuestionSchema.parse(await request.json());
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("mission_questions")
      .insert({ ...parsed, mission_id: id })
      .select("*")
      .single();

    if (error) {
      throw new Error("Failed to create question");
    }

    await auditLog({
      actorId: user.id,
      action: "mission.question.created",
      resourceType: "mission_question",
      resourceId: data.id,
      details: { mission_id: id, question_type: parsed.question_type },
    });

    return Response.json({ success: true, data }, { status: 201 });
  });
}
