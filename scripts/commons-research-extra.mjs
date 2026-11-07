/**
 * Riset foto Wikimedia Commons untuk slot tambahan (artikel ensiklopedia).
 * Meniru commons-research.mjs: hanya PD/CC0/CC BY/CC BY-SA, thumbnail
 * diverifikasi HTTP 200 sebelum disimpan.
 *
 * Jalankan: node scripts/commons-research-extra.mjs
 * Output: scripts/commons-candidates-extra.json
 */
import fs from "node:fs";

const API = "https://commons.wikimedia.org/w/api.php";
const UA = "LokaQuest-education-project/1.0 (school competition; contacting via GitHub eka0789)";

const SLOTS = {
  "artikel:tari-kecak": "Kecak dance Uluwatu",
  "artikel:batik-indonesia": "batik cantik tulis Indonesia cloth",
  "artikel:gamelan-jawa": "Javanese gamelan orchestra instruments",
  "artikel:wayang-kulit": "wayang kulit shadow puppet performance dalang",
  "artikel:randai": "Minangkabau traditional dance",
  "artikel:noken": "noken Papua bag",
  "artikel:pencak-silat": "pencak silat performance Indonesia",
  "artikel:angklung": "angklung performance Saung Angklung",
  "artikel:keris": "keris pusaka",
  "artikel:jamu": "jamu gendong",
  "artikel:pantun": "manuskrip Melayu",
};

const OK_LICENSE = /^(public domain|cc0|cc by\b|cc by-sa)/i;
const stripHtml = (h) => String(h ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJson(url, attempts = 4) {
  for (let i = 0; i < attempts; i++) {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (res.status === 429 || res.status >= 500) {
      await sleep(8000 * (i + 1));
      continue;
    }
    if (!res.ok) throw new Error(`Commons ${res.status}`);
    return res.json();
  }
  throw new Error("Commons tetap 429");
}

async function searchSlot(query) {
  const params = new URLSearchParams({
    action: "query", format: "json", formatversion: "2",
    generator: "search", gsrsearch: query, gsrnamespace: "6", gsrlimit: "8",
    prop: "imageinfo", iiprop: "url|size|mime|extmetadata", iiurlwidth: "1600",
  });
  const json = await fetchJson(`${API}?${params}`);
  const pages = json?.query?.pages ?? [];
  const out = [];
  for (const page of pages) {
    const info = page.imageinfo?.[0];
    if (!info || info.mime !== "image/jpeg") continue;
    const meta = info.extmetadata ?? {};
    const license = stripHtml(meta.LicenseShortName?.value ?? "");
    if (!OK_LICENSE.test(license)) continue;
    if ((info.width ?? 0) < 900 || (info.height ?? 0) < 600) continue;
    out.push({
      file: page.title,
      license,
      artist: stripHtml(meta.Artist?.value ?? "").slice(0, 120),
      creditUrl: info.descriptionurl,
      thumb: info.thumburl,
      width: info.width,
      height: info.height,
    });
  }
  return out;
}

const result = JSON.parse(fs.readFileSync("scripts/commons-candidates-extra.json","utf8"));
for (const k of Object.keys(SLOTS)) { if ((result[k] ?? []).length) { console.log(k + " (sudah ada, lewati)"); delete SLOTS[k]; } }
for (const [slot, query] of Object.entries(SLOTS)) {
  process.stdout.write(`${slot} (${query}) ... `);
  let verified = [];
  try {
    const candidates = await searchSlot(query);
    for (const c of candidates) {
      const res = await fetch(c.thumb, { method: "GET", headers: { "User-Agent": UA } });
      await sleep(800);
      if (res.ok) { verified.push(c); }
      if (verified.length >= 3) break;
    }
  } catch (e) {
    console.log(`GAGAL: ${e.message}`);
    continue;
  }
  result[slot] = verified;
  console.log(`${verified.length} kandidat terverifikasi`);
}

fs.writeFileSync("scripts/commons-candidates-extra.json", JSON.stringify(result, null, 2));
console.log(`\nSelesai -> scripts/commons-candidates-extra.json`);
