"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { CountUp } from "@/components/ui/count-up";
import { createClient } from "@/lib/supabase/client";
import { useI18n, type Localized } from "@/lib/i18n";
import { playerDict } from "@/lib/i18n/dict/player";
import { ArrowLeft, Loader2, Save, Zap, Trophy, ShieldCheck, Gem, BarChart3 } from "lucide-react";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  xp: number;
  level: number;
}

const roleLabels: Record<string, Localized> = {
  player: playerDict.rolePlayer,
  educator: playerDict.roleEducator,
  admin: playerDict.roleAdmin,
};

export default function ProfilePage() {
  const { t } = useI18n();
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
      .catch(() => setMessage({ type: "error", text: t(playerDict.loadProfileError) }))
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
      if (!res.ok) throw new Error(json.error || t(playerDict.saveError));
      setProfile((p) => (p ? { ...p, full_name: json.data.full_name } : p));
      setMessage({ type: "ok", text: t(playerDict.profileSaved) });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : t(playerDict.saveError),
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
          {t(playerDict.dashboard)}
        </Link>
      </Button>

      <h1 className="animate-fade-up font-display text-4xl font-semibold tracking-tight">
        {t(playerDict.profileTitle)}
      </h1>
      <p className="animate-fade-up mt-2 text-muted-foreground" style={{ animationDelay: "60ms" }}>
        {t(playerDict.profileIntro)}
      </p>

      {loading ? (
        <div className="mt-8 space-y-4" aria-busy="true">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      ) : profile ? (
        <div className="mt-8 space-y-6">
          <Card className="animate-fade-up border-primary/25 bg-primary/5 transition-[box-shadow,border-color] duration-200 hover:border-gold/40" style={{ animationDelay: "100ms" }}>
            <div className="grid grid-cols-3 gap-4 p-6 text-center">
              <div className="group cursor-default">
                <Zap className="mx-auto size-5 text-gold transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
                <p className="mt-2 font-display text-2xl font-semibold tabular-nums">
                  <CountUp value={profile.xp} />
                </p>
                <p className="text-[12px] text-muted-foreground">{t(playerDict.statsTotalXp)}</p>
              </div>
              <div className="group cursor-default">
                <Trophy className="mx-auto size-5 text-muted-foreground transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
                <p className="mt-2 font-display text-2xl font-semibold tabular-nums">
                  <CountUp value={profile.level} />
                </p>
                <p className="text-[12px] text-muted-foreground">{t(playerDict.statsLevel)}</p>
              </div>
              <div className="group cursor-default">
                <ShieldCheck className="mx-auto size-5 text-muted-foreground transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
                <p className="mt-2 font-display text-2xl font-semibold">
                  {roleLabels[profile.role] ? t(roleLabels[profile.role]) : profile.role}
                </p>
                <p className="text-[12px] text-muted-foreground">{t(playerDict.statsRole)}</p>
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
                <Label htmlFor="fullName">{t(playerDict.displayNameLabel)}</Label>
                <Input
                  id="fullName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t(playerDict.displayNamePlaceholder)}
                  maxLength={120}
                />
                <p className="text-[12px] text-muted-foreground">
                  {t(playerDict.emailLockedNote, { email: profile.email })}
                </p>
              </div>
              <Button onClick={save} disabled={saving || name.trim().length < 2}>
                {saving ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Save className="size-4" aria-hidden="true" />
                )}
                {t(playerDict.saveChanges)}
              </Button>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h2 className="font-display text-lg font-semibold">{t(playerDict.shortcutsTitle)}</h2>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <Button variant="outline" asChild>
                  <Link href="/player/collection">
                    <Gem className="size-4" aria-hidden="true" />
                    {t(playerDict.shortcutCollection)}
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/leaderboard">
                    <BarChart3 className="size-4" aria-hidden="true" />
                    {t(playerDict.quickLeaderboard)}
                  </Link>
                </Button>
                <Button variant="destructive" onClick={signOut}>
                  {t(playerDict.signOut)}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
