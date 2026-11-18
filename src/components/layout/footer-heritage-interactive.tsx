"use client";

import { useState } from "react";
import { ArrowUp, Sparkles } from "lucide-react";
import type { Lang } from "@/lib/i18n/types";
import "./footer-heritage-interactive.css";

interface CulturalMotif {
  id: string;
  name: string;
  origin: string;
  meaning: { id: string; en: string };
}

const CULTURAL_MOTIFS: CulturalMotif[] = [
  {
    id: "kawung",
    name: "Batik Kawung",
    origin: "Yogyakarta",
    meaning: {
      id: "Simbol keselarasan, kemurnian hati, dan keseimbangan hidup.",
      en: "Symbol of harmony, purity of heart, and balanced living.",
    },
  },
  {
    id: "parang",
    name: "Parang Rusak",
    origin: "Surakarta",
    meaning: {
      id: "Semangat pantang menyerah bagaikan ombak samudra yang terus bergerak.",
      en: "Unwavering perseverance, like ocean waves in perpetual motion.",
    },
  },
  {
    id: "megamendung",
    name: "Mega Mendung",
    origin: "Cirebon",
    meaning: {
      id: "Ketenangan jiwa, kebijaksanaan, dan keteduhan di tengah dinamika.",
      en: "Inner calm, wisdom, and composure amidst changing tides.",
    },
  },
  {
    id: "pucukrebung",
    name: "Pucuk Rebung",
    origin: "Sumatra & Melayu",
    meaning: {
      id: "Harapan, pertumbuhan yang kokoh, dan keberkahan dari akar hingga pucuk.",
      en: "Hope, resilient growth, and grounded strength from root to tip.",
    },
  },
];

function MotifIcon({ id }: { id: string }) {
  switch (id) {
    case "kawung":
      return (
        <svg viewBox="0 0 32 32" className="footer-motif-svg size-5" aria-hidden="true">
          <ellipse cx="16" cy="9" rx="3.2" ry="6" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <ellipse cx="16" cy="23" rx="3.2" ry="6" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <ellipse cx="9" cy="16" rx="6" ry="3.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <ellipse cx="23" cy="16" rx="6" ry="3.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="16" cy="16" r="1.8" fill="currentColor" />
        </svg>
      );
    case "parang":
      return (
        <svg viewBox="0 0 32 32" className="footer-motif-svg size-5" aria-hidden="true">
          <path
            d="M5 23 C10 18, 12 14, 17 9 M9 27 C14 22, 16 18, 21 13 M13 19 C18 14, 20 10, 27 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="16" cy="16" r="11.5" fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1" />
        </svg>
      );
    case "megamendung":
      return (
        <svg viewBox="0 0 32 32" className="footer-motif-svg size-5" aria-hidden="true">
          <path
            d="M6 20 C6 15, 11 13, 14 15 C16 11, 22 11, 23 15 C27 15, 27 21, 22 21 L9 21 C6.5 21, 6 20, 6 20 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path
            d="M10 17.5 C12 16, 15 16, 17 17.5 C19 16, 21.5 16.5, 22.5 18"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.65"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 32 32" className="footer-motif-svg size-5" aria-hidden="true">
          <polygon
            points="16,5 25,25 7,25"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <polygon
            points="16,11 21,23 11,23"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.65"
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
          <circle cx="16" cy="19" r="1.4" fill="currentColor" />
        </svg>
      );
  }
}

/**
 * Interactive Nusantara motif explorer strip for the footer.
 * Lets visitors click or hover geometric heritage medallions to inspect their meaning.
 */
export function FooterMotifGallery({ lang }: { lang: Lang }) {
  const [activeId, setActiveId] = useState<string>("kawung");
  const activeMotif =
    CULTURAL_MOTIFS.find((m) => m.id === activeId) ?? CULTURAL_MOTIFS[0];

  return (
    <div className="mt-6 rounded-2xl border border-[#D4AF37]/20 bg-[#141417]/75 p-4 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[#D4AF37]">
          <Sparkles className="size-3.5" aria-hidden="true" />
          <span>
            {lang === "id" ? "Ragam Motif Nusantara" : "Nusantara Motif Gallery"}
          </span>
        </div>

        <div className="flex items-center gap-2" role="group" aria-label={lang === "id" ? "Pilih motif budaya" : "Select cultural motif"}>
          {CULTURAL_MOTIFS.map((motif) => {
            const isActive = motif.id === activeId;
            return (
              <button
                key={motif.id}
                type="button"
                data-active={isActive}
                aria-pressed={isActive}
                aria-label={`${motif.name} — ${motif.origin}`}
                onClick={() => setActiveId(motif.id)}
                onMouseEnter={() => setActiveId(motif.id)}
                className={
                  isActive
                    ? "footer-motif-btn flex size-9 items-center justify-center rounded-xl border border-[#D4AF37]/70 bg-[#D4AF37]/15 text-[#D4AF37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
                    : "footer-motif-btn flex size-9 items-center justify-center rounded-xl border border-stone-700/70 bg-stone-900/60 text-stone-400 hover:border-[#D4AF37]/50 hover:text-[#D4AF37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
                }
              >
                <MotifIcon id={motif.id} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-1 border-t border-stone-800/80 pt-3 sm:flex-row sm:items-baseline sm:justify-between">
        <p className="text-sm font-medium text-stone-100">
          {activeMotif.name}{" "}
          <span className="text-xs font-normal text-[#D4AF37]/85">
            · {activeMotif.origin}
          </span>
        </p>
        <p className="text-xs leading-relaxed text-stone-300">
          {activeMotif.meaning[lang]}
        </p>
      </div>
    </div>
  );
}

/**
 * Smooth scroll-to-top button styled with a rotating Nusantara compass motif.
 */
export function FooterBackToTop({ lang }: { lang: Lang }) {
  const scrollToTop = () => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="footer-compass-btn inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#18171A]/80 px-3.5 py-1.5 text-xs font-medium text-stone-200 transition-colors duration-200 hover:border-[#D4AF37]/70 hover:bg-[#D4AF37]/15 hover:text-[#D4AF37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
    >
      <span className="footer-compass-icon flex size-4 items-center justify-center text-[#D4AF37]">
        <ArrowUp className="size-3.5" aria-hidden="true" />
      </span>
      <span>{lang === "id" ? "Kembali ke atas" : "Back to top"}</span>
    </button>
  );
}
