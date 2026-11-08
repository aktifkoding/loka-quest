import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { getServerI18n } from "@/lib/i18n/server";
import { adminDict as d } from "@/lib/i18n/dict/admin";
import { CountUp } from "@/components/ui/count-up";
import { Reveal } from "@/components/ui/reveal";
import { Card } from "@/components/ui/card";
import {
  Users,
  FileText,
  MapPin,
  MessageSquare,
  Settings,
  ArrowUpRight,
} from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerI18n();
  return { title: t(d.adminMetaTitle) };
}

export default async function AdminDashboardPage() {
  try {
    await requireRole(["admin"]);
    const supabase = await createClient();
    const { t } = await getServerI18n();

    const contentLinks = [
      { href: "/admin/regions", label: t(d.linkRegions), icon: MapPin },
      { href: "/admin/missions", label: t(d.linkMissions), icon: FileText },
      { href: "/editor/encyclopedia", label: t(d.linkEncyclopedia), icon: FileText },
      { href: "/admin/contents", label: t(d.linkContents), icon: FileText },
      { href: "/admin/submissions", label: t(d.linkSubmissions), icon: MessageSquare },
    ];

    const systemLinks = [
      { href: "/admin/users", label: t(d.linkUsersRoles), icon: Users },
      { href: "/admin/audit-logs", label: t(d.linkAuditLogs), icon: Settings },
      { href: "/admin/analytics", label: t(d.linkAppAnalytics), icon: Settings },
    ];

    const [
      { count: userCount },
      { count: missionCount },
      { count: regionCount },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("missions").select("*", { count: "exact", head: true }),
      supabase
        .from("cultural_regions")
        .select("*", { count: "exact", head: true }),
    ]);

    return (
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <header className="max-w-2xl">
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            {t(d.adminTitle)}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t(d.adminDescription)}
          </p>
        </header>

        {/* Metric strip */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <Reveal delay={60}>
            <Card className="border-primary/25 bg-primary/5">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t(d.metricUsers)}
                  </p>
                  <Users className="size-5 text-muted-foreground" aria-hidden="true" />
                </div>
                <p className="mt-4 font-display text-4xl font-semibold tabular-nums">
                  <CountUp value={userCount ?? 0} />
                </p>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {t(d.metricUsersNote)}
                </p>
              </div>
            </Card>
          </Reveal>

          <Reveal delay={120}>
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t(d.metricMissions)}
                  </p>
                  <FileText className="size-5 text-muted-foreground" aria-hidden="true" />
                </div>
                <p className="mt-4 font-display text-4xl font-semibold tabular-nums">
                  <CountUp value={missionCount ?? 0} />
                </p>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {t(d.metricMissionsNote)}
                </p>
              </div>
            </Card>
          </Reveal>

          <Reveal delay={180}>
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t(d.metricRegions)}
                  </p>
                  <MapPin className="size-5 text-muted-foreground" aria-hidden="true" />
                </div>
                <p className="mt-4 font-display text-4xl font-semibold tabular-nums">
                  <CountUp value={regionCount ?? 0} />
                </p>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {t(d.metricRegionsNote)}
                </p>
              </div>
            </Card>
          </Reveal>
        </div>

        {/* Management links */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <div className="p-6">
              <h2 className="font-display text-xl font-semibold">
                {t(d.contentManagementHeading)}
              </h2>
              <ul className="mt-4 divide-y divide-border">
                {contentLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-3.5 py-3.5 transition-colors first:pt-1"
                    >
                      <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                        <link.icon className="size-4" aria-hidden="true" />
                      </span>
                      <span className="flex-1 text-sm font-medium">
                        {link.label}
                      </span>
                      <ArrowUpRight
                        className="size-4 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h2 className="font-display text-xl font-semibold">
                {t(d.systemManagementHeading)}
              </h2>
              <ul className="mt-4 divide-y divide-border">
                {systemLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-3.5 py-3.5 transition-colors first:pt-1"
                    >
                      <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                        <link.icon className="size-4" aria-hidden="true" />
                      </span>
                      <span className="flex-1 text-sm font-medium">
                        {link.label}
                      </span>
                      <ArrowUpRight
                        className="size-4 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>
      </div>
    );
  } catch {
    redirect("/auth/login");
  }
}
