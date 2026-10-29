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

      return Response.json({ success: true, data: region });
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
