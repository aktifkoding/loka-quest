"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { wikimediaLoader } from "@/lib/wikimedia-loader";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Reveal } from "@/components/ui/reveal";
import { Tilt3D } from "@/components/ui/tilt3d";
import {
  ArrowLeft,
  MapPin,
  Gamepad2,
  ArrowRight,
  Compass,
  BookMarked,
  ScrollText,
  Landmark,
  Users,
  Sparkles,
  ExternalLink,
  X,
  Maximize2,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { publicDict as d } from "@/lib/i18n/dict/public";
import { commonDict } from "@/lib/i18n/dict/common";
import type { Localized } from "@/lib/i18n";

interface ImageCredit {
  title: string;
  author: string | null;
  license: string | null;
}

interface RegionContent {
  id: string;
  title: string;
  description: string;
  content_type: string;
  body: string | null;
  media_url: string | null;
  media_type: string | null;
  source: { title: string; publisher: string | null; license: string | null; url?: string | null } | null;
  image_credit: ImageCredit | null;
}

interface RegionDetail {
  id: string;
  slug: string;
  name: string;
  description: string;
  geographic_context: string;
  image_url: string | null;
  image_credit: ImageCredit | null;
  contents: RegionContent[];
}

interface Mission {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: string;
  xp_reward: number;
}

const difficultyLabel: Record<string, Localized> = {
  beginner: d.difficultyBeginner,
  intermediate: d.difficultyIntermediate,
  advanced: d.difficultyAdvanced,
};

const contentTypeMeta: Record<string, { label: Localized; icon: typeof ScrollText; color: string }> = {
  tradition: { label: d.contentTypeTradition, icon: ScrollText, color: "bg-amber-500/10 text-amber-700 dark:text-amber-400" },
  artifact: { label: d.contentTypeArtifact, icon: Landmark, color: "bg-rose-500/10 text-rose-700 dark:text-rose-400" },
  practice: { label: d.contentTypePractice, icon: Users, color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
  story: { label: d.contentTypeStory, icon: BookMarked, color: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400" },
};

export default function RegionDetailPage() {
  const params = useParams();
  const { t } = useI18n();
  const [region, setRegion] = useState<RegionDetail | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    const fetchRegion = async () => {
      try {
        const [regionRes, missionsRes] = await Promise.all([
          fetch(`/api/v1/regions?slug=${params.slug}`),
          fetch(`/api/v1/missions?region=${params.slug}`),
        ]);

        const regionData = await regionRes.json();
        const missionsData = await missionsRes.json();

        if (!regionRes.ok) {
          throw new Error(regionData.error || t(d.errorLoadRegions));
        }

        setRegion(regionData.data ?? null);
        setMissions(missionsData.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : t(commonDict.errorGeneric));
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchRegion();
    }
  }, [params.slug, t]);

  // Lightbox close on Escape
  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10" aria-busy="true">
        <Skeleton className="h-9 w-40 rounded-md" />
        <Skeleton className="mt-8 h-10 w-1/2" />
        <Skeleton className="mt-3 h-5 w-1/3" />
        <Skeleton className="mt-8 h-72 w-full rounded-2xl" />
        <Skeleton className="mt-10 h-7 w-48" />
        <div className="mt-6 space-y-3">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !region) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <EmptyState
          icon={Compass}
          title={t(d.regionNotFoundTitle)}
          description={
            error ??
            t(d.regionNotFoundDescription)
          }
          action={{ label: t(d.backToExploreCta), href: "/explore" }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:py-14">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
        <Link href="/explore">
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t(d.exploreLink)}
        </Link>
      </Button>

      {/* Hero image full-bleed */}
      {region.image_url && (
        <Reveal>
          <figure className="relative -mx-4 mb-10 h-64 overflow-hidden rounded-none sm:mx-0 sm:h-80 sm:rounded-2xl md:h-96">
            <Image
                  loader={wikimediaLoader}
              src={region.image_url}
              alt={t(d.regionImageAlt, { name: region.name })}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md text-white">
                  <MapPin className="size-6" aria-hidden="true" />
                </span>
                <div>
                  <h1 className="font-display text-3xl font-semibold text-white sm:text-4xl">
                    {region.name}
                  </h1>
                  <p className="mt-1 text-sm text-white/80">{region.geographic_context}</p>
                </div>
              </div>
            </div>
          </figure>
        </Reveal>
      )}

      {/* Description */}
      <section aria-label={t(d.aboutSectionAria)} className="mb-12">
        <Reveal>
          <h2 className="font-display text-xl font-semibold">{t(d.aboutHeading)}</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">{region.description}</p>
        </Reveal>
      </section>

      {/* Konten budaya */}
      {region.contents.length > 0 && (
        <section className="mb-14" aria-label={t(d.contentsSectionAria)}>
          <Reveal>
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" aria-hidden="true" />
              <h2 className="font-display text-2xl font-semibold">{t(d.contentsHeading)}</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {t(d.contentsIntro)}
            </p>
          </Reveal>

          <div className="mt-6 space-y-6">
            {region.contents.map((content, index) => {
              const meta = contentTypeMeta[content.content_type] ?? contentTypeMeta.tradition;
              const Icon = meta.icon;
              const isWide = index === 0 && region.contents.length > 1;
              return (
                <Reveal key={content.id} delay={index * 80}>
                  <Tilt3D max={6}>
                    <Card className="overflow-hidden">
                      {/* Media */}
                      {content.media_url && (
                        <div className="relative border-b border-border bg-secondary/30">
                          <div className={`relative ${isWide ? "h-64 sm:h-80" : "h-56 sm:h-64"}`}>
                            <Image
                  loader={wikimediaLoader}
                              src={content.media_url}
                              alt={content.title}
                              fill
                              sizes="(min-width: 1024px) 50vw, 100vw"
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                            <button
                              onClick={() => setLightbox(content.media_url)}
                              className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-black/60"
                              aria-label={t(d.zoomAria)}
                            >
                              <Maximize2 className="size-3.5" aria-hidden="true" />
                              {t(d.zoomCta)}
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="p-6 sm:p-7">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className={`inline-flex size-8 items-center justify-center rounded-lg ${meta.color}`}>
                            <Icon className="size-4" aria-hidden="true" />
                          </span>
                          <p className="text-[13px] font-semibold text-primary">{t(meta.label)}</p>
                        </div>
                        <h3 className="mt-2.5 font-display text-xl font-semibold leading-snug">
                          {content.title}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">{content.description}</p>

                        {(content.body ?? "").length > 0 && (
                          <div className="mt-4 space-y-3">
                            {(content.body ?? "").split("\n\n").map((para, i) => (
                              <p key={i} className="leading-relaxed text-foreground/85">
                                {para}
                              </p>
                            ))}
                          </div>
                        )}

                        {content.source && (
                          <div className="mt-5 flex flex-wrap items-center gap-1.5 border-t border-border pt-3.5 text-[12px] text-muted-foreground">
                            <BookMarked className="size-3.5 shrink-0" aria-hidden="true" />
                            <span>
                              {t(d.sourcePrefix, { x: content.source.title })}
                              {content.source.publisher ? ` · ${content.source.publisher}` : ""}
                              {content.source.license ? ` · ${content.source.license}` : ""}
                            </span>
                            {content.source.url && (
                              <a
                                href={content.source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 text-primary hover:underline"
                              >
                                <ExternalLink className="size-3" aria-hidden="true" />
                                {t(d.openSourceCta)}
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  </Tilt3D>
                </Reveal>
              );
            })}
          </div>
        </section>
      )}

      {/* Misi di wilayah ini */}
      <section className="mb-14" aria-label={t(d.missionsSectionAria)}>
        <Reveal>
          <h2 className="font-display text-2xl font-semibold">{t(d.missionsHeading)}</h2>
        </Reveal>

        {missions.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={Gamepad2}
              title={t(d.missionsEmptyTitle)}
              description={t(d.missionsEmptyDescription)}
              action={{ label: t(d.otherRegionsCta), href: "/explore" }}
            />
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {missions.map((mission, index) => (
              <li key={mission.id}>
                <Link href={`/missions/${mission.slug}`} className="group block">
                  <Reveal delay={index * 80}>
                    <Tilt3D max={6}>
                      <Card interactive>
                        <div className="flex items-center gap-4 px-6 py-5">
                          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Gamepad2 className="size-5" aria-hidden="true" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold">{mission.title}</p>
                            <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                              {mission.description}
                            </p>
                            <p className="mt-1.5 text-[13px] text-muted-foreground">
                              <span>
                                {difficultyLabel[mission.difficulty]
                                  ? t(difficultyLabel[mission.difficulty])
                                  : mission.difficulty}
                              </span>
                              <span aria-hidden="true"> · </span>
                              <span className="font-semibold tabular-nums text-gold">
                                {mission.xp_reward} XP
                              </span>
                            </p>
                          </div>
                          <ArrowRight
                            className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary"
                            aria-hidden="true"
                          />
                        </div>
                      </Card>
                    </Tilt3D>
                  </Reveal>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label={t(d.lightboxAria)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="animate-scale-in absolute right-4 top-4 inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
            aria-label={t(d.lightboxCloseAria)}
          >
            <X className="size-5" aria-hidden="true" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element -- lightbox perlu ukuran asli gambar */}
          <img
            src={lightbox}
            alt={t(d.previewAlt)}
            className="animate-scale-in max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
