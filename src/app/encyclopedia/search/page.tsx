import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Search, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { paginationSchema } from "@/lib/validation";
import { getServerI18n } from "@/lib/i18n/server";
import { commonDict } from "@/lib/i18n/dict/common";
import { encyclopediaDict as d } from "@/lib/i18n/dict/encyclopedia";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerI18n();
  return { title: t(d.searchMetaTitle) };
}
type Props = { searchParams: Promise<{ q?: string; page?: string }> };

type SearchResult = { id: string; slug: string; title: string; summary: string };

export default async function EncyclopediaSearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const { t } = await getServerI18n();
  const query = (params.q ?? "").trim();
  const { page, limit } = paginationSchema.parse({ page: params.page, limit: "12" });

  let results: SearchResult[] = [];
  let total = 0;
  let failed = false;

  if (query.length >= 2) {
    const supabase = await createClient();
    const { data, count, error } = await supabase
      .from("encyclopedia_articles")
      .select("id,slug,title,summary", { count: "exact" })
      .eq("status", "published")
      .textSearch("search_document", query, { type: "websearch", config: "simple" })
      .order("published_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    failed = Boolean(error);
    results = (data ?? []) as SearchResult[];
    total = count ?? 0;
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <PageHeader
        icon={Search}
        title={t(d.searchPageTitle)}
        description={t(d.searchPageDescription)}
        backHref="/encyclopedia"
        backLabel={t(d.backToEncyclopedia)}
      />

      <form action="/encyclopedia/search" className="mt-8 flex max-w-2xl gap-2">
        <label className="sr-only" htmlFor="search-query">
          {t(d.keywordLabel)}
        </label>
        <Input
          id="search-query"
          name="q"
          defaultValue={query}
          placeholder={t(d.searchInputPlaceholder)}
          className="h-11 min-w-0 flex-1 rounded-xl px-4"
          autoComplete="off"
        />
        <Button type="submit" size="lg" className="h-11 rounded-xl px-5">
          <Search className="size-4" aria-hidden="true" />
          {t(commonDict.search)}
        </Button>
      </form>

      {query && (
        <p className="mt-6 text-sm text-muted-foreground" role="status">
          {t(d.resultsFor, { query })}
        </p>
      )}

      {failed ? (
        <div className="mt-8">
          <EmptyState
            icon={Search}
            title={t(d.searchFailedTitle)}
            description={t(d.searchFailedDescription)}
          />
        </div>
      ) : query && results.length > 0 ? (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {results.map((article) => (
              <Link key={article.id} href={`/encyclopedia/${article.slug}`}>
                <Card interactive className="h-full">
                  <div className="p-5">
                    <h2 className="font-display text-xl font-semibold">{article.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {article.summary}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <nav
              className="mt-8 flex items-center justify-center gap-4"
              aria-label={t(d.paginationAria)}
            >
              {page > 1 && (
                <Button variant="outline" size="sm" asChild>
                  <Link
                    href={`/encyclopedia/search?q=${encodeURIComponent(query)}&page=${page - 1}`}
                  >
                    {t(commonDict.previous)}
                  </Link>
                </Button>
              )}
              <span className="text-sm tabular-nums text-muted-foreground">
                {t(commonDict.pageOf, { x: page, y: totalPages })}
              </span>
              {page < totalPages && (
                <Button variant="outline" size="sm" asChild>
                  <Link
                    href={`/encyclopedia/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
                  >
                    {t(commonDict.next)}
                  </Link>
                </Button>
              )}
            </nav>
          )}
        </>
      ) : query ? (
        <div className="mt-8">
          <EmptyState
            icon={BookOpen}
            title={t(d.noResultsTitle)}
            description={t(d.noResultsDescription)}
            action={{ label: t(d.exploreArticlesCta), href: "/encyclopedia/explore" }}
          />
        </div>
      ) : (
        <div className="batik-grid mt-8 rounded-2xl border border-border/70 bg-secondary/40 p-8 text-sm leading-relaxed text-muted-foreground">
          {t(d.searchIntro)}
        </div>
      )}
    </div>
  );
}
