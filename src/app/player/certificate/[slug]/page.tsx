import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/session";
import { getServerI18n } from "@/lib/i18n/server";
import { commonDict } from "@/lib/i18n/dict/common";
import { playerDict } from "@/lib/i18n/dict/player";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AnimatedMeter } from "@/components/ui/animated-meter";
import { evaluateCertificate } from "@/lib/certificate";
import { Award, ScrollText } from "lucide-react";
import { PrintButton } from "./print-button";

export const metadata: Metadata = {
  title: "Sertifikat Penjelajah Budaya — LokaQuest",
};

export default async function RegionCertificatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  try {
    const { lang, t } = await getServerI18n();
    const user = await requireAuth();
    const { slug } = await params;
    const supabase = await createClient();

    const { data: region } = await supabase
      .from("cultural_regions")
      .select("id, slug, name, description")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (!region) {
      return (
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <Card className="p-10">
            <p className="font-display text-xl">{t(commonDict.notFound)}</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/explore">{t(commonDict.back)}</Link>
            </Button>
          </Card>
        </div>
      );
    }

    const [{ data: missions }, attemptsRes] = await Promise.all([
      supabase
        .from("missions")
        .select("id, title, xp_reward")
        .eq("region_id", region.id)
        .eq("status", "published"),
      supabase
        .from("mission_attempts")
        .select("mission_id, completed, completed_at")
        .eq("profile_id", user.id)
        .order("completed_at", { ascending: false, nullsFirst: false }),
    ]);

    const attempts = (attemptsRes.data ?? []).map((a) => ({
      mission_id: a.mission_id,
      completed: a.completed,
      completedAt: a.completed_at,
    }));
    const outcome = evaluateCertificate(missions ?? [], attempts);
    const displayName = user.fullName || user.email.split("@")[0];
    const issued = outcome.lastCompletedAt ?? new Date().toISOString();

    if (!outcome.eligible) {
      // Belum tuntas: tampilkan progres + dorongan melanjutkan misi
      return (
        <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
          <Card className="p-8">
            <div className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ScrollText className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h1 className="font-display text-2xl font-semibold">
                  {t(playerDict.certificateTitle)} — {region.name}
                </h1>
                <p className="mt-2 text-muted-foreground">
                  {t(playerDict.certificateProgressHeading)}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <AnimatedMeter
                value={
                  outcome.totalMissions > 0
                    ? (outcome.completedMissions / outcome.totalMissions) * 100
                    : 0
                }
                className="h-2 w-full overflow-hidden rounded-full bg-primary/15"
                barClassName="h-full rounded-full bg-primary"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={
                  outcome.totalMissions > 0
                    ? Math.round((outcome.completedMissions / outcome.totalMissions) * 100)
                    : 0
                }
                aria-label={t(playerDict.certificateMissionsNote, {
                  done: outcome.completedMissions,
                  total: outcome.totalMissions,
                })}
              />
              <p className="mt-2 text-sm text-muted-foreground">
                {t(playerDict.certificateMissionsNote, {
                  done: outcome.completedMissions,
                  total: outcome.totalMissions,
                })}
              </p>
            </div>
            <Button asChild className="mt-6">
              <Link href={`/regions/${slug}`}>{t(playerDict.certificateNotReadyCta)}</Link>
            </Button>
          </Card>
        </div>
      );
    }

    // Sertifikat layak cetak
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
        <div className="no-print mb-4 flex justify-end">
          <PrintButton label={t(playerDict.certificatePrintCta)} />
        </div>
        <div
          aria-label={t(playerDict.certificateTitle)}
          className="relative rounded-2xl border-4 border-primary/70 bg-background p-8 text-center md:p-14"
        >
          {/* Bingkai ganda gaya batik */}
          <div
            className="pointer-events-none absolute inset-3 rounded-xl border border-gold/60"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-4 rounded-lg border border-dashed border-primary/40"
            aria-hidden="true"
          />

          <p className="font-display text-sm uppercase tracking-[0.3em] text-muted-foreground">
            {t(playerDict.certificateTitle)}
          </p>
          <Award className="mx-auto mt-6 size-12 text-gold" aria-hidden="true" />
          <p className="mt-6 text-muted-foreground">{t(playerDict.certificateBody)}</p>
          <p className="mt-3 font-display text-3xl font-semibold text-primary md:text-4xl">
            {displayName}
          </p>
          <p className="mt-3 text-muted-foreground">
            {t(playerDict.certificateWilayah)}{" "}
            <span className="font-semibold text-foreground">{region.name}</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {outcome.totalMissions} {lang === "id" ? "misi selesai" : "missions completed"} ·{" "}
            {issued.slice(0, 10)}
          </p>

          <div className="mt-10 flex items-center justify-center gap-10 text-sm">
            <div>
              <p className="font-display text-base font-semibold">LokaQuest</p>
              <p className="mt-1 border-t border-border pt-1 text-[12px] text-muted-foreground">
                www.lokaquest.web.id
              </p>
            </div>
            <div>
              <p className="text-[12px] text-muted-foreground">
                {t(playerDict.certificateIssuedAt)}
              </p>
              <p className="mt-1 border-t border-border pt-1 text-[12px] text-muted-foreground">
                {issued.slice(0, 10)}
              </p>
            </div>
          </div>
        </div>
        <p className="mt-4 text-center text-[12px] text-muted-foreground">
          {t(playerDict.certificateFooter)}
        </p>
      </div>
    );
  } catch {
    redirect("/auth/login");
  }
}
