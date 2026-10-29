import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";

export async function GET() {
  return withErrorHandling(async () => {
    await requireRole(["admin"]);
    const supabase = await createClient();

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, xp, level, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error("Failed to load users");
    }

    return Response.json({ success: true, data: profiles ?? [] });
  });
}
