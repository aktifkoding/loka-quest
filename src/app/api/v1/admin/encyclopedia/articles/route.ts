import { createClient } from "@/lib/supabase/server";
import { requireEncyclopediaRole, articlePayload, setArticleRelations } from "@/lib/encyclopedia";
import { encyclopediaArticleSchema, paginationSchema } from "@/lib/validation";
import { withErrorHandling } from "@/lib/api/handler";
import { auditLog } from "@/lib/audit";

export async function GET(request: Request) {
  return withErrorHandling(async () => {
    await requireEncyclopediaRole(["content_administrator", "cultural_editor", "reviewer", "contributor"]);
    const supabase = await createClient();
    const url = new URL(request.url);
    const { page, limit } = paginationSchema.parse({ page: url.searchParams.get("page"), limit: url.searchParams.get("limit") });
    const { data, error, count } = await supabase.from("encyclopedia_articles").select("id,slug,title,summary,status,featured,updated_at", { count: "exact" }).order("updated_at", { ascending: false }).range((page - 1) * limit, page * limit - 1);
    if (error) throw new Error(`Failed to fetch CMS articles: ${error.code}`);
    return Response.json({ success: true, data: data ?? [], pagination: { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) } }, { headers: { "Cache-Control": "private, no-store" } });
  });
}

export async function POST(request: Request) {
  return withErrorHandling(async () => {
    const user = await requireEncyclopediaRole(["content_administrator", "cultural_editor", "contributor"]);
    const parsed = encyclopediaArticleSchema.parse(await request.json());
    if (parsed.status === "published" || parsed.status === "approved") throw new Error("New articles must be saved as drafts or submitted for review");
    const supabase = await createClient();
    const { data, error } = await supabase.from("encyclopedia_articles").insert({ ...articlePayload(parsed), author_id: user.id, status: parsed.status }).select("id,slug,title,status").single();
    if (error) throw new Error(`Failed to create article: ${error.code}`);
    await setArticleRelations(data.id, parsed.categoryIds, parsed.regionIds);
    await auditLog({ actorId: user.id, action: "encyclopedia.article.created", resourceType: "encyclopedia_article", resourceId: data.id });
    return Response.json({ success: true, data }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
  });
}
