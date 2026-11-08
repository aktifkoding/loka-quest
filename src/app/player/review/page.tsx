"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useI18n } from "@/lib/i18n";
import { playerDict } from "@/lib/i18n/dict/player";
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Compass,
  Zap,
  TrendingUp,
  Brain,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import type { AdaptiveProfile } from "@/lib/adaptive";

type ReviewItem = {
  question_id: string;
  mission_id: string;
  due_at: string;
  interval_days: number;
  mission: { slug: string; title: string } | { slug: string; title: string }[] | null;
  question: {
    prompt: string;
    question_type: string;
    options: Record<string, unknown>;
  } | {
    prompt: string;
    question_type: string;
    options: Record<string, unknown>;
  }[] | null;
};

const difficultyStyles: Record<string, string> = {
  beginner: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  intermediate: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  advanced: "text-purple-600 dark:text-purple-400 bg-purple-500/10",
};

const difficultyLabels: Record<string, typeof playerDict.difficultyBeginner> = {
  beginner: playerDict.difficultyBeginner,
  intermediate: playerDict.difficultyIntermediate,
  advanced: playerDict.difficultyAdvanced,
};

const difficultyShortLabels: Record<string, typeof playerDict.difficultyShortBeginner> = {
  beginner: playerDict.difficultyShortBeginner,
  intermediate: playerDict.difficultyShortIntermediate,
  advanced: playerDict.difficultyShortAdvanced,
};

const stageLabels: Record<string, typeof playerDict.stageFondasi> = {
  fondasi: playerDict.stageFondasi,
  eksplorasi: playerDict.stageEksplorasi,
  maestro: playerDict.stageMaestro,
};

export default function ReviewPage() {
  const { t } = useI18n();
  const [activeView, setActiveView] = useState<"queue" | "adaptive">("queue");
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [adaptive, setAdaptive] = useState<AdaptiveProfile | null>(null);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [result, setResult] = useState<boolean | null>(null);
  const [done, setDone] = useState(0);

  const load = useCallback(async () => {
    try {
      const [reviewRes, adaptiveRes] = await Promise.all([
        fetch("/api/v1/review", { cache: "no-store" }),
        fetch("/api/v1/adaptive", { cache: "no-store" }),
      ]);

      const reviewJson = await reviewRes.json();
      const adaptiveJson = await adaptiveRes.json();

      if (reviewRes.ok) {
        setItems(reviewJson.data ?? []);
        setIndex(0);
      }
      if (adaptiveRes.ok) {
        setAdaptive(adaptiveJson.data ?? null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function answer(questionId: string, value: string) {
    setFeedback(null);
    const response = await fetch("/api/v1/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId, answer: { selected: value } }),
    });
    const json = await response.json();
    if (!response.ok) {
      setFeedback(json.error || t(playerDict.errorSaveAnswer));
      return;
    }
    setResult(json.data.isCorrect);
    setFeedback(json.data.explanation || null);
    setDone((count) => count + 1);
  }

  function next() {
    setResult(null);
    setFeedback(null);
    setIndex((current) => current + 1);
  }

  const item = items[index];
  const question = Array.isArray(item?.question) ? item.question[0] : item?.question;
  const mission = Array.isArray(item?.mission) ? item.mission[0] : item?.mission;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:py-14">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
        <Link href="/player/dashboard">
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t(playerDict.dashboard)}
        </Link>
      </Button>

      <header>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-semibold tracking-tight">
              {t(playerDict.reviewTitle)}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {t(playerDict.reviewIntro)}
            </p>
          </div>
          {adaptive && (
            <span
              className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
                difficultyStyles[adaptive.recommendedDifficulty] ?? "bg-secondary text-foreground"
              }`}
            >
              {t(playerDict.recommendedLevel, {
                label: t(difficultyLabels[adaptive.recommendedDifficulty] ?? playerDict.difficultyShortBeginner),
              })}
            </span>
          )}
        </div>

        {/* View Switcher Tabs */}
        <div className="mt-8 flex border-b border-border">
          <button
            onClick={() => setActiveView("queue")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
              activeView === "queue"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            {t(playerDict.queueTab, { n: items.length })}
          </button>
          <button
            onClick={() => setActiveView("adaptive")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
              activeView === "adaptive"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Brain className="size-4" aria-hidden="true" />
            {t(playerDict.adaptiveTab)}
          </button>
        </div>
      </header>

      {/* ADAPTIVE VIEW */}
      {activeView === "adaptive" && adaptive && (
        <div className="mt-8 space-y-8 animate-fade-in">
          {/* Diagnostic Metrics */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-5 border-primary/20 bg-primary/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{t(playerDict.difficultyLevelLabel)}</span>
                <Compass className="size-4 text-primary" aria-hidden="true" />
              </div>
              <p className="mt-2 font-display text-2xl font-bold text-foreground">
                {t(difficultyShortLabels[adaptive.recommendedDifficulty] ?? playerDict.difficultyShortBeginner)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t(playerDict.stagePrefix, { stage: t(stageLabels[adaptive.learningStage] ?? playerDict.stageFondasi) })}
              </p>
            </Card>

            <Card className="p-5 border-border bg-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{t(playerDict.retentionLabel)}</span>
                <Brain className="size-4 text-emerald-500" aria-hidden="true" />
              </div>
              <p className="mt-2 font-display text-2xl font-bold tabular-nums text-foreground">
                {adaptive.retentionScore}%
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t(playerDict.retentionCaption)}
              </p>
            </Card>

            <Card className="p-5 border-border bg-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{t(playerDict.accuracyLabel)}</span>
                <TrendingUp className="size-4 text-gold" aria-hidden="true" />
              </div>
              <p className="mt-2 font-display text-2xl font-bold tabular-nums text-foreground">
                {adaptive.recentAverageScore}%
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t(playerDict.accuracyCaption, { n: adaptive.totalAttempts })}
              </p>
            </Card>
          </div>

          {/* Dynamic Adjustment Reason */}
          <div className="rounded-2xl border border-primary/25 bg-secondary/50 p-5">
            <div className="flex items-start gap-3">
              <Sparkles className="size-5 text-gold shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {t(playerDict.evaluationLabel)}
                </p>
                <p className="mt-1 text-sm font-medium text-foreground/90">
                  {adaptive.adjustmentReason}
                </p>
              </div>
            </div>
          </div>

          {/* Recommended Progression Steps */}
          <div>
            <h3 className="font-display text-xl font-bold">{t(playerDict.nextStepsTitle)}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t(playerDict.nextStepsDesc)}
            </p>

            <div className="mt-4 space-y-3">
              {adaptive.path.map((step, idx) => (
                <Card
                  key={step.id}
                  interactive
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5"
                >
                  <div className="flex items-start gap-3.5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold text-foreground">{step.title}</h4>
                        {step.priority === "urgent" && (
                          <span className="rounded-md bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">
                            {t(playerDict.priorityUrgent)}
                          </span>
                        )}
                        <span className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          {t(difficultyShortLabels[step.difficulty] ?? playerDict.difficultyShortBeginner)}
                        </span>
                        {step.xpRewardEstimate && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gold">
                            <Zap className="size-3" aria-hidden="true" />
                            +{step.xpRewardEstimate} XP
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{step.description}</p>
                      <p className="mt-1 text-[11px] text-primary/80 italic">
                        {t(playerDict.reasonPrefix, { reason: step.reason })}
                      </p>
                    </div>
                  </div>

                  <Button asChild size="sm" className="gap-1.5 shrink-0">
                    <Link href={step.href}>
                      {t(playerDict.startCta)}
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* QUEUE VIEW (Spaced Repetition) */}
      {activeView === "queue" && (
        <div className="mt-8 animate-fade-in max-w-2xl mx-auto">
          {loading ? (
            <p className="mt-10 text-sm text-muted-foreground">{t(playerDict.loadingQueue)}</p>
          ) : !item ? (
            <div className="mt-10">
              <EmptyState
                icon={RotateCcw}
                title={done > 0 ? t(playerDict.reviewDoneTitle) : t(playerDict.reviewQueueEmptyTitle)}
                description={
                  done > 0
                    ? t(playerDict.reviewDoneDesc, { n: done })
                    : t(playerDict.reviewQueueEmptyDesc)
                }
                action={{ label: t(playerDict.goToList), href: "/missions" }}
              />
            </div>
          ) : (
            <Card className="p-6">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {t(playerDict.questionCounter, { n: index + 1, total: items.length })}
                </span>
                <span>{mission?.title ?? t(playerDict.missionFallback)}</span>
              </div>
              <h2 className="mt-4 font-display text-xl font-semibold">
                {question?.prompt}
              </h2>

              <div className="mt-6 space-y-3">
                {(() => {
                  const options = question?.options ?? {};
                  const choices =
                    (options.choices as string[]) ??
                    (options.instruments as string[]) ??
                    [];
                  if (
                    question?.question_type === "matching" ||
                    question?.question_type === "sequencing"
                  ) {
                    return (
                      <p className="text-sm text-muted-foreground">
                        {t(playerDict.openInMissionNotice)}{" "}
                        <Link
                          href={`/missions/${mission?.slug ?? ""}`}
                          className="text-primary underline"
                        >
                          {t(playerDict.openMissionLink)}
                        </Link>
                      </p>
                    );
                  }
                  return choices.map((choice) => (
                    <button
                      key={choice}
                      type="button"
                      disabled={result !== null}
                      onClick={() => answer(item.question_id, choice)}
                      className="w-full rounded-xl border border-border px-4 py-3 text-left text-sm transition-colors hover:border-primary/50 hover:bg-secondary/50 disabled:opacity-60"
                    >
                      {choice}
                    </button>
                  ));
                })()}
              </div>

              {result !== null && (
                <div className="mt-6 rounded-xl bg-secondary/60 p-4">
                  <p className="flex items-center gap-2 font-medium">
                    {result ? (
                      <>
                        <CheckCircle2 className="size-5 text-primary" aria-hidden="true" />
                        {t(playerDict.correctFeedback)}
                      </>
                    ) : (
                      <>
                        <XCircle className="size-5 text-destructive" aria-hidden="true" />
                        {t(playerDict.wrongFeedback)}
                      </>
                    )}
                  </p>
                  {feedback && (
                    <p className="mt-2 text-sm text-muted-foreground">{feedback}</p>
                  )}
                  <Button className="mt-4" onClick={next}>
                    {t(playerDict.nextButton)}
                  </Button>
                </div>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
