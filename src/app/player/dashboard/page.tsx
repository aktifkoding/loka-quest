import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/session";
import { getServerI18n } from "@/lib/i18n/server";
import { commonDict } from "@/lib/i18n/dict/common";
import { playerDict } from "@/lib/i18n/dict/player";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { CountUp } from "@/components/ui/count-up";
import { AnimatedMeter } from "@/components/ui/animated-meter";
import { calculateLevel } from "@/lib/scoring";
import { Onboarding } from "@/components/layout/onboarding";
import { DailyChallengeCard } from "@/components/game/daily-challenge-card";
import { PersonalizedRecommendations } from "@/components/dashboard/personalized-recommendations";
import { generatePersonalizedRecommendations } from "@/lib/recommendations";
import {
  Zap,
  Target,
  Award,
  ArrowRight,
  Gamepad2,
  Trophy,
  BookOpen,
  Gem,
  UserRound,
  BarChart3,
  RotateCcw,
  Users,
  Languages,
} from "lucide-react";

const XP_PER_LEVEL = 500;

export default async function PlayerDashboardPage() {
  try {
    const { lang, t } = await getServerI18n();
    const user = await requireAuth();
    const supabase = await createClient();

    const [progressRes, achievementsRes, attemptsRes, assessmentsRes, dueReviewsRes, missionsCountRes] = await Promise.all([
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
        .select("id, mission_id, score, xp_earned, completed, completed_at, missions (title, slug)")
        .eq("profile_id", user.id)
        .order("completed_at", { ascending: false, nullsFirst: false })
        .limit(5),
      supabase
        .from("assessment_responses")
        .select("score, learning_assessments (assessment_type)")
        .eq("profile_id", user.id)
        .order("submitted_at", { ascending: false }),
      supabase
        .from("review_items")
        .select("question_id", { count: "exact", head: true })
        .eq("profile_id", user.id)
        .lte("due_at", new Date().toISOString()),
      supabase
        .from("missions")
        .select("id", { count: "exact", head: true })
        .eq("status", "published"),
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
    const recentAttempts = (attemptsRes.data ?? []).map(
      (a: {
        id: string;
        mission_id: string;
        score: number;
        xp_earned: number;
        completed: boolean;
        completed_at: string | null;
        missions: { title: string; slug?: string } | { title: string; slug?: string }[] | null;
      }) => {
        const m = Array.isArray(a.missions) ? a.missions[0] : a.missions;
        return {
          ...a,
          missionTitle: m?.title ?? null,
          missionSlug: m?.slug ?? null,
        };
      }
    );

    // Pre/post assessment delta
    const byType: Record<string, number[]> = {};
    ((assessmentsRes.data ?? []) as {
      score: number;
      learning_assessments: { assessment_type: string } | { assessment_type: string }[] | null;
    }[]).forEach((r) => {
      const t = Array.isArray(r.learning_assessments)
        ? r.learning_assessments[0]?.assessment_type
        : r.learning_assessments?.assessment_type;
      if (t) {
        byType[t] = byType[t] ?? [];
        byType[t].push(r.score);
      }
    });
    const avg = (xs: number[]) =>
      xs.length > 0 ? Math.round(xs.reduce((s, v) => s + v, 0) / xs.length) : null;
    const preScore = avg(byType.pre ?? []);
    const postScore = avg(byType.post ?? []);

    const totalXp = progress.total_xp;
    const level = calculateLevel(totalXp);
    const xpIntoLevel = totalXp % XP_PER_LEVEL;
    const xpToNext = XP_PER_LEVEL - xpIntoLevel;

    const completedSlugs = recentAttempts
      .filter((a) => a.completed)
      .map((a) => a.missionSlug)
      .filter((s): s is string => Boolean(s));

    const recommendations = generatePersonalizedRecommendations({
      userId: user.id,
      totalXp,
      currentLevel: level,
      missionsCompleted: progress.missions_completed,
      completedSlugs,
      recentScores: recentAttempts.map((a) => a.score),
      dueReviewCount: dueReviewsRes.count ?? 0,
      dailyCompletedToday: false,
    }, lang);

    return (
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <Onboarding />
        <DailyChallengeCard />
        <header className="mt-10 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl font-semibold tracking-tight">
              {t(playerDict.dashboardTitle)}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {user.fullName
                ? t(playerDict.greetingHello, { name: user.fullName })
                : t(playerDict.greetingWelcome)}{" "}
              {t(playerDict.greetingIntro)}
            </p>
          </div>
          {(user.role === "educator" || user.role === "admin") && (
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/educator/dashboard">Dasbor Pendidik</Link>
              </Button>
              {user.role === "admin" && (
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin">Dasbor Admin</Link>
                </Button>
              )}
            </div>
          )}
        </header>

        {/* Metric tier: hero (XP to next level) + supports */}
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Card className="border-primary/25 bg-primary/5 md:row-span-2">
            <div className="flex h-full flex-col justify-between p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  {t(commonDict.level, { n: level })}
                </p>
                <Zap className="size-5 text-gold" aria-hidden="true" />
              </div>
              <div className="py-6">
                <p className="font-display text-5xl font-semibold tabular-nums">
                  <CountUp value={totalXp} duration={900} />
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t(playerDict.totalXpCaption)}
                </p>
              </div>
              <div>
                <AnimatedMeter
                  value={(xpIntoLevel / XP_PER_LEVEL) * 100}
                  className="h-1.5 w-full overflow-hidden rounded-full bg-primary/15"
                  barClassName="h-full rounded-full bg-primary"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={XP_PER_LEVEL}
                  aria-valuenow={xpIntoLevel}
                  aria-label={t(playerDict.progressToNextLevelAria, { n: level + 1 })}
                />
                <p className="mt-2 text-[13px] text-muted-foreground">
                  <span className="tabular-nums">{xpToNext}</span>{" "}
                  {t(playerDict.xpToNextLevel, { n: level + 1 })}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  {t(playerDict.missionsCompletedLabel)}
                </p>
                <Target className="size-5 text-muted-foreground" aria-hidden="true" />
              </div>
              <p className="mt-4 font-display text-4xl font-semibold tabular-nums">
                {progress.missions_completed}
              </p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                dari{" "}
                <span className="tabular-nums">
                  {missionsCountRes.count ?? 0}
                </span>{" "}
                {t(playerDict.missionsAvailableSuffix)}
              </p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  {t(playerDict.badgesLabel)}
                </p>
                <Award className="size-5 text-muted-foreground" aria-hidden="true" />
              </div>
              <p className="mt-4 font-display text-4xl font-semibold tabular-nums">
                {achievements.length}
              </p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                {t(playerDict.badgesCaption)}
              </p>
            </div>
          </Card>
        </div>

        {/* Pre/post assessment progress */}
        {(preScore !== null || postScore !== null) && (
          <Card className="mt-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 p-5">
              <p className="flex items-center gap-2 text-sm">
                <BookOpen className="size-4 text-muted-foreground" aria-hidden="true" />
                <span className="text-muted-foreground">{t(playerDict.assessmentLabel)}</span>
                <span className="tabular-nums">
                  {t(playerDict.assessmentDelta, {
                    pre: preScore ?? "—",
                    post: postScore ?? "—",
                  })}
                </span>
              </p>
              {preScore !== null && postScore !== null && postScore !== preScore && (
                <p
                  className={`rounded-full px-3 py-1 text-[13px] font-semibold tabular-nums ${
                    postScore > preScore
                      ? "bg-primary/10 text-primary"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {postScore > preScore ? "+" : ""}
                  {postScore - preScore} {t(playerDict.understandingPoints)}
                </p>
              )}
              <Button asChild variant="ghost" size="sm" className="ml-auto -mr-2">
                <Link href="/player/assessments">
                  {t(playerDict.viewAssessments)}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </Card>
        )}

        {/* Personalized Content Recommendations */}
        <PersonalizedRecommendations recommendations={recommendations} />

        {/* Quick links */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[
            { href: "/player/classes", label: t(playerDict.quickClasses), icon: Users, desc: t(playerDict.quickClassesDesc) },
            { href: "/player/review", label: t(playerDict.quickReview), icon: RotateCcw, desc: t(playerDict.quickReviewDesc) },
            { href: "/bahasa", label: t(playerDict.quickLanguages), icon: Languages, desc: t(playerDict.quickLanguagesDesc) },
            { href: "/player/collection", label: t(playerDict.quickCollection), icon: Gem, desc: t(playerDict.quickCollectionDesc) },
            { href: "/player/profile", label: t(playerDict.quickProfile), icon: UserRound, desc: t(playerDict.quickProfileDesc) },
            { href: "/leaderboard", label: t(playerDict.quickLeaderboard), icon: BarChart3, desc: t(playerDict.quickLeaderboardDesc) },
          ].map((link) => (
            <Link key={link.href} href={link.href} className="group">
              <Card interactive className="h-full">
                <div className="flex items-center gap-3.5 p-5">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <link.icon className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{link.label}</p>
                    <p className="truncate text-[12px] text-muted-foreground">
                      {link.desc}
                    </p>
                  </div>
                  <ArrowRight
                    className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
                    aria-hidden="true"
                  />
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Two content columns: achievements + recent attempts */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <div className="p-6">
              <h2 className="font-display text-xl font-semibold">
                {t(playerDict.recentBadgesTitle)}
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
                <div className="mt-5">
                  <EmptyState
                    icon={Award}
                    title={t(playerDict.emptyBadgesTitle)}
                    description={t(playerDict.emptyBadgesDesc)}
                    action={{ label: t(playerDict.pickMission), href: "/missions" }}
                  />
                </div>
              )}
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h2 className="font-display text-xl font-semibold">
                {t(playerDict.recentMissionsTitle)}
              </h2>
              {recentAttempts.length > 0 ? (
                <table className="mt-5 w-full text-sm">
                  <caption className="sr-only">
                    {t(playerDict.attemptsTableCaption)}
                  </caption>
                  <thead>
                    <tr className="border-b border-border text-left text-[13px] text-muted-foreground">
                      <th scope="col" className="pb-2 font-medium">
                        {t(playerDict.tableMission)}
                      </th>
                      <th scope="col" className="pb-2 text-right font-medium">
                        {t(playerDict.tableScore)}
                      </th>
                      <th scope="col" className="pb-2 text-right font-medium">
                        XP
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentAttempts.map((attempt) => (
                      <tr
                        key={`${attempt.mission_id}-${attempt.score}-${attempt.xp_earned}`}
                        className="transition-colors hover:bg-secondary/50"
                      >
                        <td className="py-2.5 font-medium">
                          {attempt.missionTitle ?? `#${String(attempt.mission_id).slice(0, 8)}`}
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
                <div className="mt-5">
                  <EmptyState
                    icon={Gamepad2}
                    title={t(playerDict.emptyHistoryTitle)}
                    description={t(playerDict.emptyHistoryDesc)}
                    action={{ label: t(playerDict.startMission), href: "/missions" }}
                  />
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
