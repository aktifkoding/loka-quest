import type { Localized } from "../types";

/** Kamus halaman misi (daftar + detail) dan panel hasil. */
export const gameDict = {
  // Daftar misi
  missionsTitle: { id: "Misi budaya", en: "Cultural missions" },
  missionsIntro: {
    id: "Jawaban dinilai di server setelah misi selesai. Masuk dulu supaya XP dan lencanamu tersimpan.",
    en: "Answers are graded on the server once a mission is complete. Sign in first so your XP and badges are saved.",
  },
  loadingMissionsAria: { id: "Memuat daftar misi", en: "Loading mission list" },
  errorLoadMissions: { id: "Gagal memuat misi", en: "Failed to load missions" },
  errorSubmitMission: { id: "Gagal mengirim misi", en: "Failed to submit the mission" },
  missionsLoadFailedTitle: { id: "Misi tidak bisa dimuat", en: "Missions could not be loaded" },
  emptyMissionsTitle: { id: "Belum ada misi terbuka", en: "No missions open yet" },
  emptyMissionsDesc: {
    id: "Misi muncul di sini setelah tim konten mempublikasikannya.",
    en: "Missions appear here once the content team publishes them.",
  },
  exploreRegionsCta: { id: "Jelajahi wilayah budaya", en: "Explore cultural regions" },
  adaptiveBadge: { id: "Rekomendasi Adaptif", en: "Adaptive recommendation" },

  // Label kesulitan & kelangkaan artefak (nilai dari database)
  difficultyBeginner: { id: "Pemula", en: "Beginner" },
  difficultyIntermediate: { id: "Menengah", en: "Intermediate" },
  difficultyAdvanced: { id: "Lanjutan", en: "Advanced" },
  rarityCommon: { id: "Umum", en: "Common" },
  rarityUncommon: { id: "Tak Biasa", en: "Uncommon" },
  rarityRare: { id: "Langka", en: "Rare" },
  rarityLegendary: { id: "Legendaris", en: "Legendary" },

  // Detail misi
  loadingGameAria: { id: "Memuat permainan", en: "Loading game" },
  missionNotFoundTitle: { id: "Misi tidak ditemukan", en: "Mission not found" },
  missionNotFoundDesc: {
    id: "Misi ini belum dipublikasikan atau tautannya salah.",
    en: "This mission has not been published yet, or the link is wrong.",
  },
  seeAllMissions: { id: "Lihat semua misi", en: "See all missions" },
  backToMissions: { id: "Misi", en: "Missions" },
  readyTitle: { id: "Siap memulai?", en: "Ready to start?" },
  readyBody: {
    id: "{count} tantangan menantimu. Kamu bisa berhenti kapan saja, tapi nilai baru tercatat setelah semua soal dijawab.",
    en: "{count} challenges are waiting for you. You can stop anytime, but your score is only recorded after every question is answered.",
  },
  startMissionCta: { id: "Mulai misi", en: "Start mission" },
  loginRequired: {
    id: "Masuk dulu agar nilai dan XP-mu tersimpan.",
    en: "Sign in first so your score and XP are saved.",
  },
  signInNow: { id: "Masuk sekarang", en: "Sign in now" },
  gradingTitle: {
    id: "Server sedang menilai jawabanmu…",
    en: "The server is grading your answers…",
  },
  gradingBody: {
    id: "Sebentar saja, hasil dan pembahasan muncul di sini.",
    en: "One moment — your results and explanations will appear here.",
  },
  questionFallback: { id: "Pertanyaan", en: "Question" },

  // Hasil
  missionComplete: { id: "Misi selesai", en: "Mission complete" },
  correctCount: {
    id: "{correct} dari {total} jawaban benar",
    en: "{correct} of {total} answers correct",
  },
  totalXpLevel: { id: "Total {xp} XP, Level {level}", en: "Total {xp} XP, Level {level}" },
  playAgain: { id: "Mainkan lagi", en: "Play again" },
  viewDashboard: { id: "Lihat dasbor", en: "View dashboard" },
  newBadgeTitle: { id: "Lencana baru diraih!", en: "New badge earned!" },
  newArtifact: {
    id: "Artefak baru di koleksimu: {name}",
    en: "New artifact in your collection: {name}",
  },
  collectionCta: { id: "Koleksi", en: "Collection" },
  discussionTitle: { id: "Pembahasan", en: "Explanations" },
  correctAria: { id: "Benar", en: "Correct" },
  incorrectAria: { id: "Belum tepat", en: "Not quite right" },
} satisfies Record<string, Localized>;
