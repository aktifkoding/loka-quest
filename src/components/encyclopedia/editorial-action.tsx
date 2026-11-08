"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { encyclopediaDict as d } from "@/lib/i18n/dict/encyclopedia";

export function EditorialAction({articleId,action,label}:{articleId:string;action:"review"|"publish";label:string}){
  const { t } = useI18n();
  const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");
  async function run(){setBusy(true);setMessage("");try{const response=await fetch(`/api/v1/admin/encyclopedia/articles/${articleId}/${action}`,{method:"POST"});const json=await response.json();if(!response.ok)throw new Error(json.error||t(d.actionFailed));setMessage(action==="review"?t(d.approvedForPublication):t(d.articlePublished));window.location.reload();}catch(error){setMessage(error instanceof Error?error.message:`${t(d.actionFailed)}.`);}finally{setBusy(false);}}
  return <span><button type="button" disabled={busy} onClick={run} className="text-sm font-medium text-primary disabled:opacity-50">{busy?t(d.processing):label}</button><span className="sr-only" aria-live="polite">{message}</span></span>;
}
