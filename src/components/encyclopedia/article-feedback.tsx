"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Flag } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { commonDict } from "@/lib/i18n/dict/common";
import { encyclopediaDict as d } from "@/lib/i18n/dict/encyclopedia";

export function ArticleFeedback({articleTitle}:{articleTitle:string}){
  const { t } = useI18n();
  const [open,setOpen]=useState(false);const [message,setMessage]=useState("");const [busy,setBusy]=useState(false);
  async function submit(event:React.FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);const data=new FormData(event.currentTarget);const body=String(data.get("message")||"").trim();try{const response=await fetch("/api/v1/encyclopedia/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({articleTitle,kind:data.get("kind"),message:body})});if(!response.ok)throw new Error();setMessage(t(d.feedbackSuccess));setOpen(false);}catch{setMessage(t(d.feedbackError));}finally{setBusy(false);}}
  return <div className="mt-4"><Button variant="outline" size="sm" onClick={()=>setOpen((value)=>!value)}><Flag className="size-4" aria-hidden="true"/>{t(d.feedbackButton)}</Button>{open&&<form className="mt-4 space-y-3" onSubmit={submit}><label className="block text-sm">{t(d.feedbackKindLabel)}<select name="kind" className="mt-1 block w-full rounded-lg border border-border bg-background p-2"><option value="correction">{t(d.feedbackKindCorrection)}</option><option value="community_perspective">{t(d.feedbackKindCommunity)}</option><option value="media_rights">{t(d.feedbackKindMediaRights)}</option><option value="other">{t(d.feedbackKindOther)}</option></select></label><label className="block text-sm">{t(d.feedbackDetailLabel)}<textarea name="message" required minLength={10} maxLength={3000} className="mt-1 block w-full rounded-lg border border-border bg-background p-3" rows={4}/></label><Button type="submit" disabled={busy}>{busy?t(commonDict.sending):t(d.feedbackSubmitCta)}</Button></form>}<p role="status" className="mt-2 text-sm text-muted-foreground">{message}</p></div>;
}
