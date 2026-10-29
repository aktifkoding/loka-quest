import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "LokaQuest — Jelajahi Nusantara, Hidupkan Warisan Budaya",
  description:
    "Aplikasi pembelajaran budaya Indonesia yang interaktif dan mengasyikkan. Jelajahi warisan Nusantara melalui permainan edukatif.",
  keywords: ["budaya", " Indonesia", "edukasi", "game", "batik", "gamelan", "wayang"],
  authors: [{ name: "LokaQuest Team" }],
  openGraph: {
    title: "LokaQuest — Jelajahi Nusantara",
    description: "Hidupkan warisan budaya Indonesia melalui permainan edukatif",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <Navbar />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
