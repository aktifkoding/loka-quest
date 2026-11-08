"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useI18n, formatDate } from "@/lib/i18n";
import { commonDict } from "@/lib/i18n/dict/common";
import { encyclopediaDict as d } from "@/lib/i18n/dict/encyclopedia";

type CollectionItem = {
  article: { id: string; slug: string; title: string; summary: string } | null;
  viewed_at: string;
  progress: number;
};

export default function EncyclopediaCollectionsPage() {
  const { lang, t } = useI18n();
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/v1/encyclopedia/collections", { cache: "no-store" });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(
          response.status === 401 ? t(d.collectionsAuthMessage) : t(d.collectionsLoadError)
        );
      }
      setItems(json.data ?? []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t(commonDict.errorGeneric));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function clear() {
    await fetch("/api/v1/encyclopedia/collections", { method: "DELETE" });
    setItems([]);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
      <PageHeader
        icon={BookOpen}
        title={t(d.collectionsTitle)}
        description={t(d.collectionsDescription)}
        backHref="/encyclopedia"
        backLabel={t(d.backToEncyclopedia)}
        actions={
          items.length > 0 ? (
            <Button variant="outline" size="sm" onClick={clear}>
              <Trash2 className="size-4" aria-hidden="true" />
              {t(d.clearHistoryCta)}
            </Button>
          ) : undefined
        }
      />

      {loading ? (
        <div className="mt-8 space-y-3" aria-busy="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-wrap items-center gap-4 rounded-xl border border-border/70 bg-card p-5 shadow-card"
            >
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      ) : message ? (
        <div className="mt-8">
          <EmptyState
            icon={BookOpen}
            title={t(d.collectionsUnavailableTitle)}
            description={message}
            action={{ label: t(d.signInCta), href: "/auth/login" }}
          />
        </div>
      ) : items.length ? (
        <div className="mt-8 space-y-3">
          {items.map(({ article, viewed_at, progress }) =>
            article ? (
              <Card key={article.id}>
                <div className="flex flex-wrap items-center gap-4 p-5">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/encyclopedia/${article.slug}`}
                      className="font-display text-lg font-semibold transition-colors hover:text-primary"
                    >
                      {article.title}
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t(d.lastRead, { date: formatDate(viewed_at, lang) })} ·{" "}
                      <span className="tabular-nums">{progress}%</span>
                    </p>
                  </div>
                  <span className="line-clamp-2 max-w-xs text-sm text-muted-foreground sm:text-right">
                    {article.summary}
                  </span>
                </div>
              </Card>
            ) : null
          )}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState
            icon={BookOpen}
            title={t(d.emptyHistoryTitle)}
            description={t(d.emptyHistoryDescription)}
            action={{ label: t(d.exploreArticlesCta), href: "/encyclopedia/explore" }}
          />
        </div>
      )}
    </div>
  );
}
