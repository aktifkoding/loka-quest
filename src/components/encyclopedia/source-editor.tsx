"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { encyclopediaDict as d } from "@/lib/i18n/dict/encyclopedia";

type Source = {id:string;source_title:string;publisher:string|null;source_url:string|null;source_type:string};
export function SourceEditor({articleId}:{articleId:string}) {
  const { t } = useI18n();
  const [sources,setSources]=useState<Source[]>([]); const [message,setMessage]=useState(""); const [busy,setBusy]=useState(false);
  const [form,setForm]=useState({sourceTitle:"",publisher:"",sourceUrl:"",sourceType:"documented_fact"});
  const load=useCallback(async()=>{const response=await fetch(`/api/v1/admin/encyclopedia/articles/${articleId}`,{cache:"no-store"});const json=await response.json();setSources(json.data?.encyclopedia_sources??[]);},[articleId]);
  useEffect(()=>{void load();},[load]);
  async function add(){setBusy(true);setMessage("");try{const response=await fetch(`/api/v1/admin/encyclopedia/articles/${articleId}/sources`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,publisher:form.publisher||null,sourceUrl:form.sourceUrl||null})});const json=await response.json();if(!response.ok)throw new Error(json.error||t(d.sourceSaveError));setForm({sourceTitle:"",publisher:"",sourceUrl:"",sourceType:"documented_fact"});await load();setMessage(t(d.sourceSaved));}catch(error){setMessage(error instanceof Error?error.message:`${t(d.sourceSaveError)}.`);}finally{setBusy(false);}}
  return <section className="mt-8 rounded-2xl border border-border p-5"><h2 className="font-display text-xl font-semibold">{t(d.sourcesHeading)}</h2><ul className="mt-3 space-y-2">{sources.map((source)=><li key={source.id} className="text-sm">{source.source_title}{source.publisher&&` — ${source.publisher}`}{source.source_url&&<a href={source.source_url} className="ml-2 text-primary underline" target="_blank" rel="noreferrer">{t(d.sourceLinkCta)}</a>}</li>)}</ul><div className="mt-4 grid gap-3"><input className="rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder={t(d.sourceTitlePlaceholder)} value={form.sourceTitle} onChange={(event)=>setForm({...form,sourceTitle:event.target.value})}/><input className="rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder={t(d.sourcePublisherPlaceholder)} value={form.publisher} onChange={(event)=>setForm({...form,publisher:event.target.value})}/><input className="rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder={t(d.sourceUrlPlaceholder)} type="url" value={form.sourceUrl} onChange={(event)=>setForm({...form,sourceUrl:event.target.value})}/><select className="rounded-xl border border-border bg-background px-3 py-2 text-sm" value={form.sourceType} onChange={(event)=>setForm({...form,sourceType:event.target.value})}><option value="documented_fact">{t(d.sourceTypeFact)}</option><option value="academic_interpretation">{t(d.sourceTypeAcademic)}</option><option value="oral_tradition">{t(d.sourceTypeOral)}</option><option value="community_perspective">{t(d.sourceTypeCommunity)}</option><option value="contemporary_practice">{t(d.sourceTypeContemporary)}</option></select><Button type="button" variant="outline" disabled={busy||form.sourceTitle.trim().length<3} onClick={add}><Plus className="size-4"/>{t(d.addReferenceCta)}</Button></div><p className="mt-2 text-sm text-muted-foreground" role="status">{message}</p></section>;
}
