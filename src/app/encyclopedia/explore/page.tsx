import Link from "next/link";
import { WikimediaImage } from "@/components/wikimedia-image";
import { createClient } from "@/lib/supabase/server";
import { BookOpen, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Jelajahi Ensiklopedia" };

type ArticleCard = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  featured_image_url: string | null;
  encyclopedia_article_categories: { category: { name: string } | null }[];
  encyclopedia_article_regions: { region: { name: string } | null }[];
};

export default async function ExploreEncyclopediaPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string; category?: string }>;
}) {
  const { region, category } = await searchParams;
  const supabase = await createClient();

  let filterIds: string[] | null = null;
  let filterLabel: string | null = null;

  if (region) {
    const { data: regionRow } = await supabase
      .from("cultural_regions")
      .select("id, name")
      .eq("slug", region)
      .eq("status", "published")
      .maybeSingle();

    if (!regionRow) {
      filterIds = [];
    } else {
      filterLabel = regionRow.name;
      const { data: links } = await supabase
        .from("encyclopedia_article_regions")
        .select("article_id")
        .eq("region_id", regionRow.id);
      filterIds = (links ?? []).map((link) => link.article_id);
    }
  }

  if (category) {
    const { data: categoryRow } = await supabase
      .from("encyclopedia_categories")
      .select("id, name")
      .eq("slug", category)
      .eq("status", "published")
      .maybeSingle();

    if (!categoryRow) {
      filterIds = [];
    } else {
      filterLabel = filterLabel
        ? `${filterLabel} · ${categoryRow.name}`
        : categoryRow.name;
      const { data: links } = await supabase
        .from("encyclopedia_article_categories")
        .select("article_id")
        .eq("category_id", categoryRow.id);
      const ids = (links ?? []).map((link) => link.article_id);
      filterIds = filterIds
        ? filterIds.filter((id) => ids.includes(id))
        : ids;
    }
  }

  let query = supabase
    .from("encyclopedia_articles")
    .select(
      "id,slug,title,summary,featured_image_url,encyclopedia_article_categories(category:encyclopedia_categories(name)),encyclopedia_article_regions(region:cultural_regions(name))"
    )
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(24);

  if (filterIds) {
    query = query.in("id", filterIds);
  }

  const { data: rawArticles, error } = await query;
  const articles = (rawArticles ?? []) as unknown as ArticleCard[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <PageHeader
        icon={BookOpen}
        title="Jelajahi pengetahuan budaya"
        description="Artikel yang telah dipublikasikan melalui proses tinjauan editorial."
        backHref="/encyclopedia"
        backLabel="Ensiklopedia"
      />

      {filterLabel && (
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
            {filterLabel}
          </span>
          <Link
            href="/encyclopedia/explore"
            className="text-muted-foreground underline-offset-4 hover:underline"
          >
            Hapus filter
          </Link>
        </div>
      )}

      {error ? (
        <div className="mt-10">
          <EmptyState
            icon={BookOpen}
            title="Artikel belum dapat dimuat"
            description="Silakan coba kembali nanti."
          />
        </div>
      ) : !articles.length ? (
        <div className="mt-10">
          <EmptyState
            icon={BookOpen}
            title={filterLabel ? "Belum ada artikel untuk filter ini" : "Koleksi sedang disiapkan"}
            description="Artikel ensiklopedia akan muncul setelah ditinjau dan diterbitkan. Konten lama tetap tersedia di Jelajahi Nusantara."
            action={{ label: "Jelajahi wilayah", href: "/explore" }}
          />
        </div>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link key={article.id} href={`/encyclopedia/${article.slug}`} className="group">
              <Card interactive className="h-full overflow-hidden">
                {article.featured_image_url ? (
                  <div className="relative aspect-[16/9] w-full">
                    <WikimediaImage
                                        src={article.featured_image_url}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="batik-grid flex aspect-[16/9] items-center justify-center bg-secondary">
                    <BookOpen className="size-9 text-primary/60" aria-hidden="true" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {article.encyclopedia_article_categories.map((row, i) => (
                      <span key={i} className="rounded-full bg-secondary px-2.5 py-1">
                        {row.category?.name}
                      </span>
                    ))}
                  </div>
                  <h2 className="mt-3 font-display text-xl font-semibold transition-colors group-hover:text-primary">
                    {article.title}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {article.summary}
                  </p>
                  <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="size-3.5" aria-hidden="true" />
                    {article.encyclopedia_article_regions
                      .map((row) => row.region?.name)
                      .filter(Boolean)
                      .join(", ") || "Wilayah belum ditentukan"}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
