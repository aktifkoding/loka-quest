import { createClient } from "@/lib/supabase/server";
import { requireEncyclopediaRole, articlePayload, setArticleRelations } from "@/lib/encyclopedia";
import { encyclopediaArticleSchema } from "@/lib/validation";
import { auditLog } from "@/lib/audit";
import { withErrorHandling } from "@/lib/api/handler";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandling(async () => {
    await requireEncyclopediaRole(["content_administrator","cultural_editor","reviewer","contributor"]);
    const { id } = await params;
    const supabase = await createClient();
    const { data, error } = await supabase.from("encyclopedia_articles").select("*,encyclopedia_article_categories(category_id),encyclopedia_article_regions(region_id),encyclopedia_sources(id,source_title,publisher,source_url,source_type,notes)").eq("id",id).maybeSingle();
    if (error) throw new Error(`Failed to fetch article for editing: ${error.code}`);
    if (!data) return Response.json({success:false,error:"Article not found"},{status:404});
    return Response.json({success:true,data},{headers:{"Cache-Control":"private, no-store"}});
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandling(async () => {
    const user = await requireEncyclopediaRole(["content_administrator", "cultural_editor", "contributor"]);
    const { id } = await params;
    const parsed = encyclopediaArticleSchema.parse(await request.json());
    if (parsed.status === "published" || parsed.status === "approved") throw new Error("Gunakan alur review dan publikasi untuk mengubah status artikel");
    const supabase = await createClient();
    const { data, error } = await supabase.from("encyclopedia_articles").update(articlePayload(parsed)).eq("id", id).select("id,slug,title,status").maybeSingle();
    if (error) throw new Error(`Failed to update article: ${error.code}`);
    if (!data) return Response.json({ success: false, error: "Article not found" }, { status: 404 });
    await setArticleRelations(id, parsed.categoryIds, parsed.regionIds);
    await auditLog({ actorId: user.id, action: "encyclopedia.article.updated", resourceType: "encyclopedia_article", resourceId: id });
    return Response.json({ success: true, data }, { headers: { "Cache-Control": "private, no-store" } });
  });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandling(async () => {
    const user = await requireEncyclopediaRole(["content_administrator", "cultural_editor"]);
    const { id } = await params;
    const supabase = await createClient();
    const { data, error } = await supabase.from("encyclopedia_articles").update({ status: "archived" }).eq("id", id).select("id").maybeSingle();
    if (error) throw new Error(`Failed to archive article: ${error.code}`);
    if (!data) return Response.json({ success: false, error: "Article not found" }, { status: 404 });
    await auditLog({ actorId: user.id, action: "encyclopedia.article.archived", resourceType: "encyclopedia_article", resourceId: id });
    return Response.json({ success: true, data }, { headers: { "Cache-Control": "private, no-store" } });
  });
}
