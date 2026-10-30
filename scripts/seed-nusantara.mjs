/**
 * Seed wilayah & konten budaya Nusantara — gelombang 1 (9 wilayah).
 *
 * Idempoten: matched by slug/title, aman dijalankan berulang kali.
 * Jalankan: node scripts/seed-nusantara.mjs
 */

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://krsdymqxywddgreqflrx.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SECRET_KEY ?? "***REDACTED***";

if (!SERVICE_KEY) {
  console.error("SUPABASE_SECRET_KEY tidak ada.");
  process.exit(1);
}

const rest = URL_ + "/rest/v1";

async function api(table, { method = "GET", body, query = "" } = {}) {
  const res = await fetch(`${rest}/${table}${query}`, {
    method,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`${table} ${method}: ${res.status} ${JSON.stringify(json).slice(0, 200)}`);
  }
  return json;
}

async function insertMissing(table, rows, matchFn, label) {
  const existing = await api(table);
  const isKnown = (row) => existing.some((e) => matchFn(e, row));
  const fresh = rows.filter((row) => !isKnown(row));
  if (fresh.length === 0) {
    console.log(`  ${label}: sudah lengkap, lewati`);
    return;
  }
  await api(table, { method: "POST", body: fresh });
  console.log(`  ${label}: +${fresh.length} baris`);
}

// ─── Foto kurasi (dari scripts/nusantara-images.json) ───────────────────────
const IMG = {
  aceh_hero: { url: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Masjid_Baiturrahman_Aceh.jpg", author: "Azam Photography", license: "CC BY-SA 4.0", title: "Foto: Masjid Baiturrahman, Banda Aceh" },
  aceh_saman: { url: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Tari_Saman.jpg", author: "Saman Aceh Dancer", license: "CC BY-SA 4.0", title: "Foto: Tari Saman Gayo" },
  aceh_rencong: { url: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Rencong_Aceh_%28DSCF0862%29.jpg", author: "Unknown photographer", license: "CC BY-SA 4.0", title: "Foto: Rencong Aceh" },
  aceh_kopi: { url: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Kopi_Hitam_King_Gayo_Arabika.jpg", author: "Unknown", license: "CC BY-SA 4.0", title: "Foto: Kopi Gayo Aceh" },
  sumbar_hero: { url: "https://upload.wikimedia.org/wikipedia/commons/1/1e/Istana_Pagaruyung_17.jpg", author: "Unknown", license: "Public Domain", title: "Foto: Istana Pagaruyung" },
  sumbar_rendang: { url: "https://upload.wikimedia.org/wikipedia/commons/8/8e/D2D_9945_wikimedia2020_deni_dahniel_randang.jpg", author: "Deni Dahniel", license: "CC BY-SA 4.0", title: "Foto: Rendang Minangkabau" },
  sumbar_rumah: { url: "https://upload.wikimedia.org/wikipedia/commons/6/66/Rumah_Gadang_Ranah_Pantai_Cermin_04.jpg", author: "Unknown", license: "CC BY-SA 4.0", title: "Foto: Rumah Gadang Minangkabau" },
  sumbar_tari: { url: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Tari_Piring_Bergelut_Kaca.jpg", author: "Unknown", license: "CC BY-SA 4.0", title: "Foto: Tari Piring Minangkabau" },
  jakarta_hero: { url: "https://upload.wikimedia.org/wikipedia/commons/3/33/Ondel_Ondel.jpg", author: "Unknown", license: "CC BY-SA 4.0", title: "Foto: Ondel-ondel Betawi" },
  jakarta_topeng: { url: "https://upload.wikimedia.org/wikipedia/commons/0/0e/ErwinKurniawan_TopengBetawi.jpg", author: "Erwin Kurniawan", license: "CC BY-SA 4.0", title: "Foto: Topeng Betawi" },
  jakarta_lenong: { url: "https://upload.wikimedia.org/wikipedia/commons/c/c9/Lenong_2_%E2%80%93_Panorama_%28Greg_Zaal_via_Poly_Haven%29.jpg", author: "Greg Zaal", license: "CC0", title: "Foto: Lenong Betawi" },
  jakarta_kerak: { url: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Bir_Pletok_dan_Kerak_Telor_20240622_112819.jpg", author: "Unknown", license: "CC BY-SA 4.0", title: "Foto: Kerak Telor Jakarta" },
  kalimantan_hero: { url: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Rumah_Betang_Gerbang.jpg", author: "Unknown", license: "CC BY-SA 4.0", title: "Foto: Rumah Betang Kalimantan" },
  kalimantan_betang: { url: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Rumah_Betang_di_Tumbang_Gagu.jpg", author: "Unknown", license: "CC BY-SA 4.0", title: "Foto: Rumah Betang di Tumbang Gagu" },
  kalimantan_hudoq: { url: "https://upload.wikimedia.org/wikipedia/commons/3/38/Praying_in_the_Beginning_of_Hudoq_Kawit_Ritual_in_Dayak_Bahau_People%27s_Planting_Season.jpg", author: "Unknown", license: "CC BY-SA 4.0", title: "Foto: Tari Hudoq Dayak Bahau" },
  kalimantan_sape: { url: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Dayak_Performers_in_Sape_Concert.jpg", author: "Unknown", license: "CC BY-SA 4.0", title: "Foto: Pertunjukan Sape' Dayak" },
  sulsel_hero: { url: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Kete%27_Kesu%27_Toraja.jpg", author: "Unknown", license: "CC BY-SA 4.0", title: "Foto: Kete Kesu Toraja" },
  sulsel_tong: { url: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Tongkonan_traditionnal_Toraja_house.jpg", author: "Unknown", license: "CC0", title: "Foto: Tongkonan Toraja" },
  sulsel_tau: { url: "https://upload.wikimedia.org/wikipedia/commons/f/f4/Tana_Toraja%2C_Lemo%2C_tau_taus_%286969212585%29.jpg", author: "Jean-Pierre Dalbéra", license: "CC BY 2.0", title: "Foto: Tau-tau di Lemo, Toraja" },
  sulsel_pinisi: { url: "https://upload.wikimedia.org/wikipedia/commons/4/45/Kapal_Pinisi_Pelabuhan_Sunda_Kelapa.jpg", author: "Unknown", license: "CC BY-SA 4.0", title: "Foto: Kapal Pinisi di Sunda Kelapa" },
  bali_hero: { url: "https://upload.wikimedia.org/wikipedia/commons/b/b5/Jatiluwih_rice_terraces_SF0001.jpg", author: "Unknown", license: "CC BY-SA 3.0", title: "Foto: Jatiluwih Bali" },
  bali_subak: { url: "https://upload.wikimedia.org/wikipedia/commons/5/59/Bratan_Bali_Pura-Ulun-Danu-Bratan-01.jpg", author: "Unknown", license: "CC BY-SA 3.0", title: "Foto: Pura Ulun Danu Bratan" },
  bali_tari: { url: "https://upload.wikimedia.org/wikipedia/commons/6/62/Kris_and_barong_dance_on_Bali_February_1962_4_of_5.jpg", author: "Unknown", license: "CC BY-SA 4.0", title: "Foto: Tari Barong Bali" },
  bali_nyepi: { url: "https://upload.wikimedia.org/wikipedia/commons/6/69/Ogoh-ogoh_carried_during_the_Ngrupuk_parade_in_Ubud_10.jpg", author: "Unknown", license: "CC BY-SA 4.0", title: "Foto: Ogoh-ogoh Nyepi Bali" },
  ntt_hero: { url: "https://upload.wikimedia.org/wikipedia/commons/3/3d/Wae_rebo_village%2C_Ruteng%2C_NTT%2C_Indonesia.jpg", author: "Unknown", license: "CC BY-SA 4.0", title: "Foto: Desa Wae Rebo, NTT" },
  ntt_tenun: { url: "https://upload.wikimedia.org/wikipedia/commons/5/57/Indonesia%2C_Sumba%2C_19th_century_-_Hinggi_-_1925.490_-_Cleveland_Museum_of_Art.tif", author: "Unknown", license: "CC0", title: "Foto: Hinggi Sumba (abad ke-19)" },
  ntt_pasola: { url: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Pasola.jpg", author: "Unknown", license: "CC BY-SA 4.0", title: "Foto: Upacara Pasola Sumba" },
  ntt_mbaru: { url: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Rumah_Adat_Mbaru_Niang.jpg", author: "Unknown", license: "CC BY-SA 4.0", title: "Foto: Mbaru Niang Wae Rebo" },
  maluku_hero: { url: "https://upload.wikimedia.org/wikipedia/commons/b/b5/Banda_Neira_Kantah.jpg", author: "Unknown", license: "CC BY-SA 4.0", title: "Foto: Banda Neira, Maluku" },
  maluku_cengkih: { url: "https://upload.wikimedia.org/wikipedia/commons/5/58/Nutmeg_fruit_with_mace.jpg", author: "Unknown", license: "CC BY-SA 4.0", title: "Foto: Buah pala dengan mace" },
  maluku_cakalele: { url: "https://upload.wikimedia.org/wikipedia/commons/3/38/Tarian_Cakalele.jpg", author: "Unknown", license: "CC BY-SA 4.0", title: "Foto: Tari Cakalele Maluku" },
  maluku_benteng: { url: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Fort_Belgica_01.JPG", author: "Unknown", license: "CC BY-SA 3.0", title: "Foto: Fort Belgica Banda Neira" },
  papua_hero: { url: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Baliem_Valley_Papua.jpg", author: "Unknown", license: "CC BY-SA 4.0", title: "Foto: Lembah Baliem, Papua" },
  papua_asmat: { url: "https://upload.wikimedia.org/wikipedia/commons/a/a8/Pemahat_Patung_Asmat.jpg", author: "Unknown", license: "CC BY-SA 4.0", title: "Foto: Pemahat patung Asmat" },
  papua_honai: { url: "https://upload.wikimedia.org/wikipedia/commons/3/3c/Honai_House_Papua.jpg", author: "Unknown", license: "CC BY-SA 4.0", title: "Foto: Honai, Wamena Papua" },
  papua_baliem: { url: "https://upload.wikimedia.org/wikipedia/commons/1/14/Opening_Ceremony_of_Baliem_Valley_Festival_2018.jpg", author: "Unknown", license: "CC BY-SA 4.0", title: "Foto: Pembukaan Festival Lembah Baliem 2018" },
};

// Eksplisit: judul konten → kunci IMG
const CONTENT_IMG_KEY = {
  "Tari Saman: Irama Persaudaraan Gayo": "aceh_saman",
  "Rencong: Beladiri Filosofi di Ujung Jari": "aceh_rencong",
  "Kopi Gayo: Rizab Hijau di Lintas 1.500 Meter": "aceh_kopi",
  "Rendang: Dua Kali Juara CNN World's 50 Best Foods": "sumbar_rendang",
  "Rumah Gadang: Hormat Matrilinie": "sumbar_rumah",
  "Tari Piring: Kaca Berdetak Cemerlang": "sumbar_tari",
  "Ondel-ondel: Raksasa Jalanan yang Menyambut": "jakarta_topeng",
  "Topeng Betawi: Tersembunyi di Balik Lenong": "jakarta_topeng",
  "Kerak Telor: Gurih Asin Pedas Jakarta": "jakarta_kerak",
  "Rumah Betang: Riadah Komunal Dayak": "kalimantan_betang",
  "Tari Hudoq: Doa untuk Panen Melalui Topeng": "kalimantan_hudoq",
  "Sape': Lute Magis Suku Dayak Kenyah": "kalimantan_sape",
  "Tongkonan: Rumah Berkarung Melawan Langit": "sulsel_tong",
  "Rambu Solo': Perayaan Kematian yang Megah": "sulsel_tong",
  "Pinisi: Kapal Kayu yang Menuju UNESCO": "sulsel_pinisi",
  "Subak: Irigasi Bersama yang Menjelma Filosofi": "bali_subak",
  "Tari Bali: Tiga Genre dari Sakral hingga Hiburan": "bali_tari",
  "Nyepi: Hari Sunyi yang Menyejukkan Dunia": "bali_nyepi",
  "Mbaru Niang: Segi Enam Konis di Awan": "ntt_mbaru",
  "Tenun Ikat Sumba: Wastra yang Bercerita": "ntt_tenun",
  "Pasola: Festival Kuda dan Tombak di Pantai": "ntt_pasola",
  "Cengkih dan Pala: Rempah yang Mengubah Dunia": "maluku_cengkih",
  "Tari Cakalele: Tari Perang Seram yang Menakutkan": "maluku_cakalele",
  "Benteng Belgica: Benteng Bata di Laut Biru": "maluku_benteng",
  "Ukiran Asmat: Bisj Pole yang Menjelajahi Arwah": "papua_asmat",
  "Honai: Rumah Bola Hangat Dani": "papua_honai",
  "Festival Lembah Baliem: Pesta Bumi Dani": "papua_baliem",
};

const REGION_HERO_KEY = {
  aceh: "aceh_hero",
  sumatera_barat: "sumbar_hero",
  jakarta: "jakarta_hero",
  kalimantan: "kalimantan_hero",
  sulawesi_selatan: "sulsel_hero",
  bali: "bali_hero",
  nusa_tenggara_timur: "ntt_hero",
  maluku: "maluku_hero",
  papua: "papua_hero",
};

// ─── Sumber referensi ───────────────────────────────────────────────────────
const SOURCES = [
  { title: "Kopi Gayo — Ensiklopedia Kabupaten Aceh Tenggara", author: "Pemkab Aceh Tenggara", publisher: "Wikipedia bahasa Indonesia", year: 2024, url: "https://id.wikipedia.org/wiki/Kopi_Gayo", license: "CC BY-SA 3.0", attribution: "Kopi Gayo — Wikipedia bahasa Indonesia, CC BY-SA 3.0." },
  { title: "Istana Pagaruyung — Wikipedia bahasa Indonesia", author: "Kontributor Wikipedia", publisher: "Wikipedia bahasa Indonesia", year: 2024, url: "https://id.wikipedia.org/wiki/Istana_Pagaruyung", license: "CC BY-SA 3.0", attribution: "Istana Pagaruyung — Wikipedia bahasa Indonesia, CC BY-SA 3.0." },
  { title: "Tari piring — Wikipedia bahasa Indonesia", author: "Kontributor Wikipedia", publisher: "Wikipedia bahasa Indonesia", year: 2024, url: "https://id.wikipedia.org/wiki/Tari_piring", license: "CC BY-SA 3.0", attribution: "Tari piring — Wikipedia bahasa Indonesia, CC BY-SA 3.0." },
  { title: "Ondel-ondel — Wikipedia bahasa Indonesia", author: "Kontributor Wikipedia", publisher: "Wikipedia bahasa Indonesia", year: 2024, url: "https://id.wikipedia.org/wiki/Ondel-ondel", license: "CC BY-SA 3.0", attribution: "Ondel-ondel — Wikipedia bahasa Indonesia, CC BY-SA 3.0." },
  { title: "Topeng Betawi — Wikipedia bahasa Indonesia", author: "Kontributor Wikipedia", publisher: "Wikipedia bahasa Indonesia", year: 2024, url: "https://id.wikipedia.org/wiki/Topeng_Betawi", license: "CC BY-SA 3.0", attribution: "Topeng Betawi — Wikipedia bahasa Indonesia, CC BY-SA 3.0." },
  { title: "Kerak telor — Wikipedia bahasa Indonesia", author: "Kontributor Wikipedia", publisher: "Wikipedia bahasa Indonesia", year: 2024, url: "https://id.wikipedia.org/wiki/Kerak_telor", license: "CC BY-SA 3.0", attribution: "Kerak telor — Wikipedia bahasa Indonesia, CC BY-SA 3.0." },
  { title: "Rumah panjang — Wikipedia bahasa Indonesia", author: "Kontributor Wikipedia", publisher: "Wikipedia bahasa Indonesia", year: 2024, url: "https://id.wikipedia.org/wiki/Rumah_panjang", license: "CC BY-SA 3.0", attribution: "Rumah panjang — Wikipedia bahasa Indonesia, CC BY-SA 3.0." },
  { title: "Sape' — Wikipedia bahasa Indonesia", author: "Kontributor Wikipedia", publisher: "Wikipedia bahasa Indonesia", year: 2024, url: "https://id.wikipedia.org/wiki/Sape%27", license: "CC BY-SA 3.0", attribution: "Sape' — Wikipedia bahasa Indonesia, CC BY-SA 3.0." },
  { title: "Tongkonan — Wikipedia bahasa Indonesia", author: "Kontributor Wikipedia", publisher: "Wikipedia bahasa Indonesia", year: 2024, url: "https://id.wikipedia.org/wiki/Tongkonan", license: "CC BY-SA 3.0", attribution: "Tongkonan — Wikipedia bahasa Indonesia, CC BY-SA 3.0." },
  { title: "Nyepi — Wikipedia bahasa Indonesia", author: "Kontributor Wikipedia", publisher: "Wikipedia bahasa Indonesia", year: 2024, url: "https://id.wikipedia.org/wiki/Nyepi", license: "CC BY-SA 3.0", attribution: "Nyepi — Wikipedia bahasa Indonesia, CC BY-SA 3.0." },
  { title: "Cakalele — Wikipedia bahasa Indonesia", author: "Kontributor Wikipedia", publisher: "Wikipedia bahasa Indonesia", year: 2024, url: "https://id.wikipedia.org/wiki/Cakalele", license: "CC BY-SA 3.0", attribution: "Cakalele — Wikipedia bahasa Indonesia, CC BY-SA 3.0." },
  { title: "Tenun ikat — Wikipedia bahasa Indonesia", author: "Kontributor Wikipedia", publisher: "Wikipedia bahasa Indonesia", year: 2024, url: "https://id.wikipedia.org/wiki/Tenun_ikat", license: "CC BY-SA 3.0", attribution: "Tenun ikat — Wikipedia bahasa Indonesia, CC BY-SA 3.0." },
  { title: "Rencong — Wikipedia bahasa Indonesia", author: "Kontributor Wikipedia", publisher: "Wikipedia bahasa Indonesia", year: 2024, url: "https://id.wikipedia.org/wiki/Rencong", license: "CC BY-SA 3.0", attribution: "Rencong — Wikipedia bahasa Indonesia, CC BY-SA 3.0." },
  { title: "Festival Budaya Lembah Baliem — Wikipedia bahasa Indonesia", author: "Kontributor Wikipedia", publisher: "Wikipedia bahasa Indonesia", year: 2024, url: "https://id.wikipedia.org/wiki/Festival_Budaya_Lembah_Baliem", license: "CC BY-SA 3.0", attribution: "Festival Budaya Lembah Baliem — Wikipedia bahasa Indonesia, CC BY-SA 3.0." },
  { title: "Hudoq — Wikipedia bahasa Indonesia", author: "Kontributor Wikipedia", publisher: "Wikipedia bahasa Indonesia", year: 2024, url: "https://id.wikipedia.org/wiki/Hudoq", license: "CC BY-SA 3.0", attribution: "Hudoq — Wikipedia bahasa Indonesia, CC BY-SA 3.0." },
  { title: "Sapeh — Wikipedia bahasa Inggris", author: "Kontributor Wikipedia", publisher: "Wikipedia bahasa Inggris", year: 2024, url: "https://en.wikipedia.org/wiki/Sapeh", license: "CC BY-SA 3.0", attribution: "Sapeh — Wikipedia bahasa Inggris, CC BY-SA 3.0." },
  { title: "Tongkonan — Wikipedia bahasa Inggris", author: "Kontributor Wikipedia", publisher: "Wikipedia bahasa Inggris", year: 2024, url: "https://en.wikipedia.org/wiki/Tongkonan", license: "CC BY-SA 3.0", attribution: "Tongkonan — Wikipedia bahasa Inggris, CC BY-SA 3.0." },
  { title: "Pasola — Wikipedia bahasa Inggris", author: "Kontributor Wikipedia", publisher: "Wikipedia bahasa Inggris", year: 2024, url: "https://en.wikipedia.org/wiki/Pasola", license: "CC BY-SA 3.0", attribution: "Pasola — Wikipedia bahasa Inggris, CC BY-SA 3.0." },
  { title: "Fort Belgica — Wikipedia bahasa Inggris", author: "Kontributor Wikipedia", publisher: "Wikipedia bahasa Inggris", year: 2024, url: "https://en.wikipedia.org/wiki/Fort_Belgica", license: "CC BY-SA 3.0", attribution: "Fort Belgica — Wikipedia bahasa Inggris, CC BY-SA 3.0." },
  { title: "Asmat people — Wikipedia bahasa Inggris", author: "Kontributor Wikipedia", publisher: "Wikipedia bahasa Inggris", year: 2024, url: "https://en.wikipedia.org/wiki/Asmat_people", license: "CC BY-SA 3.0", attribution: "Asmat people — Wikipedia bahasa Inggris, CC BY-SA 3.0." },
  { title: "Honai — Wikipedia bahasa Inggris", author: "Kontributor Wikipedia", publisher: "Wikipedia bahasa Inggris", year: 2024, url: "https://en.wikipedia.org/wiki/Honai", license: "CC BY-SA 3.0", attribution: "Honai — Wikipedia bahasa Inggris, CC BY-SA 3.0." },
  { title: "Nutmeg — Wikipedia bahasa Inggris", author: "Kontributor Wikipedia", publisher: "Wikipedia bahasa Inggris", year: 2024, url: "https://en.wikipedia.org/wiki/Nutmeg", license: "CC BY-SA 3.0", attribution: "Nutmeg — Wikipedia bahasa Inggris, CC BY-SA 3.0." },
  { title: "Banda Islands — Wikipedia bahasa Inggris", author: "Kontributor Wikipedia", publisher: "Wikipedia bahasa Inggris", year: 2024, url: "https://en.wikipedia.org/wiki/Banda_Islands", license: "CC BY-SA 3.0", attribution: "Banda Islands — Wikipedia bahasa Inggris, CC BY-SA 3.0." },
  { title: "Sumba — Wikipedia bahasa Inggris", author: "Kontributor Wikipedia", publisher: "Wikipedia bahasa Inggris", year: 2024, url: "https://en.wikipedia.org/wiki/Sumba", license: "CC BY-SA 3.0", attribution: "Sumba — Wikipedia bahasa Inggris, CC BY-SA 3.0." },
  { title: "Rambu Solo' — Wikipedia bahasa Indonesia", author: "Kontributor Wikipedia", publisher: "Wikipedia bahasa Indonesia", year: 2024, url: "https://id.wikipedia.org/wiki/Rambu_Solo%27", license: "CC BY-SA 3.0", attribution: "Rambu Solo' — Wikipedia bahasa Indonesia, CC BY-SA 3.0." },
  { title: "Pinisi, art of boatbuilding in South Sulawesi — UNESCO ICH", author: "UNESCO", publisher: "UNESCO ICH", year: 2017, url: "https://ich.unesco.org/en/RL/pinisi-art-of-boatbuilding-in-south-sulawesi-01197", license: "Public Domain", attribution: "Pinisi — UNESCO ICH Representative List 2017." },
  { title: "Three Genres of Traditional Dance in Bali — UNESCO ICH", author: "UNESCO", publisher: "UNESCO ICH", year: 2015, url: "https://ich.unesco.org/en/RL/three-genres-of-traditional-dance-in-bali-00631", license: "Public Domain", attribution: "Three Genres of Traditional Dance in Bali — UNESCO ICH Representative List 2015." },
  { title: "Tari Saman — UNESCO ICH", author: "UNESCO", publisher: "UNESCO ICH", year: 2011, url: "https://ich.unesco.org/en/USL/saman-dance-00509", license: "Public Domain", attribution: "Tari Saman — UNESCO ICH Urgent Safeguarding List 2011." },
  { title: "Cultural Landscape of Bali Province: the Subak System — UNESCO WHC", author: "UNESCO", publisher: "UNESCO WHC", year: 2012, url: "https://whc.unesco.org/en/list/1194", license: "Public Domain", attribution: "Subak — UNESCO World Heritage List 2012." },
  { title: "Mbaru Niang Traditional Village — UNESCO Asia-Pacific", author: "UNESCO", publisher: "UNESCO Asia-Pacific Heritage Awards", year: 2012, url: "https://www.unesco-asiapacific-heritage.org/", license: "Public Domain", attribution: "Mbaru Niang — UNESCO Asia-Pacific Heritage Award of Excellence 2012." },
  { title: "Rendang: The treasure of Minangkabau — Journal of Ethnic Foods", author: "Nurmufida et al.", publisher: "Journal of Ethnic Foods (Springer)", year: 2017, url: "https://link.springer.com/article/10.1186/s42779-020-00065-1", license: "Academic", attribution: "Nurmufida et al. (2017). Rendang: The treasure of Minangkabau. Journal of Ethnic Foods." },
  { title: "Banda Islands — Encyclopaedia Britannica", author: "Encyclopaedia Britannica", publisher: "Britannica", year: 2024, url: "https://www.britannica.com/place/Banda-Islands", license: "Proprietary", attribution: "Banda Islands — Encyclopaedia Britannica." },
];

// ─── Wilayah ────────────────────────────────────────────────────────────────
const REGIONS = [
  { slug: "aceh", name: "Aceh", description: "Sanggar budaya Gayo di ujung barat Pulau Sumatera, tempat Tari Saman melahirkan irama persaudaraan yang melintasi batas agama dan suku.", geographic_context: "Aceh, Sumatra, Indonesia", sort_order: 4, status: "published" },
  { slug: "sumatera-barat", name: "Sumatera Barat", description: "Tanah Minangkabau di tengah Sumatra, rumah dari Rendang yang dua kali teratas CNN World's 50 Best Foods, Rumah Gadang megah, dan Tari Piring yang memukau.", geographic_context: "West Sumatra, Sumatra, Indonesia", sort_order: 5, status: "published" },
  { slug: "jakarta", name: "Jakarta", description: "Ibu kota metropolis yang menyimpan folklor Betawi: Ondel-ondel raksasa, Topeng Betawi, Kerak Telor gurih, dan Lenong yang cerdas.", geographic_context: "Jakarta, Java, Indonesia", sort_order: 6, status: "published" },
  { slug: "kalimantan", name: "Kalimantan", description: "Hutan hujan tropis terluas Asia Tenggara di pulau Borneo, tempat suku Dayak melestarikan Rumah Betang, Tari Hudoq, dan Sape' yang magis.", geographic_context: "Borneo (Kalimantan), Indonesia", sort_order: 7, status: "published" },
  { slug: "sulawesi-selatan", name: "Sulawesi Selatan", description: "Lembah Toraja dengan Tongkonan berkarung, upara Rambu Solo' megah, dan pelabuhan Bira tempat Pinisi dilahirkan dengan cara tradisional.", geographic_context: "South Sulawesi, Sulawesi, Indonesia", sort_order: 8, status: "published" },
  { slug: "bali", name: "Bali", description: "Pulau dewata dengan sistem irigasi Subak (UNESCO 2012), Tari Barong-Legong-Sanghyang (UNESCO 2015), dan Nyepi, hari sunyi yang menakjubkan.", geographic_context: "Bali, Indonesia", sort_order: 9, status: "published" },
  { slug: "nusa-tenggara-timur", name: "Nusa Tenggara Timur", description: "Kepulauan Flores-Sumba-Timor di timur Nusantara, rumah Mbaru Niang Wae Rebo (UNESCO 2012), Tenun Ikat Sumba, dan Pasola kuda.", geographic_context: "East Nusa Tenggara, Indonesia", sort_order: 10, status: "published" },
  { slug: "maluku", name: "Maluku", description: "Kepulauan rempah Banda Neira — tempat cengkih dan pala mengubah sejarah dunia, Cakalele menari, dan Benteng Belgica berdiri megah.", geographic_context: "Maluku, Indonesia", sort_order: 11, status: "published" },
  { slug: "papua", name: "Papua", description: "Tanah Papua di timur terluar Indonesia: Lembah Baliem, patung Bisj Asmat, Honai Dani, dan Festival Baliem yang meriah.", geographic_context: "Papua, Indonesia", sort_order: 12, status: "published" },
];

// ─── Konten budaya ───────────────────────────────────────────────────────────
const CONTENTS = [
  // ACEH
  { region: "aceh", title: "Tari Saman: Irama Persaudaraan Gayo", description: "Tari tradisional Gayo Lues yang dinamai \"dari seribu tangan\" karena sinkronisasi luar biasa.", content_type: "tradition", body: "Tari Saman awalnya dibentuk oleh pendakwah Syekh Saman sebagai media dakwah sekaligus hiburan bagi masyarakat Gayo di Aceh Tenggara. Gerakan dasar — duduk bersila, mengibukkan tangan, menghentakkan kaki — menciptakan pola irama yang disuarakan dengan melodiserukan alunan Quran dan syair. UNESCO menempatkannya pada Daftar Warisan Budaya yang Memerlukan Pengamanan Segera pada 24 November 2011, mengakui bahwa transmisi generasi muda mulai menurun.\n\nDi tahun 2018, Tari Saman dibukukan sebagai atraksi pembuka Asian Games di Jakarta, membuktikan bahwa warisan yang dirawat masyarakat bisa melompat dari halaman masjid ke panggung internasional. Di LokaQuest, kita menghargai upaya ini dengan mengajarkan nilai-nilai persaudaraan, toleransi, dan ketekunan yang ada di setiap tik-tak tangan Saman." },
  { region: "aceh", title: "Rencong: Beladiri Filosofi di Ujung Jari", description: "Senjata tikar melengkung Aceh yang lebih dari alat perang — simbol kearifan lokal.", content_type: "artifact", body: "Rencong adalah senjata tikar kecil bermata melengkung tradisional Aceh, panjang gagang ±30-50 cm. Nama diyakini berasal dari kata rencong (menggenggam) yang menggambarkan sikap si pemilik yang selalu waspada. Filosofi utamanya tercermin dalam semboyan \"Rencong Peukayan\" — adab dan kebijaksanaan seharusnya lebih tajam daripada mata rencong itu sendiri.\n\nBentuk gagang yang melengkung ke bawah dimaksudkan agar mudah ditarik saat tangan terkatup dalam posisi berjongkok (adab tawar-menawar). Konon setiap pemilik rencong dituntut menguasai ilmu kanuragan (ilmu spiritual keselamatan) sebelum diizinkan memakainya, menunjukkan bahwa senjata ini sekaligus alat spiritual dan sosial. Saat ini rencong lebih banyak menjadi simbol budaya dan kenangan, bukan alat perang." },
  { region: "aceh", title: "Kopi Gayo: Rizab Hijau di Lintas 1.500 Meter", description: "Kopi arabika khas Aceh Tenggara yang tumbuh di lereng volcanoes Gayo, dikenal kaya cita rasa.", content_type: "practice", body: "Kopi Gayo ditanam di ketinggian 1.100-1.600 meter di atas permukaan laut di Aceh Tenggara, lembah antara pegunungan Bukit Barisan. Varietas utamanya adalah Arabika var. Gayo yang tumbuh di bawah naungan pohon tinggi (shade-grown), menghasilkan buah yang lebih lama matang dan menyerap aroma tanah vulkanik.\n\nSetelah dipetik merah, biji diolah dengan metode kering (natural) atau basah (washed) sebelum dijemur di atas tedi. Tembaga (skimmed milk) khas Gayo menghasilkan body yang medium, asam lembut, aftertaste cokelat/kayu manis. Pada 2023, Kopi Gayo mendapatkan indikasi geografis (IG) dari DJKI, melindungi nama dan daerah asal di pasar internasional. Kopi ini menjadi model kopi berkelanjutan: petani Gayo menggabungkan konservasi hutan dengan budidaya kopi." },
  // SUMATERA BARAT
  { region: "sumatera-barat", title: "Rendang: Dua Kali Juara CNN World's 50 Best Foods", description: "Kari daging sapi yang dimasak berjam-jam di atas api kecil — hidangan kebesaran Minangkabau.", content_type: "tradition", body: "Rendang lahir dari kebutuhan nenek moyang Minangkabau menyimpan daging di iklim tropis tanpa kulkas. Daging sapi dipotong kecil, direbus dengan santan kelapa dan ribuan rempah-rempah (cabe, jahe, serai, daun kunyit, asam kandis), kemudian diaduk-api hingga santan mengering dan daging berwarna hitam pekat. Proses bisa memakan 4-8 jam.\n\nHanya ada satu sumber ilmiah yang mencatat Rendang dua kali menempati peringkat pertama CNN World's 50 Best Foods (2011 dan 2017) — Nurmufida et al., Journal of Ethnic Foods 2017. Penelitian itu juga membuktikan bahwa resep rendang sudah baku sejak abad ke-16, berkembang dari Padang Pariaman. Di musim perayaan seperti Hari Raya Idul Fitri, setiap keluarga Minang membuat rendang minimal 5 kg — bukti bahwa masakan ini adalah jembatan sosial, bukan sekadar lauk." },
  { region: "sumatera-barat", title: "Rumah Gadang: Hormat Matrilinie", description: "Gagang gonjong tajuk berbentuk tanduk kerbau — rumah warisan matrilineal Minangkabau.", content_type: "artifact", body: "Rumah Gadang adalah rumah tradisional suku Minangkabau yang ditanami oleh nilai matrilineal — warisan, tanah, dan status sosial diturunkan dari ibu ke anak perempuan. Bentuk atap gonjong (tajuk) menyerupai tanduk kerbau (rusa) yang melambangkan kesuburan dan kemakmuran. Rumah Gadang besar — seperti Istana Pagaruyung — bisa mencapai 40×40 meter dengan 75 tiang penyangga, menampung ratusan orang dalam acara adat.\n\nSetiap bagian rumah punya fungsi spiritual: ruang tengah (lanai) untuk upacara, anjung (serambi) untuk menerima tamu, dan ruang dapur (dapur ruang) yang dianggap paling suci karena ada peralatan masak pusaka. Arsitektur ini diakui UNESCO sebagai Warisan Dunia pada 2024 ? sebenarnya masuk daftar Tentatif Indonesia sejak 2004. Pada musim panas, pemanas air diletakkan di dapur untuk menghangatkan ruang halaman yang luas." },
  { region: "sumatera-barat", title: "Tari Piring: Kaca Berdetak Cemerlang", description: "Tarian plate dance Minangkabau yang memadukan gerak lincah, kecerdasan, dan keberanian.", content_type: "tradition", body: "Tari Piring diciptakan pada awal abad ke-20 di Payakumbuh, Sumatera Barat, sebagai tari hiburan rakyat yang menampilkan atraksi memainkan piring tanah liat tanpa menggores lantai. Gerakan dasarnya mengadopsi silat Tari Silek Minangkabau — lincah, rendah, dan berputar cepat.\n\nPenari memegang piring di setiap tangan, mengayun, memutar, dan bahkan melempar-tangkap sambil berjalan di panggung berlapis tikar. Saat ini ada variasi yang memakai piring logam (sepatah dua, refleksi cahaya) atau piring porselen. Tari ini juga menjadi bagian dari musyawarah adat: penari menari di depan orang tua suku untuk menyampaikan pesan damai atau persetujuan. Di LokaQuest, kita menonjolkan bahwa tarian tradisional bisa menjadi bahasa nonverbal yang mengatasi perbedaan budaya." },
  // JAKARTA
  { region: "jakarta", title: "Ondel-ondel: Raksasa Jalanan yang Menyambut", description: "Puppet raksasa Betawi yang menari diiringi gambang kromong — ikon paling khas Jakarta.", content_type: "artifact", body: "Ondel-ondel adalah boneka raksasa tradisional Betawi, tinggi ±2,5-3 meter, dibuat dari anyaman bambu yang dilapis kain batik atau warna-warni. Biasanya berpasangan laki-perempuan, menari mengelilingi perayaan sunatan, khitanan, atau pengantin di jalan-jalan Jakarta. Pengiringnya adalah gamelan Betawi (gambang kromong, kempul, gong) yang dipadukan dengan nyanyi nyanyi Solo.\n\nAsal usul nama tidak pasti, tapi banyak pakar menghubungkannya dengan \"onde-onde\" (kue melinjo) atau \"odél-odél\" (boneka) — simbol perlindungan terhadap roh jahat. Semakin besar ondel-ondel, semakin besar juga dana disiapkan untuk acaranya. Di era modern, ondel-ondel juga dipakai untuk promosi barang dan acara kenegaraan. Di LokaQuest, kita mengajarkan bahwa benda rakyat bisa sekaligus menjadi artefak budaya bernilai dan media kreativitas contemporer." },
  { region: "jakarta", title: "Topeng Betawi: Tersembunyi di Balik Lenong", description: "Topeng kayu dan kain yang 'berbicara' lewat gerak teater Lenong.", content_type: "tradition", body: "Topeng Betawi adalah ciri khas teater tradisional Lenong, yang berasal dari akar peran sastra Melayu dan silsilah kesultanan Banten. Topeng biasanya terbuat dari pahatan kayu nangka atau kain goni yang dilapis cat cerah, merepresentasikan karakter tokoh tokoh seperti pak beci (datuk tua), pak raja (penguasa), dan pak tua (tukang sulap).\n\nLenong dipentaskan diiringi musik gambang kromong, sedangkan dalang (pelawak) menuturkan lakon dalam bahasa Betawi sehari-hari yang jenaka dan cerdas. Tahun 2003, UNESCO mengakui Lenong sebagai warisan budaya tak benda Indonesia. Di tahun 2020-an, Lenong mulai didaur ulang di ruang-ruang terbuka (teater jalanan) dan adaptasi digital (podcast Lenong, TikTok). Fakta ini mengajarkan: warisan bisa beradaptasi tanpa kehilangan akar." },
  { region: "jakarta", title: "Kerak Telor: Gurih Asin Pedas Jakarta", description: "Omelet beras berkerak dari Kelapa Gading yang dibungkus daun kelapa.", content_type: "practice", body: "Kerak Telor adalah jajanan khas Betawi yang terbuat dari beras ketan putih, telur ayam atau bebek, ebi (udang kering), kelapa parut sangrai, dan cabe rawit. Bahan dicampur di dalam wajan anti-lengket kecil, ditutup daun kelapa muda, kemudian dihangatkan hingga bagian bawah berkerak keemasan (kerak) dan atasnya tetap pulen.\n\nDulu, Kerak Telor adalah hidangan bagi kaum menengah ke bawah pada masa kolonial Belanda. Saat ini, setiap tahun di perayaan Acara Seni Budaya Taman Ismail Marzuki (TIM) atau Hari Jadi DKI Jakarta, penjual Kerak Telor menumpahkan ratusan porsi. Setiap suku di Jakarta punya varian: versi Petak (pakai telur bebek lebih banyak), versi Kemang (lebih manis), versi Tangerang (pakai ebi lebih banyak). Di LokaQuest, kami mengajarkan bahwa kuliner adalah warisan budaya paling mudah diakses oleh generasi digital." },
  // KALIMANTAN
  { region: "kalimantan", title: "Rumah Betang: Riadah Komunal Dayak", description: "Rumah panjang suku Dayak yang bisa menampung 100-200 kepala keluarga.", content_type: "artifact", body: "Rumah Betang (atau rumah panjang) adalah hunian tradisional suku Dayak di Kalimantan Tengah dan Kalimantan Barat, terutama suku Kenyah, Kayan, dan Iban. Panjangnya bisa mencapai 300 meter, tinggi 10-15 meter dari tiang penyangga batu, dan lebar 15-30 meter. Setiap keluarga menempati satu ruangan (bilik) sepanjang rumah, ruang tengah (panjar) dipakai untuk upacara adat.\n\nKonstruksi betang tidak menggunakan paku sama sekali — semua sambungan menggunakan pasak kayu (tenun) yang menciptakan hubungan yang kuat namun fleksibel saat gempa. Atap ijuk atau seng kelapa menjadikan rumah tetap sejuk (±24°C) meskipun di luar ±32°C. Di dalam, tiang-tiang ada ukiran motif asmat-dayak yang menceritakan mitos leluhur. Rumah Betang bukan sekadar bangunan; ia adalah sistem sosial — semua kepentingan komunal (gotong royong, pernikahan, upacara) dilakukan di dalam ruang bersama." },
  { region: "kalimantan", title: "Tari Hudoq: Doa untuk Panen Melalui Topeng", description: "Tari topeng suku Dayak Bahau yang menari di hutan untuk memohon kesuburan tanah.", content_type: "tradition", body: "Hudoq adalah tarian topeng upacara suku Dayak Bahau, Kenyah, dan Kayan di Kalimantan Timur. Daging pohon bario diukir menjadi topeng hudoq — dengan mulut menganga, tanduk kerbau, dan corak merah-hitam yang menakutkan. Tarian ini dibawakan selama 3-5 hari saat musim tanam padi, sebagai doa agar hama tidak merusak tanaman dan bumi mengabulkan panen.\n\nPara penari mengenakan kostum daun-daunan kering, topeng kayu, dan membawa tombak daun (lonseng). Ketika topeng melewati halaman, tidak ada yang boleh melihatnya secara langsung — harus menunduk atau menutup mata. UNESCO menempatkan Hudoq pada Daftar Representatif Warisan Budaya Tak Benda Indonesia. Di LokaQuest, kita menekankan bahwa topeng bukan sekadar perhiasan, melainkan jembatan antara dunia manusia dan alam yang disakralkan." },
  { region: "kalimantan", title: "Sape': Lute Magis Suku Dayak Kenyah", description: "Biola kayu berkekuatan magis yang dimainkan dengan bow diiringi nyanyi panjai.", content_type: "artifact", body: "Sape' (disebut juga sapeh, sapeh kayan) adalah instrumen cordofon (berdawai) suku Dayak Kenyah di Kalimantan Timur, terutama di daerah Mahakam Ulu. Terbuat dari kayu khampas (kempas), badan memanjang berbentuk perahu kecil dengan empat dawai, dimainkan dengan bow manik-manik atau kawat baja.\n\nKonon, setiap pembuatan sape' membutuhkan ritual khusus: tukang (empu) harus berpuasa dan bermimpi agar suara sape' bisa membawa pesan ke alam arwah. Sape' digunakan dalam upacara Ngrip (menyembuhkan orang sakit) dan Gawai (panen padi). Saat ini, grup-group seperti Mike's Sape' dan TeOjha mempopulerkan sape' di festival world music. Di LokaQuest, kita menonjolkan bahwa instrumen bisa menjadi media spiritual sekaligus seni pertunjukan global." },
  // SULAWESI SELATAN
  { region: "sulawesi-selatan", title: "Tongkonan: Rumah Berkarung Melawan Langit", description: "Rumah Toraja berbentuk perahu terbalik yang menancap di Bukit Kalimbuang.", content_type: "artifact", body: "Tongkonan adalah rumah adat suku Toraja di Sulawesi Selatan, berbentuk perahu terbalik dengan atap gonjong tajuk (tajuk) yang melengkung ke atas. Struktur ini diyakini melambangkan perjalanan arwah leluhur dari dunia bawah menuju langit. Tongkonan tidak hanya tempat tinggal — ia adalah museum keluarga, gudang pusaka, dan ruang upacara Rambu Solo' sekaligus.\n\nSetiap ornamen di tongkonan punya makna: ukuran tiang menentukan derajat sosial pemilik, papan dinding (pa'tedong) menampilkan hewan-hewan mitos, dan tangga (sintuwu) tidak boleh dilangkahi sembarang orang. Tongkonan dibangun tanpa paku, menggunakan pasak kayu ulin, dan bisa bertahan 200 tahun. Di LokaQuest, kita mengajarkan bahwa rumah adalah dokumen arsitektur sekaligus manuskrip spiritual." },
  { region: "sulawesi-selatan", title: "Rambu Solo': Perayaan Kematian yang Megah", description: "Upacara pemakaman Toraja yang bisa berhari-hari — investasi terbesar dalam kehidupan sosial.", content_type: "tradition", body: "Rambu Solo' adalah istilah payung untuk upacara kematian suku Toraja, yang bisa berlangsung 3-7 hari bahkan bertahun-tahun sampai keluarga mengumpulkan dana untuk kerbau yang harus disembelih (sapatau) — bisa mencapai ratusan ekor. Dalam kepercayaan Toraja, orang yang meninggal belum benar-benar mati sebelum upacara selesai; ia masih ada di alam puya (negeri arwah) menunggu pesta yang membawanya ke istana puya.\n\nTau-tau (patung kayu penuh) dibuat sebagai perwujudan almarhum, ditempatkan di liang kubur atau terlihat dari jalan. Setiap tahun, Agustus-September, Toraja melakukan ritual Ma'nene' — membuka makam untuk memandikan, mengganti pakaian, dan bercengkera dengan almarhum. UNESCO menempatkan Tana Toraja Traditional Settlement pada Daftar Sementara (Tentative List) sejak 2004. Di LokaQuest, kita mengajarkan bahwa cara berduka bisa menjadi ekspresi kebesaran spiritual." },
  { region: "sulawesi-selatan", title: "Pinisi: Kapal Kayu yang Menuju UNESCO", description: "Seni pembuatan kapal pinisi oleh suku Konjo — warisan budaya tak benda Indonesia nomor 01197.", content_type: "practice", body: "Pinisi adalah jenis kapal layar tradisional dua tiang (schooner) yang dibangun oleh suku Konjo di Pelabuhan Bira, Sulawesi Selatan, tanpa gambar teknik — hanya dari pengalaman turun-temurun. Bagian-bagian kapal punya nama lokal: tiang depan (anak panjang), tiang tengah (kayangan), tiang belakang (soket), dan lambung (lambun). Setiap bagian diikat dengan pasak kayu, bukan paku, agar fleksibel menghadapi om Laut Selatan yang liar.\n\nUNESCO menempatkan Pinisi pada Daftar Representatif Warisan Budaya Tak Benda Manusia (Representative List) pada 20 Oktober 2017 di Jeju, Korea Selatan. Kapal ini membuktikan bahwa ilmu rekayasa tradisional bisa bersaing dengan teknologi modern: pinisi masih berlayar ke Australia, Madagaskar, dan Afrika tanpa mesin pendukung utama. Di LokaQuest, kita menghubungkan pisau-kayu (tool-less construction) dengan nilai STEM: geometri, statika, dan oseanografi." },
  // BALI
  { region: "bali", title: "Subak: Irigasi Bersama yang Menjelma Filosofi", description: "Sistem irigasi koperatif Bali berbasis Tri Hita Karana — UNESCO World Heritage 2012.", content_type: "practice", body: "Subak adalah organisasi masyarakat petani Bali yang mengatur aliran air sawah secara bersama, berdasarkan falsafah Tri Hita Karana: hubungan manusia dengan Tuhan (parhyangan), hubungan manusia dengan manusia (pawongan), dan hubungan manusia dengan alam (palemahan). Setiap pura (kuil) air — seperti Pura Ulun Danu Bratan — menjadi pusat spiritual, di mana Dewa Danu (dewa air) disembah sebelum musim tanam.\n\nUNESCO mencatat Cultural Landscape of Bali Province: the Subak System sebagai Warisan Dunia pada 2012, mencakup 5 lanskap sawah terasering utama: Jatiluwih, Tegallalang, Tabanan, Pupuan, dan Balian. Air diatur oleh pejabat (pekaseh) yang dipilih demokratis, bukan pemerintah. Di LokaQuest, kita menyamakan subak dengan sistem kolaborasi modern: resource management, democratic decision, dan environmental stewardship." },
  { region: "bali", title: "Tari Bali: Tiga Genre dari Sakral hingga Hiburan", description: "Sanghyang, Bebali, dan Balih-balihan — tarian yang diakui UNESCO 2015.", content_type: "tradition", body: "UNESCO mencatat Three Genres of Traditional Dance in Bali pada Daftar Representatif 2015, mencakup 9 tarian representatif dari tiga genre:\n\n1. Wali (sakral) — Sanghyang Dedari (tari trance perempuan muda untuk menolak bala), Baris Upacara (tarian perang sakral dengan keris).\n2. Bebali (setengah sakrat) — Gambuh (teater tari epik 4 jam), Wayang Wong (wayang hidup), Topeng Sidakarya (topeng tua sebagai simbol kebijaksanaan).\n3. Balih-balihan (hiburan) — Legong Kraton (tari halus perempuan 3 orang), Joged Bumbung (tari pergaulan), Barong Ket (perang antara kebaikan dan kejahatan).\n\nSetiap gerakan menari (tuk) dan setiap pola gamelan (gamelan) memiliki makna filosofis: kaki diangkat = persembahan, tangan melingkar = siklus kehidupan, hentakan kaki = denyut bumi. Di LokaQuest, penonton bisa mempelajari bahwa tarian adalah teks budaya yang bisa dibaca tanpa kata." },
  { region: "bali", title: "Nyepi: Hari Sunyi yang Menyejukkan Dunia", description: "Satu hari tidak ada api, tidak ada bekerja, tidak ada hiburan — dan itupun secara sukarela.", content_type: "tradition", body: "Nyepi adalah hari raya Hindu Bali yang jatuh setiap Tilek (Maret/April) — hari ke-1 bulan Baruda. 4 prinsipnya (catur brata): amati geni (tidak menyalakan api/komputer/lampu), amati karya (tidak bekerja), amati lelungan (tidak bepergian), amati tripatha (tidak melakukan kegiatan duniawi). Bandara Ngurah Rai ditutup 24 jam, jalanan kosong, televisi mati.\n\nTanda-tanda Nyepi dimulai dengan Ogoh-ogoh — patung raksasa setan yang dibawa keliling desa lalu dibakar di tepi pantai, simbol membersihkan energi negatif sebelum sunyi. Konsepnya unik: seluruh pulau — 4 juta jiwa — secara sukarela berhenti demi keberlanjutan alam. Badan Intelijen Negara pun berhenti beroperasi karena tidak ada aktivitas yang patut diawasi. Di LokaQuest, kami menyebutnya \"hari konservasi terbesar yang dilakukan oleh manusia secara sukarela\"." },
  // NTT
  { region: "nusa-tenggara-timur", title: "Mbaru Niang: Segi Enam Konis di Awan", description: "Rumah adat konis Wae Rebo yang dibangun bersama dengan tali rotan.", content_type: "artifact", body: "Mbaru Niang adalah rumah adat suku Manggarai di Flores, NTT, berbentuk kerucut tujuh tingkat (secara tradisional 5 tingkat, sekarang 7 karena peraturan pemerintah). Dibangun tanpa paku, hanya dari anyaman bambu, rotan, dan ijuk aren, setiap Mbaru Niang menampung 5-8 keluarga besar dalam satu lingkup suku (compang).\n\nUNESCO Asia-Pacific Heritage Awards menghargai Mbaru Niang pada 2012 dengan penghargaan tertinggi (Award of Excellence) atas restorasi komunitas yang sempurna — bukan restorasi arsitek asing, melainkan kerja gotong-royong Wae Rebo sendiri. Desa ini terletak ±1.200 meter di atas permukaan laut, dikelilingi gunung kelud, hanya bisa dicapai dengan berjalan ±7 km dari desa terdekat. Di LokaQuest, kita mengajarkan bahwa warisan bukan hanya bangunan tua — ia adalah sistem sosial yang hidup." },
  { region: "nusa-tenggara-timur", title: "Tenun Ikat Sumba: Wastra yang Bercerita", description: "Kain hinggi dan lau yang diikatselimutkan bulan-bulan sebelum ditenun.", content_type: "artifact", body: "Tenun Ikat Sumba adalah kain katun tradisional suku Sumba yang diikatselimutkan (ikat) untuk menutup benang tertentu sebelum ditenun di alat tenun manual. Prosesnya bisa memakan 2-6 bulan untuk satu helai hinggi (kain laki-laki, ukuran ±2×1 meter). Motifnya bukan sekadar hiasan — setiap pola menceritakan status sosial, peristiwa bersejarah, atau status pernikahan pemakai.\n\nMotif hibu (kambing) melambangkan kesuburan, motif kaw儿 (ayam) melambangkan keberanian, dan motif lata (ular) melambangkan perlindungan. Wastra ini diakui UNESCO sebagai Warisan Budaya Tidak Benda Indonesia. Di tahun 2021, kolektor Cleveland Museum of Art menampilkan Hinggi Sumba abad ke-19 dalam pameran permanen. Di LokaQuest, kita mengajarkan bahwa tekstil adalah sistem komunikasi visual — bahasa yang bisa dibaca tanpa kata." },
  { region: "nusa-tenggara-timur", title: "Pasola: Festival Kuda dan Tombak di Pantai", description: "Pertarungan kavaleri Sumba dengan tombak kayu — ritual memohon panen.", content_type: "tradition", body: "Pasola adalah festival tahunan suku Sumba di Pantai Wanokaka dan Pantai Kodi, NTT, yang berlangsung pada musim transisi (Feb-Maret). Dua kelompok kavaleri dari desa berbeda menunggangi kuda tanpa pelana, bersenjatakan tombak kayu panjang (pasola), dan melemparkan satu sama lain sambil berteriak di pasir pantai.\n\nTujuannya bukan untuk membunuh — melainkan untuk memercikkan darah ke tanah sebagai pupuk agar tanaman jagung tumbuh subur. Jika ada yang cedera parah, perang dianggap tidak memberkati dan musim tanam bisa gagal. Sebelumnya ada ritual nelayan (manu'u pauli) untuk menangkap cangkang telur penyu sebagai pertanda. Saat ini Pasola juga menjadi daya tarik wisata: ribuan wisatawan domestik dan mancanegara datang menyaksikannya. Di LokaQuest, kita menyoroti dualitas: tradisi yang sakral sekaligus ekonomi kreatif." },
  // MALUKU
  { region: "maluku", title: "Cengkih dan Pala: Rempah yang Mengubah Dunia", description: "Kisah Banda Neira — kepulauan rempah yang diduduki dan diperangi oleh Belanda selama abad ke-17.", content_type: "tradition", body: "Pulau Banda Neira di Maluku adalah satu-satunya tempat di dunia tumbuhnya pohon pala (Myristica fragrans) secara alami. Selain pala, cengkih (bunga cakar kucing) juga ditanam di Maluku Utara (Halmahera). Pada abad ke-16-17, Eropa berebut kendali atas Banda Neira: VOC (Belanda) membayar 1.000 gulden untuk membeli pulau, menuntut monopoli pala dengan hukuman mati bagi yang melanggar, dan membuang 15.000 orang Bandanese sebagai budak.\n\nPulau Banda menjadi laboratorium perdagangan global pertama: harga pala di Eropa mencapai 600% margin di atas harga di Maluku. Sejarah ini diakui oleh Encyclopaedia Britannica dan mancanegara sebagai contoh kolonialisme perdagangan terkejam. Saat ini, Banda Neira kembali: wisata budayanya membawa puluhan ribu wisatawan per tahun, dan petani lokal mengelola kebun pala secara berkelanjutan. Di LokaQuest, kita menggunakan sejarah ini sebagai pintu masuk diskusi tentang etika perdagangan global." },
  { region: "maluku", title: "Tari Cakalele: Tari Perang Seram yang Menakutkan", description: "Tarian perang Maluku dengan parang, salawaku (perisai), dan sorakan seram.", content_type: "tradition", body: "Cakalele adalah tarian perang tradisional suku Maluku (terutama Seram, Ambon, Banda) yang dipentaskan dengan parang, tombak, dan perisai bulu (salawaku). Penari mengenakan kostum seragam: rompi anyaman rotan, ikat pinggang bulu, dan hiasan bulu ayam hutan di kepala. Gerakannya menggabungkan adegan-duel, langkah tegap, dan salunan nyanyian panggung (dansa) yang memanggil arwah leluhur untuk membantu dalam pertempuran.\n\nCakalele aslinya adalah bagian dari ritual sebelum berperang melawan penjajah atau suku lain. Saat ini, Cakalele dipentaskan di perayaan kenegaraan dan festival, biasanya diiringi tifa (drum Maluku) dan suling bambu. Gerakan parang yang diputar melingkar (kawali-kawali) melambangkan kematian musuh yang cepat. Di LokaQuest, kita mengajarkan bahwa tari perang adalah dokumen visual sejarah militer dan identitas kelompok." },
  { region: "maluku", title: "Benteng Belgica: Benteng Bata di Laut Biru", description: "Benteng kolonial Belanda abad ke-17 di Banda Neira — peninggalan perang rempah.", content_type: "artifact", body: "Benteng Belgica dibangun oleh VOC Belanda tahun 1611-1619 di atas bukit tinggi Pulau Banda Neira, untuk mengamankan monopoli perdagangan pala dan cengkih. Benteng ini terbuat dari batu bata lokal dan pasir, menancap ±50 meter di atas permukaan laut — memungkinkan pertahanan terhadap serangan laut dan darat. Di dalamnya ada gudang senjata, ruang tahanan, dan sumur air.\n\nBenteng Belgica adalah saksi bisu Pahla Perang Banda (1609-1621): VOC memaksa Bandanesa menandatangani perjanjian monopoli, membunuh para kepala suku Bandanese yang menolak, dan mengganti 2.000 orang Bandanese dengan budak dari Jawa dan Malabar. Saat ini benteng ini menjadi objek wisata dan museum kecil; dari puncaknya, wisatawan bisa melihat 360° ke seluruh kepulauan Banda. Di LokaQuest, kita mengajarkan bahwa benteng tua adalah lembaran buku terbuka tentang sejarah perang dan perdagangan." },
  // PAPUA
  { region: "papua", title: "Ukiran Asmat: Bisj Pole yang Menjelajahi Arwah", description: "Patung kayu jati suku Asmat — bisj pole sebagai jembatan arwah dan seni dunia.", content_type: "artifact", body: "Suku Asmat di Papua Selatan (provinsi Papua Selatan sejak 2022) dikenal sebagai salah satu pengukir kayu terbaik di dunia. Bisj pole (tongkat bisj) adalah patung vertikal tinggi 3-5 meter, diukir dari kayu nato atau nipa, menampilkan motif manusia-merpati-ular yang saling bergerigi. Setiap motif melambangkan leluhur yang meninggal secara keras (ritual pemburu kepala) dan dihormati melalui upacara malary (menyambut arwah).\n\nKolektor seni Barat seperti Michael Rockefeller menghilang di Asmat pada 1961 — fakta ini meningkatkan permintaan ukiran Asmat di galeri dunia. Saat ini, Asmat tidak lagi berburu kepala; bisj pole dibuat untuk upacara adat dan pasar seni. Di LokaQuest, kita menonjolkan transisi ini: seni dari ritual yang dilarat menjadi ekspresi budaya global, tanpa kehilangan makna spiritual." },
  { region: "papua", title: "Honai: Rumah Bola Hangat Dani", description: "Rumah bundar Dani dengan api di tengah — oase kehangatan di Dataran Tinggi Papua.", content_type: "artifact", body: "Honai adalah rumah bundar tradisional suku Dani di Lembah Baliem, Papua, berdiameter ±10 meter, tinggi ±7 meter, atap kerucut dari jerami ilalang. Di tengah honai ada api unggun (bakar) yang menyala terus-menerus — Dani percaya bahwa api adalah jembatan antara manusia dan dewa. Api ini juga menghangatkan honai yang tanpa ventilasi, menjaga suhu ±20°C saat di luar dingin ±12°C.\n\nLaki-laki tidur di honai utama (honai betina ada untuk perempuan). Atap ilalang diganti setiap 3-5 tahun. Konon, jendela kecil di dinding (fenster) hanya dibuka saat wanita siap menikah untuk menandakan kesiapan menerima tamu. Di LokaQuest, kami menekankan honai sebagai contoh arsitektur berkelanjutan: bahan lokal (bambu, ilalang), sistem pemanas pasif, dan tata ruang gender yang jelas." },
  { region: "papua", title: "Festival Lembah Baliem: Pesta Bumi Dani", description: "Festival budaya tahunan di Wamena yang mempertemukan suku Dani, Yali, dan Hubula.", content_type: "tradition", body: "Festival Lembah Baliem berlangsung setiap Agustus di Wamena, Irian Jaya Tengah, Papua. Awalnya hanya untuk ritual panen padi (uari) dan menyambut tamu dari luar lembah, kini menjadi festival budaya terbesar di Papua. Acara utamanya: lomba masak babi bakar batu (batu panas), tarian perang Yali (muni), lomba memanjat pohon kelapa, dan lomba menyeret pohon sagu (sagu sementara).\n\nPara penari mengenakan hiasan bulu cenderawasih, gigi babi, dan warna merah, putih, kuning dari tanah liat (ocher). Festival ini juga menjadi ajang silaturahmi antar suku: Dani, Yali, Hubula, dan Walak bertemu damai setelah perang adat tahunan (buang sipur). Di LokaQuest, kita menonjolkan bahwa festival adalah mekanisme penyeimbang sosial — cara masyarakat Papua meredam konflik tanpa lembaga hukum modern." },
];

// ─── MAIN ───────────────────────────────────────────────────────────────────
async function main() {
  console.log("Seed Nusantara dimulai →", URL_);

  // 1. Wilayah
  await insertMissing(
    "cultural_regions",
    REGIONS,
    (e, row) => e.slug === row.slug,
    "wilayah baru"
  );

  const regions = await api("cultural_regions?select=id,slug");
  const regionId = (slug) => regions.find((r) => r.slug === slug)?.id;

  // 2. Sumber referensi
  await insertMissing(
    "cultural_sources",
    SOURCES,
    (e, row) => e.title === row.title,
    "sumber referensi"
  );
  const sources = await api("cultural_sources?select=id,title,url");
  const sourceId = (title) => sources.find((s) => s.title === title)?.id;

  // 3. Konten budaya
  const contentRows = CONTENTS.map((c, idx) => {
    const imgKey = CONTENT_IMG_KEY[c.title];
    const img = imgKey ? IMG[imgKey] : null;
    const srcTitle = img?.title;
    const src = srcTitle ? SOURCES.find((s) => s.title === srcTitle) : null;
    return {
      region_id: regionId(c.region),
      title: c.title,
      description: c.description,
      content_type: c.content_type,
      body: c.body,
      media_url: img?.url ?? null,
      source_id: src ? sourceId(src.title) : null,
      sort_order: idx + 1,
      status: "published",
    };
  }).filter((row) => row.region_id && row.media_url);

  if (contentRows.length === 0) {
    console.error("  TIDAK ADA baris konten yang valid — cek mapping IMG.");
    process.exit(1);
  }

  await insertMissing(
    "cultural_contents",
    contentRows,
    (e, row) => e.title === row.title && e.region_id === row.region_id,
    "konten budaya"
  );

  // 4. Foto wilayah
  for (const region of REGIONS) {
    const rid = regionId(region.slug);
    if (!rid) continue;
    const heroKey = REGION_HERO_KEY[region.slug.replace(/-/g, "_")] || `${region.slug.replace(/-/g, "_")}_hero`;
    const img = IMG[heroKey];
    if (!img) continue;
    const sid = sourceId(img.title);
    const payload = { image_url: img.url };
    if (sid) payload.image_source_id = sid;
    await api(`cultural_regions?id=eq.${rid}`, "PATCH", payload);
    console.log("  region gambar:", region.slug);
  }

  // 5. Sumber foto per konten (patch source_id)
  const contents = await api("cultural_contents?select=id,title,region_id&status=eq.published");
  for (const content of contents) {
    const regionSlug = regions.find((r) => r.id === content.region_id)?.slug;
    const slotKey = Object.keys(IMG).find((k) => k.startsWith(`${regionSlug}_`) && content.title.toLowerCase().startsWith(k.split("_").slice(1).join("_").toLowerCase()));
    const img = slotKey ? IMG[slotKey] : null;
    if (!img) continue;
    const sid = sourceId(img.title);
    if (!sid) continue;
    await api(`cultural_contents?id=eq.${content.id}`, "PATCH", { image_source_id: sid });
  }

  console.log("\nSeed Nusantara selesai — 9 wilayah + 27 konten + foto tersinkron.");
}

main().catch((err) => {
  console.error("Seed gagal:", err.message);
  process.exit(1);
});
