import { tokenize, score } from "@/lib/ai/retrieval";

describe("AI retrieval scoring", () => {
  it("drops Indonesian and English question stop words", () => {
    expect(tokenize("Apa itu ulos Batak Toba?")).toEqual(["ulos", "batak", "toba"]);
    expect(tokenize("What is a batik tulis?")).toEqual(["batik", "tulis"]);
  });

  it("keeps meaningful words and drops short tokens", () => {
    expect(tokenize("Apa itu Tari Kuda Lumping?")).toEqual(["tari", "kuda", "lumping"]);
  });

  it("never matches a stop word inside a longer word (apa vs kelapa)", () => {
    const queryTokens = tokenize("Apa itu rendang?");
    // "kelapa" contains "apa" as a substring — must score 0 for that token.
    expect(score({ body: "direbus dengan santan kelapa dan rempah" }, queryTokens)).toBe(0);
  });

  it("matches whole words only, weighting title hits above body hits", () => {
    const tokens = tokenize("ulos batak");
    const titleHit = score({ title: "Ulos: Kain Adat Batak Toba", body: "kain tradisional" }, tokens);
    const bodyHit = score({ title: "Tekstil Nusantara", body: "ulos adalah kain adat Batak" }, tokens);
    // title has 2 token hits (×3) + body "kain"/"adat" irrelevant → 6
    expect(titleHit).toBe(6);
    // body has 2 token hits (×1) → 2
    expect(bodyHit).toBe(2);
  });

  it("repeated occurrences accumulate", () => {
    expect(score({ body: "ulos ulos ulos" }, tokenize("ulos"))).toBe(3);
  });

  it("scores zero for empty queries or empty fields", () => {
    expect(score({ body: "ulos batak" }, [])).toBe(0);
    expect(score({ title: null, body: null }, tokenize("ulos"))).toBe(0);
  });

  it("treats punctuation-separated words as boundaries", () => {
    expect(score({ body: "tenun ulos, batak-toba" }, tokenize("ulos toba"))).toBe(2);
  });

  it("never throws on regex metacharacters in tokens", () => {
    // tokens are tokenized clean in practice; score() must stay safe anyway
    expect(() => score({ body: "motif (ulos) khas" }, ["(ulos)", "ulos*", "n.n", "["])).not.toThrow();
    expect(score({ body: "motif (ulos) khas" }, ["ulos"])).toBe(1);
  });
});
