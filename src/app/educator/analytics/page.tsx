import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service-role";
import { requireRole } from "@/lib/auth/session";
import { getServerI18n } from "@/lib/i18n/server";
import { educatorDict as d } from "@/lib/i18n/dict/educator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Reveal } from "@/components/ui/reveal";
import { CountUp } from "@/components/ui/count-up";
import { ArrowLeft, Users, Target, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerI18n();
  return { title: t(d.analyticsMetaTitle) };
}

/**
 * Aggregate learning analytics for the educator's own groups.
 * Group ownership is verified first; member learning data is then read with
 * the service client because attempt rows are owner-only under RLS by design.
 */
export default async function EducatorAnalyticsPage() {
  try {
    const educator = await requireRole(["educator", "admin"]);
    const supabase = await createClient();
    const { t } = await getServerI18n();

    const { data: groups } = await supabase
      .from("educator_groups")
      .select("id, name")
      .eq("educator_id", educator.id)
      .order("created_at", { ascending: false });

    const groupList = (groups ?? []) as { id: string; name: string }[];
    const groupIds = groupList.map((g) => g.id);

    const { data: memberships } = groupIds.length
      ? await supabase
          .from("educator_group_members")
          .select("group_id, profile_id")
          .in("group_id", groupIds)
      : { data: null };

    const memberRows = (memberships ?? []) as { group_id: string; profile_id: string }[];
    const memberIds = [...new Set(memberRows.map((m) => m.profile_id))];

    let attemptStats = { total: 0, avgScore: 0 };
    let assessmentStats = { pre: null as number | null, post: null as number | null };

    if (memberIds.length > 0) {
      // Authorized privileged read: only members of this educator's groups
      const service = createServiceClient();

      const [{ data: attempts }, { data: resp }] = await Promise.all([
        service
          .from("mission_attempts")
          .select("profile_id, score")
          .in("profile_id", memberIds),
        service
          .from("assessment_responses")
          .select("profile_id, score, learning_assessments (assessment_type)")
          .in("profile_id", memberIds),
      ]);

      const scores = ((attempts ?? []) as { score: number }[]).map((a) => a.score);
      attemptStats = {
        total: scores.length,
        avgScore:
          scores.length > 0
            ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length)
            : 0,
      };

      const byType: Record<string, number[]> = {};
      (resp ?? []).forEach((r: { profile_id: string; score: number; learning_assessments: { assessment_type: string } | { assessment_type: string }[] | null }) => {
        const t = Array.isArray(r.learning_assessments)
          ? r.learning_assessments[0]?.assessment_type
          : r.learning_assessments?.assessment_type;
        if (t) {
          byType[t] = byType[t] ?? [];
          byType[t].push(r.score);
        }
      });
      const avg = (xs: number[]) =>
        xs.length > 0
          ? Math.round(xs.reduce((s, v) => s + v, 0) / xs.length)
          : null;
      assessmentStats = { pre: avg(byType.pre ?? []), post: avg(byType.post ?? []) };
    }

    const delta =
      assessmentStats.pre !== null && assessmentStats.post !== null
        ? assessmentStats.post - assessmentStats.pre
        : null;

    return (
      <div className="mx-auto max-w-4xl px-4 py-10 md:py-14">
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
          <Link href="/educator/dashboard">
            <ArrowLeft className="size-4" aria-hidden="true" />
            {t(d.backToDashboard)}
          </Link>
        </Button>

        <header>
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            {t(d.analyticsTitle)}
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {t(d.analyticsDescription)}
          </p>
        </header>

        {groupList.length === 0 || memberIds.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              icon={Users}
              title={t(d.analyticsEmptyTitle)}
              description={t(d.analyticsEmptyDescription)}
            />
          </div>
        ) : (
          <>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <Reveal delay={60}>
                <Card className="border-primary/25 bg-primary/5">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-muted-foreground">
                        {t(d.monitoredStudents)}
                      </p>
                      <Users className="size-5 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <p className="mt-4 font-display text-4xl font-semibold tabular-nums">
                      <CountUp value={memberIds.length} />
                    </p>
                    <p className="mt-1 text-[13px] text-muted-foreground">
                      {t(d.inGroups, { n: groupList.length })}
                    </p>
                  </div>
                </Card>
              </Reveal>

              <Reveal delay={120}>
                <Card>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-muted-foreground">
                        {t(d.avgMissionScore)}
                      </p>
                      <Target className="size-5 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <p className="mt-4 font-display text-4xl font-semibold tabular-nums">
                      <CountUp value={attemptStats.avgScore} suffix="/100" />
                    </p>
                    <p className="mt-1 text-[13px] text-muted-foreground">
                      {t(d.fromAttempts, { n: attemptStats.total })}
                    </p>
                  </div>
                </Card>
              </Reveal>
            </div>

            <Reveal delay={160}>
            <Card className="mt-6">
              <div className="p-6">
                <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
                  <TrendingUp className="size-5 text-primary" aria-hidden="true" />
                  {t(d.prePostHeading)}
                </h2>
                {assessmentStats.pre === null || assessmentStats.post === null ? (
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {t(d.waitingAssessments)}
                  </p>
                ) : (
                  <div className="mt-5">
                    <div className="grid grid-cols-3 items-center gap-4 text-center">
                      <div>
                        <p className="text-[13px] text-muted-foreground">{t(d.preTest)}</p>
                        <p className="font-display text-3xl font-semibold tabular-nums">
                          {assessmentStats.pre}
                        </p>
                      </div>
                      <div>
                        <p className="font-display text-3xl font-semibold tabular-nums text-primary">
                          {delta! > 0 ? `+${delta}` : delta}
                        </p>
                        <p className="text-[13px] text-muted-foreground">{t(d.change)}</p>
                      </div>
                      <div>
                        <p className="text-[13px] text-muted-foreground">{t(d.postTest)}</p>
                        <p className="font-display text-3xl font-semibold tabular-nums">
                          {assessmentStats.post}
                        </p>
                      </div>
                    </div>
                    {/* Bar pre vs post (skala 0–100) */}
                    <div className="mt-6 space-y-2.5" aria-hidden="true">
                      <div className="flex items-center gap-3">
                        <span className="w-16 text-right text-xs text-muted-foreground">Pre</span>
                        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
                          <div className="h-full rounded-full bg-muted-foreground/50" style={{ width: `${assessmentStats.pre}%` }} />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-16 text-right text-xs text-muted-foreground">Post</span>
                        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
                          <div className="progress-live h-full rounded-full bg-gradient-to-r from-primary to-gold" style={{ width: `${assessmentStats.post}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <p className="mt-5 border-t border-border pt-4 text-[12px] leading-relaxed text-muted-foreground">
                  {t(d.privacyNote)}
                </p>
              </div>
            </Card>
            </Reveal>
          </>
        )}
      </div>
    );
  } catch {
    redirect("/auth/login");
  }
}
