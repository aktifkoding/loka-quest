import { createServiceClient } from "@/lib/supabase/service-role";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Trophy, Zap, Medal } from "lucide-react";
import { ShareButton } from "@/components/layout/share-button";

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

  const medals = ["text-gold", "text-muted-foreground", "text-warning"];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:py-14">
      <PageHeader
        icon={Trophy}
        title="Papan peringkat"
        description="20 penjelajah dengan XP tertinggi. Hanya nama tampilan yang ditampilkan."
        backHref="/"
        backLabel="Beranda"
        actions={
          <ShareButton
            title="LokaQuest Leaderboard"
            text="Lihat papan peringkat penjelajah budaya di LokaQuest!"
          />
        }
      />

      <Card className="mt-10 overflow-hidden">
        {board.length === 0 ? (
          <div className="m-4">
            <EmptyState
              icon={Trophy}
              title="Belum ada peringkat"
              description="Jadilah yang pertama menyelesaikan misi dan masuk papan peringkat."
              action={{ label: "Mulai misi", href: "/missions" }}
            />
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
