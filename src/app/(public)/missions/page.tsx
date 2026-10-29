"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Gamepad2, ArrowRight, Zap } from "lucide-react";

interface Mission {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: string;
  xp_reward: number;
}

const difficultyLabel: Record<string, string> = {
  beginner: "Pemula",
  intermediate: "Menengah",
  advanced: "Lanjutan",
};

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const response = await fetch("/api/v1/missions");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Gagal memuat misi");
        }

        setMissions(result.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };

    fetchMissions();
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:py-14">
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          Misi budaya
        </h1>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Jawaban dinilai di server setelah misi selesai. Masuk dulu supaya
          XP dan lencanamu tersimpan.
        </p>
      </header>

      <div className="mt-10">
        {loading ? (
          <div
            className="space-y-3"
            aria-busy="true"
            aria-label="Memuat daftar misi"
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-xl border border-border/70 px-6 py-5"
              >
                <Skeleton className="size-11 rounded-xl" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="mt-2 h-4 w-2/3" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        ) : error ? (
          <EmptyState
            icon={Gamepad2}
            title="Misi tidak bisa dimuat"
            description={error}
          />
        ) : missions.length === 0 ? (
          <EmptyState
            icon={Gamepad2}
            title="Belum ada misi terbuka"
            description="Misi muncul di sini setelah tim konten mempublikasikannya."
            action={{ label: "Jelajahi wilayah budaya", href: "/explore" }}
          />
        ) : (
          <ul className="space-y-3">
            {missions.map((mission, index) => (
              <li key={mission.id}>
                <Link href={`/missions/${mission.slug}`} className="group block">
                  <Card
                    interactive
                    className="animate-fade-up"
                    style={{ animationDelay: `${index * 70}ms` }}
                  >
                    <div className="flex items-center gap-4 px-6 py-5">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Gamepad2 className="size-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{mission.title}</p>
                        <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                          {mission.description}
                        </p>
                        <p className="mt-1.5 flex items-center gap-2 text-[13px] text-muted-foreground">
                          <span>
                            {difficultyLabel[mission.difficulty] ?? mission.difficulty}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1 font-semibold tabular-nums text-gold">
                            <Zap className="size-3.5" aria-hidden="true" />
                            {mission.xp_reward} XP
                          </span>
                        </p>
                      </div>
                      <ArrowRight
                        className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary"
                        aria-hidden="true"
                      />
                    </div>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
