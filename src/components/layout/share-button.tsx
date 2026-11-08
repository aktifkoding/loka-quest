"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { commonDict } from "@/lib/i18n/dict/common";
import { shellDict as d } from "@/lib/i18n/dict/shell";

export function ShareButton({ title, text }: { title: string; text: string }) {
  const { t } = useI18n();

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        /* pengguna membatalkan */
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert(t(d.linkCopied));
      } catch {
        /* abaikan */
      }
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={share}>
      <Share2 className="size-4" aria-hidden="true" />
      {t(commonDict.share)}
    </Button>
  );
}
