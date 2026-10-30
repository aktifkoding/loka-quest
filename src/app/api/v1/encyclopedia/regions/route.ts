import { createClient } from "@/lib/supabase/server";
import { withErrorHandling } from "@/lib/api/handler";

export async function GET() {
  return withErrorHandling(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase.from("encyclopedia_article_regions")
      .select("region:cultural_regions!inner(id,slug,name,description,image_url)")
      .eq("region.status", "published");
    if (error) throw new Error(`Failed to fetch encyclopedia regions: ${error.code}`);
    const unique = new Map<string, unknown>();
    for (const row of data ?? []) {
      const region = row.region as { id?: string } | null;
      if (region?.id) unique.set(region.id, region);
    }
    return Response.json({ success: true, data: Array.from(unique.values()) }, { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800" } });
  });
}
