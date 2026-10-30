import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";
import { encyclopediaBookmarkSchema } from "@/lib/validation/schemas";

export async function GET() {
  return withErrorHandling(async () => {
    const user = await requireAuth();
    const supabase = await createClient();
    const { data, error } = await supabase.from("encyclopedia_bookmarks")
      .select("created_at,article:encyclopedia_articles!inner(id,slug,title,summary,featured_image_url,published_at)")
      .eq("profile_id", user.id).eq("article.status", "published").order("created_at", { ascending: false });
    if (error) throw new Error(`Failed to fetch bookmarks: ${error.code}`);
    return Response.json({ success: true, data: data ?? [] }, { headers: { "Cache-Control": "private, no-store" } });
  });
}

export async function POST(request: Request) {
  return withErrorHandling(async () => {
    const user = await requireAuth();
    const payload = encyclopediaBookmarkSchema.parse(await request.json());
    const supabase = await createClient();
    const { error } = await supabase.from("encyclopedia_bookmarks").upsert({ profile_id: user.id, article_id: payload.articleId }, { onConflict: "profile_id,article_id" });
    if (error) throw new Error(`Failed to save bookmark: ${error.code}`);
    return Response.json({ success: true, data: { articleId: payload.articleId } }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
  });
}
