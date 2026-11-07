import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Search, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Reveal } from "@/components/ui/reveal";
import { paginationSchema } from "@/lib/validation";

export const metadata = { title: "Cari Pengetahuan Budaya" };
type Props = { searchParams: Promise<{ q?: string; page?: string }> };

type SearchResult = { id:string; slug:string; title:string; summary:string };
export default async function EncyclopediaSearchPage({ searchParams }: Props) {
  const params=await searchParams; const query=(params.q??"").trim();
  const {page,limit}=paginationSchema.parse({page:params.page,limit:"12"});
  let results:SearchResult[]=[]; let total=0; let failed=false;
  if(query.length>=2){
    const supabase=await createClient();
    const {data,count,error}=await supabase.from("encyclopedia_articles").select("id,slug,title,summary",{count:"exact"}).eq("status","published").textSearch("search_document",query,{type:"websearch",config:"simple"}).order("published_at",{ascending:false}).range((page-1)*limit,page*limit-1);
    failed=Boolean(error);results=(data??[]) as SearchResult[];total=count??0;
  }
  const totalPages=Math.ceil(total/limit);
  const pillLink = "rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 ease-out-expo hover:-translate-y-0.5 hover:border-primary/30 hover:text-foreground hover:shadow-card";
  return <div className="mx-auto max-w-6xl px-4 py-10 md:py-14"><Reveal><Link href="/encyclopedia" className="text-sm text-muted-foreground transition-colors hover:text-foreground">← Ensiklopedia</Link><h1 className="mt-4 font-display text-4xl font-semibold">Cari pengetahuan budaya</h1></Reveal><form action="/encyclopedia/search" className="mt-6 flex max-w-2xl gap-2"><label className="sr-only" htmlFor="search-query">Kata kunci</label><input id="search-query" name="q" defaultValue={query} placeholder="Masukkan minimal dua karakter" className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"/><button className="btn-sheen inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-transform duration-200 hover:-translate-y-px hover:shadow-raised"><Search className="size-4" aria-hidden="true"/>Cari</button></form>{query&&<p className="mt-6 text-sm text-muted-foreground">Hasil untuk “{query}”</p>}{failed?<div className="mt-8"><EmptyState icon={Search} title="Pencarian gagal" description="Coba kembali beberapa saat lagi."/></div>:query&&results.length>0?<><div className="mt-6 grid gap-4 sm:grid-cols-2">{results.map((article, index)=><Reveal key={article.id} delay={Math.min(index, 8) * 60}><Link href={`/encyclopedia/${article.slug}`} className="group block h-full"><Card interactive className="h-full"><div className="p-5"><h2 className="font-display text-xl font-semibold transition-colors group-hover:text-primary">{article.title}</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{article.summary}</p></div></Card></Link></Reveal>)}</div>{totalPages>1&&<nav className="mt-8 flex items-center justify-center gap-3" aria-label="Halaman hasil pencarian">{page>1&&<Link className={pillLink} href={`/encyclopedia/search?q=${encodeURIComponent(query)}&page=${page-1}`}>← Sebelumnya</Link>}<span className="rounded-full bg-secondary px-3.5 py-1.5 text-sm font-medium text-secondary-foreground">Halaman {page} dari {totalPages}</span>{page<totalPages&&<Link className={pillLink} href={`/encyclopedia/search?q=${encodeURIComponent(query)}&page=${page+1}`}>Berikutnya →</Link>}</nav>}</>:query?<div className="mt-8"><EmptyState icon={BookOpen} title="Belum ada hasil" description="Coba kata kunci lain atau jelajahi kategori budaya." action={{label:"Jelajahi artikel",href:"/encyclopedia/explore"}}/></div>:<p className="mt-8 text-sm text-muted-foreground">Cari berdasarkan nama tradisi, topik, atau istilah alternatif.</p>}</div>;
}
