import { withErrorHandling } from "@/lib/api/handler";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withErrorHandling(async () => {
    await requireRole(["admin"]);
    const supabase = await createClient();
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
        { success: false, error: "Tidak ada field yang bisa diperbarui" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("community_submissions")
      .update(allowed)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw new Error("Failed to update submission");
    }

    return Response.json({ success: true, data });
  });
}
