import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service-role";
import { withErrorHandling } from "@/lib/api/handler";
import { rateLimit, clientKey } from "@/lib/security/rate-limit";

const NAMES = ["Penjelajah", "Sang Pemula", "Cendekiawan Muda", "Sang Penjelajah Budaya", "Calon Maestro"];

/**
 * One-tap demo session for judges and first-time visitors.
 * Creates a throwaway player account, signs it in via the server client
 * (which sets the session cookies), and lets the client redirect straight
 * to the dashboard. Rate-limited per IP to prevent account farming.
 */
export async function POST(request: Request) {
  return withErrorHandling(async () => {
    const rl = rateLimit(clientKey(request, "demo"), 10, 3_600_000);
    if (!rl.ok) {
      return Response.json(
        { success: false, error: "Terlalu banyak sesi demo dari jaringan ini. Coba lagi nanti." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    const rand = Math.random().toString(36).slice(2, 10);
    const email = `demo-${rand}@lokaquest.dev`;
    const password = `demo-${rand}-${Math.random().toString(36).slice(2, 12)}`;
    const fullName = `${NAMES[Math.floor(Math.random() * NAMES.length)]} Demo`;

    const service = createServiceClient();
    const { error: createError } = await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (createError) {
      throw new Error("Gagal menyiapkan sesi demo");
    }

    // Sign in via the cookie-backed server client so the browser session sticks
    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      throw new Error("Gagal masuk ke sesi demo");
    }

    return Response.json({ success: true, data: { fullName } });
  });
}
