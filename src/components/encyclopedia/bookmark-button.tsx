"use client";

import { useState } from "react";
import { BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BookmarkButton({ articleId }: { articleId: string }) {
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
      if (response.status === 401) { setMessage("Masuk untuk menyimpan artikel."); return; }
      if (!response.ok) throw new Error();
      setSaved(!saved);
      setMessage(saved ? "Artikel dihapus dari favorit." : "Artikel disimpan ke favorit.");
    } catch { setMessage("Favorit belum dapat diperbarui. Silakan coba kembali."); }
    finally { setBusy(false); }
  }
  return <div><Button type="button" variant="outline" size="sm" onClick={toggle} disabled={busy} aria-pressed={saved}><BookmarkCheck className="size-4" aria-hidden="true"/>Simpan</Button><span className="sr-only" aria-live="polite">{message}</span></div>;
}
