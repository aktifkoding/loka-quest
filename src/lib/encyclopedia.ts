import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/session";
import { ApiError } from "@/lib/api/response";

export type EncyclopediaRole = "content_administrator" | "cultural_editor" | "reviewer" | "contributor";

export async function requireEncyclopediaRole(allowed: EncyclopediaRole[]) {
  const user = await requireAuth();
  if (user.role === "admin") return { ...user, editorRole: "content_administrator" as const };
  const supabase = await createClient();
  const { data, error } = await supabase.from("encyclopedia_editor_roles").select("editor_role").eq("profile_id", user.id).maybeSingle();
  if (error || !data || !allowed.includes(data.editor_role as EncyclopediaRole)) throw new ApiError(403, "Anda tidak memiliki izin untuk tindakan ensiklopedia ini");
  return { ...user, editorRole: data.editor_role as EncyclopediaRole };
}

export function articlePayload(input: Record<string, unknown>) {
  return {
    title: input.title, slug: input.slug, summary: input.summary, body: input.body ?? "",
    featured_image_url: input.featuredImageUrl ?? null, featured: input.featured ?? false, status: input.status ?? "draft",
    background: input.background ?? null, historical_context: input.historicalContext ?? null,
    cultural_meaning: input.culturalMeaning ?? null, characteristics: input.characteristics ?? null,
    social_function: input.socialFunction ?? null, practices: input.practices ?? null,
    preservation: input.preservation ?? null, seo_title: input.seoTitle ?? null, seo_description: input.seoDescription ?? null,
  };
}

export async function setArticleRelations(articleId: string, categoryIds: string[], regionIds: string[]) {
  const supabase = await createClient();
  const [categoriesResult, regionsResult] = await Promise.all([
    supabase.from("encyclopedia_article_categories").delete().eq("article_id", articleId),
    supabase.from("encyclopedia_article_regions").delete().eq("article_id", articleId),
  ]);
  if (categoriesResult.error || regionsResult.error) throw new Error("Failed to update article relations");
  const [categories, regions] = await Promise.all([
    categoryIds.length ? supabase.from("encyclopedia_article_categories").insert(categoryIds.map((category_id) => ({ article_id: articleId, category_id }))) : Promise.resolve({ error: null }),
    regionIds.length ? supabase.from("encyclopedia_article_regions").insert(regionIds.map((region_id) => ({ article_id: articleId, region_id }))) : Promise.resolve({ error: null }),
  ]);
  if (categories.error || regions.error) throw new Error("Failed to save article relations");
}
