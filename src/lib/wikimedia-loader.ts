import type { ImageLoaderProps } from "next/image";

/**
 * Loader next/image khusus untuk LokaQuest.
 *
 * Wikimedia membatasi fetch sisi-server (UA bawaan Node dikunci 429), jadi
 * URL Wikimedia diarahkan ke CDN resmi thumb.wikimedia.org pada ukuran yang
 * pas dan dibiarkan diambil langsung oleh browser. Host lain dikembalikan
 * apa adanya (mis. Supabase Storage sudah berukuran siap pakai).
 */

const WIDTH_BUCKETS = [320, 640, 960, 1280, 1920] as const;

function nextBucket(width: number): number {
  for (const bucket of WIDTH_BUCKETS) {
    if (width <= bucket) return bucket;
  }
  return WIDTH_BUCKETS[WIDTH_BUCKETS.length - 1];
}

export function wikimediaLoader({ src, width }: ImageLoaderProps): string {
  // Buang query tracking (?utm_source=...) agar tidak merusak path thumbnail.
  const clean = src.split("?")[0];

  // Sudah berupa URL thumbnail Wikimedia? Pakai apa adanya.
  if (clean.includes("thumb.wikimedia.org")) return clean;

  // upload.wikimedia.org/wikipedia/commons/<a>/<b>/<File>
  //   -> thumb.wikimedia.org/wikipedia/commons/thumb/<a>/<b>/<File>/<W>px-<File>
  const commonsFile = clean.match(
    /^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/([0-9a-f]\/[0-9a-f]{2}\/(.+))$/,
  );
  if (commonsFile) {
    const [, path, filename] = commonsFile;
    return `https://thumb.wikimedia.org/wikipedia/commons/thumb/${path}/${nextBucket(width)}px-${filename}`;
  }

  return clean;
}

// next.config `images.loaderFile` belum didukung Turbopack (Next 15.5),
// jadi loader dilewatkan sebagai prop pada setiap <Image>.
export default wikimediaLoader;
