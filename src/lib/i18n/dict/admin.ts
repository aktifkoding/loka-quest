import type { Localized } from "../types";

/**
 * String UI untuk area admin: navigasi, dasbor, wilayah, misi & soal,
 * konten & sumber, moderasi, pengguna, analitik, dan log audit.
 */
export const adminDict = {
  // Navigasi admin
  navAria: { id: "Navigasi admin", en: "Admin navigation" },
  signOutAria: { id: "Keluar dari sesi admin", en: "Sign out of admin session" },
  navDashboard: { id: "Dasbor", en: "Dashboard" },
  navRegions: { id: "Wilayah", en: "Regions" },
  navMissions: { id: "Misi & soal", en: "Missions & questions" },
  navEncyclopedia: { id: "Ensiklopedia", en: "Encyclopedia" },
  navContents: { id: "Konten & sumber", en: "Content & sources" },
  navSubmissions: { id: "Moderasi", en: "Moderation" },
  navUsers: { id: "Pengguna", en: "Users" },
  navAuditLogs: { id: "Log audit", en: "Audit logs" },
  navAnalytics: { id: "Analitik", en: "Analytics" },

  // Dasbor admin
  adminMetaTitle: { id: "Dasbor Admin", en: "Admin Dashboard" },
  adminTitle: { id: "Dasbor admin", en: "Admin dashboard" },
  adminDescription: {
    id: "Kelola konten budaya, pengguna, dan pengaturan aplikasi.",
    en: "Manage cultural content, users, and app settings.",
  },
  metricUsers: { id: "Pengguna", en: "Users" },
  metricUsersNote: { id: "akun terdaftar", en: "registered accounts" },
  metricMissions: { id: "Misi", en: "Missions" },
  metricMissionsNote: {
    id: "termasuk draf dan terbit",
    en: "including drafts and published",
  },
  metricRegions: { id: "Wilayah", en: "Regions" },
  metricRegionsNote: {
    id: "wilayah budaya terdaftar",
    en: "registered cultural regions",
  },
  contentManagementHeading: {
    id: "Manajemen konten",
    en: "Content management",
  },
  systemManagementHeading: {
    id: "Manajemen sistem",
    en: "System management",
  },
  linkRegions: { id: "Wilayah budaya", en: "Cultural regions" },
  linkMissions: { id: "Misi & soal", en: "Missions & questions" },
  linkEncyclopedia: { id: "Ensiklopedia budaya", en: "Culture encyclopedia" },
  linkContents: { id: "Konten & sumber", en: "Content & sources" },
  linkSubmissions: { id: "Moderasi komunitas", en: "Community moderation" },
  linkUsersRoles: { id: "Pengguna & peran", en: "Users & roles" },
  linkAuditLogs: { id: "Log audit", en: "Audit logs" },
  linkAppAnalytics: { id: "Analitik aplikasi", en: "App analytics" },

  // Halaman wilayah budaya
  backToAdmin: { id: "Dasbor admin", en: "Admin dashboard" },
  regionsTitle: { id: "Wilayah budaya", en: "Cultural regions" },
  regionsDescription: {
    id: "Atur wilayah lewat status editorial: draf, review, terbit, arsip.",
    en: "Manage regions through editorial statuses: draft, review, published, archived.",
  },
  addRegionCta: { id: "Tambah wilayah", en: "Add region" },
  loadRegionsFailed: { id: "Gagal memuat wilayah", en: "Failed to load regions" },
  createRegionFailed: { id: "Gagal membuat wilayah", en: "Failed to create region" },
  nameLabel: { id: "Nama", en: "Name" },
  slugLabel: { id: "Slug", en: "Slug" },
  descriptionLabel: { id: "Deskripsi", en: "Description" },
  statusLabel: { id: "Status", en: "Status" },
  statusDraft: { id: "Draf", en: "Draft" },
  statusReview: { id: "Review", en: "Review" },
  statusPublished: { id: "Terbit", en: "Published" },
  statusArchived: { id: "Arsip", en: "Archived" },
  saving: { id: "Menyimpan…", en: "Saving…" },
  saveRegionCta: { id: "Simpan wilayah", en: "Save region" },
  loadingRegionsAria: { id: "Memuat wilayah", en: "Loading regions" },
  regionsErrorTitle: {
    id: "Wilayah tidak bisa dimuat",
    en: "Regions could not be loaded",
  },
  regionsEmptyTitle: { id: "Belum ada wilayah", en: "No regions yet" },
  regionsEmptyDescription: {
    id: "Tambahkan wilayah pertama, lalu isi konten dan sumbernya sebelum menerbitkan.",
    en: "Add the first region, then fill in its content and sources before publishing.",
  },

  // Halaman misi & soal
  missionsTitle: { id: "Misi & soal", en: "Missions & questions" },
  missionsDescription: {
    id: "Buat misi, susun soal, lalu terbitkan setelah siap.",
    en: "Create missions, build questions, then publish when ready.",
  },
  newMissionCta: { id: "Misi baru", en: "New mission" },
  loadMissionsFailed: { id: "Gagal memuat misi", en: "Failed to load missions" },
  createMissionFailed: { id: "Gagal membuat misi", en: "Failed to create mission" },
  titleLabel: { id: "Judul", en: "Title" },
  regionLabel: { id: "Wilayah", en: "Region" },
  regionPlaceholder: { id: "Pilih wilayah", en: "Choose a region" },
  difficultyLabel: { id: "Kesulitan", en: "Difficulty" },
  difficultyBeginner: { id: "Pemula", en: "Beginner" },
  difficultyIntermediate: { id: "Menengah", en: "Intermediate" },
  difficultyAdvanced: { id: "Mahir", en: "Advanced" },
  saveMissionCta: { id: "Simpan misi", en: "Save mission" },
  missionsEmptyTitle: { id: "Belum ada misi", en: "No missions yet" },
  missionsEmptyDescription: {
    id: "Buat misi pertama, lalu tambahkan soal sebelum menerbitkannya.",
    en: "Create your first mission, then add questions before publishing it.",
  },
  noRegion: { id: "Tanpa wilayah", en: "No region" },
  questionCount: { id: "{n} soal", en: "{n} questions" },
  manageQuestionsCta: { id: "Kelola soal", en: "Manage questions" },

  // Detail misi (editor misi & soal)
  backToMissions: { id: "Daftar misi", en: "Mission list" },
  saveMissionFailed: { id: "Gagal menyimpan misi", en: "Failed to save mission" },
  missionSavedToast: { id: "Misi tersimpan.", en: "Mission saved." },
  saveQuestionFailed: { id: "Gagal menyimpan soal", en: "Failed to save question" },
  questionUpdatedToast: { id: "Soal diperbarui.", en: "Question updated." },
  questionAddedToast: { id: "Soal ditambahkan.", en: "Question added." },
  questionDeleteConfirm: { id: "Hapus soal ini?", en: "Delete this question?" },
  deleteQuestionFailed: { id: "Gagal menghapus soal", en: "Failed to delete question" },
  questionDeletedToast: { id: "Soal dihapus.", en: "Question deleted." },
  missionNotFound: { id: "Misi tidak ditemukan.", en: "Mission not found." },
  questionsHeading: { id: "Soal ({n})", en: "Questions ({n})" },
  questionsNote: {
    id: "Soal hanya dapat dimainkan setelah misi berstatus terbit.",
    en: "Questions can only be played once the mission is published.",
  },
  newQuestionCta: { id: "Soal baru", en: "New question" },
  questionTypeLabel: { id: "Tipe soal", en: "Question type" },
  typeMultipleChoice: { id: "Pilihan ganda", en: "Multiple choice" },
  typeMatching: { id: "Mencocokkan", en: "Matching" },
  typeSequencing: { id: "Urutan", en: "Sequencing" },
  typeIdentification: { id: "Identifikasi", en: "Identification" },
  promptLabel: { id: "Pertanyaan", en: "Prompt" },
  optionsMatching: {
    id: "Pasangan (satu per baris, kiri=kanan)",
    en: "Pairs (one per line, left=right)",
  },
  optionsSequencing: {
    id: "Peristiwa (satu per baris)",
    en: "Events (one per line)",
  },
  optionsIdentification: {
    id: "Pilihan instrumen (satu per baris)",
    en: "Instrument choices (one per line)",
  },
  optionsChoices: {
    id: "Pilihan jawaban (satu per baris)",
    en: "Answer choices (one per line)",
  },
  correctSequencing: {
    id: "Urutan benar (satu per baris)",
    en: "Correct order (one per line)",
  },
  correctMatching: {
    id: "Kunci pasangan (satu per baris, kiri=kanan)",
    en: "Pair key (one per line, left=right)",
  },
  correctDefault: { id: "Jawaban benar", en: "Correct answer" },
  explanationLabel: { id: "Pembahasan (opsional)", en: "Explanation (optional)" },
  orderLabel: { id: "Urutan", en: "Order" },
  saveQuestionCta: { id: "Simpan soal", en: "Save question" },
  emptyQuestions: {
    id: "Belum ada soal. Tambahkan minimal satu soal sebelum menerbitkan misi.",
    en: "No questions yet. Add at least one question before publishing the mission.",
  },
  orderSuffix: { id: "urutan {n}", en: "order {n}" },
  editCta: { id: "Sunting", en: "Edit" },
  deleteQuestionAria: { id: "Hapus soal", en: "Delete question" },

  // Konten & sumber
  contentsTitle: { id: "Konten & sumber", en: "Content & sources" },
  contentsDescription: {
    id: "Setiap konten wajib bersumber tercatat sebelum diterbitkan.",
    en: "Every content item requires a recorded source before publication.",
  },
  contentsSectionAria: { id: "Konten budaya", en: "Cultural content" },
  contentsHeading: { id: "Konten budaya", en: "Cultural content" },
  contentsEmptyTitle: { id: "Belum ada konten", en: "No content yet" },
  contentsEmptyDescription: {
    id: "Tambahkan konten budaya per wilayah melalui Supabase, lengkap dengan status editorialnya.",
    en: "Add cultural content per region via Supabase, complete with its editorial status.",
  },
  noRegionSuffix: { id: "tanpa wilayah", en: "no region" },
  sourcesSectionAria: { id: "Register sumber", en: "Source register" },
  sourcesHeading: { id: "Register sumber", en: "Source register" },
  sourcesEmpty: {
    id: "Belum ada sumber terdaftar.",
    en: "No sources registered yet.",
  },
  licenseMissing: { id: "lisensi belum dicatat", en: "license not recorded" },

  // Form konten
  closeFormCta: { id: "Tutup form", en: "Close form" },
  addContentCta: { id: "Tambah konten", en: "Add content" },
  saveContentFailed: {
    id: "Gagal menyimpan konten",
    en: "Failed to save content",
  },
  needRegionFirst: {
    id: "Tambahkan wilayah terlebih dahulu sebelum membuat konten.",
    en: "Add a region first before creating content.",
  },
  typeLabel: { id: "Jenis", en: "Type" },
  typeTradition: { id: "Tradisi", en: "Tradition" },
  typeArtifact: { id: "Artefak", en: "Artifact" },
  typePractice: { id: "Praktik", en: "Practice" },
  typeStory: { id: "Cerita", en: "Story" },
  bodyLabel: { id: "Isi (opsional)", en: "Body (optional)" },
  sourceLabel: { id: "Sumber", en: "Source" },
  noSourceOption: { id: "Belum ada sumber", en: "No source" },
  sourceRequiredNote: {
    id: "Wajib dipilih sebelum status diubah menjadi published.",
    en: "Required before the status can be changed to published.",
  },
  mediaUrlLabel: { id: "URL media (opsional)", en: "Media URL (optional)" },
  saveContentCta: { id: "Simpan konten", en: "Save content" },

  // Moderasi kontribusi komunitas
  submissionsTitle: {
    id: "Verifikasi Kontribusi Komunitas",
    en: "Community Submission Review",
  },
  submissionsDescription: {
    id: "Tinjau usulan dokumentasi budaya dari komunitas sebelum dipublikasikan.",
    en: "Review community cultural documentation proposals before publication.",
  },
  updateFailed: { id: "Gagal memperbarui", en: "Failed to update" },
  submissionPublishedToast: {
    id: "Usulan dipublikasikan.",
    en: "Submission published.",
  },
  submissionRejectedToast: { id: "Usulan ditolak.", en: "Submission rejected." },
  pendingHeading: { id: "Menunggu verifikasi ({n})", en: "Awaiting review ({n})" },
  emptyPending: {
    id: "Tidak ada usulan baru.",
    en: "No new submissions.",
  },
  publishCta: { id: "Publikasikan", en: "Publish" },
  rejectCta: { id: "Tolak", en: "Reject" },
  noteCta: { id: "Catatan", en: "Note" },
  adminNoteLabel: {
    id: "Catatan admin (opsional)",
    en: "Admin note (optional)",
  },
  notePlaceholder: {
    id: "Alasan publikasi/penolakan...",
    en: "Reason for publishing/rejecting...",
  },
  historyHeading: { id: "Riwayat ({n})", en: "History ({n})" },
  emptyHistory: {
    id: "Belum ada yang diverifikasi.",
    en: "Nothing reviewed yet.",
  },
  statusDipublikasikan: { id: "Dipublikasikan", en: "Published" },
  statusDitolak: { id: "Ditolak", en: "Rejected" },
  notePrefix: { id: "Catatan:", en: "Note:" },

  // Pengguna & peran
  usersTitle: { id: "Pengguna & peran", en: "Users & roles" },
  usersAccountCount: { id: "{n} akun.", en: "{n} accounts." },
  usersRoleNote: {
    id: "Perubahan peran berlaku seketika dan tercatat di log audit.",
    en: "Role changes take effect immediately and are recorded in the audit log.",
  },
  usersEmpty: {
    id: "Belum ada pengguna terdaftar.",
    en: "No registered users yet.",
  },
  usersTableCaption: {
    id: "Daftar pengguna dengan pengaturan peran",
    en: "User list with role settings",
  },
  headerName: { id: "Nama", en: "Name" },
  headerEmail: { id: "Email", en: "Email" },
  headerRole: { id: "Peran", en: "Role" },
  unnamedUser: { id: "Tanpa nama", en: "Unnamed" },
  youBadge: { id: "kamu", en: "you" },
  changeRoleAria: { id: "Ubah peran pengguna", en: "Change user role" },

  // Analitik aplikasi
  appAnalyticsMetaTitle: { id: "Analitik Aplikasi", en: "App Analytics" },
  appAnalyticsTitle: { id: "Analitik aplikasi", en: "App analytics" },
  appAnalyticsDescription: {
    id: "Ringkasan penggunaan agregat.",
    en: "Aggregate usage summary.",
  },
  statRegisteredUsers: { id: "Pengguna terdaftar", en: "Registered users" },
  statMissionAttempts: { id: "Percobaan misi", en: "Mission attempts" },
  statCulturalRegions: { id: "Wilayah budaya", en: "Cultural regions" },
  statRegisteredContents: { id: "Konten terdaftar", en: "Registered content" },

  // Log audit
  auditMetaTitle: { id: "Log Audit", en: "Audit Logs" },
  auditTitle: { id: "Log audit", en: "Audit logs" },
  auditDescription: {
    id: "100 aktivitas administratif terakhir. Jejak tidak bisa diubah.",
    en: "The 100 most recent administrative activities. The trail cannot be altered.",
  },
  actionRoleChange: { id: "Perubahan peran", en: "Role change" },
  actionContentUpdate: { id: "Pembaruan konten", en: "Content update" },
  actionContentCreate: { id: "Konten baru", en: "New content" },
  auditEmptyTitle: { id: "Log masih kosong", en: "Log is still empty" },
  auditEmptyDescription: {
    id: "Operasi sensitif seperti perubahan peran akan tercatat di sini.",
    en: "Sensitive operations such as role changes will be recorded here.",
  },

  // CMS ensiklopedia (area editor/admin)
  encyclopediaMetaTitle: {
    id: "Manajemen Ensiklopedia",
    en: "Encyclopedia Management",
  },
  homeLink: { id: "Beranda", en: "Home" },
  encyclopediaPageTitle: {
    id: "Ensiklopedia budaya",
    en: "Culture encyclopedia",
  },
  encyclopediaPageDescription: {
    id: "Kelola artikel dan pantau status editorial.",
    en: "Manage articles and monitor editorial status.",
  },
  newArticleCta: { id: "Artikel baru", en: "New article" },
  editorialRolesCta: { id: "Peran editorial", en: "Editorial roles" },
  emptyArticles: { id: "Belum ada artikel.", en: "No articles yet." },
  reviewArticleCta: { id: "Tinjau", en: "Review" },
  publishArticleCta: { id: "Terbitkan", en: "Publish" },

  // Editor artikel ensiklopedia
  backToCms: { id: "CMS ensiklopedia", en: "Encyclopedia CMS" },
  articleEditorTitleNew: { id: "Artikel baru", en: "New article" },
  articleEditorTitleEdit: { id: "Sunting artikel", en: "Edit article" },
  currentStatus: { id: "Status saat ini:", en: "Current status:" },
  addReferencesNote: {
    id: "Tambahkan referensi yang dapat ditelusuri sebelum publikasi.",
    en: "Add traceable references before publication.",
  },
  articleTitleLabel: { id: "Judul", en: "Title" },
  slugUrlLabel: { id: "Slug URL", en: "URL slug" },
  summaryLabel: { id: "Ringkasan", en: "Summary" },
  bodyMainLabel: { id: "Isi utama", en: "Main body" },
  featuredImageUrlLabel: {
    id: "URL gambar utama (opsional)",
    en: "Featured image URL (optional)",
  },
  sectionBackground: { id: "Latar budaya", en: "Cultural background" },
  sectionHistoricalContext: { id: "Konteks sejarah", en: "Historical context" },
  sectionCulturalMeaning: { id: "Makna dan filosofi", en: "Meaning and philosophy" },
  sectionCharacteristics: { id: "Ciri khas", en: "Distinctive traits" },
  sectionSocialFunction: { id: "Fungsi sosial", en: "Social function" },
  sectionPractices: { id: "Praktik dan proses", en: "Practices and process" },
  sectionPreservation: { id: "Upaya pelestarian", en: "Preservation efforts" },
  categoriesLegend: { id: "Kategori", en: "Categories" },
  relatedRegionsLegend: { id: "Wilayah terkait", en: "Related regions" },
  seoTitleLabel: { id: "Judul SEO", en: "SEO title" },
  seoDescriptionLabel: { id: "Deskripsi SEO", en: "SEO description" },
  saveDraftCta: { id: "Simpan draf", en: "Save draft" },
  submitReviewCta: { id: "Ajukan tinjauan", en: "Submit for review" },
  articleSaveFailed: {
    id: "Artikel tidak dapat disimpan",
    en: "The article could not be saved",
  },
  articleSubmittedToast: {
    id: "Artikel diajukan untuk tinjauan.",
    en: "Article submitted for review.",
  },
  articleDraftSavedToast: {
    id: "Draf berhasil disimpan.",
    en: "Draft saved successfully.",
  },

  // Peran editorial
  rolesLoadFailed: { id: "Gagal memuat peran", en: "Failed to load roles" },
  assignRoleFailed: { id: "Gagal menetapkan peran", en: "Failed to assign role" },
  roleUpdatedToast: {
    id: "Peran editorial diperbarui.",
    en: "Editorial role updated.",
  },
  revokeRoleConfirm: {
    id: "Cabut peran editorial pengguna ini?",
    en: "Revoke this user's editorial role?",
  },
  revokeRoleFailed: { id: "Gagal mencabut peran", en: "Failed to revoke role" },
  roleRevokedToast: { id: "Peran dicabut.", en: "Role revoked." },
  rolesTitle: { id: "Peran editorial", en: "Editorial roles" },
  rolesDescription: {
    id: "Berikan akses kontributor, reviewer, editor, atau administrator konten.",
    en: "Grant contributor, reviewer, editor, or content administrator access.",
  },
  userEmailLabel: { id: "Email pengguna", en: "User email" },
  roleLabel: { id: "Peran", en: "Role" },
  roleContributor: { id: "Kontributor", en: "Contributor" },
  roleReviewer: { id: "Reviewer", en: "Reviewer" },
  roleCulturalEditor: { id: "Editor budaya", en: "Cultural editor" },
  roleContentAdministrator: {
    id: "Administrator konten",
    en: "Content administrator",
  },
  assignCta: { id: "Tetapkan", en: "Assign" },
  emptyRoles: {
    id: "Belum ada peran editorial. Administrator aplikasi tetap memiliki akses penuh.",
    en: "No editorial roles yet. App administrators always retain full access.",
  },
  revokeRoleAria: { id: "Cabut peran", en: "Revoke role" },
} satisfies Record<string, Localized>;
