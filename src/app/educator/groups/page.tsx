"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Copy, Users, Plus, ClipboardList } from "lucide-react";

type Group = {
  id: string;
  name: string;
  description: string | null;
  join_code: string | null;
  memberCount: number;
};
type Member = {
  profile_id: string;
  joined_at: string;
  profiles:
    | { full_name: string | null; email: string; level: number; xp: number }
    | { full_name: string | null; email: string; level: number; xp: number }[]
    | null;
};
type Assignment = {
  id: string;
  due_at: string | null;
  mission: { id: string; title: string; slug: string } | { id: string; title: string; slug: string }[] | null;
};
type Mission = { id: string; title: string; slug: string; status: string };

export default function EducatorGroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [groupName, setGroupName] = useState("");
  const [missionId, setMissionId] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadGroups = useCallback(async () => {
    try {
      const [groupRes, missionRes] = await Promise.all([
        fetch("/api/v1/educator/groups", { cache: "no-store" }),
        fetch("/api/v1/missions?limit=100", { cache: "no-store" }),
      ]);
      const groupJson = await groupRes.json();
      const missionJson = await missionRes.json();
      if (!groupRes.ok) throw new Error(groupJson.error || "Gagal memuat kelompok");
      setGroups(groupJson.data ?? []);
      setMissions(missionJson.data ?? []);
      setSelected((current) => current ?? groupJson.data?.[0]?.id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDetail = useCallback(async (groupId: string) => {
    const [detailRes, assignmentRes] = await Promise.all([
      fetch(`/api/v1/educator/groups/${groupId}`, { cache: "no-store" }),
      fetch(`/api/v1/educator/groups/${groupId}/assignments`, {
        cache: "no-store",
      }),
    ]);
    const detailJson = await detailRes.json();
    const assignmentJson = await assignmentRes.json();
    if (detailRes.ok) setMembers(detailJson.data?.members ?? []);
    if (assignmentRes.ok) setAssignments(assignmentJson.data ?? []);
  }, []);

  useEffect(() => {
    void loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    if (selected) void loadDetail(selected);
  }, [selected, loadDetail]);

  async function createGroup(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    setError(null);
    const response = await fetch("/api/v1/educator/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: groupName }),
    });
    const json = await response.json();
    if (!response.ok) {
      setError(json.error || "Gagal membuat kelompok");
      return;
    }
    setGroupName("");
    setMessage("Kelompok dibuat. Bagikan kode join ke siswa.");
    await loadGroups();
    setSelected(json.data.id);
  }

  async function assignMission(event: React.FormEvent) {
    event.preventDefault();
    if (!selected) return;
    setMessage("");
    setError(null);
    const response = await fetch(
      `/api/v1/educator/groups/${selected}/assignments`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          missionId,
          dueAt: dueAt ? new Date(dueAt).toISOString() : null,
        }),
      }
    );
    const json = await response.json();
    if (!response.ok) {
      setError(json.error || "Gagal memberi tugas");
      return;
    }
    setMissionId("");
    setDueAt("");
    setMessage("Tugas ditambahkan.");
    await loadDetail(selected);
  }

  async function copyCode(code: string) {
    await navigator.clipboard.writeText(code);
    setMessage("Kode join disalin.");
  }

  const activeGroup = groups.find((group) => group.id === selected);
  const inputClass =
    "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
        <Link href="/educator/dashboard">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Dasbor pendidik
        </Link>
      </Button>

      <header>
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          Kelompok belajar
        </h1>
        <p className="mt-2 text-muted-foreground">
          Buat kelas, bagikan kode join, dan beri tugas misi.
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
        <form onSubmit={createGroup} className="flex flex-wrap items-end gap-3">
          <label className="min-w-[240px] flex-1 text-sm font-medium">
            Nama kelompok baru
            <Input
              className="mt-1"
              required
              minLength={3}
              value={groupName}
              onChange={(event) => setGroupName(event.target.value)}
              placeholder="Kelas 8A — Budaya Nusantara"
            />
          </label>
          <Button type="submit">
            <Plus className="size-4" aria-hidden="true" />
            Buat kelompok
          </Button>
        </form>
      </Card>

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside>
          {loading ? (
            <p className="text-sm text-muted-foreground">Memuat…</p>
          ) : groups.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              Belum ada kelompok.
            </p>
          ) : (
            <Card className="divide-y divide-border">
              {groups.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setSelected(group.id)}
                  className={`flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-secondary/50 ${
                    selected === group.id ? "bg-secondary/60" : ""
                  }`}
                >
                  <Users className="size-4 text-primary" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {group.name}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {group.memberCount} siswa
                    </span>
                  </span>
                </button>
              ))}
            </Card>
          )}
        </aside>

        <section>
          {!activeGroup ? (
            <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Pilih kelompok untuk melihat detail.
            </p>
          ) : (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl font-semibold">
                      {activeGroup.name}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {activeGroup.memberCount} siswa bergabung
                    </p>
                  </div>
                  {activeGroup.join_code && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyCode(activeGroup.join_code!)}
                    >
                      <Copy className="size-4" aria-hidden="true" />
                      {activeGroup.join_code}
                    </Button>
                  )}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-display text-lg font-semibold">Beri tugas</h3>
                <form onSubmit={assignMission} className="mt-4 grid gap-3 sm:grid-cols-[1fr_180px_auto]">
                  <label className="block text-sm font-medium">
                    Misi
                    <select
                      className={inputClass}
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
                  <label className="block text-sm font-medium">
                    Tenggat (opsional)
                    <Input
                      className="mt-1"
                      type="date"
                      value={dueAt}
                      onChange={(event) => setDueAt(event.target.value)}
                    />
                  </label>
                  <div className="flex items-end">
                    <Button type="submit">
                      <ClipboardList className="size-4" aria-hidden="true" />
                      Tugaskan
                    </Button>
                  </div>
                </form>

                <ul className="mt-4 space-y-2">
                  {assignments.length === 0 ? (
                    <li className="text-sm text-muted-foreground">
                      Belum ada tugas.
                    </li>
                  ) : (
                    assignments.map((assignment) => {
                      const mission = Array.isArray(assignment.mission)
                        ? assignment.mission[0]
                        : assignment.mission;
                      return (
                        <li
                          key={assignment.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-secondary/50 px-3 py-2 text-sm"
                        >
                          <span>{mission?.title ?? "Misi"}</span>
                          <span className="text-xs text-muted-foreground">
                            {assignment.due_at
                              ? `Tenggat ${new Date(assignment.due_at).toLocaleDateString("id-ID")}`
                              : "Tanpa tenggat"}
                          </span>
                        </li>
                      );
                    })
                  )}
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="font-display text-lg font-semibold">
                  Siswa ({members.length})
                </h3>
                {members.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Bagikan kode join agar siswa dapat bergabung.
                  </p>
                ) : (
                  <ul className="mt-3 divide-y divide-border">
                    {members.map((member) => {
                      const profile = Array.isArray(member.profiles)
                        ? member.profiles[0]
                        : member.profiles;
                      return (
                        <li
                          key={member.profile_id}
                          className="flex items-center justify-between gap-3 py-2 text-sm"
                        >
                          <span>
                            {profile?.full_name || profile?.email || "Siswa"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Level {profile?.level ?? 1} · {profile?.xp ?? 0} XP
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Card>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
