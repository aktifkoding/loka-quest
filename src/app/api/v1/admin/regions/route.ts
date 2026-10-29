import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";

export async function GET() {
  return withErrorHandling(async () => {
    await requireRole(["admin"]);
    const supabase = await createClient();

    const { data: regions, error } = await supabase
      .from("cultural_regions")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      throw new Error("Failed to load regions");
    }

    return Response.json({ success: true, data: regions ?? [] });
  });
}
