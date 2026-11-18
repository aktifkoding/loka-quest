"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";
import { authDict as d } from "@/lib/i18n/dict/auth";
import { Button } from "@/components/ui/button";
import { Gamepad2, MailCheck } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClient();
  const { t } = useI18n();

  // Registration flow lands here with ?registered=true — email confirmation
  // is on, so there is no session yet and the user must verify first.
  const [awaitingVerification, setAwaitingVerification] = useState(false);

  useEffect(() => {
    const handleAuthCallback = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        router.push("/player/dashboard");
      } else if (params.get("registered") === "true") {
        setAwaitingVerification(true);
      } else {
        router.push("/auth/login");
      }
    };

    handleAuthCallback();
  }, [router, supabase.auth, params]);

  if (awaitingVerification) {
    return (
      <div className="mx-auto w-full max-w-[440px] px-4 py-20 text-center">
        <MailCheck className="mx-auto size-12 text-primary" aria-hidden="true" />
        <h1 className="mt-4 font-display text-2xl font-semibold">
          {t(d.verifyEmailTitle)}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {t(d.verifyEmailDescription)}
        </p>
        <Button asChild className="mt-6">
          <Link href="/auth/login">{t(d.backToLoginCta)}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="animate-fade-up text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-raised">
          <Gamepad2 className="size-7" aria-hidden="true" />
        </span>
        <p className="mt-4 font-display text-lg font-semibold">{t(d.preparingSession)}</p>
        <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
          {t(d.processingAuth)}
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="animate-typing-dot size-1.5 rounded-full bg-primary/60"
              style={{ animationDelay: `${i * 160}ms` }}
              aria-hidden="true"
            />
          ))}
        </p>
      </div>
    </div>
  );
}
