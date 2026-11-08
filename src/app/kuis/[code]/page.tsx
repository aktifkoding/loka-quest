"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { miscDict as d } from "@/lib/i18n/dict/misc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, Trophy, Loader2 } from "lucide-react";

type State = {
  code: string;
  status: "lobby" | "active" | "finished";
  currentIndex: number;
  totalQuestions: number;
  mission: { title: string } | null;
  currentQuestion: {
    id: string;
    prompt: string;
    question_type: string;
    options: Record<string, unknown>;
  } | null;
  myAnswer: { is_correct: boolean } | null;
  participants: { profile_id: string; display_name: string; score: number }[];
  me: { profileId: string; score: number };
};

export default function QuizPlayerPage() {
  const params = useParams<{ code: string }>();
  const code = params.code;
  const { t } = useI18n();
  const [state, setState] = useState<State | null>(null);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

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
    let timer: ReturnType<typeof setInterval> | null = null;

    async function join() {
      const response = await fetch("/api/v1/quiz/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const json = await response.json();
      if (!response.ok) {
        setError(json.error || t(d.joinFailed));
        return;
      }
      setJoined(true);
      await load();
      timer = setInterval(() => void load(), 2000);
    }

    void join();
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [code, load, t]);

  async function answer(questionId: string, value: string) {
    setPending(true);
    setFeedback(null);
    try {
      const response = await fetch(`/api/v1/quiz/${code}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, answer: { selected: value } }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || t(d.submitAnswerFailed));
      setFeedback(
        json.data.isCorrect
          ? t(d.correctFeedback)
          : t(d.incorrectFeedback, { explanation: json.data.explanation ?? "" })
      );
      await load();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : t(d.submitAnswerFailed));
    } finally {
      setPending(false);
    }
  }

  const question = state?.currentQuestion;
  const choices =
    (question?.options.choices as string[]) ??
    (question?.options.instruments as string[]) ??
    [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:py-14">
      <header className="text-center">
        <p className="text-sm text-muted-foreground">{t(d.classQuizLabel)}</p>
        <p className="font-display text-3xl font-semibold tracking-[0.18em]">
          {code}
        </p>
        {state?.mission && (
          <p className="mt-1 text-sm text-muted-foreground">{state.mission.title}</p>
        )}
      </header>

      {error && (
        <div role="alert" className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
          {(error.includes("belum bergabung") || error.includes("not joined this session")) && (
            <Button asChild variant="outline" size="sm" className="ml-3">
              <Link href="/auth/login">{t(d.signInCta)}</Link>
            </Button>
          )}
        </div>
      )}

      {!joined && !error && (
        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          {t(d.joiningSession)}
        </div>
      )}

      {state?.status === "lobby" && (
        <Card className="mt-8 p-8 text-center">
          <p className="font-display text-xl font-semibold">{t(d.lobbyTitle)}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t(d.lobbyHint)}
          </p>
          <p className="mt-4 text-sm">
            {t(d.participantsLabel)} <strong>{state.participants.length}</strong>
          </p>
        </Card>
      )}

      {state?.status === "active" && question && (
        <Card className="mt-8 p-6">
          <p className="text-xs text-muted-foreground">
            {t(d.questionNofM, { i: state.currentIndex + 1, n: state.totalQuestions })}
          </p>
          <h1 className="mt-3 font-display text-2xl font-semibold">
            {question.prompt}
          </h1>

          {state.myAnswer ? (
            <p className="mt-6 flex items-center gap-2 rounded-xl bg-secondary/60 p-4 text-sm">
              {state.myAnswer.is_correct ? (
                <>
                  <CheckCircle2 className="size-5 text-primary" aria-hidden="true" />
                  {t(d.answerCorrect)}
                </>
              ) : (
                <>
                  <XCircle className="size-5 text-destructive" aria-hidden="true" />
                  {t(d.answerAlreadySent)}
                </>
              )}
            </p>
          ) : (
            <div className="mt-6 space-y-3">
              {choices.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t(d.unsupportedQuestionType)}
                </p>
              ) : (
                choices.map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    disabled={pending}
                    onClick={() => answer(question.id, choice)}
                    className="w-full rounded-xl border border-border px-4 py-3 text-left text-sm transition-colors hover:border-primary/50 hover:bg-secondary/50 disabled:opacity-60"
                  >
                    {choice}
                  </button>
                ))
              )}
            </div>
          )}

          {feedback && (
            <p role="status" className="mt-4 text-sm text-muted-foreground">
              {feedback}
            </p>
          )}
        </Card>
      )}

      {state?.status === "finished" && (
        <Card className="mt-8 p-6">
          <Trophy className="mx-auto size-8 text-gold" aria-hidden="true" />
          <h1 className="mt-2 text-center font-display text-2xl font-semibold">
            {t(d.quizFinishedTitle)}
          </h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            {t(d.yourScore)} <strong>{state.me.score}</strong>
          </p>
          <ol className="mt-6 space-y-2">
            {state.participants.map((participant, index) => (
              <li
                key={participant.profile_id}
                className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2 text-sm"
              >
                <span>
                  {index + 1}. {participant.display_name}
                </span>
                <span className="font-semibold tabular-nums">
                  {participant.score}
                </span>
              </li>
            ))}
          </ol>
          <Button asChild className="mt-6 w-full">
            <Link href="/player/dashboard">{t(d.toDashboardCta)}</Link>
          </Button>
        </Card>
      )}
    </div>
  );
}
