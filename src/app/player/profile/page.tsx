"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Loader2, Save, Zap, Trophy, ShieldCheck, Gem, BarChart3 } from "lucide-react";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  xp: number;
  level: number;
}

const roleLabel: Record<string, string> = {
  player: "Pemain",
  educator: "Pendidik",
  admin: "Admin",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/v1/profile")
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        setProfile(json.data);
        setName(json.data.full_name ?? "");
      })
      .catch(() => setMessage({ type: "error", text: "Gagal memuat profil." }))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/v1/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: name }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menyimpan");
      setProfile((p) => (p ? { ...p, full_name: json.data.full_name } : p));
      setMessage({ type: "ok", text: "Nama tampilan diperbarui." });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal menyimpan",
      });
    } finally {
      setSaving(false);
    }
  };

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:py-14">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
        <Link href="/player/dashboard">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Dasbor
        </Link>
      </Button>

      <h1 className="font-display text-4xl font-semibold tracking-tight">Profil</h1>
      <p className="mt-2 text-muted-foreground">
        Kelola identitas tampilanmu di LokaQuest.
      </p>

      {loading ? (
        <div className="mt-8 space-y-4" aria-busy="true">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      ) : profile ? (
        <div className="mt-8 space-y-6">
          <Card className="border-primary/25 bg-primary/5">
            <div className="grid grid-cols-3 gap-4 p-6 text-center">
              <div>
                <Zap className="mx-auto size-5 text-gold" aria-hidden="true" />
                <p className="mt-2 font-display text-2xl font-semibold tabular-nums">
                  {profile.xp}
                </p>
                <p className="text-[12px] text-muted-foreground">Total XP</p>
              </div>
              <div>
                <Trophy className="mx-auto size-5 text-muted-foreground" aria-hidden="true" />
                <p className="mt-2 font-display text-2xl font-semibold tabular-nums">
                  {profile.level}
                </p>
                <p className="text-[12px] text-muted-foreground">Level</p>
              </div>
              <div>
                <ShieldCheck className="mx-auto size-5 text-muted-foreground" aria-hidden="true" />
                <p className="mt-2 font-display text-2xl font-semibold">
                  {roleLabel[profile.role] ?? profile.role}
                </p>
                <p className="text-[12px] text-muted-foreground">Peran</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="space-y-5 p-6">
              {message && (
                <div
                  role="status"
                  className={`rounded-lg px-4 py-3 text-sm ${
                    message.type === "ok"
                      ? "bg-primary/10 text-primary"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {message.text}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="fullName">Nama tampilan</Label>
                <Input
                  id="fullName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama yang terlihat di leaderboard"
                  maxLength={120}
                />
                <p className="text-[12px] text-muted-foreground">
                  Email ({profile.email}) tidak bisa diubah.
                </p>
              </div>
              <Button onClick={save} disabled={saving || name.trim().length < 2}>
                {saving ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Save className="size-4" aria-hidden="true" />
                )}
                Simpan perubahan
              </Button>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h2 className="font-display text-lg font-semibold">Pintasan</h2>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <Button variant="outline" asChild>
                  <Link href="/player/collection">
                    <Gem className="size-4" aria-hidden="true" />
                    Koleksi
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/leaderboard">
                    <BarChart3 className="size-4" aria-hidden="true" />
                    Leaderboard
                  </Link>
                </Button>
                <Button variant="destructive" onClick={signOut}>
                  Keluar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
