import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service-role";
import { withErrorHandling } from "@/lib/api/handler";

const feedbackSchema=z.object({articleTitle:z.string().max(180),kind:z.enum(["correction","community_perspective","media_rights","other"]),message:z.string().trim().min(10).max(3000)});
export async function POST(request:Request){
  return withErrorHandling(async()=>{
    const input=feedbackSchema.parse(await request.json());const service=createServiceClient();
    const {error}=await service.from("audit_logs").insert({actor_id:null,action:"encyclopedia.feedback.received",resource_type:"encyclopedia_feedback",details:{article_title:input.articleTitle,kind:input.kind,message:input.message}});
    if(error)throw new Error(`Failed to store article feedback: ${error.code}`);
    return Response.json({success:true,data:{received:true}},{status:201,headers:{"Cache-Control":"no-store"}});
  });
}
