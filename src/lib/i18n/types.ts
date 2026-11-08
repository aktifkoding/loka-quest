export type Lang = "id" | "en";

/**
 * Sepasang terjemahan untuk satu teks UI. Entri id/en ditulis berdampingan
 * agar kamus mudah direview dan tidak ada bahasa yang tertinggal.
 */
export type Localized = { readonly id: string; readonly en: string };

export const LANG_COOKIE = "lokaquest-lang";

export const LOCALE_BY_LANG: Record<Lang, string> = {
  id: "id-ID",
  en: "en-US",
};

export function parseLang(raw: string | undefined | null): Lang {
  return raw === "en" ? "en" : "id";
}

/** Terjemahkan pasangan teks sesuai bahasa aktif. */
export function t(value: Localized, lang: Lang): string {
  return value[lang];
}

/** Sisipkan variabel ke template kamus, mis. "Halaman {x} dari {y}". */
export function fill(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}
