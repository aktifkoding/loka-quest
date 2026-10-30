"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Flag } from "lucide-react";

export function ArticleFeedback({articleTitle}:{articleTitle:string}){
  const [open,setOpen]=useState(false);const [message,setMessage]=useState("");const [busy,setBusy]=useState(false);
  async function submit(event:React.FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);const data=new FormData(event.currentTarget);const body=String(data.get("message")||"").trim();try{const response=await fetch("/api/v1/encyclopedia/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({articleTitle,kind:data.get("kind"),message:body})});if(!response.ok)throw new Error();setMessage("Terima kasih. Masukan Anda telah dicatat.");setOpen(false);}catch{setMessage("Masukan belum terkirim. Silakan coba lagi nanti.");}finally{setBusy(false);}}
  return <div className="mt-4"><Button variant="outline" size="sm" onClick={()=>setOpen((value)=>!value)}><Flag className="size-4" aria-hidden="true"/>Kirim koreksi atau masukan</Button>{open&&<form className="mt-4 space-y-3" onSubmit={submit}><label className="block text-sm">Jenis masukan<select name="kind" className="mt-1 block w-full rounded-lg border border-border bg-background p-2"><option value="correction">Koreksi informasi</option><option value="community_perspective">Perspektif komunitas</option><option value="media_rights">Hak atau atribusi media</option><option value="other">Lainnya</option></select></label><label className="block text-sm">Detail<textarea name="message" required minLength={10} maxLength={3000} className="mt-1 block w-full rounded-lg border border-border bg-background p-3" rows={4}/></label><Button type="submit" disabled={busy}>{busy?"Mengirim…":"Kirim masukan"}</Button></form>}<p role="status" className="mt-2 text-sm text-muted-foreground">{message}</p></div>;
}
