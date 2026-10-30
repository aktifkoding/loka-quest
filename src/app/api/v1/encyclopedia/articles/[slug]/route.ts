import { createClient } from "@/lib/supabase/server";
import { withErrorHandling } from "@/lib/api/handler";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  return withErrorHandling(async () => {
    const { slug } = await params;
    const supabase = await createClient();
    const { data, error } = await supabase.from("encyclopedia_articles")
      .select("*,encyclopedia_article_categories(category:encyclopedia_categories(id,slug,name,description)),encyclopedia_article_regions(region:cultural_regions(id,slug,name,description)),encyclopedia_sources(id,source_title,publisher,source_url,source_type,notes,sort_order),encyclopedia_media(id,title,description,media_type,storage_path,external_url,creator,rights_holder,license,attribution,permission_status,sort_order),encyclopedia_related_articles(related:encyclopedia_articles!encyclopedia_related_articles_related_article_id_fkey(id,slug,title,summary,featured_image_url)),encyclopedia_article_missions(mission:missions(id,slug,title,description,xp_reward))")
      .eq("slug", slug).eq("status", "published").maybeSingle();
    if (error) throw new Error(`Failed to fetch encyclopedia article: ${error.code}`);
    if (!data) return Response.json({ success: false, error: "Article not found" }, { status: 404 });
    return Response.json({ success: true, data }, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
  });
}
