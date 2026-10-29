/**
 * Remote seeding via Supabase REST API using the service-role key.
 *
 * The service role bypasses RLS, so demo content can be inserted without
 * direct database access. Every step is idempotent: rows are matched by a
 * natural key (slug/title/prompt) and only inserted when missing, so the
 * script is safe to re-run.
 *
 * Usage: node scripts/seed-remote.mjs
 */
import process from "node:process";

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://krsdymqxywddgreqflrx.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SECRET_KEY ?? "***REDACTED***";

if (!SERVICE_KEY) {
  console.error("SUPABASE_SECRET_KEY tidak ada di environment.");
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
    throw new Error(`${table} ${method}: ${res.status} ${JSON.stringify(json)}`);
  }
  return json;
}

/** Insert rows whose natural key is not present yet. */
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

const SOURCES = [
  {
    title: "Ensiklopedia Batik Indonesia",
    author: "Hasan",
    publisher: "Gramedia Pustaka Utama",
    year: 2010,
    url: "https://example.com/batik",
    license: "CC BY-SA 4.0",
    attribution: "Hasan (2010). Ensiklopedia Batik Indonesia. Gramedia Pustaka Utama.",
  },
  {
    title: "Gamelan: Traditional Music of Indonesia",
    author: "Sumarsam",
    publisher: "Wesleyan University Press",
    year: 1995,
    url: "https://example.com/gamelan",
    license: "CC BY-NC 4.0",
    attribution: "Sumarsam (1995). Gamelan: Traditional Music of Indonesia. Wesleyan University Press.",
  },
  {
    title: "Wayang Kulit: Shadow Puppetry of Java",
    author: "Brandon",
    publisher: "KITLV Press",
    year: 1967,
    url: "https://example.com/wayang",
    license: "Public Domain",
    attribution: "Brandon (1967). Wayang Kulit: Shadow Puppetry of Java. KITLV Press.",
  },
];

const REGIONS = [
  {
    slug: "jawa-tengah",
    name: "Jawa Tengah",
    description:
      "Pusat perdagangan dan budaya batik terkemuka di Indonesia dengan motif-motif klasik dan modern.",
    geographic_context: "Central Java, Indonesia",
    sort_order: 1,
    status: "published",
  },
  {
    slug: "jawa-barat",
    name: "Jawa Barat",
    description:
      "Rumah bagi tradisi gamelan Sunda yang kaya dengan nuansa alam pegunungan.",
    geographic_context: "West Java, Indonesia",
    sort_order: 2,
    status: "published",
  },
  {
    slug: "yogyakarta",
    name: "Yogyakarta",
    description:
      "Kota budaya yang menjadi pusat seni wayang kulit dan keraton.",
    geographic_context: "Special Region of Yogyakarta, Indonesia",
    sort_order: 3,
    status: "published",
  },
];

const MISSIONS = [
  {
    slug: "batik-detective",
    region: "jawa-tengah",
    title: "Batik Detective",
    description: "Pelajari pola dan makna di balik batik khas Jawa Tengah.",
    learning_objectives: [
      "Mengenali motif batik klasik",
      "Memahami filosofi simbol batik",
      "Membedakan ciri khas wilayah",
    ],
    difficulty: "beginner",
    xp_reward: 150,
    sort_order: 1,
    status: "published",
  },
  {
    slug: "gamelan-maestro",
    region: "jawa-barat",
    title: "Gamelan Maestro",
    description: "Kenali instrumen gamelan dan peranannya dalam orkestra tradisional.",
    learning_objectives: [
      "Mengenali instrumen gamelan",
      "Memahami fungsi masing-masing instrumen",
      "Menghargai harmoni gamelan",
    ],
    difficulty: "intermediate",
    xp_reward: 200,
    sort_order: 2,
    status: "published",
  },
  {
    slug: "wayang-story",
    region: "yogyakarta",
    title: "Wayang Story Adventure",
    description: "Ikuti petualangan wayang dan pelajari cerita rakyat Nusantara.",
    learning_objectives: [
      "Mengenal tokoh wayang utama",
      "Memahami alur cerita wayang",
      "Menghargai nilai moral wayang",
    ],
    difficulty: "intermediate",
    xp_reward: 200,
    sort_order: 3,
    status: "published",
  },
];

const QUESTIONS = {
  "batik-detective": [
    {
      question_type: "multiple_choice",
      prompt: "Apa motif batik yang terkenal dari Jawa Tengah dengan motif burung hong?",
      options: { choices: ["Parang Rusak", "Kawung", "Semen Rama", "Buketan"] },
      correct_answer: { correct: "Parang Rusak" },
      explanation:
        "Motif Parang Rusak adalah motif batik klasik dari Jawa Tengah yang sering diartikan sebagai simbol keberanian dan keteguhan.",
      sort_order: 1,
    },
    {
      question_type: "matching",
      prompt: "Cocokkan motif batik dengan maknanya: Parang Rusak, Kawung, Semen Rama",
      options: {
        pairs: {
          "Parang Rusak": "Keberanian",
          Kawung: "Kebersihan",
          "Semen Rama": "Kesetiaan",
        },
      },
      correct_answer: {
        matches: {
          "Parang Rusak": "Keberanian",
          Kawung: "Kebersihan",
          "Semen Rama": "Kesetiaan",
        },
      },
      explanation: "Setiap motif batik memiliki filosofi mendalam yang dijunjung oleh leluhur.",
      sort_order: 2,
    },
  ],
  "gamelan-maestro": [
    {
      question_type: "multiple_choice",
      prompt: "Alat musik tradisional yang menjadi pengiring utama dalam gamelan Jawa adalah:",
      options: { choices: ["Suling", "Kendang", "Bonang", "Gender"] },
      correct_answer: { correct: "Kendang" },
      explanation: "Kendang adalah drum yang menjadi jantung irama dalam gamelan Jawa.",
      sort_order: 1,
    },
    {
      question_type: "identification",
      prompt: "Identifikasikan instrumen gamelan yang menghasilkan suara metalik khas dengan bilah perunggu:",
      options: { instruments: ["Saron", "Slenthem", "Gender", "Bonang"] },
      correct_answer: { correct: "Saron" },
      explanation: "Saron menghasilkan suara metalik yang khas dalam gamelan.",
      sort_order: 2,
    },
  ],
  "wayang-story": [
    {
      question_type: "sequencing",
      prompt:
        "Urutkan rangkaian cerita wayang: keluarga kerajaan dibuang, pangeran lahir di hutan, pangeran balik keraton, pangeran jadi raja",
      options: {
        events: [
          "Keluarga kerajaan dibuang",
          "Pangeran lahir di hutan",
          "Pangeran balik keraton",
          "Pangeran jadi raja",
        ],
      },
      correct_answer: { correct: "Pangeran lahir di hutan, keluarga kerajaan dibuang, pangeran balik keraton, pangeran jadi raja" },
      explanation:
        "Alur cerita wayang biasanya mengikuti struktur klasik: musibah, kelahiran, perjuangan, lalu kemenangan.",
      sort_order: 1,
    },
    {
      question_type: "multiple_choice",
      prompt: "Tokoh wayang yang terkenal dengan sifat bijaksana dan menjadi penasihat punakawan adalah:",
      options: { choices: ["Gareng", "Semar", "Arjuna", "Bima"] },
      correct_answer: { correct: "Semar" },
      explanation: "Semar adalah tokoh punakawan yang melambangkan kebijaksanaan dan kesaktian.",
      sort_order: 2,
    },
  ],
};

const ACHIEVEMENTS = [
  {
    slug: "first-steps",
    title: "Langkah Pertama",
    description: "Selesaikan misi pertamamu",
    icon: "🎯",
    criteria: { type: "mission_complete", count: 1 },
    xp_bonus: 50,
  },
  {
    slug: "batik-master",
    title: "Ahli Batik",
    description: "Selesaikan semua misi batik dengan nilai sempurna",
    icon: "🧵",
    criteria: { type: "mission_perfect", mission_slug: "batik-detective" },
    xp_bonus: 100,
  },
  {
    slug: "gamelan-virtuoso",
    title: "Virtuoso Gamelan",
    description: "Selesaikan misi Gamelan Maestro",
    icon: "🎶",
    criteria: { type: "mission_complete", mission_slug: "gamelan-maestro" },
    xp_bonus: 100,
  },
  {
    slug: "wayang-scholar",
    title: "Cendekiawan Wayang",
    description: "Selesaikan misi Wayang Story Adventure",
    icon: "🎭",
    criteria: { type: "mission_complete", mission_slug: "wayang-story" },
    xp_bonus: 100,
  },
  {
    slug: "cultural-explorer",
    title: "Penjelajah Budaya",
    description: "Selesaikan 3 misi",
    icon: "🌏",
    criteria: { type: "mission_complete_total", count: 3 },
    xp_bonus: 200,
  },
];

const ARTIFACTS = [
  {
    name: "Kain Batik Tulis",
    description: "Kain batik buatan tangan dengan motif Parang Rusak",
    region: "jawa-tengah",
    image_url: "/assets/images/artifacts/batik-tulis.jpg",
    rarity: "rare",
  },
  {
    name: "Kendang Gamelan",
    description: "Instrumen kendang dari gamelan Jawa",
    region: "jawa-barat",
    image_url: "/assets/images/artifacts/kendang.jpg",
    rarity: "uncommon",
  },
  {
    name: "Wayang Kulit Arjuna",
    description: "Wayang kulit tokoh Arjuna dari Yogyakarta",
    region: "yogyakarta",
    image_url: "/assets/images/artifacts/wayang-arjuna.jpg",
    rarity: "legendary",
  },
];

const ASSESSMENTS = [
  {
    title: "Pretest — Pengetahuan Budaya Indonesia",
    description:
      "Uji pengetahuan awal Anda tentang budaya Indonesia sebelum memulai petualangan.",
    assessment_type: "pre",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        prompt: "Batik berasal dari negara mana?",
        choices: ["Indonesia", "Malaysia", "Thailand", "Filipina"],
        correct: "Indonesia",
      },
      {
        id: "q2",
        type: "multiple_choice",
        prompt: "Gamelan adalah...",
        choices: [
          "Alat musik tradisional Indonesia",
          "Tarian tradisional",
          "Kuliner",
          "Arsitektur",
        ],
        correct: "Alat musik tradisional Indonesia",
      },
      {
        id: "q3",
        type: "multiple_choice",
        prompt: "Wayang kulit terutama ada di pulau mana?",
        choices: ["Jawa", "Sumatra", "Kalimantan", "Sulawesi"],
        correct: "Jawa",
      },
    ],
  },
  {
    title: "Posttest — Pengetahuan Budaya Indonesia",
    description: "Uji pengetahuan Anda setelah menyelesaikan petualangan.",
    assessment_type: "post",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        prompt: "Motif batik Parang Rusak melambangkan...",
        choices: ["Keberanian", "Kebersihan", "Kesetiaan", "Kecerdasan"],
        correct: "Keberanian",
      },
      {
        id: "q2",
        type: "multiple_choice",
        prompt: "Instrumen pengiring utama gamelan Jawa adalah...",
        choices: ["Suling", "Kendang", "Bonang", "Gender"],
        correct: "Kendang",
      },
      {
        id: "q3",
        type: "multiple_choice",
        prompt: "Tokoh punakawan dalam wayang yang melambangkan kebijaksanaan adalah...",
        choices: ["Semar", "Arjuna", "Bima", "Gareng"],
        correct: "Semar",
      },
    ],
  },
];

async function main() {
  console.log("Seed remote dimulai →", URL_);

  console.log("1/7 cultural_sources");
  await insertMissing(
    "cultural_sources",
    SOURCES,
    (e, row) => e.title === row.title,
    "sumber referensi"
  );

  console.log("2/7 cultural_regions");
  await insertMissing(
    "cultural_regions",
    REGIONS,
    (e, row) => e.slug === row.slug,
    "wilayah"
  );

  const regions = await api("cultural_regions?select=id,slug");
  const regionId = (slug) => regions.find((r) => r.slug === slug)?.id;

  console.log("3/7 missions");
  await insertMissing(
    "missions",
    MISSIONS.map(({ region, ...m }) => ({ ...m, region_id: regionId(region) })),
    (e, row) => e.slug === row.slug,
    "misi"
  );

  const missions = await api("missions?select=id,slug");
  const missionId = (slug) => missions.find((m) => m.slug === slug)?.id;

  console.log("4/7 mission_questions");
  for (const [slug, questions] of Object.entries(QUESTIONS)) {
    const id = missionId(slug);
    if (!id) throw new Error(`misi ${slug} tidak ditemukan`);
    await insertMissing(
      "mission_questions",
      questions.map((q) => ({ ...q, mission_id: id })),
      (e, row) => e.mission_id === id && e.prompt === row.prompt,
      `soal ${slug}`
    );
  }

  console.log("5/7 achievements");
  await insertMissing(
    "achievements",
    ACHIEVEMENTS,
    (e, row) => e.slug === row.slug,
    "lencana"
  );

  console.log("6/7 cultural_artifacts");
  await insertMissing(
    "cultural_artifacts",
    ARTIFACTS.map(({ region, ...a }) => ({ ...a, region_id: regionId(region) })),
    (e, row) => e.name === row.name,
    "artefak"
  );

  console.log("7/7 learning_assessments");
  await insertMissing(
    "learning_assessments",
    ASSESSMENTS,
    (e, row) => e.title === row.title,
    "asesmen"
  );

  console.log("\nSeed selesai. Semua konten demo tersinkron.");
}

main().catch((err) => {
  console.error("Seed gagal:", err.message);
  process.exit(1);
});
