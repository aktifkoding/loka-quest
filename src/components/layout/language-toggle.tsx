"use client";

import { useEffect, useState } from "react";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLang, setLang, type Lang } from "@/lib/i18n";

export function LanguageToggle() {
  const [lang, setCurrent] = useState<Lang>("id");

  useEffect(() => {
    setCurrent(getLang());
  }, []);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        const next: Lang = lang === "id" ? "en" : "id";
        setLang(next);
        setCurrent(next);
        window.location.reload();
      }}
      aria-label={lang === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"}
      title={lang === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"}
    >
      <Languages className="size-4" aria-hidden="true" />
      <span className="text-xs font-semibold uppercase">{lang}</span>
    </Button>
  );
}
