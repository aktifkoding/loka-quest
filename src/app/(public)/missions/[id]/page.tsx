"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from "next/dynamic";
import { ArrowLeft, Loader2, CheckCircle2, XCircle } from "lucide-react";

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

// Dynamically import Phaser game to avoid SSR issues
const PhaserGame = dynamic(
  () => import("@/components/game/phaser-game").then((mod) => mod.PhaserGame),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    ),
  }
) as React.ComponentType<{
  mission: { id: string; title: string; xp_reward: number };
  questions: { id: string; question_type: string; prompt: string; options: Record<string, unknown>; explanation: string }[];
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

  const handleGameComplete = async (answers: { questionId: string; answer: Record<string, unknown> }[]) => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/v1/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          missionId: mission?.id,
          answers,
        }),
      });

      const resultJson = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setSubmitError("Silakan masuk terlebih dahulu untuk menyimpan progres.");
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

  const questionPromptMap = new Map(questions.map((q) => [q.id, q.prompt]));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !mission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || "Misi tidak ditemukan"}</p>
          <Button asChild>
            <Link href="/missions">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Misi
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/missions">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Link>
        </Button>

        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">{mission.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{mission.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="capitalize px-3 py-1 bg-primary/10 text-primary rounded-full">
                  {mission.difficulty}
                </span>
                <span className="text-muted-foreground">{mission.xp_reward} XP</span>
              </div>
            </CardContent>
          </Card>

          {submitting && (
            <Card>
              <CardContent className="py-16 text-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Server sedang menilai jawabanmu...
                </p>
              </CardContent>
            </Card>
          )}

          {!gameStarted && !result && !submitting && (
            <Card>
              <CardHeader>
                <CardTitle>Siap Memulai?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Jawabanmu akan dinilai di server setelah misi selesai.
                  Pastikan kamu sudah masuk agar progres tersimpan.
                </p>
                {submitError && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">
                    {submitError}
                  </div>
                )}
                <Button onClick={() => setGameStarted(true)} className="w-full">
                  Mulai Misi
                </Button>
              </CardContent>
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
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Misi Selesai!</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="text-6xl">🎉</div>
                    <p className="text-3xl font-bold">Nilai: {result.score}/100</p>
                    <p className="text-muted-foreground">
                      {result.correctCount} dari {result.totalQuestions} jawaban
                      benar • +{result.xpEarned} XP
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total XP: {result.newTotalXp} • Level {result.newLevel}
                    </p>
                    <div className="flex gap-4 justify-center pt-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setResult(null);
                          setGameStarted(false);
                        }}
                      >
                        Mainkan Lagi
                      </Button>
                      <Button asChild>
                        <Link href="/player/dashboard">Lihat Dasbor</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pembahasan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {result.results.map((r, index) => (
                      <div
                        key={`${r.questionId}-${index}`}
                        className="flex gap-3 p-4 bg-muted/50 rounded-lg"
                      >
                        {r.isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-medium text-sm">
                            {questionPromptMap.get(r.questionId) ?? "Pertanyaan"}
                          </p>
                          {r.explanation && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {r.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
