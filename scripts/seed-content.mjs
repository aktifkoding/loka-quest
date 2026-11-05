/**
 * LokaQuest — comprehensive content seeding (remote/local via Supabase REST).
 *
 * Melengkapi seed bawaan (seed-remote.mjs) dengan data budaya Nusantara yang
 * terverifikasi dari referensi internet (UNESCO ICH/WHC, Wikipedia, jurnal):
 *   - 9 misi baru (1 per wilayah Nusantara) + 27 soal
 *   - 9 konten budaya baru untuk wilayah Jawa (Tengah/Barat/Yogyakarta)
 *   - 12 artefak budaya baru
 *   - 5 achievement baru
 *   - 18 artikel ensiklopedia (diparse dari supabase/seed-encyclopedia-articles.sql)
 *     + kategori, wilayah, sumber, media, artikel terkait, tautan misi
 *   - Relasi knowledge graph yang menyelesaikan UUID secara runtime
 *   - Kiriman komunitas demo
 *   - Akun demo (admin, educator, siswa) + kelas demo + papan peringkat
 *
 * Setiap langkah idempoten (matched by natural key) — aman dijalankan ulang.
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-content.mjs
 * Butuh env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY
 */
import process from "node:process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const URL_ =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://krsdymqxywddgreqflrx.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SECRET_KEY ?? "";

if (!SERVICE_KEY || SERVICE_KEY.includes("REDACTED")) {
  console.error(
    "SUPABASE_SECRET_KEY tidak ada. Isi .env.local lalu jalankan:\n" +
      "  node --env-file=.env.local scripts/seed-content.mjs"
  );
  process.exit(1);
}

const REST = `${URL_}/rest/v1`;
const AUTH = `${URL_}/auth/v1`;

async function api(table, { method = "GET", body, query = "", prefer } = {}) {
  const res = await fetch(`${REST}/${table}${query}`, {
    method,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: prefer ?? "return=representation",
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

async function authApi(path, { method = "GET", body } = {}) {
  const res = await fetch(`${AUTH}${path}`, {
    method,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`auth ${path}: ${res.status} ${JSON.stringify(json)}`);
  }
  return json;
}

/** Insert rows whose natural key is not present yet. Returns all rows incl. DB ids. */
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

/* ========================================================================== *
 * 1. SUMBER BARU (UNESCO terverifikasi + Wikipedia)
 * ========================================================================== */
const SOURCES_EXTRA = [
  {
    title: "Indonesian Batik — UNESCO ICH",
    author: "UNESCO", publisher: "UNESCO Intangible Cultural Heritage", year: 2009,
    url: "https://ich.unesco.org/en/RL/indonesian-batik-00170", license: "Public Domain",
    attribution: "Indonesian Batik — UNESCO Representative List of ICH, 2009.",
  },
  {
    title: "Wayang Puppet Theatre — UNESCO ICH",
    author: "UNESCO", publisher: "UNESCO Intangible Cultural Heritage", year: 2008,
    url: "https://ich.unesco.org/en/RL/wayang-puppet-theatre-00063", license: "Public Domain",
    attribution: "Wayang Puppet Theatre — UNESCO Representative List of ICH, 2008.",
  },
  {
    title: "Indonesian Kris — UNESCO ICH",
    author: "UNESCO", publisher: "UNESCO Intangible Cultural Heritage", year: 2008,
    url: "https://ich.unesco.org/en/RL/indonesian-kris-00112", license: "Public Domain",
    attribution: "Indonesian Kris — UNESCO Representative List of ICH, 2008.",
  },
  {
    title: "Indonesian Angklung — UNESCO ICH",
    author: "UNESCO", publisher: "UNESCO Intangible Cultural Heritage", year: 2010,
    url: "https://ich.unesco.org/en/RL/indonesian-angklung-00393", license: "Public Domain",
    attribution: "Indonesian Angklung — UNESCO Representative List of ICH, 18 November 2010.",
  },
  {
    title: "Gamelan — UNESCO ICH",
    author: "UNESCO", publisher: "UNESCO Intangible Cultural Heritage", year: 2021,
    url: "https://ich.unesco.org/en/RL/gamelan-01607", license: "Public Domain",
    attribution: "Gamelan — UNESCO Representative List of ICH, 2021.",
  },
  {
    title: "Traditions of Pencak Silat — UNESCO ICH",
    author: "UNESCO", publisher: "UNESCO Intangible Cultural Heritage", year: 2019,
    url: "https://ich.unesco.org/en/RL/traditions-of-pencak-silat-01391", license: "Public Domain",
    attribution: "Traditions of Pencak Silat — UNESCO Representative List of ICH, 2019.",
  },
  {
    title: "Noken — UNESCO ICH (Urgent Safeguarding List)",
    author: "UNESCO", publisher: "UNESCO Intangible Cultural Heritage", year: 2012,
    url: "https://ich.unesco.org/en/USL/noken-multifunctional-knotted-or-woven-bag-handcraft-of-the-people-of-papua-00619",
    license: "Public Domain",
    attribution: "Noken — UNESCO Urgent Safeguarding List of ICH, 2012.",
  },
  {
    title: "Pantun — UNESCO ICH",
    author: "UNESCO", publisher: "UNESCO Intangible Cultural Heritage", year: 2020,
    url: "https://ich.unesco.org/en/state/indonesia-ID", license: "Public Domain",
    attribution: "Pantun — UNESCO Representative List of ICH, 2020 (Indonesia & Malaysia).",
  },
  {
    title: "Jamu Wellness Culture — UNESCO ICH",
    author: "UNESCO", publisher: "UNESCO Intangible Cultural Heritage", year: 2023,
    url: "https://ich.unesco.org/en/state/indonesia-ID", license: "Public Domain",
    attribution: "Jamu wellness culture — UNESCO Representative List of ICH, 2023.",
  },
  {
    title: "Kebaya — UNESCO ICH (multinasional)",
    author: "UNESCO", publisher: "UNESCO Intangible Cultural Heritage", year: 2024,
    url: "https://ich.unesco.org/en/state/indonesia-ID", license: "Public Domain",
    attribution: "Kebaya — UNESCO Representative List of ICH, 2024 (ID, MY, BN, SG, TH).",
  },
  {
    title: "Kolintang — UNESCO ICH",
    author: "UNESCO", publisher: "UNESCO Intangible Cultural Heritage", year: 2024,
    url: "https://ich.unesco.org/en/state/indonesia-ID", license: "Public Domain",
    attribution: "Kolintang music tradition — UNESCO Representative List of ICH, 2024 (Minahasa).",
  },
  {
    title: "Keris — Wikipedia bahasa Indonesia",
    author: "Kontributor Wikipedia", publisher: "Wikipedia bahasa Indonesia", year: 2024,
    url: "https://id.wikipedia.org/wiki/Keris", license: "CC BY-SA 3.0",
    attribution: "Keris — Wikipedia bahasa Indonesia, CC BY-SA 3.0.",
  },
  {
    title: "Sekaten — Wikipedia bahasa Indonesia",
    author: "Kontributor Wikipedia", publisher: "Wikipedia bahasa Indonesia", year: 2024,
    url: "https://id.wikipedia.org/wiki/Sekaten", license: "CC BY-SA 3.0",
    attribution: "Sekaten — Wikipedia bahasa Indonesia, CC BY-SA 3.0.",
  },
  {
    title: "Gudeg — Wikipedia bahasa Indonesia",
    author: "Kontributor Wikipedia", publisher: "Wikipedia bahasa Indonesia", year: 2024,
    url: "https://id.wikipedia.org/wiki/Gudeg", license: "CC BY-SA 3.0",
    attribution: "Gudeg — Wikipedia bahasa Indonesia, CC BY-SA 3.0.",
  },
  {
    title: "Tari Merak — Wikipedia bahasa Indonesia",
    author: "Kontributor Wikipedia", publisher: "Wikipedia bahasa Indonesia", year: 2024,
    url: "https://id.wikipedia.org/wiki/Tari_Merak", license: "CC BY-SA 3.0",
    attribution: "Tari Merak — Wikipedia bahasa Indonesia, CC BY-SA 3.0.",
  },
  {
    title: "Sendratari Ramayana — Wikipedia bahasa Indonesia",
    author: "Kontributor Wikipedia", publisher: "Wikipedia bahasa Indonesia", year: 2024,
    url: "https://id.wikipedia.org/wiki/Sendratari_Ramayana", license: "CC BY-SA 3.0",
    attribution: "Sendratari Ramayana — Wikipedia bahasa Indonesia, CC BY-SA 3.0.",
  },
  {
    title: "Mandau — Wikipedia bahasa Indonesia",
    author: "Kontributor Wikipedia", publisher: "Wikipedia bahasa Indonesia", year: 2024,
    url: "https://id.wikipedia.org/wiki/Mandau", license: "CC BY-SA 3.0",
    attribution: "Mandau — Wikipedia bahasa Indonesia, CC BY-SA 3.0.",
  },
  {
    title: "Salawaku — Wikipedia bahasa Indonesia",
    author: "Kontributor Wikipedia", publisher: "Wikipedia bahasa Indonesia", year: 2024,
    url: "https://id.wikipedia.org/wiki/Salawaku", license: "CC BY-SA 3.0",
    attribution: "Salawaku — Wikipedia bahasa Indonesia, CC BY-SA 3.0.",
  },
  {
    title: "Canang sari — Wikipedia bahasa Indonesia",
    author: "Kontributor Wikipedia", publisher: "Wikipedia bahasa Indonesia", year: 2024,
    url: "https://id.wikipedia.org/wiki/Canang_sari", license: "CC BY-SA 3.0",
    attribution: "Canang sari — Wikipedia bahasa Indonesia, CC BY-SA 3.0.",
  },
  {
    title: "Kain Hinggi Sumba — Museum Cleveland of Art",
    author: "Cleveland Museum of Art", publisher: "Cleveland Museum of Art", year: 1900,
    url: "https://www.clevelandart.org/art/1925.490", license: "CC0",
    attribution: "Hinggi Sumba (±1900) — The Cleveland Museum of Art, CC0.",
  },
];

/* ========================================================================== *
 * 2. MISI BARU (9 wilayah Nusantara) + SOAL
 *    Format terverifikasi src/lib/scoring.ts + phaser-game.tsx:
 *    MC/identification → options.choices/instruments + correct.correct
 *    matching          → options.lefts/rights + correct.matches
 *    sequencing        → options.events + correct.order (label, urutan benar)
 * ========================================================================== */
const MISSIONS = [
  {
    region: "aceh", slug: "saman-harmony", title: "Saman Harmony",
    description: "Rasakan irama seribu tangan Tari Saman: pelajari asal-usulnya, gerakan khasnya, dan makna persaudaraan Gayo.",
    learning_objectives: ["Mengenal asal Tari Saman dari suku Gayo", "Memahami makna gerakan serempak Saman", "Menghargai nilai persaudaraan dan toleransi"],
    difficulty: "beginner", xp_reward: 150,
  },
  {
    region: "sumatera-barat", slug: "randai-minang", title: "Randai Minang Explorer",
    description: "Jelajahi teater rakyat Minangkabau yang memadukan silat, dendang, dan cerita kaba dalam satu panggung bulat.",
    learning_objectives: ["Mengenal Randai sebagai teater rakyat Minangkabau", "Memahami unsur silat, dendang, dan kaba dalam Randai", "Mengaitkan Randang dan Rumah Gadang dengan budaya Minang"],
    difficulty: "intermediate", xp_reward: 200,
  },
  {
    region: "jakarta", slug: "ondel-ondel-guardian", title: "Ondel-Ondel Guardian",
    description: "Kenali si raksasa ramah Betawi: bentuk, warna wajah, pengiring musik, dan perannya mengusir bala.",
    learning_objectives: ["Mengenal ondel-ondel sebagai boneka raksasa Betawi", "Membedakan wajah laki-laki dan perempuan", "Mengenal musik pengiring tanjidor dan gambang kromong"],
    difficulty: "beginner", xp_reward: 150,
  },
  {
    region: "kalimantan", slug: "betang-heritage", title: "Betang Heritage Trail",
    description: "Susuri Rumah Betang, rumah panjang Dayak yang hidup dari kayu ulin, gotong royong, dan upacara adat.",
    learning_objectives: ["Mengenal Rumah Betang sebagai rumah panjang Dayak", "Memahami proses pembangunan secara gotong royong", "Mengenal budaya Dayak: ulin, hudoq, sape', dan tiwah"],
    difficulty: "intermediate", xp_reward: 200,
  },
  {
    region: "sulawesi-selatan", slug: "pinisi-voyage", title: "Pinisi Voyage",
    description: "Berlayar dari Bira: pelajari bagaimana Suku Konjo membangun Pinisi dengan ritual adat hingga diakui UNESCO 2017.",
    learning_objectives: ["Mengenal Pinisi sebagai perahu tradisional Sulawesi Selatan", "Memahami tahapan pembangunan kapal secara tradisional", "Menghargai pengetahuan maritim Suku Konjo"],
    difficulty: "advanced", xp_reward: 250,
  },
  {
    region: "bali", slug: "subak-wisdom", title: "Subak Wisdom",
    description: "Teteskan kebijaksanaan Bali: pahami Subak, irigasi demokratis yang menjadikan sawah Bali Warisan Dunia UNESCO 2012.",
    learning_objectives: ["Mengenal Subak sebagai sistem irigasi demokratis", "Memahami peran pura dan sramabakti dalam Subak", "Mengenal Nyepi dan tradisi Bali lainnya"],
    difficulty: "intermediate", xp_reward: 200,
  },
  {
    region: "nusa-tenggara-timur", slug: "tenun-sumba", title: "Tenun Sumba Story",
    description: "Ikuti benang cerita kain Hinggi: dari memintal kapas, mengikat motif, hingga mewarnai dengan akar mengkudu.",
    learning_objectives: ["Mengenal tenun ikat dan kain Hinggi Sumba", "Memahami tahapan pembuatan tenun ikat", "Mengenal pewarna alami khas Sumba"],
    difficulty: "intermediate", xp_reward: 200,
  },
  {
    region: "maluku", slug: "sasi-maluku", title: "Sasi Sailor",
    description: "Belajar dari laut Banda: tradisi Sasi, larangan panen sementara yang menjaga kelestarian alam Maluku.",
    learning_objectives: ["Mengenal Sasi sebagai kearifan lokal konservasi", "Mengenal sejarah rempah Maluku", "Mengenal Cakalele dan Benteng Belgica"],
    difficulty: "beginner", xp_reward: 150,
  },
  {
    region: "papua", slug: "noken-weaver", title: "Noken Weaver",
    description: "Anyam kearifan Papua: pelajari Noken, tas khas dari serat kulit batang yang diakui UNESCO 2012.",
    learning_objectives: ["Mengenal Noken sebagai warisan Papua di UNESCO", "Memahami bahan dan proses pembuatan Noken", "Menghargai peran Noken dalam kehidupan masyarakat Dani"],
    difficulty: "intermediate", xp_reward: 200,
  },
];

const QUESTIONS = {
  "saman-harmony": [
    {
      question_type: "multiple_choice",
      prompt: "Tari Saman yang terkenal dengan gerakan seribu tangan berasal dari suku mana?",
      options: { choices: ["Gayo", "Batak", "Minangkabau", "Nias"] },
      correct_answer: { correct: "Gayo" },
      explanation: "Tari Saman adalah tarian suku Gayo dari Aceh Tenggara (Gayo Lues), dan masuk Daftar UNESCO yang Memerlukan Pengamanan Segera pada 2011.",
    },
    {
      question_type: "matching",
      prompt: "Cocokkan warisan budaya dengan asal wilayahnya:",
      options: {
        lefts: ["Tari Saman", "Noken", "Pinisi", "Subak"],
        rights: ["Aceh — UNESCO 2011", "Papua — UNESCO 2012", "Sulawesi Selatan — UNESCO 2017", "Bali — UNESCO 2012"],
      },
      correct_answer: {
        matches: {
          "Tari Saman": "Aceh — UNESCO 2011",
          Noken: "Papua — UNESCO 2012",
          Pinisi: "Sulawesi Selatan — UNESCO 2017",
          Subak: "Bali — UNESCO 2012",
        },
      },
      explanation: "Empat warisan Indonesia ini semua diakui UNESCO: Saman (2011), Noken (2012), Pinisi (2017), dan Subak sebagai Warisan Dunia (2012).",
    },
    {
      question_type: "sequencing",
      prompt: "Urutkan tahapan penyajian Tari Saman dari awal hingga akhir:",
      options: {
        events: ["Salam pembuka dan alunan syair", "Gerakan lambat mengikuti irama", "Gerakan makin cepat dan serempak", "Latab sebagai penutup"],
      },
      correct_answer: {
        order: ["Salam pembuka dan alunan syair", "Gerakan lambat mengikuti irama", "Gerakan makin cepat dan serempak", "Latab sebagai penutup"],
      },
      explanation: "Saman dibuka dengan salam dan syair, lalu gerakannya bertambah cepat hingga serempak, dan ditutup dengan latab.",
    },
  ],
  "randai-minang": [
    {
      question_type: "multiple_choice",
      prompt: "Randai adalah seni pertunjukan teater rakyat tradisional dari daerah mana?",
      options: { choices: ["Minangkabau (Sumatera Barat)", "Melayu Deli", "Gayo Lues", "Lampung"] },
      correct_answer: { correct: "Minangkabau (Sumatera Barat)" },
      explanation: "Randai berasal dari Minangkabau, memadukan silat, dendang, tarian, dan cerita kaba yang disampaikan dengan duduk bersila membentuk lingkaran.",
    },
    {
      question_type: "multiple_choice",
      prompt: "Instrumen gendang pengiring Randai yang menjaga tempo cerita disebut:",
      options: { choices: ["Gandang Talo", "Kendang Ciblon", "Bedug", "Gendang Melayu"] },
      correct_answer: { correct: "Gandang Talo" },
      explanation: "Gandang Talo adalah gendang pengiring Randai; bersama saluang dan talempong ia membentuk musik pengiring pertunjukan.",
    },
    {
      question_type: "matching",
      prompt: "Cocokkan ikon budaya Minangkabau dengan deskripsinya:",
      options: {
        lefts: ["Randai", "Rendang", "Rumah Gadang", "Tari Piring"],
        rights: ["Teater rakyat berunsur silat dan kaba", "Masakan daging santan yang dimasak berjam-jam", "Rumah tradisional beratap gonjong", "Tarian dengan piring di kedua telapak"],
      },
      correct_answer: {
        matches: {
          Randai: "Teater rakyat berunsur silat dan kaba",
          Rendang: "Masakan daging santan yang dimasak berjam-jam",
          "Rumah Gadang": "Rumah tradisional beratap gonjong",
          "Tari Piring": "Tarian dengan piring di kedua telapak",
        },
      },
      explanation: "Rendang dua kali dinobatkan CNN sebagai makanan terlezat dunia (2011 dan 2017), sementara atap gonjong menyerupai tanduk kerbau.",
    },
  ],
  "ondel-ondel-guardian": [
    {
      question_type: "multiple_choice",
      prompt: "Ondel-ondel adalah boneka raksasa milik suku atau kelompok masyarakat mana?",
      options: { choices: ["Betawi", "Sunda", "Jawa", "Batak"] },
      correct_answer: { correct: "Betawi" },
      explanation: "Ondel-ondel adalah boneka raksasa khas masyarakat Betawi, Jakarta, yang secara tradisional dipercaya mengusir roh jahat atau bala.",
    },
    {
      question_type: "multiple_choice",
      prompt: "Wajah ondel-ondel perempuan berwarna apa?",
      options: { choices: ["Hijau", "Biru", "Kuning", "Abu-abu"] },
      correct_answer: { correct: "Hijau" },
      explanation: "Ondel-ondel laki-laki berwajah merah dan perempuan berwajah hijau, dipasangkan dalam satu kelompok pertunjukan.",
    },
    {
      question_type: "matching",
      prompt: "Cocokkan kesenian Betawi dengan deskripsinya:",
      options: {
        lefts: ["Ondel-ondel", "Topeng Betawi", "Lenong", "Kerak Telor"],
        rights: ["Boneka raksasa pengusir bala", "Tari bertopeng yang mencakup bagian tarian dan nyanyian", "Drama rakyat Betawi dengan dayak (sindiran jenaka)", "Makanan dari beras ketan, telur, dan serundeng"],
      },
      correct_answer: {
        matches: {
          "Ondel-ondel": "Boneka raksasa pengusir bala",
          "Topeng Betawi": "Tari bertopeng yang mencakup bagian tarian dan nyanyian",
          Lenong: "Drama rakyat Betawi dengan dayak (sindiran jenaka)",
          "Kerak Telor": "Makanan dari beras ketan, telur, dan serundeng",
        },
      },
      explanation: "Kesenian Betawi adalah perpaduan budaya Melayu, Tionghoa, Arab, dan Eropa yang tumbuh di Jakarta sejak ratusan tahun lalu.",
    },
  ],
  "betang-heritage": [
    {
      question_type: "multiple_choice",
      prompt: "Rumah Betang, rumah panjang yang dihuni banyak keluarga sekaligus, adalah rumah adat suku mana?",
      options: { choices: ["Dayak", "Banjar", "Kutai", "Bugis"] },
      correct_answer: { correct: "Dayak" },
      explanation: "Rumah Betang (rumah panjang) adalah rumah adat suku Dayak di Kalimantan; satu rumah dapat dihuni beberapa keluarga besar sekaligus.",
    },
    {
      question_type: "sequencing",
      prompt: "Urutkan tahapan membangun Rumah Betang secara tradisional:",
      options: {
        events: ["Memilih kayu ulin di hutan", "Menebang dan mengangkut kayu ke lokasi", "Mengangkat tiang utama bersama-sama", "Merayakan pesta adat rumah selesai"],
      },
      correct_answer: {
        order: ["Memilih kayu ulin di hutan", "Menebang dan mengangkut kayu ke lokasi", "Mengangkat tiang utama bersama-sama", "Merayakan pesta adat rumah selesai"],
      },
      explanation: "Kayu ulin (Eusideroxylon zwageri) sangat keras dan tahan lama sehingga menjadi pilihan utama; pembangunan dilakukan gotong royong dan ditutup pesta adat.",
    },
    {
      question_type: "matching",
      prompt: "Cocokkan istilah budaya Dayak Kalimantan dengan maknanya:",
      options: {
        lefts: ["Ulin", "Hudoq", "Sape'", "Tiwah"],
        rights: ["Kayu besi khas Kalimantan yang sangat keras", "Topeng ritual tari penanaman Dayak Bahau", "Alat musik petik Dayak Kenyah", "Upacara kematian untuk mengantarkan arwah"],
      },
      correct_answer: {
        matches: {
          Ulin: "Kayu besi khas Kalimantan yang sangat keras",
          Hudoq: "Topeng ritual tari penanaman Dayak Bahau",
          "Sape'": "Alat musik petik Dayak Kenyah",
          Tiwah: "Upacara kematian untuk mengantarkan arwah",
        },
      },
      explanation: "Budaya Dayak kaya akan ritual agraris dan penghormatan leluhur — dari topeng Hudoq hingga upacara Tiwah.",
    },
  ],
  "pinisi-voyage": [
    {
      question_type: "multiple_choice",
      prompt: "Seni pembangunan kapal Pinisi secara tradisional adalah keahlian suku mana di Sulawesi Selatan?",
      options: { choices: ["Suku Konjo di Bira", "Suku Bugis di Bone", "Suku Makassar", "Suku Toraja"] },
      correct_answer: { correct: "Suku Konjo di Bira" },
      explanation: "UNESCO (2017) mencatat seni pembuatan Pinisi sebagai keahlian turun-temurun Suku Konjo di tanjung Bira, Bulukumba.",
    },
    {
      question_type: "multiple_choice",
      prompt: "Tahun berapa UNESCO menetapkan 'Pinisi, art of boatbuilding in South Sulawesi' sebagai warisan budaya takbenda?",
      options: { choices: ["2009", "2012", "2017", "2021"] },
      correct_answer: { correct: "2017" },
      explanation: "Pinisi masuk Representative List UNESCO pada 2017, melengkapi daftar warisan takbenda Indonesia.",
    },
    {
      question_type: "sequencing",
      prompt: "Urutkan tahapan tradisional pembangunan Pinisi di Bira:",
      options: {
        events: ["Memilih dan menebang kayu di hutan", "Meletakkan lunas kapal dengan ritual", "Merakit lambung, geladak, dan tiang", "Meluncurkan kapal dengan pesta adat"],
      },
      correct_answer: {
        order: ["Memilih dan menebang kayu di hutan", "Meletakkan lunas kapal dengan ritual", "Merakit lambung, geladak, dan tiang", "Meluncurkan kapal dengan pesta adat"],
      },
      explanation: "Pembangunan Pinisi disertai ritual pada setiap tahap penting — dari pemilihan kayu hingga peluncuran kapal.",
    },
  ],
  "subak-wisdom": [
    {
      question_type: "multiple_choice",
      prompt: "Subak yang menjadi Warisan Dunia UNESCO 2012 adalah sistem untuk apa?",
      options: { choices: ["Irigasi sawah", "Penangkapan ikan", "Tata kota keraton", "Pembuatan batik"] },
      correct_answer: { correct: "Irigasi sawah" },
      explanation: "Subak adalah sistem irigasi sawah Bali yang mengalirkan air secara adil dan demokratis, diakui UNESCO sebagai Cultural Landscape 2012.",
    },
    {
      question_type: "multiple_choice",
      prompt: "Keputusan air dalam Subak dirundingkan oleh anggota komunitas di tempat yang disebut:",
      options: { choices: ["Pura subak (temple)", "Balai desa", "Kantor camat", "Keraton"] },
      correct_answer: { correct: "Pura subak (temple)" },
      explanation: "Keputusan Subak diambil musyawarah oleh petani (krama subak) dan dilekatkan pada pura sebagai pusat kegiatan komunitas.",
    },
    {
      question_type: "matching",
      prompt: "Cocokkan tradisi Bali dengan deskripsinya:",
      options: {
        lefts: ["Subak", "Nyepi", "Ogoh-ogoh", "Canang Sari"],
        rights: ["Sistem irigasi demokratis khas Bali", "Hari raya keheningan sejagat di Bali", "Patung raksasa yang diparadakan jelang Nyepi", "Persembahan harian berbentuk persegi dari daun kelapa"],
      },
      correct_answer: {
        matches: {
          Subak: "Sistem irigasi demokratis khas Bali",
          Nyepi: "Hari raya keheningan sejagat di Bali",
          "Ogoh-ogoh": "Patung raksasa yang diparadakan jelang Nyepi",
          "Canang Sari": "Persembahan harian berbentuk persegi dari daun kelapa",
        },
      },
      explanation: "Canang sari adalah persembahan harian umat Hindu Bali sebagai ungkapan syukur, berisi bunga, hasil bumi, dan dupa.",
    },
  ],
  "tenun-sumba": [
    {
      question_type: "multiple_choice",
      prompt: "Kain Hinggi yang terkenal dengan motif kuda dan ular adalah tenun ikat khas dari pulau mana?",
      options: { choices: ["Sumba", "Flores", "Lombok", "Sumbawa"] },
      correct_answer: { correct: "Sumba" },
      explanation: "Hinggi adalah kain tenun ikat khas Sumba, Nusa Tenggara Timur, dengan motif kuda, ular, rusa, dan lambang status sosial.",
    },
    {
      question_type: "sequencing",
      prompt: "Urutkan proses membuat tenun ikat Hinggi dari awal:",
      options: {
        events: ["Menyisir dan memintal kapas menjadi benang", "Mengikat benang sesuai motif yang diinginkan", "Mewarnai benang dengan pewarna alami", "Melepas ikatan dan menenun benang di alat tenun"],
      },
      correct_answer: {
        order: ["Menyisir dan memintal kapas menjadi benang", "Mengikat benang sesuai motif yang diinginkan", "Mewarnai benang dengan pewarna alami", "Melepas ikatan dan menenun benang di alat tenun"],
      },
      explanation: "Prinsip tenun ikat: bagian yang diikat tetap menahan warna, sehingga pola muncul setelah pewarnaan dan ikatan dilepas.",
    },
    {
      question_type: "multiple_choice",
      prompt: "Warna merah khas tenun Sumba diperoleh dari pewarna alami apa?",
      options: { choices: ["Akar mengkudu", "Daun indigo", "Rimpang kunyit", "Kayu secang"] },
      correct_answer: { correct: "Akar mengkudu" },
      explanation: "Akar mengkudu (Morinda citrifolia) memberi merah tua khas tenun Sumba; daun indigo memberi biru, kunyit memberi kuning.",
    },
  ],
  "sasi-maluku": [
    {
      question_type: "multiple_choice",
      prompt: "Apa itu tradisi Sasi yang hidup di Maluku?",
      options: {
        choices: [
          "Larangan memanen sementara demi kelestarian alam",
          "Upacara pernikahan adat",
          "Tari perang antar desa",
          "Senjata tradisional Maluku",
        ],
      },
      correct_answer: { correct: "Larangan memanen sementara demi kelestarian alam" },
      explanation: "Sasi adalah kearifan lokal konservasi: menutup akses panen (laut, sago, buah) untuk jangka waktu tertentu agar alam pulih.",
    },
    {
      question_type: "multiple_choice",
      prompt: "Kepulauan Banda di Maluku dijuluki sebagai pusat rempah dunia karena menghasilkan:",
      options: { choices: ["Cengkih dan pala", "Kopi dan teh", "Kelapa dan kakao", "Vanila dan nila"] },
      correct_answer: { correct: "Cengkih dan pala" },
      explanation: "Kepulauan Banda adalah satu-satunya sumber pala dunia hingga abad ke-18; cengkih dari Maluku Utara dan Banda memicu perdagangan rempah global.",
    },
    {
      question_type: "matching",
      prompt: "Cocokkan ikon Maluku dengan deskripsinya:",
      options: {
        lefts: ["Sasi", "Cakalele", "Benteng Belgica", "Buah Pala"],
        rights: ["Larangan panen demi kelestarian", "Tari perang khas Maluku", "Benteng era rempah di Banda Neira", "Rempah yang membuat bangsa Eropa berlayar ke Maluku"],
      },
      correct_answer: {
        matches: {
          Sasi: "Larangan panen demi kelestarian",
          Cakalele: "Tari perang khas Maluku",
          "Benteng Belgica": "Benteng era rempah di Banda Neira",
          "Buah Pala": "Rempah yang membuat bangsa Eropa berlayar ke Maluku",
        },
      },
      explanation: "Benteng Belgica dibangun VOC pada 1611 dan kini menjadi Warisan Dunia UNESCO (2023) bersama kawasan Banda sebagai jaringan kota perdagangan rempah.",
    },
  ],
  "noken-weaver": [
    {
      question_type: "multiple_choice",
      prompt: "Noken, tas anyaman yang masuk UNESCO 2012, adalah warisan dari wilayah mana?",
      options: { choices: ["Papua", "Maluku", "Nusa Tenggara Timur", "Kalimantan"] },
      correct_answer: { correct: "Papua" },
      explanation: "Noken adalah tas anyaman multifungsi khas Papua; UNESCO menempatkannya pada Daftar yang Memerlukan Pengamanan Segera (Urgent Safeguarding List) 2012.",
    },
    {
      question_type: "multiple_choice",
      prompt: "Bahan utama Noken yang diambil dari serat kulit batang adalah pohon:",
      options: { choices: ["Gnetum (gembu/fungku)", "Bambu", "Nipah", "Kelapa"] },
      correct_answer: { correct: "Gnetum (gembu/fungku)" },
      explanation: "Menurut deskripsi UNESCO, Noken dianyam dari serat kayu batang pohon Gnetum (dikenal sebagai fungku/fungu atau gembu) dan daun pandan.",
    },
    {
      question_type: "multiple_choice",
      prompt: "Nilai kehidupan yang paling dijunjung dalam tradisi Noken bagi masyarakat Papua adalah:",
      options: { choices: ["Gotong royong dan simbol kelahiran/pertumbuhan", "Kekuatan tempur", "Kekayaan material", "Bahan bangunan rumah"] },
      correct_answer: { correct: "Gotong royong dan simbol kelahiran/pertumbuhan" },
      explanation: "Noken melambangkan lingkaran hidup dan kebersamaan; ia dipakai membawa hasil kebun, bayi, dan hadiah — sering dipegang dengan menggigit tali saat kedua tangan sibuk.",
    },
  ],
};

/* ========================================================================== *
 * 3. KONTEN BUDAYA JAWA BARU (9) — 3 per wilayah, foto Commons terverifikasi
 * ========================================================================== */
const CONTENTS = [
  {
    region: "jawa-tengah",
    title: "Batik Tulis: Sabda dalam Kain",
    description: "Tradisi menghias kain dengan lilin dan canting yang diakui UNESCO pada 2 Oktober 2009.",
    content_type: "tradition",
    body: "Membatik adalah percakapan panjang antara tangan, lilin, dan kain. Pola digambar dengan canting berisi malam (lilin panas), kain dicelup, lalu lilin dilelehkan — bagian yang tertutup lilin tetap putih, membentuk motif yang tidak mungkin persis sama dua kali.\n\nPada 2 Oktober 2009 UNESCO menetapkan batik Indonesia sebagai warisan budaya takbenda, dan tanggal itu kini diperingati sebagai Hari Batik Nasional. Motif punya tata pakem: Parang hanya layak dipakai keluarga keraton, Mega Mendung Cirebon menenangkan dengan gradasi biru, dan motif Sekar Jagad merayakan keindahan dunia yang beragam.\n\nTrusmi di Cirebon dan Laweyan di Solo adalah contoh kampung batik yang hidup sampai hari ini — bukan museum, tetapi dapur ekonomi kreatif rakyat.",
    media_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/62/Batik_Artisan_Applying_Wax_with_Canting_in_Trusmi_Cirebon_Indonesia.jpg/1280px-Batik_Artisan_Applying_Wax_with_Canting_in_Trusmi_Cirebon_Indonesia.jpg",
    media_type: "image",
  },
  {
    region: "jawa-tengah",
    title: "Sekaten: Rihlah Keraton Menyambut Maulid",
    description: "Pekan rakyat gamelan raksasa di alun-alun yang telah berusia lebih dari lima abad.",
    content_type: "tradition",
    body: "Sekaten berasal dari kata syahadatain — dua kalimat syahadat. Sejak masa Sultan Trenggono di Kesultanan Demak, gamelan raksasa Keraton (Kyai Guntur Sari dan Kyai Guntur Madu) dibunyikan di masjid dan alun-alun untuk menarik hati rakyat mendengarkan cerita Maulid Nabi.\n\nSeiring waktu, iringan gamelan sekaten berkembang menjadi pekan rakyat: pasar malam, mainan tradisional, dan kirab gunungan. Di Surakarta dan Yogyakarta, Sekaten masih digelar setiap menjelang Maulid Nabi.\n\nSekaten adalah contoh langka dakwah yang melahirkan pesta rakyat — budaya menyambung agama dan kegembiraan warga selama lebih dari 500 tahun.",
    media_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/89/Sekaten_Surakarta_2011.JPG/1280px-Sekaten_Surakarta_2011.JPG",
    media_type: "image",
  },
  {
    region: "jawa-tengah",
    title: "Gudeg: Manis yang Dihidupkan Semalaman",
    description: "Nangka muda yang direbus santan semalaman — kuliner khas Yogyakarta–Solo yang lahir dari dapur keraton.",
    content_type: "practice",
    body: "Gudeg dibuat dari nangka muda yang direbus bersama santan dan areh hingga lembut berwarna cokelat kemerahan. Rahasianya adalah waktu: dapur gudeg menyala semalaman, karena rasa manisnya tidak bisa dipercepat.\n\nSebagai kota keraton, Yogyakarta dan Solo mengembangkan gudeg menjadi hidangan khas dengan krecek (kulit sapi kriuk), telur, dan ayam kampung. Gudeg Wijilan dan gudeg Yu Djum adalah beberapa legenda dapurnya.\n\nGudeg mengajarkan kesabaran: makanan terbaik tidak diburu-buru — nilai yang sama dengan memelihara budaya itu sendiri.",
    media_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/31/Nasi_Gudeg.jpg/1280px-Nasi_Gudeg.jpg",
    media_type: "image",
  },
  {
    region: "jawa-barat",
    title: "Angklung: Bambu yang Mengajarkan Kebersamaan",
    description: "Instrumen bambu dua nada yang hanya bernyanyi penuh bila dimainkan bersama — UNESCO 2010.",
    content_type: "tradition",
    body: "Angklung terbuat dari bambu yang dipasang pada rangka; satu angklung hanya menghasilkan satu nada. Karena itu tidak ada angklung yang berdiri sendiri — melodinya lahir dari pemain yang saling mendengarkan dan bergantian memukul.\n\nDi tangan Daeng Soetigna (1955), angklung yang dulu terikat laras salendro-pelog dimodernisasi menjadi laras diatonis sehingga bisa bermain musik dunia. Pada 18 November 2010 UNESCO menetapkan angklung sebagai warisan budaya takbenda Indonesia.\n\nKonsert angklung Saung Angklung Udjo di Bandung membuktikan filosofinya: ribuan penonton yang tak saling kenal bisa membentuk orkestra dalam hitungan menit — kebersamaan yang bisa didengar.",
    media_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/71/Angklung_del_Museu_de_la_M%C3%BAsica_de_Barcelona.jpg/1280px-Angklung_del_Museu_de_la_M%C3%BAsica_de_Barcelona.jpg",
    media_type: "image",
  },
  {
    region: "jawa-barat",
    title: "Degung: Ansambel Sunda untuk Menyambut Tamu",
    description: "Karawitan Sunda yang lembut — dulu musik keraton, kini simbol keramahan Sunda.",
    content_type: "practice",
    body: "Degung adalah ansambel karawitan Sunda yang dulu dimainkan di lingkungan kabupaten dan keraton sebagai musik penyambutan tamu kehormatan. Bentuk klasiknya (degung kawih dan degung bonang) memakai saron, bonang, jengglong, goong, dan kendang dengan lagu-lagu seperti Srambahan dan Pakempalan.\n\nNada Sunda terdengar lebih lembut dan terbuka dibanding gamelan Jawa — sering dikaitkan dengan udara pegunungan Parahyangan. Kini degung berkembang menjadi gamelan degung modern yang tampil dalam acara resmi pemerintah Jawa Barat.\n\nMendengarkan degung adalah latihan merasa: musik Sunda mengajarkan halus budi bahasa dalam setiap dentingnya.",
    media_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8b/165_Museu_de_la_M%C3%BAsica%2C_gamelan.jpg/1280px-165_Museu_de_la_M%C3%BAsica%2C_gamelan.jpg",
    media_type: "image",
  },
  {
    region: "jawa-barat",
    title: "Tari Merak: Anggunnya Burung Surga Pasundan",
    description: "Tari kreasi Raden Tjetjep Somantri yang menirukan hidup burung merak — kini wajah keramahan Sunda.",
    content_type: "tradition",
    body: "Tari Merak digubah Raden Tjetjep Somantri sekitar tahun 1950-an. Penari mengenakan bebet (kipas) di punggung dan mahkota berbentuk kepala merak, menirukan hidupnya: berjalan gersang saat mencari makan, mengikat rambut (ngarawit), hingga berputar menata bulu (ngibul).\n\nGerakannya bertumpu pada keanggunan tangan dan leher — dibalut kain kebaya dan selendang kuning-hijau mencolok seperti bulu merak jantan. Tari Merak kini kerap dibawakan menyambut tamu kehormatan di Jawa Barat.\n\nDari panggung sanggar Bandung hingga pembukaan acara internasional, Tari Merak membawa pesan sederhana: keramahan bisa ditari.",
    media_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a0/Tari_Merak.jpg/1280px-Tari_Merak.jpg",
    media_type: "image",
  },
  {
    region: "yogyakarta",
    title: "Kraton Yogyakarta: Jantung Penghidupan Budaya",
    description: "Keraton yang hidup — pusat tradisi, gamelan, dan tata nilai Ngayogyakarta Hadiningrat.",
    content_type: "practice",
    body: "Kraton Ngayogyakarta Hadiningrat bukan museum melainkan rumah hidup: di dalamnya gamelan Kyai Nagawilaga dibunyikan, tari golek dilatih, dan pepoyangan (meditasi kebesaran) dijalankan pada hari-hari tertentu.\n\nDibangun sejak 1755 setelah Perjanjian Giyanti, tata ruangnya mengikuti filosofi kosmologi Jawa: dari Panggung Krapyak di selatan, Kembang Warisan, hingga Gunung Merapi di utara — poros hidup manusia, alam, dan Sang Pencipta.\n\nSri Sultan Hamengku Buwono X masih menetap sebagai gubernur, menjadikan Yogyakarta satu-satunya provinsi dengan istana yang aktif memelihara tradisi sehari-hari — bukan sekadar tontonan wisata.",
    media_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9e/Yogyakarta_Indonesia_Kraton-the-Sultans-Palace-02.jpg/1280px-Yogyakarta_Indonesia_Kraton-the-Sultans-Palace-02.jpg",
    media_type: "image",
  },
  {
    region: "yogyakarta",
    title: "Sendratari Ramayana Prambanan",
    description: "Epik Rama-Sinta yang dipentaskan dengan latar Candi Prambanan sejak 1961.",
    content_type: "story",
    body: "Pertunjukan Sendratari Ramayana pertama digelar pada 1961 di panggung terbuka Candi Prambanan — kompleks candi Hindu terbesar Indonesia yang dibangun sekitar abad ke-9. Kisahnya diambil dari kakawin Ramayana: Rama mengejar Sinta yang diculik Rahwana hingga Alengka, dengan bantuan bala kera Hanuman.\n\nYang membedakan dari wayang adalah bentuknya: penari bergerak dengan dialog tarilelet (tari berdialog) tanpa tokoh punakawan, diiringi gamelan dan pesindhen.\n\nPanggung Trimurti dengan candi sebagai latar alami menjadikannya salah satu pertunjukan epik paling ikonik di Asia — bukti cerita kuno bisa terus dihidupkan generasi muda.",
    media_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a7/Ramayana_Ballet_Prambanan_objek_Perbincangan_Rama_dan_Shinta.jpg/1280px-Ramayana_Ballet_Prambanan_objek_Perbincangan_Rama_dan_Shinta.jpg",
    media_type: "image",
  },
  {
    region: "yogyakarta",
    title: "Keris: Pusaka yang Menjaga Nilai",
    description: "Senjata tikam berpamor yang diakui UNESCO 2008 — benda pusaka, karya seni, dan simbol martabat.",
    content_type: "artifact",
    body: "Keris adalah senjata tikam asimetris dengan bilah bergelombang atau lurus yang dibentuk melalui pamor — lapisan logam besi dan pamor yang memunculkan pola seperti awan, lirihan air, atau bunga. Setiap pola punya nama dan makna.\n\nUNESCO menetapkan Indonesian Kris sebagai warisan budaya takbenda pada 2008, menekankan bahwa keris bukan sekadar senjata: ia adalah artefak spiritual yang dipakai dalam upacara adat, diwariskan antargenerasi, dan dipercaya memiliki 'isi' atau kekuatan.\n\nEmpak keris (pegangan) hingga warangka (sarung) menunjukkan keindahan ukir Jawa. Kini keris dikenakan sebagai bagian busana adat dan diperlakukan sebagai karya seni yang menuntut keahlian empu.",
    media_url: "https://upload.wikimedia.org/wikipedia/commons/9/9c/Kris_bali.jpg",
    media_type: "image",
  },
];

/* ========================================================================== *
 * 4. ARTEFAK BARU (12) — 1+ per wilayah baru
 * ========================================================================== */
const ARTIFACTS = [
  { region: "aceh", name: "Rencong", description: "Senjata tikar bermata melengkung khas Aceh — simbol adab dan keberanian, gagangnya melengkung mengikuti ketupat tangan.", rarity: "legendary", image_url: "https://upload.wikimedia.org/wikipedia/commons/1/1f/COLLECTIE_TROPENMUSEUM_Dolk_%28rencong%29_met_rechthoekig_gebogen_hoornen_greep_en_houten_schede_TMnr_17-5.jpg" },
  { region: "sumatera-barat", name: "Talempong Ungku", description: "Ketuk empat Perpaduan piringan kecil dari Minangkabau yang dimainkan dalam ansambel untuk menyambut tamu dan mengiringi tarian.", rarity: "rare", image_url: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Talempong.jpg" },
  { region: "jakarta", name: "Ondel-Ondel Betawi", description: "Boneka raksasa wajah merah-hijau dari bambu dan kain yang dipercaya mengusir bala dalam karnaval rakyat Betawi.", rarity: "uncommon", image_url: "https://upload.wikimedia.org/wikipedia/commons/3/33/Ondel_Ondel.jpg" },
  { region: "kalimantan", name: "Mandau Dayak", description: "Golok pendek khas Dayak dengan gagang kayu ulin dan khasnya mata tajam — simbol keberanian pemburu dan pelindung desa.", rarity: "rare", image_url: null },
  { region: "sulawesi-selatan", name: "Miniatur Pinisi Bira", description: "Model kapal Pinisi buatan tukang kayu Konjo — pengingat bahwa pengetahuan maritim bisa menjadi Warisan Dunia UNESCO.", rarity: "legendary", image_url: "https://upload.wikimedia.org/wikipedia/commons/4/45/Kapal_Pinisi_Pelabuhan_Sunda_Kelapa.jpg" },
  { region: "bali", name: "Canang Sari", description: "Persembahan harian Hindu Bali dari daun kelapa muda, bunga, dan dupa — ungkapan syukur atas kehidupan.", rarity: "common", image_url: null },
  { region: "nusa-tenggara-timur", name: "Kain Hinggi Sumba", description: "Tenun ikat merah-kebiruan dengan motif kuda, ular, dan pohon kehidupan — lambang status dan keagungan Sumba.", rarity: "rare", image_url: null },
  { region: "maluku", name: "Salawaku", description: "Perisai panjang dari kayu keras yang dipakai dalam Tari Cakalele — pelindung tubuh sekaligus lambang keberanian Maluku.", rarity: "uncommon", image_url: null },
  { region: "papua", name: "Noken Anyam Papua", description: "Tas anyaman serat kulit batang Gnetum yang dipakai membawa hasil kebun, bayi, dan hadiah — warisan UNESCO 2012.", rarity: "legendary", image_url: null },
  { region: "yogyakarta", name: "Keris Pusaka", description: "Keris berpamor khas Jawa dengan empak dan warangka ukir — pusaka yang diwariskan antar generasi keraton.", rarity: "rare", image_url: "https://upload.wikimedia.org/wikipedia/commons/9/9c/Kris_bali.jpg" },
  { region: "jawa-tengah", name: "Canting Pembatik", description: "Alat tulis lilin dengan wadah kecil dan pipa tipis — penyebab lahirnya motif batik yang tak mungkin tergantikan mesin.", rarity: "uncommon", image_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/62/Batik_Artisan_Applying_Wax_with_Canting_in_Trusmi_Cirebon_Indonesia.jpg/1280px-Batik_Artisan_Applying_Wax_with_Canting_in_Trusmi_Cirebon_Indonesia.jpg" },
  { region: "jawa-barat", name: "Angklung Miniatur", description: "Angklung satu nada berbambu hitam — simbol kebersamaan yang hanya bernyanyi bila dimainkan bersama.", rarity: "uncommon", image_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/71/Angklung_del_Museu_de_la_M%C3%BAsica_de_Barcelona.jpg/1280px-Angklung_del_Museu_de_la_M%C3%BAsica_de_Barcelona.jpg" },
];

/* ========================================================================== *
 * 5. ACHIEVEMENT BARU (kriteria yang didukung evaluator attempts route)
 * ========================================================================== */
const ACHIEVEMENTS = [
  { slug: "saman-serempak", title: "Sang Penari Saman", description: "Selesaikan misi Saman Harmony", icon: "🤝", criteria: { type: "mission_complete", mission_slug: "saman-harmony" }, xp_bonus: 100 },
  { slug: "pelayar-pinisi", title: "Nakhoda Pinisi", description: "Selesaikan misi Pinisi Voyage", icon: "⛵", criteria: { type: "mission_complete", mission_slug: "pinisi-voyage" }, xp_bonus: 150 },
  { slug: "petani-subak", title: "Penjaga Subak", description: "Selesaikan misi Subak Wisdom", icon: "🌾", criteria: { type: "mission_complete", mission_slug: "subak-wisdom" }, xp_bonus: 100 },
  { slug: "penjelajah-nusantara", title: "Penjelajah Nusantara", description: "Selesaikan 6 misi budaya", icon: "🗺️", criteria: { type: "mission_complete_total", count: 6 }, xp_bonus: 200 },
  { slug: "maestro-nusantara", title: "Maestro Nusantara", description: "Selesaikan 12 misi budaya", icon: "🏆", criteria: { type: "mission_complete_total", count: 12 }, xp_bonus: 300 },
];

/* ========================================================================== *
 * 6. ARTIKEL ENSIKLOPEDIA — diparse dari supabase/seed-encyclopedia-articles.sql
 * ========================================================================== */
function parseArticleSql() {
  const root = dirname(fileURLToPath(import.meta.url));
  const sql = readFileSync(join(root, "..", "supabase", "seed-encyclopedia-articles.sql"), "utf8");
  const start = sql.toLowerCase().indexOf("values") + "values".length;
  // The articles INSERT ends with "on conflict (slug) do nothing;". Cut there
  // so later INSERT statements (regions/categories/sources) are not parsed.
  const endMatch = /[\r\n]\s*on conflict[\s\S]*$/.exec(sql.slice(start));
  if (!endMatch) throw new Error("Parse artikel: penutup INSERT tidak ditemukan");
  const end = start + endMatch.index;
  const chunk = sql.slice(start, end);

  // Split top-level tuples: they begin with "( \n" and end with ")," or ")"
  const tuples = [];
  let depth = 0, cur = "", inStr = false;
  for (let i = 0; i < chunk.length; i++) {
    const ch = chunk[i];
    if (inStr) {
      cur += ch;
      if (ch === "'") {
        if (chunk[i + 1] === "'") { cur += "'"; i++; }
        else inStr = false;
      }
      continue;
    }
    if (ch === "'") { inStr = true; cur += ch; continue; }
    if (ch === "(") { depth++; if (depth === 1) { cur = ""; continue; } }
    if (ch === ")") { depth--; if (depth === 0) { tuples.push(cur); cur = ""; continue; } }
    if (depth >= 1) cur += ch;
  }

  /** Convert a PostgreSQL text[] literal like {"Batik","Kain batik"} to a JS array. */
  const parsePgArray = (s) => {
    if (!s.startsWith("{")) return JSON.parse(s);
    const inner = s.slice(1, -1);
    const parts = [];
    let cur = "", inQ = false;
    for (let i = 0; i < inner.length; i++) {
      const ch = inner[i];
      if (inQ) {
        if (ch === '"' && inner[i + 1] === '"') { cur += '\\"'; i++; }
        else if (ch === '"') inQ = false;
        else cur += ch;
      } else if (ch === '"') inQ = true;
      else if (ch === ",") { parts.push(cur); cur = ""; }
      else cur += ch;
    }
    parts.push(cur);
    return parts.filter((p) => p !== "");
  };

  const rows = [];
  for (const t of tuples) {
    // Split fields on top-level commas outside strings
    const fields = [];
    let field = "", str = false;
    for (let i = 0; i < t.length; i++) {
      const ch = t[i];
      if (str) {
        field += ch;
        if (ch === "'") {
          if (t[i + 1] === "'") { field += "'"; i++; }
          else str = false;
        }
        continue;
      }
      if (ch === "'") { str = true; field += ch; continue; }
      if (ch === ",") { fields.push(field.trim()); field = ""; continue; }
      field += ch;
    }
    fields.push(field.trim());

    if (fields.length !== 16) {
      throw new Error(`Parse artikel: ditemukan ${fields.length} field (harus 16): ${fields[0]}`);
    }
    const unq = (s) => (s.startsWith("'") && s.endsWith("'") ? s.slice(1, -1) : s);
    rows.push({
      slug: unq(fields[0]),
      title: unq(fields[1]),
      summary: unq(fields[2]),
      body: unq(fields[3]),
      background: unq(fields[4]),
      historical_context: unq(fields[5]),
      cultural_meaning: unq(fields[6]),
      characteristics: unq(fields[7]),
      social_function: unq(fields[8]),
      practices: unq(fields[9]),
      preservation: unq(fields[10]),
      verified_facts: JSON.parse(unq(fields[11])),
      alternative_names: parsePgArray(unq(fields[12])),
      featured: fields[13] === "true",
      status: unq(fields[14]),
      published_at: new Date().toISOString(),
    });
  }
  if (rows.length !== 18) throw new Error(`Parse artikel: ditemukan ${rows.length} artikel (harus 18)`);
  return rows;
}

const ARTICLE_REGIONS = {
  "batik-indonesia": ["jawa-tengah", "yogyakarta", "jawa-barat"],
  "gamelan-jawa": ["jawa-barat", "jawa-tengah", "yogyakarta"],
  "wayang-kulit": ["yogyakarta", "jawa-tengah"],
  "tari-saman": ["aceh"],
  randai: ["sumatera-barat"],
  "ondel-ondel": ["jakarta"],
  "rumah-betang": ["kalimantan"],
  pinisi: ["sulawesi-selatan"],
  subak: ["bali"],
  "tenun-ikat": ["nusa-tenggara-timur"],
  "sasi-maluku": ["maluku"],
  noken: ["papua"],
  "pencak-silat": ["jawa-barat", "jawa-tengah"],
  angklung: ["jawa-barat"],
  keris: ["yogyakarta", "jawa-tengah", "bali"],
  jamu: ["jawa-tengah", "yogyakarta"],
  pantun: ["sumatera-barat", "jakarta"],
  "tari-kecak": ["bali"],
};

const ARTICLE_CATEGORIES = {
  "batik-indonesia": ["kerajinan-batik", "pakaian-adat", "sejarah-warisan"],
  "gamelan-jawa": ["musik-alat-musik", "seni-pertunjukan"],
  "wayang-kulit": ["seni-pertunjukan", "cerita-mitologi"],
  "tari-saman": ["tari-tradisional", "seni-pertunjukan"],
  randai: ["seni-pertunjukan", "bahasa-sastra"],
  "ondel-ondel": ["seni-pertunjukan", "upacara-tradisi"],
  "rumah-betang": ["rumah-arsitektur"],
  pinisi: ["sejarah-warisan", "pengetahuan-tradisional"],
  subak: ["kearifan-lokal", "pengetahuan-tradisional"],
  "tenun-ikat": ["pakaian-adat", "sejarah-warisan"],
  "sasi-maluku": ["kearifan-lokal", "upacara-tradisi"],
  noken: ["kearifan-lokal", "pengetahuan-tradisional"],
  "pencak-silat": ["seni-pertunjukan", "kearifan-lokal"],
  angklung: ["musik-alat-musik", "seni-pertunjukan"],
  keris: ["sejarah-warisan", "kearifan-lokal"],
  jamu: ["pengetahuan-tradisional", "kearifan-lokal"],
  pantun: ["bahasa-sastra", "upacara-tradisi"],
  "tari-kecak": ["tari-tradisional", "seni-pertunjukan"],
};

const ARTICLE_SOURCES = {
  "batik-indonesia": [
    { source_title: "Indonesian Batik — UNESCO ICH", publisher: "UNESCO", source_url: "https://ich.unesco.org/en/RL/indonesian-batik-00170", source_type: "documented_fact" },
    { source_title: "Batik — Wikipedia bahasa Indonesia", publisher: "Wikipedia", source_url: "https://id.wikipedia.org/wiki/Batik", source_type: "community_perspective" },
  ],
  "gamelan-jawa": [
    { source_title: "Gamelan — UNESCO ICH", publisher: "UNESCO", source_url: "https://ich.unesco.org/en/RL/gamelan-01607", source_type: "documented_fact" },
    { source_title: "Gamelan — Wikipedia bahasa Indonesia", publisher: "Wikipedia", source_url: "https://id.wikipedia.org/wiki/Gamelan", source_type: "community_perspective" },
  ],
  "wayang-kulit": [
    { source_title: "Wayang Puppet Theatre — UNESCO ICH", publisher: "UNESCO", source_url: "https://ich.unesco.org/en/RL/wayang-puppet-theatre-00063", source_type: "documented_fact" },
  ],
  "tari-saman": [
    { source_title: "Saman dance — UNESCO ICH (Urgent Safeguarding List)", publisher: "UNESCO", source_url: "https://ich.unesco.org/en/USL/saman-dance-00509", source_type: "documented_fact" },
  ],
  randai: [
    { source_title: "Randai — Wikipedia bahasa Indonesia", publisher: "Wikipedia", source_url: "https://id.wikipedia.org/wiki/Randai", source_type: "documented_fact" },
  ],
  "ondel-ondel": [
    { source_title: "Ondel-ondel — Wikipedia bahasa Indonesia", publisher: "Wikipedia", source_url: "https://id.wikipedia.org/wiki/Ondel-ondel", source_type: "documented_fact" },
  ],
  "rumah-betang": [
    { source_title: "Rumah panjang — Wikipedia bahasa Indonesia", publisher: "Wikipedia", source_url: "https://id.wikipedia.org/wiki/Rumah_panjang", source_type: "documented_fact" },
  ],
  pinisi: [
    { source_title: "Pinisi, art of boatbuilding in South Sulawesi — UNESCO ICH", publisher: "UNESCO", source_url: "https://ich.unesco.org/en/RL/pinisi-art-of-boatbuilding-in-south-sulawesi-01197", source_type: "documented_fact" },
  ],
  subak: [
    { source_title: "Cultural Landscape of Bali Province: the Subak System — UNESCO WHC", publisher: "UNESCO", source_url: "https://whc.unesco.org/en/list/1194", source_type: "documented_fact" },
  ],
  "tenun-ikat": [
    { source_title: "Tenun ikat — Wikipedia bahasa Indonesia", publisher: "Wikipedia", source_url: "https://id.wikipedia.org/wiki/Tenun_ikat", source_type: "documented_fact" },
    { source_title: "Kain Hinggi Sumba — Cleveland Museum of Art", publisher: "Cleveland Museum of Art", source_url: "https://www.clevelandart.org/art/1925.490", source_type: "academic_interpretation" },
  ],
  "sasi-maluku": [
    { source_title: "Sasi — Wikipedia bahasa Indonesia", publisher: "Wikipedia", source_url: "https://id.wikipedia.org/wiki/Sasi", source_type: "documented_fact" },
  ],
  noken: [
    { source_title: "Noken multifunctional knotted or woven bag — UNESCO ICH (USL)", publisher: "UNESCO", source_url: "https://ich.unesco.org/en/USL/noken-multifunctional-knotted-or-woven-bag-handcraft-of-the-people-of-papua-00619", source_type: "documented_fact" },
  ],
  "pencak-silat": [
    { source_title: "Traditions of Pencak Silat — UNESCO ICH", publisher: "UNESCO", source_url: "https://ich.unesco.org/en/RL/traditions-of-pencak-silat-01391", source_type: "documented_fact" },
  ],
  angklung: [
    { source_title: "Indonesian Angklung — UNESCO ICH", publisher: "UNESCO", source_url: "https://ich.unesco.org/en/RL/indonesian-angklung-00393", source_type: "documented_fact" },
  ],
  keris: [
    { source_title: "Indonesian Kris — UNESCO ICH", publisher: "UNESCO", source_url: "https://ich.unesco.org/en/RL/indonesian-kris-00112", source_type: "documented_fact" },
  ],
  jamu: [
    { source_title: "Jamu wellness culture — UNESCO ICH", publisher: "UNESCO", source_url: "https://ich.unesco.org/en/state/indonesia-ID", source_type: "documented_fact" },
  ],
  pantun: [
    { source_title: "Pantun — UNESCO ICH", publisher: "UNESCO", source_url: "https://ich.unesco.org/en/state/indonesia-ID", source_type: "documented_fact" },
  ],
  "tari-kecak": [
    { source_title: "Tari kecak — Wikipedia bahasa Indonesia", publisher: "Wikipedia", source_url: "https://id.wikipedia.org/wiki/Tari_kecak", source_type: "community_perspective" },
  ],
};

/* ========================================================================== *
 * 7. MEDIA ENSIKLOPEDIA — mirror src/lib/cultural-media.ts
 *    permission_status: verified_license (Wikimedia) / external_reference (YouTube)
 * ========================================================================== */
const MEDIA = [
  { article: "gamelan-jawa", title: "Gending Gamelan Laras Slendro & Pelog", description: "Rekaman instrumen bonang, kendang, gender, dan gong ageng yang selaras dalam tata laras tradisional karawitan Jawa.", media_type: "audio", external_url: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Gamelan_degung_instruments.ogg", creator: "Wikimedia Commons", license: "CC BY-SA", attribution: "Rekaman gamelan degung — Wikimedia Commons, CC BY-SA.", permission_status: "verified_license", sort_order: 1 },
  { article: "gamelan-jawa", title: "Harmoni Ansambel Gamelan Ageng Karaton", description: "Video pertunjukan gamelan ageng lengkap dengan gong ageng dan kendang.", media_type: "video", external_url: "https://www.youtube-nocookie.com/embed/UEWCCPfT9Ds", creator: "YouTube (embed)", license: "Referensi eksternal", attribution: "Pranala referensi ke YouTube.", permission_status: "external_reference", sort_order: 2 },
  { article: "tari-kecak", title: "Vokal Akapela Ritmis Penari Kecak", description: "Rekaman vokal akapela 'cak-cak-cak' penari kecak yang ritmis.", media_type: "audio", external_url: "https://upload.wikimedia.org/wikipedia/commons/0/05/Bali_Kecak_Dance.ogg", creator: "Wikimedia Commons", license: "CC BY-SA", attribution: "Rekaman kecak — Wikimedia Commons, CC BY-SA.", permission_status: "verified_license", sort_order: 1 },
  { article: "tari-kecak", title: "Pentas Tari Kecak & Api Ramayana di Tebing Uluwatu", description: "Video pentas kecak dengan latar tebing karang Uluwatu saat matahari terbenam.", media_type: "video", external_url: "https://www.youtube-nocookie.com/embed/aZqD27a718c", creator: "YouTube (embed)", license: "Referensi eksternal", attribution: "Pranala referensi ke YouTube.", permission_status: "external_reference", sort_order: 2 },
  { article: "tari-saman", title: "Lantunan Syeh & Tepukan Dada Serempak Saman", description: "Rekaman irama syeh dan tepukan dada khas Tari Saman Gayo.", media_type: "audio", external_url: "https://upload.wikimedia.org/wikipedia/commons/8/8c/Aceh_saman_dance.ogg", creator: "Wikimedia Commons", license: "CC BY-SA", attribution: "Rekaman saman — Wikimedia Commons, CC BY-SA.", permission_status: "verified_license", sort_order: 1 },
  { article: "tari-saman", title: "Gerak Seribu Tangan Tari Saman Gayo", description: "Video pembukaan Asian Games 2018 yang menampilkan Saman.", media_type: "video", external_url: "https://www.youtube-nocookie.com/embed/nU2f5v_6dGI", creator: "YouTube (embed)", license: "Referensi eksternal", attribution: "Pranala referensi ke YouTube.", permission_status: "external_reference", sort_order: 2 },
  { article: "angklung", title: "Alunan Melodi Bambu Angklung Tradisional", description: "Rekaman melodi angklung yang dimainkan ansambel.", media_type: "audio", external_url: "https://upload.wikimedia.org/wikipedia/commons/7/77/Angklung_performance.ogg", creator: "Wikimedia Commons", license: "CC BY-SA", attribution: "Rekaman angklung — Wikimedia Commons, CC BY-SA.", permission_status: "verified_license", sort_order: 1 },
  { article: "angklung", title: "Harmoni Kolosal Musik Bambu Angklung", description: "Video pertunjukan orkestra angklung massal.", media_type: "video", external_url: "https://www.youtube-nocookie.com/embed/rK2x0b2dI08", creator: "YouTube (embed)", license: "Referensi eksternal", attribution: "Pranala referensi ke YouTube.", permission_status: "external_reference", sort_order: 2 },
  { article: "batik-indonesia", title: "Narasi Filosofi Canting dan Pola Batik Parang", description: "Rekaman narasi filosofi canting dan pola Parang.", media_type: "audio", external_url: "https://upload.wikimedia.org/wikipedia/commons/6/69/Batik_process_narration.ogg", creator: "Wikimedia Commons", license: "CC BY-SA", attribution: "Narasi batik — Wikimedia Commons, CC BY-SA.", permission_status: "verified_license", sort_order: 1 },
  { article: "batik-indonesia", title: "Proses Tradisional Membatik Tulis dengan Lilin Malam", description: "Video proses membatik tulis dari nyorek hingga nglorod.", media_type: "video", external_url: "https://www.youtube-nocookie.com/embed/5U9Tq0K87_0", creator: "YouTube (embed)", license: "Referensi eksternal", attribution: "Pranala referensi ke YouTube.", permission_status: "external_reference", sort_order: 2 },
  { article: "wayang-kulit", title: "Lantunan Suluk Dalang & Tabuhan Gender Wayang", description: "Rekaman suluk dalang dan iringan gender wayang.", media_type: "audio", external_url: "https://upload.wikimedia.org/wikipedia/commons/2/23/Wayang_kulit_suluk.ogg", creator: "Wikimedia Commons", license: "CC BY-SA", attribution: "Suluk wayang — Wikimedia Commons, CC BY-SA.", permission_status: "verified_license", sort_order: 1 },
  { article: "wayang-kulit", title: "Seni Pertunjukan Wayang Kulit Purwa Lakon Kresna Duta", description: "Video pertunjukan wayang kulit lakon Kresna Duta.", media_type: "video", external_url: "https://www.youtube-nocookie.com/embed/X9Xf11k7x-E", creator: "YouTube (embed)", license: "Referensi eksternal", attribution: "Pranala referensi ke YouTube.", permission_status: "external_reference", sort_order: 2 },
  { article: "randai", title: "Tepukan Galembong & Dendang Salawaik Randai Minang", description: "Rekaman dendang dan tepukan pengiring Randai.", media_type: "audio", external_url: "https://upload.wikimedia.org/wikipedia/commons/2/28/Minang_randai_dendang.ogg", creator: "Wikimedia Commons", license: "CC BY-SA", attribution: "Rekaman randai — Wikimedia Commons, CC BY-SA.", permission_status: "verified_license", sort_order: 1 },
  { article: "pinisi", title: "Lagu Perahu Pinisi dari Bira", description: "Rekaman lagu perahu Pinisi.", media_type: "audio", external_url: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Pinisi_boat_song.ogg", creator: "Wikimedia Commons", license: "CC BY-SA", attribution: "Rekaman pinisi — Wikimedia Commons, CC BY-SA.", permission_status: "verified_license", sort_order: 1 },
  { article: "subak", title: "Musik Rindik Irigasi Sawah Bali", description: "Rekaman musik rindik bambu Bali.", media_type: "audio", external_url: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Joged_bumbung.ogg", creator: "Wikimedia Commons", license: "CC BY-SA", attribution: "Rekaman joged bumbung — Wikimedia Commons, CC BY-SA.", permission_status: "verified_license", sort_order: 1 },
];

/* Artikel terkait (pasangan simetris) */
const RELATED_PAIRS = [
  ["batik-indonesia", "keris"],
  ["batik-indonesia", "tenun-ikat"],
  ["batik-indonesia", "jamu"],
  ["gamelan-jawa", "wayang-kulit"],
  ["gamelan-jawa", "angklung"],
  ["gamelan-jawa", "tari-kecak"],
  ["wayang-kulit", "tari-kecak"],
  ["wayang-kulit", "keris"],
  ["tari-saman", "pencak-silat"],
  ["tari-saman", "tari-kecak"],
  ["randai", "pencak-silat"],
  ["randai", "pantun"],
  ["ondel-ondel", "wayang-kulit"],
  ["subak", "tari-kecak"],
  ["sasi-maluku", "subak"],
  ["noken", "tenun-ikat"],
  ["rumah-betang", "noken"],
  ["pinisi", "keris"],
];

/* Artikel ↔ misi */
const ARTICLE_MISSIONS = [
  ["batik-indonesia", "batik-detective"],
  ["gamelan-jawa", "gamelan-maestro"],
  ["wayang-kulit", "wayang-story"],
  ["tari-saman", "saman-harmony"],
  ["randai", "randai-minang"],
  ["ondel-ondel", "ondel-ondel-guardian"],
  ["rumah-betang", "betang-heritage"],
  ["pinisi", "pinisi-voyage"],
  ["subak", "subak-wisdom"],
  ["tenun-ikat", "tenun-sumba"],
  ["sasi-maluku", "sasi-maluku"],
  ["noken", "noken-weaver"],
  ["angklung", "gamelan-maestro"],
];

/* ========================================================================== *
 * 8. KIRIMAN KOMUNITAS DEMO
 * ========================================================================== */
const SUBMISSIONS = [
  {
    submitter_name: "Rizky Ananda", submitter_email: "rizky.ananda@contoh.dev",
    title: "Kirab Budaya Grebeg Maulid di Yogyakarta",
    body: "Setiap Maulid Nabi, Kraton Yogyakarta menggelar Grebeg Maulid: gunungan hasil bumi (gunungan lanang, wadon, gepak, dan pawuhan) dikirab dari Pagelaran ke Masjid Gedhe Kauman. Setelah didoakan, gunungan diperebutkan warga yang memercayai barakahnya untuk kesuburan sawah. Sebaiknya ditambahkan ke ensiklopedia sebagai contoh tradisi keraton yang masih hidup.",
    region_slug: "yogyakarta", status: "published",
  },
  {
    submitter_name: "Siti Marlina", submitter_email: "siti.marlina@contoh.dev",
    title: "Kampung Adat Kuta: Desa yang Menolak Listrik demi Hutan",
    body: "Di Ciamis, Jawa Barat, Kampung Adat Kuta memelihara hutan leluhur (leuweung titipan) dengan larangan menebang pohon dan aturan adat yang dijaga kuncen. Menariknya, desa ini menolak listrik PLN demi menjaga keseimbangan alam. Cocok menjadi bahan artikel kearifan lokal pelestarian hutan.",
    region_slug: "jawa-barat", status: "published",
  },
  {
    submitter_name: "Budi Santoso", submitter_email: "budi.santoso@contoh.dev",
    title: "Legenda Si Tonde: Asal-Usul Nama Sibolga",
    body: "Cerita rakyat Tapanuli Tengah menceritakan bapak-bapak yang menolong pengelana dan menolak upah dengan kata 'tonde' (tidak perlu). Pengelana itu pun menamai kampungnya Sibolga. Kiriman ini menunggu verifikasi narasumber lokal sebelum diterbitkan.",
    region_slug: "sumatera-barat", status: "pending",
  },
];

/* ========================================================================== *
 * 9. AKUN DEMO
 * ========================================================================== */
const DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD ?? "LokaQuest2026!";
const DEMO_USERS = [
  { email: "admin@lokaquest.web.id", password: DEMO_PASSWORD, full_name: "Administrator LokaQuest", role: "admin" },
  { email: "guru@lokaquest.web.id", password: DEMO_PASSWORD, full_name: "Bu Sari (Guru)", role: "educator" },
  { email: "siswa@lokaquest.web.id", password: "Siswa2026!", full_name: "Andi Pratama (Siswa)", role: "player" },
  { email: "rara.wijaya@lokaquest.web.id", password: `demo-${Math.random().toString(36).slice(2)}`, full_name: "Rara Wijaya", role: "player", xp: 3250, missions_completed: 9 },
  { email: "bima.pratama@lokaquest.web.id", password: `demo-${Math.random().toString(36).slice(2)}`, full_name: "Bima Pratama", role: "player", xp: 2480, missions_completed: 7 },
  { email: "sari.dewi@lokaquest.web.id", password: `demo-${Math.random().toString(36).slice(2)}`, full_name: "Sari Dewi", role: "player", xp: 1320, missions_completed: 4 },
];

const DEMO_GROUP = {
  name: "Kelas 8B — SMP Nusantara",
  description: "Kelas demo untuk menguji fitur edukator: kode join, tugas misi, dan kuis live.",
  join_code: "LQ8B2026",
  educator_email: "guru@lokaquest.web.id",
  member_emails: ["siswa@lokaquest.web.id"],
  assignment_missions: ["batik-detective", "saman-harmony"],
};

/* ========================================================================== *
 * MAIN
 * ========================================================================== */
async function main() {
  console.log(`▶ Seeding ke ${URL_}\n`);

  /* --- 1. Sumber --- */
  console.log("1) cultural_sources");
  await insertMissing("cultural_sources", SOURCES_EXTRA, (e, r) => e.title === r.title, "sumber referensi");

  /* --- 2. Wilayah (pastikan 12 ada) --- */
  const regions = await api("cultural_regions", { query: "?select=id,slug,name" });
  const regionId = Object.fromEntries(regions.map((r) => [r.slug, r.id]));
  console.log(`2) cultural_regions: ${regions.length} wilayah tersedia`);

  /* --- 3. Misi + soal --- */
  console.log("3) missions");
  const missionRows = MISSIONS.map((m, i) => ({
    region_id: regionId[m.region],
    slug: m.slug,
    title: m.title,
    description: m.description,
    learning_objectives: m.learning_objectives,
    difficulty: m.difficulty,
    xp_reward: m.xp_reward,
    sort_order: 10 + i,
    status: "published",
  })).filter((m) => m.region_id);
  const allMissions = await insertMissing(
    "missions",
    missionRows,
    (e, r) => e.slug === r.slug,
    `${missionRows.length} misi baru`
  );
  const missionId = Object.fromEntries(allMissions.map((m) => [m.slug, m.id]));

  console.log("4) mission_questions");
  const questionRows = [];
  for (const [slug, qs] of Object.entries(QUESTIONS)) {
    const mid = missionId[slug];
    if (!mid) continue;
    qs.forEach((q, i) =>
      questionRows.push({ mission_id: mid, ...q, sort_order: i + 1 })
    );
  }
  const existingQuestions = await api("mission_questions", { query: "?select=id,mission_id,prompt" });
  const freshQ = questionRows.filter(
    (q) => !existingQuestions.some((e) => e.mission_id === q.mission_id && e.prompt === q.prompt)
  );
  if (freshQ.length) {
    await api("mission_questions", { method: "POST", body: freshQ });
    console.log(`  soal misi: +${freshQ.length} soal`);
  } else console.log("  soal misi: sudah lengkap, lewati");

  /* --- 4. Konten budaya Jawa --- */
  console.log("5) cultural_contents (wilayah Jawa)");
  const contentRows = CONTENTS.map((c, i) => ({
    region_id: regionId[c.region],
    title: c.title,
    description: c.description,
    content_type: c.content_type,
    body: c.body,
    media_url: c.media_url,
    media_type: c.media_type,
    sort_order: 10 + i,
    status: "published",
  })).filter((c) => c.region_id && c.media_url);
  await insertMissing("cultural_contents", contentRows, (e, r) => e.title === r.title, "konten budaya Jawa");

  /* --- 5. Artefak --- */
  console.log("6) cultural_artifacts");
  const artifactRows = ARTIFACTS.map((a) => ({
    region_id: regionId[a.region],
    name: a.name,
    description: a.description,
    image_url: a.image_url,
    rarity: a.rarity,
  })).filter((a) => a.region_id);
  await insertMissing("cultural_artifacts", artifactRows, (e, r) => e.name === r.name, "artefak budaya");

  /* --- 6. Achievement --- */
  console.log("7) achievements");
  await insertMissing("achievements", ACHIEVEMENTS, (e, r) => e.slug === r.slug, "achievement baru");

  /* --- 7. Artikel ensiklopedia --- */
  console.log("8) encyclopedia_articles (parse seed SQL)");
  const articles = parseArticleSql();
  const articleRows = await insertMissing(
    "encyclopedia_articles",
    articles,
    (e, r) => e.slug === r.slug,
    `${articles.length} artikel ensiklopedia`
  );
  const articleId = Object.fromEntries(articleRows.map((a) => [a.slug, a.id]));
  const publishedCount = articleRows.filter((a) => a.status === "published").length;
  console.log(`  status published: ${publishedCount}/${articleRows.length}`);

  const categories = await api("encyclopedia_categories", { query: "?select=id,slug" });
  const catId = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

  console.log("9) relasi artikel (kategori/wilayah/sumber/terkait/misi)");
  const acRows = [];
  for (const [slug, cats] of Object.entries(ARTICLE_CATEGORIES)) {
    for (const c of cats) if (articleId[slug] && catId[c]) acRows.push({ article_id: articleId[slug], category_id: catId[c] });
  }
  await insertMissing("encyclopedia_article_categories", acRows, (e, r) => e.article_id === r.article_id && e.category_id === r.category_id, "artikel↔kategori");

  const arRows = [];
  for (const [slug, slugs] of Object.entries(ARTICLE_REGIONS)) {
    for (const rs of slugs) if (articleId[slug] && regionId[rs]) arRows.push({ article_id: articleId[slug], region_id: regionId[rs] });
  }
  await insertMissing("encyclopedia_article_regions", arRows, (e, r) => e.article_id === r.article_id && e.region_id === r.region_id, "artikel↔wilayah");

  const srcRows = [];
  for (const [slug, sources] of Object.entries(ARTICLE_SOURCES)) {
    if (!articleId[slug]) continue;
    sources.forEach((s, i) => srcRows.push({ article_id: articleId[slug], ...s, sort_order: i + 1 }));
  }
  await insertMissing("encyclopedia_sources", srcRows, (e, r) => e.article_id === r.article_id && e.source_title === r.source_title, "sumber artikel");

  const relRows = [];
  for (const [a, b] of RELATED_PAIRS) {
    if (articleId[a] && articleId[b]) {
      relRows.push({ article_id: articleId[a], related_article_id: articleId[b], relation: "related_to" });
      relRows.push({ article_id: articleId[b], related_article_id: articleId[a], relation: "related_to" });
    }
  }
  await insertMissing("encyclopedia_related_articles", relRows, (e, r) => e.article_id === r.article_id && e.related_article_id === r.related_article_id, "artikel terkait");

  const amRows = [];
  for (const [slug, mslug] of ARTICLE_MISSIONS) {
    if (articleId[slug] && missionId[mslug]) amRows.push({ article_id: articleId[slug], mission_id: missionId[mslug] });
  }
  await insertMissing("encyclopedia_article_missions", amRows, (e, r) => e.article_id === r.article_id && e.mission_id === r.mission_id, "artikel↔misi");

  /* --- 8. Media ensiklopedia --- */
  console.log("10) encyclopedia_media");
  const mediaRows = MEDIA.filter((m) => articleId[m.article]).map((m) => ({
    article_id: articleId[m.article],
    title: m.title,
    description: m.description,
    media_type: m.media_type,
    external_url: m.external_url,
    creator: m.creator,
    license: m.license,
    attribution: m.attribution,
    permission_status: m.permission_status,
    status: "published",
    sort_order: m.sort_order,
  }));
  await insertMissing("encyclopedia_media", mediaRows, (e, r) => e.article_id === r.article_id && e.title === r.title, `${mediaRows.length} media kurasi`);

  /* --- 9. Knowledge graph --- */
  console.log("11) cultural_relationships (graph)");
  const contents = await api("cultural_contents", { query: "?select=id,title,region_id&status=eq.published" });
  const contentIdByTitle = Object.fromEntries(contents.map((c) => [c.title, c.id]));
  const contentRegion = Object.fromEntries(contents.map((c) => [c.id, c.region_id]));

  const edges = [];
  const seen = new Set();
  const addEdge = (source_type, source_id, target_type, target_id, relation, description) => {
    const key = `${source_type}:${source_id}|${target_type}:${target_id}|${relation}`;
    if (!source_id || !target_id || source_id === target_id || seen.has(key)) return;
    seen.add(key);
    edges.push({ source_type, source_id, target_type, target_id, relation, description });
  };

  for (const c of contents) {
    if (c.region_id) {
      addEdge("content", c.id, "region", c.region_id, "originates_from", `Praktik budaya yang berasal dari wilayah ini.`);
      addEdge("region", c.region_id, "content", c.id, "part_of", `Konten budaya milik wilayah ini.`);
    }
  }
  const artifacts = await api("cultural_artifacts", { query: "?select=id,name,region_id" });
  for (const a of artifacts) {
    if (a.region_id) {
      addEdge("artifact", a.id, "region", a.region_id, "practiced_in", `Artefak khas wilayah ini.`);
      addEdge("region", a.region_id, "artifact", a.id, "depicts", `Wilayah penghasil artefak ini.`);
    }
  }
  const CURATED_PAIRS = [
    ["Batik Tulis: Sabda dalam Kain", "Keris: Pusaka yang Menjaga Nilai", "related_to", "Keduanya pusaka keraton dengan pakem pemakaian."],
    ["Angklung: Bambu yang Mengajarkan Kebersamaan", "Degung: Ansambel Sunda untuk Menyambut Tamu", "related_to", "Ansambel musik tradisional Sunda."],
    ["Tari Saman: Irama Persaudaraan Gayo", "Tari Cakalele: Tari Perang Seram yang Menakutkan", "related_to", "Tari komunal yang menuntut keserempakan."],
    ["Pinisi: Kapal Kayu yang Menuju UNESCO", "Cengkih dan Pala: Rempah yang Mengubah Dunia", "related_to", "Kapal pinisi mengangkut rempah Maluku ke seluruh dunia."],
    ["Subak: Irigasi Bersama yang Menjelma Filosofi", "Sasi", "related_to", "Kearifan lokal pengelolaan sumber daya bersama."],
    ["Tenun Ikat Sumba: Wastra yang Bercerita", "Pasola: Festival Kuda dan Tombak di Pantai", "related_to", "Tradisi Sumba yang saling melengkapi."],
    ["Ondel-ondel: Raksasa Jalanan yang Menyambut", "Topeng Betawi: Tersembunyi di Balik Lenong", "related_to", "Kesenian Betawi dalam karnaval dan lenong."],
    ["Ukiran Asmat: Bisj Pole yang Menjelajahi Arwah", "Festival Lembah Baliem: Pesta Bumi Dani", "related_to", "Seni dan festival Papua."],
  ];
  for (const [a, b, rel, desc] of CURATED_PAIRS) {
    addEdge("content", contentIdByTitle[a], "content", contentIdByTitle[b], rel, desc);
  }
  const existingEdges = await api("cultural_relationships", { query: "?select=id,source_type,source_id,target_type,target_id,relation" });
  const freshEdges = edges.filter(
    (e) => !existingEdges.some((x) => x.source_type === e.source_type && x.source_id === e.source_id && x.target_type === e.target_type && x.target_id === e.target_id && x.relation === e.relation)
  );
  if (freshEdges.length) {
    await api("cultural_relationships", { method: "POST", body: freshEdges });
    console.log(`  relasi graph: +${freshEdges.length} edge`);
  } else console.log("  relasi graph: sudah lengkap, lewati");

  /* --- 10. Kiriman komunitas --- */
  console.log("12) community_submissions");
  const subRows = SUBMISSIONS.map((s) => ({
    ...s,
    region_id: regionId[s.region_slug] ?? null,
  }));
  await insertMissing("community_submissions", subRows, (e, r) => e.title === r.title, "kiriman komunitas demo");

  /* --- 11. Akun demo --- */
  console.log("13) akun demo (auth admin API)");
  const profiles = await api("profiles", { query: "?select=id,email,full_name,role,xp,level" });
  const profileByEmail = Object.fromEntries(profiles.map((p) => [p.email, p]));

  for (const u of DEMO_USERS) {
    if (!profileByEmail[u.email]) {
      const created = await authApi("/admin/users", {
        method: "POST",
        body: { email: u.email, password: u.password, email_confirm: true, user_metadata: { full_name: u.full_name } },
      });
      console.log(`  user dibuat: ${u.email}`);
      // Trigger handle_new_user membuat profiles row — refresh map.
      profileByEmail[u.email] = { id: created.id, email: u.email, role: u.role, xp: u.xp ?? 0 };
    }
  }

  // Set role + full_name + XP via service role (bypass RLS/revoke).
  for (const u of DEMO_USERS) {
    const p = profileByEmail[u.email];
    if (!p) continue;
    await api("profiles", {
      method: "PATCH",
      body: { role: u.role, full_name: u.full_name, ...(u.xp ? { xp: u.xp, level: Math.floor(u.xp / 500) + 1 } : {}) },
      query: `?id=eq.${p.id}`,
      prefer: "return=minimal",
    });
  }
  console.log(`  role & profil disetel untuk ${DEMO_USERS.length} akun`);

  // player_progress untuk papan peringkat
  console.log("14) player_progress (papan peringkat demo)");
  const progressRows = DEMO_USERS.filter((u) => u.xp).map((u) => ({
    profile_id: profileByEmail[u.email].id,
    total_xp: u.xp,
    missions_completed: u.missions_completed,
    current_level: Math.floor(u.xp / 500) + 1,
  }));
  await insertMissing("player_progress", progressRows, (e, r) => e.profile_id === r.profile_id, "progres pemain demo");

  /* --- 12. Kelas demo --- */
  console.log("15) kelas demo (educator)");
  // Migration feature_expansion menambahkan join_code + educator_assignments.
  // Jika belum diterapkan di database, lewati dengan peringatan.
  const spec = await fetch(`${URL_}/rest/v1/`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  }).then((r) => r.json());
  const groupCols = Object.keys(spec?.definitions?.educator_groups?.properties ?? {});
  if (!groupCols.includes("join_code")) {
    console.warn("  ⚠️  Migration 20261104000001_feature_expansion.sql belum diterapkan");
    console.warn("     (kolom educator_groups.join_code tidak ada) — kelas demo dilewati.");
    console.warn("     Terapkan migrasi lalu jalankan ulang script ini.");
  }

  const guruId = profileByEmail[DEMO_GROUP.educator_email]?.id;
  if (groupCols.includes("join_code") && guruId) {
    const groups = await api("educator_groups", { query: "?select=id,name,join_code,educator_id" });
    let group = groups.find((g) => g.name === DEMO_GROUP.name);
    if (!group) {
      [group] = await api("educator_groups", {
        method: "POST",
        body: {
          name: DEMO_GROUP.name,
          description: DEMO_GROUP.description,
          educator_id: guruId,
          join_code: DEMO_GROUP.join_code,
        },
      });
      console.log(`  kelas dibuat: ${DEMO_GROUP.name} (kode ${DEMO_GROUP.join_code})`);
    } else console.log("  kelas demo: sudah ada, lewati");

    const memberRows = DEMO_GROUP.member_emails
      .map((e) => profileByEmail[e]?.id)
      .filter(Boolean)
      .map((pid) => ({ group_id: group.id, profile_id: pid }));
    const members = await api("educator_group_members", { query: `?group_id=eq.${group.id}&select=id,profile_id` });
    const freshMembers = memberRows.filter((m) => !members.some((x) => x.profile_id === m.profile_id));
    if (freshMembers.length) {
      await api("educator_group_members", { method: "POST", body: freshMembers });
      console.log(`  anggota kelas: +${freshMembers.length}`);
    } else console.log("  anggota kelas: sudah lengkap");

    const assignmentRows = DEMO_GROUP.assignment_missions
      .map((slug) => missionId[slug])
      .filter(Boolean)
      .map((mid, i) => ({
        group_id: group.id,
        mission_id: mid,
        due_at: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
        created_by: guruId,
      }));
    const assignments = await api("educator_assignments", { query: `?group_id=eq.${group.id}&select=id,mission_id` });
    const freshAssign = assignmentRows.filter((a) => !assignments.some((x) => x.mission_id === a.mission_id));
    if (freshAssign.length) {
      await api("educator_assignments", { method: "POST", body: freshAssign });
      console.log(`  tugas misi: +${freshAssign.length}`);
    } else console.log("  tugas misi: sudah lengkap");
  }

  /* --- Ringkasan --- */
  console.log("\n✅ Selesai. Ringkasan isi database:");
  for (const [table, label] of [
    ["cultural_regions", "wilayah"],
    ["cultural_contents", "konten budaya"],
    ["cultural_sources", "sumber"],
    ["missions", "misi"],
    ["mission_questions", "soal misi"],
    ["cultural_artifacts", "artefak"],
    ["achievements", "achievement"],
    ["encyclopedia_articles", "artikel ensiklopedia"],
    ["encyclopedia_media", "media ensiklopedia"],
    ["cultural_relationships", "relasi graph"],
    ["community_submissions", "kiriman komunitas"],
    ["profiles", "profil pengguna"],
  ]) {
    const rows = await api(table, { query: "?select=*" });
    console.log(`   ${label.padEnd(22)} ${rows.length}`);
  }
  console.log(`\nAkun demo:\n  Admin    : admin@lokaquest.web.id / ${DEMO_PASSWORD}\n  Edukator : guru@lokaquest.web.id / ${DEMO_PASSWORD}\n  Siswa    : siswa@lokaquest.web.id / Siswa2026!\n  Kode kelas demo: ${DEMO_GROUP.join_code}`);
}

main().catch((err) => {
  console.error("❌ Seed gagal:", err.message);
  process.exit(1);
});
