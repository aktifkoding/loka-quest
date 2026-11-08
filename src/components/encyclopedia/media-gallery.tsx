"use client";

import { useState } from "react";
import Image from "next/image";
import { wikimediaLoader } from "@/lib/wikimedia-loader";
import { Card } from "@/components/ui/card";
import {
  Film,
  Music,
  Image as ImageIcon,
  Headphones,
  Sparkles,
} from "lucide-react";
import { getCulturalMediaForArticle } from "@/lib/cultural-media";
import { useI18n } from "@/lib/i18n";
import { encyclopediaDict as d } from "@/lib/i18n/dict/encyclopedia";

interface DbMediaItem {
  id: string;
  title: string;
  description: string | null;
  media_type: string;
  storage_path: string | null;
  external_url: string | null;
  creator: string | null;
  license: string | null;
  attribution: string | null;
  sort_order: number;
}

interface MediaGalleryProps {
  articleSlug: string;
  articleTitle: string;
  dbMedia?: DbMediaItem[];
}

export function MediaGallery({
  articleSlug,
  articleTitle,
  dbMedia = [],
}: MediaGalleryProps) {
  const { t } = useI18n();
  const [activeFilter, setActiveFilter] = useState<"all" | "video" | "audio" | "image">("all");

  const curatedMedia = getCulturalMediaForArticle(articleSlug);

  // Combine curated cultural media with database media items
  const allItems: {
    id: string;
    title: string;
    description: string;
    mediaType: "video" | "audio" | "image";
    url: string;
    creator?: string | null;
    license?: string | null;
    attribution?: string | null;
    category?: string;
  }[] = [
    ...curatedMedia.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      mediaType: m.mediaType,
      url: m.url,
      creator: m.creator,
      license: m.license,
      attribution: m.attribution,
      category: m.category,
    })),
    ...dbMedia.map((db) => {
      let type: "video" | "audio" | "image" = "image";
      if (db.media_type === "video") type = "video";
      else if (db.media_type === "audio") type = "audio";
      return {
        id: db.id,
        title: db.title,
        description: db.description || "",
        mediaType: type,
        url: db.external_url || db.storage_path || "",
        creator: db.creator,
        license: db.license,
        attribution: db.attribution,
        category: "visual",
      };
    }),
  ];

  if (allItems.length === 0) return null;

  const filteredItems = allItems.filter((item) => {
    if (activeFilter === "all") return true;
    return item.mediaType === activeFilter;
  });

  const videoCount = allItems.filter((i) => i.mediaType === "video").length;
  const audioCount = allItems.filter((i) => i.mediaType === "audio").length;
  const imageCount = allItems.filter((i) => i.mediaType === "image").length;

  return (
    <section className="mt-14 border-t border-border pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5 text-gold" aria-hidden="true" />
            {t(d.mediaBadge)}
          </span>
          <h2 className="mt-2 font-display text-2xl font-bold md:text-3xl">
            {t(d.mediaHeading)}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t(d.mediaIntro, { title: articleTitle })}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-1.5 rounded-xl border border-border bg-secondary/40 p-1 text-xs">
          <button
            onClick={() => setActiveFilter("all")}
            className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
              activeFilter === "all"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t(d.mediaFilterAll, { x: allItems.length })}
          </button>
          {videoCount > 0 && (
            <button
              onClick={() => setActiveFilter("video")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors ${
                activeFilter === "video"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Film className="size-3.5" aria-hidden="true" />
              Video ({videoCount})
            </button>
          )}
          {audioCount > 0 && (
            <button
              onClick={() => setActiveFilter("audio")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors ${
                activeFilter === "audio"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Music className="size-3.5" aria-hidden="true" />
              Audio ({audioCount})
            </button>
          )}
          {imageCount > 0 && (
            <button
              onClick={() => setActiveFilter("image")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors ${
                activeFilter === "image"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ImageIcon className="size-3.5" aria-hidden="true" />
              {t(d.mediaFilterImages)} ({imageCount})
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {filteredItems.map((item) => (
          <Card key={item.id} className="overflow-hidden border-border/80 bg-card">
            {/* Video render */}
            {item.mediaType === "video" && (
              <div className="relative aspect-video w-full bg-black/90">
                {item.url.includes("youtube") || item.url.includes("embed") ? (
                  <iframe
                    src={item.url}
                    title={item.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full border-0"
                    loading="lazy"
                  />
                ) : (
                  <video
                    controls
                    preload="metadata"
                    src={item.url}
                    className="h-full w-full object-cover"
                  >
                    {t(d.videoUnsupported)}
                  </video>
                )}
              </div>
            )}

            {/* Audio render */}
            {item.mediaType === "audio" && (
              <div className="flex flex-col justify-between bg-gradient-to-br from-primary/10 via-secondary/50 to-secondary/30 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                    <Headphones className="size-6" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="rounded-md bg-primary/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
                      {item.category === "musik" ? t(d.mediaBadgeMusic) : t(d.mediaBadgeNarrative)}
                    </span>
                    <h3 className="mt-1 font-display text-lg font-bold leading-tight">
                      {item.title}
                    </h3>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-border/70 bg-background/80 p-3">
                  <audio
                    controls
                    preload="none"
                    src={item.url}
                    className="w-full h-10"
                  >
                    {t(d.audioUnsupported)}
                  </audio>
                </div>
              </div>
            )}

            {/* Image render */}
            {item.mediaType === "image" && (
              <figure className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
                <Image
                  loader={wikimediaLoader}
                  src={item.url}
                  alt={item.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              </figure>
            )}

            {/* Card Content & Metadata */}
            <div className="p-5">
              {item.mediaType !== "audio" && (
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {item.mediaType === "video" ? t(d.mediaBadgeVideo) : t(d.mediaBadgeVisual)}
                  </span>
                  <h3 className="font-display text-base font-semibold text-foreground">
                    {item.title}
                  </h3>
                </div>
              )}

              {item.description && (
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              )}

              {(item.creator || item.attribution || item.license) && (
                <div className="mt-4 border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
                  <p>
                    {item.creator && <span className="font-medium text-foreground">{item.creator}</span>}
                    {item.license && <span> · {item.license}</span>}
                  </p>
                  {item.attribution && (
                    <p className="mt-0.5 text-[10px] text-muted-foreground/80">{item.attribution}</p>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
