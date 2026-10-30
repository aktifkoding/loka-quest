import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="batik-grid flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-7xl font-semibold tabular-nums text-primary/30">
        404
      </p>
      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">
        Jalan ini belum terpetakan
      </h1>
      <p className="mt-3 max-w-sm leading-relaxed text-muted-foreground">
        Halaman yang kamu cari tidak ada atau sudah dipindahkan. Mari kembali
        ke jalur petualangan budaya.
      </p>
      <div className="mt-7 flex gap-3">
        <Button asChild>
          <Link href="/">Ke beranda</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/explore">Jelajahi wilayah</Link>
        </Button>
      </div>
    </div>
  );
}
