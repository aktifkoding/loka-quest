import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollStagger } from "@/components/landing/motion";
import {
  Users,
  BookOpen,
  BarChart3,
  GraduationCap,
  ArrowRight,
  Plus,
  UserPlus,
  LineChart,
} from "lucide-react";

export default async function EducatorDashboardPage() {
  try {
    const user = await requireRole(["educator", "admin"]);
    const supabase = await createClient();

    const [groupsRes, missionsRes] = await Promise.all([
      supabase
        .from("educator_groups")
        .select("id, name, description, created_at")
        .eq("educator_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("missions")
        .select("id", { count: "exact", head: true })
        .eq("status", "published"),
    ]);

    const groups_ = groupsRes.data ?? [];
    const groupIds = groups_.map((g) => g.id);

    const { count: memberCount } = groupIds.length
      ? await supabase
          .from("educator_group_members")
          .select("profile_id", { count: "exact", head: true })
          .in("group_id", groupIds)
      : { count: 0 };

    const totalMissions = missionsRes.count ?? 0;

    const firstSteps = [
      {
        icon: Plus,
        title: "Buat kelompok kelas",
        description: "Satu kelompok per kelas atau klub budaya.",
      },
      {
        icon: UserPlus,
        title: "Tugaskan misi & kuis",
        description: "Siswa bergabung dengan kode kelompok, lalu mengerjakan misi budaya.",
      },
      {
        icon: LineChart,
        title: "Pantau perkembangan",
        description: "Bandingkan pre-test dan post-test di analisis pembelajaran.",
      },
    ];

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
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/educator/groups">
                <Plus className="size-4" aria-hidden="true" />
                Kelola kelompok
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/educator/quiz">Kuis live</Link>
            </Button>
          </div>
        </header>

        {/* Metric strip */}
        <ScrollStagger className="mt-10 grid gap-4 sm:grid-cols-3">
          <Card data-stagger-item className="border-primary/25 bg-primary/5">
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

          <Card data-stagger-item>
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

          <Card data-stagger-item>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  Misi tersedia
                </p>
                <BookOpen className="size-5 text-muted-foreground" aria-hidden="true" />
              </div>
              <p className="mt-4 font-display text-4xl font-semibold tabular-nums">
                {totalMissions}
              </p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                misi budaya yang bisa ditugaskan
              </p>
            </div>
          </Card>
        </ScrollStagger>

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
                      className="first:pt-0 last:pb-0"
                    >
                      <Link
                        href="/educator/groups"
                        className="group -mx-3 flex items-center gap-4 rounded-lg px-3 py-4 transition-colors duration-150 hover:bg-secondary/60"
                      >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-150 group-hover:bg-primary group-hover:text-primary-foreground">
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
                          className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-5 rounded-xl border border-dashed border-border px-4 py-10 text-center">
                  <p className="text-sm font-medium">Belum ada kelompok</p>
                  <p className="mx-auto mt-1 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
                    Buat kelompok pertama — misalnya “Kelas 8A” — lalu bagikan
                    kode gabung ke siswa.
                  </p>
                  <Button asChild size="sm" className="mt-4">
                    <Link href="/educator/groups">
                      <Plus className="size-4" aria-hidden="true" />
                      Buat kelompok pertama
                    </Link>
                  </Button>
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

        {/* First-run path — hanya tampil saat pendidik belum punya kelompok */}
        {groups_.length === 0 && (
          <section className="mt-10">
            <h2 className="font-display text-xl font-semibold">
              Mulai dalam tiga langkah
            </h2>
            <ol className="mt-5 grid gap-4 md:grid-cols-3">
              {firstSteps.map((step, index) => (
                <li key={step.title}>
                  <Card className="h-full">
                    <div className="p-5">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <step.icon className="size-4" aria-hidden="true" />
                        </span>
                        <span className="text-[13px] font-medium tabular-nums text-muted-foreground">
                          Langkah {index + 1}
                        </span>
                      </div>
                      <p className="mt-3 text-sm font-semibold">{step.title}</p>
                      <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </Card>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    );
  } catch {
    redirect("/auth/login");
  }
}
