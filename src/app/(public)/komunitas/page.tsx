"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Reveal } from "@/components/ui/reveal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Users,
  Send,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  BookMarked,
  Lightbulb,
  Network,
} from "lucide-react";

type Submission = {
  id: string;
  title: string;
  body: string;
  submitter_name: string;
  region_slug: string | null;
  status: "pending" | "published" | "rejected";
  admin_note: string | null;
  created_at: string;
};

export default function CommunityPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", submitter_name: "", submitter_email: "", region_slug: "" });

  const fetchSubmissions = async () => {
    try {
      const res = await fetch("/api/v1/community/submissions?status=published");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memuat");
      setSubmissions(json.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/community/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mengirim");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim");
    } finally {
      setSubmitting(false);
    }
  };

  const statusMeta: Record<string, { label: string; icon: typeof Clock; className: string }> = {
    pending: { label: "Menunggu verifikasi", icon: Clock, className: "text-amber-600 bg-amber-50" },
    published: { label: "Dipublikasikan", icon: CheckCircle2, className: "text-emerald-600 bg-emerald-50" },
    rejected: { label: "Ditolak", icon: XCircle, className: "text-rose-600 bg-rose-50" },
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
      <header className="max-w-2xl">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users className="size-5" aria-hidden="true" />
          </span>
          <h1 className="font-display text-4xl font-semibold tracking-tight">Komunitas Budaya</h1>
        </div>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Seniman, budayawan, dan komunitas dapat mengusulkan dokumentasi budaya untuk diverifikasi dan diterbitkan di LokaQuest.
        </p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
        <section aria-label="Dokumentasi komunitas">
          <Reveal>
            <h2 className="font-display text-xl font-semibold">Dokumentasi terverifikasi</h2>
          </Reveal>

          {loading ? (
            <div className="mt-6 space-y-4">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))}
            </div>
          ) : error ? (
            <div className="mt-6">
              <EmptyState icon={Users} title="Gagal memuat" description={error} />
            </div>
          ) : submissions.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                icon={BookMarked}
                title="Belum ada dokumentasi"
                description="Jadilah yang pertama mengusulkan konten budaya."
                action={{ label: "Usulkan konten", href: "#form" }}
              />
            </div>
          ) : (
            <ul className="mt-6 space-y-4">
              {submissions.map((item, index) => {
                const meta = statusMeta[item.status] ?? statusMeta.pending;
                return (
                  <li key={item.id}>
                    <Reveal delay={index * 70}>
                      <Card interactive>
                        <div className="flex items-start justify-between gap-3 px-6 py-5">
                          <div className="min-w-0">
                            <p className="font-display text-lg font-semibold leading-snug">{item.title}</p>
                            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                            <p className="mt-2 text-[12px] text-muted-foreground">
                              {item.submitter_name} · {new Date(item.created_at).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                              {item.region_slug ? ` · ${item.region_slug}` : ""}
                            </p>
                          </div>
                          <span className={cn("flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", meta.className)}>
                            <meta.icon className="size-3.5" aria-hidden="true" />
                            {meta.label}
                          </span>
                        </div>
                      </Card>
                    </Reveal>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <aside className="space-y-6">
          <Card id="form" className="p-6">
            <div className="flex items-center gap-2.5">
              <Lightbulb className="size-5 text-gold" aria-hidden="true" />
              <h3 className="font-display text-lg font-semibold">Usulkan dokumentasi</h3>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Konten Anda akan diverifikasi tim substansi sebelum dipublikasikan.
            </p>

            {submitted ? (
              <div className="mt-4 rounded-lg border border-border bg-secondary/40 p-4 text-sm">
                Usulan Anda telah terkirim. Tim kami akan memeriksa dalam 2–3 hari kerja.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title">Judul</Label>
                  <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="body">Isi dokumentasi</Label>
                  <textarea
                    id="body"
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.body}
                    onChange={(e) => setForm({ ...form, body: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="region">Wilayah (opsional)</Label>
                  <Input id="region" value={form.region_slug} onChange={(e) => setForm({ ...form, region_slug: e.target.value })} placeholder="misal jawa-tengah" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="name">Nama pengirim</Label>
                  <Input id="name" value={form.submitter_name} onChange={(e) => setForm({ ...form, submitter_name: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email pengirim</Label>
                  <Input id="email" type="email" value={form.submitter_email} onChange={(e) => setForm({ ...form, submitter_email: e.target.value })} required />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Mengirim..." : "Kirim usulan"}
                </Button>
              </form>
            )}
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2.5">
              <Network className="size-5 text-primary" aria-hidden="true" />
              <h3 className="font-display text-lg font-semibold">Grafik Budaya</h3>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Jelajahi hubungan antar wilayah, tradisi, tokoh, dan artefak dalam peta pengetahuan budaya.
            </p>
            <Button asChild variant="outline" className="mt-4 w-full">
              <Link href="/jelajahi">
                Buka Grafik Budaya
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </Card>
        </aside>
      </div>
    </div>
  );
}

