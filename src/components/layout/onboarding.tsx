"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Gamepad2, TrendingUp, X } from "lucide-react";

const STORAGE_KEY = "lq-onboarded-v1";

const STEPS = [
  {
    icon: BookOpen,
    title: "Mulai dari pre-test",
    body: "Satu menit mengukur pengetahuan awalmu. Hasilnya jadi baseline untuk melihat perkembanganmu nanti.",
    cta: { label: "Kerjakan pre-test", href: "/player/assessments" },
  },
  {
    icon: Gamepad2,
    title: "Mainkan tiga misi budaya",
    body: "Batik, gamelan, dan wayang menanti. Ada pasangan motif, urutan cerita, bahkan tebak bunyi gamelan.",
    cta: { label: "Lihat misi", href: "/missions" },
  },
  {
    icon: TrendingUp,
    title: "Kumpulkan XP, lencana, artefak",
    body: "Setiap misi selesai menambah XP dan membuka artefak budaya. Post-test di akhir menunjukkan seberapa jauh kamu berkembang.",
    cta: { label: "Mengerti, mulai sekarang", href: "/missions" },
  },
];

/**
 * First-visit welcome tour on the player dashboard.
 * Shows once per browser (localStorage), dismissible at any point.
 */
export function Onboarding() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (window.localStorage.getItem(STORAGE_KEY)) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // give the dashboard a beat to settle before interrupting
    const timer = setTimeout(() => setOpen(true), reduced ? 300 : 900);
    return () => clearTimeout(timer);
  }, []);

  const close = () => {
    setOpen(false);
    window.localStorage.setItem(STORAGE_KEY, "1");
  };

  if (!open) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Selamat datang di LokaQuest"
    >
      <div className="animate-fade-up relative w-full max-w-md rounded-2xl border border-border/70 bg-card p-7 shadow-raised">
        <button
          type="button"
          onClick={close}
          aria-label="Tutup panduan"
          className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="size-4" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-2" aria-hidden="true">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? "w-8 bg-primary" : "w-3 bg-muted"
              }`}
            />
          ))}
          <span className="ml-auto text-[12px] tabular-nums text-muted-foreground">
            {step + 1} / {STEPS.length}
          </span>
        </div>

        <div className="animate-fade-up mt-6" key={step}>
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <current.icon className="size-5" aria-hidden="true" />
          </span>
          <h2 className="mt-4 font-display text-2xl font-semibold leading-snug">
            {current.title}
          </h2>
          <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
            {current.body}
          </p>
        </div>

        <div className="mt-7 flex items-center gap-3">
          {step > 0 && (
            <Button variant="ghost" onClick={() => setStep(step - 1)}>
              Kembali
            </Button>
          )}
          {isLast ? (
            <Button asChild className="flex-1" onClick={close}>
              <Link href={current.cta.href}>{current.cta.label}</Link>
            </Button>
          ) : (
            <Button className="flex-1" onClick={() => setStep(step + 1)}>
              Lanjut
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
