"use client";

import { useState } from "react";
import { CheckCircle2, RotateCcw, Sparkles, Zap } from "lucide-react";
import type { Lang } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

interface QuizOption {
  id: string;
  label: string;
  isCorrect: boolean;
  insight: { id: string; en: string };
}

const DEMO_OPTIONS: QuizOption[] = [
  {
    id: "parang-rusak",
    label: "Parang Rusak",
    isCorrect: true,
    insight: {
      id: "Tepat! Motif lereng ombak Parang Rusak melambangkan keteguhan jiwa dan semangat pantang menyerah.",
      en: "Spot on! Parang Rusak's diagonal wave motif symbolizes inner strength and unwavering perseverance.",
    },
  },
  {
    id: "kawung",
    label: "Kawung",
    isCorrect: false,
    insight: {
      id: "Hampir! Kawung bermotif empat kelopak buah aren yang melambangkan keselarasan. Jawaban tepatnya adalah Parang Rusak.",
      en: "Close! Kawung depicts four palm-fruit petals symbolizing harmony. The right answer is Parang Rusak.",
    },
  },
  {
    id: "semen-rama",
    label: "Semen Rama",
    isCorrect: false,
    insight: {
      id: "Menarik! Semen Rama berisi ajaran kepemimpinan Astabrata. Jawaban tepatnya adalah Parang Rusak.",
      en: "Nice guess! Semen Rama illustrates the eight virtues of leadership. The right answer is Parang Rusak.",
    },
  },
];

export interface HeroDemoQuizProps {
  lang: Lang;
  missionLabel: string;
  questionOf: string;
  question: string;
}

/**
 * Interactive mini-quiz card for the hero section so visitors can test a
 * cultural question directly above the fold before signing up.
 */
export function HeroDemoQuiz({
  lang,
  missionLabel,
  questionOf,
  question,
}: HeroDemoQuizProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedOption = DEMO_OPTIONS.find((opt) => opt.id === selectedId) ?? null;

  return (
    <div className="hero-card relative text-card-foreground md:translate-x-6">
      <div className="animate-float rounded-2xl border border-[#D4AF37]/25 bg-card p-6 shadow-raised">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[13px] font-medium text-muted-foreground">
            {missionLabel}
          </p>
          <p className="text-[13px] tabular-nums text-muted-foreground">
            {selectedOption
              ? lang === "id"
                ? "Selesai · 2 / 2"
                : "Done · 2 / 2"
              : questionOf}
          </p>
        </div>

        <div
          className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-muted"
          role="presentation"
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              selectedOption ? "w-full bg-[#D4AF37]" : "w-1/2 bg-primary"
            )}
          />
        </div>

        <p className="font-display text-lg font-semibold leading-snug">
          {question}
        </p>

        <div
          className="mt-4 grid gap-2"
          role="radiogroup"
          aria-label={missionLabel}
        >
          {DEMO_OPTIONS.map((option) => {
            const isSelected = selectedId === option.id;
            const showCorrect = Boolean(selectedOption) && option.isCorrect;

            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setSelectedId(option.id)}
                className={cn(
                  "flex items-center justify-between rounded-lg border px-4 py-2.5 text-left text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]",
                  !selectedOption &&
                    (option.id === "parang-rusak"
                      ? "border-primary/40 bg-primary/10 text-primary hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/10"
                      : "border-border bg-card text-foreground/85 hover:border-primary/40 hover:bg-secondary/60"),
                  selectedOption &&
                    showCorrect &&
                    "border-[#D4AF37] bg-[#D4AF37]/15 text-foreground",
                  selectedOption &&
                    isSelected &&
                    !option.isCorrect &&
                    "border-destructive/50 bg-destructive/10 text-foreground",
                  selectedOption &&
                    !isSelected &&
                    !showCorrect &&
                    "border-border/60 bg-card/60 text-muted-foreground opacity-70"
                )}
              >
                <span>{option.label}</span>
                {showCorrect ? (
                  <CheckCircle2
                    className="size-4 shrink-0 text-[#D4AF37]"
                    aria-hidden="true"
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        {selectedOption ? (
          <div className="mt-4 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 p-3 text-xs leading-relaxed text-foreground">
            <div className="flex items-start gap-2">
              <Sparkles
                className="mt-0.5 size-3.5 shrink-0 text-[#D4AF37]"
                aria-hidden="true"
              />
              <p className="flex-1">{selectedOption.insight[lang]}</p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <RotateCcw className="size-3" aria-hidden="true" />
              <span>{lang === "id" ? "Coba pilih lagi" : "Try again"}</span>
            </button>
          </div>
        ) : null}
      </div>

      <div
        className={cn(
          "hero-xp absolute -right-3 -top-3 flex items-center gap-1.5 rounded-full border bg-card px-3.5 py-2 shadow-card transition-all duration-300 md:-right-6",
          selectedOption?.isCorrect
            ? "scale-105 border-[#D4AF37] shadow-[0_8px_20px_-6px_rgba(212,175,55,0.45)]"
            : "border-border"
        )}
      >
        <Zap className="size-4 text-gold" aria-hidden="true" />
        <span className="text-sm font-semibold tabular-nums">+150 XP</span>
      </div>
    </div>
  );
}
