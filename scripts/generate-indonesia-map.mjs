/**
 * Generate SVG peta Indonesia dari Natural Earth (public domain).
 *
 * Sumber data:
 *   - GeoJSON: Natural Earth 110m land (public domain)
 *   - URL: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/packages/110m_physical/ne_110m_land.geojson
 *
 * Output:
 *   - public/assets/maps/indonesia-map.svg
 *   - src/components/maps/indonesia-map.tsx
 *
 * Jalankan: node scripts/generate-indonesia-map.mjs
 */

import { writeFileSync, mkdirSync, existsSync } from "node:fs";

const WIDTH = 900;
const HEIGHT = 560;

const BOUNDS = { minLon: 95, maxLon: 141, minLat: -11, maxLat: 6 };

const FILL = "hsl(var(--secondary))";
const STROKE = "hsl(var(--primary) / 0.35)";

function project(lon, lat) {
  const x = ((lon - BOUNDS.minLon) / (BOUNDS.maxLon - BOUNDS.minLon)) * WIDTH;
  const y = HEIGHT - ((lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * HEIGHT;
  return { x, y };
}

function ringToPath(ring) {
  if (!Array.isArray(ring) || ring.length === 0) return "";
  const pts = ring.map(([lon, lat]) => {
    const { x, y } = project(lon, lat);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  return `M ${pts.join(" L ")} Z`;
}

function geometryToPaths(geometry) {
  const out = [];
  if (!geometry) return out;
  if (geometry.type === "Polygon") {
    for (const ring of geometry.coordinates) out.push(ringToPath(ring));
  } else if (geometry.type === "MultiPolygon") {
    for (const poly of geometry.coordinates) {
      for (const ring of poly) out.push(ringToPath(ring));
    }
  }
  return out.filter(Boolean);
}

function toSvgPath(geo) {
  return geometryToPaths(geo).join("\n    ");
}

async function main() {
  const outDir = "public/assets/maps";
  const compDir = "src/components/maps";
  mkdirSync(outDir, { recursive: true });
  mkdirSync(compDir, { recursive: true });

  const url =
    "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson";

  console.log("Downloading Natural Earth 110m land...");
  const res = await fetch(url, {
    headers: { "User-Agent": "LokaQuest-education-project/1.0" },
  });
  if (!res.ok) throw new Error(`download failed ${res.status}`);
  const geojson = await res.json();

  const feature = geojson.features.find((f) => {
    const name = f.properties?.NAME || f.properties?.ADMIN || "";
    return name.includes("Indonesia") || f.properties?.ISO_A3 === "IDN";
  });
  if (!feature) {
    console.error("Indonesia not found in Natural Earth data");
    process.exit(1);
  }

  const paths = toSvgPath(feature.geometry);
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">
  <title>Indonesia - Natural Earth (Public Domain)</title>
  <desc>Generated from Natural Earth 110m physical data. Public Domain dedication.</desc>
  <g fill="${FILL}" stroke="${STROKE}" stroke-width="1.2" stroke-linejoin="round">
    ${paths}
  </g>
</svg>`;

  const svgPath = `${outDir}/indonesia-map.svg`;
  writeFileSync(svgPath, svg);
  console.log(`✓ ${svgPath}`);

  const regions = [
    { slug: "aceh", name: "Aceh", x: 21, y: 10 },
    { slug: "sumatera-barat", name: "Sumatera Barat", x: 27, y: 22 },
    { slug: "jakarta", name: "Jakarta", x: 31, y: 35 },
    { slug: "kalimantan", name: "Kalimantan", x: 57, y: 28 },
    { slug: "sulawesi-selatan", name: "Sulawesi Selatan", x: 66, y: 42 },
    { slug: "bali", name: "Bali", x: 71, y: 55 },
    { slug: "nusa-tenggara-timur", name: "NTT", x: 77, y: 63 },
    { slug: "maluku", name: "Maluku", x: 81, y: 37 },
    { slug: "papua", name: "Papua", x: 91, y: 26 },
  ];

  const markers = regions
    .map(
      (r) => `    <g id="marker-${r.slug}" className="transition-transform duration-200 hover:scale-110">
      <circle cx="${WIDTH * (r.x / 100)}" cy="${HEIGHT * (r.y / 100)}" r="18" fill="hsl(var(--primary) / 0.18)" className="animate-ping" style="animation-duration:2.2s" />
      <circle cx="${WIDTH * (r.x / 100)}" cy="${HEIGHT * (r.y / 100)}" r="7" fill="hsl(var(--primary))" stroke="hsl(var(--background))" stroke-width="2.5" className="cursor-pointer" />
    </g>`
    )
    .join("\n");

  const component = `"use client";

import { useState } from "react";

const WIDTH = ${WIDTH};
const HEIGHT = ${HEIGHT};

const REGIONS = [
  ${regions
    .map(
      (r) =>
        `{ slug: "${r.slug}", name: "${r.name}", x: ${WIDTH * (r.x / 100)}, y: ${HEIGHT * (r.y / 100)} }`
    )
    .join(",\n  ")}
];

export function IndonesiaMap({ onRegionClick }: { onRegionClick?: (slug: string) => void }) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      <div className="relative rounded-2xl border border-border/70 bg-secondary/20 p-3 sm:p-4 shadow-raised">
        <svg
          viewBox="0 0 ${WIDTH} ${HEIGHT}"
          className="w-full h-auto"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Peta interaktif Nusantara"
        >
          <title>Peta Nusantara</title>
          <image
            href="/assets/maps/indonesia-map.svg"
            width="${WIDTH}"
            height="${HEIGHT}"
            preserveAspectRatio="xMidYMid meet"
          />

          ${markers}

          {REGIONS.map((region) => (
            <text
              key={"tooltip-" + region.slug}
              x={region.x}
              y={region.y - 14}
              textAnchor="middle"
              style={{
                fontSize: "11px",
                fontWeight: 600,
                fill: "hsl(var(--foreground))",
                opacity: hovered === region.slug ? 1 : 0,
                transition: "opacity 0.2s ease",
                pointerEvents: "none",
              }}
            >
              {region.name}
            </text>
          ))}
        </svg>

        <div className="mt-3 flex flex-wrap gap-2">
          {REGIONS.map((region) => (
            <button
              key={region.slug}
              onClick={() => onRegionClick?.(region.slug)}
              onMouseEnter={() => setHovered(region.slug)}
              onMouseLeave={() => setHovered(null)}
              className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-foreground/80 transition hover:border-primary hover:text-primary"
            >
              {region.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
`;

  const compPath = `${compDir}/indonesia-map.tsx`;
  writeFileSync(compPath, component);
  console.log(`✓ ${compPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
