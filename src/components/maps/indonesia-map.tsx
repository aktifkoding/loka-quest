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
  { slug: "jawa-barat", name: { id: "Jawa Barat", en: "West Java" }, lat: -6.9175, lng: 107.6191, blurb: { id: "Angklung bambu, kecapi suling, dan tatar Sunda.", en: "Bamboo angklung, kacapi suling, and Sundanese heritage." } },
  { slug: "jawa-tengah", name: { id: "Jawa Tengah", en: "Central Java" }, lat: -7.5561, lng: 110.8318, blurb: { id: "Batik klasik, gamelan keraton, dan Candi Borobudur.", en: "Classical batik, court gamelan, and Borobudur Temple." } },
  { slug: "yogyakarta", name: { id: "Yogyakarta", en: "Yogyakarta" }, lat: -7.7956, lng: 110.3695, blurb: { id: "Wayang kulit, keris pusaka, dan sumbu filosofi.", en: "Wayang kulit shadow puppetry, keris, and the philosophical axis." } },
  { slug: "kalimantan", name: { id: "Kalimantan", en: "Kalimantan" }, lat: -2.2088, lng: 113.9213, blurb: { id: "Budaya Dayak, rumah panjang, dan hutan Borneo.", en: "Dayak culture, longhouses, and the Borneo rainforest." } },
  { slug: "sulawesi-selatan", name: { id: "Sulawesi Selatan", en: "South Sulawesi" }, lat: -5.1477, lng: 119.4327, blurb: { id: "Perahu Phinisi, Tongkonan, dan coto Makassar.", en: "Phinisi boats, Tongkonan houses, and coto Makassar." } },
  { slug: "bali", name: { id: "Bali", en: "Bali" }, lat: -8.6705, lng: 115.2126, blurb: { id: "Subak, pura, dan seni tari Legong.", en: "Subak irrigation, temples, and Legong dance." } },
  { slug: "nusa-tenggara-timur", name: { id: "NTT", en: "East Nusa Tenggara" }, lat: -10.1781, lng: 123.5975, blurb: { id: "Pulau Komodo, tenun ikat, dan tanah Sumba.", en: "Komodo Island, ikat weaving, and the land of Sumba." } },
  { slug: "maluku", name: { id: "Maluku", en: "Maluku" }, lat: -3.6954, lng: 128.1814, blurb: { id: "Pala Banda, cengkeh, dan laut Seram.", en: "Banda nutmeg, cloves, and the Seram Sea." } },
  { slug: "papua", name: { id: "Papua", en: "Papua" }, lat: -2.5916, lng: 140.669, blurb: { id: "Bakar batu, noken, dan Raja Ampat.", en: "Stone-burning feasts, noken bags, and Raja Ampat." } },
  // 22 provinsi tambahan — peta lengkap 34 provinsi
  { slug: "sumatera-utara", name: { id: "Sumatera Utara", en: "North Sumatra" }, lat: 3.5952, lng: 98.6722, blurb: { id: "Ulós Batak, rumah bolon, dan Danau Toba.", en: "Batak ulós cloth, bolon houses, and Lake Toba." } },
  { slug: "sumatera-selatan", name: { id: "Sumatera Selatan", en: "South Sumatra" }, lat: -2.9761, lng: 104.7754, blurb: { id: "Songket Palembang, rumah limas, dan Sungai Musi.", en: "Palembang songket, limas houses, and the Musi River." } },
  { slug: "riau", name: { id: "Riau", en: "Riau" }, lat: 0.5071, lng: 101.4478, blurb: { id: "Budaya Melayu, zapin, dan istana Siak.", en: "Malay heritage, zapin dance, and Siak palace." } },
  { slug: "kepulauan-riau", name: { id: "Kepulauan Riau", en: "Riau Islands" }, lat: 0.9211, lng: 104.4555, blurb: { id: "Melayu bahari, tari lenggang, dan peninggalan Kerajaan Bintan.", en: "Maritime Malay culture, lenggang dance, and Bintan kingdom heritage." } },
  { slug: "jambi", name: { id: "Jambi", en: "Jambi" }, lat: -1.6101, lng: 103.6131, blurb: { id: "Batik Jambi, selampit delapan, dan Candi Muaro.", en: "Jambi batik, selampit delapan dance, and Muaro temple." } },
  { slug: "bengkulu", name: { id: "Bengkulu", en: "Bengkulu" }, lat: -3.8004, lng: 102.2655, blurb: { id: "Kain besurek, bubungan lima, dan Rafflesia.", en: "Besurek cloth, bubungan lima roofs, and Rafflesia." } },
  { slug: "lampung", name: { id: "Lampung", en: "Lampung" }, lat: -5.4292, lng: 105.2611, blurb: { id: "Kain tapis, sigeh pengunten, dan mahkota siger.", en: "Tapis cloth, sigeh pengunten dance, and siger crowns." } },
  { slug: "bangka-belitung", name: { id: "Bangka Belitung", en: "Bangka Belitung" }, lat: -2.1291, lng: 106.6583, blurb: { id: "Lada Muntok, rumah rakit, dan pantai granit.", en: "Muntok pepper, stilt houses, and granite beaches." } },
  { slug: "banten", name: { id: "Banten", en: "Banten" }, lat: -6.1203, lng: 106.1504, blurb: { id: "Debus, badak heulang, dan kerajinan gerabah.", en: "Debus art, badak heulang houses, and pottery." } },
  { slug: "jawa-timur", name: { id: "Jawa Timur", en: "East Java" }, lat: -7.2575, lng: 112.7521, blurb: { id: "Reog Ponorogo, karapan sapi, dan ludruk.", en: "Reog Ponorogo, bull racing, and ludruk theatre." } },
  { slug: "kalimantan-selatan", name: { id: "Kalimantan Selatan", en: "South Kalimantan" }, lat: -3.3186, lng: 114.5944, blurb: { id: "Bubungan tinggi, baksa kembang, dan intan Martapura.", en: "Bubungan tinggi houses, baksa kembang dance, and Martapura diamonds." } },
  { slug: "kalimantan-tengah", name: { id: "Kalimantan Tengah", en: "Central Kalimantan" }, lat: -2.209, lng: 113.917, blurb: { id: "Dayak Ngaju, ritus Tiwah, dan sungai Kahayan.", en: "Ngaju Dayak, Tiwah rituals, and the Kahayan river." } },
  { slug: "kalimantan-timur", name: { id: "Kalimantan Timur", en: "East Kalimantan" }, lat: -0.5021, lng: 117.1536, blurb: { id: "Rumah lamin, ulap doyo, dan tari Gong Kenyah.", en: "Lamin longhouses, ulap doyo cloth, and Kenyah gong dance." } },
  { slug: "kalimantan-utara", name: { id: "Kalimantan Utara", en: "North Kalimantan" }, lat: 3.5742, lng: 116.6143, blurb: { id: "Lundayeh, rumah panjang perbatasan, dan anyaman.", en: "Lundayeh heritage, border longhouses, and basketry." } },
  { slug: "sulawesi-utara", name: { id: "Sulawesi Utara", en: "North Sulawesi" }, lat: 1.4748, lng: 124.8421, blurb: { id: "Kolintang, kabasaran, dan budaya Minahasa.", en: "Kolintang music, kabasaran dance, and Minahasa heritage." } },
  { slug: "sulawesi-tengah", name: { id: "Sulawesi Tengah", en: "Central Sulawesi" }, lat: -0.9986, lng: 119.8934, blurb: { id: "Seni lude, rumah tambi, dan teluk Palu.", en: "Lude performing art, tambi houses, and Palu bay." } },
  { slug: "sulawesi-barat", name: { id: "Sulawesi Barat", en: "West Sulawesi" }, lat: -2.8436, lng: 119.2325, blurb: { id: "Sandeq Mandar, passandeq, dan layar terpal.", en: "Mandar sandeq sailboats, passandeq dance, and sails." } },
  { slug: "sulawesi-tenggara", name: { id: "Sulawesi Tenggara", en: "Southeast Sulawesi" }, lat: -3.9858, lng: 122.5124, blurb: { id: "Benteng keraton Buton dan tenun sarung transversal.", en: "Buton keraton fortress and transversal sarong weaving." } },
  { slug: "gorontalo", name: { id: "Gorontalo", en: "Gorontalo" }, lat: 0.5402, lng: 123.0589, blurb: { id: "Kerawang Gorontalo dan budaya binti-binti.", en: "Kerawang embroidery and binti-binti heritage." } },
  { slug: "nusa-tenggara-barat", name: { id: "NTB", en: "West Nusa Tenggara" }, lat: -8.6529, lng: 117.3592, blurb: { id: "Sasak Lombok, songket Sukarara, dan bale lumbung.", en: "Sasak Lombok, Sukarara songket, and bale lumbung barns." } },
  { slug: "maluku-utara", name: { id: "Maluku Utara", en: "North Maluku" }, lat: 0.7914, lng: 127.7507, blurb: { id: "Kesultanan Ternate-Tidore dan pulau rempah.", en: "Ternate-Tidore sultanates and the spice islands." } },
  { slug: "papua-barat", name: { id: "Papua Barat", en: "West Papua" }, lat: -1.3566, lng: 132.5372, blurb: { id: "Rumah kari, noken Arfak, dan laut Cenderawasih.", en: "Kari houses, Arfak noken, and Cenderawasih bay." } },
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
