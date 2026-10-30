"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ShareButton({ title, text }: { title: string; text: string }) {
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
        alert("Tautan disalin ke clipboard");
      } catch {
        /* abaikan */
      }
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={share}>
      <Share2 className="size-4" aria-hidden="true" />
      Bagikan
    </Button>
  );
}
