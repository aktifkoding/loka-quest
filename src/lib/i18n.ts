"use client";

export type Lang = "id" | "en";

const COOKIE = "lokaquest-lang";

export function getLang(): Lang {
  if (typeof document === "undefined") return "id";
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=(id|en)`));
  if (match) return match[1] as Lang;
  return (window.localStorage.getItem(COOKIE) as Lang) || "id";
}

export function setLang(lang: Lang) {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
  window.localStorage.setItem(COOKIE, lang);
  document.documentElement.lang = lang;
}

export const dictionary = {
  id: {
    encyclopedia: "Ensiklopedia",
    explore: "Jelajahi",
    missions: "Misi",
    graph: "Grafik Budaya",
    community: "Komunitas",
    assistant: "Asisten AI",
    dashboard: "Dasbor",
    login: "Masuk",
    register: "Daftar",
    logout: "Keluar",
    language: "Bahasa",
  },
  en: {
    encyclopedia: "Encyclopedia",
    explore: "Explore",
    missions: "Missions",
    graph: "Culture Graph",
    community: "Community",
    assistant: "AI Assistant",
    dashboard: "Dashboard",
    login: "Sign in",
    register: "Sign up",
    logout: "Sign out",
    language: "Language",
  },
} as const;
