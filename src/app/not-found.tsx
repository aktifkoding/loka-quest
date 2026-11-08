import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getServerI18n } from "@/lib/i18n/server";
import { commonDict } from "@/lib/i18n/dict/common";
import { shellDict as d } from "@/lib/i18n/dict/shell";

export default async function NotFound() {
  const { t } = await getServerI18n();

  return (
    <div className="batik-grid flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-7xl font-semibold tabular-nums text-primary/30">
        404
      </p>
      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">
        {t(d.notFoundTitle)}
      </h1>
      <p className="mt-3 max-w-sm leading-relaxed text-muted-foreground">
        {t(d.notFoundBody)}
      </p>
      <div className="mt-7 flex gap-3">
        <Button asChild>
          <Link href="/">{t(commonDict.backHome)}</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/explore">{t(d.exploreRegion)}</Link>
        </Button>
      </div>
    </div>
  );
}
