"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog, useToast } from "@/components/ui/feedback";
import { ArrowLeft, Pencil, Plus, Trash2, FileText } from "lucide-react";

type MissionStatus = "draft" | "review" | "published" | "archived";

export type MissionRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: string;
  xp_reward: number;
  status: MissionStatus;
  sort_order: number;
  cultural_regions: { name: string } | null;
  mission_questions: { count: number }[];
};

const STATUSES: MissionStatus[] = ["draft", "review", "published", "archived"];

const statusLabel: Record<MissionStatus, string> = {
  draft: "Draf",
  review: "Review",
  published: "Terbit",
  archived: "Arsip",
};

const statusDot: Record<MissionStatus, string> = {
  draft: "bg-muted-foreground/50",
  review: "bg-gold",
  published: "bg-primary",
  archived: "bg-muted-foreground/30",
};

const difficultyLabel: Record<string, string> = {
  beginner: "Pemula",
  intermediate: "Menengah",
  advanced: "Lanjut",
};

export function AdminMissionsClient({ initial }: { initial: MissionRow[] }) {
  const [items, setItems] = useState<MissionRow[]>(initial);
  const [filter, setFilter] = useState<MissionStatus | "all">("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<MissionRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { showToast, toastNode } = useToast();
  const router = useRouter();

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((m) => m.status === filter)),
    [items, filter]
  );

  const changeStatus = async (id: string, status: MissionStatus) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/v1/admin/missions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) {
        showToast("error", json.error || "Gagal memperbarui status");
        return;
      }
      setItems((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
      showToast("success", "Status misi diperbarui.");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async () => {
    const mission = pendingDelete;
    if (!mission) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/v1/admin/missions/${mission.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) {
        showToast("error", json.error || "Gagal menghapus misi");
        return;
      }
      setItems((prev) => prev.filter((m) => m.id !== mission.id));
      setPendingDelete(null);
      showToast("success", `Misi "${mission.title}" dihapus.`);
      router.refresh();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
        <Link href="/admin">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Dasbor admin
        </Link>
      </Button>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            Misi &amp; soal
          </h1>
          <p className="mt-2 text-muted-foreground">
            Kelola misi pembelajaran: buat, edit, urus soal, dan atur statusnya.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as MissionStatus | "all")}
            aria-label="Filter status misi"
            className="h-9 rounded-md border border-input bg-card px-2 text-[13px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <option value="all">Semua status</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabel[s]}
              </option>
            ))}
          </select>
          <Button asChild>
            <Link href="/admin/missions/new">
              <Plus className="size-4" aria-hidden="true" />
              Tambah misi
            </Link>
          </Button>
        </div>
      </header>

      <div className="mt-8">
        {filtered.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={items.length === 0 ? "Belum ada misi" : "Tidak ada misi pada status ini"}
            description={
              items.length === 0
                ? "Tambahkan misi pertama, isi soalnya, lalu terbitkan agar bisa dikerjakan pemain."
                : "Coba pilih status lain pada filter di atas."
            }
          />
        ) : (
          <ul className="space-y-3">
            {filtered.map((mission) => (
              <li key={mission.id}>
                <Card>
                  <div className="flex flex-wrap items-center gap-4 px-6 py-5">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                      <FileText className="size-4" aria-hidden="true" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{mission.title}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {mission.cultural_regions?.name ?? "Tanpa wilayah"} ·{" "}
                        {difficultyLabel[mission.difficulty] ?? mission.difficulty} ·{" "}
                        {mission.xp_reward} XP · {mission.mission_questions?.[0]?.count ?? 0} soal
                      </p>
                    </div>

                    <span className="flex shrink-0 items-center gap-2 text-[13px] text-muted-foreground">
                      <span
                        className={`size-2 rounded-full ${statusDot[mission.status] ?? "bg-muted-foreground/50"}`}
                        aria-hidden="true"
                      />
                      {statusLabel[mission.status] ?? mission.status}
                    </span>

                    <div className="flex shrink-0 items-center gap-2">
                      <select
                        value={mission.status}
                        onChange={(e) => void changeStatus(mission.id, e.target.value as MissionStatus)}
                        disabled={busyId === mission.id}
                        aria-label={`Ubah status misi ${mission.title}`}
                        className="h-8 rounded-md border border-input bg-card px-2 text-[13px] capitalize outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {statusLabel[s]}
                          </option>
                        ))}
                      </select>

                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/missions/${mission.id}/edit`}>
                          <Pencil className="size-4" aria-hidden="true" />
                          Edit
                        </Link>
                      </Button>

                      {mission.status === "draft" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setPendingDelete(mission)}
                          disabled={busyId === mission.id}
                          aria-label={`Hapus misi ${mission.title}`}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Hapus misi "${pendingDelete?.title ?? ""}"?`}
        description="Seluruh soal pada misi ini ikut terhapus. Tindakan ini tidak bisa dibatalkan."
        confirmLabel="Hapus misi"
        pending={deleting}
        onConfirm={() => void remove()}
        onClose={() => setPendingDelete(null)}
      />
      {toastNode}
    </>
  );
}
