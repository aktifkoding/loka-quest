"use client";

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n, setClientLang, type Lang } from "@/lib/i18n";
import { navDict as d } from "@/lib/i18n/dict/nav";

export function LanguageToggle() {
  const { lang, t } = useI18n();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        const next: Lang = lang === "id" ? "en" : "id";
        setClientLang(next);
        window.location.reload();
      }}
      aria-label={lang === "id" ? t(d.switchToEn) : t(d.switchToId)}
      title={lang === "id" ? t(d.switchToEn) : t(d.switchToId)}
    >
      <Languages className="size-4" aria-hidden="true" />
      <span className="text-xs font-semibold uppercase">{lang}</span>
    </Button>
  );
}
