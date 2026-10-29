"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { BookOpen, CheckCircle2 } from "lucide-react";

interface Assessment {
  id: string;
  title: string;
  description: string;
  assessment_type: string;
  questions: Array<{ id: string; prompt: string; choices: string[] }>;
}

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const res = await fetch("/api/v1/assessments");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal memuat asesmen");
        setAssessments(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:py-14">
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          Asesmen pembelajaran
        </h1>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Kerjakan pre-test sebelum bermain dan post-test setelahnya untuk
          melihat perkembangan pemahamanmu.
        </p>
      </header>

      <div className="mt-10">
        {loading ? (
          <div
            className="space-y-4"
            aria-busy="true"
            aria-label="Memuat asesmen"
          >
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
          <EmptyState
            icon={BookOpen}
            title="Asesmen tidak bisa dimuat"
            description={error}
          />
        ) : assessments.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Belum ada asesmen"
            description="Asesmen pre-test dan post-test akan muncul di sini."
          />
        ) : (
          <div className="space-y-4">
            {assessments.map((assessment, index) => (
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
                    <p className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                      <CheckCircle2 className="size-4" aria-hidden="true" />
                      {assessment.questions.length} soal
                    </p>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-border pt-5">
                    <p className="text-[13px] text-muted-foreground">
                      {assessment.assessment_type === "pre"
                        ? "Kerjakan sebelum memainkan misi"
                        : "Kerjakan setelah menyelesaikan misi"}
                    </p>
                    <button
                      type="button"
                      className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-card transition-[background-color,box-shadow] duration-200 hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-55"
                      disabled
                      title="Segera tersedia"
                    >
                      Kerjakan sekarang
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
