import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireEncyclopediaRole } from "@/lib/encyclopedia";
import { withErrorHandling } from "@/lib/api/handler";
import { auditLog } from "@/lib/audit";
import { ApiError } from "@/lib/api/response";
import { createServiceClient } from "@/lib/supabase/service-role";
import { sendEmail } from "@/lib/email";
import { getLangFromRequest } from "@/lib/i18n/server";
import { errorsDict as E } from "@/lib/i18n/dict/errors";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandling(async () => {
    const lang = getLangFromRequest(request);
    const user = await requireEncyclopediaRole(["content_administrator"]);
    const { id } = await params;
    const supabase = await createClient();
    const { data: article } = await supabase.from("encyclopedia_articles").select("id,slug,status,summary,title,author_id").eq("id", id).maybeSingle();
    if (!article) return Response.json({ success: false, error: "Article not found" }, { status: 404 });
    if (article.status !== "approved") throw new ApiError(409, E.articleMustBeApproved[lang]);
    const { count } = await supabase.from("encyclopedia_sources").select("id", { count: "exact", head: true }).eq("article_id", id);
    if (!count) throw new ApiError(422, E.sourceRequiredForPublish[lang]);
    const { data, error } = await supabase.from("encyclopedia_articles").update({ status: "published", published_at: new Date().toISOString() }).eq("id", id).select("id,slug,status,published_at").single();
    if (error) throw new Error(`Failed to publish article: ${error.code}`);
    await auditLog({ actorId: user.id, action: "encyclopedia.article.published", resourceType: "encyclopedia_article", resourceId: id });
    revalidatePath("/encyclopedia");
    revalidatePath(`/encyclopedia/${article.slug}`);

    if (article.author_id) {
      const service = createServiceClient();
      const { data: author } = await service
        .from("profiles")
        .select("email, full_name")
        .eq("id", article.author_id)
        .maybeSingle();
      if (author?.email) {
        void sendEmail({
          to: author.email,
          subject: `Artikel "${article.title}" telah diterbitkan`,
          text: `Halo ${author.full_name ?? "Kontributor"},\n\nArtikel Anda "${article.title}" telah disetujui dan diterbitkan di ensiklopedia LokaQuest.\n\nTerima kasih atas kontribusinya.\n\nSalam,\nTim LokaQuest`,
        });
      }
    }

    return Response.json({ success: true, data }, { headers: { "Cache-Control": "private, no-store" } });
  });
}
