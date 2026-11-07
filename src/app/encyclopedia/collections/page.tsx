"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

type Item = { article: { id: string; slug: string; title: string; summary: string } | null; viewed_at: string; progress: number };

export default function EncyclopediaCollectionsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  async function load() {
    setLoading(true);
    try { const response = await fetch("/api/v1/encyclopedia/collections", { cache: "no-store" }); const json = await response.json(); if (!response.ok) throw new Error(response.status === 401 ? "Masuk untuk melihat riwayat bacaan." : "Riwayat belum dapat dimuat."); setItems(json.data ?? []); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Terjadi kesalahan."); } finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);
  async function clear() { await fetch("/api/v1/encyclopedia/collections", { method: "DELETE" }); setItems([]); }
  return <div className="mx-auto max-w-5xl px-4 py-10 md:py-14"><Link href="/encyclopedia" className="text-sm text-muted-foreground transition-colors hover:text-foreground">← Ensiklopedia</Link><div className="mt-4 flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-display text-4xl font-semibold">Koleksi dan riwayat baca</h1><p className="mt-2 text-muted-foreground">Riwayat ini hanya terlihat oleh Anda.</p></div>{items.length > 0 && <Button variant="outline" size="sm" onClick={clear}><Trash2 className="size-4" />Hapus riwayat</Button>}</div>{loading ? <div className="mt-8 space-y-3" aria-busy="true" aria-label="Memuat riwayat">{[0, 1, 2].map((i) => <div key={i} className="rounded-xl border border-border/70 p-5"><Skeleton className="h-5 w-1/3" /><Skeleton className="mt-2 h-3 w-1/4" /><Skeleton className="mt-3 h-1.5 w-full" /></div>)}</div> : message ? <div className="mt-8"><EmptyState icon={BookOpen} title="Riwayat tidak tersedia" description={message} action={{ label: "Masuk", href: "/auth/login" }} /></div> : items.length ? <div className="mt-8 space-y-3">{items.map(({ article, viewed_at, progress }, index) => article && <Card key={article.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}><div className="flex flex-wrap items-center gap-4 p-5"><div className="min-w-0 flex-1"><Link href={`/encyclopedia/${article.slug}`} className="font-display text-lg font-semibold transition-colors hover:text-primary">{article.title}</Link><p className="mt-1 text-sm text-muted-foreground">Terakhir dibaca {new Date(viewed_at).toLocaleDateString("id-ID")}</p><div className="mt-2.5 flex items-center gap-3" aria-label={`Progres baca ${progress} persen`}><div className="h-1.5 w-40 overflow-hidden rounded-full bg-secondary" aria-hidden="true"><div className={`h-full rounded-full bg-gradient-to-r from-primary/70 to-gold/70 ${progress < 100 ? "progress-live" : ""}`} style={{ width: `${progress}%` }} /></div><span className="text-xs font-medium tabular-nums text-muted-foreground">{progress}%</span></div></div><span className="hidden max-w-xs text-sm leading-relaxed text-muted-foreground md:block">{article.summary}</span></div></Card>)}</div> : <div className="mt-8"><EmptyState icon={BookOpen} title="Belum ada riwayat bacaan" description="Artikel yang Anda baca akan muncul di sini setelah pencatatan riwayat tersedia." action={{ label: "Jelajahi artikel", href: "/encyclopedia/explore" }} /></div>}</div>;
}
