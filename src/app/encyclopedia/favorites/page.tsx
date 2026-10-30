"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function EncyclopediaFavoritesPage() {
  const [items, setItems] = useState<{article:{id:string;slug:string;title:string;summary:string;featured_image_url:string|null}|null}[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  async function load() {
    setLoading(true);
    try { const response = await fetch("/api/v1/encyclopedia/bookmarks", { cache:"no-store" }); const json = await response.json(); if (!response.ok) throw new Error(response.status===401 ? "Masuk untuk melihat artikel favorit." : "Favorit belum dapat dimuat."); setItems(json.data ?? []); }
    catch(error) { setMessage(error instanceof Error ? error.message : "Terjadi kesalahan."); }
    finally { setLoading(false); }
  }
  useEffect(()=>{ void load(); },[]);
  async function remove(id:string) { await fetch(`/api/v1/encyclopedia/bookmarks/${id}`, {method:"DELETE"}); await load(); }
  return <div className="mx-auto max-w-6xl px-4 py-10 md:py-14"><Link href="/encyclopedia" className="text-sm text-muted-foreground">← Ensiklopedia</Link><h1 className="mt-4 font-display text-4xl font-semibold">Favorit saya</h1><p className="mt-2 text-muted-foreground">Artikel yang Anda simpan untuk dibaca kembali.</p>{loading ? <p className="mt-8" aria-busy="true">Memuat favorit…</p> : message ? <div className="mt-8"><EmptyState icon={Bookmark} title="Favorit tidak tersedia" description={message} action={{label:"Masuk",href:"/auth/login"}}/></div> : items.length ? <div className="mt-8 grid gap-4 sm:grid-cols-2">{items.map(({article})=>article&&<Card key={article.id} className="h-full"><div className="flex items-start gap-4 p-5"><div className="min-w-0 flex-1"><Link href={`/encyclopedia/${article.slug}`} className="font-display text-lg font-semibold hover:text-primary">{article.title}</Link><p className="mt-2 text-sm text-muted-foreground">{article.summary}</p></div><Button variant="ghost" size="iconSm" aria-label={`Hapus ${article.title} dari favorit`} onClick={()=>remove(article.id)}><Trash2 className="size-4"/></Button></div></Card>)}</div> : <div className="mt-8"><EmptyState icon={Bookmark} title="Belum ada favorit" description="Simpan artikel yang ingin Anda baca kembali." action={{label:"Jelajahi artikel",href:"/encyclopedia/explore"}}/></div>}</div>;
}
