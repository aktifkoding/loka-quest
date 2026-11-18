"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { wikimediaLoader } from "@/lib/wikimedia-loader";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { IndonesiaMap } from "@/components/maps/indonesia-map";
import { Tilt3D } from "@/components/ui/tilt3d";
import { Reveal } from "@/components/ui/reveal";
import { Compass, MapPin, ArrowRight, Globe2, LayoutGrid, Search, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { publicDict as d } from "@/lib/i18n/dict/public";
import { commonDict } from "@/lib/i18n/dict/common";
interface Region {
  id: string;
  slug: string;
  name: string;
  description: string;
  geographic_context: string;
  image_url: string | null;
}

type ViewMode = "map" | "cards";

export default function ExplorePage() {
  const router = useRouter();
  const { t } = useI18n();
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("map");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await fetch("/api/v1/regions?limit=100");
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || t(d.errorLoadRegions));
        setRegions(result.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : t(commonDict.errorGeneric));
      } finally {
        setLoading(false);
      }
    };
    fetchRegions();
  }, [t]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <PageHeader
        icon={Compass}
        title={t(d.exploreTitle)}
        description={t(d.exploreDescription)}
        actions={
          /* View toggle */
          <div className="flex items-center gap-1 rounded-xl border border-border/70 bg-secondary/30 p-1">
            <button
              type="button"
              aria-pressed={view === "map"}
              onClick={() => setView("map")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                view === "map"
                  ? "bg-background text-foreground shadow-card"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Globe2 className="size-4" aria-hidden="true" />
              {t(d.mapView)}
            </button>
            <button
              type="button"
              aria-pressed={view === "cards"}
              onClick={() => setView("cards")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                view === "cards"
                  ? "bg-background text-foreground shadow-card"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="size-4" aria-hidden="true" />
              {t(d.cardsView)}
            </button>
          </div>
        }
      />

      <div className="mt-10">
        {loading ? (
          <div className={view === "map" ? "space-y-4" : "grid gap-6 md:grid-cols-3"}>
            {view === "map" ? (
              <Skeleton className="h-[420px] w-full rounded-2xl" />
            ) : (
              [0, 1, 2].map((i) => (
                <div key={i} className="rounded-xl border border-border/70 p-6">
                  <Skeleton className="size-11 rounded-xl" />
                  <Skeleton className="mt-4 h-6 w-2/3" />
                  <Skeleton className="mt-2 h-4 w-1/2" />
                  <Skeleton className="mt-4 h-16 w-full" />
                  <Skeleton className="mt-5 h-9 w-full rounded-md" />
                </div>
              ))
            )}
          </div>
        ) : error ? (
          <EmptyState
            icon={Compass}
            title={t(d.regionsErrorTitle)}
            description={error}
          />
        ) : regions.length === 0 ? (
          <EmptyState
            icon={Compass}
            title={t(d.regionsEmptyTitle)}
            description={t(d.regionsEmptyDescription)}
          />
        ) : view === "map" ? (
          <Reveal>
            <IndonesiaMap
              onRegionClick={(slug) => {
                router.push(`/regions/${slug}`);
              }}
            />
          </Reveal>
        ) : (
          (() => {
            const normalized = query.trim().toLowerCase();
            const filteredRegions = regions.filter(
              (r) =>
                !normalized ||
                r.name.toLowerCase().includes(normalized) ||
                r.geographic_context.toLowerCase().includes(normalized) ||
                r.description.toLowerCase().includes(normalized)
            );

            return (
              <div className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    {t({
                      id: `Menampilkan ${filteredRegions.length} dari ${regions.length} wilayah`,
                      en: `Showing ${filteredRegions.length} of ${regions.length} regions`,
                    })}
                  </p>
                  <div className="relative w-full sm:w-72">
                    <Search
                      className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={t({ id: "Cari wilayah atau pulau...", en: "Search region or island..." })}
                      aria-label={t({ id: "Cari wilayah", en: "Search regions" })}
                      className="h-9 w-full rounded-xl border border-border bg-card pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                    />
                    {query ? (
                      <button
                        type="button"
                        onClick={() => setQuery("")}
                        aria-label={t({ id: "Hapus pencarian", en: "Clear search" })}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="size-3.5" aria-hidden="true" />
                      </button>
                    ) : null}
                  </div>
                </div>

                {filteredRegions.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="font-medium">
                      {t({ id: "Wilayah tidak ditemukan.", en: "No matching regions found." })}
                    </p>
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/50 px-4 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-[#D4AF37]/15"
                    >
                      {t({ id: "Tampilkan semua", en: "Show all" })}
                    </button>
                  </Card>
                ) : (
                  <div className="grid gap-6 md:grid-cols-3">
                    {filteredRegions.map((region, index) => (
                      <Link key={region.id} href={`/regions/${region.slug}`} className="group">
                        <Reveal delay={index * 60}>
                          <Tilt3D max={8} className="h-full">
                            <Card interactive className="animate-fade-up h-full">
                              {region.image_url && (
                                <div className="relative mx-6 mt-6 h-44 overflow-hidden rounded-xl border border-border/60">
                                  <Image
                                    loader={wikimediaLoader}
                                    src={region.image_url}
                                    alt={region.name}
                                    fill
                                    sizes="(min-width: 768px) 33vw, 100vw"
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                </div>
                              )}
                              <div className="flex items-start justify-between px-6 pt-6">
                                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-[#D4AF37]/15 group-hover:text-[#9C6B3B] dark:group-hover:text-[#D4AF37]">
                                  <MapPin className="size-5" aria-hidden="true" />
                                </span>
                                <ArrowRight
                                  className="size-5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#D4AF37]"
                                  aria-hidden="true"
                                />
                              </div>
                              <div className="px-6 pb-6 pt-4">
                                <h2 className="font-display text-xl font-semibold">
                                  {region.name}
                                </h2>
                                <p className="mt-0.5 text-[13px] text-muted-foreground">
                                  {region.geographic_context}
                                </p>
                                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                                  {region.description}
                                </p>
                              </div>
                            </Card>
                          </Tilt3D>
                        </Reveal>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
}
