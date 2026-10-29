import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { calculateLevel } from "@/lib/scoring";
import {
  Zap,
  Target,
  Award,
  ArrowRight,
  Gamepad2,
  Trophy,
} from "lucide-react";

const XP_PER_LEVEL = 500;

export default async function PlayerDashboardPage() {
  try {
    const user = await requireAuth();
    const supabase = await createClient();

    const [progressRes, achievementsRes, attemptsRes] = await Promise.all([
      supabase
        .from("player_progress")
        .select("total_xp, missions_completed, current_level")
        .eq("profile_id", user.id)
        .single(),
      supabase
        .from("user_achievements")
        .select("earned_at, achievements (id, title, description, icon)")
        .eq("profile_id", user.id)
        .order("earned_at", { ascending: false }),
      supabase
        .from("mission_attempts")
        .select("id, mission_id, score, xp_earned, completed, completed_at")
        .eq("profile_id", user.id)
        .order("completed_at", { ascending: false, nullsFirst: false })
        .limit(5),
    ]);

    const progress = progressRes.data ?? {
      total_xp: 0,
      missions_completed: 0,
      current_level: 1,
    };
    // Supabase nested select can return an object or a one-element array
    type AchievementRow = {
      title: string;
      description: string;
      icon: string;
    };
    const achievements: AchievementRow[] = (achievementsRes.data ?? [])
      .map((ua): AchievementRow | undefined =>
        Array.isArray(ua.achievements) ? ua.achievements[0] : ua.achievements
      )
      .filter((a): a is AchievementRow => Boolean(a));
    const recentAttempts = attemptsRes.data ?? [];

    const totalXp = progress.total_xp;
    const level = calculateLevel(totalXp);
    const xpIntoLevel = totalXp % XP_PER_LEVEL;
    const xpToNext = XP_PER_LEVEL - xpIntoLevel;

    return (
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <header className="max-w-2xl">
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            Dasbor
          </h1>
          <p className="mt-2 text-muted-foreground">
            {user.email ? `Halo, ${user.email.split("@")[0]}.` : "Selamat datang."}{" "}
            Inilah perjalanan belajarmu sejauh ini.
          </p>
        </header>

        {/* Metric tier: hero (XP to next level) + supports */}
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Card className="border-primary/25 bg-primary/5 md:row-span-2">
            <div className="flex h-full flex-col justify-between p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  Level {level}
                </p>
                <Zap className="size-5 text-gold" aria-hidden="true" />
              </div>
              <div className="py-6">
                <p className="font-display text-5xl font-semibold tabular-nums">
                  {totalXp.toLocaleString("id-ID")}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  total XP terkumpul
                </p>
              </div>
              <div>
                <div
                  className="h-1.5 w-full overflow-hidden rounded-full bg-primary/15"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={XP_PER_LEVEL}
                  aria-valuenow={xpIntoLevel}
                  aria-label={`Progres menuju level ${level + 1}`}
                >
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-300"
                    style={{ width: `${(xpIntoLevel / XP_PER_LEVEL) * 100}%` }}
                  />
                </div>
                <p className="mt-2 text-[13px] text-muted-foreground">
                  <span className="tabular-nums">{xpToNext}</span> XP lagi ke
                  level {level + 1}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  Misi selesai
                </p>
                <Target className="size-5 text-muted-foreground" aria-hidden="true" />
              </div>
              <p className="mt-4 font-display text-4xl font-semibold tabular-nums">
                {progress.missions_completed}
              </p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                dari 3 misi yang tersedia
              </p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  Lencana
                </p>
                <Award className="size-5 text-muted-foreground" aria-hidden="true" />
              </div>
              <p className="mt-4 font-display text-4xl font-semibold tabular-nums">
                {achievements.length}
              </p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                penghargaan yang sudah diraih
              </p>
            </div>
          </Card>
        </div>

        {/* Two content columns: achievements + recent attempts */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <div className="p-6">
              <h2 className="font-display text-xl font-semibold">
                Lencana terbaru
              </h2>
              {achievements.length > 0 ? (
                <ul className="mt-5 space-y-3">
                  {achievements.slice(0, 4).map((badge, i) => (
                    <li key={i} className="flex items-center gap-3.5">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold/10">
                        <Trophy className="size-4 text-gold" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{badge.title}</p>
                        <p className="truncate text-[13px] text-muted-foreground">
                          {badge.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-5 rounded-xl border border-dashed border-border px-4 py-8 text-center">
                  <p className="text-sm font-medium">Belum ada lencana</p>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    Selesaikan misi pertama untuk meraih lencana.
                  </p>
                  <Button asChild size="sm" className="mt-4">
                    <Link href="/missions">Pilih misi</Link>
                  </Button>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h2 className="font-display text-xl font-semibold">
                Riwayat misi terakhir
              </h2>
              {recentAttempts.length > 0 ? (
                <table className="mt-5 w-full text-sm">
                  <caption className="sr-only">
                    Lima percobaan misi terakhir beserta nilai dan XP
                  </caption>
                  <thead>
                    <tr className="border-b border-border text-left text-[13px] text-muted-foreground">
                      <th scope="col" className="pb-2 font-medium">
                        Misi
                      </th>
                      <th scope="col" className="pb-2 text-right font-medium">
                        Nilai
                      </th>
                      <th scope="col" className="pb-2 text-right font-medium">
                        XP
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentAttempts.map((attempt) => (
                      <tr
                        key={attempt.id}
                        className="transition-colors hover:bg-secondary/50"
                      >
                        <td className="py-2.5 font-medium">
                          #{String(attempt.mission_id).slice(0, 8)}
                        </td>
                        <td className="py-2.5 text-right tabular-nums">
                          {attempt.score}
                        </td>
                        <td className="py-2.5 text-right tabular-nums">
                          +{attempt.xp_earned}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="mt-5 rounded-xl border border-dashed border-border px-4 py-8 text-center">
                  <p className="text-sm font-medium">Belum ada riwayat</p>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    Mainkan misi pertamamu — nilainya tercatat di sini.
                  </p>
                  <Button asChild size="sm" className="mt-4">
                    <Link href="/missions">
                      <Gamepad2 className="size-4" aria-hidden="true" />
                      Mulai misi
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  } catch {
    redirect("/auth/login");
  }
}
