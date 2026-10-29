import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service-role";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Zap, Medal, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Leaderboard",
};

export const dynamic = "force-dynamic";

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

  const medals = ["text-gold", "text-muted-foreground", "text-amber-700"];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:py-14">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
        <Link href="/">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Beranda
        </Link>
      </Button>

      <header className="text-center">
        <Trophy className="mx-auto size-9 text-gold" aria-hidden="true" />
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight">
          Papan peringkat
        </h1>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          20 penjelajah dengan XP tertinggi. Hanya nama tampilan yang ditampilkan.
        </p>
      </header>

      <Card className="mt-10 overflow-hidden">
        {board.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium">Belum ada peringkat</p>
            <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
              Jadilah yang pertama menyelesaikan misi dan masuk papan peringkat.
            </p>
            <Button asChild size="sm" className="mt-4">
              <Link href="/missions">Mulai misi</Link>
            </Button>
          </div>
        ) : (
          <ol className="divide-y divide-border">
            {board.map((row, i) => (
              <li
                key={row.name + i}
                className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-secondary/50"
              >
                <span
                  className={`flex w-8 justify-center font-display text-lg font-semibold tabular-nums ${
                    medals[i] ?? "text-muted-foreground"
                  }`}
                >
                  {i < 3 ? (
                    <Medal className="size-5" aria-hidden="true" />
                  ) : (
                    i + 1
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{row.name}</p>
                  <p className="text-[12px] text-muted-foreground">
                    Level {row.level} · {row.missions} misi selesai
                  </p>
                </div>
                <p className="flex shrink-0 items-center gap-1 font-semibold tabular-nums">
                  <Zap className="size-4 text-gold" aria-hidden="true" />
                  {row.xp.toLocaleString("id-ID")}
                </p>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}
