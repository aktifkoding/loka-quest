import type { Localized } from "../types";

/**
 * Pesan error API yang muncul di UI (banner/toast). Route handler memilih
 * bahasa dari cookie `lokaquest-lang` via getLangFromRequest().
 */
export const errorsDict = {
  // Rate limit
  rateLimitGeneric: { id: "Terlalu banyak permintaan.", en: "Too many requests." },
  rateLimitAttempts: { id: "Terlalu banyak percobaan. Coba lagi nanti.", en: "Too many attempts. Please try again later." },
  rateLimitAttemptsShort: { id: "Terlalu banyak percobaan.", en: "Too many attempts." },
  rateLimitSubmissions: { id: "Terlalu banyak pengiriman. Coba lagi nanti.", en: "Too many submissions. Please try again later." },
  rateLimitContributions: { id: "Terlalu banyak kiriman. Coba lagi nanti.", en: "Too many contributions. Please try again later." },
  rateLimitQuestions: { id: "Terlalu banyak pertanyaan. Coba lagi sebentar.", en: "Too many questions. Please try again shortly." },
  rateLimitDemo: { id: "Terlalu banyak sesi demo dari jaringan ini. Coba lagi nanti.", en: "Too many demo sessions from this network. Please try again later." },

  // Demo & profil
  demoSetupFailed: { id: "Gagal menyiapkan sesi demo", en: "Failed to prepare the demo session" },
  demoLoginFailed: { id: "Gagal masuk ke sesi demo", en: "Failed to sign in to the demo session" },
  userEmailNotFound: { id: "Pengguna dengan email tersebut tidak ditemukan.", en: "No user found with that email." },
  cannotChangeOwnRole: { id: "Tidak bisa mengubah peran akun sendiri.", en: "You cannot change your own account role." },
  userNotFound: { id: "Pengguna tidak ditemukan.", en: "User not found." },

  // Kelas & kuis
  classCodeNotFound: { id: "Kode kelas tidak ditemukan.", en: "Class code not found." },
  notJoined: { id: "Anda belum bergabung ke sesi ini.", en: "You have not joined this session yet." },
  answerAlreadySent: { id: "Jawaban sudah dikirim.", en: "The answer has already been submitted." },
  notActiveQuestion: { id: "Soal ini bukan soal yang sedang aktif.", en: "This is not the currently active question." },
  quizNotRunning: { id: "Kuis belum berjalan.", en: "The quiz has not started yet." },
  quizSessionNotFound: { id: "Sesi kuis tidak ditemukan.", en: "Quiz session not found." },
  quizSessionOver: { id: "Sesi kuis tidak ditemukan atau sudah berakhir.", en: "Quiz session not found or it has already ended." },
  questionNotFound: { id: "Soal tidak ditemukan.", en: "Question not found." },
  questionNotInReview: { id: "Soal tidak ada di antrean review.", en: "This question is not in the review queue." },
  hostOnly: { id: "Hanya host yang dapat mengontrol kuis.", en: "Only the host can control the quiz." },

 // Konten
  missionSlugTaken: { id: "Slug misi sudah dipakai.", en: "This mission slug is already in use." },
  regionSlugTaken: { id: "Slug wilayah sudah dipakai.", en: "This region slug is already in use." },
  missionNotAvailable: { id: "Misi tidak ditemukan atau belum terbit.", en: "Mission not found or not published yet." },
  noUpdatableFields: { id: "Tidak ada field yang bisa diperbarui", en: "No updatable fields provided" },
  languageNotFound: { id: "Bahasa daerah tidak ditemukan", en: "Regional language not found" },
  articleMustBeApproved: { id: "Artikel harus disetujui reviewer sebelum diterbitkan", en: "The article must be approved by a reviewer before it can be published" },
  articleMustBeInReview: { id: "Artikel harus berada dalam status review", en: "The article must be in review status" },
  sourceRequiredForPublish: { id: "Tambahkan minimal satu sumber yang dapat ditelusuri sebelum publikasi", en: "Add at least one traceable source before publishing" },
  publishedContentNeedsSource: { id: "Konten yang diterbitkan wajib memiliki sumber.", en: "Published content must have a source." },
  encyclopediaForbidden: { id: "Anda tidak memiliki izin untuk tindakan ensiklopedia ini", en: "You do not have permission for this encyclopedia action" },
} satisfies Record<string, Localized>;
