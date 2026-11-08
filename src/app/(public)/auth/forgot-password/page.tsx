"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MailCheck, Gamepad2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";
import { authDict as d } from "@/lib/i18n/dict/auth";
import { commonDict } from "@/lib/i18n/dict/common";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const { t } = useI18n();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(true);
    } catch {
      setError(t(d.errorTryAgain));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-up mx-auto w-full max-w-[400px] px-4 py-16 md:py-24">
      <div className="mb-8 flex items-center justify-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Gamepad2 className="size-5" aria-hidden="true" />
        </span>
        <span className="font-display text-lg font-semibold">LokaQuest</span>
      </div>
      {success ? (
        <div className="animate-scale-in text-center">
          <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MailCheck className="size-5" aria-hidden="true" />
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {t(d.resetSuccessHeading)}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {t(d.resetSuccessIfPrefix)}{" "}
            <span className="font-medium text-foreground">{email}</span>{" "}
            {t(d.resetSuccessRest)}
          </p>
          <Button variant="outline" asChild className="mt-6">
            <Link href="/auth/login">{t(d.backToLoginCta)}</Link>
          </Button>
        </div>
      ) : (
        <>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            {t(d.forgotHeading)}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t(d.forgotSub)}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t(d.labelEmail)}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={t(d.placeholderEmail)}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  {t(commonDict.sending)}
                </>
              ) : (
                t(d.sendLinkCta)
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {t(d.rememberPassword)}{" "}
              <Link
                href="/auth/login"
                className="font-medium text-primary hover:underline"
              >
                {t(d.signInCta)}
              </Link>
            </p>
          </form>
        </>
      )}
    </div>
  );
}
