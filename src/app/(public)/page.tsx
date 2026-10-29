import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { CountUp } from "@/components/ui/count-up";
import {
  SwatchBook,
  Music4,
  Drama,
  ArrowRight,
  Check,
  Zap,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";

const missions = [
  {
    slug: "batik-detective",
    icon: SwatchBook,
    title: "Batik Detective",
    description:
      "Cocokkan motif batik dengan filosofinya, dari Parang Rusak sampai Kawung.",
    difficulty: "Pemula",
    xp: 150,
  },
  {
    slug: "gamelan-maestro",
    icon: Music4,
    title: "Gamelan Maestro",
    description:
      "Kenali instrumen gamelan Jawa Barat dan peran masing-masing dalam orkestra.",
    difficulty: "Menengah",
    xp: 200,
  },
  {
    slug: "wayang-story",
    icon: Drama,
    title: "Wayang Story Adventure",
    description:
      "Susun alur cerita wayang dan kenali tokoh-tokoh punakawan Yogyakarta.",
    difficulty: "Menengah",
    xp: 200,
  },
];

const steps = [
  {
    number: "1",
    title: "Buat akun",
    description: "Daftar dengan email. Selesai dalam satu menit.",
  },
  {
    number: "2",
    title: "Mainkan misi",
    description: "Jawab tantangan budaya di setiap wilayah.",
  },
  {
    number: "3",
    title: "Pantau progres",
    description: "Nilai, XP, dan lencana tercatat otomatis di dasbor.",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero — split geometry, product visual built from real UI primitives */}
      <section className="relative overflow-hidden">
        <div className="batik-grid absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-10 md:grid-cols-2 md:pb-28 md:pt-16 lg:gap-8">
          <div>
            <p className="animate-fade-up mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[13px] font-medium text-muted-foreground">
              <span
                className="size-1.5 rounded-full bg-gold"
                aria-hidden="true"
              />
              Platform belajar budaya Indonesia
            </p>
            <h1
              className="animate-fade-up font-display text-4xl font-semibold leading-[1.1] sm:text-5xl md:text-[3.4rem]"
              style={{ animationDelay: "60ms" }}
            >
              Jelajahi Nusantara, hidupkan{" "}
              <span className="border-b-4 border-gold/50 pb-0.5">
                warisan budaya
              </span>
            </h1>
            <p
              className="animate-fade-up mt-5 max-w-md text-lg leading-relaxed text-muted-foreground"
              style={{ animationDelay: "120ms" }}
            >
              Tiga misi interaktif untuk mengenal batik, gamelan, dan wayang.
              Jawaban dinilai otomatis, progres tersimpan.
            </p>
            <div
              className="animate-fade-up mt-8 flex flex-col gap-3 sm:flex-row"
              style={{ animationDelay: "180ms" }}
            >
              <Button size="lg" asChild>
                <Link href="/auth/register">Mulai Petualangan</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/missions">Jelajahi Misi</Link>
              </Button>
            </div>
            <p
              className="animate-fade-up mt-4 text-sm text-muted-foreground"
              style={{ animationDelay: "240ms" }}
            >
              Gratis untuk pelajar. Tanpa iklan, tanpa biaya tersembunyi.
            </p>
          </div>

          {/* Real product pattern: an actual mission question card */}
          <div
            className="animate-float animate-fade-up relative md:translate-x-6"
            style={{ animationDelay: "160ms" }}
          >
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-raised">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[13px] font-medium text-muted-foreground">
                  Misi Batik Detective
                </p>
                <p className="text-[13px] tabular-nums text-muted-foreground">
                  Soal 2 dari 6
                </p>
              </div>
              <div
                className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-muted"
                role="presentation"
              >
                <div className="h-full w-1/3 rounded-full bg-primary" />
              </div>
              <p className="font-display text-lg font-semibold leading-snug">
                Motif batik yang melambangkan keberanian dan keteguhan adalah…
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
            <div className="absolute -right-3 -top-3 flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 shadow-card md:-right-6">
              <Zap className="size-4 text-gold" aria-hidden="true" />
              <span className="text-sm font-semibold tabular-nums">
                +150 XP
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="tenun mx-auto max-w-6xl" aria-hidden="true" />

      {/* Proof strip — factual product stats, no fabricated traction */}
      <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <Reveal>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <CountUp value={3} className="font-display text-4xl font-semibold tabular-nums" />
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              wilayah budaya: Jawa Tengah, Jawa Barat, Yogyakarta
            </p>
          </div>
          <div>
            <CountUp value={6} className="font-display text-4xl font-semibold tabular-nums" />

            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              soal misi dengan pembahasan di tiap jawaban
            </p>
          </div>
          <div>
            <CountUp value={2} className="font-display text-4xl font-semibold tabular-nums" />

            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              asesmen pembelajaran: pre-test dan post-test
            </p>
          </div>
        </div>
      </Reveal>
      </section>

      {/* Feature row 1 — scoring, real result card */}
      <Reveal>
      <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="md:order-1">
            <h2 className="font-display text-3xl font-semibold leading-tight">
              Nilai muncul, bukan tebakan
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">
              Setiap jawaban dinilai di server, bukan di browser. Begitu misi
              selesai, kamu melihat pembahasan singkat untuk tiap soal.
            </p>
          </div>
          <div className="md:order-2">
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-card">
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  Hasil misi
                </p>
                <p className="font-display text-3xl font-semibold tabular-nums">
                  67<span className="text-lg text-muted-foreground">/100</span>
                </p>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                2 dari 3 jawaban benar
              </p>
              <div className="mt-4 flex items-center gap-1.5 rounded-lg bg-gold/10 px-3.5 py-2.5">
                <Zap className="size-4 text-gold" aria-hidden="true" />
                <span className="text-sm font-semibold tabular-nums text-foreground">
                  +100 XP
                </span>
                <span className="ml-auto text-sm text-muted-foreground">
                  Level 3
                </span>
              </div>
              <p className="mt-4 border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
                Parang Rusak melambangkan keberanian; Kawung melambangkan
                kebersihan hati.
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
                  <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-medium">Sumber tercatat</p>
                  <p className="text-sm text-muted-foreground">
                    Referensi wajib untuk konten yang dipublikasikan
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
                  Lisensi: CC BY-SA 4.0
                </p>
              </div>
            </div>
          </div>
          <div>
            <h2 className="font-display text-3xl font-semibold leading-tight">
              Setiap konten punya sumber
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">
              Batik, gamelan, dan wayang ditulis dari referensi yang tercatat
              dan bisa diperiksa. Tidak ada fakta karangan.
            </p>
          </div>
        </div>
      </section>
      </Reveal>

      <div className="tenun mx-auto max-w-6xl" aria-hidden="true" />

      {/* Missions — list rows, not a card grid */}
      <Reveal>
      <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl font-semibold">
            Tiga misi, tiga wilayah
          </h2>
          <Link
            href="/missions"
            className="hidden shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex"
          >
            Semua misi
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <ul className="divide-y divide-border rounded-2xl border border-border/80 bg-card shadow-card">
          {missions.map((mission) => (
            <li key={mission.slug}>
              <Link
                href={`/missions/${mission.slug}`}
                className="group flex items-center gap-4 px-5 py-5 transition-colors duration-200 hover:bg-secondary/50 sm:px-6"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <mission.icon className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{mission.title}</p>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {mission.description}
                  </p>
                </div>
                <div className="hidden shrink-0 text-right sm:block">
                  <p className="text-sm text-muted-foreground">
                    {mission.difficulty}
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
      </section>
      </Reveal>

      {/* How it works — 3 real steps in order */}
      <Reveal>
      <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <h2 className="font-display text-3xl font-semibold">Cara kerjanya</h2>
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
              <p className="mt-4 font-semibold">{step.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {step.description}
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
                Dibangun untuk kelas, bukan hanya layar pribadi
              </h2>
              <ul className="mt-6 space-y-3">
                {[
                  "Pantau progres belajar per kelompok siswa",
                  "Bandingkan hasil pre-test dan post-test",
                  "Kelola konten budaya lewat dasbor admin",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:justify-self-end">
              <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-card md:max-w-sm">
                <p className="font-display text-lg font-semibold">
                  Siap membawa LokaQuest ke kelas Anda?
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Buat akun, lalu minta admin menetapkan peran pendidik untuk
                  membuka dasbor kelompok.
                </p>
                <Button asChild className="mt-5 w-full sm:w-auto">
                  <Link href="/auth/register">Buat akun</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      </Reveal>

      {/* Final CTA */}
      <Reveal>
      <section className="mx-auto max-w-3xl px-4 py-16 text-center md:py-24">
        <h2 className="font-display text-4xl font-semibold leading-tight">
          Warisan budaya menunggu untuk dijelajahi
        </h2>
        <p className="mx-auto mt-4 max-w-md leading-relaxed text-muted-foreground">
          Mulai dari misi pertama, kumpulkan XP, dan lihat seberapa jauh
          pemahamanmu berkembang.
        </p>
        <Button size="lg" asChild className="mt-8">
          <Link href="/auth/register">Mulai Petualangan</Link>
        </Button>
      </section>
      </Reveal>

      {/* Footer — boring on purpose */}
      {/* Footer — boring on purpose */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
            <div>
              <p className="font-display text-lg font-semibold">LokaQuest</p>
              <p className="mt-1 max-w-xs text-sm leading-relaxed text-muted-foreground">
                Jelajahi Nusantara, hidupkan warisan budaya.
              </p>
            </div>
            <nav
              className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm"
              aria-label="Footer"
            >
              <Link
                href="/explore"
                className="text-muted-foreground hover:text-foreground"
              >
                Jelajahi
              </Link>
              <Link
                href="/missions"
                className="text-muted-foreground hover:text-foreground"
              >
                Misi
              </Link>
              <Link
                href="/auth/login"
                className="text-muted-foreground hover:text-foreground"
              >
                Masuk
              </Link>
              <Link
                href="/auth/register"
                className="text-muted-foreground hover:text-foreground"
              >
                Daftar
              </Link>
              <Link
                href="/sumber"
                className="text-muted-foreground hover:text-foreground"
              >
                Sumber budaya
              </Link>
              <Link
                href="/leaderboard"
                className="text-muted-foreground hover:text-foreground"
              >
                Leaderboard
              </Link>
            </nav>
          </div>
          <p className="mt-8 text-[13px] text-muted-foreground">
            © 2026 LokaQuest. Konten budaya disertai sumber referensi.
          </p>
        </div>
      </footer>
    </div>
  );
}
