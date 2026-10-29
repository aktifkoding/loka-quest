import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";

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

export const metadata: Metadata = {
  title: {
    default: "LokaQuest — Jelajahi Nusantara, Hidupkan Warisan Budaya",
    template: "%s · LokaQuest",
  },
  description:
    "Aplikasi pembelajaran budaya Indonesia yang interaktif. Kenali batik, gamelan, dan wayang lewat misi permainan yang dinilai otomatis.",
  keywords: [
    "budaya Indonesia",
    "edukasi",
    "game edukatif",
    "batik",
    "gamelan",
    "wayang",
  ],
  authors: [{ name: "LokaQuest Team" }],
  openGraph: {
    title: "LokaQuest — Jelajahi Nusantara",
    description:
      "Hidupkan warisan budaya Indonesia melalui permainan edukatif yang interaktif.",
    type: "website",
    locale: "id_ID",
    siteName: "LokaQuest",
  },
};

export const viewport: Viewport = {
  themeColor: "#faf7f0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} font-sans antialiased`}
      >
        <Navbar />
        <main className="min-h-screen pt-24">{children}</main>
      </body>
    </html>
  );
}
