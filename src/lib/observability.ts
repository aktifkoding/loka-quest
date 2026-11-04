/**
 * Minimal, dependency-free error reporting.
 *
 * Always writes a structured JSON line to the server log (picked up by Vercel
 * or any log drain). When ERROR_WEBHOOK_URL is configured, the same payload is
 * forwarded to an external collector such as Sentry's ingest proxy, Better
 * Stack, or a custom endpoint. Reporting is best-effort and never throws.
 */
export async function captureException(
  error: unknown,
  context: Record<string, unknown> = {}
): Promise<void> {
  const payload = {
    level: "error",
    timestamp: new Date().toISOString(),
    name: error instanceof Error ? error.name : "UnknownError",
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
  };

  console.error("[observability]", JSON.stringify(payload));

  const webhook = process.env.ERROR_WEBHOOK_URL;
  if (!webhook) return;

  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(3000),
    });
  } catch (reportingError) {
    console.error("[observability] webhook failed:", reportingError);
  }
}
