import type { Lang, Localized } from "../types";

/** Kamus halaman beranda (landing). */
export const landingDict = {
  // Hero
  badge: {
    id: "Platform belajar budaya Indonesia",
    en: "A platform for learning Indonesian culture",
  },
  heroAria: {
    id: "Jelajahi Nusantara, hidupkan warisan budaya",
    en: "Explore the Archipelago, bring heritage to life",
  },
  heroSub: {
    id: "{missions} misi interaktif dari {regions} wilayah — dari batik Jawa Tengah sampai noken Papua. Jawaban dinilai otomatis, progres tersimpan.",
    en: "{missions} interactive missions from {regions} regions — from the batik of Central Java to the noken of Papua. Answers are graded automatically, progress is saved.",
  },
  ctaStart: { id: "Mulai Petualangan", en: "Start the Adventure" },
  ctaExploreMissions: { id: "Jelajahi Misi", en: "Explore Missions" },
  heroNote: {
    id: "Gratis untuk pelajar. Tanpa iklan, tanpa biaya tersembunyi.",
    en: "Free for students. No ads, no hidden costs.",
  },

  // Kartu demo misi di hero (nama motif adalah nama diri — tidak diterjemahkan)
  demoMissionLabel: { id: "Misi Batik Detective", en: "Mission: Batik Detective" },
  demoQuestionOf: { id: "Soal 1 dari 2", en: "Question 1 of 2" },
  demoQuestion: {
    id: "Motif batik yang melambangkan keberanian dan keteguhan adalah…",
    en: "The batik motif that symbolizes courage and steadfastness is…",
  },

  // Strip bukti / statistik langsung dari database
  statMissionsCaption: {
    id: "misi interaktif dengan soal, nilai, dan pembahasan",
    en: "interactive missions with questions, scores, and explanations",
  },
  statRegionsCaption: {
    id: "wilayah budaya dari Aceh sampai Papua",
    en: "cultural regions from Aceh to Papua",
  },
  statQuestionsCaption: {
    id: "soal misi dengan pembahasan di tiap jawaban",
    en: "mission questions, with an explanation for every answer",
  },
  statSourcesCaption: {
    id: "sumber referensi tercatat di balik konten",
    en: "reference sources documented behind the content",
  },

  // Fitur 1 — penilaian
  scoringTitle: { id: "Nilai muncul, bukan tebakan", en: "Real scores, not guesswork" },
  scoringBody: {
    id: "Setiap jawaban dinilai di server, bukan di browser. Begitu misi selesai, kamu melihat pembahasan singkat untuk tiap soal.",
    en: "Every answer is graded on the server, not in the browser. Once a mission is complete, you see a short explanation for each question.",
  },
  resultCardLabel: { id: "Hasil misi", en: "Mission result" },
  resultCorrect: { id: "2 dari 3 jawaban benar", en: "2 of 3 answers correct" },
  resultNote: {
    id: "Parang Rusak melambangkan keberanian; Kawung melambangkan kebersihan hati.",
    en: "Parang Rusak stands for courage; Kawung stands for purity of heart.",
  },

  // Fitur 2 — sumber (judul buku & penerbit tetap dalam bahasa aslinya)
  sourceCardTitle: { id: "Sumber tercatat", en: "Documented sources" },
  sourceCardBody: {
    id: "Referensi wajib untuk konten yang dipublikasikan",
    en: "References are required for every published piece of content",
  },
  licenseLabel: { id: "Lisensi: CC BY-SA 4.0", en: "License: CC BY-SA 4.0" },
  sourcesTitle: { id: "Setiap konten punya sumber", en: "Every piece of content has a source" },
  sourcesBody: {
    id: "Batik, gamelan, dan wayang ditulis dari referensi yang tercatat dan bisa diperiksa. Tidak ada fakta karangan.",
    en: "Batik, gamelan, and wayang articles are written from documented, verifiable references. No made-up facts.",
  },

  // Daftar misi
  missionsHeading: {
    id: "{missions} misi, {regions} wilayah",
    en: "{missions} missions, {regions} regions",
  },
  allMissions: { id: "Semua misi", en: "All missions" },

  // Cara kerja
  howTitle: { id: "Cara kerjanya", en: "How it works" },
  step1Title: { id: "Buat akun", en: "Create an account" },
  step1Desc: {
    id: "Daftar dengan email. Selesai dalam satu menit.",
    en: "Sign up with your email. Done in a minute.",
  },
  step2Title: { id: "Mainkan misi", en: "Play a mission" },
  step2Desc: {
    id: "Jawab tantangan budaya di setiap wilayah.",
    en: "Answer cultural challenges in every region.",
  },
  step3Title: { id: "Pantau progres", en: "Track progress" },
  step3Desc: {
    id: "Nilai, XP, dan lencana tercatat otomatis di dasbor.",
    en: "Scores, XP, and badges are recorded automatically in your dashboard.",
  },

  // Pita pendidik
  educatorTitle: {
    id: "Dibangun untuk kelas, bukan hanya layar pribadi",
    en: "Built for classrooms, not just personal screens",
  },
  educatorCheck1: {
    id: "Pantau progres belajar per kelompok siswa",
    en: "Monitor learning progress for each group of students",
  },
  educatorCheck2: {
    id: "Bandingkan hasil pre-test dan post-test",
    en: "Compare pre-test and post-test results",
  },
  educatorCheck3: {
    id: "Kelola konten budaya lewat dasbor admin",
    en: "Manage cultural content through the admin dashboard",
  },
  educatorCardTitle: {
    id: "Siap membawa LokaQuest ke kelas Anda?",
    en: "Ready to bring LokaQuest to your classroom?",
  },
  educatorCardBody: {
    id: "Buat akun, lalu minta admin menetapkan peran pendidik untuk membuka dasbor kelompok.",
    en: "Create an account, then ask an admin to assign the educator role to unlock the group dashboard.",
  },
  educatorCta: { id: "Buat akun", en: "Create an account" },

  // CTA penutup
  finalTitle: {
    id: "Warisan budaya menunggu untuk dijelajahi",
    en: "Cultural heritage is waiting to be explored",
  },
  finalBody: {
    id: "Mulai dari misi pertama, kumpulkan XP, dan lihat seberapa jauh pemahamanmu berkembang.",
    en: "Start with the first mission, collect XP, and see how far your understanding grows.",
  },
  ctaEncyclopedia: { id: "Baca Ensiklopedia", en: "Read the Encyclopedia" },
} satisfies Record<string, Localized>;

/**
 * Kata per kata untuk <h1> hero — setiap kata dibungkus span .hero-word
 * yang dianimasikan GSAP; tail = kata yang mendapat garis bawah emas.
 * Jumlah kata boleh berbeda antar bahasa.
 */
export const landingHeroWords: Record<Lang, { main: string[]; tail: string[] }> = {
  id: { main: ["Jelajahi", "Nusantara,", "hidupkan"], tail: ["warisan", "budaya"] },
  en: { main: ["Explore", "the", "Archipelago,", "bring"], tail: ["heritage", "to", "life"] },
};
