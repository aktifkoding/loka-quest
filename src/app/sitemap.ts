import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lokaquest.id";
  const supabase = await createClient();
  const { data } = await supabase.from("encyclopedia_articles").select("slug,updated_at,published_at").eq("status", "published").order("published_at", { ascending: false }).limit(5000);
  const staticRoutes = ["/", "/encyclopedia", "/encyclopedia/explore", "/encyclopedia/regions", "/encyclopedia/categories"];
  return [
    ...staticRoutes.map((route) => ({ url: `${baseUrl}${route}`, lastModified: new Date() })),
    ...(data ?? []).map((article) => ({ url: `${baseUrl}/encyclopedia/${article.slug}`, lastModified: new Date(article.updated_at || article.published_at || Date.now()) })),
  ];
}
