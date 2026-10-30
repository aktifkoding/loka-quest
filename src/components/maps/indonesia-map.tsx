"use client";

import { useState, useCallback } from "react";
import { Tilt3D } from "@/components/ui/tilt3d";
import { Reveal } from "@/components/ui/reveal";
import { MapPin } from "lucide-react";
const WIDTH = 900;
const HEIGHT = 560;

const REGIONS = [
  { slug: "aceh", name: "Aceh", cx: 189, cy: 56 },
  { slug: "sumatera-barat", name: "Sumatera Barat", cx: 243, cy: 123 },
  { slug: "jakarta", name: "Jakarta", cx: 279, cy: 196 },
  { slug: "kalimantan", name: "Kalimantan", cx: 513, cy: 157 },
  { slug: "sulawesi-selatan", name: "Sulawesi Selatan", cx: 594, cy: 235 },
  { slug: "bali", name: "Bali", cx: 639, cy: 308 },
  { slug: "nusa-tenggara-timur", name: "NTT", cx: 693, cy: 353 },
  { slug: "maluku", name: "Maluku", cx: 729, cy: 207 },
  { slug: "papua", name: "Papua", cx: 819, cy: 146 },
];

export function IndonesiaMap({ onRegionClick }: { onRegionClick?: (slug: string) => void }) {
  const [hovered, setHovered] = useState<string | null>(null);

  const handleClick = useCallback((slug: string) => {
    onRegionClick?.(slug);
  }, [onRegionClick]);

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      <Tilt3D max={6} className="rounded-2xl border border-border/70 bg-secondary/10 p-3 sm:p-5 shadow-raised">
        <div className="relative">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="w-full h-auto select-none"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Peta interaktif Nusantara"
          >
            <title>Peta Nusantara</title>
            <image
              href="/assets/maps/indonesia-map.svg"
              width={WIDTH}
              height={HEIGHT}
              preserveAspectRatio="xMidYMid meet"
            />

            {/* Region markers */}
            {REGIONS.map((region) => {
              const isHovered = hovered === region.slug;
              return (
                <g
                  key={region.slug}
                  className="transition-transform duration-200"
                  style={{ transform: isHovered ? "scale(1.15)" : "scale(1)" }}
                  onMouseEnter={() => setHovered(region.slug)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => handleClick(region.slug)}
                >
                  {/* Pulse ring */}
                  <circle
                    cx={region.cx}
                    cy={region.cy}
                    r="14"
                    fill="hsl(var(--primary) / 0.25)"
                    className="animate-ping"
                    style={{ animationDuration: "2.4s" }}
                  />
                  {/* Outer glow */}
                  <circle
                    cx={region.cx}
                    cy={region.cy}
                    r="9"
                    fill="hsl(var(--primary) / 0.18)"
                  />
                  {/* Dot */}
                  <circle
                    cx={region.cx}
                    cy={region.cy}
                    r="5.5"
                    fill="hsl(var(--primary))"
                    stroke="hsl(var(--background))"
                    strokeWidth="2.5"
                    className="cursor-pointer"
                  />
                  {/* Tooltip label */}
                  <text
                    x={region.cx}
                    y={region.cy - 16}
                    textAnchor="middle"
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      fill: "hsl(var(--foreground))",
                      opacity: isHovered ? 1 : 0,
                      transition: "opacity 0.2s ease",
                      pointerEvents: "none",
                    }}
                  >
                    {region.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </Tilt3D>

      {/* Region quick-nav chips */}
      <Reveal delay={120}>
        <div className="mt-5 flex flex-wrap gap-2">
          {REGIONS.map((region) => (
            <button
              key={region.slug}
              onClick={() => handleClick(region.slug)}
              onMouseEnter={() => setHovered(region.slug)}
              onMouseLeave={() => setHovered(null)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                hovered === region.slug
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-border/70 bg-background text-foreground/75 hover:border-primary/60 hover:text-primary"
              }`}
            >
              <MapPin className="size-3.5" aria-hidden="true" />
              {region.name}
            </button>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
