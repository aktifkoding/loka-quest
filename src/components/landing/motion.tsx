"use client";

// Pembungkus animasi GSAP untuk landing. Konten tetap dirender di Server
// Component — komponen ini hanya menyediakan scope timeline + ScrollTrigger.
// Jika JS gagal dimuat atau pengguna memilih reduced-motion, konten tampil
// utuh tanpa animasi (semua tween memakai gsap.from).
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Timeline entrance hero: badge → judul (per kata) → garis emas →
 * subjudul → CTA → kartu kuis → lencana XP. Sekali jalan saat mount.
 */
export function HeroMotion({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-badge", { y: 14, autoAlpha: 0, duration: 0.4 })
        .from(
          ".hero-word",
          {
            yPercent: 115,
            autoAlpha: 0,
            duration: 0.55,
            stagger: 0.06,
          },
          "-=0.22"
        )
        .from(
          ".hero-underline",
          { scaleX: 0, duration: 0.5, ease: "power2.out" },
          "-=0.3"
        )
        .from(".hero-sub", { y: 16, autoAlpha: 0, duration: 0.4 }, "-=0.28")
        .from(".hero-cta", { y: 14, autoAlpha: 0, duration: 0.4 }, "-=0.22")
        .from(".hero-note", { autoAlpha: 0, duration: 0.3 }, "-=0.15")
        .from(
          ".hero-card",
          { y: 30, scale: 0.97, autoAlpha: 0, duration: 0.55 },
          "-=0.5"
        )
        .from(
          ".hero-xp",
          { scale: 0.55, autoAlpha: 0, duration: 0.4, ease: "back.out(2.2)" },
          "-=0.12"
        );
      // Bersihkan inline style GSAP setelah entrance — elemen kembali ke
      // state CSS murni sehingga tidak ada gaya animasi yang menempel.
      tl.eventCallback("onComplete", () => {
        gsap.set(
          [
            ".hero-badge",
            ".hero-word",
            ".hero-underline",
            ".hero-sub",
            ".hero-cta",
            ".hero-note",
            ".hero-card",
            ".hero-xp",
          ],
          { clearProps: "all" }
        );
      });
    },
    { scope }
  );

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}

/**
 * Reveal berjenjang saat elemen masuk viewport (sekali jalan).
 * Anak-anaknya ditandai `data-stagger-item` dari Server Component.
 */
export function ScrollStagger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const items = gsap.utils.toArray<HTMLElement>("[data-stagger-item]");
      if (items.length === 0) return;
      gsap.from(items, {
        y: 26,
        autoAlpha: 0,
        duration: 0.5,
        ease: "power2.out",
        stagger: 0.07,
        scrollTrigger: { trigger: items[0], start: "top 85%", once: true },
      });
    },
    { scope }
  );

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}
