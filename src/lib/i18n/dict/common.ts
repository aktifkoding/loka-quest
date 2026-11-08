import type { Lang, Localized } from "../types";

/** Label & pesan yang dipakai lintas halaman. Jangan menaruh string khusus satu halaman di sini. */
export const commonDict = {
  // Aksi umum
  save: { id: "Simpan", en: "Save" },
  cancel: { id: "Batal", en: "Cancel" },
  delete: { id: "Hapus", en: "Delete" },
  edit: { id: "Ubah", en: "Edit" },
  close: { id: "Tutup", en: "Close" },
  open: { id: "Buka", en: "Open" },
  back: { id: "Kembali", en: "Back" },
  retry: { id: "Coba lagi", en: "Try again" },
  backHome: { id: "Ke beranda", en: "Back to home" },
  submit: { id: "Kirim", en: "Submit" },
  loading: { id: "Memuat halaman", en: "Loading page" },
  loadingShort: { id: "Memuat…", en: "Loading…" },
  sending: { id: "Mengirim…", en: "Sending…" },
  search: { id: "Cari", en: "Search" },
  filter: { id: "Filter", en: "Filter" },
  clearFilters: { id: "Hapus filter", en: "Clear filters" },
  share: { id: "Bagikan", en: "Share" },
  seeAll: { id: "Lihat semua", en: "See all" },
  next: { id: "Berikutnya", en: "Next" },
  previous: { id: "Sebelumnya", en: "Previous" },
  pageOf: { id: "Halaman {x} dari {y}", en: "Page {x} of {y}" },
  errorGeneric: {
    id: "Terjadi kesalahan. Silakan coba lagi.",
    en: "Something went wrong. Please try again.",
  },
  errorNetwork: {
    id: "Gagal terhubung ke server. Periksa koneksi Anda.",
    en: "Failed to connect to the server. Check your connection.",
  },
  notFound: { id: "Tidak ditemukan", en: "Not found" },
  empty: { id: "Belum ada data", en: "Nothing here yet" },
  required: { id: "Wajib diisi", en: "Required" },
  optional: { id: "Opsional", en: "Optional" },
  yes: { id: "Ya", en: "Yes" },
  no: { id: "Tidak", en: "No" },
  level: { id: "Level {n}", en: "Level {n}" },
  xpPoint: { id: "XP", en: "XP" },
} satisfies Record<string, Localized>;

/** Kata kunci SEO per bahasa (bentuknya larik, bukan pasangan tunggal). */
export const metaKeywords: Record<Lang, string[]> = {
  id: [
    "budaya Indonesia",
    "edukasi",
    "game edukatif",
    "batik",
    "gamelan",
    "wayang",
  ],
  en: [
    "Indonesian culture",
    "education",
    "educational game",
    "batik",
    "gamelan",
    "wayang",
  ],
};

/** Metadata aplikasi di layout root & manifest. */
export const appMetaDict = {
  title: {
    id: "LokaQuest — Jelajahi Nusantara, Hidupkan Warisan Budaya",
    en: "LokaQuest — Explore the Archipelago, Bring Heritage to Life",
  },
  description: {
    id: "Aplikasi pembelajaran budaya Indonesia yang interaktif. Kenali batik, gamelan, dan wayang lewat misi permainan yang dinilai otomatis.",
    en: "An interactive way to learn Indonesian culture. Discover batik, gamelan, and wayang through game missions graded automatically.",
  },
  ogTitle: { id: "LokaQuest — Jelajahi Nusantara", en: "LokaQuest — Explore the Archipelago" },
  ogDescription: {
    id: "Hidupkan warisan budaya Indonesia melalui permainan edukatif yang interaktif.",
    en: "Bring Indonesian heritage to life through interactive educational games.",
  },
  manifestName: { id: "LokaQuest — Jelajahi Nusantara", en: "LokaQuest — Explore the Archipelago" },
  manifestDescription: {
    id: "Aplikasi pembelajaran budaya Indonesia yang interaktif: batik, gamelan, dan wayang lewat misi permainan.",
    en: "An interactive app for learning Indonesian culture: batik, gamelan, and wayang through game missions.",
  },
} satisfies Record<string, Localized>;
