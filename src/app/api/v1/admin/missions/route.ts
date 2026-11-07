import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";
import { missionCreateSchema } from "@/lib/validation";
import { auditLog } from "@/lib/audit";

export async function GET() {
  return withErrorHandling(async () => {
    await requireRole(["admin"]);
    const supabase = await createClient();

    const { data: missions, error } = await supabase
      .from("missions")
      .select("*, cultural_regions(name), mission_questions(count)")
      .order("sort_order", { ascending: true });

    if (error) {
      throw new Error("Failed to load missions");
    }

    return Response.json({ success: true, data: missions ?? [] });
  });
}

export async function POST(request: Request) {
  return withErrorHandling(async () => {
    const user = await requireRole(["admin"]);
    const parsed = missionCreateSchema.parse(await request.json());
    const supabase = await createClient();

    const { data: existing } = await supabase
      .from("missions")
      .select("id")
      .eq("slug", parsed.slug)
      .maybeSingle();

    if (existing) {
      return Response.json(
        { success: false, error: "Slug misi sudah dipakai. Gunakan slug lain." },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from("missions")
      .insert(parsed)
      .select("id,slug,title,status")
      .single();

    if (error) {
      throw new Error("Failed to create mission");
    }

    await auditLog({
      actorId: user.id,
      action: "mission.created",
      resourceType: "mission",
      resourceId: data.id,
      details: { slug: parsed.slug, status: parsed.status },
    });

    return Response.json({ success: true, data }, { status: 201 });
  });
}
