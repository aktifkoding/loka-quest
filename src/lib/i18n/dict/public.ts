import type { Localized } from "../types";

/**
 * String UI untuk halaman publik: explore, jelajahi, komunitas, asisten,
 * dan detail wilayah. String khusus auth ada di dict/auth.ts.
 */
export const publicDict = {
  // Pesan umum halaman publik
  errorLoad: { id: "Gagal memuat", en: "Failed to load" },
  errorLoadRegions: { id: "Gagal memuat wilayah", en: "Failed to load regions" },
  errorLoadGraph: { id: "Gagal memuat grafik", en: "Failed to load graph" },
  errorSubmit: { id: "Gagal mengirim", en: "Failed to submit" },

  // Explore (peta & kartu wilayah)
  exploreTitle: {
    id: "Jelajahi wilayah budaya",
    en: "Explore cultural regions",
  },
  exploreDescription: {
    id: "Pilih wilayah untuk memulai misi, membaca cerita, dan menemukan warisan Nusantara yang bersumber.",
    en: "Choose a region to start missions, read stories, and discover the documented heritage of the archipelago.",
  },
  mapView: { id: "Peta", en: "Map" },
  cardsView: { id: "Kartu", en: "Cards" },
  regionsErrorTitle: {
    id: "Wilayah tidak bisa dimuat",
    en: "Regions could not be loaded",
  },
  regionsEmptyTitle: {
    id: "Belum ada wilayah terbuka",
    en: "No regions open yet",
  },
  regionsEmptyDescription: {
    id: "Tim konten sedang menyiapkan wilayah budaya. Muncul di sini begitu dipublikasikan.",
    en: "The content team is preparing cultural regions. They will appear here once published.",
  },

  // Jelajahi (grafik budaya)
  graphTitle: { id: "Grafik Budaya", en: "Culture Graph" },
  graphDescription: {
    id: "Peta hubungan antar wilayah, tradisi, tokoh, dan artefak. Sentuh simpul untuk menjelajahi keterkaitannya.",
    en: "A map of relations between regions, traditions, figures, and artifacts. Tap a node to explore how they connect.",
  },
  graphErrorTitle: { id: "Grafik belum siap", en: "Graph not ready yet" },
  graphEmptyTitle: {
    id: "Belum ada hubungan terdaftar",
    en: "No relations registered yet",
  },
  graphEmptyDescription: {
    id: "Tim substansi budaya sedang menambahkan hubungan antar entitas. Nanti akan muncul di sini.",
    en: "The cultural content team is adding relations between entities. They will appear here soon.",
  },
  nodesSectionAria: { id: "Simpul budaya", en: "Culture nodes" },
  nodesHeading: { id: "Simpul", en: "Nodes" },
  connectionsCount: { id: "{x} koneksi terdaftar", en: "{x} registered connections" },
  detailHeading: { id: "Detail hubungan", en: "Relation details" },
  detailEmpty: {
    id: "Pilih salah satu simpul di samping untuk melihat hubungan masuk dan keluar.",
    en: "Select one of the nodes beside to view its incoming and outgoing relations.",
  },
  selectedLabel: { id: "Terpilih", en: "Selected" },
  outgoingLabel: { id: "Keluar", en: "Outgoing" },
  noOutgoing: { id: "Tidak ada hubungan keluar.", en: "No outgoing relations." },
  incomingLabel: { id: "Masuk", en: "Incoming" },
  noIncoming: { id: "Tidak ada hubungan masuk.", en: "No incoming relations." },
  entityCountHeading: { id: "Jumlah entitas", en: "Entity count" },
  relationRelatedTo: { id: "Terhubung", en: "Connected" },
  relationOriginatesFrom: { id: "Berawal dari", en: "Originates from" },
  relationInfluences: { id: "Mempengaruhi", en: "Influences" },
  relationPartOf: { id: "Bagian dari", en: "Part of" },
  relationDepicts: { id: "Menggambarkan", en: "Depicts" },
  relationInspiredBy: { id: "Terinspirasi dari", en: "Inspired by" },
  relationPracticedIn: { id: "Dipelajari di", en: "Practiced in" },

  // Komunitas
  communityTitle: { id: "Komunitas Budaya", en: "Culture Community" },
  communityDescription: {
    id: "Seniman, budayawan, dan komunitas dapat mengusulkan dokumentasi budaya untuk diverifikasi dan diterbitkan di LokaQuest.",
    en: "Artists, cultural experts, and communities can propose cultural documentation to be verified and published on LokaQuest.",
  },
  communitySectionAria: {
    id: "Dokumentasi komunitas",
    en: "Community documentation",
  },
  verifiedHeading: {
    id: "Dokumentasi terverifikasi",
    en: "Verified documentation",
  },
  docsEmptyTitle: {
    id: "Belum ada dokumentasi",
    en: "No documentation yet",
  },
  docsEmptyDescription: {
    id: "Jadilah yang pertama mengusulkan konten budaya.",
    en: "Be the first to propose cultural content.",
  },
  proposeCta: { id: "Usulkan konten", en: "Propose content" },
  proposeHeading: {
    id: "Usulkan dokumentasi",
    en: "Propose documentation",
  },
  proposeIntro: {
    id: "Konten Anda akan diverifikasi tim substansi sebelum dipublikasikan.",
    en: "Your content will be verified by the cultural team before publication.",
  },
  proposeSuccess: {
    id: "Usulan Anda telah terkirim. Tim kami akan memeriksa dalam 2–3 hari kerja.",
    en: "Your submission has been sent. Our team will review it within 2–3 business days.",
  },
  labelTitle: { id: "Judul", en: "Title" },
  labelBody: { id: "Isi dokumentasi", en: "Documentation body" },
  labelRegionOptional: { id: "Wilayah (opsional)", en: "Region (optional)" },
  placeholderRegion: { id: "misal jawa-tengah", en: "e.g. jawa-tengah" },
  labelSubmitterName: { id: "Nama pengirim", en: "Submitter name" },
  labelSubmitterEmail: { id: "Email pengirim", en: "Submitter email" },
  submitProposalCta: { id: "Kirim usulan", en: "Send proposal" },
  statusPending: { id: "Menunggu verifikasi", en: "Awaiting review" },
  statusPublished: { id: "Dipublikasikan", en: "Published" },
  statusRejected: { id: "Ditolak", en: "Rejected" },
  graphCardDescription: {
    id: "Jelajahi hubungan antar wilayah, tradisi, tokoh, dan artefak dalam peta pengetahuan budaya.",
    en: "Explore relations between regions, traditions, figures, and artifacts in the cultural knowledge map.",
  },
  openGraphCta: { id: "Buka Grafik Budaya", en: "Open Culture Graph" },

  // Asisten budaya AI
  assistantTitle: { id: "Asisten Budaya AI", en: "AI Culture Assistant" },
  assistantDescription: {
    id: "Tanyakan apa saja tentang budaya Indonesia. Jawaban disusun dari artikel dan sumber budaya terverifikasi di LokaQuest, dilengkapi referensi.",
    en: "Ask anything about Indonesian culture. Answers are built from verified articles and cultural sources on LokaQuest, complete with references.",
  },
  assistantPlaceholder: {
    id: "Contoh: Apa itu batik Parang Rusak?",
    en: "Example: What is Parang Rusak batik?",
  },
  assistantInputAria: {
    id: "Pertanyaan tentang budaya",
    en: "Question about culture",
  },
  askCta: { id: "Tanya", en: "Ask" },
  errorAsk: {
    id: "Gagal memproses pertanyaan",
    en: "Failed to process the question",
  },
  tryHeading: { id: "Coba pertanyaan:", en: "Try a question:" },
  sampleQuestion1: {
    id: "Apa itu batik Parang Rusak?",
    en: "What is Parang Rusak batik?",
  },
  sampleQuestion2: {
    id: "Ceritakan tentang wayang kulit Yogyakarta.",
    en: "Tell me about Yogyakarta wayang kulit.",
  },
  sampleQuestion3: {
    id: "Apa perbedaan gamelan Jawa Barat dan Jawa Tengah?",
    en: "What is the difference between West Java and Central Java gamelan?",
  },
  questionLabel: { id: "Pertanyaan", en: "Question" },
  answerLabel: { id: "Jawaban", en: "Answer" },
  citationsLabel: { id: "Referensi", en: "References" },
  regionPrefix: { id: "Wilayah: {x}", en: "Region: {x}" },
  sourcePrefix: { id: "Sumber: {x}", en: "Source: {x}" },

  // Detail wilayah
  regionNotFoundTitle: { id: "Wilayah tidak ditemukan", en: "Region not found" },
  regionNotFoundDescription: {
    id: "Wilayah budaya ini belum dipublikasikan atau sudah dipindahkan.",
    en: "This cultural region has not been published yet or has been moved.",
  },
  backToExploreCta: {
    id: "Kembali ke peta jelajah",
    en: "Back to the explore map",
  },
  exploreLink: { id: "Jelajahi", en: "Explore" },
  regionImageAlt: { id: "Suasana {name}", en: "Atmosphere of {name}" },
  aboutSectionAria: { id: "Tentang wilayah", en: "About the region" },
  aboutHeading: { id: "Tentang wilayah ini", en: "About this region" },
  contentsSectionAria: {
    id: "Tradisi dan cerita",
    en: "Traditions and stories",
  },
  contentsHeading: { id: "Tradisi & cerita", en: "Traditions & stories" },
  contentsIntro: {
    id: "Setiap tulisan bersumber tercatat — sentuh sumbernya untuk tahu rujukannya.",
    en: "Every piece of writing lists its source — tap the source to see the reference.",
  },
  zoomAria: { id: "Perbesar gambar", en: "Enlarge image" },
  zoomCta: { id: "Perbesar", en: "Enlarge" },
  openSourceCta: { id: "buka", en: "open" },
  missionsSectionAria: { id: "Misi di wilayah ini", en: "Missions in this region" },
  missionsHeading: { id: "Misi di wilayah ini", en: "Missions in this region" },
  missionsEmptyTitle: { id: "Misi belum dibuka", en: "No missions open yet" },
  missionsEmptyDescription: {
    id: "Belum ada misi yang dipublikasikan untuk wilayah ini. Cek lagi nanti.",
    en: "No missions have been published for this region yet. Check back later.",
  },
  otherRegionsCta: { id: "Lihat wilayah lain", en: "See other regions" },
  lightboxAria: { id: "Pratinjau gambar", en: "Image preview" },
  lightboxCloseAria: { id: "Tutup pratinjau", en: "Close preview" },
  previewAlt: { id: "Pratinjau", en: "Preview" },

  // Label kesulitan misi
  difficultyBeginner: { id: "Pemula", en: "Beginner" },
  difficultyIntermediate: { id: "Menengah", en: "Intermediate" },
  difficultyAdvanced: { id: "Lanjutan", en: "Advanced" },

  // Label jenis konten budaya
  contentTypeTradition: { id: "Tradisi", en: "Tradition" },
  contentTypeArtifact: { id: "Artefak", en: "Artifact" },
  contentTypePractice: { id: "Praktik", en: "Practice" },
  contentTypeStory: { id: "Cerita", en: "Story" },

  // Jalur Budaya (halaman wilayah)
  storyPathTitle: { id: "Jalur Budaya", en: "Culture Path" },
  storyPathDescription: {
    id: "Satu perjalanan utuh: mainkan misi, kenali konten, lalu dalami artikel ensiklopedia.",
    en: "One complete journey: play the missions, meet the content, then dive into encyclopedia articles.",
  },
  storyPathStep1: { id: "Mainkan Misi", en: "Play Missions" },
  storyPathStep2: { id: "Kenali Konten", en: "Meet the Content" },
  storyPathStep3: { id: "Dalami Artikel", en: "Dive into Articles" },
  storyPathMissionsCount: {
    id: "{n} misi menanti",
    en: "{n} missions await",
  },
  storyPathContentsCount: {
    id: "{n} konten budaya",
    en: "{n} cultural entries",
  },
  storyPathArticlesCount: {
    id: "{n} artikel ensiklopedia",
    en: "{n} encyclopedia articles",
  },
  storyPathEmpty: {
    id: "Konten untuk wilayah ini sedang disusun editor budaya.",
    en: "Content for this region is being prepared by our cultural editors.",
  },
  certificateCta: { id: "Sertifikat Wilayah", en: "Region Certificate" },
} satisfies Record<string, Localized>;
