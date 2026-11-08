"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Gamepad2, Loader2, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";
import { authDict as d } from "@/lib/i18n/dict/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { t } = useI18n();

  const startDemo = async () => {
    setDemoLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/auth/demo", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || t(d.demoError));
      router.push("/player/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t(d.demoError));
      setDemoLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(
          error.message === "Invalid login credentials"
            ? t(d.invalidCredentials)
            : error.message
        );
        return;
      }

      router.push("/player/dashboard");
      router.refresh();
    } catch {
      setError(t(d.errorTryAgain));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-2 md:items-center md:gap-16 md:py-16">
      {/* Brand panel — tinted neutral, one proof asset, trust footer */}
      <aside className="batik-grid animate-fade-up hidden rounded-3xl border border-border/60 bg-secondary/70 p-8 md:block">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Gamepad2 className="size-4" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-semibold">LokaQuest</span>
        </div>

        <div className="mt-10 rounded-2xl border border-border/70 bg-card p-6 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-medium text-muted-foreground">
              {t(d.demoMissionName)}
            </p>
            <p className="text-[13px] font-semibold tabular-nums text-gold">
              150 XP
            </p>
          </div>
          <p className="mt-3 font-display text-lg font-semibold leading-snug">
            {t(d.demoQuestion)}
          </p>
          <div className="mt-4 space-y-2 text-sm" role="presentation">
            <p className="rounded-lg border border-primary/40 bg-primary/10 px-4 py-2.5 font-medium text-primary">
              Parang Rusak
            </p>
            <p className="rounded-lg border border-border px-4 py-2.5 text-muted-foreground">
              Kawung
            </p>
          </div>
        </div>

        <p className="mt-10 border-t border-border pt-6 text-[13px] leading-relaxed text-muted-foreground">
          {t(d.trustCopy)}
        </p>
      </aside>

      {/* Form column — 360-400px, speed is the design */}
      <div className="animate-fade-up mx-auto w-full max-w-[400px]" style={{ animationDelay: "120ms" }}>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {t(d.loginHeading)}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {t(d.loginSub)}
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t(d.labelPassword)}</Label>
              <Link
                href="/auth/forgot-password"
                className="text-[13px] font-medium text-primary hover:underline"
              >
                {t(d.forgotLink)}
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder={t(d.loginPasswordPlaceholder)}
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
          </div>

          <Button type="submit" className="w-full" disabled={loading || demoLoading}>
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                {t(d.processing)}
              </>
            ) : (
              t(d.signInCta)
            )}
          </Button>

          <div className="flex items-center gap-3" role="presentation">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[12px] text-muted-foreground">{t(d.orDivider)}</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={startDemo}
            disabled={loading || demoLoading}
          >
            {demoLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                {t(d.demoPreparing)}
              </>
            ) : (
              <>
                <Sparkles className="size-4 text-gold" aria-hidden="true" />
                {t(d.demoCta)}
              </>
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {t(d.noAccount)}{" "}
            <Link href="/auth/register" className="font-medium text-primary hover:underline">
              {t(d.createAccountCta)}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
