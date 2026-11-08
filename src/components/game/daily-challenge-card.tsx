"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Check, Flame, Zap } from "lucide-react";
import { useI18n, formatNumber } from "@/lib/i18n";
import { shellDict as d } from "@/lib/i18n/dict/shell";

type Daily = {
  date: string;
  bonusXp: number;
  completed: boolean;
  mission: {
    id: string;
    slug: string;
    title: string;
    description: string;
    xp_reward: number;
    difficulty: string;
  } | null;
  streak: {
    current_streak: number;
    longest_streak: number;
    last_activity_date: string | null;
  } | null;
};

export function DailyChallengeCard() {
  const [daily, setDaily] = useState<Daily | null>(null);
  const { lang, t } = useI18n();

  useEffect(() => {
    fetch("/api/v1/daily", { cache: "no-store" })
      .then((response) => response.json())
      .then((json) => setDaily(json.data ?? null))
      .catch(() => setDaily(null));
  }, []);

  if (!daily?.mission) return null;

  return (
    <Card className="group mt-4 border-gold/30 bg-gold/5 hover:border-gold/50 hover:shadow-raised">
      <div className="flex flex-wrap items-center gap-4 p-5">
        <span className="flex size-11 items-center justify-center rounded-xl bg-gold/15 text-gold transition-transform duration-200 group-hover:scale-105 group-hover:rotate-3">
          <CalendarCheck className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t(d.dailyTitle)}
          </p>
          <p className="truncate font-display text-lg font-semibold">
            {daily.mission.title}
          </p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            <Zap className="inline size-3.5 text-gold" aria-hidden="true" />{" "}
            {t(d.dailyBonus, { xp: formatNumber(daily.bonusXp, lang) })}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {daily.streak && daily.streak.current_streak > 0 && (
            <span className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium">
              <Flame className="size-4 text-orange-500" aria-hidden="true" />
              {t(d.dailyStreakDays, { n: formatNumber(daily.streak.current_streak, lang) })}
            </span>
          )}
          {daily.completed ? (
            <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
              <Check className="size-4" aria-hidden="true" />
              {t(d.dailyCompleted)}
            </span>
          ) : (
            <Button asChild size="sm">
              <Link href={`/missions/${daily.mission.slug}`}>{t(d.dailyPlay)}</Link>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
