"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowLeft, CheckCircle2, XCircle, Loader2, BookOpen, PartyPopper } from "lucide-react";
import { Confetti } from "@/components/ui/confetti";

interface AssessmentQuestion {
  id: string;
  prompt: string;
  choices: string[];
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  assessment_type: string;
  questions: AssessmentQuestion[];
}

interface SubmitResult {
  score: number;
  correctCount: number;
  totalQuestions: number;
  results: {
    questionId: string;
    prompt: string;
    selected: string;
    isCorrect: boolean;
    correctAnswer: string;
    explanation: string | null;
  }[];
}

export default function TakeAssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; selected: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/v1/assessments");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal memuat asesmen");
        const found = (data.data ?? []).find((a: Assessment) => a.id === params.id);
        if (!found) throw new Error("Asesmen tidak ditemukan");
        setAssessment(found);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id]);

  const question = assessment?.questions[current];
  const progress = useMemo(
    () => (assessment ? (current / assessment.questions.length) * 100 : 0),
    [current, assessment]
  );

  const choose = (selected: string) => {
    if (!assessment || !question) return;
    const next = [
      ...answers.filter((a) => a.questionId !== question.id),
      { questionId: question.id, selected },
    ];
    setAnswers(next);

    if (current + 1 < assessment.questions.length) {
      setCurrent(current + 1);
    } else {
      // final answer -> submit
      setSubmitting(true);
      fetch("/api/v1/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId: assessment.id, answers: next }),
      })
        .then(async (res) => {
          const json = await res.json();
          if (!res.ok) throw new Error(json.error || "Gagal mengirim asesmen");
          setResult(json.data);
        })
        .catch((err) =>
          setSubmitError(err instanceof Error ? err.message : "Gagal mengirim")
        )
        .finally(() => setSubmitting(false));
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10" aria-busy="true">
        <Skeleton className="h-9 w-44 rounded-md" />
        <Skeleton className="mt-8 h-24 w-full rounded-xl" />
        <Skeleton className="mt-4 h-14 w-full rounded-md" />
        <Skeleton className="mt-3 h-14 w-full rounded-md" />
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState
          icon={BookOpen}
          title="Asesmen tidak ditemukan"
          description={error ?? "Tautan asesmen tidak valid."}
          action={{ label: "Kembali ke daftar", href: "/player/assessments" }}
        />
      </div>
    );
  }

  const isPre = assessment.assessment_type === "pre";

  /* ---------------- selesai: hasil + pembahasan ---------------- */
  if (result) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 md:py-14">
        <Confetti count={60} />
        <Card className="border-gold/30">
          <div className="p-6 text-center sm:p-8">
            <PartyPopper
              className="mx-auto size-9 text-gold"
              aria-hidden="true"
            />
            <h1 className="mt-4 font-display text-2xl font-semibold">
              {isPre ? "Pre-test selesai" : "Post-test selesai"}
            </h1>
            <p className="mt-4 font-display text-4xl font-semibold tabular-nums">
              {result.score}
              <span className="text-xl text-muted-foreground">/100</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {result.correctCount} dari {result.totalQuestions} jawaban benar
            </p>
            {isPre && (
              <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Baseline tersimpan. Mainkan misi-misinya, lalu kerjakan
                post-test untuk melihat perkembangan pemahamanmu.
              </p>
            )}
            {!isPre && (
              <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Hasil post-test tercatat. Buka dasbor untuk melihat perbandingan
                dengan pre-test.
              </p>
            )}
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button variant="outline" asChild>
                <Link href="/player/assessments">Daftar asesmen</Link>
              </Button>
              <Button asChild>
                <Link href="/player/dashboard">Ke dasbor</Link>
              </Button>
            </div>
          </div>
        </Card>

        <Card className="mt-6">
          <div className="p-6">
            <h2 className="font-display text-xl font-semibold">Pembahasan</h2>
            <ul className="mt-4 space-y-4">
              {result.results.map((r) => (
                <li key={r.questionId} className="flex gap-3 rounded-xl bg-secondary/60 p-4">
                  {r.isCorrect ? (
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-label="Benar" />
                  ) : (
                    <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" aria-label="Belum tepat" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{r.prompt}</p>
                    <p className="mt-1 text-[13px] text-muted-foreground">
                      Jawabanmu: <span className="font-medium text-foreground">{r.selected || "kosong"}</span>
                      {!r.isCorrect && (
                        <>
                          {" "}· Jawaban benar:{" "}
                          <span className="font-medium text-primary">{r.correctAnswer}</span>
                        </>
                      )}
                    </p>
                    {r.explanation && (
                      <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
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
    );
  }

  /* ---------------- mengerjakan ---------------- */
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:py-14">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
        <Link href="/player/assessments">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Asesmen
        </Link>
      </Button>

      <header>
        <p className="text-[13px] font-medium text-muted-foreground">
          {isPre ? "PRE-TEST" : "POST-TEST"} · Pertanyaan {current + 1} dari{" "}
          {assessment.questions.length}
        </p>
        <div
          className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {submitting ? (
        <Card className="mt-8">
          <div className="p-10 text-center" aria-busy="true">
            <Loader2 className="mx-auto size-8 animate-spin text-primary" aria-hidden="true" />
            <p className="mt-4 font-medium">Menilai jawabanmu di server…</p>
          </div>
        </Card>
      ) : submitError ? (
        <Card className="mt-8">
          <div className="p-8 text-center">
            <p className="text-sm text-destructive">{submitError}</p>
            <Button className="mt-4" onClick={() => router.refresh()}>
              Coba lagi
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="mt-8">
          <div className="p-6 sm:p-8">
            <h1 className="font-display text-2xl font-semibold leading-snug">
              {question?.prompt}
            </h1>
            <div className="mt-6 grid gap-3">
              {question?.choices.map((choice) => (
                <button
                  key={choice}
                  type="button"
                  onClick={() => choose(choice)}
                  className="group flex min-h-12 w-full items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-left text-[15px] transition-[background-color,border-color,box-shadow] duration-200 hover:border-primary/40 hover:bg-primary/5 hover:shadow-card"
                >
                  <span
                    className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border text-[12px] font-semibold text-muted-foreground transition-colors group-hover:border-primary/40 group-hover:bg-primary/10 group-hover:text-primary"
                    aria-hidden="true"
                  >
                    {String.fromCharCode(65 + question.choices.indexOf(choice))}
                  </span>
                  {choice}
                </button>
              ))}
            </div>
            <p className="mt-5 text-[13px] text-muted-foreground">
              Jawaban tersimpan otomatis saat kamu memilih. Tidak bisa kembali
              ke soal sebelumnya.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
