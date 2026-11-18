import { createServiceClient } from "@/lib/supabase/service-role";
import { formatNumber } from "@/lib/i18n";
import { getServerI18n } from "@/lib/i18n/server";
import { miscDict as d } from "@/lib/i18n/dict/misc";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Trophy, Zap, Medal, Crown } from "lucide-react";
import { ShareButton } from "@/components/layout/share-button";

export const dynamic = "force-dynamic";

/**
 * Privacy-conscious leaderboard: display name + XP only, via the service
 * client because progress rows are owner-only under RLS. No emails exposed.
 */
export async function generateMetadata() {
  const { t } = await getServerI18n();
  return { title: t(d.leaderboardMetaTitle) };
}

export default async function LeaderboardPage() {
  const service = createServiceClient();
  const { t, lang } = await getServerI18n();

  const { data: rows, error } = await service
    .from("player_progress")
    .select("profile_id, total_xp, missions_completed, profiles (full_name, level)")
    .order("total_xp", { ascending: false })
    .limit(20);

  // Kegagalan query tidak boleh tampil sebagai papan peringkat yang kosong.
  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 md:py-14">
        <PageHeader
          icon={Trophy}
          title={t(d.leaderboardTitle)}
          description={t(d.leaderboardDescription)}
          backHref="/"
          backLabel={t(d.homeBackLabel)}
        />
        <Card className="mt-10 overflow-hidden">
          <div className="m-4">
            <EmptyState
              icon={Trophy}
              title={t(d.leaderboardErrorTitle)}
              description={t(d.leaderboardErrorDescription)}
            />
          </div>
        </Card>
      </div>
    );
  }

  const board = (rows ?? [])
    .map((r) => {
      const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
      return {
        name: profile?.full_name || t(d.explorerFallback),
        level: profile?.level ?? 1,
        xp: r.total_xp,
        missions: r.missions_completed,
      };
    })
    .filter((r) => r.xp > 0);

  const podium = board.slice(0, 3);
  const rest = board.slice(3);

  const podiumStyles = [
    {
      ring: "border-[#D4AF37]/60 bg-gradient-to-b from-[#D4AF37]/12 to-card shadow-raised",
      badge: "bg-[#D4AF37] text-[#121214]",
      iconColor: "text-[#D4AF37]",
      order: "md:order-2 md:-translate-y-2",
    },
    {
      ring: "border-border/90 bg-card shadow-card",
      badge: "bg-secondary text-foreground",
      iconColor: "text-muted-foreground",
      order: "md:order-1",
    },
    {
      ring: "border-[#9C6B3B]/45 bg-gradient-to-b from-[#9C6B3B]/10 to-card shadow-card",
      badge: "bg-[#9C6B3B] text-stone-50",
      iconColor: "text-[#9C6B3B]",
      order: "md:order-3",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <PageHeader
        icon={Trophy}
        title={t(d.leaderboardTitle)}
        description={t(d.leaderboardDescription)}
        backHref="/"
        backLabel={t(d.homeBackLabel)}
        actions={
          <ShareButton
            title={t(d.shareTitle)}
            text={t(d.shareText)}
          />
        }
      />

      {board.length === 0 ? (
        <Card className="mt-10 overflow-hidden">
          <div className="m-4">
            <EmptyState
              icon={Trophy}
              title={t(d.leaderboardEmptyTitle)}
              description={t(d.leaderboardEmptyDescription)}
              action={{ label: t(d.startMissionCta), href: "/missions" }}
            />
          </div>
        </Card>
      ) : (
        <div className="mt-10 space-y-6">
          {/* Podium Top 3 Nusantara */}
          <div className="grid gap-4 md:grid-cols-3 md:items-end">
            {podium.map((row, idx) => {
              const style = podiumStyles[idx];
              return (
                <div
                  key={row.name + idx}
                  className={`relative rounded-2xl border p-5 transition-transform duration-300 hover:-translate-y-1 ${style.ring} ${style.order}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex size-7 items-center justify-center rounded-full font-display text-xs font-bold ${style.badge}`}
                    >
                      #{idx + 1}
                    </span>
                    {idx === 0 ? (
                      <Crown className={`size-5 ${style.iconColor}`} aria-hidden="true" />
                    ) : (
                      <Medal className={`size-5 ${style.iconColor}`} aria-hidden="true" />
                    )}
                  </div>
                  <p className="mt-3 truncate font-display text-lg font-semibold">
                    {row.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {t(d.levelMissions, { level: row.level, missions: row.missions })}
                  </p>
                  <p className="mt-4 flex items-center gap-1.5 font-display text-xl font-semibold tabular-nums">
                    <Zap className="size-4 text-[#D4AF37]" aria-hidden="true" />
                    {formatNumber(row.xp, lang)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Remaining ranks 4+ */}
          {rest.length > 0 ? (
            <Card className="overflow-hidden">
              <ol className="divide-y divide-border" start={4}>
                {rest.map((row, i) => (
                  <li
                    key={row.name + (i + 3)}
                    className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-secondary/50"
                  >
                    <span className="flex w-8 justify-center font-display text-base font-semibold tabular-nums text-muted-foreground">
                      {i + 4}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{row.name}</p>
                      <p className="text-[12px] text-muted-foreground">
                        {t(d.levelMissions, { level: row.level, missions: row.missions })}
                      </p>
                    </div>
                    <p className="flex shrink-0 items-center gap-1 font-semibold tabular-nums">
                      <Zap className="size-4 text-gold" aria-hidden="true" />
                      {formatNumber(row.xp, lang)}
                    </p>
                  </li>
                ))}
              </ol>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  );
}
