"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, Trophy, RotateCcw, Zap, ArrowRight } from "lucide-react";
import { Confetti } from "@/components/ui/confetti";
import { PronunciationButton } from "./pronunciation-button";
import type { LanguageQuizQuestion } from "@/lib/languages";

interface VocabularyQuizProps {
  languageSlug: string;
  languageName: string;
  questions: LanguageQuizQuestion[];
  onFinish?: (score: number) => void;
}

export function VocabularyQuiz({
  languageSlug,
  languageName,
  questions,
  onFinish,
}: VocabularyQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [answers, setAnswers] = useState<
    { wordId: string; selectedAnswer: string; isCorrect: boolean }[]
  >([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);

  if (questions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Kuis belum tersedia untuk bahasa ini.</p>
      </Card>
    );
  }

  const currentQ = questions[currentIndex];

  const handleSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
    setIsAnswered(true);

    const isCorrect = option === currentQ.correctAnswer;
    setAnswers((prev) => [
      ...prev,
      { wordId: currentQ.wordId, selectedAnswer: option, isCorrect },
    ]);
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      // Quiz complete, submit answers to API for XP
      setSubmitting(true);
      const totalCorrect = answers.filter((a) => a.isCorrect).length;
      const score = Math.round((totalCorrect / questions.length) * 100);

      try {
        const res = await fetch(`/api/v1/languages/${languageSlug}/quiz`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers: answers.map((a) => ({
              wordId: a.wordId,
              selectedAnswer: a.selectedAnswer,
            })),
          }),
        });
        const data = await res.json();
        if (data.success && data.data.xpEarned) {
          setEarnedXp(data.data.xpEarned);
        }
      } catch {
        // Fallback calculation
        setEarnedXp(totalCorrect * 15);
      } finally {
        setSubmitting(false);
        setIsCompleted(true);
        if (onFinish) onFinish(score);
      }
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setAnswers([]);
    setIsCompleted(false);
    setEarnedXp(0);
  };

  const correctCount = answers.filter((a) => a.isCorrect).length;
  const score = Math.round((correctCount / questions.length) * 100);

  if (isCompleted) {
    return (
      <Card className="relative overflow-hidden p-8 text-center animate-fade-up">
        {score >= 60 && <Confetti count={50} />}
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gold/10 text-gold">
          <Trophy className="size-7" aria-hidden="true" />
        </span>
        <h3 className="mt-4 font-display text-2xl font-bold">Kuis Selesai!</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Performa pemahaman kosakata {languageName}
        </p>
        <p className="mt-4 font-display text-5xl font-extrabold text-foreground">
          {score}
          <span className="text-xl text-muted-foreground">/100</span>
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {correctCount} dari {questions.length} kosakata terjawab benar
        </p>
        {earnedXp > 0 && (
          <div className="mx-auto mt-4 inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-4 py-1.5 text-sm font-semibold text-gold">
            <Zap className="size-4" aria-hidden="true" />
            +{earnedXp} XP Diperoleh
          </div>
        )}
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="outline" onClick={handleRestart} className="gap-2">
            <RotateCcw className="size-4" aria-hidden="true" />
            Coba Lagi
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-6 sm:p-8">
      {/* Progress header */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Pertanyaan {currentIndex + 1} dari {questions.length}
        </span>
        <span className="font-medium text-primary">{languageName}</span>
      </div>
      <div className="mt-2 h-1.5 w-full rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="mt-6">
        <div className="flex items-start justify-between gap-3">
          <h4 className="font-display text-xl font-semibold leading-snug">
            {currentQ.prompt}
          </h4>
          <PronunciationButton
            word={currentQ.prompt.split('"')[1] || currentQ.correctAnswer}
            phonetic={currentQ.phonetic}
            size="sm"
          />
        </div>
      </div>

      {/* Options */}
      <div className="mt-6 grid gap-3">
        {currentQ.options.map((option, idx) => {
          const isSelected = selectedAnswer === option;
          const isRight = option === currentQ.correctAnswer;
          let btnStyle = "border-border hover:border-primary/50 bg-background";

          if (isAnswered) {
            if (isRight) {
              btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-100";
            } else if (isSelected) {
              btnStyle = "border-destructive bg-destructive/10 text-destructive";
            } else {
              btnStyle = "opacity-50 border-border bg-background";
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(option)}
              disabled={isAnswered}
              className={`flex items-center justify-between rounded-xl border p-4 text-left text-sm font-medium transition-[background-color,border-color,color] ${btnStyle}`}
            >
              <span>{option}</span>
              {isAnswered && isRight && (
                <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              )}
              {isAnswered && isSelected && !isRight && (
                <XCircle className="size-5 shrink-0 text-destructive" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation & Next */}
      {isAnswered && (
        <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4 animate-fade-in">
          <p className="text-xs font-semibold text-primary">Penjelasan Budaya:</p>
          <p className="mt-1 text-sm text-foreground/90">{currentQ.explanation}</p>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleNext} disabled={submitting} className="gap-2">
              <span>{currentIndex < questions.length - 1 ? "Soal Berikutnya" : "Lihat Hasil"}</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
