import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service-role";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { CountUp } from "@/components/ui/count-up";
import { SiteFooter } from "@/components/layout/site-footer";
import { ShareButton } from "@/components/layout/share-button";
import { Trophy, Zap, Medal, ArrowLeft, Crown } from "lucide-react";

export const metadata = {
  title: "Leaderboard",
};

export const dynamic = "force-dynamic";

const PODIUM_STYLE = [
  {
    medal: "text-gold",
    ring: "border-gold/45 bg-gradient-to-b from-gold/12 to-card",
    crown: "text-gold",
    place: "1",
  },
  {
    medal: "text-muted-foreground",
    ring: "border-border bg-card",
    crown: "text-muted-foreground",
    place: "2",
  },
  {
    medal: "text-amber-700",
    ring: "border-amber-700/30 bg-card",
    crown: "text-amber-700",
    place: "3",
  },
] as const;

const PODIUM_ORDER = [1, 0, 2]; // 2nd, 1st, 3rd — podium klasik

/**
 * Privacy-conscious leaderboard: display name + XP only, via the service
 * client because progress rows are owner-only under RLS. No emails exposed.
 */
export default async function LeaderboardPage() {
  const service = createServiceClient();

  const { data: rows } = await service
    .from("player_progress")
    .select("profile_id, total_xp, missions_completed, profiles (full_name, level)")
    .order("total_xp", { ascending: false })
    .limit(20);

  const board = (rows ?? [])
    .map((r) => {
      const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
      return {
        name: profile?.full_name || "Penjelajah",
        level: profile?.level ?? 1,
        xp: r.total_xp,
        missions: r.missions_completed,
      };
    })
    .filter((r) => r.xp > 0);

  const podium = board.slice(0, 3);
  const rest = board.slice(3);
  const topXp = board[0]?.xp ?? 0;

  return (
    <>
      <div className="bg-warm-wash">
        <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
            <Link href="/">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Beranda
            </Link>
          </Button>

          <header className="text-center">
            <Reveal>
              <Trophy
                className="animate-float mx-auto size-9 text-gold"
                aria-hidden="true"
              />
            </Reveal>
            <Reveal delay={80}>
              <h1 className="text-gradient mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">
                Papan peringkat
              </h1>
            </Reveal>
            <Reveal delay={140}>
              <div className="mx-auto mt-3 flex max-w-md flex-col items-center gap-3">
                <p className="text-muted-foreground">
                  20 penjelajah dengan XP tertinggi. Hanya nama tampilan yang
                  ditampilkan.
                </p>
                <ShareButton title="LokaQuest Leaderboard" text="Lihat papan peringkat penjelajah budaya di LokaQuest!" />
              </div>
            </Reveal>
          </header>

          {board.length === 0 ? (
            <Reveal delay={200}>
              <Card className="mt-10 overflow-hidden p-10 text-center">
                <p className="font-medium">Belum ada peringkat</p>
                <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
                  Jadilah yang pertama menyelesaikan misi dan masuk papan
                  peringkat.
                </p>
                <Button asChild size="sm" className="mt-4">
                  <Link href="/missions">Mulai misi</Link>
                </Button>
              </Card>
            </Reveal>
          ) : (
            <>
              {/* Podium tiga besar */}
              <div className="mt-10 grid grid-cols-3 items-end gap-3">
                {PODIUM_ORDER.map((index, slot) => {
                  const row = podium[index];
                  if (!row) return null;
                  const style = PODIUM_STYLE[index];
                  return (
                    <Reveal key={row.name + index} delay={slot * 110}>
                      <Card
                        className={`relative p-4 text-center transition-transform duration-200 ease-out-expo hover:-translate-y-1 ${style.ring} ${index === 0 ? "sm:p-6" : "sm:p-4"}`}
                      >
                        {index === 0 && (
                          <Crown
                            className="absolute -top-3.5 left-1/2 size-6 -translate-x-1/2 text-gold"
                            aria-hidden="true"
                          />
                        )}
                        <Medal
                          className={`mx-auto size-6 ${style.medal}`}
                          aria-hidden="true"
                        />
                        <p className="mt-2 truncate font-display text-sm font-semibold sm:text-base">
                          {row.name}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          Level {row.level}
                        </p>
                        <p className="mt-2 flex items-center justify-center gap-1 font-display text-lg font-semibold tabular-nums sm:text-xl">
                          <Zap className="size-4 text-gold" aria-hidden="true" />
                          <CountUp value={row.xp} />
                        </p>
                        <p
                          className={`mx-auto mt-3 rounded-t-md ${index === 0 ? "h-8 bg-gold/20" : index === 1 ? "h-5 bg-secondary" : "h-3 bg-secondary/70"}`}
                        >
                          <span className="sr-only">Peringkat {style.place}</span>
                        </p>
                      </Card>
                    </Reveal>
                  );
                })}
              </div>

              {/* Peringkat 4+ */}
              <Reveal delay={220}>
                <Card className="mt-6 overflow-hidden">
                  <ol className="divide-y divide-border">
                    {rest.map((row, i) => {
                      const rank = i + 4;
                      const width = topXp > 0 ? Math.max(6, (row.xp / topXp) * 100) : 0;
                      return (
                        <li
                          key={row.name + i}
                          className="group flex items-center gap-4 px-6 py-4 transition-colors duration-200 hover:bg-secondary/50"
                        >
                          <span className="flex w-8 justify-center font-display text-lg font-semibold tabular-nums text-muted-foreground">
                            {rank}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium transition-colors group-hover:text-primary">
                              {row.name}
                            </p>
                            <div
                              className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary"
                              aria-hidden="true"
                            >
                              <div
                                className="progress-live h-full rounded-full bg-gradient-to-r from-primary/70 to-gold/70"
                                style={{ width: `${width}%` }}
                              />
                            </div>
                            <p className="mt-1 text-[12px] text-muted-foreground">
                              Level {row.level} · {row.missions} misi selesai
                            </p>
                          </div>
                          <p className="flex shrink-0 items-center gap-1 font-semibold tabular-nums">
                            <Zap className="size-4 text-gold" aria-hidden="true" />
                            {row.xp.toLocaleString("id-ID")}
                          </p>
                        </li>
                      );
                    })}
                  </ol>
                </Card>
              </Reveal>
            </>
          )}
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
