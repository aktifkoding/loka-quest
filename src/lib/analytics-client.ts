"use client";

const CONSENT_KEY = "lokaquest.analytics-consent";
const ANON_KEY = "lokaquest.anonymous-id";

export type Consent = "granted" | "denied" | null;

/** localStorage bisa melempar di browser privat/terkunci — jangan pernah crash UI. */
function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // storage tidak tersedia — analitik anonim dilewati.
  }
}

export function getConsent(): Consent {
  if (typeof window === "undefined") return null;
  const value = readStorage(CONSENT_KEY);
  return value === "granted" || value === "denied" ? value : null;
}

export function setConsent(value: "granted" | "denied") {
  if (typeof window === "undefined") return;
  writeStorage(CONSENT_KEY, value);
  window.dispatchEvent(new Event("lokaquest:consent"));
}

function anonymousId(): string {
  const existing = readStorage(ANON_KEY);
  if (existing) return existing;
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  writeStorage(ANON_KEY, id);
  return id;
}

/** Fire-and-forget product analytics; never runs without consent. */
export function trackEvent(
  name: string,
  props: Record<string, string | number | boolean> = {}
) {
  if (typeof window === "undefined" || getConsent() !== "granted") return;

  void fetch("/api/v1/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, anonymousId: anonymousId(), props, consent: true }),
    keepalive: true,
  }).catch(() => {
    // analytics must never break the UI
  });
}
