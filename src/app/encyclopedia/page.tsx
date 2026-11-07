import Link from "next/link";
import { BookOpen, Compass, MapPin, Search, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { Input } from "@/components/ui/input";

const entryPoints = [
  { href: "/encyclopedia/explore", label: "Jelajahi artikel", description: "Telusuri pengetahuan budaya yang telah ditinjau dan bersumber.", icon: Compass },
  { href: "/encyclopedia/categories", label: "Kategori budaya", description: "Seni, tradisi, bahasa, kuliner, kerajinan, dan lainnya.", icon: BookOpen },
  { href: "/encyclopedia/regions", label: "Wilayah Nusantara", description: "Temukan warisan budaya melalui wilayah yang terkait.", icon: MapPin },
];

export default function EncyclopediaHomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <section className="bg-warm-wash relative overflow-hidden rounded-3xl border border-border bg-secondary/60 px-6 py-12 md:px-12 md:py-16">
        <div className="batik-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="relative max-w-3xl">
          <Reveal>
            <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1.5 text-sm text-muted-foreground"><Sparkles className="size-4 text-gold" aria-hidden="true"/> Ensiklopedia Budaya Nusantara</span>
          </Reveal>
          <Reveal delay={90}>
            <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight md:text-6xl">
              Menjelajahi <span className="text-gradient">Pengetahuan</span>,<br className="hidden md:block"/> Merawat Warisan.
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">Ruang belajar budaya Indonesia yang menyajikan konteks, sumber, dan beragam perspektif secara bertanggung jawab.</p>
          </Reveal>
          <Reveal delay={230}>
            <form action="/encyclopedia/search" className="mt-8 flex max-w-xl gap-2">
              <label className="sr-only" htmlFor="encyclopedia-search">Cari budaya Nusantara</label>
              <Input id="encyclopedia-search" name="q" placeholder="Cari tradisi, wilayah, atau kategori…" className="h-12 min-w-0 flex-1 rounded-xl bg-background text-sm" />
              <Button type="submit" size="lg" aria-label="Cari"><Search className="size-4" aria-hidden="true"/><span className="hidden sm:inline">Cari</span></Button>
            </form>
            <p className="mt-3 text-xs text-muted-foreground">Informasi diterbitkan setelah proses editorial dan dilengkapi referensi.</p>
          </Reveal>
        </div>
      </section>
      <section className="mt-10 grid gap-5 md:grid-cols-3" aria-label="Jelajahi ensiklopedia">
        {entryPoints.map(({ href, label, description, icon: Icon }, index) => (
          <Reveal key={href} delay={index * 90}>
            <Link href={href} className="group block h-full">
              <Card interactive className="h-full">
                <div className="p-6">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary/15"><Icon className="size-5" aria-hidden="true"/></span>
                  <h2 className="mt-5 font-display text-xl font-semibold">{label}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    Buka bagian
                    <ArrowRight className="size-4 transition-transform duration-200 ease-out-expo group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </div>
              </Card>
            </Link>
          </Reveal>
        ))}
      </section>
      <Reveal delay={120}>
        <section className="mt-14 border-t border-border pt-8">
          <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-medium text-gold">Mulai dari rasa ingin tahu</p><h2 className="mt-1 font-display text-2xl font-semibold">Pengetahuan yang terhubung dengan pengalaman</h2></div><Button asChild variant="outline"><Link href="/encyclopedia/explore">Lihat semua artikel</Link></Button></div>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">Artikel yang mendukung misi LokaQuest akan menghubungkan bacaan dengan tantangan edukatif. Tidak semua tradisi memiliki misi; setiap hubungan ditampilkan hanya jika tersedia.</p>
        </section>
      </Reveal>
    </div>
  );
}
