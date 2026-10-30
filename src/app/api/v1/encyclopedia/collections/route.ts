import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";
import { z } from "zod";

const historySchema = z.object({ articleId: z.string().uuid(), progress: z.number().int().min(0).max(100).default(0) });

export async function GET() {
  return withErrorHandling(async () => {
    const user = await requireAuth();
    const supabase = await createClient();
    const { data, error } = await supabase.from("encyclopedia_reading_history").select("article_id,progress,viewed_at,article:encyclopedia_articles!inner(id,slug,title,summary,featured_image_url)").eq("profile_id", user.id).eq("article.status", "published").order("viewed_at", { ascending: false }).limit(100);
    if (error) throw new Error(`Failed to fetch reading history: ${error.code}`);
    return Response.json({ success: true, data: (data ?? []).map((row) => ({ article: row.article, progress: row.progress, viewed_at: row.viewed_at })) }, { headers: { "Cache-Control": "private, no-store" } });
  });
}

export async function POST(request: Request) {
  return withErrorHandling(async () => {
    const user = await requireAuth();
    const payload = historySchema.parse(await request.json());
    const supabase = await createClient();
    const { error } = await supabase.from("encyclopedia_reading_history").upsert({ profile_id: user.id, article_id: payload.articleId, progress: payload.progress, viewed_at: new Date().toISOString() }, { onConflict: "profile_id,article_id" });
    if (error) throw new Error(`Failed to save reading history: ${error.code}`);
    return Response.json({ success: true, data: { articleId: payload.articleId } }, { headers: { "Cache-Control": "private, no-store" } });
  });
}

export async function DELETE() {
  return withErrorHandling(async () => {
    const user = await requireAuth();
    const supabase = await createClient();
    const { error } = await supabase.from("encyclopedia_reading_history").delete().eq("profile_id", user.id);
    if (error) throw new Error(`Failed to clear reading history: ${error.code}`);
    return Response.json({ success: true, data: { cleared: true } }, { headers: { "Cache-Control": "private, no-store" } });
  });
}
