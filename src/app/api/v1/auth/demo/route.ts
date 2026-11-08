import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service-role";
import { withErrorHandling } from "@/lib/api/handler";
import { durableRateLimit } from "@/lib/security/rate-limit-db";
import { type Lang } from "@/lib/i18n";
import { getLangFromRequest } from "@/lib/i18n/server";
import { errorsDict as E } from "@/lib/i18n/dict/errors";

const NAMES: Record<Lang, string[]> = {
  id: ["Penjelajah", "Sang Pemula", "Cendekiawan Muda", "Sang Penjelajah Budaya", "Calon Maestro"],
  en: ["The Explorer", "The Beginner", "The Young Scholar", "The Culture Ranger", "The Maestro-to-be"],
};

/**
 * One-tap demo session for judges and first-time visitors.
 * Creates a throwaway player account, signs it in via the server client
 * (which sets the session cookies), and lets the client redirect straight
 * to the dashboard. Rate-limited per IP to prevent account farming.
 */
export async function POST(request: Request) {
  return withErrorHandling(async () => {
    const lang = getLangFromRequest(request);
    const rl = await durableRateLimit(request, "demo", 10, 3600);
    if (!rl.ok) {
      return Response.json(
        { success: false, error: E.rateLimitDemo[lang] },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    const rand = Math.random().toString(36).slice(2, 10);
    const email = `demo-${rand}@lokaquest.dev`;
    const password = `demo-${rand}-${Math.random().toString(36).slice(2, 12)}`;
    const names = NAMES[lang];
    const fullName = `${names[Math.floor(Math.random() * names.length)]} Demo`;

    const service = createServiceClient();
    const { error: createError } = await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (createError) {
      throw new Error(E.demoSetupFailed[lang]);
    }

    // Sign in via the cookie-backed server client so the browser session sticks
    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      throw new Error(E.demoLoginFailed[lang]);
    }

    return Response.json({ success: true, data: { fullName } });
  });
}
