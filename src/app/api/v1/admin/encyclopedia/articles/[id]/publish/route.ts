import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireEncyclopediaRole } from "@/lib/encyclopedia";
import { withErrorHandling } from "@/lib/api/handler";
import { auditLog } from "@/lib/audit";
import { ApiError } from "@/lib/api/response";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandling(async () => {
    const user = await requireEncyclopediaRole(["content_administrator"]);
    const { id } = await params;
    const supabase = await createClient();
    const { data: article } = await supabase.from("encyclopedia_articles").select("id,slug,status,summary").eq("id", id).maybeSingle();
    if (!article) return Response.json({ success: false, error: "Article not found" }, { status: 404 });
    if (article.status !== "approved") throw new ApiError(409, "Artikel harus disetujui reviewer sebelum diterbitkan");
    const { count } = await supabase.from("encyclopedia_sources").select("id", { count: "exact", head: true }).eq("article_id", id);
    if (!count) throw new ApiError(422, "Tambahkan minimal satu sumber yang dapat ditelusuri sebelum publikasi");
    const { data, error } = await supabase.from("encyclopedia_articles").update({ status: "published", published_at: new Date().toISOString() }).eq("id", id).select("id,slug,status,published_at").single();
    if (error) throw new Error(`Failed to publish article: ${error.code}`);
    await auditLog({ actorId: user.id, action: "encyclopedia.article.published", resourceType: "encyclopedia_article", resourceId: id });
    revalidatePath("/encyclopedia");
    revalidatePath(`/encyclopedia/${article.slug}`);
    return Response.json({ success: true, data }, { headers: { "Cache-Control": "private, no-store" } });
  });
}
