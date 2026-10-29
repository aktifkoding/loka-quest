"use client";

import { useEffect, useState } from "react";

const COLORS = ["#8b9cf5", "#f0b429", "#4ade80", "#f2f0e9", "#e5484d"];

/**
 * Lightweight DOM confetti burst. Honors prefers-reduced-motion by rendering
 * nothing. Auto-removes itself after the animation completes.
 */
export function Confetti({ count = 60 }: { count?: number }) {
  const [pieces, setPieces] = useState<
    { id: number; left: number; delay: number; duration: number; color: string; size: number; drift: number }[]
  >([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDone(true);
      return;
    }

    setPieces(
      Array.from({ length: count }, (_, id) => ({
        id,
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 2.2 + Math.random() * 1.6,
        color: COLORS[id % COLORS.length],
        size: 6 + Math.random() * 6,
        drift: (Math.random() - 0.5) * 160,
      }))
    );

    const timer = setTimeout(() => setDone(true), 4500);
    return () => clearTimeout(timer);
  }, [count]);

  if (done) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(105vh) rotate(720deg) translateX(var(--drift)); opacity: 0.9; }
        }
      `}</style>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 block rounded-[2px]"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.4,
            background: p.color,
            animation: `confetti-fall ${p.duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${p.delay}s forwards`,
            ["--drift" as string]: `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
