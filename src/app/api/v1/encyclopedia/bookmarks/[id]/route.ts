import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandling(async () => {
    const user = await requireAuth();
    const { id } = await params;
    const supabase = await createClient();
    const { error } = await supabase.from("encyclopedia_bookmarks").delete().eq("profile_id", user.id).eq("article_id", id);
    if (error) throw new Error(`Failed to remove bookmark: ${error.code}`);
    return Response.json({ success: true, data: { articleId: id } }, { headers: { "Cache-Control": "private, no-store" } });
  });
}
