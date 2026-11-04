"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowLeft, RotateCcw, CheckCircle2, XCircle } from "lucide-react";

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

export default function ReviewPage() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [result, setResult] = useState<boolean | null>(null);
  const [done, setDone] = useState(0);

  const load = useCallback(async () => {
    const response = await fetch("/api/v1/review", { cache: "no-store" });
    const json = await response.json();
    if (response.ok) {
      setItems(json.data ?? []);
      setIndex(0);
    }
    setLoading(false);
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
      setFeedback(json.error || "Gagal menyimpan jawaban");
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
    <div className="mx-auto max-w-2xl px-4 py-10 md:py-14">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
        <Link href="/player/dashboard">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Dasbor
        </Link>
      </Button>

      <header>
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          Review pintar
        </h1>
        <p className="mt-2 text-muted-foreground">
          Soal yang pernah salah muncul kembali dengan interval yang menyesuaikan.
        </p>
      </header>

      {loading ? (
        <p className="mt-10 text-sm text-muted-foreground">Memuat antrean…</p>
      ) : !item ? (
        <div className="mt-10">
          <EmptyState
            icon={RotateCcw}
            title={done > 0 ? "Review selesai!" : "Antrean review kosong"}
            description={
              done > 0
                ? `${done} soal berhasil ditinjau. Kembali lagi besok untuk jadwal berikutnya.`
                : "Selesaikan misi terlebih dahulu. Jawaban yang salah akan masuk ke antrean review."
            }
            action={{ label: "Ke daftar misi", href: "/missions" }}
          />
        </div>
      ) : (
        <Card className="mt-8 p-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Soal {index + 1} dari {items.length}
            </span>
            <span>{mission?.title ?? "Misi"}</span>
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
              if (question?.question_type === "matching" || question?.question_type === "sequencing") {
                return (
                  <p className="text-sm text-muted-foreground">
                    Tipe soal ini perlu dibuka di halaman misi.{" "}
                    <Link
                      href={`/missions/${mission?.slug ?? ""}`}
                      className="text-primary underline"
                    >
                      Buka misi
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
                    Benar
                  </>
                ) : (
                  <>
                    <XCircle className="size-5 text-destructive" aria-hidden="true" />
                    Belum tepat
                  </>
                )}
              </p>
              {feedback && (
                <p className="mt-2 text-sm text-muted-foreground">{feedback}</p>
              )}
              <Button className="mt-4" onClick={next}>
                Lanjut
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
