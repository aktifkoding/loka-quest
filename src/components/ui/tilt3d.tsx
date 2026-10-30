"use client";

import { useRef, useState } from "react";

/**
 * Pointer-driven 3D tilt (CSS perspective). No library needed.
 * Honors prefers-reduced-motion by rendering children flat.
 */
export function Tilt3D({
  children,
  max = 8,
  className,
}: {
  children: React.ReactNode;
  max?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  const move = (e: React.PointerEvent) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setStyle({
      transform: `perspective(900px) rotateY(${px * max}deg) rotateX(${-py * max}deg) translateZ(6px)`,
      transition: "transform 80ms ease-out",
    });
  };

  const leave = () => {
    setStyle({
      transform: "perspective(900px) rotateY(0deg) rotateX(0deg)",
      transition: "transform 450ms cubic-bezier(0.22, 1, 0.36, 1)",
    });
  };

  return (
    <div ref={ref} onPointerMove={move} onPointerLeave={leave} style={style} className={className}>
      {children}
    </div>
  );
}
