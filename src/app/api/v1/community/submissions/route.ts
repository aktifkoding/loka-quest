import { z } from "zod";
import { withErrorHandling } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { durableRateLimit } from "@/lib/security/rate-limit-db";

const submissionSchema = z.object({
  title: z.string().trim().min(3).max(180),
  body: z.string().trim().min(20).max(10000),
  region_slug: z.string().trim().max(120).optional().nullable(),
  submitter_name: z.string().trim().min(2).max(120),
  submitter_email: z.string().trim().email().max(200),
});

/**
 * Public gallery. Only verified (published) contributions are visible, and
 * the submitter email is never part of the response.
 */
export async function GET() {
  return withErrorHandling(async () => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("community_submissions")
      .select(
        "id, title, body, submitter_name, region_slug, status, created_at"
      )
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      throw new Error("Failed to load submissions");
    }

    return Response.json(
      { success: true, data: data ?? [] },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  });
}

export async function POST(request: Request) {
  return withErrorHandling(async () => {
    const rl = await durableRateLimit(request, "community-submit", 5, 60);
    if (!rl.ok) {
      return Response.json(
        { success: false, error: "Terlalu banyak kiriman. Coba lagi nanti." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    const user = await requireAuth();
    const input = await parseJsonBody(request, submissionSchema);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("community_submissions")
      .insert({
        submitter_id: user.id,
        submitter_name: input.submitter_name,
        submitter_email: input.submitter_email,
        title: input.title,
        body: input.body,
        region_slug: input.region_slug || null,
        status: "pending",
      })
      .select(
        "id, title, body, submitter_name, region_slug, status, created_at"
      )
      .single();

    if (error) {
      throw new Error("Failed to submit contribution");
    }

    return Response.json({ success: true, data }, { status: 201 });
  });
}
