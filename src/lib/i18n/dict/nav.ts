import type { Localized } from "../types";

/** Kamus navbar & menu pengguna. */
export const navDict = {
  encyclopedia: { id: "Ensiklopedia", en: "Encyclopedia" },
  explore: { id: "Jelajahi", en: "Explore" },
  missions: { id: "Misi", en: "Missions" },
  graph: { id: "Grafik Budaya", en: "Culture Graph" },
  community: { id: "Komunitas", en: "Community" },
  assistant: { id: "Asisten AI", en: "AI Assistant" },
  dashboard: { id: "Dasbor", en: "Dashboard" },
  login: { id: "Masuk", en: "Sign in" },
  register: { id: "Daftar", en: "Sign up" },
  logout: { id: "Keluar", en: "Sign out" },
  language: { id: "Bahasa", en: "Language" },
  toHomeAria: { id: "LokaQuest, ke beranda", en: "LokaQuest, go to homepage" },
  primaryNavAria: { id: "Utama", en: "Primary" },
  primaryNavMobileAria: { id: "Utama mobile", en: "Primary (mobile)" },
  openMenuAria: { id: "Buka menu navigasi", en: "Open navigation menu" },
  closeMenuAria: { id: "Tutup menu navigasi", en: "Close navigation menu" },
  appearance: { id: "Tampilan", en: "Appearance" },
  userFallback: { id: "Pengguna", en: "User" },
  switchToEn: { id: "Switch to English", en: "Switch to English" },
  switchToId: { id: "Ganti ke Bahasa Indonesia", en: "Ganti ke Bahasa Indonesia" },
} satisfies Record<string, Localized>;
