import type { MetadataRoute } from "next";
import { getServerI18n } from "@/lib/i18n/server";
import { appMetaDict as meta } from "@/lib/i18n/dict/common";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { lang, t } = await getServerI18n();

  return {
    name: t(meta.manifestName),
    short_name: "LokaQuest",
    description: t(meta.manifestDescription),
    start_url: "/",
    display: "standalone",
    background_color: "#faf7f0",
    theme_color: "#2b3a85",
    lang,
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
