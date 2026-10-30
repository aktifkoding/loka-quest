import { createClient } from "@/lib/supabase/server";
import { paginationSchema } from "@/lib/validation";
import { withErrorHandling } from "@/lib/api/handler";

export async function GET(request: Request) {
  return withErrorHandling(async () => {
    const supabase = await createClient();
    const url = new URL(request.url);
    const queryText = (url.searchParams.get("q") ?? "").trim();
    const { page, limit } = paginationSchema.parse({ page: url.searchParams.get("page"), limit: url.searchParams.get("limit") });
    if (queryText.length < 2) return Response.json({ success: true, data: [], pagination: { page, limit, total: 0, totalPages: 0 } });

    const { data, error, count } = await supabase.from("encyclopedia_articles")
      .select("id,slug,title,summary,featured_image_url,featured,published_at", { count: "exact" })
      .eq("status", "published")
      .textSearch("search_document", queryText, { type: "websearch", config: "simple" })
      .order("published_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    if (error) throw new Error(`Failed to search encyclopedia: ${error.code}`);
    return Response.json({ success: true, data: data ?? [], pagination: { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) } });
  });
}
