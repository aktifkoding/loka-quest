"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { PhaserGameProps } from "@/components/game/phaser-game";
import { useI18n, type Localized } from "@/lib/i18n";
import { gameDict as d } from "@/lib/i18n/dict/game";
import { commonDict } from "@/lib/i18n/dict/common";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowLeft, Loader2, CheckCircle2, XCircle, Zap, Gamepad2, Trophy, Gem } from "lucide-react";
import { Confetti } from "@/components/ui/confetti";
import { MissionMediaGuide } from "@/components/game/mission-media-guide";

interface Mission {
  id: string;
  slug: string;
  title: string;
  description: string;
  learning_objectives: string[];
  difficulty: string;
  xp_reward: number;
}

interface Question {
  id: string;
  question_type: string;
  prompt: string;
  options: Record<string, unknown>;
  explanation?: string;
  sort_order: number;
}

interface EarnedAchievement {
  slug: string;
  title: string;
  description: string;
  icon: string;
  xpBonus: number;
}

interface EarnedArtifact {
  name: string;
  description: string;
  rarity: string;
  imageUrl: string | null;
}

interface AttemptResult {
  score: number;
  xpEarned: number;
  correctCount: number;
  totalQuestions: number;
  newTotalXp: number;
  newLevel: number;
  results: {
    questionId: string;
    isCorrect: boolean;
    explanation: string | null;
  }[];
  earnedAchievements?: EarnedAchievement[];
  earnedArtifact?: EarnedArtifact | null;
}

const rarityLabel: Record<string, Localized> = {
  common: d.rarityCommon,
  uncommon: d.rarityUncommon,
  rare: d.rarityRare,
  legendary: d.rarityLegendary,
};

const difficultyLabel: Record<string, Localized> = {
  beginner: d.difficultyBeginner,
  intermediate: d.difficultyIntermediate,
  advanced: d.difficultyAdvanced,
};

/** Spinner saat chunk Phaser dimuat — komponen agar bisa memakai useI18n. */
function GameLoading() {
  const { t } = useI18n();
  return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="size-8 animate-spin text-primary" aria-label={t(d.loadingGameAria)} />
    </div>
  );
}

// Phaser touches window on import — client only
const PhaserGame = dynamic(
  () => import("@/components/game/phaser-game").then((mod) => mod.PhaserGame),
  {
    ssr: false,
    loading: () => <GameLoading />,
  }
) as unknown as ComponentType<PhaserGameProps>;

export default function MissionPage() {
  const params = useParams();
  const { lang, t } = useI18n();
  const [mission, setMission] = useState<Mission | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loginRequiredMsg = t(d.loginRequired);

  const fetchMission = useCallback(async () => {
    try {
      const [missionRes, questionsRes] = await Promise.all([
        fetch(`/api/v1/missions/${params.id}`),
        fetch(`/api/v1/missions/${params.id}/questions`),
      ]);

      const missionData = await missionRes.json();
      const questionsData = await questionsRes.json();

      if (!missionRes.ok) {
        throw new Error(missionData.error || t(d.errorLoadMissions));
      }

      setMission(missionData.data ?? null);
      setQuestions(questionsData.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t(commonDict.errorGeneric));
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchMission();
    }
  }, [params.id, fetchMission]);

  const handleGameComplete = async (
    answers: { questionId: string; answer: Record<string, unknown> }[]
  ) => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/v1/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionId: mission?.id, answers }),
      });

      const resultJson = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setSubmitError(loginRequiredMsg);
          return;
        }
        throw new Error(resultJson.error || t(d.errorSubmitMission));
      }

      setResult(resultJson.data);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t(d.errorSubmitMission));
    } finally {
      setSubmitting(false);
    }
  };

  const promptOf = (questionId: string) =>
    questions.find((q) => q.id === questionId)?.prompt ?? t(d.questionFallback);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10" aria-busy="true">
        <Skeleton className="h-9 w-32 rounded-md" />
        <Skeleton className="mt-8 h-10 w-2/3" />
        <Skeleton className="mt-3 h-5 w-full max-w-lg" />
        <Skeleton className="mt-8 aspect-[4/3] w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !mission) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <EmptyState
          icon={Gamepad2}
          title={t(d.missionNotFoundTitle)}
          description={error ?? t(d.missionNotFoundDesc)}
          action={{ label: t(d.seeAllMissions), href: "/missions" }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:py-14">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
        <Link href="/missions">
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t(d.backToMissions)}
        </Link>
      </Button>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {mission.title}
          </h1>
          <p className="mt-2 max-w-xl leading-relaxed text-muted-foreground">
            {mission.description}
          </p>
        </div>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            {difficultyLabel[mission.difficulty]
              ? t(difficultyLabel[mission.difficulty])
              : mission.difficulty}
          </span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1 font-semibold tabular-nums text-gold">
            <Zap className="size-4" aria-hidden="true" />
            {mission.xp_reward} XP
          </span>
        </p>
      </header>

      <div className="tenun my-8" aria-hidden="true" />

      <div className="mb-6">
        <MissionMediaGuide missionSlug={mission.slug} />
      </div>

      {submitting && (
        <Card className="px-6 py-16 text-center" aria-busy="true">
          <Loader2
            className="mx-auto size-8 animate-spin text-primary"
            aria-hidden="true"
          />
          <p className="mt-4 font-medium">{t(d.gradingTitle)}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t(d.gradingBody)}
          </p>
        </Card>
      )}

      {!gameStarted && !result && !submitting && (
        <Card>
          <div className="px-6 py-8 text-center sm:px-10 sm:py-10">
            <h2 className="font-display text-2xl font-semibold">
              {t(d.readyTitle)}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              {t(d.readyBody, { count: questions.length })}
            </p>
            {submitError && (
              <div
                role="alert"
                className="mx-auto mt-5 max-w-md rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {submitError}
              </div>
            )}
            <Button size="lg" onClick={() => setGameStarted(true)} className="mt-6">
              {t(d.startMissionCta)}
            </Button>
            {submitError === loginRequiredMsg && (
              <p className="mt-3 text-sm">
                <Link
                  href="/auth/login"
                  className="font-medium text-primary hover:underline"
                >
                  {t(d.signInNow)}
                </Link>
              </p>
            )}
          </div>
        </Card>
      )}

      {gameStarted && !result && !submitting && (
        <div className="phaser-container">
          <PhaserGame
            mission={mission}
            questions={questions}
            onComplete={handleGameComplete}
            lang={lang}
          />
        </div>
      )}

          {result && (
            <div className="animate-fade-up space-y-6">
              <Confetti count={result.earnedAchievements?.length ? 90 : 50} />
              <Card>
                <div className="px-6 py-8 text-center sm:px-10">
                  <h2 className="font-display text-2xl font-semibold">
                    {t(d.missionComplete)}
                  </h2>
                  <p className="mt-5 font-display text-5xl font-semibold tabular-nums">
                    {result.score}
                    <span className="text-2xl text-muted-foreground">/100</span>
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t(d.correctCount, {
                      correct: result.correctCount,
                      total: result.totalQuestions,
                    })}
                  </p>
                  <div className="mx-auto mt-5 flex w-fit items-center gap-1.5 rounded-full bg-gold/10 px-4 py-2">
                    <Zap className="size-4 text-gold" aria-hidden="true" />
                    <span className="text-sm font-semibold tabular-nums">
                      +{result.xpEarned} XP
                    </span>
                    <span className="text-sm text-muted-foreground" aria-hidden="true">
                      ·
                    </span>
                    <span className="text-sm tabular-nums text-muted-foreground">
                      {t(d.totalXpLevel, { xp: result.newTotalXp, level: result.newLevel })}
                    </span>
                  </div>
                  <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setResult(null);
                        setGameStarted(false);
                        setSubmitError(null);
                      }}
                    >
                      {t(d.playAgain)}
                    </Button>
                    <Button asChild>
                      <Link href="/player/dashboard">{t(d.viewDashboard)}</Link>
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Reveal: lencana baru */}
              {result.earnedAchievements && result.earnedAchievements.length > 0 && (
                <Card className="border-gold/40 bg-gold/5">
                  <div className="p-6">
                    <h3 className="font-display text-xl font-semibold">
                      {t(d.newBadgeTitle)}
                    </h3>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      {result.earnedAchievements.map((badge) => (
                        <div
                          key={badge.slug}
                          className="flex items-center gap-4 rounded-xl border border-gold/30 bg-card p-4"
                        >
                          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gold/15 text-2xl">
                            {badge.icon}
                          </span>
                          <div className="min-w-0">
                            <p className="flex items-center gap-2 font-semibold">
                              {badge.title}
                              <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-gold">
                                +{badge.xpBonus} XP
                              </span>
                            </p>
                            <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">
                              {badge.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {/* Reveal: artefak budaya */}
              {result.earnedArtifact && (
                <Card className="border-primary/30 bg-primary/5">
                  <div className="flex items-center gap-4 p-6">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Gem className="size-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 font-semibold">
                        {t(d.newArtifact, { name: result.earnedArtifact.name })}
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                          {rarityLabel[result.earnedArtifact.rarity]
                            ? t(rarityLabel[result.earnedArtifact.rarity])
                            : result.earnedArtifact.rarity}
                        </span>
                      </p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {result.earnedArtifact.description}
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm" className="shrink-0">
                      <Link href="/player/collection">
                        <Trophy className="size-4" aria-hidden="true" />
                        {t(d.collectionCta)}
                      </Link>
                    </Button>
                  </div>
                </Card>
              )}

          <Card>
            <div className="px-6 py-6">
              <h3 className="font-display text-xl font-semibold">{t(d.discussionTitle)}</h3>
              <ul className="mt-5 space-y-4">
                {result.results.map((r, index) => (
                  <li
                    key={`${r.questionId}-${index}`}
                    className="flex gap-3 rounded-xl bg-secondary/60 p-4"
                  >
                    {r.isCorrect ? (
                      <CheckCircle2
                        className="mt-0.5 size-5 shrink-0 text-primary"
                        aria-label={t(d.correctAria)}
                      />
                    ) : (
                      <XCircle
                        className="mt-0.5 size-5 shrink-0 text-destructive"
                        aria-label={t(d.incorrectAria)}
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {promptOf(r.questionId)}
                      </p>
                      {r.explanation && (
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                          {r.explanation}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
