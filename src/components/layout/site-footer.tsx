import Link from "next/link";
import { Gamepad2 } from "lucide-react";
import { type Localized } from "@/lib/i18n";
import { getServerI18n } from "@/lib/i18n/server";
import { navDict } from "@/lib/i18n/dict/nav";
import { shellDict as d } from "@/lib/i18n/dict/shell";
import { BatikHeritageBackground } from "@/components/landing/batik-heritage-background";
import {
  FooterBackToTop,
  FooterMotifGallery,
} from "@/components/layout/footer-heritage-interactive";

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

/** Footer bersama untuk semua halaman publik — bernuansa warisan Nusantara interaktif. */
export async function SiteFooter() {
  const { lang, t } = await getServerI18n();

  return (
    <footer className="relative border-t border-[#D4AF37]/20 text-stone-100">
      <div className="footer-tenun-border" aria-hidden="true" />
      <BatikHeritageBackground
        patternOpacity={0.55}
        parallaxStrength={16}
        driftSpeed={0.55}
      >
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-14">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-md">
              <Link
                href="/"
                className="group inline-flex items-center gap-2.5 font-display text-lg font-semibold text-stone-50 transition-colors hover:text-[#D4AF37]"
              >
                <span className="flex size-8 items-center justify-center rounded-lg border border-[#D4AF37]/40 bg-[#D4AF37]/15 text-[#D4AF37] transition-transform duration-300 group-hover:scale-105">
                  <Gamepad2 className="size-4" aria-hidden="true" />
                </span>
                <span>LokaQuest</span>
              </Link>
              <p className="mt-3 text-sm leading-relaxed text-stone-300">
                {t(d.footerTagline)}
              </p>

              <FooterMotifGallery lang={lang} />
            </div>

            <nav
              className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm sm:grid-cols-3 lg:pt-1"
              aria-label={t(d.footerAria)}
            >
              {FOOTER_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="footer-link-item group inline-flex w-fit items-center gap-1.5 text-stone-300 hover:translate-x-0.5 hover:text-[#D4AF37] focus-visible:text-[#D4AF37]"
                >
                  <span
                    className="size-1 rounded-full bg-[#D4AF37]/40 transition-all duration-200 group-hover:scale-125 group-hover:bg-[#D4AF37]"
                    aria-hidden="true"
                  />
                  <span>{t(label)}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-stone-800/80 pt-6 sm:flex-row sm:items-center">
            <p className="text-[13px] text-stone-400">
              {t(d.footerCopyright)}
            </p>
            <FooterBackToTop lang={lang} />
          </div>
        </div>
      </BatikHeritageBackground>
    </footer>
  );
}
