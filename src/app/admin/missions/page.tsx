"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, FileText, Plus, Gamepad2 } from "lucide-react";

type Region = { id: string; name: string };
type Mission = {
  id: string;
  slug: string;
  title: string;
  status: string;
  difficulty: string;
  xp_reward: number;
  questionCount: number;
  cultural_regions: { name: string } | { name: string }[] | null;
};

const statusStyle: Record<string, string> = {
  published: "bg-primary/10 text-primary",
  review: "bg-amber-500/10 text-amber-600",
  draft: "bg-secondary text-muted-foreground",
  archived: "bg-muted text-muted-foreground",
};

export default function AdminMissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    regionId: "",
    difficulty: "beginner",
    xpReward: 100,
    status: "draft",
  });

  const load = useCallback(async () => {
    try {
      const [missionRes, regionRes] = await Promise.all([
        fetch("/api/v1/admin/missions?limit=100", { cache: "no-store" }),
        fetch("/api/v1/admin/regions", { cache: "no-store" }),
      ]);
      const missionJson = await missionRes.json();
      const regionJson = await regionRes.json();
      if (!missionRes.ok) throw new Error(missionJson.error || "Gagal memuat misi");
      setMissions(missionJson.data ?? []);
      setRegions(regionJson.data ?? []);
      setForm((current) => ({
        ...current,
        regionId: current.regionId || regionJson.data?.[0]?.id || "",
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createMission(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/v1/admin/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          xpReward: Number(form.xpReward),
          sortOrder: missions.length,
          learningObjectives: [],
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Gagal membuat misi");
      setShowForm(false);
      setForm({
        title: "",
        slug: "",
        description: "",
        regionId: regions[0]?.id ?? "",
        difficulty: "beginner",
        xpReward: 100,
        status: "draft",
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat misi");
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
        <Link href="/admin">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Dasbor admin
        </Link>
      </Button>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            Misi & soal
          </h1>
          <p className="mt-2 text-muted-foreground">
            Buat misi, susun soal, lalu terbitkan setelah siap.
          </p>
        </div>
        <Button onClick={() => setShowForm((value) => !value)}>
          <Plus className="size-4" aria-hidden="true" />
          Misi baru
        </Button>
      </header>

      {error && (
        <div role="alert" className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {showForm && (
        <Card className="mt-6 p-6">
          <form onSubmit={createMission} className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Judul
              <Input
                className={inputClass}
                required
                minLength={3}
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
              />
            </label>
            <label className="block text-sm font-medium">
              Slug
              <Input
                className={inputClass}
                required
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                placeholder="detektif-batik"
                value={form.slug}
                onChange={(event) => setForm({ ...form, slug: event.target.value })}
              />
            </label>
            <label className="block text-sm font-medium sm:col-span-2">
              Deskripsi
              <textarea
                className={inputClass}
                rows={3}
                required
                minLength={10}
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
              />
            </label>
            <label className="block text-sm font-medium">
              Wilayah
              <select
                className={inputClass}
                required
                value={form.regionId}
                onChange={(event) => setForm({ ...form, regionId: event.target.value })}
              >
                <option value="">Pilih wilayah</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium">
              Kesulitan
              <select
                className={inputClass}
                value={form.difficulty}
                onChange={(event) =>
                  setForm({ ...form, difficulty: event.target.value })
                }
              >
                <option value="beginner">Pemula</option>
                <option value="intermediate">Menengah</option>
                <option value="advanced">Mahir</option>
              </select>
            </label>
            <label className="block text-sm font-medium">
              XP
              <Input
                className={inputClass}
                type="number"
                min={10}
                max={1000}
                value={form.xpReward}
                onChange={(event) =>
                  setForm({ ...form, xpReward: Number(event.target.value) })
                }
              />
            </label>
            <label className="block text-sm font-medium">
              Status
              <select
                className={inputClass}
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value })}
              >
                <option value="draft">Draf</option>
                <option value="review">Review</option>
                <option value="published">Terbit</option>
              </select>
            </label>
            <div className="flex gap-3 sm:col-span-2">
              <Button type="submit" disabled={busy || !form.regionId}>
                {busy ? "Menyimpan…" : "Simpan misi"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Batal
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="mt-8">
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : missions.length === 0 ? (
          <EmptyState
            icon={Gamepad2}
            title="Belum ada misi"
            description="Buat misi pertama, lalu tambahkan soal sebelum menerbitkannya."
          />
        ) : (
          <Card className="divide-y divide-border">
            {missions.map((mission) => {
              const region = Array.isArray(mission.cultural_regions)
                ? mission.cultural_regions[0]?.name
                : mission.cultural_regions?.name;
              return (
                <div
                  key={mission.id}
                  className="flex flex-wrap items-center gap-3 p-4"
                >
                  <FileText className="size-4 text-primary" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{mission.title}</p>
                    <p className="text-xs text-muted-foreground">
                      /{mission.slug} · {region ?? "Tanpa wilayah"} ·{" "}
                      {mission.questionCount} soal · {mission.xp_reward} XP
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      statusStyle[mission.status] ?? "bg-secondary"
                    }`}
                  >
                    {mission.status}
                  </span>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/missions/${mission.id}`}>Kelola soal</Link>
                  </Button>
                </div>
              );
            })}
          </Card>
        )}
      </div>
    </div>
  );
}
