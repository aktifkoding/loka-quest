import { createClient } from "@/lib/supabase/server";
import { requireEncyclopediaRole } from "@/lib/encyclopedia";
import { z } from "zod";
import { withErrorHandling } from "@/lib/api/handler";
import { auditLog } from "@/lib/audit";

const sourceSchema = z.object({
  sourceId: z.string().uuid().nullable().optional(),
  sourceTitle: z.string().trim().min(3).max(300),
  publisher: z.string().max(300).nullable().optional(),
  sourceUrl: z.string().url().nullable().optional(),
  sourceType: z.enum(["documented_fact","academic_interpretation","oral_tradition","community_perspective","contemporary_practice"]),
  notes: z.string().max(2000).nullable().optional(),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandling(async () => {
    const user = await requireEncyclopediaRole(["content_administrator","cultural_editor","contributor"]);
    const { id } = await params;
    const input = sourceSchema.parse(await request.json());
    const supabase = await createClient();
    const { data: article } = await supabase.from("encyclopedia_articles").select("id").eq("id", id).maybeSingle();
    if (!article) return Response.json({ success:false,error:"Article not found" },{status:404});
    const { data, error } = await supabase.from("encyclopedia_sources").insert({ article_id:id, source_id:input.sourceId ?? null, source_title:input.sourceTitle, publisher:input.publisher ?? null, source_url:input.sourceUrl ?? null, source_type:input.sourceType, notes:input.notes ?? null }).select("id,source_title,source_type").single();
    if (error) throw new Error(`Failed to add encyclopedia source: ${error.code}`);
    await auditLog({ actorId:user.id,action:"encyclopedia.source.added",resourceType:"encyclopedia_article",resourceId:id,details:{sourceId:data.id} });
    return Response.json({success:true,data},{status:201,headers:{"Cache-Control":"private, no-store"}});
  });
}
