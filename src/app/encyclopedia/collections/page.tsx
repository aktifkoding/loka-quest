"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default function EncyclopediaCollectionsPage() {
  const [items, setItems] = useState<{article:{id:string;slug:string;title:string;summary:string}|null;viewed_at:string;progress:number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  async function load() {
    setLoading(true);
    try { const response=await fetch("/api/v1/encyclopedia/collections",{cache:"no-store"});const json=await response.json();if(!response.ok)throw new Error(response.status===401?"Masuk untuk melihat riwayat bacaan.":"Riwayat belum dapat dimuat.");setItems(json.data??[]); }
    catch(error){setMessage(error instanceof Error?error.message:"Terjadi kesalahan.");}finally{setLoading(false);}
  }
  useEffect(()=>{void load();},[]);
  async function clear(){await fetch("/api/v1/encyclopedia/collections",{method:"DELETE"});setItems([]);}
  return <div className="mx-auto max-w-5xl px-4 py-10 md:py-14"><Link href="/encyclopedia" className="text-sm text-muted-foreground">← Ensiklopedia</Link><div className="mt-4 flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-display text-4xl font-semibold">Koleksi dan riwayat baca</h1><p className="mt-2 text-muted-foreground">Riwayat ini hanya terlihat oleh Anda.</p></div>{items.length>0&&<Button variant="outline" size="sm" onClick={clear}><Trash2 className="size-4"/>Hapus riwayat</Button>}</div>{loading?<p className="mt-8" aria-busy="true">Memuat riwayat…</p>:message?<div className="mt-8"><EmptyState icon={BookOpen} title="Riwayat tidak tersedia" description={message} action={{label:"Masuk",href:"/auth/login"}}/></div>:items.length?<div className="mt-8 space-y-3">{items.map(({article,viewed_at,progress})=>article&&<Card key={article.id}><div className="flex flex-wrap items-center gap-4 p-5"><div className="min-w-0 flex-1"><Link href={`/encyclopedia/${article.slug}`} className="font-display text-lg font-semibold hover:text-primary">{article.title}</Link><p className="mt-1 text-sm text-muted-foreground">Terakhir dibaca {new Date(viewed_at).toLocaleDateString("id-ID")} · {progress}%</p></div><span className="text-sm text-muted-foreground">{article.summary}</span></div></Card>)}</div>:<div className="mt-8"><EmptyState icon={BookOpen} title="Belum ada riwayat bacaan" description="Artikel yang Anda baca akan muncul di sini setelah pencatatan riwayat tersedia." action={{label:"Jelajahi artikel",href:"/encyclopedia/explore"}}/></div>}</div>;
}
