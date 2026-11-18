"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { miscDict as d } from "@/lib/i18n/dict/misc";
import { commonDict } from "@/lib/i18n/dict/common";
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

type LoadResult = { ok: boolean; auth: boolean } | null;
type ErrorState = { auth: boolean; message: string } | null;

export default function QuizPlayerPage() {
  const params = useParams<{ code: string }>();
  const code = params.code;
  const { t } = useI18n();
  const [state, setState] = useState<State | null>(null);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<ErrorState>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Simpan t terbaru di ref agar efek join/polling tidak berjalan ulang saat bahasa diganti.
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);

  const stateRef = useRef<State | null>(null);

  const load = useCallback(async (): Promise<LoadResult> => {
    try {
      const response = await fetch(`/api/v1/quiz/${code}`, { cache: "no-store" });
      const json = await response.json();
      if (!response.ok) {
        setError({
          auth: response.status === 401,
          message: json.error || tRef.current(d.loadSessionFailed),
        });
        return { ok: false, auth: response.status === 401 };
      }
      setState(json.data);
      stateRef.current = json.data;
      setError(null);
      return { ok: true, auth: false };
    } catch {
      setError({ auth: false, message: tRef.current(commonDict.errorNetwork) });
      return { ok: false, auth: false };
    }
  }, [code]);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    async function join() {
      try {
        const response = await fetch("/api/v1/quiz/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        const json = await response.json();
        if (cancelled) return;
        if (!response.ok) {
          // Gagal permanen (401/404/salah kode) — jangan mulai polling.
          setError({
            auth: response.status === 401,
            message: json.error || tRef.current(d.joinFailed),
          });
          return;
        }
        setJoined(true);
        const result = await load();
        if (cancelled) return;
        if (result?.ok) {
          timer = setInterval(() => {
            void load().then((poll) => {
              // Berhenti memantau setelah kuis selesai — hindari polling abadi.
              if (poll?.ok && stateRef.current?.status === "finished" && timer) {
                clearInterval(timer);
                timer = null;
              }
            });
          }, 2000);
        }
      } catch {
        if (!cancelled) {
          setError({ auth: false, message: tRef.current(commonDict.errorNetwork) });
        }
      }
    }

    void join();
    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [code, load]);

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
          {/* 401 dari server berupa teks Inggris mentah — tampilkan pesan yang dilokalkan */}
          {error.auth ? t(d.signInRequiredMessage) : error.message}
          {error.auth && (
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
