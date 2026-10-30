import { createClient } from "@/lib/supabase/server";
import { withErrorHandling } from "@/lib/api/handler";

export async function GET() {
  return withErrorHandling(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase.from("encyclopedia_categories").select("id,slug,name,description,cover_image_url,icon,sort_order").eq("status", "published").order("sort_order");
    if (error) throw new Error(`Failed to fetch encyclopedia categories: ${error.code}`);
    return Response.json({ success: true, data: data ?? [] }, { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800" } });
  });
}
