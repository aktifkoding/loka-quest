"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

type FavoriteItem = {
  article: {
    id: string;
    slug: string;
    title: string;
    summary: string;
    featured_image_url: string | null;
  } | null;
};

export default function EncyclopediaFavoritesPage() {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/v1/encyclopedia/bookmarks", { cache: "no-store" });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(
          response.status === 401 ? "Masuk untuk melihat artikel favorit." : "Favorit belum dapat dimuat."
        );
      }
      setItems(json.data ?? []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function remove(id: string) {
    await fetch(`/api/v1/encyclopedia/bookmarks/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <PageHeader
        icon={Bookmark}
        title="Favorit saya"
        description="Artikel yang Anda simpan untuk dibaca kembali."
        backHref="/encyclopedia"
        backLabel="Ensiklopedia"
      />

      {loading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2" aria-busy="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-start gap-4 rounded-xl border border-border/70 bg-card p-5 shadow-card"
            >
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="size-9 rounded-md" />
            </div>
          ))}
        </div>
      ) : message ? (
        <div className="mt-8">
          <EmptyState
            icon={Bookmark}
            title="Favorit tidak tersedia"
            description={message}
            action={{ label: "Masuk", href: "/auth/login" }}
          />
        </div>
      ) : items.length ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {items.map(({ article }) =>
            article ? (
              <Card key={article.id} className="h-full">
                <div className="flex items-start gap-4 p-5">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/encyclopedia/${article.slug}`}
                      className="font-display text-lg font-semibold transition-colors hover:text-primary"
                    >
                      {article.title}
                    </Link>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {article.summary}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="iconSm"
                    aria-label={`Hapus ${article.title} dari favorit`}
                    onClick={() => remove(article.id)}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </Card>
            ) : null
          )}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState
            icon={Bookmark}
            title="Belum ada favorit"
            description="Simpan artikel yang ingin Anda baca kembali."
            action={{ label: "Jelajahi artikel", href: "/encyclopedia/explore" }}
          />
        </div>
      )}
    </div>
  );
}
