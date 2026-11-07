"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

type Item = { article: { id: string; slug: string; title: string; summary: string; featured_image_url: string | null } | null };

export default function EncyclopediaFavoritesPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  async function load() {
    setLoading(true);
    try { const response = await fetch("/api/v1/encyclopedia/bookmarks", { cache: "no-store" }); const json = await response.json(); if (!response.ok) throw new Error(response.status === 401 ? "Masuk untuk melihat artikel favorit." : "Favorit belum dapat dimuat."); setItems(json.data ?? []); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Terjadi kesalahan."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);
  async function remove(id: string) { await fetch(`/api/v1/encyclopedia/bookmarks/${id}`, { method: "DELETE" }); await load(); }
  return <div className="mx-auto max-w-6xl px-4 py-10 md:py-14"><Link href="/encyclopedia" className="text-sm text-muted-foreground transition-colors hover:text-foreground">← Ensiklopedia</Link><h1 className="mt-4 font-display text-4xl font-semibold">Favorit saya</h1><p className="mt-2 text-muted-foreground">Artikel yang Anda simpan untuk dibaca kembali.</p>{loading ? <div className="mt-8 grid gap-4 sm:grid-cols-2" aria-busy="true" aria-label="Memuat favorit">{[0, 1, 2, 3].map((i) => <div key={i} className="rounded-xl border border-border/70 p-5"><Skeleton className="h-5 w-2/3" /><Skeleton className="mt-2 h-3 w-full" /><Skeleton className="mt-1.5 h-3 w-3/4" /></div>)}</div> : message ? <div className="mt-8"><EmptyState icon={Bookmark} title="Favorit tidak tersedia" description={message} action={{ label: "Masuk", href: "/auth/login" }} /></div> : items.length ? <div className="mt-8 grid gap-4 sm:grid-cols-2">{items.map(({ article }, index) => article && <Card key={article.id} className="animate-fade-up h-full" style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}><div className="group flex items-start gap-4 p-5">{article.featured_image_url && <div className="hidden size-16 shrink-0 overflow-hidden rounded-lg border border-border sm:block"><img src={article.featured_image_url} alt="" loading="lazy" className="size-full object-cover transition-transform duration-300 ease-out-expo group-hover:scale-110" /></div>}<div className="min-w-0 flex-1"><Link href={`/encyclopedia/${article.slug}`} className="font-display text-lg font-semibold transition-colors hover:text-primary">{article.title}</Link><p className="mt-2 text-sm text-muted-foreground">{article.summary}</p></div><Button variant="ghost" size="iconSm" aria-label={`Hapus ${article.title} dari favorit`} onClick={() => remove(article.id)} className="transition-colors hover:bg-destructive/10 hover:text-destructive"><Trash2 className="size-4" /></Button></div></Card>)}</div> : <div className="mt-8"><EmptyState icon={Bookmark} title="Belum ada favorit" description="Simpan artikel yang ingin Anda baca kembali." action={{ label: "Jelajahi artikel", href: "/encyclopedia/explore" }} /></div>}</div>;
}
