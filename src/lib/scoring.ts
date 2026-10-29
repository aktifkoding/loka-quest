/**
 * Server-side answer scoring. Shared by mission attempts and assessments.
 * The client never sees correct answers; these helpers run only on the server.
 */

const normalizeText = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim().toLowerCase();
  return String(value).trim().toLowerCase();
};

/** Stable stringify for object comparison regardless of key order. */
const stableStringify = (value: unknown): string => {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value ?? null);
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`);
  return `{${entries.join(",")}}`;
};

/**
 * Extract the comparable answer text/object from a submitted payload.
 * The Phaser client sends `{ selected }` (choices) or `{ value }` (free text).
 */
const extractSubmitted = (submitted: Record<string, unknown>): unknown => {
  if ("selected" in submitted) return submitted.selected;
  if ("value" in submitted) return submitted.value;
  return submitted.correct ?? null;
};

const extractCorrect = (correct: Record<string, unknown>): unknown => {
  return correct.correct ?? correct.value ?? null;
};

/** Compare a submitted answer against the stored correct answer. */
export function isAnswerCorrect(
  submitted: Record<string, unknown>,
  correct: Record<string, unknown>
): boolean {
  const submittedValue = extractSubmitted(submitted);
  const correctValue = extractCorrect(correct);

  // Empty submissions never count as correct
  if (
    submittedValue === null ||
    submittedValue === undefined ||
    normalizeText(submittedValue) === ""
  ) {
    return false;
  }

  if (typeof submittedValue === "object" || typeof correctValue === "object") {
    return stableStringify(submittedValue) === stableStringify(correctValue);
  }

  return normalizeText(submittedValue) === normalizeText(correctValue);
}

/** Percentage score from correct/total, clamped to 0–100. */
export function calculateScore(correctCount: number, totalQuestions: number): number {
  if (totalQuestions <= 0) return 0;
  const clamped = Math.min(Math.max(correctCount, 0), totalQuestions);
  return Math.round((clamped / totalQuestions) * 100);
}

/** XP earned for a score, proportional to the mission reward. */
export function calculateXp(score: number, missionXpReward: number): number {
  return Math.round((score / 100) * missionXpReward);
}

/** Player level from total XP — every 500 XP is a new level. */
export function calculateLevel(totalXp: number): number {
  return Math.floor(totalXp / 500) + 1;
}
