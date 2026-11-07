import { createServiceClient } from "@/lib/supabase/service-role";
import { clientKey, rateLimit } from "@/lib/security/rate-limit";

/**
 * Durable rate limit backed by Postgres. Falls back to the per-instance
 * limiter if the database function is unavailable (for example before the
 * migration is applied), so endpoints keep working during rollout.
 */
export async function durableRateLimit(
  request: Request,
  scope: string,
  limit: number,
  windowSeconds: number
): Promise<{ ok: boolean; retryAfterSec: number }> {
  const key = clientKey(request, scope);

  try {
    const service = createServiceClient();
    const { data, error } = await service.rpc("check_rate_limit", {
      p_key: key,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });

    if (error || !data?.[0]) {
      throw error ?? new Error("empty rate limit result");
    }

    return {
      ok: Boolean(data[0].allowed),
      retryAfterSec: Number(data[0].retry_after) || 0,
    };
  } catch {
    return rateLimit(key, limit, windowSeconds * 1000);
  }
}
