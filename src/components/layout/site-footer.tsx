import Link from "next/link";
import { Gamepad2 } from "lucide-react";

const FOOTER_LINKS: [string, string][] = [
  ["Grafik Budaya", "/jelajahi"],
  ["Komunitas", "/komunitas"],
  ["Asisten AI", "/asisten"],
  ["Jelajahi", "/explore"],
  ["Misi", "/missions"],
  ["Ensiklopedia", "/encyclopedia"],
  ["Sumber budaya", "/sumber"],
  ["Leaderboard", "/leaderboard"],
  ["Tentang", "/tentang"],
];

/** Footer bersama untuk semua halaman publik — tenang, tematik, tanpa ribut. */
export function SiteFooter() {
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
              Jelajahi Nusantara, hidupkan warisan budaya.
            </p>
            <div className="tenun mt-5 w-24" aria-hidden="true" />
          </div>
          <nav
            className="grid grid-cols-2 gap-x-12 gap-y-2.5 text-sm sm:grid-cols-3"
            aria-label="Footer"
          >
            {FOOTER_LINKS.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-10 text-[13px] text-muted-foreground">
          © 2026 LokaQuest. Konten budaya disertai sumber referensi.
        </p>
      </div>
    </footer>
  );
}
