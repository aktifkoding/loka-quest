"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

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
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[400px] px-4 py-16 md:py-24">
      {success ? (
        <div className="text-center">
          <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MailCheck className="size-5" aria-hidden="true" />
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Periksa kotak masukmu
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Jika <span className="font-medium text-foreground">{email}</span>{" "}
            terdaftar, tautan untuk mengatur ulang kata sandi sudah dikirim.
            Tautan berlaku selama satu jam.
          </p>
          <Button variant="outline" asChild className="mt-6">
            <Link href="/auth/login">Kembali ke halaman masuk</Link>
          </Button>
        </div>
      ) : (
        <>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Atur ulang kata sandi
          </h1>
          <p className="mt-2 text-muted-foreground">
            Masukkan emailmu dan kami kirim tautan pengaturan ulang.
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Mengirim…
                </>
              ) : (
                "Kirim tautan"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Ingat kata sandinya?{" "}
              <Link
                href="/auth/login"
                className="font-medium text-primary hover:underline"
              >
                Masuk
              </Link>
            </p>
          </form>
        </>
      )}
    </div>
  );
}
