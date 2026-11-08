"use client";

import { useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { encyclopediaDict as d } from "@/lib/i18n/dict/encyclopedia";

export function ReadingHistoryTracker({ articleId }: { articleId: string }) {
  const { t } = useI18n();
  useEffect(() => {
    if (localStorage.getItem("lq-encyclopedia-history") !== "on") return;
    void fetch("/api/v1/encyclopedia/collections", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({articleId,progress:0}) });
  }, [articleId]);
  return <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-muted-foreground"><input type="checkbox" aria-label={t(d.saveHistoryAria)} defaultChecked={typeof window !== "undefined" && window.localStorage.getItem("lq-encyclopedia-history") === "on"} onChange={(event)=>{localStorage.setItem("lq-encyclopedia-history",event.target.checked?"on":"off");}}/>{t(d.saveHistoryLabel)}</label>;
}
