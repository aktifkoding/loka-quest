"use client";

import Image from "next/image";
import { wikimediaLoader } from "@/lib/wikimedia-loader";

type WikimediaImageProps = Omit<React.ComponentProps<typeof Image>, "loader">;

/**
 * Pembungkus next/image untuk foto Wikimedia agar bisa dipakai dari
 * Server Component: fungsi loader tidak bisa dikirim langsung dari server,
 * jadi ia dipasang di dalam batas Client Component ini.
 */
export function WikimediaImage({ alt, ...props }: WikimediaImageProps) {
  return <Image alt={alt} {...props} loader={wikimediaLoader} />;
}
