import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireEncyclopediaRole } from "@/lib/encyclopedia";
import { withErrorHandling } from "@/lib/api/handler";
import { auditLog } from "@/lib/audit";
import { ApiError } from "@/lib/api/response";
import { z } from "zod";

const decisionSchema=z.object({decision:z.enum(["changes_requested","approved","rejected"]),notes:z.string().max(5000).optional()});
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
  return withErrorHandling(async()=>{
    const user=await requireEncyclopediaRole(["content_administrator","reviewer"]);const {id}=await params;const input=decisionSchema.parse(await request.json());const supabase=await createClient();
    const {data:article}=await supabase.from("encyclopedia_articles").select("id,slug,status").eq("id",id).maybeSingle();if(!article)return Response.json({success:false,error:"Article not found"},{status:404});if(article.status!=="review")throw new ApiError(409,"Artikel harus berada dalam status review");
    const nextStatus=input.decision==="approved"?"approved":input.decision==="rejected"?"archived":"draft";
    const {data,error}=await supabase.from("encyclopedia_articles").update({status:nextStatus,reviewed_by:user.id,last_reviewed_at:new Date().toISOString()}).eq("id",id).select("id,slug,status").single();if(error)throw new Error(`Failed to review article: ${error.code}`);
    await supabase.from("encyclopedia_reviews").insert({article_id:id,reviewer_id:user.id,decision:input.decision,notes:input.notes??null});
    await auditLog({actorId:user.id,action:`encyclopedia.article.${input.decision}`,resourceType:"encyclopedia_article",resourceId:id});
    revalidatePath("/encyclopedia");revalidatePath(`/encyclopedia/${article.slug}`);
    return Response.json({success:true,data},{headers:{"Cache-Control":"private, no-store"}});
  });
}
