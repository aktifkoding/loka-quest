import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";
import { missionQuestionUpdateSchema } from "@/lib/validation";
import { auditLog } from "@/lib/audit";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; qid: string }> }
) {
  const { id, qid } = await params;
  return withErrorHandling(async () => {
    const user = await requireRole(["admin"]);
    const parsed = missionQuestionUpdateSchema.parse(await request.json());
    const supabase = await createClient();

    if (Object.keys(parsed).length === 0) {
      return Response.json(
        { success: false, error: "Tidak ada field yang bisa diperbarui" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("mission_questions")
      .update({ ...parsed, updated_at: new Date().toISOString() })
      .eq("id", qid)
      .eq("mission_id", id)
      .select("*")
      .single();

    if (error) {
      throw new Error("Failed to update question");
    }

    await auditLog({
      actorId: user.id,
      action: "mission.question.updated",
      resourceType: "mission_question",
      resourceId: qid,
      details: { mission_id: id, fields: Object.keys(parsed) },
    });

    return Response.json({ success: true, data });
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; qid: string }> }
) {
  const { id, qid } = await params;
  return withErrorHandling(async () => {
    const user = await requireRole(["admin"]);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("mission_questions")
      .delete()
      .eq("id", qid)
      .eq("mission_id", id)
      .select("id,prompt")
      .single();

    if (error) {
      throw new Error("Failed to delete question");
    }

    await auditLog({
      actorId: user.id,
      action: "mission.question.deleted",
      resourceType: "mission_question",
      resourceId: qid,
      details: { mission_id: id },
    });

    return Response.json({ success: true, data });
  });
}
