"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
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
      setError(json.error || "Gagal bergabung");
      return;
    }
    setCode("");
    setMessage(`Berhasil bergabung ke ${json.data.group.name}.`);
    await load();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
        <Link href="/player/dashboard">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Dasbor
        </Link>
      </Button>

      <header>
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          Kelas saya
        </h1>
        <p className="mt-2 text-muted-foreground">
          Gabung dengan kode dari guru, lalu kerjakan tugas yang diberikan.
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
            Kode kelas
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
          <Button type="submit">Gabung kelas</Button>
        </form>
      </Card>

      <div className="mt-8">
        {loading ? (
          <p className="text-sm text-muted-foreground">Memuat tugas…</p>
        ) : assignments.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Belum ada tugas kelas"
            description="Setelah bergabung dengan kelas, tugas dari guru akan muncul di sini."
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
                    <p className="font-medium">{mission?.title ?? "Misi"}</p>
                    <p className="text-xs text-muted-foreground">
                      {group?.name ?? "Kelas"}
                      {assignment.due_at
                        ? ` · tenggat ${new Date(assignment.due_at).toLocaleDateString("id-ID")}`
                        : ""}
                      {done ? ` · skor terbaik ${assignment.bestScore}` : ""}
                    </p>
                  </div>
                  {mission && (
                    <Button asChild size="sm" variant={done ? "outline" : "default"}>
                      <Link href={`/missions/${mission.slug}`}>
                        {done ? "Main lagi" : "Kerjakan"}
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
