import { createClient } from "@/lib/supabase/server";
import { paginationSchema } from "@/lib/validation";
import { withErrorHandling } from "@/lib/api/handler";

export async function GET(request: Request) {
  return withErrorHandling(async () => {
    const supabase = await createClient();
    const url = new URL(request.url);
    const regionSlug = url.searchParams.get("region");

    const { page, limit } = paginationSchema.parse({
      page: url.searchParams.get("page"),
      limit: url.searchParams.get("limit"),
    });

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("missions")
      .select(
        "id, slug, title, description, difficulty, xp_reward, region_id, status, sort_order",
        { count: "exact" }
      )
      .eq("status", "published");

    if (regionSlug) {
      const { data: region } = await supabase
        .from("cultural_regions")
        .select("id")
        .eq("slug", regionSlug)
        .single();

      if (!region) {
        return Response.json({ success: true, data: [], pagination: { page, limit, total: 0, totalPages: 0 } });
      }
      query = query.eq("region_id", region.id);
    }

    const { data: missions, error, count } = await query
      .order("sort_order", { ascending: true })
      .range(from, to);

    if (error) {
      throw new Error(`Failed to fetch missions: ${error.code}`);
    }

    return Response.json({
      success: true,
      data: missions,
      pagination: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.max(1, Math.ceil((count ?? 0) / limit)),
      },
    });
  });
}
