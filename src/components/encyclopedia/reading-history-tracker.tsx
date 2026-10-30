"use client";

import { useEffect } from "react";

export function ReadingHistoryTracker({ articleId }: { articleId: string }) {
  useEffect(() => {
    if (localStorage.getItem("lq-encyclopedia-history") !== "on") return;
    void fetch("/api/v1/encyclopedia/collections", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({articleId,progress:0}) });
  }, [articleId]);
  return <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-muted-foreground"><input type="checkbox" aria-label="Simpan riwayat baca" defaultChecked={typeof window !== "undefined" && window.localStorage.getItem("lq-encyclopedia-history") === "on"} onChange={(event)=>{localStorage.setItem("lq-encyclopedia-history",event.target.checked?"on":"off");}}/>Simpan riwayat baca di perangkat ini</label>;
}
