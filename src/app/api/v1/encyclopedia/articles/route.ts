import { createClient } from "@/lib/supabase/server";
import { paginationSchema } from "@/lib/validation";
import { withErrorHandling } from "@/lib/api/handler";

export async function GET(request: Request) {
  return withErrorHandling(async () => {
    const supabase = await createClient();
    const url = new URL(request.url);
    const { page, limit } = paginationSchema.parse({ page: url.searchParams.get("page"), limit: url.searchParams.get("limit") });
    const category = url.searchParams.get("category");
    const region = url.searchParams.get("region");
    const featured = url.searchParams.get("featured");
    const queryText = (url.searchParams.get("q") ?? "").trim();
    const from = (page - 1) * limit;

    let query = supabase.from("encyclopedia_articles")
      .select("id,slug,title,summary,featured_image_url,featured,published_at,encyclopedia_article_categories(category:encyclopedia_categories(id,slug,name)),encyclopedia_article_regions(region:cultural_regions(id,slug,name))", { count: "exact" })
      .eq("status", "published");
    if (queryText.length >= 2) query = query.textSearch("search_document", queryText, { type: "websearch", config: "simple" });
    if (featured === "true") query = query.eq("featured", true);
    if (category) {
      const { data: row } = await supabase.from("encyclopedia_categories").select("id").eq("slug", category).eq("status", "published").maybeSingle();
      if (!row) return Response.json({ success: true, data: [], pagination: { page, limit, total: 0, totalPages: 0 } });
      const { data: links } = await supabase.from("encyclopedia_article_categories").select("article_id").eq("category_id", row.id);
      const ids = (links ?? []).map((link) => link.article_id);
      if (!ids.length) return Response.json({ success: true, data: [], pagination: { page, limit, total: 0, totalPages: 0 } });
      query = query.in("id", ids);
    }
    if (region) {
      const { data: row } = await supabase.from("encyclopedia_categories").select("id").eq("slug", category).eq("status", "published").maybeSingle();
      if (!row) return Response.json({ success: true, data: [], pagination: { page, limit, total: 0, totalPages: 0 } });
      const { data: links } = await supabase.from("encyclopedia_article_categories").select("article_id").eq("category_id", row.id);
      const ids = (links ?? []).map((link) => link.article_id);
      if (!ids.length) return Response.json({ success: true, data: [], pagination: { page, limit, total: 0, totalPages: 0 } });
      query = query.in("id", ids);
    }
    if (region) {
      const { data: row } = await supabase.from("cultural_regions").select("id").eq("slug", region).eq("status", "published").maybeSingle();
      if (!row) return Response.json({ success: true, data: [], pagination: { page, limit, total: 0, totalPages: 0 } });
      const { data: links } = await supabase.from("encyclopedia_article_regions").select("article_id").eq("region_id", row.id);
      const ids = (links ?? []).map((link) => link.article_id);
      if (!ids.length) return Response.json({ success: true, data: [], pagination: { page, limit, total: 0, totalPages: 0 } });
      query = query.in("id", ids);
    }
    const { data, error, count } = await query.order("published_at", { ascending: false }).range(from, from + limit - 1);
    if (error) throw new Error(`Failed to fetch encyclopedia articles: ${error.code}`);
    return Response.json({ success: true, data: data ?? [], pagination: { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) } });
  });
}
