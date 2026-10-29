import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";

export async function GET() {
  return withErrorHandling(async () => {
    const user = await requireAuth();
    const supabase = await createClient();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, xp, level, created_at")
      .eq("id", user.id)
      .single();

    if (error || !profile) {
      return Response.json(
        { success: false, error: "Profile not found" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: profile });
  });
}

export async function PATCH(request: Request) {
  return withErrorHandling(async () => {
    const user = await requireAuth();
    const supabase = await createClient();
    const body = (await request.json()) as { full_name?: string };

    // Players may only update their display name — role/xp/level are server-managed
    const allowed: Record<string, unknown> = {};
    if (typeof body.full_name === "string" && body.full_name.trim().length >= 2) {
      allowed.full_name = body.full_name.trim().slice(0, 120);
    }

    if (Object.keys(allowed).length === 0) {
      return Response.json(
        { success: false, error: "No updatable fields provided" },
        { status: 400 }
      );
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .update(allowed)
      .eq("id", user.id)
      .select("id, email, full_name, role, xp, level")
      .single();

    if (error) {
      throw new Error("Failed to update profile");
    }

    return Response.json({ success: true, data: profile });
  });
}
