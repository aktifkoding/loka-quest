"use client";

// Error boundary per-route. menampilkan pesan ramah bergaya LokaQuest
// dengan opsi mencoba lagi — bukan layar putih polos.
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Compass, RotateCcw } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { commonDict } from "@/lib/i18n/dict/common";
import { shellDict as d } from "@/lib/i18n/dict/shell";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();

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
        {t(d.errorTitle)}
      </h1>
      <p className="mt-3 text-balance leading-relaxed text-muted-foreground">
        {t(d.errorBody)}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>
          <RotateCcw className="size-4" aria-hidden="true" />
          {t(commonDict.retry)}
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">{t(commonDict.backHome)}</Link>
        </Button>
      </div>
      {error.digest ? (
        <p className="mt-6 text-xs text-muted-foreground/70">
          {t(d.errorCode, { code: error.digest })}
        </p>
      ) : null}
    </div>
  );
}
