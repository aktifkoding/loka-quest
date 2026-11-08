import { LOCALE_BY_LANG, type Lang } from "./types";

type DateInput = Date | string | number;

/** Angka mengikuti bahasa aktif (id-ID / en-US). */
export function formatNumber(
  value: number,
  lang: Lang,
  options?: Intl.NumberFormatOptions,
): string {
  return value.toLocaleString(LOCALE_BY_LANG[lang], options);
}

/** Tanggal saja — default gaya "medium" (mis. "8 Nov 2026" / "Nov 8, 2026"). */
export function formatDate(
  value: DateInput,
  lang: Lang,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString(
    LOCALE_BY_LANG[lang],
    options ?? { dateStyle: "medium" },
  );
}

/** Tanggal + jam (mis. log audit, pengajuan admin). */
export function formatDateTime(
  value: DateInput,
  lang: Lang,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleString(LOCALE_BY_LANG[lang], options);
}
