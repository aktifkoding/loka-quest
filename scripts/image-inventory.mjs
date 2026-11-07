/** Inventaris semua URL gambar di DB live + uji status HTTP. Jalankan: node --env-file=.env.local scripts/image-inventory.mjs */
import process from "node:process";

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://krsdymqxywddgreqflrx.supabase.co";
const KEY = process.env.SUPABASE_SECRET_KEY;
if (!KEY) { console.error("SUPABASE_SECRET_KEY tidak ada"); process.exit(1); }
const rest = URL_ + "/rest/v1";
const api = async (table, query) => {
  const res = await fetch(`${rest}/${table}?${query}`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  if (!res.ok) throw new Error(`${table}: ${res.status} ${await res.text()}`);
  return res.json();
};
const check = async (url) => {
  try {
    const res = await fetch(url, { method: "GET", headers: { "User-Agent": "Mozilla/5.0 (LokaQuest-inventory)" }, redirect: "follow" });
    return res.status;
  } catch { return "ERR"; }
};

const [regions, contents, articles, encRegions] = await Promise.all([
  api("cultural_regions", "select=slug,name,image_url&order=slug"),
  api("cultural_contents", "select=id,title,region_id,media_type,media_url&limit=200"),
  api("encyclopedia_articles", "select=slug,title,featured_image_url&limit=200"),
]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const urls = new Set();
for (const r of regions) if (r.image_url) urls.add(r.image_url);
for (const c of contents) if (c.media_url) urls.add(c.media_url);
for (const a of articles) if (a.featured_image_url) urls.add(a.featured_image_url);


const status = {};
for (const u of [...urls]) { status[u] = await check(u); await sleep(1200); }

console.log("=== CULTURAL_REGIONS ===");
for (const r of regions) console.log(`${r.image_url ? (status[r.image_url] ?? "?") : "KOSONG"}  ${r.slug}`);
console.log("=== CULTURAL_CONTENTS (image) ===");
for (const c of contents) if (c.media_url) console.log(`${c.media_url ? (status[c.media_url] ?? "?") : "KOSONG"}  ${c.region_id ?? "-"} :: ${c.title}`);
console.log("=== ENCYCLOPEDIA_ARTICLES ===");
for (const a of articles) console.log(`${a.featured_image_url ? (status[a.featured_image_url] ?? "?") : "KOSONG"}  ${a.slug}`);


console.log(`\nTotal unik URL: ${urls.size}`);
