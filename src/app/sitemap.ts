import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { getRegionalLanguages } from "@/lib/languages";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.lokaquest.web.id";
  const supabase = await createClient();
  const [articlesResult, regionsResult, missionsResult] = await Promise.all([
    supabase
      .from("encyclopedia_articles")
      .select("slug,updated_at,published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(5000),
    supabase
      .from("cultural_regions")
      .select("slug,updated_at")
      .eq("status", "published")
      .order("slug")
      .limit(5000),
    supabase
      .from("missions")
      .select("slug,updated_at")
      .eq("status", "published")
      .order("slug")
      .limit(5000),
  ]);

  const staticRoutes = [
    "/",
    "/encyclopedia",
    "/encyclopedia/explore",
    "/encyclopedia/regions",
    "/encyclopedia/categories",
    "/explore",
    "/missions",
    "/leaderboard",
    "/komunitas",
    "/tentang",
    "/sumber",
  ];

  return [
    ...staticRoutes.map((route) => ({ url: `${baseUrl}${route}`, lastModified: new Date() })),
    ...(regionsResult.data ?? []).map((region) => ({
      url: `${baseUrl}/regions/${region.slug}`,
      lastModified: new Date(region.updated_at || Date.now()),
    })),
    ...(missionsResult.data ?? []).map((mission) => ({
      url: `${baseUrl}/missions/${mission.slug}`,
      lastModified: new Date(mission.updated_at || Date.now()),
    })),
    ...(articlesResult.data ?? []).map((article) => ({
      url: `${baseUrl}/encyclopedia/${article.slug}`,
      lastModified: new Date(article.updated_at || article.published_at || Date.now()),
    })),
    ...getRegionalLanguages().map((language) => ({
      url: `${baseUrl}/bahasa/${language.slug}`,
      lastModified: new Date(),
    })),
  ];
}
