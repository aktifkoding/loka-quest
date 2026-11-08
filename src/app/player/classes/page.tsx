"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { useI18n, formatDate } from "@/lib/i18n";
import { playerDict } from "@/lib/i18n/dict/player";
import { ArrowLeft, Users, CheckCircle2, Clock } from "lucide-react";

type Assignment = {
  id: string;
  due_at: string | null;
  bestScore: number | null;
  completedAt: string | null;
  group: { name: string } | { name: string }[] | null;
  mission:
    | { id: string; slug: string; title: string; xp_reward: number }
    | { id: string; slug: string; title: string; xp_reward: number }[]
    | null;
};

export default function PlayerClassesPage() {
  const { lang, t } = useI18n();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const response = await fetch("/api/v1/educator/assignments", {
      cache: "no-store",
    });
    const json = await response.json();
    if (response.ok) setAssignments(json.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function join(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    setError(null);
    const response = await fetch("/api/v1/educator/groups/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const json = await response.json();
    if (!response.ok) {
      setError(json.error || t(playerDict.errorJoin));
      return;
    }
    setCode("");
    setMessage(t(playerDict.joinedSuccess, { name: json.data.group.name }));
    await load();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
        <Link href="/player/dashboard">
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t(playerDict.dashboard)}
        </Link>
      </Button>

      <header>
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          {t(playerDict.classesTitle)}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {t(playerDict.classesIntro)}
        </p>
      </header>

      {error && (
        <div role="alert" className="mt-5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {message && (
        <p role="status" className="mt-5 text-sm text-primary">
          {message}
        </p>
      )}

      <Card className="mt-6 p-6">
        <form onSubmit={join} className="flex flex-wrap items-end gap-3">
          <label className="min-w-[200px] flex-1 text-sm font-medium">
            {t(playerDict.classCodeLabel)}
            <Input
              className="mt-1 uppercase tracking-[0.2em]"
              required
              minLength={4}
              maxLength={12}
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              placeholder="ABC123"
            />
          </label>
          <Button type="submit">{t(playerDict.joinCta)}</Button>
        </form>
      </Card>

      <div className="mt-8">
        {loading ? (
          <p className="text-sm text-muted-foreground">{t(playerDict.loadingAssignments)}</p>
        ) : assignments.length === 0 ? (
          <EmptyState
            icon={Users}
            title={t(playerDict.emptyAssignmentsTitle)}
            description={t(playerDict.emptyAssignmentsDesc)}
          />
        ) : (
          <div className="space-y-3">
            {assignments.map((assignment) => {
              const mission = Array.isArray(assignment.mission)
                ? assignment.mission[0]
                : assignment.mission;
              const group = Array.isArray(assignment.group)
                ? assignment.group[0]
                : assignment.group;
              const done = assignment.completedAt !== null;

              return (
                <Card key={assignment.id} className="flex flex-wrap items-center gap-3 p-4">
                  {done ? (
                    <CheckCircle2 className="size-5 text-primary" aria-hidden="true" />
                  ) : (
                    <Clock className="size-5 text-muted-foreground" aria-hidden="true" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{mission?.title ?? t(playerDict.missionFallback)}</p>
                    <p className="text-xs text-muted-foreground">
                      {group?.name ?? t(playerDict.classFallback)}
                      {assignment.due_at
                        ? t(playerDict.dueTemplate, {
                            date: formatDate(assignment.due_at, lang),
                          })
                        : ""}
                      {done
                        ? t(playerDict.bestScoreTemplate, { score: assignment.bestScore ?? 0 })
                        : ""}
                    </p>
                  </div>
                  {mission && (
                    <Button asChild size="sm" variant={done ? "outline" : "default"}>
                      <Link href={`/missions/${mission.slug}`}>
                        {done ? t(playerDict.playAgainCta) : t(playerDict.workOnCta)}
                      </Link>
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
