import type { Localized } from "../types";

/**
 * String UI untuk area ensiklopedia: halaman utama, jelajah, pencarian,
 * favorit, koleksi, kategori, wilayah, artikel, serta komponen pendukungnya.
 */
export const encyclopediaDict = {
  // Label kembali
  backToEncyclopedia: { id: "Ensiklopedia", en: "Encyclopedia" },

  // Halaman utama ensiklopedia
  metaTitle: { id: "Ensiklopedia Budaya", en: "Culture Encyclopedia" },
  badge: {
    id: "Ensiklopedia Budaya Nusantara",
    en: "Archipelago Culture Encyclopedia",
  },
  heroTitleLine1: { id: "Menjelajahi Pengetahuan,", en: "Exploring Knowledge," },
  heroTitleLine2: { id: "Merawat Warisan.", en: "Preserving Heritage." },
  heroDescription: {
    id: "Ruang belajar budaya Indonesia yang menyajikan konteks, sumber, dan beragam perspektif secara bertanggung jawab.",
    en: "A learning space for Indonesian culture that presents context, sources, and diverse perspectives responsibly.",
  },
  searchLabelAria: {
    id: "Cari budaya Nusantara",
    en: "Search archipelago culture",
  },
  searchPlaceholder: {
    id: "Cari tradisi, wilayah, atau kategori…",
    en: "Search traditions, regions, or categories…",
  },
  publishNote: {
    id: "Informasi diterbitkan setelah proses editorial dan dilengkapi referensi.",
    en: "Information is published after an editorial process and comes with references.",
  },
  entryPointsAria: {
    id: "Jelajahi ensiklopedia",
    en: "Explore the encyclopedia",
  },
  exploreLabel: { id: "Jelajahi artikel", en: "Explore articles" },
  exploreDescription: {
    id: "Telusuri pengetahuan budaya yang telah ditinjau dan bersumber.",
    en: "Browse cultural knowledge that has been reviewed and sourced.",
  },
  languageLabel: { id: "Bahasa Daerah", en: "Regional Languages" },
  languageDescription: {
    id: "Kosakata, pelafalan fonetis, dan kuis bahasa daerah Nusantara.",
    en: "Vocabulary, phonetic pronunciation, and quizzes for the regional languages of the archipelago.",
  },
  categoriesLabel: { id: "Kategori budaya", en: "Culture categories" },
  categoriesEntryDescription: {
    id: "Seni, tradisi, adat, kuliner, kerajinan, dan lainnya.",
    en: "Arts, traditions, customs, cuisine, crafts, and more.",
  },
  regionsLabel: { id: "Wilayah Nusantara", en: "Archipelago Regions" },
  regionsEntryDescription: {
    id: "Temukan warisan budaya melalui wilayah yang terkait.",
    en: "Discover cultural heritage through its related regions.",
  },
  openSectionCta: { id: "Buka bagian", en: "Open section" },
  explainerEyebrow: {
    id: "Mulai dari rasa ingin tahu",
    en: "Start with curiosity",
  },
  explainerTitle: {
    id: "Pengetahuan yang terhubung dengan pengalaman",
    en: "Knowledge connected to experience",
  },
  seeAllArticlesCta: { id: "Lihat semua artikel", en: "See all articles" },
  explainerBody: {
    id: "Artikel yang mendukung misi LokaQuest akan menghubungkan bacaan dengan tantangan edukatif. Tidak semua tradisi memiliki misi; setiap hubungan ditampilkan hanya jika tersedia.",
    en: "Articles that support LokaQuest missions connect reading with educational challenges. Not every tradition has a mission; each connection is shown only when available.",
  },

  // Halaman jelajah
  exploreMetaTitle: { id: "Jelajahi Ensiklopedia", en: "Explore the Encyclopedia" },
  explorePageTitle: {
    id: "Jelajahi pengetahuan budaya",
    en: "Explore cultural knowledge",
  },
  explorePageDescription: {
    id: "Artikel yang telah dipublikasikan melalui proses tinjauan editorial.",
    en: "Articles published through the editorial review process.",
  },
  articlesErrorTitle: {
    id: "Artikel belum dapat dimuat",
    en: "Articles could not be loaded",
  },
  articlesErrorDescription: {
    id: "Silakan coba kembali nanti.",
    en: "Please try again later.",
  },
  emptyFilteredTitle: {
    id: "Belum ada artikel untuk filter ini",
    en: "No articles for this filter yet",
  },
  emptyCollectionTitle: {
    id: "Koleksi sedang disiapkan",
    en: "The collection is being prepared",
  },
  emptyCollectionDescription: {
    id: "Artikel ensiklopedia akan muncul setelah ditinjau dan diterbitkan. Konten lama tetap tersedia di Jelajahi Nusantara.",
    en: "Encyclopedia articles will appear once reviewed and published. Older content remains available in Jelajahi Nusantara.",
  },
  exploreRegionsCta: { id: "Jelajahi wilayah", en: "Explore regions" },
  regionFallback: {
    id: "Wilayah belum ditentukan",
    en: "Region not yet specified",
  },

  // Halaman pencarian
  searchMetaTitle: {
    id: "Cari Pengetahuan Budaya",
    en: "Search Cultural Knowledge",
  },
  searchPageTitle: {
    id: "Cari pengetahuan budaya",
    en: "Search cultural knowledge",
  },
  searchPageDescription: {
    id: "Telusuri ensiklopedia berdasarkan nama tradisi, topik, atau istilah alternatif.",
    en: "Search the encyclopedia by tradition name, topic, or alternative terms.",
  },
  keywordLabel: { id: "Kata kunci", en: "Keyword" },
  searchInputPlaceholder: {
    id: "Masukkan minimal dua karakter",
    en: "Enter at least two characters",
  },
  resultsFor: { id: "Hasil untuk “{query}”", en: "Results for “{query}”" },
  searchFailedTitle: { id: "Pencarian gagal", en: "Search failed" },
  searchFailedDescription: {
    id: "Coba kembali beberapa saat lagi.",
    en: "Try again in a few moments.",
  },
  paginationAria: {
    id: "Halaman hasil pencarian",
    en: "Search result pages",
  },
  noResultsTitle: { id: "Belum ada hasil", en: "No results yet" },
  noResultsDescription: {
    id: "Coba kata kunci lain atau jelajahi kategori budaya.",
    en: "Try different keywords or browse the culture categories.",
  },
  exploreArticlesCta: { id: "Jelajahi artikel", en: "Explore articles" },
  searchIntro: {
    id: "Cari berdasarkan nama tradisi, topik, atau istilah alternatif — misalnya “batik”, “gamelan”, atau “wayang”.",
    en: "Search by tradition name, topic, or alternative terms — for example “batik”, “gamelan”, or “wayang”.",
  },

  // Halaman favorit
  favoritesTitle: { id: "Favorit saya", en: "My favorites" },
  favoritesDescription: {
    id: "Artikel yang Anda simpan untuk dibaca kembali.",
    en: "Articles you saved to read again.",
  },
  favoritesAuthMessage: {
    id: "Masuk untuk melihat artikel favorit.",
    en: "Sign in to view your favorite articles.",
  },
  favoritesLoadError: {
    id: "Favorit belum dapat dimuat.",
    en: "Favorites could not be loaded.",
  },
  favoritesUnavailableTitle: {
    id: "Favorit tidak tersedia",
    en: "Favorites unavailable",
  },
  signInCta: { id: "Masuk", en: "Sign in" },
  removeFavoriteAria: {
    id: "Hapus {title} dari favorit",
    en: "Remove {title} from favorites",
  },
  emptyFavoritesTitle: { id: "Belum ada favorit", en: "No favorites yet" },
  emptyFavoritesDescription: {
    id: "Simpan artikel yang ingin Anda baca kembali.",
    en: "Save articles you want to read again.",
  },

  // Halaman koleksi & riwayat baca
  collectionsTitle: {
    id: "Koleksi dan riwayat baca",
    en: "Collections and reading history",
  },
  collectionsDescription: {
    id: "Riwayat ini hanya terlihat oleh Anda.",
    en: "This history is visible only to you.",
  },
  clearHistoryCta: { id: "Hapus riwayat", en: "Clear history" },
  collectionsAuthMessage: {
    id: "Masuk untuk melihat riwayat bacaan.",
    en: "Sign in to view your reading history.",
  },
  collectionsLoadError: {
    id: "Riwayat belum dapat dimuat.",
    en: "History could not be loaded.",
  },
  collectionsUnavailableTitle: {
    id: "Riwayat tidak tersedia",
    en: "History unavailable",
  },
  lastRead: { id: "Terakhir dibaca {date}", en: "Last read {date}" },
  emptyHistoryTitle: {
    id: "Belum ada riwayat bacaan",
    en: "No reading history yet",
  },
  emptyHistoryDescription: {
    id: "Artikel yang Anda baca akan muncul di sini setelah pencatatan riwayat tersedia.",
    en: "Articles you read will appear here once history tracking is available.",
  },

  // Halaman kategori
  categoriesMetaTitle: { id: "Kategori Budaya", en: "Culture Categories" },
  categoriesPageTitle: { id: "Kategori budaya", en: "Culture categories" },
  categoriesPageDescription: {
    id: "Jelajahi warisan budaya melalui beragam bentuk pengetahuan.",
    en: "Explore cultural heritage through its diverse forms of knowledge.",
  },
  categoriesErrorTitle: {
    id: "Kategori belum dapat dimuat",
    en: "Categories could not be loaded",
  },
  categoriesPreparingTitle: {
    id: "Kategori sedang disiapkan",
    en: "Categories are being prepared",
  },
  categoriesEmptyDescription: {
    id: "Kategori dan artikel akan tampil ketika sudah tersedia.",
    en: "Categories and articles will appear once they are available.",
  },

  // Halaman wilayah
  regionsMetaTitle: { id: "Wilayah Nusantara", en: "Archipelago Regions" },
  regionsPageTitle: { id: "Wilayah Nusantara", en: "Archipelago Regions" },
  regionsPageDescription: {
    id: "Wilayah ditampilkan berdasarkan keterkaitan artikel yang sudah diterbitkan. Lokasi tidak ditambahkan tanpa verifikasi.",
    en: "Regions are shown based on their connection to published articles. Locations are never added without verification.",
  },
  regionsErrorTitle: {
    id: "Wilayah belum dapat dimuat",
    en: "Regions could not be loaded",
  },
  regionsEmptyTitle: {
    id: "Belum ada wilayah terkait",
    en: "No related regions yet",
  },
  regionsEmptyDescription: {
    id: "Wilayah akan ditampilkan ketika ada artikel ensiklopedia terbit yang terhubung.",
    en: "Regions will appear once published encyclopedia articles are connected to them.",
  },
  exploreLokaQuestRegionsCta: {
    id: "Jelajahi wilayah LokaQuest",
    en: "Explore LokaQuest regions",
  },

  // Halaman artikel
  articleNotFoundTitle: {
    id: "Artikel tidak ditemukan",
    en: "Article not found",
  },
  backToEncyclopediaLink: {
    id: "Kembali ke ensiklopedia",
    en: "Back to encyclopedia",
  },
  reviewedAt: { id: "Ditinjau {date}", en: "Reviewed {date}" },
  audioNarrationHeading: { id: "Narasi audio", en: "Audio narration" },
  audioUnsupported: {
    id: "Browser Anda tidak mendukung pemutar audio.",
    en: "Your browser does not support the audio player.",
  },
  audioCredit: { id: "Audio: {credit}", en: "Audio: {credit}" },
  featuredImageCaption: {
    id: "Gambar utama artikel. Lihat keterangan lisensi pada setiap media.",
    en: "Main article image. See the license note on each media item.",
  },
  bodyHeading: { id: "Mengenal {title}", en: "Getting to know {title}" },
  sectionBackground: { id: "Latar budaya", en: "Cultural background" },
  sectionHistory: { id: "Konteks sejarah", en: "Historical context" },
  sectionMeaning: { id: "Makna dan filosofi", en: "Meaning and philosophy" },
  sectionCharacteristics: { id: "Ciri khas", en: "Distinctive traits" },
  sectionSocialFunction: { id: "Fungsi sosial", en: "Social function" },
  sectionPractices: { id: "Praktik dan proses", en: "Practices and process" },
  sectionPreservation: { id: "Upaya pelestarian", en: "Preservation efforts" },
  verifiedFactsHeading: {
    id: "Fakta terdokumentasi",
    en: "Documented facts",
  },
  sourcesHeading: { id: "Sumber dan referensi", en: "Sources and references" },
  openSourceCta: { id: "Buka sumber", en: "Open source" },
  missionsHeading: { id: "Lanjutkan dengan misi", en: "Continue with missions" },
  relatedArticlesHeading: { id: "Artikel terkait", en: "Related articles" },
  feedbackHeading: { id: "Koreksi atau masukan?", en: "Corrections or feedback?" },
  feedbackIntro: {
    id: "Bantu kami menjaga informasi tetap akurat dan menghormati perspektif komunitas.",
    en: "Help us keep the information accurate and respectful of community perspectives.",
  },

  // Komponen feedback artikel
  feedbackButton: {
    id: "Kirim koreksi atau masukan",
    en: "Send a correction or feedback",
  },
  feedbackKindLabel: { id: "Jenis masukan", en: "Feedback type" },
  feedbackKindCorrection: {
    id: "Koreksi informasi",
    en: "Information correction",
  },
  feedbackKindCommunity: {
    id: "Perspektif komunitas",
    en: "Community perspective",
  },
  feedbackKindMediaRights: {
    id: "Hak atau atribusi media",
    en: "Media rights or attribution",
  },
  feedbackKindOther: { id: "Lainnya", en: "Other" },
  feedbackDetailLabel: { id: "Detail", en: "Details" },
  feedbackSubmitCta: { id: "Kirim masukan", en: "Send feedback" },
  feedbackSuccess: {
    id: "Terima kasih. Masukan Anda telah dicatat.",
    en: "Thank you. Your feedback has been recorded.",
  },
  feedbackError: {
    id: "Masukan belum terkirim. Silakan coba lagi nanti.",
    en: "Your feedback could not be sent. Please try again later.",
  },

  // Komponen tombol favorit
  bookmarkAuthMessage: {
    id: "Masuk untuk menyimpan artikel.",
    en: "Sign in to save articles.",
  },
  bookmarkAdded: {
    id: "Artikel disimpan ke favorit.",
    en: "Article saved to favorites.",
  },
  bookmarkRemoved: {
    id: "Artikel dihapus dari favorit.",
    en: "Article removed from favorites.",
  },
  bookmarkUpdateError: {
    id: "Favorit belum dapat diperbarui. Silakan coba kembali.",
    en: "Favorites could not be updated. Please try again.",
  },

  // Komponen aksi editorial
  processing: { id: "Memproses…", en: "Processing…" },
  actionFailed: { id: "Tindakan gagal", en: "Action failed" },
  approvedForPublication: {
    id: "Disetujui untuk publikasi.",
    en: "Approved for publication.",
  },
  articlePublished: { id: "Artikel diterbitkan.", en: "Article published." },

  // Komponen editor sumber
  sourceLinkCta: { id: "Tautan", en: "Link" },
  sourceTitlePlaceholder: { id: "Judul sumber", en: "Source title" },
  sourcePublisherPlaceholder: {
    id: "Penerbit atau komunitas",
    en: "Publisher or community",
  },
  sourceUrlPlaceholder: {
    id: "URL sumber (opsional)",
    en: "Source URL (optional)",
  },
  sourceTypeFact: { id: "Fakta terdokumentasi", en: "Documented fact" },
  sourceTypeAcademic: {
    id: "Interpretasi akademik",
    en: "Academic interpretation",
  },
  sourceTypeOral: { id: "Tradisi lisan", en: "Oral tradition" },
  sourceTypeCommunity: {
    id: "Perspektif komunitas",
    en: "Community perspective",
  },
  sourceTypeContemporary: {
    id: "Praktik kontemporer",
    en: "Contemporary practice",
  },
  addReferenceCta: { id: "Tambah referensi", en: "Add reference" },
  sourceSaveError: {
    id: "Sumber gagal disimpan",
    en: "Failed to save source",
  },
  sourceSaved: { id: "Referensi tersimpan.", en: "Reference saved." },

  // Komponen galeri media
  mediaBadge: {
    id: "Media & Dokumentasi Budaya",
    en: "Media & Cultural Documentation",
  },
  mediaHeading: {
    id: "Galeri Audio, Video, dan Visual",
    en: "Audio, Video, and Visual Gallery",
  },
  mediaIntro: {
    id: "Saksikan pertunjukan tari, dengarkan melodi instrumen, dan pelajari narasi budaya seputar {title}.",
    en: "Watch dance performances, listen to instrument melodies, and explore the cultural narratives around {title}.",
  },
  mediaFilterAll: { id: "Semua ({x})", en: "All ({x})" },
  mediaFilterImages: { id: "Gambar", en: "Images" },
  videoUnsupported: {
    id: "Browser Anda tidak mendukung tag video.",
    en: "Your browser does not support the video tag.",
  },
  mediaBadgeMusic: { id: "Musik Tradisional", en: "Traditional Music" },
  mediaBadgeNarrative: { id: "Narasi Budaya", en: "Cultural Narrative" },
  mediaBadgeVideo: { id: "Dokumenter / Tari", en: "Documentary / Dance" },
  mediaBadgeVisual: { id: "Visual", en: "Visual" },

  // Komponen kosakata terkait
  vocabBadge: {
    id: "Modul Bahasa Daerah Terkait",
    en: "Related Regional Language Module",
  },
  vocabHeading: {
    id: "Kosakata {language} seputar {title}",
    en: "{language} vocabulary around {title}",
  },
  vocabFallbackLanguage: { id: "Bahasa Daerah", en: "Regional Language" },
  vocabDescription: {
    id: "Dengarkan pelafalan otentik dan pahami makna kultural istilah daerah yang digunakan.",
    en: "Listen to authentic pronunciations and understand the cultural meaning of the regional terms used.",
  },
  vocabExploreCta: { id: "Jelajahi {language}", en: "Explore {language}" },

  // Komponen pelacak riwayat baca
  saveHistoryAria: { id: "Simpan riwayat baca", en: "Save reading history" },
  saveHistoryLabel: {
    id: "Simpan riwayat baca di perangkat ini",
    en: "Save reading history on this device",
  },

  // Komponen daftar isi
  tocAria: { id: "Daftar isi", en: "Table of contents" },
} satisfies Record<string, Localized>;
