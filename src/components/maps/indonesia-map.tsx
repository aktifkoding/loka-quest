"use client";

import { useEffect, useRef } from "react";
import type {
  Map as LeafletMap,
  Marker as LeafletMarker,
  TileLayer as LeafletTileLayer,
} from "leaflet";
import { Reveal } from "@/components/ui/reveal";
import { MapPin } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { Localized } from "@/lib/i18n";
import { shellDict as d } from "@/lib/i18n/dict/shell";
import "leaflet/dist/leaflet.css";

// Tile OpenStreetMap standar: bebas tanpa API key dan terlihat nyata.
// Mode gelap dicapai lewat filter CSS pada tile (lihat globals.css),
// karena CARTO/Stadia kini menuntut API key untuk basemap bertema.
const TILE = {
  url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
};

const REGIONS: {
  slug: string;
  name: Localized;
  lat: number;
  lng: number;
  blurb: Localized;
}[] = [
  { slug: "aceh", name: { id: "Aceh", en: "Aceh" }, lat: 5.5483, lng: 95.3238, blurb: { id: "Tari Saman, kopi Gayo, dan rencong.", en: "Saman dance, Gayo coffee, and rencong blades." } },
  { slug: "sumatera-barat", name: { id: "Sumatera Barat", en: "West Sumatra" }, lat: -0.9471, lng: 100.4172, blurb: { id: "Rendang, rumah Gadang, dan budaya Minangkabau.", en: "Rendang, Gadang houses, and Minangkabau culture." } },
  { slug: "jakarta", name: { id: "Jakarta", en: "Jakarta" }, lat: -6.2088, lng: 106.8456, blurb: { id: "Ondel-ondel, Betawi, dan kerak telor.", en: "Ondel-ondel, Betawi culture, and kerak telor." } },
  { slug: "kalimantan", name: { id: "Kalimantan", en: "Kalimantan" }, lat: -2.2088, lng: 113.9213, blurb: { id: "Budaya Dayak, rumah panjang, dan hutan Borneo.", en: "Dayak culture, longhouses, and the Borneo rainforest." } },
  { slug: "sulawesi-selatan", name: { id: "Sulawesi Selatan", en: "South Sulawesi" }, lat: -5.1477, lng: 119.4327, blurb: { id: "Perahu Phinisi, Tongkonan, dan coto Makassar.", en: "Phinisi boats, Tongkonan houses, and coto Makassar." } },
  { slug: "bali", name: { id: "Bali", en: "Bali" }, lat: -8.6705, lng: 115.2126, blurb: { id: "Subak, pura, dan seni tari Legong.", en: "Subak irrigation, temples, and Legong dance." } },
  { slug: "nusa-tenggara-timur", name: { id: "NTT", en: "East Nusa Tenggara" }, lat: -10.1781, lng: 123.5975, blurb: { id: "Pulau Komodo, tenun ikat, dan tanah Sumba.", en: "Komodo Island, ikat weaving, and the land of Sumba." } },
  { slug: "maluku", name: { id: "Maluku", en: "Maluku" }, lat: -3.6954, lng: 128.1814, blurb: { id: "Pala Banda, cengkeh, dan laut Seram.", en: "Banda nutmeg, cloves, and the Seram Sea." } },
  { slug: "papua", name: { id: "Papua", en: "Papua" }, lat: -2.5916, lng: 140.669, blurb: { id: "Bakar batu, noken, dan Raja Ampat.", en: "Stone-burning feasts, noken bags, and Raja Ampat." } },
];

export function IndonesiaMap({ onRegionClick }: { onRegionClick?: (slug: string) => void }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Record<string, LeafletMarker>>({});
  const tileRef = useRef<LeafletTileLayer | null>(null);
  const clickRef = useRef(onRegionClick);
  const { lang, t } = useI18n();

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
          title: t(region.name),
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
        popup.innerHTML = `<strong>${t(region.name)}</strong><p>${t(region.blurb)}</p>`;
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = t(d.exploreRegion);
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
    // Bangun ulang popup saat bahasa berubah agar isinya ikut diterjemahkan.
  }, [lang, t]);

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
        <div ref={containerRef} className="h-full w-full" aria-label={t(d.mapAria)} role="application" />
      </div>

      {/* Chip navigasi cepat: terbang ke wilayah & buka popupnya */}
      <Reveal delay={120}>
        <div className="mt-5 flex flex-wrap gap-2">
          {REGIONS.map((region) => (
            <button
              key={region.slug}
              type="button"
              onClick={() => flyToRegion(region.slug)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-3 py-1.5 text-xs font-medium text-foreground/75 transition-[border-color,color] hover:border-primary/60 hover:text-primary"
            >
              <MapPin className="size-3.5" aria-hidden="true" />
              {t(region.name)}
            </button>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
