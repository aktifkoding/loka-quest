"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n, type Localized } from "@/lib/i18n";
import { gameDict as d } from "@/lib/i18n/dict/game";
import { commonDict } from "@/lib/i18n/dict/common";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Gamepad2, ArrowRight, Zap, Sparkles, Search, X } from "lucide-react";

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

export default function MissionsPage() {
  const { t } = useI18n();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [recommendedDiff, setRecommendedDiff] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const [missionsRes, adaptiveRes] = await Promise.all([
          fetch("/api/v1/missions?limit=100"),
          fetch("/api/v1/adaptive").catch(() => null),
        ]);
        const result = await missionsRes.json();

        if (!missionsRes.ok) {
          throw new Error(result.error || t(d.errorLoadMissions));
        }

        setMissions(result.data || []);

        if (adaptiveRes && adaptiveRes.ok) {
          const adaptiveData = await adaptiveRes.json();
          if (adaptiveData.success && adaptiveData.data?.recommendedDifficulty) {
            setRecommendedDiff(adaptiveData.data.recommendedDifficulty);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t(commonDict.errorGeneric));
      } finally {
        setLoading(false);
      }
    };

    fetchMissions();
  }, [t]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:py-14">
      <PageHeader
        icon={Gamepad2}
        title={t(d.missionsTitle)}
        description={t(d.missionsIntro)}
      />

      <div className="mt-10">
        {loading ? (
          <div
            className="space-y-3"
            aria-busy="true"
            aria-label={t(d.loadingMissionsAria)}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-xl border border-border/70 px-6 py-5"
              >
                <Skeleton className="size-11 rounded-xl" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="mt-2 h-4 w-2/3" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        ) : error ? (
          <EmptyState
            icon={Gamepad2}
            title={t(d.missionsLoadFailedTitle)}
            description={error}
          />
        ) : missions.length === 0 ? (
          <EmptyState
            icon={Gamepad2}
            title={t(d.emptyMissionsTitle)}
            description={t(d.emptyMissionsDesc)}
            action={{ label: t(d.exploreRegionsCta), href: "/explore" }}
          />
        ) : (
          (() => {
            const normalizedQuery = query.trim().toLowerCase();
            const filteredMissions = missions.filter((m) => {
              const matchesDiff =
                difficultyFilter === "all" || m.difficulty === difficultyFilter;
              const matchesQuery =
                !normalizedQuery ||
                m.title.toLowerCase().includes(normalizedQuery) ||
                m.description.toLowerCase().includes(normalizedQuery);
              return matchesDiff && matchesQuery;
            });

            const filterPills: { key: string; label: Localized }[] = [
              { key: "all", label: { id: "Semua", en: "All" } },
              { key: "beginner", label: d.difficultyBeginner },
              { key: "intermediate", label: d.difficultyIntermediate },
              { key: "advanced", label: d.difficultyAdvanced },
            ];

            return (
              <div className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div
                    className="flex flex-wrap items-center gap-1.5"
                    role="group"
                    aria-label={t({ id: "Filter tingkat kesulitan", en: "Filter by difficulty" })}
                  >
                    {filterPills.map((pill) => {
                      const active = difficultyFilter === pill.key;
                      return (
                        <button
                          key={pill.key}
                          type="button"
                          aria-pressed={active}
                          onClick={() => setDifficultyFilter(pill.key)}
                          className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                            active
                              ? "border-[#D4AF37] bg-[#D4AF37]/15 text-foreground"
                              : "border-border bg-card text-muted-foreground hover:border-[#D4AF37]/50 hover:text-foreground"
                          }`}
                        >
                          {t(pill.label)}
                        </button>
                      );
                    })}
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search
                      className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={t({ id: "Cari misi budaya...", en: "Search cultural missions..." })}
                      aria-label={t({ id: "Cari misi", en: "Search missions" })}
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

                {filteredMissions.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="font-medium">
                      {t({ id: "Tidak ada misi yang cocok.", en: "No matching missions found." })}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setDifficultyFilter("all");
                        setQuery("");
                      }}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/50 px-4 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-[#D4AF37]/15"
                    >
                      {t({ id: "Reset filter", en: "Reset filters" })}
                    </button>
                  </Card>
                ) : (
                  <ul className="space-y-3">
                    {filteredMissions.map((mission, index) => (
                      <li key={mission.id}>
                        <Link href={`/missions/${mission.slug}`} className="group block">
                          <Card
                            interactive
                            className="animate-fade-up"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <div className="flex items-center gap-4 px-6 py-5">
                              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-[#D4AF37]/15 group-hover:text-[#9C6B3B] dark:group-hover:text-[#D4AF37]">
                                <Gamepad2 className="size-5" aria-hidden="true" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-semibold">{mission.title}</p>
                                  {recommendedDiff && mission.difficulty === recommendedDiff && (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                                      <Sparkles className="size-3 text-gold" aria-hidden="true" />
                                      {t(d.adaptiveBadge)}
                                    </span>
                                  )}
                                </div>
                                <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                                  {mission.description}
                                </p>
                                <p className="mt-1.5 flex items-center gap-2 text-[13px] text-muted-foreground">
                                  <span>
                                    {difficultyLabel[mission.difficulty]
                                      ? t(difficultyLabel[mission.difficulty])
                                      : mission.difficulty}
                                  </span>
                                  <span aria-hidden="true">·</span>
                                  <span className="inline-flex items-center gap-1 font-semibold tabular-nums text-gold">
                                    <Zap className="size-3.5" aria-hidden="true" />
                                    {mission.xp_reward} XP
                                  </span>
                                </p>
                              </div>
                              <ArrowRight
                                className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#D4AF37]"
                                aria-hidden="true"
                              />
                            </div>
                          </Card>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
}
