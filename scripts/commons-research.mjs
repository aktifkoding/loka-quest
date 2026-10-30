/**
 * Riset foto Wikimedia Commons — kumpulkan kandidat berlisensi bebas
 * untuk setiap slot gambar wilayah/konten Nusantara.
 *
 * Output: scripts/commons-candidates.json (kandidat terurut, lisensi
 * diverifikasi dari extmetadata — PD/CC0/CC BY/CC BY-SA saja).
 *
 * Jalankan: node scripts/commons-research.mjs
 */

const API = "https://commons.wikimedia.org/w/api.php";
const UA = "LokaQuest-education-project/1.0 (school competition; contacting via GitHub eka0789)";

// Slot gambar: kunci = "wilayah:tujuan", value = query pencarian Commons.
const SLOTS = {
  "aceh:kopi-gayo": "Gayo coffee",
  "sumatera-barat:hero": "Rumah Gadang Minangkabau traditional house",
  "sumatera-barat:rendang": "Rendang dish",
  "sumatera-barat:rumah-gadang": "Pagaruyung palace Minangkabau",
  "sumatera-barat:tari-piring": "Tari Piring Minangkabau plate dance",
  "jakarta:hero": "Ondel-ondel Betawi Jakarta",
  "jakarta:ondel-ondel": "Ondel-ondel puppet Betawi",
  "jakarta:lenong": "Topeng Betawi",
  "jakarta:kerak-telor": "Kerak telor dish Jakarta",
  "kalimantan:hero": "Rumah Betang Kalimantan",
  "kalimantan:rumah-panjang": "longhouse Borneo",
  "kalimantan:hudoq": "Hudoq mask Dayak",
  "kalimantan:mandau": "sape Dayak",
  "sulawesi-selatan:hero": "Tongkonan Kete Kesu Toraja",
  "sulawesi-selatan:tongkonan": "Tongkonan",
  "sulawesi-selatan:tau-tau": "tau tau Toraja",
  "sulawesi-selatan:pinisi": "Pinisi",
  "bali:hero": "Jatiluwih rice terraces Bali",
  "bali:subak": "Pura Ulun Danu Bratan",
  "bali:barong": "Barong dance Bali",
  "bali:nyepi": "Nyepi Bali Ogoh-ogoh parade",
  "nusa-tenggara-timur:hero": "Wae Rebo village Mbaru Niang Flores",
  "nusa-tenggara-timur:tenun-ikai": "Sumba ikat textile hinggi",
  "nusa-tenggara-timur:pasola": "Pasola",
  "nusa-tenggara-timur:mbaru-niang": "Mbaru Niang Wae Rebo house",
  "maluku:hero": "Banda Neira islands Maluku",
  "maluku:hero2": "Gunung Api Banda Neira volcano",
  "maluku:cengkih-pala": "Myristica fragrans nutmeg fruit",
  "maluku:cakalele": "Cakalele dance Maluku",
  "maluku:benteng": "Fort Belgica Banda Neira",
  "papua:hero": "Baliem valley Papua highlands",
  "papua:ukir-asmat": "Asmat carving",
  "papua:honai": "Honai",
  "papua:festival-baliem": "Baliem Valley festival Papua ceremony",
};

const OK_LICENSE = /^(public domain|cc0|cc by\b|cc by-sa)/i;

function stripHtml(html) {
  return String(html ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** GET dengan retry backoff — Commons membatasi laju permintaan (HTTP 429). */
async function fetchJson(url, attempts = 4) {
  for (let i = 0; i < attempts; i++) {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (res.status === 429 || res.status >= 500) {
      const wait = 8000 * (i + 1);
      console.warn(`  (HTTP ${res.status}, tunggu ${wait / 1000}s, percobaan ${i + 1})`);
      await sleep(wait);
      continue;
    }
    if (!res.ok) throw new Error(`Commons ${res.status}`);
    return res.json();
  }
  throw new Error("Commons tetap 429 setelah retry");
}

async function searchSlot(query) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "6",
    gsrlimit: "10",
    prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata",
    iiurlwidth: "1600",
  });
  const json = await fetchJson(`${API}?${params}`);
  const pages = json?.query?.pages ?? [];

  return pages
    .filter((p) => p?.imageinfo?.[0]?.mime?.startsWith("image/"))
    .filter((p) => (p?.imageinfo?.[0]?.width ?? 0) >= 1000)
    .map((p) => {
      const info = p.imageinfo[0];
      const meta = info.extmetadata ?? {};
      const license = stripHtml(meta.LicenseShortName?.value);
      return {
        file: p.title,
        license,
        artist: stripHtml(meta.Artist?.value) || "Tanpa nama",
        creditUrl: info.descriptionurl,
        thumb: info.thumburl,
        width: info.width,
        height: info.height,
        landscape: info.width > info.height,
      };
    })
    .filter((c) => OK_LICENSE.test(c.license))
    .sort((a, b) => Number(b.landscape) - Number(a.landscape) || b.width - a.width)
    .slice(0, 4);
}

async function main() {
  const fs = await import("node:fs");
  const outFile = new URL("./commons-candidates.json", import.meta.url);
  // Resume: slot yang sudah punya kandidat tidak dicari ulang.
  const out = fs.existsSync(outFile)
    ? JSON.parse(fs.readFileSync(outFile, "utf8"))
    : {};

  for (const [slot, query] of Object.entries(SLOTS)) {
    if (out[slot]?.length > 0) {
      console.log(`↷ ${slot}: sudah ada, lewati`);
      continue;
    }
    try {
      out[slot] = await searchSlot(query);
      console.log(`✓ ${slot}: ${out[slot].length} kandidat`);
    } catch (err) {
      console.error(`✗ ${slot}: ${err.message}`);
      out[slot] = [];
    }
    fs.writeFileSync(outFile, JSON.stringify(out, null, 2));
    await sleep(1600);
  }
  console.log("\nSelesai → scripts/commons-candidates.json");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
