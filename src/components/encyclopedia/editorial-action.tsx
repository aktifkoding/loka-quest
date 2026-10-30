"use client";

import { useState } from "react";
export function EditorialAction({articleId,action,label}:{articleId:string;action:"review"|"publish";label:string}){
  const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");
  async function run(){setBusy(true);setMessage("");try{const response=await fetch(`/api/v1/admin/encyclopedia/articles/${articleId}/${action}`,{method:"POST"});const json=await response.json();if(!response.ok)throw new Error(json.error||"Tindakan gagal");setMessage(action==="review"?"Disetujui untuk publikasi.":"Artikel diterbitkan.");window.location.reload();}catch(error){setMessage(error instanceof Error?error.message:"Tindakan gagal.");}finally{setBusy(false);}}
  return <span><button type="button" disabled={busy} onClick={run} className="text-sm font-medium text-primary disabled:opacity-50">{busy?"Memproses…":label}</button><span className="sr-only" aria-live="polite">{message}</span></span>;
}
