"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SourceEditor } from "@/components/encyclopedia/source-editor";

type Category = { id:string; name:string; slug:string };
type Region = { id:string; name:string; slug:string };

export default function EncyclopediaArticleEditorPage() {
  const params = useSearchParams(); const router = useRouter(); const id = params.get("id");
  const [categories,setCategories]=useState<Category[]>([]); const [regions,setRegions]=useState<Region[]>([]); const [categoryIds,setCategoryIds]=useState<string[]>([]); const [regionIds,setRegionIds]=useState<string[]>([]);
  const [status,setStatus]=useState("draft"); const [message,setMessage]=useState(""); const [busy,setBusy]=useState(false);
  const [form,setForm]=useState({title:"",slug:"",summary:"",body:"",featuredImageUrl:"",background:"",historicalContext:"",culturalMeaning:"",characteristics:"",socialFunction:"",practices:"",preservation:"",seoTitle:"",seoDescription:""});
  useEffect(()=>{
    fetch("/api/v1/encyclopedia/categories").then((r)=>r.json()).then((j)=>setCategories(j.data??[])).catch(()=>{});
    fetch("/api/v1/encyclopedia/regions").then((r)=>r.json()).then((j)=>setRegions(j.data??[])).catch(()=>{});
    if(id) fetch(`/api/v1/admin/encyclopedia/articles/${id}`).then((r)=>r.json()).then((j)=>{
      const article=j.data;if(!article)return;
      setForm({title:article.title,slug:article.slug,summary:article.summary,body:article.body??"",featuredImageUrl:article.featured_image_url??"",background:article.background??"",historicalContext:article.historical_context??"",culturalMeaning:article.cultural_meaning??"",characteristics:article.characteristics??"",socialFunction:article.social_function??"",practices:article.practices??"",preservation:article.preservation??"",seoTitle:article.seo_title??"",seoDescription:article.seo_description??""});
      setStatus(article.status);setCategoryIds((article.encyclopedia_article_categories??[]).map((row:{category_id:string})=>row.category_id));setRegionIds((article.encyclopedia_article_regions??[]).map((row:{region_id:string})=>row.region_id));
    }).catch(()=>{});
  },[id]);
  const set=(key:keyof typeof form,value:string)=>setForm((current)=>({...current,[key]:value}));
  async function submit(nextStatus:"draft"|"review"){
    setBusy(true);setMessage("");try{
      const response=await fetch(id?`/api/v1/admin/encyclopedia/articles/${id}`:"/api/v1/admin/encyclopedia/articles",{method:id?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,featuredImageUrl:form.featuredImageUrl||null,categoryIds,regionIds,status:nextStatus})});
      const json=await response.json();if(!response.ok)throw new Error(json.error||"Artikel tidak dapat disimpan");
      setMessage(nextStatus==="review"?"Artikel diajukan untuk tinjauan.":"Draf berhasil disimpan.");if(!id&&json.data?.id)router.replace(`/admin/encyclopedia/articles/new?id=${json.data.id}`);setStatus(nextStatus);
    }catch(error){setMessage(error instanceof Error?error.message:"Terjadi kesalahan");}finally{setBusy(false);}
  }
  function toggle(value:string,current:string[],setter:(values:string[])=>void){setter(current.includes(value)?current.filter((item)=>item!==value):[...current,value]);}
  const inputClass="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
  return <main className="mx-auto max-w-4xl px-4 py-10 md:py-14"><Link href="/admin/encyclopedia" className="text-sm text-muted-foreground">← CMS ensiklopedia</Link><h1 className="mt-4 font-display text-4xl font-semibold">{id?"Sunting artikel":"Artikel baru"}</h1><p className="mt-2 text-sm text-muted-foreground">Status saat ini: <strong>{status}</strong>. Tambahkan referensi yang dapat ditelusuri sebelum publikasi.</p><form className="mt-8 space-y-5" onSubmit={(event)=>event.preventDefault()}><label className="block text-sm font-medium">Judul<input className={inputClass} required minLength={3} value={form.title} onChange={(e)=>set("title",e.target.value)}/></label><label className="block text-sm font-medium">Slug URL<input className={inputClass} required pattern="[a-z0-9]+(-[a-z0-9]+)*" value={form.slug} onChange={(e)=>set("slug",e.target.value)}/></label><label className="block text-sm font-medium">Ringkasan<input className={inputClass} required minLength={20} value={form.summary} onChange={(e)=>set("summary",e.target.value)}/></label><label className="block text-sm font-medium">Isi utama<textarea className={inputClass} rows={8} value={form.body} onChange={(e)=>set("body",e.target.value)}/></label><label className="block text-sm font-medium">URL gambar utama (opsional)<input className={inputClass} type="url" value={form.featuredImageUrl} onChange={(e)=>set("featuredImageUrl",e.target.value)}/></label>{([["background","Latar budaya"],["historicalContext","Konteks sejarah"],["culturalMeaning","Makna dan filosofi"],["characteristics","Ciri khas"],["socialFunction","Fungsi sosial"],["practices","Praktik dan proses"],["preservation","Upaya pelestarian"]] as const).map(([key,label])=><label key={key} className="block text-sm font-medium">{label}<textarea className={inputClass} rows={4} value={form[key]} onChange={(e)=>set(key,e.target.value)}/></label>)}<fieldset className="rounded-xl border border-border p-4"><legend className="px-2 text-sm font-medium">Kategori</legend><div className="flex flex-wrap gap-3">{categories.map((category)=><label key={category.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={categoryIds.includes(category.id)} onChange={()=>toggle(category.id,categoryIds,setCategoryIds)}/>{category.name}</label>)}</div></fieldset><fieldset className="rounded-xl border border-border p-4"><legend className="px-2 text-sm font-medium">Wilayah terkait</legend><div className="flex flex-wrap gap-3">{regions.map((region)=><label key={region.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={regionIds.includes(region.id)} onChange={()=>toggle(region.id,regionIds,setRegionIds)}/>{region.name}</label>)}</div></fieldset><label className="block text-sm font-medium">Judul SEO<input className={inputClass} value={form.seoTitle} onChange={(e)=>set("seoTitle",e.target.value)}/></label><label className="block text-sm font-medium">Deskripsi SEO<textarea className={inputClass} rows={2} value={form.seoDescription} onChange={(e)=>set("seoDescription",e.target.value)}/></label><div className="flex flex-wrap gap-3"><Button type="button" variant="outline" disabled={busy} onClick={()=>submit("draft")}>Simpan draf</Button><Button type="button" disabled={busy} onClick={()=>submit("review")}>Ajukan tinjauan</Button></div><p role="status" className="text-sm text-muted-foreground">{message}</p></form>{id&&<SourceEditor articleId={id}/>}</main>;
}
