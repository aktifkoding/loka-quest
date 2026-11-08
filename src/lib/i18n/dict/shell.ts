import type { Localized } from "../types";

/**
 * Kamus "shell" aplikasi: footer, toggle tema/consent/share/onboarding,
 * komponen ui dasar (feedback, page-header, page-loading, count-up),
 * panduan media & kartu tantangan harian, tombol pelafalan, peta Nusantara,
 * serta halaman error/global-error/404.
 */
export const shellDict = {
  // ── Site footer ──
  footerTagline: {
    id: "Jelajahi Nusantara, hidupkan warisan budaya.",
    en: "Explore the Archipelago, bring cultural heritage to life.",
  },
  footerSources: { id: "Sumber budaya", en: "Cultural sources" },
  footerAbout: { id: "Tentang", en: "About" },
  footerCopyright: {
    id: "© 2026 LokaQuest. Konten budaya disertai sumber referensi.",
    en: "© 2026 LokaQuest. Cultural content is accompanied by reference sources.",
  },
  footerAria: { id: "Footer", en: "Footer" },

  // ── Theme toggle ──
  themeLightAria: { id: "Aktifkan mode terang", en: "Switch to light mode" },
  themeDarkAria: { id: "Aktifkan mode gelap", en: "Switch to dark mode" },

  // ── Consent banner ──
  consentAria: { id: "Persetujuan analitik", en: "Analytics consent" },
  consentBody: {
    id: "Kami ingin memahami fitur mana yang dipakai agar LokaQuest lebih baik. Analitik bersifat opsional dan tidak memuat data pribadi.",
    en: "We'd like to understand which features get used so LokaQuest can improve. Analytics is optional and contains no personal data.",
  },
  consentLearnMore: { id: "Pelajari", en: "Learn more" },
  consentAllow: { id: "Izinkan", en: "Allow" },
  consentDeny: { id: "Tolak", en: "Deny" },

  // ── Share button ──
  linkCopied: { id: "Tautan disalin ke clipboard", en: "Link copied to clipboard" },

  // ── Onboarding tour ──
  onbAria: { id: "Selamat datang di LokaQuest", en: "Welcome to LokaQuest" },
  onbCloseAria: { id: "Tutup panduan", en: "Close the guide" },
  onbStep1Title: { id: "Mulai dari pre-test", en: "Start with the pre-test" },
  onbStep1Body: {
    id: "Satu menit mengukur pengetahuan awalmu. Hasilnya jadi baseline untuk melihat perkembanganmu nanti.",
    en: "One minute to measure your starting knowledge. The result becomes the baseline for tracking your growth later.",
  },
  onbStep1Cta: { id: "Kerjakan pre-test", en: "Take the pre-test" },
  onbStep2Title: { id: "Mainkan tiga misi budaya", en: "Play three cultural missions" },
  onbStep2Body: {
    id: "Batik, gamelan, dan wayang menanti. Ada pasangan motif, urutan cerita, bahkan tebak bunyi gamelan.",
    en: "Batik, gamelan, and wayang await. There are motif matching, story ordering, even gamelan sound guessing.",
  },
  onbStep2Cta: { id: "Lihat misi", en: "View missions" },
  onbStep3Title: { id: "Kumpulkan XP, lencana, artefak", en: "Collect XP, badges, and artifacts" },
  onbStep3Body: {
    id: "Setiap misi selesai menambah XP dan membuka artefak budaya. Post-test di akhir menunjukkan seberapa jauh kamu berkembang.",
    en: "Every completed mission adds XP and unlocks cultural artifacts. A post-test at the end shows how far you have come.",
  },
  onbStep3Cta: { id: "Mengerti, mulai sekarang", en: "Got it, let's begin" },

  // ── Feedback (toast & confirm) ──
  toastCloseAria: { id: "Tutup notifikasi", en: "Dismiss notification" },

  // ── Mission media guide ──
  mediaGuideBadge: { id: "Petunjuk Media Budaya", en: "Cultural media guide" },
  mediaCount: { id: "{n} media tersedia", en: "{n} media available" },
  mediaGuideSubtitle: {
    id: "Dengarkan audio & tonton video pendukung misi ini",
    en: "Listen to the audio & watch the videos for this mission",
  },
  mediaToggleOpen: { id: "Buka Petunjuk Media", en: "Open media guide" },
  mediaToggleClose: { id: "Tutup Media", en: "Hide media" },
  mediaGuideHelp: {
    id: "Petunjuk audio dan video di bawah ini berisi melodi instrumen, vokal, dan ragam gerak tradisional yang dapat membantumu menyelesaikan tantangan misi.",
    en: "The audio and video guides below contain instrument melodies, vocals, and traditional movements that can help you complete the mission challenge.",
  },
  mediaCategoryMusic: { id: "Musik Tradisional", en: "Traditional music" },
  mediaCategoryDance: { id: "Pertunjukan Seni Tari", en: "Dance performance" },
  mediaCategoryNarration: { id: "Narasi Budaya", en: "Cultural narration" },
  mediaAudioUnsupported: {
    id: "Browser Anda tidak mendukung audio.",
    en: "Your browser does not support audio playback.",
  },
  mediaSource: { id: "Sumber: {source}", en: "Source: {source}" },

  // ── Daily challenge card ──
  dailyTitle: { id: "Tantangan hari ini", en: "Today's challenge" },
  dailyBonus: { id: "Bonus {xp} XP · sekali per hari", en: "Bonus {xp} XP · once per day" },
  dailyStreakDays: { id: "{n} hari", en: "{n} days" },
  dailyCompleted: { id: "Selesai", en: "Done" },
  dailyPlay: { id: "Mainkan", en: "Play" },

  // ── Pronunciation button ──
  pronounceTitle: { id: "Dengarkan pelafalan \"{word}\"", en: "Listen to the pronunciation of \"{word}\"" },
  pronounceAria: { id: "Dengarkan pelafalan {word}", en: "Listen to the pronunciation of {word}" },
  pronounceListen: { id: "Dengarkan", en: "Listen" },

  // ── Indonesia map ──
  exploreRegion: { id: "Jelajahi wilayah", en: "Explore region" },
  mapAria: { id: "Peta interaktif Nusantara", en: "Interactive map of the Archipelago" },

  // ── Route error page ──
  errorTitle: { id: "Peta tersesat sejenak", en: "The map drifted off course" },
  errorBody: {
    id: "Ada yang keliru saat menampilkan halaman ini. Peralatanmu dan progres belajar tetap aman — coba lagi, atau kembali menelusuri dari awal.",
    en: "Something went wrong while showing this page. Your gear and learning progress remain safe — try again, or head back to explore from the start.",
  },
  errorCode: { id: "Kode galat: {code}", en: "Error code: {code}" },

  // ── Global error page ──
  globalErrorTitle: { id: "Terjadi gangguan", en: "Something went wrong" },
  globalErrorBody: {
    id: "LokaQuest tidak dapat dimuat sekarang. Muat ulang halaman untuk mencoba lagi — progres belajarmu tersimpan aman.",
    en: "LokaQuest cannot be loaded right now. Reload the page to try again — your learning progress is safely saved.",
  },
  globalErrorReload: { id: "Muat ulang", en: "Reload" },

  // ── 404 page ──
  notFoundTitle: { id: "Jalan ini belum terpetakan", en: "This path is not mapped yet" },
  notFoundBody: {
    id: "Halaman yang kamu cari tidak ada atau sudah dipindahkan. Mari kembali ke jalur petualangan budaya.",
    en: "The page you are looking for does not exist or has moved. Let's return to the cultural adventure trail.",
  },
} satisfies Record<string, Localized>;
