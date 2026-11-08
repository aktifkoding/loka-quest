import { Fragment } from "react";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import { getServerI18n } from "@/lib/i18n/server";
import { landingDict as d, landingHeroWords } from "@/lib/i18n/dict/landing";
import { commonDict } from "@/lib/i18n/dict/common";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { CountUp } from "@/components/ui/count-up";
import { HeroMotion, ScrollStagger } from "@/components/landing/motion";
import { createServiceClient } from "@/lib/supabase/service-role";
import {
  SwatchBook,
  Music4,
  Drama,
  Users,
  Compass,
  Shield,
  Landmark,
  Ship,
  Sprout,
  Flower,
  Anchor,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Check,
  Zap,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Statistik dan daftar misi diambil dari database. Cache data selama 1 jam
// (layout root membaca cookie bahasa, jadi halaman dirender per-request —
// data tetap di-cache agar database tidak dipukul setiap kunjungan).
// PENTING: unstable_cache melakukan serialisasi JSON — ikon (komponen Lucide)
// TIDAK boleh ikut di-cache; ia dipasang ulang setelah cache dibaca.
type CachedLandingMission = Omit<LandingMission, "icon">;

const getLandingData = unstable_cache(
  async (): Promise<{
    stats: LandingStats;
    missions: CachedLandingMission[];
  }> => {
    const stats: LandingStats = { ...FALLBACK_STATS };
    let missions: CachedLandingMission[] = FALLBACK_MISSIONS;

    try {
      const supabase = createServiceClient();
      const [missionsResult, regionsResult, questionsResult, sourcesResult] =
        await Promise.all([
          supabase
            .from("missions")
            .select("slug, title, description, xp_reward, difficulty, region_id")
            .eq("status", "published")
            .order("sort_order"),
          supabase.from("cultural_regions").select("id, name"),
          supabase
            .from("mission_questions")
            .select("id", { count: "exact", head: true }),
          supabase
            .from("cultural_sources")
            .select("id", { count: "exact", head: true }),
        ]);

      if (!regionsResult.error && regionsResult.data) {
        stats.regions = regionsResult.data.length;
      }
      if (!questionsResult.error && questionsResult.count !== null) {
        stats.questions = questionsResult.count;
      }
      if (!sourcesResult.error && sourcesResult.count !== null) {
        stats.sources = sourcesResult.count;
      }
      if (
        !missionsResult.error &&
        missionsResult.data &&
        missionsResult.data.length > 0
      ) {
        const regionNames = new Map(
          (regionsResult.data ?? []).map((region) => [region.id, region.name])
        );
        stats.missions = missionsResult.data.length;
        missions = missionsResult.data.map((mission) => ({
          slug: mission.slug,
          title: mission.title,
          description: mission.description,
          xp: mission.xp_reward,
          region: regionNames.get(mission.region_id) ?? "",
        }));
      }
    } catch {
      // Database tidak terjangkau — biarkan fallback di atas.
    }

    return { stats, missions };
  },
  ["landing-data"],
  { revalidate: 3600 },
);

type LandingStats = {
  missions: number;
  regions: number;
  questions: number;
  sources: number;
};

type LandingMission = {
  slug: string;
  title: string;
  description: string;
  xp: number;
  region: string;
  icon: LucideIcon;
};

const MISSION_ICONS: Record<string, LucideIcon> = {
  "batik-detective": SwatchBook,
  "gamelan-maestro": Music4,
  "wayang-story": Drama,
  "saman-harmony": Users,
  "randai-minang": Compass,
  "ondel-ondel-guardian": Shield,
  "betang-heritage": Landmark,
  "pinisi-voyage": Ship,
  "subak-wisdom": Sprout,
  "tenun-sumba": Flower,
  "sasi-maluku": Anchor,
  "noken-weaver": ShoppingBag,
};

// Dipakai jika database tidak terjangkau saat render — angka terakhir terverifikasi.
const FALLBACK_STATS: LandingStats = {
  missions: 12,
  regions: 12,
  questions: 33,
  sources: 105,
};

const FALLBACK_MISSIONS: CachedLandingMission[] = [
  {
    slug: "batik-detective",
    title: "Batik Detective",
    description: "Pelajari pola dan makna di balik batik khas Jawa Tengah.",
    xp: 150,
    region: "Jawa Tengah",
  },
  {
    slug: "gamelan-maestro",
    title: "Gamelan Maestro",
    description:
      "Kenali instrumen gamelan dan peranannya dalam orkestra tradisional.",
    xp: 200,
    region: "Jawa Barat",
  },
  {
    slug: "wayang-story",
    title: "Wayang Story Adventure",
    description:
      "Ikuti petualangan wayang dan pelajari cerita rakyat Nusantara.",
    xp: 200,
    region: "Yogyakarta",
  },
];

const steps = [
  { number: "1", title: d.step1Title, description: d.step1Desc },
  { number: "2", title: d.step2Title, description: d.step2Desc },
  { number: "3", title: d.step3Title, description: d.step3Desc },
];

export default async function HomePage() {
  const { lang, t } = await getServerI18n();
  const { stats, missions: cachedMissions } = await getLandingData();
  // Ikon dipasang di sini (di luar cache) agar komponen tidak ter-serialisasi.
  const missions: LandingMission[] = cachedMissions.map((mission) => ({
    ...mission,
    icon: MISSION_ICONS[mission.slug] ?? Sparkles,
  }));
  const heroWords = landingHeroWords[lang];

  return (
    <div>
      {/* Hero — split geometry, product visual built from real UI primitives */}
      <section className="relative overflow-hidden">
        <div className="batik-grid absolute inset-0" aria-hidden="true" />
        <HeroMotion className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-10 md:grid-cols-2 md:pb-28 md:pt-16 lg:gap-8">
          <div>
            <p className="hero-badge mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[13px] font-medium text-muted-foreground">
              <span
                className="size-1.5 rounded-full bg-gold"
                aria-hidden="true"
              />
              {t(d.badge)}
            </p>
            <h1
              aria-label={t(d.heroAria)}
              className="font-display text-4xl font-semibold leading-[1.1] sm:text-5xl md:text-[3.4rem]"
            >
              <span aria-hidden="true">
                {heroWords.main.map((word, i) => (
                  <Fragment key={`${word}-${i}`}>
                    <span className="hero-word inline-block will-change-transform">
                      {word}
                    </span>{" "}
                  </Fragment>
                ))}
                <span className="relative inline-block pb-1">
                  {heroWords.tail.map((word, i) => (
                    <Fragment key={`${word}-${i}`}>
                      <span className="hero-word inline-block will-change-transform">
                        {word}
                      </span>
                      {i < heroWords.tail.length - 1 ? " " : null}
                    </Fragment>
                  ))}
                  <span
                    className="hero-underline absolute inset-x-0 bottom-0 h-1 origin-left rounded-full bg-gold/60"
                    aria-hidden="true"
                  />
                </span>
              </span>
            </h1>
            <p className="hero-sub mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
              {t(d.heroSub, { missions: stats.missions, regions: stats.regions })}
            </p>
            <div className="hero-cta mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/auth/register">{t(d.ctaStart)}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/missions">{t(d.ctaExploreMissions)}</Link>
              </Button>
            </div>
            <p className="hero-note mt-4 text-sm text-muted-foreground">
              {t(d.heroNote)}
            </p>
          </div>

          {/* Real product pattern: an actual mission question card.
              GSAP menganimasikan pembungkus luar; float CSS di kartu dalam
              agar dua transform tidak saling menimpa. */}
          <div className="hero-card relative md:translate-x-6">
            <div className="animate-float rounded-2xl border border-border/80 bg-card p-6 shadow-raised">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[13px] font-medium text-muted-foreground">
                  {t(d.demoMissionLabel)}
                </p>
                <p className="text-[13px] tabular-nums text-muted-foreground">
                  {t(d.demoQuestionOf)}
                </p>
              </div>
              <div
                className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-muted"
                role="presentation"
              >
                <div className="h-full w-1/2 rounded-full bg-primary" />
              </div>
              <p className="font-display text-lg font-semibold leading-snug">
                {t(d.demoQuestion)}
              </p>
              <div className="mt-4 grid gap-2" role="presentation">
                <span className="rounded-lg border border-primary/40 bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary">
                  Parang Rusak
                </span>
                <span className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground/80">
                  Kawung
                </span>
                <span className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground/80">
                  Semen Rama
                </span>
              </div>
            </div>
            <div className="hero-xp absolute -right-3 -top-3 flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 shadow-card md:-right-6">
              <Zap className="size-4 text-gold" aria-hidden="true" />
              <span className="text-sm font-semibold tabular-nums">
                +150 XP
              </span>
            </div>
          </div>
        </HeroMotion>
      </section>

      <div className="tenun mx-auto max-w-6xl" aria-hidden="true" />

      {/* Proof strip — live product stats from the database */}
      <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <ScrollStagger>
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            <div data-stagger-item>
              <CountUp
                value={stats.missions}
                className="font-display text-4xl font-semibold tabular-nums"
              />
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {t(d.statMissionsCaption)}
              </p>
            </div>
            <div data-stagger-item>
              <CountUp
                value={stats.regions}
                className="font-display text-4xl font-semibold tabular-nums"
              />
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {t(d.statRegionsCaption)}
              </p>
            </div>
            <div data-stagger-item>
              <CountUp
                value={stats.questions}
                className="font-display text-4xl font-semibold tabular-nums"
              />
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {t(d.statQuestionsCaption)}
              </p>
            </div>
            <div data-stagger-item>
              <CountUp
                value={stats.sources}
                className="font-display text-4xl font-semibold tabular-nums"
              />
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {t(d.statSourcesCaption)}
              </p>
            </div>
          </div>
        </ScrollStagger>
      </section>

      {/* Feature row 1 — scoring, real result card */}
      <Reveal>
        <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div className="md:order-1">
              <h2 className="font-display text-3xl font-semibold leading-tight">
                {t(d.scoringTitle)}
              </h2>
              <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">
                {t(d.scoringBody)}
              </p>
            </div>
            <div className="md:order-2">
              <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-card">
                <div className="flex items-baseline justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t(d.resultCardLabel)}
                  </p>
                  <p className="font-display text-3xl font-semibold tabular-nums">
                    67<span className="text-lg text-muted-foreground">/100</span>
                  </p>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t(d.resultCorrect)}
                </p>
                <div className="mt-4 flex items-center gap-1.5 rounded-lg bg-gold/10 px-3.5 py-2.5">
                  <Zap className="size-4 text-gold" aria-hidden="true" />
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    +100 XP
                  </span>
                  <span className="ml-auto text-sm text-muted-foreground">
                    {t(commonDict.level, { n: 3 })}
                  </span>
                </div>
                <p className="mt-4 border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
                  {t(d.resultNote)}
                </p>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Feature row 2 — sources, real source card */}
      <Reveal>
        <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-card">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <ShieldCheck
                      className="size-5 text-primary"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{t(d.sourceCardTitle)}</p>
                    <p className="text-sm text-muted-foreground">
                      {t(d.sourceCardBody)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 rounded-lg border border-border bg-secondary/60 p-4">
                  <p className="text-sm font-medium">
                    Ensiklopedia Batik Indonesia
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Gramedia Pustaka Utama, 2010
                  </p>
                  <p className="mt-2 text-[13px] text-muted-foreground">
                    {t(d.licenseLabel)}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="font-display text-3xl font-semibold leading-tight">
                {t(d.sourcesTitle)}
              </h2>
              <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">
                {t(d.sourcesBody)}
              </p>
            </div>
          </div>
        </section>
      </Reveal>

      <div className="tenun mx-auto max-w-6xl" aria-hidden="true" />

      {/* Missions — list rows straight from the database */}
      <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl font-semibold">
            {t(d.missionsHeading, { missions: missions.length, regions: stats.regions })}
          </h2>
          <Link
            href="/missions"
            className="hidden shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex"
          >
            {t(d.allMissions)}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <ScrollStagger>
          <ul className="divide-y divide-border rounded-2xl border border-border/80 bg-card shadow-card">
            {missions.map((mission) => (
              <li key={mission.slug} data-stagger-item>
                <Link
                  href={`/missions/${mission.slug}`}
                  className="group flex items-center gap-4 px-5 py-5 transition-colors duration-200 hover:bg-secondary/50 sm:px-6"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                    <mission.icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{mission.title}</p>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {mission.description}
                    </p>
                  </div>
                  <div className="shrink-0 text-right sm:text-right">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground sm:text-sm sm:normal-case sm:tracking-normal">
                      {mission.region}
                    </p>
                    <p className="text-sm font-semibold tabular-nums text-gold">
                      {mission.xp} XP
                    </p>
                  </div>
                  <ArrowRight
                    className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </ScrollStagger>
      </section>

      {/* How it works — 3 real steps in order */}
      <Reveal>
        <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <h2 className="font-display text-3xl font-semibold">{t(d.howTitle)}</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.number} className="relative">
                <span className="flex size-9 items-center justify-center rounded-full bg-primary font-display text-sm font-semibold text-primary-foreground">
                  {step.number}
                </span>
                {index < steps.length - 1 && (
                  <span
                    className="absolute left-[2.4rem] top-[1.1rem] hidden w-[calc(100%-3.5rem)] border-t-2 border-dashed border-border md:block"
                    aria-hidden="true"
                  />
                )}
                <p className="mt-4 font-semibold">{t(step.title)}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {t(step.description)}
                </p>
              </li>
            ))}
          </ol>
        </section>
      </Reveal>

      {/* Educator band */}
      <Reveal>
        <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <div className="rounded-3xl border border-border/60 bg-secondary px-6 py-12 md:px-12">
            <div className="grid items-center gap-10 md:grid-cols-2">
              <div>
                <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <GraduationCap className="size-5" aria-hidden="true" />
                </div>
                <h2 className="font-display text-3xl font-semibold leading-tight">
                  {t(d.educatorTitle)}
                </h2>
                <ul className="mt-6 space-y-3">
                  {[d.educatorCheck1, d.educatorCheck2, d.educatorCheck3].map(
                    (item) => (
                      <li key={item.en} className="flex items-start gap-2.5">
                        <Check
                          className="mt-0.5 size-4 shrink-0 text-primary"
                          aria-hidden="true"
                        />
                        <span className="leading-relaxed">{t(item)}</span>
                      </li>
                    ),
                  )}
                </ul>
              </div>
              <div className="md:justify-self-end">
                <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-card md:max-w-sm">
                  <p className="font-display text-lg font-semibold">
                    {t(d.educatorCardTitle)}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {t(d.educatorCardBody)}
                  </p>
                  <Button asChild className="mt-5 w-full sm:w-auto">
                    <Link href="/auth/register">{t(d.educatorCta)}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Final CTA */}
      <Reveal>
        <section className="relative overflow-hidden px-4 py-16 text-center md:py-24">
          <div className="batik-grid absolute inset-0" aria-hidden="true" />
          <div className="relative mx-auto max-w-3xl">
            <h2 className="font-display text-4xl font-semibold leading-tight">
              {t(d.finalTitle)}
            </h2>
            <p className="mx-auto mt-4 max-w-md leading-relaxed text-muted-foreground">
              {t(d.finalBody)}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/auth/register">{t(d.ctaStart)}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/encyclopedia">{t(d.ctaEncyclopedia)}</Link>
              </Button>
            </div>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
