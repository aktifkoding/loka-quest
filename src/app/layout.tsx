import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { ConsentBanner } from "@/components/layout/consent-banner";
import { I18nProvider } from "@/lib/i18n";
import { getServerI18n, getServerLang } from "@/lib/i18n/server";
import { appMetaDict as meta, metaKeywords } from "@/lib/i18n/dict/common";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getServerI18n();
  return {
    title: {
      default: t(meta.title),
      template: "%s · LokaQuest",
    },
    description: t(meta.description),
    keywords: metaKeywords[lang],
    authors: [{ name: "LokaQuest Team" }],
    openGraph: {
      title: t(meta.ogTitle),
      description: t(meta.ogDescription),
      type: "website",
      locale: lang === "en" ? "en_US" : "id_ID",
      siteName: "LokaQuest",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#faf7f0",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = await getServerLang();

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        {/* Terapkan tema tersimpan sebelum paint agar tidak ada kedipan terang/gelap */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("lq-theme");if(t==="dark"){document.documentElement.classList.add("dark")}}catch(e){}`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} font-sans antialiased`}
      >
        <I18nProvider lang={lang}>
          <Navbar />
          <main className="min-h-screen pt-24">{children}</main>
          <ConsentBanner />
        </I18nProvider>
      </body>
    </html>
  );
}
