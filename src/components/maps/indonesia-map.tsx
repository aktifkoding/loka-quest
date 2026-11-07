"use client";

import { useEffect, useRef } from "react";
import type {
  Map as LeafletMap,
  Marker as LeafletMarker,
  TileLayer as LeafletTileLayer,
} from "leaflet";
import { Reveal } from "@/components/ui/reveal";
import { MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Tile OpenStreetMap standar: bebas tanpa API key dan terlihat nyata.
// Mode gelap dicapai lewat filter CSS pada tile (lihat globals.css),
// karena CARTO/Stadia kini menuntut API key untuk basemap bertema.
const TILE = {
  url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
};

const REGIONS = [
  { slug: "aceh", name: "Aceh", lat: 5.5483, lng: 95.3238, blurb: "Tari Saman, kopi Gayo, dan rencong." },
  { slug: "sumatera-barat", name: "Sumatera Barat", lat: -0.9471, lng: 100.4172, blurb: "Rendang, rumah Gadang, dan budaya Minangkabau." },
  { slug: "jakarta", name: "Jakarta", lat: -6.2088, lng: 106.8456, blurb: "Ondel-ondel, Betawi, dan kerak telor." },
  { slug: "kalimantan", name: "Kalimantan", lat: -2.2088, lng: 113.9213, blurb: "Budaya Dayak, rumah panjang, dan hutan Borneo." },
  { slug: "sulawesi-selatan", name: "Sulawesi Selatan", lat: -5.1477, lng: 119.4327, blurb: "Perahu Phinisi, Tongkonan, dan coto Makassar." },
  { slug: "bali", name: "Bali", lat: -8.6705, lng: 115.2126, blurb: "Subak, pura, dan seni tari Legong." },
  { slug: "nusa-tenggara-timur", name: "NTT", lat: -10.1781, lng: 123.5975, blurb: "Pulau Komodo, tenun ikat, dan tanah Sumba." },
  { slug: "maluku", name: "Maluku", lat: -3.6954, lng: 128.1814, blurb: "Pala Banda, cengkeh, dan laut Seram." },
  { slug: "papua", name: "Papua", lat: -2.5916, lng: 140.669, blurb: "Bakar batu, noken, dan Raja Ampat." },
] as const;

export function IndonesiaMap({ onRegionClick }: { onRegionClick?: (slug: string) => void }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Record<string, LeafletMarker>>({});
  const tileRef = useRef<LeafletTileLayer | null>(null);
  const clickRef = useRef(onRegionClick);

  useEffect(() => {
    clickRef.current = onRegionClick;
  }, [onRegionClick]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = await import("leaflet");
      const el = containerRef.current;
      if (cancelled || !el || mapRef.current) return;

      const map = L.map(el, {
        scrollWheelZoom: false,
        minZoom: 4,
        attributionControl: true,
      });
      map.fitBounds(L.latLngBounds(REGIONS.map((r) => [r.lat, r.lng] as [number, number])).pad(0.22));

      tileRef.current = L.tileLayer(TILE.url, { attribution: TILE.attribution }).addTo(map);
      mapRef.current = map;

      for (const region of REGIONS) {
        const marker = L.marker([region.lat, region.lng], {
          title: region.name,
          keyboard: false,
          icon: L.divIcon({
            className: "lq-map-marker-wrapper",
            html: '<span class="lq-map-marker"><span class="lq-map-marker__pulse"></span><span class="lq-map-marker__dot"></span></span>',
            iconSize: [26, 26],
            iconAnchor: [13, 13],
            popupAnchor: [0, -14],
          }),
        });

        const popup = document.createElement("div");
        popup.className = "lq-map-popup";
        popup.innerHTML = `<strong>${region.name}</strong><p>${region.blurb}</p>`;
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "Jelajahi wilayah";
        button.addEventListener("click", () => clickRef.current?.(region.slug));
        popup.appendChild(button);

        marker.bindPopup(popup, { closeButton: true, maxWidth: 240 }).addTo(map);
        markersRef.current[region.slug] = marker;
      }

      // Ikuti pergantian tema terang/gelap tanpa memuat ulang peta.
      // (Tile tetap sama; tampilan gelap ditangani filter CSS di globals.css.)
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current = {};
      tileRef.current = null;
    };
  }, []);

  const flyToRegion = (slug: string) => {
    const region = REGIONS.find((r) => r.slug === slug);
    if (!mapRef.current || !region) return;
    mapRef.current.flyTo([region.lat, region.lng], 7, { duration: 0.9 });
    markersRef.current[slug]?.openPopup();
  };

  return (
    <div className="w-full">
      {/* z-0 menahan pane Leaflet di bawah navbar mengapung */}
      <div className="relative z-0 h-[380px] w-full overflow-hidden rounded-2xl border border-border/70 bg-card shadow-raised sm:h-[460px] lg:h-[520px]">
        <div ref={containerRef} className="h-full w-full" aria-label="Peta interaktif Nusantara" role="application" />
      </div>

      {/* Chip navigasi cepat: terbang ke wilayah & buka popupnya */}
      <Reveal delay={120}>
        <div className="mt-5 flex flex-wrap gap-2">
          {REGIONS.map((region) => (
            <button
              key={region.slug}
              type="button"
              onClick={() => flyToRegion(region.slug)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-3 py-1.5 text-xs font-medium text-foreground/75 transition-all hover:border-primary/60 hover:text-primary"
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
