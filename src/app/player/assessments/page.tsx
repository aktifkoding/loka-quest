"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { BookOpen, CheckCircle2, ArrowRight, CircleDot } from "lucide-react";

interface Assessment {
  id: string;
  title: string;
  description: string;
  assessment_type: string;
  questions: unknown[];
}

interface OwnResponse {
  assessment_id: string;
  score: number;
  submitted_at: string;
}

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [aRes, rRes] = await Promise.all([
          fetch("/api/v1/assessments"),
          fetch("/api/v1/assessments/responses"),
        ]);
        const aData = await aRes.json();
        if (!aRes.ok) throw new Error(aData.error || "Gagal memuat asesmen");
        setAssessments(aData.data || []);

        if (rRes.ok) {
          const rData = await rRes.json();
          const map: Record<string, number> = {};
          (rData.data ?? []).forEach((r: OwnResponse) => {
            map[r.assessment_id] = r.score;
          });
          setResponses(map);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:py-14">
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          Asesmen pembelajaran
        </h1>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Kerjakan pre-test sebelum bermain dan post-test setelahnya. Keduanya
          dinilai di server untuk melihat perkembangan pemahamanmu.
        </p>
      </header>

      <div className="mt-10">
        {loading ? (
          <div className="space-y-4" aria-busy="true" aria-label="Memuat asesmen">
            {[0, 1].map((i) => (
              <div key={i} className="rounded-xl border border-border/70 p-6">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="mt-3 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-1/2" />
                <Skeleton className="mt-5 h-10 w-40 rounded-md" />
              </div>
            ))}
          </div>
        ) : error ? (
          <EmptyState icon={BookOpen} title="Asesmen tidak bisa dimuat" description={error} />
        ) : assessments.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Belum ada asesmen"
            description="Asesmen pre-test dan post-test akan muncul di sini."
          />
        ) : (
          <div className="space-y-4">
            {assessments.map((assessment, index) => {
              const doneScore = responses[assessment.id];
              return (
                <Card
                  key={assessment.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <div className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="font-display text-xl font-semibold">
                          {assessment.title}
                        </h2>
                        <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                          {assessment.description}
                        </p>
                      </div>
                      {doneScore !== undefined ? (
                        <p className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-[13px] font-semibold text-primary tabular-nums">
                          <CheckCircle2 className="size-4" aria-hidden="true" />
                          Selesai · {doneScore}/100
                        </p>
                      ) : (
                        <p className="flex shrink-0 items-center gap-1.5 text-[13px] text-muted-foreground">
                          <CircleDot className="size-4" aria-hidden="true" />
                          {assessment.questions.length} soal · belum dikerjakan
                        </p>
                      )}
                    </div>
                    <div className="mt-5 flex items-center justify-between border-t border-border pt-5">
                      <p className="text-[13px] text-muted-foreground">
                        {assessment.assessment_type === "pre"
                          ? "Kerjakan sebelum memainkan misi"
                          : "Kerjakan setelah menyelesaikan misi"}
                      </p>
                      <Button asChild>
                        <Link href={`/player/assessments/${assessment.id}`}>
                          {doneScore !== undefined ? "Kerjakan ulang" : "Mulai"}
                          <ArrowRight className="ml-1.5 size-4" aria-hidden="true" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
