"use client";

const CONSENT_KEY = "lokaquest.analytics-consent";
const ANON_KEY = "lokaquest.anonymous-id";

export type Consent = "granted" | "denied" | null;

export function getConsent(): Consent {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(CONSENT_KEY);
  return value === "granted" || value === "denied" ? value : null;
}

export function setConsent(value: "granted" | "denied") {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CONSENT_KEY, value);
  window.dispatchEvent(new Event("lokaquest:consent"));
}

function anonymousId(): string {
  const existing = window.localStorage.getItem(ANON_KEY);
  if (existing) return existing;
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  window.localStorage.setItem(ANON_KEY, id);
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
