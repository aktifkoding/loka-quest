import Link from "next/link";
import type { Metadata } from "next";
import { BookOpen, Compass, MapPin, Search, Sparkles, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { getServerI18n } from "@/lib/i18n/server";
import { commonDict } from "@/lib/i18n/dict/common";
import { encyclopediaDict as d } from "@/lib/i18n/dict/encyclopedia";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerI18n();
  return { title: t(d.metaTitle) };
}

export default async function EncyclopediaHomePage() {
  const { t } = await getServerI18n();
  const entryPoints = [
    {
      href: "/encyclopedia/explore",
      label: t(d.exploreLabel),
      description: t(d.exploreDescription),
      icon: Compass,
    },
    {
      href: "/bahasa",
      label: t(d.languageLabel),
      description: t(d.languageDescription),
      icon: Languages,
    },
    {
      href: "/encyclopedia/categories",
      label: t(d.categoriesLabel),
      description: t(d.categoriesEntryDescription),
      icon: BookOpen,
    },
    {
      href: "/encyclopedia/regions",
      label: t(d.regionsLabel),
      description: t(d.regionsEntryDescription),
      icon: MapPin,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-secondary/60 px-6 py-12 md:px-12 md:py-16">
        <div className="batik-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="relative max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1.5 text-sm text-muted-foreground">
            <Sparkles className="size-4 text-gold" aria-hidden="true" />
            {t(d.badge)}
          </span>
          <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight md:text-6xl">
            {t(d.heroTitleLine1)}
            <br className="hidden md:block" /> {t(d.heroTitleLine2)}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {t(d.heroDescription)}
          </p>
          <form action="/encyclopedia/search" className="mt-8 flex max-w-xl gap-2">
            <label className="sr-only" htmlFor="encyclopedia-search">
              {t(d.searchLabelAria)}
            </label>
            <Input
              id="encyclopedia-search"
              name="q"
              placeholder={t(d.searchPlaceholder)}
              className="h-12 min-w-0 flex-1 rounded-xl px-4 text-sm"
              autoComplete="off"
            />
            <Button type="submit" size="lg" className="h-12 rounded-xl" aria-label={t(commonDict.search)}>
              <Search className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t(commonDict.search)}</span>
            </Button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">
            {t(d.publishNote)}
          </p>
        </div>
      </section>

      <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-label={t(d.entryPointsAria)}>
        {entryPoints.map(({ href, label, description, icon: Icon }) => (
          <Link key={href} href={href} className="group">
            <Card interactive className="h-full">
              <div className="p-6">
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h2 className="mt-5 font-display text-xl font-semibold">{label}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
                <span className="mt-5 inline-block text-sm font-medium text-primary">
                  {t(d.openSectionCta)} <span aria-hidden="true">→</span>
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </section>

      <section className="batik-parang mt-14 rounded-3xl border border-border bg-secondary/50 px-6 py-8 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gold">{t(d.explainerEyebrow)}</p>
            <h2 className="mt-1 font-display text-2xl font-semibold">
              {t(d.explainerTitle)}
            </h2>
          </div>
          <Button asChild variant="outline">
            <Link href="/encyclopedia/explore">{t(d.seeAllArticlesCta)}</Link>
          </Button>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {t(d.explainerBody)}
        </p>
      </section>
    </div>
  );
}
