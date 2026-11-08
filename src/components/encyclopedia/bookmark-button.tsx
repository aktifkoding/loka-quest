"use client";

import { useState } from "react";
import { BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { commonDict } from "@/lib/i18n/dict/common";
import { encyclopediaDict as d } from "@/lib/i18n/dict/encyclopedia";

export function BookmarkButton({ articleId }: { articleId: string }) {
  const { t } = useI18n();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function toggle() {
    if (busy) return;
    setBusy(true); setMessage("");
    try {
      const response = await fetch(saved ? `/api/v1/encyclopedia/bookmarks/${articleId}` : "/api/v1/encyclopedia/bookmarks", {
        method: saved ? "DELETE" : "POST",
        headers: saved ? undefined : { "Content-Type": "application/json" },
        body: saved ? undefined : JSON.stringify({ articleId }),
      });
      if (response.status === 401) { setMessage(t(d.bookmarkAuthMessage)); return; }
      if (!response.ok) throw new Error();
      setSaved(!saved);
      setMessage(saved ? t(d.bookmarkRemoved) : t(d.bookmarkAdded));
    } catch { setMessage(t(d.bookmarkUpdateError)); }
    finally { setBusy(false); }
  }
  return <div><Button type="button" variant="outline" size="sm" onClick={toggle} disabled={busy} aria-pressed={saved}><BookmarkCheck className="size-4" aria-hidden="true"/>{t(commonDict.save)}</Button><span className="sr-only" aria-live="polite">{message}</span></div>;
}
