"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Languages, ArrowRight } from "lucide-react";
import { PronunciationButton } from "@/components/bahasa/pronunciation-button";
import { getVocabulariesForArticle, getLanguageBySlug } from "@/lib/languages";

interface RelatedVocabulariesProps {
  articleSlug: string;
  articleTitle: string;
}

export function RelatedVocabularies({
  articleSlug,
  articleTitle,
}: RelatedVocabulariesProps) {
  const vocabularies = getVocabulariesForArticle(articleSlug);

  if (vocabularies.length === 0) return null;

  const firstLangSlug = vocabularies[0]?.languageSlug;
  const language = firstLangSlug ? getLanguageBySlug(firstLangSlug) : null;

  return (
    <section className="mt-12 rounded-3xl border border-primary/20 bg-secondary/40 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Languages className="size-3.5" aria-hidden="true" />
            Modul Bahasa Daerah Terkait
          </span>
          <h2 className="mt-2 font-display text-2xl font-semibold">
            Kosakata {language?.name ?? "Bahasa Daerah"} seputar {articleTitle}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Dengarkan pelafalan otentik dan pahami makna kultural istilah daerah yang digunakan.
          </p>
        </div>
        {language && (
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href={`/bahasa/${language.slug}`}>
              Jelajahi {language.name}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        )}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {vocabularies.map((item) => (
          <Card key={item.id} className="flex flex-col justify-between p-5 border-border/80 bg-background/80">
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">
                    {item.word}
                  </h3>
                  <p className="font-mono text-xs text-muted-foreground">
                    {item.phonetic}
                  </p>
                </div>
                <PronunciationButton
                  word={item.word}
                  phonetic={item.phonetic}
                  audioUrl={item.audioUrl}
                  size="icon"
                />
              </div>

              <p className="mt-3 text-sm font-medium text-foreground/90">
                {item.meaning}
              </p>

              <div className="mt-3 rounded-lg bg-secondary/60 p-2.5 text-xs">
                <p className="italic text-foreground/85">&ldquo;{item.exampleSentence}&rdquo;</p>
                <p className="mt-1 text-muted-foreground">→ {item.exampleMeaning}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
              <span className="capitalize rounded-md bg-secondary px-2 py-0.5 font-medium">
                {item.category.replace("_", " ")}
              </span>
              <span className="capitalize">{item.difficulty}</span>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
