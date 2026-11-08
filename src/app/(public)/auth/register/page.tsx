"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Eye, EyeOff, Gamepad2, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";
import { authDict as d } from "@/lib/i18n/dict/auth";
import { cn } from "@/lib/utils";

const RULES = [
  { label: d.ruleMinLength, test: (v: string) => v.length >= 8 },
  {
    label: d.ruleUpperLower,
    test: (v: string) => /[A-Z]/.test(v) && /[a-z]/.test(v),
  },
  { label: d.ruleDigit, test: (v: string) => /[0-9]/.test(v) },
];

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { t } = useI18n();

  // Live password hint appears only after the user starts typing
  const touched = password.length > 0;
  const ruleStates = useMemo(
    () => RULES.map((rule) => ({ ...rule, passed: rule.test(password) })),
    [password]
  );
  const allPassed = ruleStates.every((r) => r.passed);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!allPassed) {
      setError(t(d.passwordNotMet));
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) {
        setError(
          error.message.includes("already registered")
            ? t(d.emailAlreadyRegistered)
            : error.message
        );
        return;
      }

      router.push("/auth/callback?registered=true");
    } catch {
      setError(t(d.errorTryAgain));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-2 md:items-center md:gap-16 md:py-16">
      {/* Brand panel */}
      <aside className="batik-grid animate-fade-up hidden rounded-3xl border border-border/60 bg-secondary/70 p-8 md:block">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Gamepad2 className="size-4" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-semibold">LokaQuest</span>
        </div>

        <div className="mt-10 rounded-2xl border border-border/70 bg-card p-6 shadow-card">
          <p className="font-display text-lg font-semibold leading-snug">
            {t(d.progressHeading)}
          </p>
          <div
            className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted"
            role="presentation"
          >
            <div className="h-full w-2/5 rounded-full bg-primary" />
          </div>
          <p className="mt-3 text-sm tabular-nums text-muted-foreground">
            {t(d.xpProgress)}
          </p>
          <div className="mt-4 flex items-center gap-2 border-t border-border pt-4 text-sm">
            <span className="rounded-full bg-gold/10 px-2.5 py-1 font-semibold tabular-nums text-gold">
              +150
            </span>
            <span className="text-muted-foreground">
              {t(d.xpFromFirstMission)}
            </span>
          </div>
        </div>

        <p className="mt-10 border-t border-border pt-6 text-[13px] leading-relaxed text-muted-foreground">
          {t(d.registerPrivacyCopy)}
        </p>
      </aside>

      {/* Form */}
      <div className="animate-fade-up mx-auto w-full max-w-[400px]" style={{ animationDelay: "120ms" }}>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {t(d.registerHeading)}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {t(d.registerSub)}
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
            <Label htmlFor="fullName">{t(d.labelFullName)}</Label>
            <Input
              id="fullName"
              type="text"
              autoComplete="name"
              placeholder={t(d.placeholderFullName)}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              minLength={2}
            />
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="password">{t(d.labelPassword)}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder={t(d.newPasswordPlaceholder)}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword ? t(d.hidePasswordAria) : t(d.showPasswordAria)
                }
                className="absolute right-1 top-1 flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="size-4" aria-hidden="true" />
                ) : (
                  <Eye className="size-4" aria-hidden="true" />
                )}
              </button>
            </div>

            {touched && (
              <ul className="space-y-1.5 pt-1" aria-live="polite">
                {ruleStates.map((rule) => (
                  <li
                    key={rule.label.en}
                    className={cn(
                      "flex items-center gap-2 text-[13px]",
                      rule.passed ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {rule.passed ? (
                      <Check className="size-3.5" aria-hidden="true" />
                    ) : (
                      <X className="size-3.5" aria-hidden="true" />
                    )}
                    {t(rule.label)}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                {t(d.processing)}
              </>
            ) : (
              t(d.createAccountCta)
            )}
          </Button>

          <p className="text-center text-[13px] leading-relaxed text-muted-foreground">
            {t(d.consentCopy)}
          </p>

          <p className="text-center text-sm text-muted-foreground">
            {t(d.haveAccount)}{" "}
            <Link href="/auth/login" className="font-medium text-primary hover:underline">
              {t(d.signInCta)}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
