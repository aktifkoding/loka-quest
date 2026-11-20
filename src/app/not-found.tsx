import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getServerI18n } from "@/lib/i18n/server";
import { commonDict } from "@/lib/i18n/dict/common";
import { shellDict as d } from "@/lib/i18n/dict/shell";
import { BatikHeritageBackground } from "@/components/landing/batik-heritage-background";
import { LokaQuestLogo } from "@/components/layout/lokaquest-logo";

export default async function NotFound() {
  const { t } = await getServerI18n();

  return (
    <BatikHeritageBackground
      className="flex min-h-[75vh] items-center justify-center px-4 py-16 text-center text-stone-100"
      patternOpacity={0.85}
    >
      <div className="mx-auto flex max-w-md flex-col items-center">
        <LokaQuestLogo size="md" tone="dark" showSubtitle />
        <p className="mt-8 bg-gradient-to-b from-[#F7E392] via-[#D4AF37] to-[#9C6B3B] bg-clip-text font-display text-8xl font-bold tabular-nums text-transparent">
          404
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-stone-50">
          {t(d.notFoundTitle)}
        </h1>
        <p className="mt-3 max-w-sm leading-relaxed text-stone-300">
          {t(d.notFoundBody)}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="bg-[#D4AF37] text-[#121214] hover:bg-[#e0be4c]"
          >
            <Link href="/">{t(commonDict.backHome)}</Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            asChild
            className="border-[#D4AF37]/40 bg-white/5 text-stone-100 hover:bg-[#D4AF37]/15 hover:text-stone-50"
          >
            <Link href="/explore">{t(d.exploreRegion)}</Link>
          </Button>
        </div>
      </div>
    </BatikHeritageBackground>
  );
}
