import type { Localized } from "../types";

/**
 * String UI untuk halaman modul bahasa daerah (hub dan detail per bahasa).
 * Nama bahasa, deskripsi, kosakata, dan contoh kalimat berasal dari data
 * konten (lib/languages) dan tetap dalam bahasa aslinya.
 */
export const bahasaDict = {
  // Hub bahasa daerah
  metaTitle: {
    id: "Modul Bahasa Daerah Nusantara | LokaQuest",
    en: "Archipelago Regional Language Modules | LokaQuest",
  },
  metaDescription: {
    id: "Pelajari kosakata, pelafalan otentik, dan uji pemahaman ragam bahasa daerah Nusantara yang terintegrasi dengan ensiklopedia budaya.",
    en: "Learn vocabulary, authentic pronunciation, and test your understanding of the archipelago's regional languages, integrated with the culture encyclopedia.",
  },
  pageTitle: { id: "Modul Bahasa Daerah", en: "Regional Language Modules" },
  pageDescription: {
    id: "Eksplorasi kosakata, pelafalan otentik, dan kuis interaktif bahasa daerah Nusantara yang terhubung erat dengan ensiklopedia budaya.",
    en: "Explore vocabulary, authentic pronunciation, and interactive quizzes for the archipelago's regional languages, closely connected to the culture encyclopedia.",
  },
  openEncyclopediaCta: { id: "Buka Ensiklopedia", en: "Open Encyclopedia" },
  statLanguages: { id: "Bahasa Daerah", en: "Regional Languages" },
  statLanguagesNote: {
    id: "dialek utama nusantara",
    en: "major archipelago dialects",
  },
  statVocab: { id: "Kosakata Pilihan", en: "Curated Vocabulary" },
  statVocabNote: { id: "lengkap arti & fonetik", en: "with meanings & phonetics" },
  statPronunciation: { id: "Fitur Pelafalan", en: "Pronunciation Feature" },
  statPronunciationNote: {
    id: "suara & sintesis fonetis",
    en: "audio & phonetic synthesis",
  },
  statQuiz: { id: "Kuis Interaktif", en: "Interactive Quizzes" },
  statQuizNote: {
    id: "skor & evaluasi performa",
    en: "scoring & performance evaluation",
  },
  chooseHeading: { id: "Pilih Bahasa Daerah", en: "Choose a Regional Language" },
  chooseHint: {
    id: "Pilih bahasa untuk belajar kosakata & mengikuti kuis",
    en: "Pick a language to learn vocabulary & take quizzes",
  },
  greetingLabel: { id: "Sapaan Khas", en: "Signature Greeting" },
  learnQuizCta: { id: "Belajar & Kuis", en: "Learn & Quiz" },
  integrationBadge: {
    id: "Integrasi Ensiklopedia & Bahasa",
    en: "Encyclopedia & Language Integration",
  },
  integrationHeading: {
    id: "Bahasa adalah Jendela Nilai Kultural",
    en: "Language is a Window into Cultural Values",
  },
  integrationDescription: {
    id: "Setiap artikel ensiklopedia di LokaQuest—mulai dari Batik, Gamelan, Randai, hingga Subak—kini terhubung langsung dengan istilah dan ungkapan bahasa daerah asalnya. Mempelajari bahasa memperkuat pemahaman konteks historis dan filosofi adat.",
    en: "Every encyclopedia article on LokaQuest—from Batik and Gamelan to Randai and Subak—is now directly connected to the terms and expressions of its regional language. Learning the language deepens your grasp of historical context and customary philosophy.",
  },
  exploreEncyclopediaCta: { id: "Telusuri Ensiklopedia", en: "Browse the Encyclopedia" },
  testMissionsCta: { id: "Uji di Misi Budaya", en: "Test It in Culture Missions" },

  // Detail bahasa
  backToAllLanguages: {
    id: "Semua Bahasa Daerah",
    en: "All Regional Languages",
  },
  greetingAria: { id: "Sapaan: {word}", en: "Greeting: {word}" },
  scriptLabel: { id: "Aksara:", en: "Script:" },
  latinScriptFallback: { id: "Alfabet Latin", en: "Latin Alphabet" },
  speakersLabel: { id: "Penutur:", en: "Speakers:" },
  culturalNoteLabel: { id: "Catatan Budaya:", en: "Cultural note:" },
  tabVocab: {
    id: "Kosakata & Pelafalan ({n})",
    en: "Vocabulary & Pronunciation ({n})",
  },
  tabQuiz: { id: "Kuis Pemahaman (+XP)", en: "Comprehension Quiz (+XP)" },
  filterLabel: { id: "Filter:", en: "Filter:" },
  categoryAll: { id: "Semua", en: "All" },
  categoryGreetings: { id: "Sapaan", en: "Greetings" },
  categoryCulture: { id: "Budaya", en: "Culture" },
  categoryDaily: { id: "Sehari-hari", en: "Everyday" },
  categoryNature: { id: "Alam", en: "Nature" },
  categoryExpressions: { id: "Ungkapan", en: "Expressions" },
  relatedArticleCta: { id: "Artikel Terkait", en: "Related Article" },
} satisfies Record<string, Localized>;
