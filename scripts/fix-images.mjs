/**
 * Perbaikan gambar LokaQuest: ganti URL Wikimedia yang sudah mati (file
 * dihapus di Commons) dengan kandidat berlisensi bebas yang DIVERIFIKASI
 * HTTP 200 saat eksekusi, isi featured image artikel ensiklopedia, dan
 * tautkan kredit ke cultural_sources agar tampil di aplikasi.
 *
 * Idempoten: URL yang masih hidup tidak diganggu; sumber dicocokkan per
 * judul file sebelum insert. Laporan kredit ditulis ke docs/image-credits.md.
 *
 * Jalankan: node --env-file=.env.local scripts/fix-images.mjs
 */
import fs from "node:fs";
import process from "node:process";

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://krsdymqxywddgreqflrx.supabase.co";
const KEY = process.env.SUPABASE_SECRET_KEY;
if (!KEY) { console.error("SUPABASE_SECRET_KEY tidak ada"); process.exit(1); }
const rest = URL_ + "/rest/v1";
const UA = { "User-Agent": "Mozilla/5.0 (LokaQuest-image-fix)" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(table, { method = "GET", body, query = "", prefer = "return=representation" } = {}) {
  const qs = query ? (query.startsWith("?") ? query : `?${query}`) : "";
  const res = await fetch(`${rest}/${table}${qs}`, {
    method,
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", Prefer: prefer },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`${table} ${method}: ${res.status} ${JSON.stringify(json).slice(0, 200)}`);
  return json;
}

async function verify(url) {
  try {
    const res = await fetch(url, { headers: UA, redirect: "follow" });
    await sleep(600);
    return res.ok;
  } catch { return false; }
}

/** Petakan URL asli upload.wikimedia.org -> thumb 1280px (logika wikimedia-loader). */
function toThumb(url, width = 1280) {
  if (url.includes("thumb.wikimedia.org")) return url.split("?")[0];
  const m = url.match(/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/([0-9a-f]\/[0-9a-f]{2}\/(.+))$/);
  if (!m) return null;
  return `https://thumb.wikimedia.org/wikipedia/commons/thumb/${m[1]}/${width}px-${m[2]}`;
}

async function currentAlive(url) {
  if (!url) return false;
  const thumb = toThumb(url);
  if (thumb) return verify(thumb);
  return verify(url.split("?")[0]);
}

async function pickVerified(candidates) {
  for (const c of candidates ?? []) {
    // Tolak thumb "thumbnail_unscaled" (URL berkas asli + utm): thumbor
    // menolak sebagian ukuran turunannya (HTTP 400) sehingga tidak aman
    // dipakai lintas lebar viewport. Hanya thumb berukuran terverifikasi.
    if (!/\/\d+px-/.test(c.thumb ?? "")) continue;
    if (await verify(c.thumb)) return c;
  }
  return null;
}

async function ensureSource(candidate) {
  const title = `${candidate.file} (Wikimedia Commons)`;
  const existing = await api("cultural_sources", { query: `select=id&title=eq.${encodeURIComponent(title)}&limit=1` });
  if (existing.length) return existing[0].id;
  const [row] = await api("cultural_sources", {
    method: "POST",
    body: {
      title,
      author: candidate.artist || "(tidak tercantum)",
      publisher: "Wikimedia Commons",
      url: candidate.creditUrl,
      license: candidate.license,
      attribution: `Foto: ${candidate.artist || "kontributor Wikimedia Commons"} (${candidate.license}) via Wikimedia Commons`,
    },
  });
  return row.id;
}

const candidates = JSON.parse(fs.readFileSync("scripts/commons-candidates.json", "utf8"));
const extra = JSON.parse(fs.readFileSync("scripts/commons-candidates-extra.json", "utf8"));
const credits = [];

const regions = await api("cultural_regions", { query: "select=id,slug,name,image_url&order=slug" });
const byId = Object.fromEntries(regions.map((r) => [r.slug, r]));

// 1) Hero wilayah: ganti hanya bila URL saat ini sudah mati.
const REGION_SLOTS = {
  aceh: "aceh:hero",
  bali: "bali:hero",
  jakarta: "jakarta:hero",
  kalimantan: "kalimantan:hero",
  maluku: "maluku:hero",
  "nusa-tenggara-timur": "nusa-tenggara-timur:hero",
  "sulawesi-selatan": "sulawesi-selatan:hero",
  papua: "papua:hero",
  "sumatera-barat": "sumatera-barat:hero",
};
console.log("== HERO WILAYAH ==");
for (const [slug, slot] of Object.entries(REGION_SLOTS)) {
  const region = byId[slug];
  if (!region) continue;
  if (await currentAlive(region.image_url)) {
    console.log(`  SKIP (masih hidup)  ${slug}`);
    continue;
  }
  const picked = await pickVerified(candidates[slot]);
  if (!picked) { console.log(`  !! tanpa kandidat hidup: ${slug}`); continue; }
  const sourceId = await ensureSource(picked);
  await api("cultural_regions", { method: "PATCH", body: { image_url: picked.thumb, image_source_id: sourceId }, query: `id=eq.${region.id}` });
  credits.push(["region", slug, region.image_url, picked]);
  console.log(`  GANTI  ${slug} -> ${picked.file.slice(0, 70)}`);
}

// 2) Konten budaya Bali yang fotonya mati (Bratan/Ogoh-ogoh/Barong).
const CONTENT_SLOTS = [
  { match: (t) => t.startsWith("Subak:"), slot: "bali:subak" },
  { match: (t) => t.startsWith("Nyepi:"), slot: "bali:nyepi" },
  { match: (t) => t.startsWith("Tari Bali:"), slot: "bali:barong" },
];
console.log("== KONTEN BUDAYA ==");
const bali = byId["bali"];
if (bali) {
  const contents = await api("cultural_contents", { query: `select=id,title,media_url&region_id=eq.${bali.id}&media_url=neq.null` });
  for (const content of contents) {
    const rule = CONTENT_SLOTS.find((r) => r.match(content.title ?? ""));
    if (!rule) continue;
    if (await currentAlive(content.media_url)) {
      console.log(`  SKIP (masih hidup)  ${content.title.slice(0, 40)}`);
      continue;
    }
    const picked = await pickVerified(candidates[rule.slot]);
    if (!picked) { console.log(`  !! tanpa kandidat hidup: ${content.title}`); continue; }
    const sourceId = await ensureSource(picked);
    await api("cultural_contents", { method: "PATCH", body: { media_url: picked.thumb, image_source_id: sourceId }, query: `id=eq.${content.id}` });
    credits.push(["konten", content.title, content.media_url, picked]);
    console.log(`  GANTI  ${content.title.slice(0, 40)} -> ${picked.file.slice(0, 60)}`);
  }
}

// 3) Featured image 18 artikel ensiklopedia. Reuse = URL foto konten yang
//    sudah terverifikasi hidup di DB.
const reuseUrlByTitle = async (like) => {
  const rows = await api("cultural_contents", { query: `select=media_url&title=ilike.*${encodeURIComponent(like)}*&media_url=neq.null&limit=1` });
  return rows[0]?.media_url ?? null;
};
const ARTICLE_SLOTS = {
  "tari-saman": { slot: "aceh:saman" },
  pinisi: { slot: "sulawesi-selatan:pinisi" },
  subak: { slot: "bali:subak" },
  "tenun-ikat": { slot: "nusa-tenggara-timur:tenun-ikai" },
  "ondel-ondel": { slot: "jakarta:ondel-ondel" },
  "rumah-betang": { slot: "kalimantan:rumah-panjang" },
  "sasi-maluku": { slot: "maluku:cengkih-pala" },
  "batik-indonesia": { reuse: "Filosofi Parang Rusak" },
  "gamelan-jawa": { reuse: "Gamelan: Satu Tubuh" },
  "wayang-kulit": { slot: "artikel:wayang-kulit" },
  randai: { slot: "artikel:randai" },
  noken: { slot: "artikel:noken" },
  "pencak-silat": { slot: "artikel:pencak-silat" },
  angklung: { slot: "artikel:angklung" },
  keris: { slot: "artikel:keris" },
  jamu: { slot: "artikel:jamu" },
  "tari-kecak": { slot: "artikel:tari-kecak" },
  pantun: { slot: "artikel:pantun" },
};
console.log("== ARTIKEL ENSIKLOPEDIA ==");
const articles = await api("encyclopedia_articles", { query: "select=id,slug,featured_image_url&status=eq.published&order=slug" });
for (const article of articles) {
  if (article.featured_image_url && (await currentAlive(article.featured_image_url))) {
    console.log(`  SKIP (sudah bergambar)  ${article.slug}`);
    continue;
  }
  const rule = ARTICLE_SLOTS[article.slug];
  if (!rule) { console.log(`  !! tanpa slot: ${article.slug}`); continue; }
  let picked = null;
  if (rule.slot) picked = await pickVerified(candidates[rule.slot] ?? extra[rule.slot]);
  if (!picked && rule.reuse) {
    const url = await reuseUrlByTitle(rule.reuse);
    if (url && (await verify(toThumb(url) ?? url))) picked = { thumb: url.split("?")[0], file: `File:${decodeURIComponent(url).split("/").pop()}`, license: "lihat halaman berkas", artist: "(lihat halaman berkas)", creditUrl: "https://commons.wikimedia.org/wiki/" + encodeURIComponent(decodeURIComponent(url).split("/").pop()).replaceAll("%20", "_") };
  }
  if (!picked) { console.log(`  !! tanpa kandidat hidup: ${article.slug}`); continue; }
  await api("encyclopedia_articles", { method: "PATCH", body: { featured_image_url: picked.thumb }, query: `id=eq.${article.id}` });
  credits.push(["artikel", article.slug, article.featured_image_url, picked]);
  console.log(`  ISI  ${article.slug} -> ${picked.file.slice(0, 65)}`);
}

// 4) Laporan kredit.
const lines = [
  "# Kredit Foto (Wikimedia Commons)",
  "",
  "Semua foto berlisensi bebas (Public Domain / CC0 / CC BY / CC BY-SA).",
  "Diperbarui otomatis oleh `scripts/fix-images.mjs`.",
  "",
  "| Target | Berkas Commons | Lisensi | Penulis | Halaman berkas |",
  "|---|---|---|---|---|",
  ...credits.map(([target, slug, oldUrl, c]) =>
    `| ${target}: ${slug} | ${c.file.replace("File:", "")} | ${c.license} | ${c.artist.replace(/\|/g, "/")} | ${c.creditUrl} |`),
];
fs.writeFileSync("docs/image-credits.md", lines.join("\n") + "\n");
console.log(`\nSelesai. ${credits.length} gambar ditulis, kredit -> docs/image-credits.md`);
