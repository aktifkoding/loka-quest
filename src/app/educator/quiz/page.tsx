"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Radio, Plus } from "lucide-react";

type Mission = { id: string; title: string; status: string };

export default function CreateQuizPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [missionId, setMissionId] = useState("");
  const [session, setSession] = useState<{ code: string; missionTitle: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/v1/missions?limit=100", { cache: "no-store" })
      .then((response) => response.json())
      .then((json) => {
        setMissions(json.data ?? []);
        setMissionId((current) => current || json.data?.[0]?.id || "");
      })
      .catch(() => setError("Gagal memuat misi"));
  }, []);

  async function create(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/v1/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionId }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Gagal membuat kuis");
      setSession(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat kuis");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:py-14">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
        <Link href="/educator/dashboard">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Dasbor pendidik
        </Link>
      </Button>

      <header>
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          Kuis kelas live
        </h1>
        <p className="mt-2 text-muted-foreground">
          Buat sesi, bagikan kode, dan mainkan bersama siswa.
        </p>
      </header>

      {error && (
        <div role="alert" className="mt-5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {!session ? (
        <Card className="mt-6 p-6">
          <form onSubmit={create} className="grid gap-4">
            <label className="block text-sm font-medium">
              Misi
              <select
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
                required
                value={missionId}
                onChange={(event) => setMissionId(event.target.value)}
              >
                <option value="">Pilih misi</option>
                {missions.map((mission) => (
                  <option key={mission.id} value={mission.id}>
                    {mission.title}
                  </option>
                ))}
              </select>
            </label>
            <Button type="submit" disabled={busy || !missionId}>
              <Plus className="size-4" aria-hidden="true" />
              {busy ? "Membuat…" : "Buat sesi kuis"}
            </Button>
          </form>
        </Card>
      ) : (
        <Card className="mt-6 p-6 text-center">
          <Radio className="mx-auto size-8 text-primary" aria-hidden="true" />
          <p className="mt-3 text-sm text-muted-foreground">Kode sesi</p>
          <p className="mt-1 font-display text-5xl font-semibold tracking-[0.2em]">
            {session.code}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            {session.missionTitle}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href={`/educator/quiz/${session.code}`}>Buka ruang host</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/kuis/${session.code}`}>Buka layar peserta</Link>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
