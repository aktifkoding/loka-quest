import { withErrorHandling } from "@/lib/api/handler";
import { requireRole } from "@/lib/auth/session";
import { createServiceClient } from "@/lib/supabase/service-role";
import { sendEmail } from "@/lib/email";
import { getLangFromRequest } from "@/lib/i18n/server";
import { errorsDict as E } from "@/lib/i18n/dict/errors";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withErrorHandling(async () => {
    const lang = getLangFromRequest(request);
    await requireRole(["admin", "educator"]);
    const supabase = createServiceClient();
    const body = await request.json();

    const allowed: Record<string, unknown> = {};
    if (body.status === "published" || body.status === "rejected") {
      allowed.status = body.status;
    }
    if (typeof body.admin_note === "string") {
      allowed.admin_note = body.admin_note.trim().slice(0, 1000);
    }

    if (Object.keys(allowed).length === 0) {
      return Response.json(
        { success: false, error: E.noUpdatableFields[lang] },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("community_submissions")
      .update(allowed)
      .eq("id", id)
      .select(
        "id, title, status, admin_note, submitter_name, submitter_email, created_at"
      )
      .single();

    if (error) {
      throw new Error("Failed to update submission");
    }

    if (data.status === "published" || data.status === "rejected") {
      const approved = data.status === "published";
      void sendEmail({
        to: data.submitter_email,
        subject: approved
          ? `Kontribusi "${data.title}" telah diterbitkan`
          : `Pembaruan kontribusi "${data.title}"`,
        text: approved
          ? `Halo ${data.submitter_name},\n\nKontribusi budaya Anda telah diverifikasi dan diterbitkan di LokaQuest. Terima kasih telah berbagi.\n\nSalam,\nTim LokaQuest`
          : `Halo ${data.submitter_name},\n\nTerima kasih atas kontribusi "${data.title}". Setelah ditinjau, kontribusi ini belum dapat diterbitkan.${data.admin_note ? `\n\nCatatan editor: ${data.admin_note}` : ""}\n\nAnda tetap dapat mengirim dokumentasi lain.\n\nSalam,\nTim LokaQuest`,
      });
    }

    const safe = { ...data } as Record<string, unknown>;
    delete safe.submitter_email;
    return Response.json({ success: true, data: safe });
  });
}
