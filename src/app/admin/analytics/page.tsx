import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase/service-role";
import { requireRole } from "@/lib/auth/session";
import { getServerI18n } from "@/lib/i18n/server";
import { adminDict as d } from "@/lib/i18n/dict/admin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { CountUp } from "@/components/ui/count-up";
import { ArrowLeft, Users, Gamepad2, MapPin, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerI18n();
  return { title: t(d.appAnalyticsMetaTitle) };
}

export default async function AdminAnalyticsPage() {
  try {
    await requireRole(["admin"]);
    const service = createServiceClient();
    const { t } = await getServerI18n();

    const [
      { count: userCount },
      { count: attemptCount },
      { count: regionCount },
      { count: contentCount },
    ] = await Promise.all([
      service.from("profiles").select("*", { count: "exact", head: true }),
      service.from("mission_attempts").select("*", { count: "exact", head: true }),
      service.from("cultural_regions").select("*", { count: "exact", head: true }),
      service.from("cultural_contents").select("*", { count: "exact", head: true }),
    ]);

    const stats = [
      { label: t(d.statRegisteredUsers), value: userCount ?? 0, icon: Users },
      { label: t(d.statMissionAttempts), value: attemptCount ?? 0, icon: Gamepad2 },
      { label: t(d.statCulturalRegions), value: regionCount ?? 0, icon: MapPin },
      { label: t(d.statRegisteredContents), value: contentCount ?? 0, icon: FileText },
    ];

    return (
      <div className="mx-auto max-w-4xl px-4 py-10 md:py-14">
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
          <Link href="/admin">
            <ArrowLeft className="size-4" aria-hidden="true" />
            {t(d.backToAdmin)}
          </Link>
        </Button>

        <header>
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            {t(d.appAnalyticsTitle)}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t(d.appAnalyticsDescription)}
          </p>
        </header>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 70}>
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                    <stat.icon className="size-5 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <p className="mt-4 font-display text-4xl font-semibold tabular-nums">
                    <CountUp value={stat.value} />
                  </p>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    );
  } catch {
    redirect("/auth/login");
  }
}
