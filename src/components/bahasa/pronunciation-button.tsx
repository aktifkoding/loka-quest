"use client";

import { useState } from "react";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { shellDict as d } from "@/lib/i18n/dict/shell";

interface PronunciationButtonProps {
  word: string;
  phonetic?: string;
  langCode?: string;
  audioUrl?: string;
  size?: "sm" | "default" | "icon";
  className?: string;
  label?: string;
}

export function PronunciationButton({
  word,
  phonetic,
  langCode = "id-ID",
  audioUrl,
  size = "sm",
  className,
  label,
}: PronunciationButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const { t } = useI18n();

  const speak = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (isPlaying) return;

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        // Fallback to speech synthesis if audio file fails
        playSynthesis();
      };
      audio.play().catch(() => playSynthesis());
      return;
    }

    playSynthesis();
  };

  const playSynthesis = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = langCode;
    utterance.rate = 0.85; // slightly slower for clear cultural pronunciation
    utterance.pitch = 1.0;

    setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      onClick={speak}
      className={`inline-flex items-center gap-1.5 transition-[background-color,color,box-shadow] duration-200 ${
        isPlaying
          ? "border-primary bg-primary/10 text-primary shadow-sm"
          : "hover:border-primary/50"
      } ${className ?? ""}`}
      title={t(d.pronounceTitle, { word })}
      aria-label={t(d.pronounceAria, { word })}
    >
      <Volume2
        className={`size-4 transition-transform ${
          isPlaying ? "animate-pulse scale-110 text-primary" : "text-muted-foreground"
        }`}
        aria-hidden="true"
      />
      {label ? (
        <span>{label}</span>
      ) : phonetic ? (
        <span className="font-mono text-xs text-muted-foreground">{phonetic}</span>
      ) : (
        <span className="text-xs">{t(d.pronounceListen)}</span>
      )}
    </Button>
  );
}
