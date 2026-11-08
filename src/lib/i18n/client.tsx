"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { LANG_COOKIE, parseLang, type Lang, type Localized } from "./types";

type TFn = (value: Localized, vars?: Record<string, string | number>) => string;

/**
 * Bahasa aktif di-seed dari server (root layout membaca cookie) sehingga
 * render awal klien selalu cocok dengan HTML dari server — tanpa kedip.
 */
const I18nContext = createContext<Lang>("id");

export function I18nProvider({
  lang,
  children,
}: {
  lang: Lang;
  children: ReactNode;
}) {
  return <I18nContext.Provider value={lang}>{children}</I18nContext.Provider>;
}

export function useI18n(): { lang: Lang; t: TFn } {
  const lang = useContext(I18nContext);
  const t = useMemo<TFn>(
    () => (value, vars) => {
      const text = value[lang];
      if (!vars) return text;
      return text.replace(/\{(\w+)\}/g, (match, key: string) =>
        key in vars ? String(vars[key]) : match,
      );
    },
    [lang],
  );
  return { lang, t };
}

/** Baca bahasa dari browser — untuk komponen di luar provider (mis. global-error). */
export function getClientLang(): Lang {
  if (typeof document === "undefined") return "id";
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${LANG_COOKIE}=(id|en)`),
  );
  if (match) return parseLang(match[1]);
  const stored = window.localStorage.getItem(LANG_COOKIE);
  return parseLang(stored);
}

/** Simpan pilihan bahasa (cookie + localStorage) lalu sinkronkan <html lang>. */
export function setClientLang(lang: Lang) {
  if (typeof document === "undefined") return;
  document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
  window.localStorage.setItem(LANG_COOKIE, lang);
  document.documentElement.lang = lang;
}
