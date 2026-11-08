"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  GraduationCap,
  Filter,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { bahasaDict as d } from "@/lib/i18n/dict/bahasa";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PronunciationButton } from "@/components/bahasa/pronunciation-button";
import { VocabularyQuiz } from "@/components/bahasa/vocabulary-quiz";
import {
  getLanguageBySlug,
  getVocabulariesByLanguage,
  generateLanguageQuiz,
  type VocabularyItem,
  type LanguageQuizQuestion,
} from "@/lib/languages";

export default function LanguageDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { t } = useI18n();
  const language = getLanguageBySlug(slug);

  const [activeTab, setActiveTab] = useState<"vocab" | "quiz">("vocab");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [vocabList, setVocabList] = useState<VocabularyItem[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<LanguageQuizQuestion[]>([]);

  useEffect(() => {
    if (!language) return;
    setVocabList(
      getVocabulariesByLanguage(slug, {
        category: selectedCategory !== "all" ? selectedCategory : undefined,
      })
    );
    setQuizQuestions(generateLanguageQuiz(slug, 5));
  }, [slug, language, selectedCategory]);

  if (!language) {
    notFound();
  }

  const categories = [
    { key: "all", label: t(d.categoryAll) },
    { key: "sapaan", label: t(d.categoryGreetings) },
    { key: "budaya", label: t(d.categoryCulture) },
    { key: "sehari_hari", label: t(d.categoryDaily) },
    { key: "alam", label: t(d.categoryNature) },
    { key: "ungkapan", label: t(d.categoryExpressions) },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
      {/* Back button */}
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
        <Link href="/bahasa">
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t(d.backToAllLanguages)}
        </Link>
      </Button>

      {/* Header */}
      <header className="rounded-3xl border border-border bg-secondary/50 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {language.regionName}
            </span>
            <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">
              {language.name}
            </h1>
            <p className="mt-1 font-serif text-lg text-muted-foreground">
              {language.nativeName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <PronunciationButton
              word={language.greeting.word}
              phonetic={language.greeting.phonetic}
              audioUrl={language.greeting.audioUrl}
              label={t(d.greetingAria, { word: language.greeting.word })}
              size="default"
            />
          </div>
        </div>

        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          {language.description}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
          <span>
            <strong>{t(d.scriptLabel)}</strong> {language.scriptName || t(d.latinScriptFallback)}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            <strong>{t(d.speakersLabel)}</strong> {language.speakersEstimate}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            <strong>{t(d.culturalNoteLabel)}</strong> {language.culturalNote}
          </span>
        </div>
      </header>

      {/* Tab Switcher */}
      <div className="mt-8 flex border-b border-border">
        <button
          onClick={() => setActiveTab("vocab")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === "vocab"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <BookOpen className="size-4" aria-hidden="true" />
          {t(d.tabVocab, { n: vocabList.length })}
        </button>
        <button
          onClick={() => setActiveTab("quiz")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === "quiz"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <GraduationCap className="size-4" aria-hidden="true" />
          {t(d.tabQuiz)}
        </button>
      </div>

      {/* Content based on Tab */}
      {activeTab === "vocab" && (
        <div className="mt-6">
          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground mr-1 flex items-center gap-1">
              <Filter className="size-3.5" aria-hidden="true" /> {t(d.filterLabel)}
            </span>
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  selectedCategory === cat.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Vocabulary Cards */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {vocabList.map((item) => (
              <Card
                key={item.id}
                className="flex flex-col justify-between p-5 transition-[border-color,box-shadow,transform] hover:border-primary/40"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-xl font-bold text-foreground">
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

                  <div className="mt-3 rounded-xl bg-secondary/60 p-3 text-xs">
                    <p className="italic text-foreground/85 font-serif">
                      &ldquo;{item.exampleSentence}&rdquo;
                    </p>
                    <p className="mt-1 text-muted-foreground">→ {item.exampleMeaning}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs">
                  <span className="rounded-md bg-secondary px-2 py-0.5 font-medium capitalize text-muted-foreground">
                    {item.category.replace("_", " ")}
                  </span>
                  {item.relatedArticleSlug && (
                    <Link
                      href={`/encyclopedia/${item.relatedArticleSlug}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      {t(d.relatedArticleCta)}
                      <ExternalLink className="size-3" aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === "quiz" && (
        <div className="mt-6 max-w-2xl mx-auto">
          <VocabularyQuiz
            languageSlug={slug}
            languageName={language.name}
            questions={quizQuestions}
          />
        </div>
      )}
    </div>
  );
}
