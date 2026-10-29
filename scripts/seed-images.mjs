// Seed gambar budaya (foto Wikimedia berlisensi bebas) — idempoten.
// Jalankan: npm run db:seed:images  (node --env-file=.env.local)

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SECRET_KEY;
if (!URL_ || !KEY) { console.error("Env Supabase belum diisi."); process.exit(1); }

async function api(path, method = "GET", body) {
  const res = await fetch(`${URL_}/rest/v1/${path}`, {
    method,
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json",
               Prefer: "return=representation" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`${path}: ${res.status} ${JSON.stringify(json)}`);
  return json;
}

const PHOTO_SOURCES = [
  {
    "title": "Foto: Perajin membatik dengan canting, Trusmi Cirebon",
    "author": "Ahaetulla",
    "publisher": "Wikimedia Commons",
    "url": "https://commons.wikimedia.org/wiki/File:Batik_Artisan_Applying_Wax_with_Canting_in_Trusmi_Cirebon_Indonesia.jpg",
    "license": "CC BY-SA 4.0",
    "attribution": "Foto oleh Ahaetulla, CC BY-SA 4.0, via Wikimedia Commons."
  },
  {
    "title": "Foto: Kain batik motif Parang Rusak Putri (koleksi museum, pra-1891)",
    "author": "Tanpa nama (koleksi museum)",
    "publisher": "Wikimedia Commons",
    "url": "https://commons.wikimedia.org/wiki/File:Collectie_NMvWereldculturen,_RV-847-117,_Batikpatroon,_'Parang_rusak_putri',_voor_1891.jpg",
    "license": "Public Domain",
    "attribution": "Foto oleh Tanpa nama (koleksi museum), Public Domain, via Wikimedia Commons."
  },
  {
    "title": "Foto: Kain motif Kawung",
    "author": "Gunarta",
    "publisher": "Wikimedia Commons",
    "url": "https://commons.wikimedia.org/wiki/File:Batik_Kawung_Cushion.jpg",
    "license": "CC BY-SA 4.0",
    "attribution": "Foto oleh Gunarta, CC BY-SA 4.0, via Wikimedia Commons."
  },
  {
    "title": "Foto: Sepasang set gamelan",
    "author": "Enfo",
    "publisher": "Wikimedia Commons",
    "url": "https://commons.wikimedia.org/wiki/File:165_Museu_de_la_M%C3%BAsica,_gamelan.jpg",
    "license": "CC BY-SA 3.0",
    "attribution": "Foto oleh Enfo, CC BY-SA 3.0, via Wikimedia Commons."
  },
  {
    "title": "Foto: Demung dan saron, STSI Surakarta",
    "author": "Giovanni Sciarrino",
    "publisher": "Wikimedia Commons",
    "url": "https://commons.wikimedia.org/wiki/File:Demung_Saron_Peking,_STSI_Surakarta.jpg",
    "license": "CC BY 2.5",
    "attribution": "Foto oleh Giovanni Sciarrino, CC BY 2.5, via Wikimedia Commons."
  },
  {
    "title": "Foto: Gong ageng",
    "author": "Dewinta88",
    "publisher": "Wikimedia Commons",
    "url": "https://commons.wikimedia.org/wiki/File:Gong_Ageng.jpg",
    "license": "CC BY-SA 4.0",
    "attribution": "Foto oleh Dewinta88, CC BY-SA 4.0, via Wikimedia Commons."
  },
  {
    "title": "Foto: Bonang",
    "author": "Malibugalz",
    "publisher": "Wikimedia Commons",
    "url": "https://commons.wikimedia.org/wiki/File:Bonang_-_Museum_Musik_Dunia.jpg",
    "license": "CC BY 4.0",
    "attribution": "Foto oleh Malibugalz, CC BY 4.0, via Wikimedia Commons."
  },
  {
    "title": "Foto: Pertunjukan wayang kulit",
    "author": "Rebecca Marshall",
    "publisher": "Wikimedia Commons",
    "url": "https://commons.wikimedia.org/wiki/File:Bali_Wayang_Kulit_shadow_puppet_Ramayana_Hanoman_dramatic_show.jpg",
    "license": "CC BY-SA 2.0",
    "attribution": "Foto oleh Rebecca Marshall, CC BY-SA 2.0, via Wikimedia Commons."
  },
  {
    "title": "Foto: Tokoh wayang kulit Semar",
    "author": "Badan Pengembangan Kebudayaan dan Pariwisata",
    "publisher": "Wikimedia Commons",
    "url": "https://commons.wikimedia.org/wiki/File:Sanghyang_Ismaya_atau_Semar,_Album_wayang_kulit_banjar_p22.jpg",
    "license": "Public Domain",
    "attribution": "Foto oleh Badan Pengembangan Kebudayaan dan Pariwisata, Public Domain, via Wikimedia Commons."
  }
];

const REGION_IMAGES = {
  "jawa-tengah": {
    "imageUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/62/Batik_Artisan_Applying_Wax_with_Canting_in_Trusmi_Cirebon_Indonesia.jpg/1280px-Batik_Artisan_Applying_Wax_with_Canting_in_Trusmi_Cirebon_Indonesia.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceTitle": "Foto: Perajin membatik dengan canting, Trusmi Cirebon"
  },
  "jawa-barat": {
    "imageUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8b/165_Museu_de_la_M%C3%BAsica%2C_gamelan.jpg/1280px-165_Museu_de_la_M%C3%BAsica%2C_gamelan.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceTitle": "Foto: Sepasang set gamelan"
  },
  "yogyakarta": {
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/e/e6/Bali_Wayang_Kulit_shadow_puppet_Ramayana_Hanoman_dramatic_show.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    "sourceTitle": "Foto: Pertunjukan wayang kulit"
  }
};

const CONTENT_IMAGES = {
  "Degung: Musik untuk Menyambut Tamu": {
    "mediaUrl": "https://upload.wikimedia.org/wikipedia/commons/4/49/Bonang_-_Museum_Musik_Dunia.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    "sourceTitle": "Foto: Bonang"
  },
  "Kulit Sapi yang Menjadi Karya Agung": {
    "mediaUrl": "https://upload.wikimedia.org/wikipedia/commons/e/e6/Bali_Wayang_Kulit_shadow_puppet_Ramayana_Hanoman_dramatic_show.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    "sourceTitle": "Foto: Pertunjukan wayang kulit"
  },
  "Filosofi Parang Rusak": {
    "mediaUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c4/Collectie_NMvWereldculturen%2C_RV-847-117%2C_Batikpatroon%2C_%27Parang_rusak_putri%27%2C_voor_1891.jpg/1280px-Collectie_NMvWereldculturen%2C_RV-847-117%2C_Batikpatroon%2C_%27Parang_rusak_putri%27%2C_voor_1891.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceTitle": "Foto: Kain batik motif Parang Rusak Putri (koleksi museum, pra-1891)"
  },
  "Kawung: Kesederhanaan yang Dihormati": {
    "mediaUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/74/Batik_Kawung_Cushion.jpg/1280px-Batik_Kawung_Cushion.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceTitle": "Foto: Kain motif Kawung"
  },
  "Gamelan: Satu Tubuh, Banyak Suara": {
    "mediaUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d0/Demung_Saron_Peking%2C_STSI_Surakarta.jpg/1280px-Demung_Saron_Peking%2C_STSI_Surakarta.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceTitle": "Foto: Demung dan saron, STSI Surakarta"
  },
  "Punakawan: Para Penasihat di Balik Kelakar": {
    "mediaUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dd/Sanghyang_Ismaya_atau_Semar%2C_Album_wayang_kulit_banjar_p22.jpg/1280px-Sanghyang_Ismaya_atau_Semar%2C_Album_wayang_kulit_banjar_p22.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceTitle": "Foto: Tokoh wayang kulit Semar"
  }
};

const existing = await api("cultural_sources?select=id,title");
const byTitle = new Map(existing.map((s) => [s.title, s.id]));

async function ensurePhoto(title) {
  if (byTitle.has(title)) return byTitle.get(title);
  const row = await api("cultural_sources", "POST",
    PHOTO_SOURCES.find((p) => p.title === title));
  byTitle.set(title, row[0].id);
  console.log("+ sumber foto:", title);
  return row[0].id;
}

for (const [slug, img] of Object.entries(REGION_IMAGES)) {
  const [r] = await api(`cultural_regions?slug=eq.${slug}&select=id,image_url`);
  if (r && r.image_url === img.imageUrl) continue;
  const sid = await ensurePhoto(img.sourceTitle);
  await api(`cultural_regions?id=eq.${r.id}`, "PATCH",
    { image_url: img.imageUrl, image_source_id: sid });
  console.log("region bergambar:", slug);
}

const contents = await api("cultural_contents?select=id,title,media_url");
for (const c of contents) {
  const img = CONTENT_IMAGES[c.title];
  if (!img || c.media_url === img.mediaUrl) continue;
  const sid = await ensurePhoto(img.sourceTitle);
  await api(`cultural_contents?id=eq.${c.id}`, "PATCH",
    { media_url: img.mediaUrl, image_source_id: sid });
  console.log("konten bergambar:", c.title);
}

console.log("Seed gambar selesai — semua kredit fotografer tercatat.");
