import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service-role";
import { getSessionUser } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/response";
import { durableRateLimit } from "@/lib/security/rate-limit-db";

const eventSchema = z.object({
  name: z.string().trim().min(2).max(80),
  consent: z.literal(true),
  anonymousId: z.string().trim().max(80).optional().nullable(),
  props: z.record(z.unknown()).default({}),
});

export async function POST(request: Request) {
  return withErrorHandling(async () => {
    const rl = await durableRateLimit(request, "analytics", 60, 60);
    if (!rl.ok) {
      return Response.json(
        { success: false, error: "Too many events" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    const input = await parseBody(request);
    const user = await getSessionUser();
    const service = createServiceClient();

    // Only allow a small, flat property bag to keep storage bounded.
    const props = Object.fromEntries(
      Object.entries(input.props)
        .filter(([, value]) => ["string", "number", "boolean"].includes(typeof value))
        .slice(0, 12)
    );

    const { error } = await service.from("analytics_events").insert({
      profile_id: user?.id ?? null,
      anonymous_id: input.anonymousId ?? null,
      name: input.name,
      props,
    });

    if (error) throw new Error(`Failed to store analytics event: ${error.code}`);

    return Response.json(
      { success: true, data: { recorded: true } },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  });
}

async function parseBody(request: Request) {
  return parseJsonBody(request, eventSchema);
}
