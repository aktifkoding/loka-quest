"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getConsent, setConsent, trackEvent } from "@/lib/analytics-client";

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getConsent() === null);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Persetujuan analitik"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl rounded-2xl border border-border bg-card p-4 shadow-xl md:left-auto md:right-6 md:mx-0"
    >
      <p className="text-sm leading-relaxed">
        Kami ingin memahami fitur mana yang dipakai agar LokaQuest lebih baik.
        Analitik bersifat opsional dan tidak memuat data pribadi.{" "}
        <Link href="/tentang" className="text-primary underline-offset-4 hover:underline">
          Pelajari
        </Link>
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={() => {
            setConsent("granted");
            trackEvent("consent_granted");
            setVisible(false);
          }}
        >
          Izinkan
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setConsent("denied");
            setVisible(false);
          }}
        >
          Tolak
        </Button>
      </div>
    </div>
  );
}
