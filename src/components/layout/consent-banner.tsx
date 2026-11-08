"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getConsent, setConsent, trackEvent } from "@/lib/analytics-client";
import { useI18n } from "@/lib/i18n";
import { shellDict as d } from "@/lib/i18n/dict/shell";

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    setVisible(getConsent() === null);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label={t(d.consentAria)}
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl rounded-2xl border border-border bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-xl md:left-auto md:right-6 md:mx-0"
    >
      <p className="text-sm leading-relaxed">
        {t(d.consentBody)}{" "}
        <Link href="/tentang" className="text-primary underline-offset-4 hover:underline">
          {t(d.consentLearnMore)}
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
          {t(d.consentAllow)}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setConsent("denied");
            setVisible(false);
          }}
        >
          {t(d.consentDeny)}
        </Button>
      </div>
    </div>
  );
}
