/**
 * LokaQuest — seed ekspansi 34 provinsi (22 wilayah baru) via Supabase REST.
 *
 * Menambahkan: 22 wilayah provinsi, 22 misi (3 soal MC per misi), 44 konten
 * budaya, 22 artikel ensiklopedia + sumber + relasi kategori/wilayah, serta
 * pemetaan CP Kurikulum Merdeka (curriculum_ref) untuk SEMUA misi.
 * Idempoten — aman dijalankan ulang.
 *
 * Usage: node --env-file=.env.local scripts/seed-expansion.mjs
 * Butuh env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY
 */
import process from "node:process";
import { REGIONS_22, MISSIONS_22, QUESTIONS_22, CURRICULUM_EXISTING } from "./seed-expansion-data.mjs";
import { ARTICLES_22, SOURCES_NEW } from "./seed-expansion-articles.mjs";

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SERVICE_KEY || SERVICE_KEY.includes("REDACTED")) {
  console.error(
    "SUPABASE_SECRET_KEY tidak ada. Jalankan dengan:\n" +
      "  node --env-file=.env.local scripts/seed-expansion.mjs"
  );
  process.exit(1);
}

const REST = `${URL_}/rest/v1`;

async function api(table, { method = "GET", body, query = "" } = {}) {
  const res = await fetch(`${REST}/${table}${query}`, {
    method,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(`${table} ${method}: ${res.status} ${JSON.stringify(json)}`);
  }
  return json;
}

async function insertMissing(table, rows, matchFn, label) {
  const existing = await api(table, { query: "?select=*" });
  const fresh = rows.filter((row) => !existing.some((e) => matchFn(e, row)));
  if (fresh.length === 0) {
    console.log(`  ${label}: sudah lengkap, lewati`);
    return existing;
  }
  const created = await api(table, { method: "POST", body: fresh });
  console.log(`  ${label}: +${fresh.length} baris`);
  return [...existing, ...created];
}

/* Konten budaya: 2 per wilayah — diringkas dari artikel utama wilayah. */
const CONTENTS_22 = [
  { region: "sumatera-utara", title: "Ulos: Kain Restu Batak", description: "Kain tenun Batak Toba yang wajib hadir dalam adat pernikahan dan pemberian restu.", content_type: "artifact", body: "Ulos diberikan dalam adat sebagai simbol hangat dan restu — dari paman kepada pengantin, dari keluarga kepada yang berduka. Motif ragi hotang (jala) mengharapkan kehidupan saling terkait seperti anyaman.\n\nPenenun di Balige dan Porsea masih menenun di ATBM dengan warna adat merah-hitam-putih." },
  { region: "sumatera-utara", title: "Danau Toba: Jantung Kebudayaan Batak", description: "Kaldera vulkanik terbesar dunia yang menjadi UNESCO Global Geopark 2020 dan pusat kehidupan Batak.", content_type: "story", body: "Danau Toba terbentuk dari letusan supervulkan ±74 ribu tahun lalu — kaldera terbesar di dunia. Di sekelilingnya hidup masyarakat Batak dengan rumah bolon beratap sagok, gondang sabangunan, dan tradisi ulos.\n\nPada Juli 2020 UNESCO menetapkan Danau Toba sebagai Global Geopark — pengakuan yang memadukan geologi, budaya, dan wisata berkelanjutan." },
  { region: "sumatera-selatan", title: "Songket Palembang: Emas di Antara Benang", description: "Kain tenun bersulam benang emas — motif bunga cina dan naga dari warisan estetika Sriwijaya.", content_type: "artifact", body: "Songket Palembang menyulam benang emas ke atas benang dasar saat menenun — bukan setelah kain jadi. Motif bunga cina, pucuk rebung, dan naga dipakai pada adat besanding pengantin.\n\nSentra tenun Ki Gongkunso menjaga teknik ini sejak era Kesultanan Palembang." },
  { region: "sumatera-selatan", title: "Rumah Limas dan Sungai Musi", description: "Rumah panggung tinggi adat Palembang di tepi Musi — pusat kehidupan melayu sungai.", content_type: "tradition", body: "Rumah Limas adalah rumah adat Sumatera Selatan dengan atap limas dan panggung tinggi. Ia dibangun menghadap Sungai Musi — jalur dagang utama Sriwijaya.\n\nKehidupan Musi masih hidup: perahu ketek, pasar apung, dan Jembatan Ampera yang menghubungkan Ulu dan Ilir." },
  { region: "riau", title: "Zapin dan Gamelan Melayu Riau", description: "Tarian berirama gambus berakar Arab yang menjadi bagian upacara dan pendidikan Melayu.", content_type: "tradition", body: "Zapin dibawakan berpasangan dengan gerak serempak, diiringi gambus dan marwas. Ia berkembang dari seni hadrah Arab yang dibawa pedagang ke pelabuhan Melayu.\n\nDi Riau, sanggar zapin menjadi ruang belajar adat; pantun dan gamelan Melayu menyertainya." },
  { region: "riau", title: "Istana Siak dan Penyengat", description: "Kenangan Kesultanan Siak Sri Inderapura dan pusat bahasa Melayu di Pulau Penyengat.", content_type: "story", body: "Istana Siak Sri Inderapura adalah kenangan Kesultanan Siak yang kuat di pesisir timur Sumatera. Di Pulau Penyengat, masjid raya Raya Haji Fisabilillah berdiri dengan peninggalan naskah Melayu.\n\nRiau menjadi rujukan bahasa Melayu baku — penulis Raja Ali Haji memulas karangannya di Penyengat." },
  { region: "kepulauan-riau", title: "Tari Lenggang Kepri", description: "Tari rakyat kegembiraan pesisir dengan gerak lenggang lenggok khas Melayu kepulauan.", content_type: "tradition", body: "Tari Lenggang dibawakan penari perempuan bajukurung Melayu dengan sanggul pucuk rebung. Geraknya mengayun menirukan ombak Selat Malaka.\n\nTari ini kini masuk muatan lokal sekolah Kepri dan muncul di acara resmi." },
  { region: "kepulauan-riau", title: "Bahari Bintan: Jejak Kerajaan Maritim", description: "Pulau Bintan sebagai lalut kerajaan maritim Melayu sebelum era Kesultanan Lingga.", content_type: "story", body: "Bintan pernah menjadi pusat kerajaan maritim Melayu yang menguasai lalut Selat Malaka. Pantai Pasir Panjang dan kota Tanjung Pinang menyimpan jejak dagang itu.\n\nKini Bintan menjadi wisata bahari; kehidupan nelayan dan budaya Melayu bahari tetap hidup." },
  { region: "jambi", title: "Candi Muaro Jambi", description: "Kompleks candi Buddha terluas Asia Tenggara (±398 ha) di tepi Sungai Batanghari.", content_type: "artifact", body: "Lebih dari 82 candi dan manopo membentang ±398 hektare — terluas di Asia Tenggara. Candi Tinggi, Kedaton, dan Gumpung (tempat arca Prajnaparamita ditemukan) adalah pusatnya.\n\nBata merah dibangun tanpa perekat dengan teknik batu tumpuk — kemampuan teknik era klasik yang tinggi." },
  { region: "jambi", title: "Batik Jambi dan Selampit Delapan", description: "Batik bermotif candi dan flora lokal, serta tari selampit delapan yang menyemangati gotong royong.", content_type: "tradition", body: "Batik Jambi mengambil motif dari Candi Muaro dan tumbuhan lokal seperti keladi. Tari Selampit Delapan dibawakan delapan pemain dengan selampit (selendang) yang menyilang — simbol persatuan.\n\nKeduanya tampil dalam perayaan budaya Jambi hingga kini." },
  { region: "bengkulu", title: "Kain Besurek", description: "Kain cap bermotif tumbuhan dan aksara Arab-Melayu (Jawi) yang menyimpan doa pembuatnya.", content_type: "artifact", body: "Besurek memadukan motif raung balam dan pucuk rebung dengan aksara Arab-Melayu — kadang berisi doa. Kain ini dipakai adat pernikahan dan diberikan sebagai hadiah kehormatan.\n\nSentra besurek ada di Kelurahan Maelo, Bengkulu Kota." },
  { region: "bengkulu", title: "Bubungan Lima dan Rafflesia", description: "Rumah adat berpuncak lima Bengkulu dan bunga terbesar dunia yang tumbuh di hutannya.", content_type: "story", body: "Rumah Bubungan Lima adalah rumah adat Bengkulu dengan atap berpuncak lima — dibangun panggung tinggi dengan ukiran khas.\n\nHutan Bengkulu menyimpan Rafflesia arnoldii — bunga terbesar di dunia, ditemukan 1818." },
  { region: "lampung", title: "Kain Tapis", description: "Kain tenun Lampung bersulam permutan benang emas dengan pakem adat Saibatin dan Pepadun.", content_type: "artifact", body: "Tapis adalah kain tenun yang disulam permutan — benang emas mengikuti pola puncuk rebung dan deret bunga. Motif tertentu hanya boleh dipakai pangkat adat tertentu.\n\nBersama mahkota siger, tapis menjadi busana upacara besar Lampung." },
  { region: "lampung", title: "Siger dan Sigeh Pengunten", description: "Mahkota adat yang dihubungkan dengan semangat pendidikan dan tari sapaan tamu kehormatan.", content_type: "tradition", body: "Siger adalah mahkota perempuan Lampung yang melengkung sembilan — sering dihubungkan dengan semangat pendidikan. Tari Sigeh Pengunten menyambut tamu kehormatan dengan sanggul siger.\n\nKeduanya tampil dalam perayaan hari jadi provinsi dan adat besar." },
  { region: "bangka-belitung", title: "Perahu Payang", description: "Perahu jaring tarik nelayan Bangka-Belitung yang tetap berlayar setiap musim timur.", content_type: "tradition", body: "Payang adalah perahu kecil berjaring tarik dengan layar segitiga. Nelayan mengayuh ke laut, menarik jaring, dan membawa hasil ke dermaga.\n\nKehidupan payang berjalan di Dermaga Kain, Belitung, dan pelabuhan Bangka." },
  { region: "bangka-belitung", title: "Lada Muntok dan Timah", description: "Dua komoditas yang membentuk sejarah pulau: lada putih Muntok dan timah yang menarik perantau Tionghoa.", content_type: "story", body: "Lada putih Muntok menguasai pasar dunia sejak era kolonial; timah memperkaya pulau dan menarik perantau Tionghoa yang membentuk budaya bauran.\n\nPerayaan Cap Go Meh dan kuliner bakso ikan adalah bukti bauran itu." },
  { region: "banten", title: "Seni Debus", description: "Paduan silat, zikir sufi, dan ketangkasan fisik dari warisan dakwah Kesultanan Banten.", content_type: "tradition", body: "Debus memadukan silat Banten, zikir sufi, dan ketangkasan fisik — tahan menusuk dan menarik kain. Ia berakar dari dakwah era Kesultanan Banten (abad ke-16).\n\nOrganisasi debus di Banten Lama dan Cikakak menjaga pakem: debus adalah hasil latihan dan niat, bukan keajaiban." },
  { region: "banten", title: "Badak Heulang dan Kerabang", description: "Rumah adat Banten berbentuk badak dan kenangan Kesultanan Banten di Selat Sunda.", content_type: "story", body: "Rumah Badak Heulang adalah rumah adat Banten dengan bentuk menyerupai badak — atapnya tinggi dan dindingnya dihias.\n\nKesultanan Banten (abad ke-16–17) menjadi kerajaan dagang pelabuhan besar di Selat Sunda." },
  { region: "jawa-timur", title: "Reog Ponorogo", description: "Dadak merak — topeng singa berbulu merak yang diangkat di bahu warok tanpa alat bantu.", content_type: "tradition", body: "Reog dibuka tari warok, lanjut jaran kepel, dan puncaknya dadak merak di bahu warok tua — hasil latihan napas bertahun-tahun.\n\nPertunjukan ini menghidupkan cerita asal-usul Ponorogo; pakemnya dijaga sekolah warok." },
  { region: "jawa-timur", title: "Karapan Sapi Madura", description: "Lomba sepasang sapi di jalur balapan khas Madura — tradisi panen yang menjadi festival besar.", content_type: "practice", body: "Karapan sapi mempertemukan sepasang sapi dengan kejuaraan bertingkat hingga provinsi. Pemenang naik pangkat ke lomba tingkat kabupaten.\n\nMadura juga menghidupkan ludruk — teater rakyat berbahasa Jawa Timuran." },
  { region: "kalimantan-selatan", title: "Bubungan Tinggi", description: "Rumah adat Banjar beratap mencuat — pusat upacara pernikahan dan pangkat adat.", content_type: "artifact", body: "Bubungan Tinggi dibangun panggung tinggi di tepi sungai dengan atap mencuat dua arah. Ruangnya dibagi balai, sambang, dan panampik.\n\nRumah ini dipakai untuk pernikahan besar dan pengangkatan pangkat adat Banjar." },
  { region: "kalimantan-selatan", title: "Intan Martapura dan Wadai", description: "Kota intan Kalimantan Selatan dan puluhan jenis wadai hari raya Banjar.", content_type: "story", body: "Martapura dikenal sebagai kota intan — penggalian dan pemotongan berlian sungai. Pasar pemotongan intan tetap hidup hingga kini.\n\nWadai Banjar bermacam puluhan jenis — kue cincin, apam, dan bahkan wadai sehari-hari yang menyertai hajatan." },
  { region: "kalimantan-tengah", title: "Ritus Tiwah", description: "Upacara kematian besar Dayak Ngaju yang mengantar arwah menuju Lewu Tatau.", content_type: "tradition", body: "Tiwah mengantar arwah keluarga ke Lewu Tatau — kampung kesemekian — dengan sandung berukir, manarai, dan musik gong. Dipandu basir/basirah dengan pantangan ketat.\n\nKaharingan diakui sebagai kepercayaan Dayak Ngaju di Kalimantan Tengah." },
  { region: "kalimantan-tengah", title: "Rumah Betang Kahayan", description: "Rumah panjang komunal Dayak yang dihuni beberapa keluarga dengan dapur komunal.", content_type: "artifact", body: "Rumah Betang dihuni beberapa keluarga satu keturunan dengan dapur komunal dan balai adat. Dibangun dari kayu ulin yang tahan puluhan tahun.\n\nDesa Tumbang lahau dan panggang Kahayan menjaga rumah betang hingga kini." },
  { region: "kalimantan-timur", title: "Rumah Lamin Kenyah", description: "Rumah panjang berukir suku Kenyah dengan balai adat dan dapur komunal.", content_type: "artifact", body: "Lamin dihuni satu klan besar dengan ukiran manuk dan daun di dindingnya. Balai adat menjadi ruang pertemuan dan pesta.\n\nDesa wisata lamin di Kutai Barat menjaga rumah ini hingga kini." },
  { region: "kalimantan-timur", title: "Ulap Doyo dan Gong Kenyah", description: "Kain tenun dari serat daun doyo dan tari gong perjamuan panen suku Kenyah-Benuaq.", content_type: "tradition", body: "Ulap doyo ditenun dari serat daun doyo, diwarnai alami (mengkudu, indigo), dan dijahit motif manuk.\n\nTari gong dibawakan dalam pesta beras baru diiringi ansambel gong." },
  { region: "kalimantan-utara", title: "Anyaman Babukung Lundayeh", description: "Topeng burung bertanduk besar dari anyaman rotan yang menari mengiringi panen.", content_type: "artifact", body: "Babukung adalah topeng burung bertanduk besar dari anyaman rotan Lundayeh — dipakai dalam pesta adat panen.\n\nAnyaman Lundayeh juga menghasilkan keranjang dan kepel yang kuat." },
  { region: "kalimantan-utara", title: "Rumah Panjang Perbatasan", description: "Rumah panjang komunal masyarakat Lundayeh di pegunungan perbatasan Kalimantan Utara.", content_type: "story", body: "Rumah panjang Lundayeh dihuni beberapa keluarga satu keturunan dengan dapur komunal. Ia dibangun dari kayu hutan pegunungan.\n\nFestival budaya lintas batas Indonesia-Malaysia menghidupkan identitas Lundayeh." },
  { region: "sulawesi-utara", title: "Kolintang Minahasa", description: "Ansambel kayu beresonansi jernih yang diinsaksikan UNESCO 2024.", content_type: "artifact", body: "Kolintang dibuat dari kayu wenuang/lenkong/papatingting. Ansambelnya terdiri katelu (rendah), ceng-ceng-keng (tengah), dan katokok (tinggi).\n\nPada Desember 2024, tradisi musik kolintang masuk Daftar Perwakilan UNESCO." },
  { region: "sulawesi-utara", title: "Kabasaran: Tari Perang Minahasa", description: "Tari perang dengan bulu ayam (rembak bido) dan kesungguhan perwira Minahasa.", content_type: "tradition", body: "Kabasaran adalah tari perang Minahasa — pemainnya mengenakan bulu ayam (rembak bido) dan kain merah. Geraknya menirukan ketangkasan perwira.\n\nTari ini tampil pada pesta adat dan perayaan besar Minahasa." },
  { region: "sulawesi-tengah", title: "Seni Lude Kaili", description: "Seni panggung gabungan musik, tari, dan drama rakyat Kaili — diinsaksikan UNESCO 2024.", content_type: "tradition", body: "Lude memadukan lagu, musik, dan drama rakyat dalam bahasa Kaili. Pemainnya bergantian menjadi penari, penyanyi, dan tokoh.\n\nLude dari Sigi masuk Daftar Perwakilan UNESCO pada Desember 2024." },
  { region: "sulawesi-tengah", title: "Rumah Tambi", description: "Rumah panggung adat suku Kaili di lembah Palu dengan atap melengkung.", content_type: "artifact", body: "Rumah Tambi adalah rumah panggung Kaili dengan atap melengkung dan dinding kulit kayu. Ia dibangun tahan angin lembah Palu.\n\nRumah tambi dijaga di desa-desa lembah Palu dan Donggala." },
  { region: "sulawesi-barat", title: "Perahu Sandeq", description: "Perahu layar trimaran Mandar — dikenal tercepat di Nusantara.", content_type: "artifact", body: "Sandeq adalah trimaran badan sempit dengan dua pelampung samping (baratang) dan layar segitiga terpal. Kecepatannya dikenal luar biasa.\n\nDahulu perahu dagang ikan Mandar; kini Sandeq Race digelar tahunan Majene–Makassar." },
  { region: "sulawesi-barat", title: "Passandeq dan Budaya Mandar", description: "Tari yang menirukan gerak mengatur layar dan budaya bahari Mandar laju.", content_type: "tradition", body: "Tari Passandeq menirukan gerak mengatur layar dan mendayung sandeq. Mandar menjadikan laut sebagai rumah kedua.\n\nBudaya bahari Mandar terlihat dari pembinaan pelaut muda dan perlombaan tahunan." },
  { region: "sulawesi-tenggara", title: "Benteng Keraton Buton", description: "Benteng batu terluas di dunia (±4,8 km) di Baubau — pusat Kesultanan Buton.", content_type: "artifact", body: "Benteng Keraton Buton membentang ±4,8 km dengan tujuh gerbang malope. Di dalamnya dahulu berdiri keraton, masjid, dan kampung istana.\n\nKesultanan Buton berkuasa sejak abad ke-16; benteng kini menjadi situs pelestarian." },
  { region: "sulawesi-tenggara", title: "Sarung Transversal Wologho", description: "Tenun sarung Buton dengan pola melintang khas yang dipakai adat besar.", content_type: "artifact", body: "Wologho adalah tenun sarung Buton dengan pola melintang (transversal) — teknik yang memerlukan ketelitian tinggi.\n\nSarung ini dipakai adat besar dan pesta pernikahan Buton." },
  { region: "gorontalo", title: "Kerawang Gorontalo", description: "Sulaman emas adat pada kain mokuto — menemani upacara pernikahan dan pangkat adat.", content_type: "artifact", body: "Kerawang (karawo) disulam benang emas pada kain mokuto dengan motif bunga dan tanaman. Satu kain adat dapat memakan waktu berbulan-bulan.\n\nKerawang dipakai busana upacara dan diberikan sebagai hadiah kehormatan." },
  { region: "gorontalo", title: "Binti-binti", description: "Tradisi makan bersama dengan bertukar suapan makanan khas Gorontalo.", content_type: "practice", body: "Binti-binti adalah tradisi makan bersama dengan bertukar suapan — simbol keakraban dan rasa sayang.\n\nTradisi ini dipraktikkan dalam hajatan keluarga besar Gorontalo." },
  { region: "nusa-tenggara-barat", title: "Bale Lumbung Sasak", description: "Lumbung padi beratap ijuk di atas tiang dengan pintu bermata kunci adat.", content_type: "artifact", body: "Bale lumbung (bale belegaq) berdiri di atas tiang dengan bulatan bermata kunci agar tikus tidak naik. Atap ijuk tahan hujan panas.\n\nLumbung menandai kekayaan keluarga Sasak dan dipakai menyimpan padi adat." },
  { region: "nusa-tenggara-barat", title: "Perang Ketupat dan Songket Sukarara", description: "Tradisi tahunan di pantai Lombok setelah Idul Fitri dan tenun benang emas Sasak.", content_type: "tradition", body: "Perang ketupat digelar tahunan di pantai Lombok — dua kelompok melempar ketupat dan daun pandan ke laut sebagai selamatan.\n\nSongket Sukarara ditenun di ATBM dengan benang emas; motifnya khas Sasak." },
  { region: "maluku-utara", title: "Kesultanan Ternate-Tidore", description: "Dua kesultanan rempah yang menguasai dagang cengkeh dunia abad ke-15–17.", content_type: "story", body: "Cengkeh asli tumbuh di beberapa gunung Maluku Utara; Ternate dan Tidore menguasai pohon-pohon itu dan menjalin dagang ke Jawa, Tiongkok, dan Arab.\n\nBenteng kolonial di Ternate (Oranye, Tolukko) menyimpan kenangan era dagang itu." },
  { region: "maluku-utara", title: "Benteng Oranye", description: "Benteng kolonial di Ternate yang kini menjadi museum kebudayaan.", content_type: "artifact", body: "Benteng Oranye dibangun era kolonial di Ternate dan kini menjadi museum kebudayaan Maluku Utara.\n\nKoleksinya menyimpan benda kesultanan dan kenangan dagang rempah." },
  { region: "papua-barat", title: "Rumah Kari Moi", description: "Rumah panggung berkaki banyak masyarakat Moi — disebut rumah kaki seribu.", content_type: "artifact", body: "Rumah kari Moi berdiri di atas puluhan tiang yang melindungi dari lembab dan binatang. Ruang bawah menyimpan hasil hutan.\n\nRumah ini dibangun di desa-desa Moi, Manokwari." },
  { region: "papua-barat", title: "Noken Arfak", description: "Tas anyam dari serat kulit batang seunggo — kearifan perempuan Arfak yang diakui UNESCO 2012.", content_type: "artifact", body: "Noken Arfak dianyam dari serat kulit batang seunggo oleh perempuan Arfak. Noken Papua (termasuk Arfak) diinsaksikan UNESCO 2012 sebagai tas multifungsi anyaman.\n\nNoken dipakai sehari-hari untuk membawa hasil hutan dan bahan makanan." },
];

/* --- main --- */
async function main() {
  console.log("=== LokaQuest seed ekspansi 34 provinsi ===");

  /* Deteksi kolom curriculum_ref — jika migrasi 20261114000000 belum dijalankan,
     misi tetap diinsert tanpa ref, dan langkah kurikulum dilewati dengan pesan. */
  let hasCurriculumColumn = true;
  try {
    await api("missions", { query: "?select=curriculum_ref&limit=1" });
  } catch {
    hasCurriculumColumn = false;
    console.warn(
      "  PERINGATAN: kolom missions.curriculum_ref belum ada — jalankan migrasi\n" +
        "  supabase/migrations/20261114000000_expansion_curriculum.sql di Supabase\n" +
        "  Dashboard (SQL Editor), lalu jalankan ulang seed ini (idempoten)."
    );
  }

  /* 1. Wilayah baru */
  console.log("1) cultural_regions (22 provinsi baru)");
  const regionRows = REGIONS_22.map((r, i) => ({
    slug: r.slug,
    name: r.name,
    description: r.description,
    geographic_context: r.geographic_context,
    sort_order: 100 + i,
    status: "published",
  }));
  const allRegions = await insertMissing(
    "cultural_regions",
    regionRows,
    (e, r) => e.slug === r.slug,
    "wilayah provinsi baru"
  );
  const regionId = Object.fromEntries(allRegions.map((r) => [r.slug, r.id]));
  console.log(`  total wilayah: ${allRegions.length}`);

  /* 2. Sumber baru */
  console.log("2) cultural_sources (sumber UNESCO & arsip)");
  await insertMissing("cultural_sources", SOURCES_NEW, (e, r) => e.title === r.title, "sumber referensi");

  /* 3. Misi baru */
  console.log("3) missions (22 misi provinsi baru)");
  const missionRows = MISSIONS_22.map((m, i) => {
    const row = {
      region_id: regionId[m.region],
      slug: m.slug,
      title: m.title,
      description: m.description,
      learning_objectives: m.learning_objectives,
      difficulty: m.difficulty,
      xp_reward: m.xp_reward,
      sort_order: 100 + i,
      status: "published",
    };
    if (hasCurriculumColumn) row.curriculum_ref = m.curriculum_ref ?? null;
    return row;
  }).filter((m) => m.region_id);
  const allMissions = await insertMissing(
    "missions",
    missionRows,
    (e, r) => e.slug === r.slug,
    "misi provinsi baru"
  );
  const missionId = Object.fromEntries(allMissions.map((m) => [m.slug, m.id]));

  /* 4. Soal misi */
  console.log("4) mission_questions (3 soal per misi baru)");
  const questionRows = [];
  for (const [slug, qs] of Object.entries(QUESTIONS_22)) {
    const mid = missionId[slug];
    if (!mid) continue;
    qs.forEach((q, i) => questionRows.push({ mission_id: mid, ...q, sort_order: i + 1 }));
  }
  const existingQuestions = await api("mission_questions", { query: "?select=id,mission_id,prompt" });
  const freshQ = questionRows.filter(
    (q) => !existingQuestions.some((e) => e.mission_id === q.mission_id && e.prompt === q.prompt)
  );
  if (freshQ.length) {
    await api("mission_questions", { method: "POST", body: freshQ });
    console.log(`  soal misi: +${freshQ.length} soal`);
  } else console.log("  soal misi: sudah lengkap, lewati");

  /* 5. CP Kurikulum untuk 12 misi yang sudah ada */
  if (hasCurriculumColumn) {
    console.log("5) missions.curriculum_ref (12 misi lama)");
    for (const [slug, ref] of Object.entries(CURRICULUM_EXISTING)) {
      const mid = missionId[slug];
      if (!mid) {
        console.warn(`  lewati ${slug}: misi tidak ditemukan`);
        continue;
      }
      await api("missions", { method: "PATCH", body: { curriculum_ref: ref }, query: `?id=eq.${mid}` });
    }
    console.log(`  diperbarui: ${Object.keys(CURRICULUM_EXISTING).length} misi`);
  }

  /* 6. Konten budaya baru */
  console.log("6) cultural_contents (44 konten provinsi baru)");
  const contentRows = CONTENTS_22.map((c, i) => ({
    region_id: regionId[c.region],
    title: c.title,
    description: c.description,
    content_type: c.content_type,
    body: c.body,
    sort_order: 100 + i,
    status: "published",
  })).filter((c) => c.region_id);
  await insertMissing("cultural_contents", contentRows, (e, r) => e.title === r.title, "konten provinsi baru");

  /* 7. Artikel ensiklopedia */
  console.log("7) encyclopedia_articles (22 artikel provinsi baru)");
  const articleRows = ARTICLES_22.map((a) => ({
    slug: a.slug,
    title: a.title,
    summary: a.summary,
    body: a.body,
    background: a.background,
    historical_context: a.historical_context,
    cultural_meaning: a.cultural_meaning,
    characteristics: a.characteristics,
    social_function: a.social_function,
    practices: a.practices,
    preservation: a.preservation,
    verified_facts: a.verified_facts,
    alternative_names: a.alternative_names,
    status: "published",
    published_at: new Date().toISOString(),
  }));
  const allArticles = await insertMissing(
    "encyclopedia_articles",
    articleRows,
    (e, r) => e.slug === r.slug,
    "artikel provinsi baru"
  );
  const articleId = Object.fromEntries(allArticles.map((a) => [a.slug, a.id]));

  /* 8. Relasi artikel */
  console.log("8) relasi artikel (kategori/wilayah/sumber)");
  const categories = await api("encyclopedia_categories", { query: "?select=id,slug" });
  const catId = Object.fromEntries(categories.map((c) => [c.slug, c.id]));
  const sources = await api("cultural_sources", { query: "?select=id,title" });
  const srcId = Object.fromEntries(sources.map((s) => [s.title, s.id]));

  const acRows = [];
  const arRows = [];
  const esRows = [];
  for (const a of ARTICLES_22) {
    const aid = articleId[a.slug];
    if (!aid) continue;
    for (const cat of a.categories) {
      if (catId[cat]) acRows.push({ article_id: aid, category_id: catId[cat] });
    }
    for (const rs of a.regions) {
      if (regionId[rs]) arRows.push({ article_id: aid, region_id: regionId[rs] });
    }
    a.sources.forEach((title, i) => {
      if (srcId[title]) {
        esRows.push({
          article_id: aid,
          source_id: srcId[title],
          source_title: title,
          sort_order: i + 1,
        });
      }
    });
  }
  await insertMissing("encyclopedia_article_categories", acRows, (e, r) => e.article_id === r.article_id && e.category_id === r.category_id, "artikel↔kategori");
  await insertMissing("encyclopedia_article_regions", arRows, (e, r) => e.article_id === r.article_id && e.region_id === r.region_id, "artikel↔wilayah");
  await insertMissing("encyclopedia_sources", esRows, (e, r) => e.article_id === r.article_id && e.source_title === r.source_title, "sumber artikel");

  console.log("=== Selesai — 34 provinsi lengkap ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
