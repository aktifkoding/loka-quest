import { cookies } from "next/headers";
import { LANG_COOKIE, parseLang, type Lang, type Localized } from "./types";

/** Baca bahasa aktif di server component / generateMetadata / manifest. */
export async function getServerLang(): Promise<Lang> {
  const store = await cookies();
  return parseLang(store.get(LANG_COOKIE)?.value);
}

/** Bahasa + helper t yang sudah terikat, untuk server component. */
export async function getServerI18n(): Promise<{
  lang: Lang;
  t: (value: Localized, vars?: Record<string, string | number>) => string;
}> {
  const lang = await getServerLang();
  return { lang, t: bindT(lang) };
}

export function bindT(lang: Lang) {
  return (value: Localized, vars?: Record<string, string | number>): string => {
    const text = value[lang];
    if (!vars) return text;
    return text.replace(/\{(\w+)\}/g, (match, key: string) =>
      key in vars ? String(vars[key]) : match,
    );
  };
}

/** Baca bahasa dari header Cookie untuk route handler / API. */
export function getLangFromRequest(req: Request): Lang {
  const header = req.headers.get("cookie") ?? "";
  const match = header.match(new RegExp(`(?:^|;\\s*)${LANG_COOKIE}=(id|en)`));
  return parseLang(match?.[1]);
}
