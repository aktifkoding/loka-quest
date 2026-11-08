"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { educatorDict as d } from "@/lib/i18n/dict/educator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Play, SkipForward, Square, Users } from "lucide-react";

type State = {
  code: string;
  status: "lobby" | "active" | "finished";
  currentIndex: number;
  totalQuestions: number;
  isHost: boolean;
  mission: { title: string; slug: string } | null;
  currentQuestion: { id: string; prompt: string } | null;
  participants: { profile_id: string; display_name: string; score: number }[];
};

export default function QuizHostPage() {
  const params = useParams<{ code: string }>();
  const code = params.code;
  const { t } = useI18n();
  const [state, setState] = useState<State | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch(`/api/v1/quiz/${code}`, { cache: "no-store" });
    const json = await response.json();
    if (!response.ok) {
      setError(json.error || t(d.loadSessionFailed));
      return;
    }
    setState(json.data);
    setError(null);
  }, [code, t]);

  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), 2000);
    return () => clearInterval(timer);
  }, [load]);

  async function control(action: "start" | "next" | "finish") {
    setBusy(true);
    try {
      const response = await fetch(`/api/v1/quiz/${code}/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || t(d.actionFailed));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t(d.actionFailed));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:py-14">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
        <Link href="/educator/quiz">
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t(d.backToClassQuiz)}
        </Link>
      </Button>

      {error && (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {!state ? (
        <p className="text-sm text-muted-foreground">{t(d.loadingSession)}</p>
      ) : (
        <>
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t(d.sessionCodeLabel)}</p>
              <p className="font-display text-4xl font-semibold tracking-[0.18em]">
                {state.code}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {state.mission?.title} · {t(d.questionCount, { n: state.totalQuestions })}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {state.status === "lobby" && (
                <Button disabled={busy} onClick={() => control("start")}>
                  <Play className="size-4" aria-hidden="true" />
                  {t(d.startCta)}
                </Button>
              )}
              {state.status === "active" && (
                <Button disabled={busy} onClick={() => control("next")}>
                  <SkipForward className="size-4" aria-hidden="true" />
                  {t(d.nextQuestionCta)}
                </Button>
              )}
              {state.status !== "finished" && (
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => control("finish")}
                >
                  <Square className="size-4" aria-hidden="true" />
                  {t(d.finishCta)}
                </Button>
              )}
            </div>
          </header>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
            <Card className="p-6">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {state.status === "lobby"
                  ? t(d.statusWaitingParticipants)
                  : state.status === "finished"
                    ? t(d.statusFinished)
                    : t(d.questionNofM, { i: state.currentIndex + 1, n: state.totalQuestions })}
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold">
                {state.status === "lobby"
                  ? t(d.lobbyHint)
                  : state.status === "finished"
                    ? t(d.finishedThanks)
                    : state.currentQuestion?.prompt}
              </h2>
              <p className="mt-4 text-sm text-muted-foreground">
                {t(d.joinAt)}{" "}
                <Link href={`/kuis/${state.code}`} className="text-primary underline">
                  /kuis/{state.code}
                </Link>
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                <Users className="size-4" aria-hidden="true" />
                {t(d.scoreboardHeading)}
              </h2>
              <ol className="mt-3 space-y-2">
                {state.participants.length === 0 ? (
                  <li className="text-sm text-muted-foreground">{t(d.emptyParticipants)}</li>
                ) : (
                  state.participants.map((participant, index) => (
                    <li
                      key={participant.profile_id}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span className="min-w-0 truncate">
                        {index + 1}. {participant.display_name}
                      </span>
                      <span className="font-semibold tabular-nums">
                        {participant.score}
                      </span>
                    </li>
                  ))
                )}
              </ol>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
