import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Languages,
  ArrowRight,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { getRegionalLanguages, REGIONAL_VOCABULARIES } from "@/lib/languages";
import { PronunciationButton } from "@/components/bahasa/pronunciation-button";

export const metadata = {
  title: "Modul Bahasa Daerah Nusantara | LokaQuest",
  description:
    "Pelajari kosakata, pelafalan otentik, dan uji pemahaman ragam bahasa daerah Nusantara yang terintegrasi dengan ensiklopedia budaya.",
};

export default function BahasaDaerahHubPage() {
  const languages = getRegionalLanguages();
  const totalVocab = REGIONAL_VOCABULARIES.length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          icon={Languages}
          title="Modul Bahasa Daerah"
          description="Eksplorasi kosakata, pelafalan otentik, dan kuis interaktif bahasa daerah Nusantara yang terhubung erat dengan ensiklopedia budaya."
        />
        <Button asChild variant="outline" className="gap-2">
          <Link href="/encyclopedia">
            <BookOpen className="size-4" aria-hidden="true" />
            Buka Ensiklopedia
          </Link>
        </Button>
      </div>

      {/* Hero Stats */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="p-5 border-primary/20 bg-primary/5">
          <p className="text-xs font-medium text-muted-foreground">Bahasa Daerah</p>
          <p className="mt-2 font-display text-3xl font-bold text-foreground">
            {languages.length}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">dialek utama nusantara</p>
        </Card>
        <Card className="p-5 border-border bg-card">
          <p className="text-xs font-medium text-muted-foreground">Kosakata Pilihan</p>
          <p className="mt-2 font-display text-3xl font-bold text-foreground">
            {totalVocab}+
          </p>
          <p className="mt-1 text-xs text-muted-foreground">lengkap arti & fonetik</p>
        </Card>
        <Card className="p-5 border-border bg-card">
          <p className="text-xs font-medium text-muted-foreground">Fitur Pelafalan</p>
          <p className="mt-2 font-display text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            Audio
          </p>
          <p className="mt-1 text-xs text-muted-foreground">suara & sintesis fonetis</p>
        </Card>
        <Card className="p-5 border-border bg-card">
          <p className="text-xs font-medium text-muted-foreground">Kuis Interaktif</p>
          <p className="mt-2 font-display text-3xl font-bold text-gold">
            +XP
          </p>
          <p className="mt-1 text-xs text-muted-foreground">skor & evaluasi performa</p>
        </Card>
      </div>

      {/* Languages Grid */}
      <div className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">Pilih Bahasa Daerah</h2>
          <span className="text-sm text-muted-foreground">
            Pilih bahasa untuk belajar kosakata & mengikuti kuis
          </span>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {languages.map((lang) => (
            <Card
              key={lang.slug}
              interactive
              className="flex flex-col justify-between p-6 transition-all hover:shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold text-primary">
                      {lang.regionName}
                    </span>
                    <h3 className="mt-1 font-display text-xl font-bold text-foreground">
                      {lang.name}
                    </h3>
                    <p className="font-serif text-xs text-muted-foreground">
                      {lang.nativeName}
                    </p>
                  </div>
                  {lang.scriptName && (
                    <span className="rounded-lg bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                      {lang.scriptName.split(" ")[0]}
                    </span>
                  )}
                </div>

                <p className="mt-4 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                  {lang.description}
                </p>

                {/* Sapaan Greeting Preview */}
                <div className="mt-5 rounded-xl border border-border/80 bg-secondary/50 p-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Sapaan Khas
                      </span>
                      <p className="font-display text-sm font-bold text-foreground">
                        {lang.greeting.word}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        &ldquo;{lang.greeting.meaning}&rdquo;
                      </p>
                    </div>
                    <PronunciationButton
                      word={lang.greeting.word}
                      phonetic={lang.greeting.phonetic}
                      audioUrl={lang.greeting.audioUrl}
                      size="icon"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                <span className="text-xs text-muted-foreground">
                  {lang.speakersEstimate}
                </span>
                <Button asChild size="sm" className="gap-1.5">
                  <Link href={`/bahasa/${lang.slug}`}>
                    Belajar & Kuis
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Integration highlight with encyclopedia */}
      <section className="mt-16 rounded-3xl border border-primary/20 bg-secondary/30 p-8 md:p-10">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5 text-gold" aria-hidden="true" />
            Integrasi Ensiklopedia & Bahasa
          </span>
          <h2 className="mt-3 font-display text-2xl font-bold md:text-3xl">
            Bahasa adalah Jendela Nilai Kultural
          </h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Setiap artikel ensiklopedia di LokaQuest—mulai dari Batik, Gamelan, Randai,
            hingga Subak—kini terhubung langsung dengan istilah dan ungkapan bahasa daerah
            asalnya. Mempelajari bahasa memperkuat pemahaman konteks historis dan filosofi adat.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/encyclopedia/explore">Telusuri Ensiklopedia</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/missions">Uji di Misi Budaya</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
