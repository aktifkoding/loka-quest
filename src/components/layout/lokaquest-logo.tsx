import { useId } from "react";
import { cn } from "@/lib/utils";
import "./lokaquest-logo.css";

export interface LokaQuestLogoProps {
  /** Visual size preset (default: "md"). */
  size?: "sm" | "md" | "lg";
  /** Use "dark" when rendered on a fixed deep-charcoal background like the footer. */
  tone?: "auto" | "dark";
  /** Show the miniature "NUSANTARA" cultural subtitle under the wordmark. */
  showSubtitle?: boolean;
  /** Optional suffix label (e.g. "Admin"). */
  suffix?: string;
  /** Hide text wordmark on small screens (useful in compact admin nav). */
  hideTextOnMobile?: boolean;
  className?: string;
}

const SIZE_CONFIG = {
  sm: {
    emblem: "size-8 rounded-lg",
    svg: "size-6",
    wordmark: "text-base",
    subtitle: "text-[8px]",
    gap: "gap-2",
  },
  md: {
    emblem: "size-9 rounded-xl",
    svg: "size-7",
    wordmark: "text-[1.15rem]",
    subtitle: "text-[9px]",
    gap: "gap-2.5",
  },
  lg: {
    emblem: "size-11 rounded-xl",
    svg: "size-8",
    wordmark: "text-xl",
    subtitle: "text-[10px]",
    gap: "gap-3",
  },
} as const;

/**
 * Bespoke Indonesian cultural brand logo for LokaQuest:
 * Combines a Gunungan arch silhouette, Surya Majapahit compass star, and
 * Batik Kawung four-petal core in metallic gold & bronze with editorial display typography.
 */
export function LokaQuestLogo({
  size = "md",
  tone = "auto",
  showSubtitle = false,
  suffix,
  hideTextOnMobile = false,
  className,
}: LokaQuestLogoProps) {
  const uid = useId().replace(/:/g, "");
  const goldGradId = `lq-gold-${uid}`;
  const bronzeGradId = `lq-bronze-${uid}`;
  const cfg = SIZE_CONFIG[size];

  return (
    <span
      data-tone={tone}
      className={cn(
        "lq-logo-root inline-flex items-center select-none",
        cfg.gap,
        className
      )}
    >
      {/* Cultural Emblem: Gunungan Arch + Surya Majapahit Compass + Kawung Core */}
      <span
        className={cn(
          "lq-logo-emblem flex shrink-0 items-center justify-center border border-[#D4AF37]/50",
          cfg.emblem
        )}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cfg.svg}
        >
          <defs>
            <linearGradient
              id={goldGradId}
              x1="8"
              y1="6"
              x2="40"
              y2="42"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#F7E392" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#A6722E" />
            </linearGradient>
            <linearGradient
              id={bronzeGradId}
              x1="10"
              y1="8"
              x2="38"
              y2="40"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#9C6B3B" stopOpacity="0.65" />
            </linearGradient>
          </defs>

          {/* Outer Gunungan Wayang Arch Frame */}
          <path
            d="M24 4.5 C28.5 11, 37.5 17, 38.5 28.5 C39 34.5, 34 39.5, 24 42.5 C14 39.5, 9 34.5, 9.5 28.5 C10.5 17, 19.5 11, 24 4.5 Z"
            stroke={`url(#${goldGradId})`}
            strokeWidth="1.6"
            fill="rgba(212, 175, 55, 0.06)"
          />

          {/* Rotating Surya Majapahit 8-Point Quest Compass */}
          <g className="lq-logo-compass">
            {/* Cardinal compass rays */}
            <path
              d="M24 11.5 L26.1 21.9 L36.5 24 L26.1 26.1 L24 36.5 L21.9 26.1 L11.5 24 L21.9 21.9 Z"
              fill={`url(#${goldGradId})`}
            />
            {/* Diagonal bronze accents */}
            <path
              d="M16.5 16.5 L22.2 22.2 M31.5 16.5 L25.8 22.2 M31.5 31.5 L25.8 25.8 M16.5 31.5 L22.2 25.8"
              stroke={`url(#${bronzeGradId})`}
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            {/* Batik Kawung 4-petal inner ring */}
            <circle
              cx="24"
              cy="24"
              r="3.2"
              fill="#15141D"
              stroke="#F5DC7B"
              strokeWidth="1.2"
            />
            <circle cx="24" cy="24" r="1.2" fill="#F7E392" />
          </g>

          {/* Subtle ornamental corner wajik dots */}
          <circle cx="24" cy="8.2" r="1" fill="#F7E392" opacity="0.85" />
          <circle cx="15" cy="36.2" r="0.9" fill="#D4AF37" opacity="0.7" />
          <circle cx="33" cy="36.2" r="0.9" fill="#D4AF37" opacity="0.7" />
        </svg>
      </span>

      {/* Editorial Cultural Wordmark */}
      <span
        className={cn(
          "flex flex-col leading-none",
          hideTextOnMobile && "hidden sm:flex"
        )}
      >
        <span
          className={cn(
            "inline-flex items-baseline gap-0.5 font-display font-bold tracking-tight",
            cfg.wordmark
          )}
        >
          <span className={tone === "dark" ? "text-stone-50" : "text-foreground"}>
            Loka
          </span>
          <span className="lq-logo-wordmark-gold">Quest</span>
          {suffix ? (
            <span
              className={cn(
                "ml-1.5 rounded-md border px-1.5 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wider",
                tone === "dark"
                  ? "border-[#D4AF37]/35 bg-[#D4AF37]/10 text-[#D4AF37]"
                  : "border-border bg-secondary text-muted-foreground"
              )}
            >
              {suffix}
            </span>
          ) : null}
        </span>

        {showSubtitle ? (
          <span
            className={cn(
              "mt-1 inline-flex items-center gap-1.5 font-sans font-semibold uppercase tracking-[0.24em]",
              cfg.subtitle,
              tone === "dark" ? "text-[#D4AF37]/80" : "text-muted-foreground"
            )}
          >
            <span
              className="inline-block size-1 rotate-45 bg-[#D4AF37]"
              aria-hidden="true"
            />
            <span>Nusantara</span>
            <span
              className="inline-block size-1 rotate-45 bg-[#D4AF37]"
              aria-hidden="true"
            />
          </span>
        ) : null}
      </span>
    </span>
  );
}
