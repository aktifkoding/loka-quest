import type { Localized } from "../types";

/**
 * String UI untuk kuis live peserta dan papan peringkat.
 */
export const miscDict = {
  // Kuis live — layar peserta
  loadSessionFailed: { id: "Gagal memuat sesi", en: "Failed to load session" },
  joinFailed: { id: "Gagal bergabung", en: "Failed to join" },
  submitAnswerFailed: {
    id: "Gagal mengirim jawaban",
    en: "Failed to submit answer",
  },
  correctFeedback: { id: "Benar! +1 poin", en: "Correct! +1 point" },
  incorrectFeedback: { id: "Belum tepat. {explanation}", en: "Not quite. {explanation}" },
  classQuizLabel: { id: "Kuis kelas", en: "Class quiz" },
  signInCta: { id: "Masuk", en: "Sign in" },
  joiningSession: { id: "Bergabung ke sesi…", en: "Joining the session…" },
  lobbyTitle: { id: "Menunggu host memulai…", en: "Waiting for the host to start…" },
  lobbyHint: {
    id: "Kamu sudah masuk. Siapkan jarimu.",
    en: "You're in. Get your fingers ready.",
  },
  participantsLabel: { id: "Peserta:", en: "Participants:" },
  questionNofM: { id: "Soal {i} dari {n}", en: "Question {i} of {n}" },
  answerCorrect: {
    id: "Jawaban benar. Menunggu soal berikutnya…",
    en: "Correct answer. Waiting for the next question…",
  },
  answerAlreadySent: {
    id: "Jawaban sudah dikirim. Menunggu soal berikutnya…",
    en: "Answer already submitted. Waiting for the next question…",
  },
  unsupportedQuestionType: {
    id: "Tipe soal ini belum didukung di kuis live.",
    en: "This question type is not supported in the live quiz yet.",
  },
  quizFinishedTitle: { id: "Kuis selesai", en: "Quiz finished" },
  yourScore: { id: "Skor kamu:", en: "Your score:" },
  toDashboardCta: { id: "Ke dasbor", en: "To dashboard" },

  // Papan peringkat
  leaderboardMetaTitle: { id: "Papan Peringkat", en: "Leaderboard" },
  leaderboardTitle: { id: "Papan peringkat", en: "Leaderboard" },
  leaderboardDescription: {
    id: "20 penjelajah dengan XP tertinggi. Hanya nama tampilan yang ditampilkan.",
    en: "The 20 explorers with the highest XP. Only display names are shown.",
  },
  homeBackLabel: { id: "Beranda", en: "Home" },
  shareTitle: { id: "LokaQuest Leaderboard", en: "LokaQuest Leaderboard" },
  shareText: {
    id: "Lihat papan peringkat penjelajah budaya di LokaQuest!",
    en: "Check out the cultural explorers leaderboard on LokaQuest!",
  },
  leaderboardEmptyTitle: {
    id: "Belum ada peringkat",
    en: "No rankings yet",
  },
  leaderboardEmptyDescription: {
    id: "Jadilah yang pertama menyelesaikan misi dan masuk papan peringkat.",
    en: "Be the first to complete missions and make it onto the leaderboard.",
  },
  startMissionCta: { id: "Mulai misi", en: "Start a mission" },
  explorerFallback: { id: "Penjelajah", en: "Explorer" },
  levelMissions: {
    id: "Level {level} · {missions} misi selesai",
    en: "Level {level} · {missions} missions completed",
  },
} satisfies Record<string, Localized>;
