/**
 * Keyword retrieval helpers for the culture assistant.
 *
 * Pure functions so the relevance behaviour stays unit-testable.
 * Matching is word-boundary based (substring matching used to make
 * "apa" match "kelapa" and pull completely unrelated content), stop
 * words are dropped, and title hits weigh more than body hits.
 */

const STOPWORDS = new Set([
  // Indonesian question/connector words
  "apa", "itu", "yang", "dan", "atau", "adalah", "bagaimana", "gimana",
  "siapa", "kenapa", "mengapa", "untuk", "tentang", "secara", "juga",
  "bisa", "dapat", "adalah", "dengan", "pada", "oleh", "sebagai", "dalam",
  "tidak", "bukan", "akan", "sudah", "telah", "saya", "kamu", "kita",
  "mereka", "hal", "ada", "dari", "ke", "di", "jelaskan", "ceritakan",
  "sebutkan", "tolong", "dong", "yaitu", "ialah", "apaan", "banget",
  // English question/connector words
  "the", "what", "who", "whom", "how", "why", "where", "when", "which",
  "and", "or", "for", "about", "explain", "tell", "please", "with", "that",
  "this", "these", "those", "are", "was", "were", "has", "have", "been",
  "can", "could", "would", "should", "will", "from", "into", "over",
]);

const TITLE_WEIGHT = 3;
const BODY_WEIGHT = 1;

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Count word-boundary occurrences of `token` inside `text`. */
function countOccurrences(text: string, token: string): number {
  const matches = text.match(new RegExp(`\\b${escapeRegex(token)}\\b`, "g"));
  return matches ? matches.length : 0;
}

export type ScoredFields = {
  title?: string | null;
  body?: string | null;
  extras?: Array<string | null | undefined>;
};

/**
 * Weighted relevance score: matches in the title count TITLE_WEIGHT times,
 * body matches BODY_WEIGHT times, extra fields (region, source title) match
 * like the body. Word-boundary only, so "apa" never matches "kelapa".
 */
export function score(fields: ScoredFields, queryTokens: string[]): number {
  if (queryTokens.length === 0) return 0;
  const title = (fields.title ?? "").toLowerCase();
  const body = (fields.body ?? "").toLowerCase();
  const extras = (fields.extras ?? [])
    .map((field) => (field ?? "").toLowerCase())
    .filter(Boolean);

  return queryTokens.reduce((total, token) => {
    const titleHits = countOccurrences(title, token);
    const bodyHits = countOccurrences(body, token);
    const extraHits = extras.reduce(
      (sum, extra) => sum + countOccurrences(extra, token),
      0
    );
    return total + titleHits * TITLE_WEIGHT + bodyHits * BODY_WEIGHT + extraHits * BODY_WEIGHT;
  }, 0);
}
