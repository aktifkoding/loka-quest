import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/response";
import { adminQuestionSchema } from "@/lib/validation/admin";
import { auditLog } from "@/lib/audit";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const user = await requireRole(["admin", "educator"]);
    const { id } = await params;
    const input = await parseJsonBody(request, adminQuestionSchema);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("mission_questions")
      .insert({
        mission_id: id,
        question_type: input.questionType,
        prompt: input.prompt,
        options: input.options,
        correct_answer: input.correctAnswer,
        explanation: input.explanation ?? null,
        sort_order: input.sortOrder,
      })
      .select("id, question_type, prompt, sort_order")
      .single();

    if (error) {
      throw new Error(`Failed to create question: ${error.code}`);
    }

    await auditLog({
      actorId: user.id,
      action: "mission.question.created",
      resourceType: "mission_question",
      resourceId: data.id,
      details: { missionId: id },
    });

    return Response.json({ success: true, data }, { status: 201 });
  });
}
