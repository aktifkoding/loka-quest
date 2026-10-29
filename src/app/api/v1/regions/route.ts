import { createClient } from "@/lib/supabase/server";
import { paginationSchema } from "@/lib/validation";
import { withErrorHandling } from "@/lib/api/handler";

export async function GET(request: Request) {
  return withErrorHandling(async () => {
    const supabase = await createClient();
    const url = new URL(request.url);
    const slug = url.searchParams.get("slug");

    if (slug) {
      const { data: region, error } = await supabase
        .from("cultural_regions")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (error || !region) {
        return Response.json(
          { success: false, error: "Region not found" },
          { status: 404 }
        );
      }

      // Published cultural entries with text source + photo credit
      const { data: contents } = await supabase
        .from("cultural_contents")
        .select(
          "id, title, description, content_type, body, media_url, media_type, source:cultural_sources!source_id (title, publisher, license), image_credit:cultural_sources!image_source_id (title, author, license)"
        )
        .eq("region_id", region.id)
        .eq("status", "published")
        .order("sort_order", { ascending: true });

      const { data: imageSource } = await supabase
        .from("cultural_sources")
        .select("title, author, license")
        .eq("id", region.image_source_id ?? "")
        .maybeSingle();

      return Response.json({
        success: true,
        data: {
          ...region,
          image_credit: imageSource ?? null,
          contents: (contents ?? []).map((c) => ({
            ...c,
            source: Array.isArray(c.source) ? c.source[0] ?? null : c.source,
            image_credit: Array.isArray(c.image_credit)
              ? c.image_credit[0] ?? null
              : c.image_credit,
          })),
        },
      });
    }

    const { page, limit } = paginationSchema.parse({
      page: url.searchParams.get("page"),
      limit: url.searchParams.get("limit"),
    });

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: regions, error, count } = await supabase
      .from("cultural_regions")
      .select("*", { count: "exact" })
      .eq("status", "published")
      .order("sort_order", { ascending: true })
      .range(from, to);

    if (error) {
      throw new Error(`Failed to fetch regions: ${error.code}`);
    }

    return Response.json({
      success: true,
      data: regions,
      pagination: {
        page,
        limit,
        total: count ?? regions.length,
        totalPages: Math.max(1, Math.ceil((count ?? 0) / limit)),
      },
    });
  });
}
