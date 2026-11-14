"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { playerDict } from "@/lib/i18n/dict/player";
import {
  Sparkles,
  Gamepad2,
  RotateCcw,
  BookOpen,
  Languages,
  Zap,
  ArrowRight,
  Lightbulb,
} from "lucide-react";
import type { PersonalizedRecommendation } from "@/lib/recommendations";

interface PersonalizedRecommendationsProps {
  recommendations: PersonalizedRecommendation[];
}

export function PersonalizedRecommendations({
  recommendations,
}: PersonalizedRecommendationsProps) {
  const { t } = useI18n();

  if (recommendations.length === 0) return null;

  const iconMap = {
    gamepad: Gamepad2,
    rotate: RotateCcw,
    book: BookOpen,
    languages: Languages,
    zap: Zap,
    star: Sparkles,
  };

  const badgeStyles = {
    default: "bg-primary/10 text-primary border-primary/20",
    gold: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    urgent: "bg-destructive/15 text-destructive border-destructive/30",
    success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  };

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5 text-gold" aria-hidden="true" />
            {t(playerDict.personalizedBadge)}
          </span>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight">
            {t(playerDict.personalizedTitle)}
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t(playerDict.personalizedExplainer)}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {recommendations.map((rec) => {
          const IconComponent = iconMap[rec.iconName] || Sparkles;
          const badgeStyle = badgeStyles[rec.badgeVariant || "default"];

          return (
            <Card
              key={rec.id}
              interactive
              className="flex flex-col justify-between p-5 transition-[border-color,box-shadow] duration-200 hover:border-primary/40"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${badgeStyle}`}
                  >
                    {rec.badge}
                  </span>
                  {rec.xpReward && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-gold">
                      <Zap className="size-3.5 text-gold" aria-hidden="true" />
                      +{rec.xpReward} XP
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <IconComponent className="size-4.5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-base font-bold text-foreground leading-snug">
                      {rec.title}
                    </h3>
                    <p className="truncate text-xs text-muted-foreground">
                      {rec.subtitle}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-muted-foreground line-clamp-3">
                  {rec.description}
                </p>

                <p className="mt-2 flex items-start gap-1.5 text-[11px] text-primary/80 italic">
                  <Lightbulb
                    className="mt-px size-3.5 shrink-0 not-italic"
                    aria-hidden="true"
                  />
                  <span>{rec.reason}</span>
                </p>
              </div>

              <div className="mt-5 border-t border-border/60 pt-3">
                <Button asChild size="sm" className="w-full gap-1.5 text-xs">
                  <Link href={rec.href}>
                    {rec.actionLabel}
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
