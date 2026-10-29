"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Reveal } from "@/components/ui/reveal";
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
} from "lucide-react";

interface RegionContent {
  id: string;
  title: string;
  description: string;
  content_type: string;
  body: string | null;
  source: { title: string; publisher: string | null; license: string | null } | null;
}

interface RegionDetail {
  id: string;
  slug: string;
  name: string;
  description: string;
  geographic_context: string;
  image_url: string | null;
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

const difficultyLabel: Record<string, string> = {
  beginner: "Pemula",
  intermediate: "Menengah",
  advanced: "Lanjutan",
};

const contentTypeMeta: Record<string, { label: string; icon: typeof ScrollText }> = {
  tradition: { label: "Tradisi", icon: ScrollText },
  artifact: { label: "Artefak", icon: Landmark },
  practice: { label: "Praktik", icon: Users },
  story: { label: "Cerita", icon: BookMarked },
};

export default function RegionDetailPage() {
  const params = useParams();
  const [region, setRegion] = useState<RegionDetail | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          throw new Error(regionData.error || "Gagal memuat wilayah");
        }

        setRegion(regionData.data ?? null);
        setMissions(missionsData.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchRegion();
    }
  }, [params.slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10" aria-busy="true">
        <Skeleton className="h-9 w-40 rounded-md" />
        <Skeleton className="mt-8 h-10 w-1/2" />
        <Skeleton className="mt-3 h-5 w-1/3" />
        <Skeleton className="mt-8 h-28 w-full rounded-xl" />
        <Skeleton className="mt-10 h-7 w-48" />
        <div className="mt-6 space-y-3">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !region) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <EmptyState
          icon={Compass}
          title="Wilayah tidak ditemukan"
          description={
            error ??
            "Wilayah budaya ini belum dipublikasikan atau sudah dipindahkan."
          }
          action={{ label: "Kembali ke peta jelajah", href: "/explore" }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:py-14">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
        <Link href="/explore">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Jelajahi
        </Link>
      </Button>

      <header>
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MapPin className="size-6" aria-hidden="true" />
          </span>
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            {region.name}
          </h1>
        </div>
        <p className="mt-2 text-muted-foreground">{region.geographic_context}</p>
      </header>

      <div className="tenun my-8" aria-hidden="true" />

      <section aria-label="Tentang wilayah">
        <h2 className="font-display text-xl font-semibold">Tentang wilayah ini</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          {region.description}
        </p>
      </section>

      {/* Konten budaya dengan atribusi sumber */}
      {region.contents.length > 0 && (
        <section className="mt-14" aria-label="Tradisi dan cerita">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold">
              Tradisi & cerita
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Setiap tulisan bersumber tercatat — sentuh sumbernya untuk tahu
              rujukannya.
            </p>
          </Reveal>

          <div className="mt-6 space-y-5">
            {region.contents.map((content, index) => {
              const meta = contentTypeMeta[content.content_type] ?? contentTypeMeta.tradition;
              return (
                <Reveal key={content.id} delay={index * 80}>
                  <Card className="overflow-hidden">
                    <div className="border-b border-border bg-secondary/40 px-6 py-4">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <meta.icon className="size-4" aria-hidden="true" />
                        </span>
                        <p className="text-[13px] font-semibold text-primary">
                          {meta.label}
                        </p>
                      </div>
                      <h3 className="mt-2.5 font-display text-xl font-semibold leading-snug">
                        {content.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {content.description}
                      </p>
                    </div>
                    <div className="px-6 py-5">
                      {(content.body ?? "").split("\n\n").map((para, i) => (
                        <p
                          key={i}
                          className="mb-3 leading-relaxed text-foreground/85 last:mb-0"
                        >
                          {para}
                        </p>
                      ))}
                    </div>
                    {content.source && (
                      <div className="flex flex-wrap items-center gap-1.5 border-t border-border px-6 py-3.5 text-[12px] text-muted-foreground">
                        <BookMarked className="size-3.5 shrink-0" aria-hidden="true" />
                        <span>
                          Sumber: {content.source.title}
                          {content.source.publisher ? ` · ${content.source.publisher}` : ""}
                          {content.source.license ? ` · ${content.source.license}` : ""}
                        </span>
                      </div>
                    )}
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </section>
      )}

      <section className="mt-14" aria-label="Misi di wilayah ini">
        <Reveal>
          <h2 className="font-display text-2xl font-semibold">
            Misi di wilayah ini
          </h2>
        </Reveal>

        {missions.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={Gamepad2}
              title="Misi belum dibuka"
              description="Belum ada misi yang dipublikasikan untuk wilayah ini. Cek lagi nanti."
              action={{ label: "Lihat wilayah lain", href: "/explore" }}
            />
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {missions.map((mission, index) => (
              <li key={mission.id}>
                <Link href={`/missions/${mission.slug}`} className="group block">
                  <Reveal delay={index * 80}>
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
                              {difficultyLabel[mission.difficulty] ?? mission.difficulty}
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
                  </Reveal>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
