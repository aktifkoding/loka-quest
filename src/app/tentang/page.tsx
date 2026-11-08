import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Code2, TrendingUp, BookMarked, Landmark } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { getServerI18n } from "@/lib/i18n/server";
import { staticDict as d } from "@/lib/i18n/dict/static";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerI18n();
  return { title: t(d.aboutMetaTitle) };
}

export default async function AboutPage() {
  const { t } = await getServerI18n();
  const ROLES = [
    {
      icon: Code2,
      role: t(d.aboutRoleDeveloper),
      body: t(d.aboutRoleDeveloperBody),
    },
    {
      icon: TrendingUp,
      role: t(d.aboutRoleEconomics),
      body: t(d.aboutRoleEconomicsBody),
    },
    {
      icon: BookMarked,
      role: t(d.aboutRoleCulture),
      body: t(d.aboutRoleCultureBody),
    },
  ];

  return (
    <>
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <PageHeader
        icon={Landmark}
        title={t(d.aboutTitle)}
        description={t(d.aboutDescription)}
        backHref="/"
        backLabel={t(d.backHomeLabel)}
      />

      <div className="mt-10 space-y-4">
        {ROLES.map((r, i) => (
          <Reveal key={r.role} delay={i * 80}>
            <Card>
              <div className="flex gap-4 p-6">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <r.icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-display text-lg font-semibold">{r.role}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {r.body}
                  </p>
                </div>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>

      <p className="mt-10 text-sm leading-relaxed text-muted-foreground">
        {t(d.aboutCollaborateQuestion)}{" "}
        <Link href="/sumber" className="font-medium text-primary hover:underline">
          {t(d.aboutSourceRegisterLink)}
        </Link>{" "}
        {t(d.aboutTransparencySuffix)}
      </p>
    </div>
    </>
  );
}
