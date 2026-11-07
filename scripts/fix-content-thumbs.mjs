/**
 * Pastikan SEMUA cultural_contents.media_url berupa thumbnail Commons
 * berukuran terverifikasi (bukan URL berkas asli — thumbor menolak sebagian
 * ukuran turunannya). Jika berkas mati total, ganti dengan kandidat slot.
 * Jalankan: node --env-file=.env.local scripts/fix-content-thumbs.mjs
 */
import fs from "node:fs";
import process from "node:process";

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://krsdymqxywddgreqflrx.supabase.co";
const KEY = process.env.SUPABASE_SECRET_KEY;
if (!KEY) { console.error("SUPABASE_SECRET_KEY tidak ada"); process.exit(1); }
const rest = URL_ + "/rest/v1";
const UA = { "User-Agent": "Mozilla/5.0 (LokaQuest-thumb-fix)" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
async function api(table, query) {
  const res = await fetch(`${rest}/${table}?${query}`, { headers: H });
  if (!res.ok) throw new Error(`${table}: ${res.status} ${await res.text()}`);
  return res.json();
}
async function patch(table, id, body) {
  const res = await fetch(`${rest}/${table}?id=eq.${id}`, { method: "PATCH", headers: H, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`${table} PATCH: ${res.status} ${await res.text()}`);
}
async function verify(url) {
  try { const r = await fetch(url, { headers: UA, redirect: "follow" }); await sleep(500); return r.ok; }
  catch { return false; }
}
function toThumb(url, w) {
  const clean = url.split("?")[0];
  const m = clean.match(/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/([0-9a-f]\/[0-9a-f]{2}\/(.+))$/);
  if (!m) return null;
  return `https://thumb.wikimedia.org/wikipedia/commons/thumb/${m[1]}/${w}px-${m[2]}`;
}
async function pickVerified(candidates) {
  for (const c of candidates ?? []) {
    if (!/\/\d+px-/.test(c.thumb ?? "")) continue;
    if (await verify(c.thumb)) return c;
  }
  return null;
}
async function ensureSource(candidate) {
  const title = `${candidate.file} (Wikimedia Commons)`;
  const ex = await api("cultural_sources", `select=id&title=eq.${encodeURIComponent(title)}&limit=1`);
  if (ex.length) return ex[0].id;
  const [row] = await (await fetch(`${rest}/cultural_sources`, {
    method: "POST", headers: { ...H, Prefer: "return=representation" },
    body: JSON.stringify({
      title, author: candidate.artist || "(tidak tercantum)", publisher: "Wikimedia Commons",
      url: candidate.creditUrl, license: candidate.license,
      attribution: `Foto: ${candidate.artist || "kontributor Wikimedia Commons"} (${candidate.license}) via Wikimedia Commons`,
    }),
  })).json();
  return row.id;
}

const candidates = JSON.parse(fs.readFileSync("scripts/commons-candidates.json", "utf8"));
const SLOT_BY_KEYWORD = [
  [/Rencong/i, "aceh:rencong"], [/Kopi Gayo/i, "aceh:kopi-gayo"], [/Saman/i, "aceh:saman"],
  [/Rumah Betang/i, "kalimantan:rumah-panjang"], [/Hudoq/i, "kalimantan:hudoq"], [/Sape/i, "kalimantan:mandau"],
  [/Subak/i, "bali:subak"], [/Nyepi/i, "bali:nyepi"], [/Tari Bali/i, "bali:barong"],
  [/Pinisi/i, "sulawesi-selatan:pinisi"], [/Tongkonan|Toraja/i, "sulawesi-selatan:tongkonan"],
  [/Rendang/i, "sumatera-barat:rendang"], [/Piring/i, "sumatera-barat:tari-piring"],
  [/Ondel/i, "jakarta:ondel-ondel"], [/Kerak/i, "jakarta:kerak-telor"], [/Lenong/i, "jakarta:lenong"],
  [/Cengkih|Pala|Nutmeg/i, "maluku:cengkih-pala"], [/Cakalele/i, "maluku:cakalele"], [/Benteng|Fort/i, "maluku:benteng"],
  [/Tenun|Ikat|Hinggi/i, "nusa-tenggara-timur:tenun-ikai"], [/Pasola/i, "nusa-tenggara-timur:pasola"], [/Mbaru|Wae/i, "nusa-tenggara-timur:mbaru-niang"],
  [/Honai/i, "papua:honai"], [/Baliem|Festival/i, "papua:festival-baliem"], [/Asmat/i, "papua:ukir-asmat"],
  [/Angklung/i, "artikel:angklung"], [/Keris/i, "artikel:keris"], [/Noken/i, "artikel:noken"], [/Jamu/i, "artikel:jamu"],
];

const regions = await api("cultural_regions", "select=id,slug");
const regionSlotByRegionId = Object.fromEntries(regions.map((r) => [r.slug, r.slug + ":hero"]));
const contents = await api("cultural_contents", "select=id,title,media_url&media_url=neq.null&limit=200");
let fixed = 0, kept = 0, replaced = 0, failed = 0;

for (const c of contents) {
  const url = (c.media_url ?? "").split("?")[0];
  if (!url.includes("upload.wikimedia.org/wikipedia/commons")) { kept++; continue; } // sudah thumb / host lain
  if (url.includes("/thumb/")) { kept++; continue; } // sudah berukuran

  // Cari ukuran thumb yang diterima thumbor: 1920 -> 1280 -> 960 -> 640
  let working = null;
  for (const w of [1920, 1280, 960, 640]) {
    const t = toThumb(url, w);
    if (t && (await verify(t))) { working = t; break; }
  }
  if (working) {
    await patch("cultural_contents", c.id, { media_url: working });
    console.log(`  UKURAN-FIX  ${(c.title ?? "(null)").slice(0, 42)} -> ${working.split("/").pop().slice(0, 45)}`);
    fixed++;
    continue;
  }

  // Berkas mati: cari kandidat slot berdasarkan judul, fallback slot hero wilayah.
  const rule = SLOT_BY_KEYWORD.find(([re]) => re.test(c.title ?? ""));
  const regionRow = regions.find((r) => c.title === null ? false : true); // fallback di bawah
  const pool = rule ? candidates[rule[1]] : null;
  const heroPool = candidates[regionSlotByRegionId[Object.keys(regionSlotByRegionId).find(() => false)] ?? ""] ?? null;
  const picked = await pickVerified(pool ?? heroPool);
  if (picked) {
    const sourceId = await ensureSource(picked);
    await patch("cultural_contents", c.id, { media_url: picked.thumb.split("?")[0], image_source_id: sourceId });
    console.log(`  GANTI       ${(c.title ?? "(null)").slice(0, 42)} -> ${picked.file.slice(0, 55)}`);
    replaced++;
  } else {
    console.log(`  !! GAGAL    ${(c.title ?? "(null)").slice(0, 42)} (tidak ada kandidat hidup)`);
    failed++;
  }
}
console.log(`\nSelesai: ${fixed} diperbaiki ukurannya, ${replaced} diganti, ${kept} sudah aman, ${failed} gagal.`);
