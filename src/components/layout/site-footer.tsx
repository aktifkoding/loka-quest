import Link from "next/link";
import { Gamepad2 } from "lucide-react";
import { type Localized } from "@/lib/i18n";
import { getServerI18n } from "@/lib/i18n/server";
import { navDict } from "@/lib/i18n/dict/nav";
import { shellDict as d } from "@/lib/i18n/dict/shell";

const FOOTER_LINKS: { href: string; label: Localized }[] = [
  { href: "/jelajahi", label: navDict.graph },
  { href: "/komunitas", label: navDict.community },
  { href: "/asisten", label: navDict.assistant },
  { href: "/explore", label: navDict.explore },
  { href: "/missions", label: navDict.missions },
  { href: "/encyclopedia", label: navDict.encyclopedia },
  { href: "/sumber", label: d.footerSources },
  { href: "/leaderboard", label: { id: "Leaderboard", en: "Leaderboard" } },
  { href: "/tentang", label: d.footerAbout },
];

/** Footer bersama untuk semua halaman publik — tenang, tematik, tanpa ribut. */
export async function SiteFooter() {
  const { t } = await getServerI18n();

  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <p className="flex items-center gap-2 font-display text-lg font-semibold">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Gamepad2 className="size-4" aria-hidden="true" />
              </span>
              LokaQuest
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {t(d.footerTagline)}
            </p>
            <div className="tenun mt-5 w-24" aria-hidden="true" />
          </div>
          <nav
            className="grid grid-cols-2 gap-x-12 gap-y-2.5 text-sm sm:grid-cols-3"
            aria-label={t(d.footerAria)}
          >
            {FOOTER_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                {t(label)}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-10 text-[13px] text-muted-foreground">
          {t(d.footerCopyright)}
        </p>
      </div>
    </footer>
  );
}
