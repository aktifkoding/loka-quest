"use client";

// Error boundary per-route. menampilkan pesan ramah bergaya LokaQuest
// dengan opsi mencoba lagi — bukan layar putih polos.
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Compass, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Kirim ke observability agar kegagalan terlacak di server log
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-gold/15 text-gold">
        <Compass className="size-7" aria-hidden="true" />
      </span>
      <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight">
        Peta tersesat sejenak
      </h1>
      <p className="mt-3 text-balance leading-relaxed text-muted-foreground">
        Ada yang keliru saat menampilkan halaman ini. Peralatanmu dan progres
        belajar tetap aman — coba lagi, atau kembali menelusuri dari awal.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>
          <RotateCcw className="size-4" aria-hidden="true" />
          Coba lagi
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Ke beranda</Link>
        </Button>
      </div>
      {error.digest ? (
        <p className="mt-6 text-xs text-muted-foreground/70">
          Kode galat: {error.digest}
        </p>
      ) : null}
    </div>
  );
}
