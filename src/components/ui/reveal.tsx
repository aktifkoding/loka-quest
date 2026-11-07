"use client";

import { useEffect, useRef, useState } from "react";

type RevealDirection = "up" | "left" | "right" | "scale";

const HIDDEN: Record<RevealDirection, string> = {
  up: "translateY(18px)",
  left: "translateX(-26px)",
  right: "translateX(26px)",
  scale: "scale(0.955)",
};

const SHOWN: Record<RevealDirection, string> = {
  up: "translateY(0)",
  left: "translateX(0)",
  right: "translateX(0)",
  scale: "scale(1)",
};

/**
 * Scroll-reveal wrapper: children animate into view once on first intersect.
 * Respects prefers-reduced-motion (content appears immediately).
 */
export function Reveal({
  children,
  delay = 0,
  direction = "up",
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: RevealDirection;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? SHOWN[direction] : HIDDEN[direction],
        transition: `opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 0.55s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
