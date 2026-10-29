import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LokaQuest — Jelajahi Nusantara",
    short_name: "LokaQuest",
    description:
      "Aplikasi pembelajaran budaya Indonesia yang interaktif: batik, gamelan, dan wayang lewat misi permainan.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf7f0",
    theme_color: "#2b3a85",
    lang: "id",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
