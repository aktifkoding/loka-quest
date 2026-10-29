import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Users,
  BookOpen,
  BarChart3,
  GraduationCap,
  ArrowRight,
  Plus,
} from "lucide-react";

export default async function EducatorDashboardPage() {
  try {
    const user = await requireRole(["educator", "admin"]);
    const supabase = await createClient();

    const { data: groups } = await supabase
      .from("educator_groups")
      .select("id, name, description, created_at")
      .eq("educator_id", user.id)
      .order("created_at", { ascending: false });

    const groups_ = groups ?? [];
    const groupIds = groups_.map((g) => g.id);

    const { count: memberCount } = groupIds.length
      ? await supabase
          .from("educator_group_members")
          .select("profile_id", { count: "exact", head: true })
          .in("group_id", groupIds)
      : { count: 0 };

    return (
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl font-semibold tracking-tight">
              Dasbor pendidik
            </h1>
            <p className="mt-2 text-muted-foreground">
              Pantau progres kelompok siswa dan hasil asesmen pembelajaran.
            </p>
          </div>
          <Button>
            <Plus className="size-4" aria-hidden="true" />
            Buat kelompok
          </Button>
        </header>

        {/* Metric strip */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <Card className="border-primary/25 bg-primary/5">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  Kelompok aktif
                </p>
                <Users className="size-5 text-muted-foreground" aria-hidden="true" />
              </div>
              <p className="mt-4 font-display text-4xl font-semibold tabular-nums">
                {groups_.length}
              </p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                kelompok yang Anda kelola
              </p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  Total siswa
                </p>
                <GraduationCap
                  className="size-5 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
              <p className="mt-4 font-display text-4xl font-semibold tabular-nums">
                {memberCount ?? 0}
              </p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                tergabung di semua kelompok
              </p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  Misi tersedia
                </p>
                <BookOpen className="size-5 text-muted-foreground" aria-hidden="true" />
              </div>
              <p className="mt-4 font-display text-4xl font-semibold tabular-nums">
                3
              </p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                misi budaya yang bisa ditugaskan
              </p>
            </div>
          </Card>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          {/* Groups — dominant column */}
          <Card className="lg:col-span-3">
            <div className="p-6">
              <h2 className="font-display text-xl font-semibold">Kelompok saya</h2>
              {groups_.length > 0 ? (
                <ul className="mt-5 divide-y divide-border">
                  {groups_.map((group) => (
                    <li
                      key={group.id}
                      className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Users className="size-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{group.name}</p>
                        {group.description && (
                          <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
                            {group.description}
                          </p>
                        )}
                      </div>
                      <ArrowRight
                        className="size-4 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-5 rounded-xl border border-dashed border-border px-4 py-10 text-center">
                  <p className="text-sm font-medium">Belum ada kelompok</p>
                  <p className="mx-auto mt-1 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
                    Buat kelompok, lalu tambahkan siswa untuk mulai memantau
                    progres mereka.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Analytics panel */}
          <Card className="lg:col-span-2">
            <div className="flex h-full flex-col p-6">
              <h2 className="font-display text-xl font-semibold">
                Analisis pembelajaran
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Bandingkan hasil pre-test dan post-test untuk melihat perubahan
                pemahaman siswa. Laporan menyertakan jumlah sampel dan
                keterbatasannya.
              </p>
              <div className="mt-auto pt-6">
                <Button asChild className="w-full">
                  <Link href="/educator/analytics">
                    <BarChart3 className="size-4" aria-hidden="true" />
                    Buka analisis
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  } catch {
    redirect("/auth/login");
  }
}
