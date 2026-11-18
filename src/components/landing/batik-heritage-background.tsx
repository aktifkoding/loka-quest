"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import "./batik-heritage-background.css";

export interface BatikHeritageBackgroundProps {
  /** Optional foreground content rendered above the animated background. */
  children?: ReactNode;
  /** Additional classes applied to the outer container. */
  className?: string;
  /** Maximum cursor-tracking parallax offset in pixels (default: 28). */
  parallaxStrength?: number;
  /** Multiplier for ambient pattern drift speed (default: 1). */
  driftSpeed?: number;
  /** Multiplier for gold & bronze lattice opacity (default: 1). */
  patternOpacity?: number;
  /** Enable cursor-tracking parallax and subtle gold spotlight (default: true). */
  interactive?: boolean;
  /** Render background layers fixed to the viewport instead of container-bound. */
  fixed?: boolean;
}

const GOLD_HEX = "212, 175, 55"; // #D4AF37
const BRONZE_HEX = "156, 107, 59"; // #9C6B3B

/**
 * Generates an offscreen tile canvas for the deeper bronze geometric lattice
 * inspired by traditional Parang & Banji diagonal fretwork.
 */
function createBronzeLatticeTile(size: number, dpr: number, opacityScale: number): HTMLCanvasElement {
  const tile = document.createElement("canvas");
  tile.width = Math.round(size * dpr);
  tile.height = Math.round(size * dpr);

  const ctx = tile.getContext("2d");
  if (!ctx) return tile;

  ctx.scale(dpr, dpr);
  const half = size / 2;

  ctx.strokeStyle = `rgba(${BRONZE_HEX}, ${(0.13 * opacityScale).toFixed(3)})`;
  ctx.lineWidth = 1;

  // Primary diagonal diamond lattice
  ctx.beginPath();
  ctx.moveTo(half, 0);
  ctx.lineTo(size, half);
  ctx.lineTo(half, size);
  ctx.lineTo(0, half);
  ctx.closePath();
  ctx.stroke();

  // Secondary interlocking corner arcs (Banji-inspired geometric step)
  ctx.strokeStyle = `rgba(${BRONZE_HEX}, ${(0.08 * opacityScale).toFixed(3)})`;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size, size);
  ctx.moveTo(size, 0);
  ctx.lineTo(0, size);
  ctx.stroke();

  // Subtle inner diamond frame
  const inset = size * 0.22;
  ctx.strokeStyle = `rgba(${BRONZE_HEX}, ${(0.1 * opacityScale).toFixed(3)})`;
  ctx.beginPath();
  ctx.moveTo(half, inset);
  ctx.lineTo(size - inset, half);
  ctx.lineTo(half, size - inset);
  ctx.lineTo(inset, half);
  ctx.closePath();
  ctx.stroke();

  return tile;
}

/**
 * Generates an offscreen tile canvas for the foreground golden (#D4AF37)
 * Kawung & Truntum geometric rosette lattice.
 */
function createGoldKawungTile(size: number, dpr: number, opacityScale: number): HTMLCanvasElement {
  const tile = document.createElement("canvas");
  tile.width = Math.round(size * dpr);
  tile.height = Math.round(size * dpr);

  const ctx = tile.getContext("2d");
  if (!ctx) return tile;

  ctx.scale(dpr, dpr);
  const half = size / 2;
  const r = size * 0.34;

  // Kawung four-petal intersecting ellipses at tile center
  ctx.strokeStyle = `rgba(${GOLD_HEX}, ${(0.16 * opacityScale).toFixed(3)})`;
  ctx.lineWidth = 1;

  const petalOffsets: Array<[number, number, number]> = [
    [half, half - r * 0.52, 0],
    [half + r * 0.52, half, Math.PI / 2],
    [half, half + r * 0.52, 0],
    [half - r * 0.52, half, Math.PI / 2],
  ];

  for (const [cx, cy, rot] of petalOffsets) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 0.28, r * 0.52, rot, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Truntum 8-point star rays at tile corners (seamless wrap)
  ctx.strokeStyle = `rgba(${GOLD_HEX}, ${(0.11 * opacityScale).toFixed(3)})`;
  const corners: Array<[number, number]> = [
    [0, 0],
    [size, 0],
    [0, size],
    [size, size],
  ];
  const ray = size * 0.14;
  for (const [cx, cy] of corners) {
    ctx.beginPath();
    ctx.moveTo(cx - ray, cy);
    ctx.lineTo(cx + ray, cy);
    ctx.moveTo(cx, cy - ray);
    ctx.lineTo(cx, cy + ray);
    ctx.stroke();
  }

  // Delicate center gold node
  ctx.fillStyle = `rgba(${GOLD_HEX}, ${(0.24 * opacityScale).toFixed(3)})`;
  ctx.beginPath();
  ctx.arc(half, half, 1.6, 0, Math.PI * 2);
  ctx.fill();

  return tile;
}

/**
 * Interactive Indonesian heritage background featuring layered deep charcoal,
 * translucent gold (#D4AF37), and bronze geometric batik latticework with
 * 60fps canvas drift and cursor-tracking parallax.
 */
export function BatikHeritageBackground({
  children,
  className,
  parallaxStrength = 28,
  driftSpeed = 1,
  patternOpacity = 1,
  interactive = true,
  fixed = false,
}: BatikHeritageBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);
  const patternId = useId().replace(/:/g, "");

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = motionQuery.matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let bronzeTile: HTMLCanvasElement | null = null;
    let goldTile: HTMLCanvasElement | null = null;
    let bronzePattern: CanvasPattern | null = null;
    let goldPattern: CanvasPattern | null = null;

    // Normalized pointer state (-1 to 1) & smoothed lerp state
    const pointer = {
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0,
      px: 0.5,
      py: 0.5,
      active: false,
    };

    let driftX = 0;
    let driftY = 0;
    let lastTime = performance.now();
    let rafId = 0;
    let isPageVisible = !document.hidden;

    const rebuildPatterns = () => {
      const rect = container.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      // Responsive tile sizing so batik geometry stays balanced across viewports
      const baseTile = width < 640 ? 96 : width > 1440 ? 140 : 118;

      bronzeTile = createBronzeLatticeTile(baseTile * 1.15, dpr, patternOpacity);
      goldTile = createGoldKawungTile(baseTile, dpr, patternOpacity);

      bronzePattern = ctx.createPattern(bronzeTile, "repeat");
      goldPattern = ctx.createPattern(goldTile, "repeat");
    };

    const drawFrame = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (!reducedMotion) {
        // Smooth exponential damping for 60fps cursor parallax
        const ease = 1 - Math.exp(-6.5 * dt);
        pointer.currentX += (pointer.targetX - pointer.currentX) * ease;
        pointer.currentY += (pointer.targetY - pointer.currentY) * ease;

        // Subtle continuous drift
        driftX += 8 * driftSpeed * dt;
        driftY += 4.5 * driftSpeed * dt;
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const parallaxX = interactive && !reducedMotion ? pointer.currentX * parallaxStrength : 0;
      const parallaxY = interactive && !reducedMotion ? pointer.currentY * parallaxStrength : 0;

      // Layer 1: Deep bronze diagonal lattice (slower parallax & counter-drift)
      if (bronzePattern && bronzeTile) {
        const bx = ((-driftX * 0.55 + parallaxX * 0.55) * dpr) % bronzeTile.width;
        const by = ((driftY * 0.45 + parallaxY * 0.55) * dpr) % bronzeTile.height;

        ctx.save();
        ctx.translate(bx, by);
        ctx.fillStyle = bronzePattern;
        ctx.fillRect(
          -bronzeTile.width,
          -bronzeTile.height,
          canvas.width + bronzeTile.width * 2,
          canvas.height + bronzeTile.height * 2
        );
        ctx.restore();
      }

      // Layer 2: Foreground golden Kawung & Truntum lattice (full parallax)
      if (goldPattern && goldTile) {
        const gx = ((driftX + parallaxX) * dpr) % goldTile.width;
        const gy = ((driftY + parallaxY) * dpr) % goldTile.height;

        ctx.save();
        ctx.translate(gx, gy);
        ctx.fillStyle = goldPattern;
        ctx.fillRect(
          -goldTile.width,
          -goldTile.height,
          canvas.width + goldTile.width * 2,
          canvas.height + goldTile.height * 2
        );
        ctx.restore();
      }

      // Layer 3: Subtle cursor-tracking golden illumination
      if (interactive && !reducedMotion && pointer.active) {
        const spotX = pointer.px * canvas.width;
        const spotY = pointer.py * canvas.height;
        const radius = Math.min(canvas.width, canvas.height) * 0.42;

        const glow = ctx.createRadialGradient(spotX, spotY, 0, spotX, spotY, radius);
        glow.addColorStop(0, `rgba(${GOLD_HEX}, ${(0.065 * patternOpacity).toFixed(3)})`);
        glow.addColorStop(0.45, `rgba(${BRONZE_HEX}, ${(0.025 * patternOpacity).toFixed(3)})`);
        glow.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      if (!reducedMotion && isPageVisible) {
        rafId = window.requestAnimationFrame(drawFrame);
      }
    };

    const startLoop = () => {
      window.cancelAnimationFrame(rafId);
      lastTime = performance.now();
      if (reducedMotion) {
        drawFrame(lastTime);
      } else if (isPageVisible) {
        rafId = window.requestAnimationFrame(drawFrame);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!interactive || reducedMotion) return;
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;

      pointer.px = Math.max(0, Math.min(1, nx));
      pointer.py = Math.max(0, Math.min(1, ny));
      pointer.targetX = (pointer.px - 0.5) * -2;
      pointer.targetY = (pointer.py - 0.5) * -2;
      pointer.active = true;
    };

    const handlePointerLeave = () => {
      pointer.targetX = 0;
      pointer.targetY = 0;
      pointer.active = false;
    };

    const handleVisibilityChange = () => {
      isPageVisible = !document.hidden;
      if (isPageVisible) {
        startLoop();
      } else {
        window.cancelAnimationFrame(rafId);
      }
    };

    const handleMotionChange = (e: MediaQueryListEvent) => {
      reducedMotion = e.matches;
      startLoop();
    };

    const resizeObserver = new ResizeObserver(() => {
      rebuildPatterns();
      if (reducedMotion) drawFrame(performance.now());
    });

    rebuildPatterns();
    setIsReady(true);
    startLoop();

    resizeObserver.observe(container);
    if (interactive) {
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      container.addEventListener("pointerleave", handlePointerLeave, { passive: true });
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    motionQuery.addEventListener("change", handleMotionChange);

    return () => {
      window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      if (interactive) {
        window.removeEventListener("pointermove", handlePointerMove);
        container.removeEventListener("pointerleave", handlePointerLeave);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      motionQuery.removeEventListener("change", handleMotionChange);
    };
  }, [driftSpeed, interactive, parallaxStrength, patternOpacity]);

  const svgPatternId = `batik-lattice-${patternId}`;

  return (
    <div ref={containerRef} className={cn("batik-heritage-root", className)}>
      <div
        className={cn(
          "batik-heritage-layer",
          fixed && "batik-heritage-layer--fixed"
        )}
        aria-hidden="true"
      >
        {/* 60fps Canvas Geometric Batik Patterns */}
        <canvas
          ref={canvasRef}
          className="batik-heritage-canvas"
          data-ready={isReady}
        />

        {/* Crisp SVG Architectural Lattice Accent Layer */}
        <svg
          className="batik-heritage-svg-lattice"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id={svgPatternId}
              width="96"
              height="96"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M48 0 L96 48 L48 96 L0 48 Z"
                fill="none"
                stroke="#D4AF37"
                strokeOpacity={0.085 * patternOpacity}
                strokeWidth="0.75"
              />
              <path
                d="M0 0 L96 96 M96 0 L0 96"
                fill="none"
                stroke="#9C6B3B"
                strokeOpacity={0.07 * patternOpacity}
                strokeWidth="0.6"
              />
              <circle
                cx="48"
                cy="48"
                r="2.2"
                fill="#D4AF37"
                fillOpacity={0.14 * patternOpacity}
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${svgPatternId})`} />
        </svg>

        {/* Ambient Warm Glow & Legibility Vignette */}
        <div className="batik-heritage-glow" />
        <div className="batik-heritage-vignette" />
      </div>

      {children ? <div className="batik-heritage-content">{children}</div> : null}
    </div>
  );
}
