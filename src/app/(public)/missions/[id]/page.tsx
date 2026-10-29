"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowLeft, Loader2, CheckCircle2, XCircle, Zap, Gamepad2 } from "lucide-react";

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
  explanation: string;
  sort_order: number;
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
}

const difficultyLabel: Record<string, string> = {
  beginner: "Pemula",
  intermediate: "Menengah",
  advanced: "Lanjutan",
};

// Phaser touches window on import — client only
const PhaserGame = dynamic(
  () => import("@/components/game/phaser-game").then((mod) => mod.PhaserGame),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" aria-label="Memuat permainan" />
      </div>
    ),
  }
) as React.ComponentType<{
  mission: { id: string; title: string; xp_reward: number };
  questions: {
    id: string;
    question_type: string;
    prompt: string;
    options: Record<string, unknown>;
    explanation: string;
  }[];
  onComplete: (answers: { questionId: string; answer: Record<string, unknown> }[]) => void;
}>;

export default function MissionPage() {
  const params = useParams();
  const [mission, setMission] = useState<Mission | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchMission = useCallback(async () => {
    try {
      const [missionRes, questionsRes] = await Promise.all([
        fetch(`/api/v1/missions/${params.id}`),
        fetch(`/api/v1/missions/${params.id}/questions`),
      ]);

      const missionData = await missionRes.json();
      const questionsData = await questionsRes.json();

      if (!missionRes.ok) {
        throw new Error(missionData.error || "Gagal memuat misi");
      }

      setMission(missionData.data ?? null);
      setQuestions(questionsData.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
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
          setSubmitError("Masuk dulu agar nilai dan XP-mu tersimpan.");
          return;
        }
        throw new Error(resultJson.error || "Gagal mengirim misi");
      }

      setResult(resultJson.data);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Gagal mengirim misi");
    } finally {
      setSubmitting(false);
    }
  };

  const promptOf = (questionId: string) =>
    questions.find((q) => q.id === questionId)?.prompt ?? "Pertanyaan";

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
          title="Misi tidak ditemukan"
          description={
            error ??
            "Misi ini belum dipublikasikan atau tautannya salah."
          }
          action={{ label: "Lihat semua misi", href: "/missions" }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:py-14">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
        <Link href="/missions">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Misi
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
          <span>{difficultyLabel[mission.difficulty] ?? mission.difficulty}</span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1 font-semibold tabular-nums text-gold">
            <Zap className="size-4" aria-hidden="true" />
            {mission.xp_reward} XP
          </span>
        </p>
      </header>

      <div className="tenun my-8" aria-hidden="true" />

      {submitting && (
        <Card className="px-6 py-16 text-center" aria-busy="true">
          <Loader2
            className="mx-auto size-8 animate-spin text-primary"
            aria-hidden="true"
          />
          <p className="mt-4 font-medium">Server sedang menilai jawabanmu…</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Sebentar saja, hasil dan pembahasan muncul di sini.
          </p>
        </Card>
      )}

      {!gameStarted && !result && !submitting && (
        <Card>
          <div className="px-6 py-8 text-center sm:px-10 sm:py-10">
            <h2 className="font-display text-2xl font-semibold">
              Siap memulai?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              {questions.length} tantangan menantimu. Kamu bisa berhenti kapan
              saja, tapi nilai baru tercatat setelah semua soal dijawab.
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
              Mulai misi
            </Button>
            {submitError === "Masuk dulu agar nilai dan XP-mu tersimpan." && (
              <p className="mt-3 text-sm">
                <Link
                  href="/auth/login"
                  className="font-medium text-primary hover:underline"
                >
                  Masuk sekarang
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
          />
        </div>
      )}

      {result && (
        <div className="animate-fade-up space-y-6">
          <Card>
            <div className="px-6 py-8 text-center sm:px-10">
              <h2 className="font-display text-2xl font-semibold">
                Misi selesai
              </h2>
              <p className="mt-5 font-display text-5xl font-semibold tabular-nums">
                {result.score}
                <span className="text-2xl text-muted-foreground">/100</span>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {result.correctCount} dari {result.totalQuestions} jawaban benar
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
                  Total {result.newTotalXp} XP, Level {result.newLevel}
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
                  Mainkan lagi
                </Button>
                <Button asChild>
                  <Link href="/player/dashboard">Lihat dasbor</Link>
                </Button>
              </div>
            </div>
          </Card>

          <Card>
            <div className="px-6 py-6">
              <h3 className="font-display text-xl font-semibold">Pembahasan</h3>
              <ul className="mt-5 space-y-4">
                {result.results.map((r, index) => (
                  <li
                    key={`${r.questionId}-${index}`}
                    className="flex gap-3 rounded-xl bg-secondary/60 p-4"
                  >
                    {r.isCorrect ? (
                      <CheckCircle2
                        className="mt-0.5 size-5 shrink-0 text-primary"
                        aria-label="Benar"
                      />
                    ) : (
                      <XCircle
                        className="mt-0.5 size-5 shrink-0 text-destructive"
                        aria-label="Belum tepat"
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
