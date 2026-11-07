"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type AnimatedMeterProps = {
  /** Lebar akhir dalam persen (0–100). */
  value: number;
  className?: string;
  barClassName?: string;
  /** Jeda sebelum mengisi, agar mount selesai dulu (ms). */
  delay?: number;
} & Omit<React.ComponentProps<"div">, "children" | "className">;

/**
 * Bar progres yang mengisi dari nol saat masuk layar — angka yang bergerak
 * terasa "hidup" dibanding lebar statis. Menghormati prefers-reduced-motion
 * (langsung tampil penuh tanpa transisi).
 */
export function AnimatedMeter({
  value,
  className,
  barClassName,
  delay = 250,
  ...props
}: AnimatedMeterProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const clamped = Math.min(Math.max(value, 0), 100);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setWidth(clamped);
      return;
    }
    const timer = setTimeout(() => setWidth(clamped), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <div className={cn("overflow-hidden", className)} {...props}>
      <div
        className={cn(barClassName)}
        style={{
          width: `${width}%`,
          transition:
            "width 700ms cubic-bezier(0.22, 1, 0.36, 1), background-color 200ms",
        }}
      />
    </div>
  );
}
