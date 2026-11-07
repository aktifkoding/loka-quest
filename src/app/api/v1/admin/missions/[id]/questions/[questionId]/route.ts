import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/response";
import { adminQuestionSchema } from "@/lib/validation/admin";
import { auditLog } from "@/lib/audit";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  return withErrorHandling(async () => {
    const user = await requireRole(["admin", "educator"]);
    const { id, questionId } = await params;
    const input = await parseJsonBody(request, adminQuestionSchema);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("mission_questions")
      .update({
        question_type: input.questionType,
        prompt: input.prompt,
        options: input.options,
        correct_answer: input.correctAnswer,
        explanation: input.explanation ?? null,
        sort_order: input.sortOrder,
      })
      .eq("id", questionId)
      .eq("mission_id", id)
      .select("id, question_type, prompt, sort_order")
      .maybeSingle();

    if (error) throw new Error(`Failed to update question: ${error.code}`);
    if (!data) {
      return Response.json(
        { success: false, error: "Question not found" },
        { status: 404 }
      );
    }

    await auditLog({
      actorId: user.id,
      action: "mission.question.updated",
      resourceType: "mission_question",
      resourceId: questionId,
      details: { missionId: id },
    });

    return Response.json({ success: true, data });
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  return withErrorHandling(async () => {
    const user = await requireRole(["admin", "educator"]);
    const { id, questionId } = await params;
    const supabase = await createClient();

    const { error } = await supabase
      .from("mission_questions")
      .delete()
      .eq("id", questionId)
      .eq("mission_id", id);

    if (error) throw new Error(`Failed to delete question: ${error.code}`);

    await auditLog({
      actorId: user.id,
      action: "mission.question.deleted",
      resourceType: "mission_question",
      resourceId: questionId,
      details: { missionId: id },
    });

    return Response.json({ success: true, data: { deleted: true } });
  });
}
