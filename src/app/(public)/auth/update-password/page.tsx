"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { Loader2, KeyRound, CheckCircle2 } from "lucide-react";

const rules = [
  { label: "Minimal 8 karakter", test: (v: string) => v.length >= 8 },
  { label: "Mengandung huruf besar", test: (v: string) => /[A-Z]/.test(v) },
  { label: "Mengandung huruf kecil", test: (v: string) => /[a-z]/.test(v) },
  { label: "Mengandung angka", test: (v: string) => /[0-9]/.test(v) },
];

export default function UpdatePasswordPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkSession() {
      try {
        // Supabase may deliver the recovery link as a PKCE `code` query param
        // instead of a hash token. Exchange it before checking the session.
        const code = new URLSearchParams(window.location.search).get("code");
        if (code) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            setHasSession(false);
            return;
          }
        }

        const { data } = await supabase.auth.getUser();
        setHasSession(Boolean(data.user));
      } catch {
        setHasSession(false);
      } finally {
        setChecking(false);
      }
    }

    void checkSession();
  }, [supabase]);

  const allPassed = rules.every((rule) => rule.test(password));

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!allPassed) {
      setError("Kata sandi belum memenuhi semua syarat.");
      return;
    }
    if (password !== confirmation) {
      setError("Konfirmasi kata sandi tidak sama.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/player/dashboard"), 1800);
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="mx-auto flex w-full max-w-[400px] items-center justify-center px-4 py-24 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" aria-hidden="true" />
        <span className="ml-2 text-sm">Memeriksa tautan…</span>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto w-full max-w-[400px] px-4 py-16 text-center md:py-24">
        <CheckCircle2 className="mx-auto size-12 text-primary" aria-hidden="true" />
        <h1 className="mt-4 font-display text-2xl font-semibold">
          Kata sandi diperbarui
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Mengalihkan ke dasbor…
        </p>
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="mx-auto w-full max-w-[400px] px-4 py-16 text-center md:py-24">
        <KeyRound className="mx-auto size-10 text-muted-foreground" aria-hidden="true" />
        <h1 className="mt-4 font-display text-2xl font-semibold">
          Tautan tidak valid atau kedaluwarsa
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Minta tautan baru untuk mengatur ulang kata sandi.
        </p>
        <Button asChild className="mt-6">
          <Link href="/auth/forgot-password">Minta tautan baru</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[400px] px-4 py-16 md:py-24">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Kata sandi baru
      </h1>
      <p className="mt-2 text-muted-foreground">
        Masukkan kata sandi baru untuk akunmu.
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
          <Label htmlFor="password">Kata sandi baru</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmation">Ulangi kata sandi</Label>
          <Input
            id="confirmation"
            type="password"
            autoComplete="new-password"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            required
          />
        </div>

        <ul className="space-y-1.5 text-sm">
          {rules.map((rule) => {
            const passed = rule.test(password);
            return (
              <li
                key={rule.label}
                className={passed ? "text-primary" : "text-muted-foreground"}
              >
                {passed ? "✓" : "•"} {rule.label}
              </li>
            );
          })}
        </ul>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Menyimpan…
            </>
          ) : (
            "Simpan kata sandi"
          )}
        </Button>
      </form>
    </div>
  );
}
