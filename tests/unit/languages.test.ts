import {
  getRegionalLanguages,
  getLanguageBySlug,
  getVocabulariesByLanguage,
  getVocabulariesForArticle,
  getVocabulariesForRegion,
  generateLanguageQuiz,
} from "@/lib/languages";

describe("Regional Languages Module", () => {
  it("should return all defined regional languages", () => {
    const languages = getRegionalLanguages();
    expect(languages.length).toBeGreaterThanOrEqual(6);
    expect(languages.some((l) => l.slug === "jawa")).toBe(true);
    expect(languages.some((l) => l.slug === "sunda")).toBe(true);
    expect(languages.some((l) => l.slug === "minang")).toBe(true);
    expect(languages.some((l) => l.slug === "bali")).toBe(true);
  });

  it("should fetch language by slug with cultural details and greetings", () => {
    const jawa = getLanguageBySlug("jawa");
    expect(jawa).toBeDefined();
    expect(jawa?.name).toBe("Bahasa Jawa");
    expect(jawa?.greeting.word).toBe("Sugeng Rawuh");
    expect(jawa?.greeting.phonetic).toContain("/su.ɡəŋ");

    const nonExistent = getLanguageBySlug("unknown-lang");
    expect(nonExistent).toBeUndefined();
  });

  it("should filter vocabularies by category and difficulty", () => {
    const jawaVocab = getVocabulariesByLanguage("jawa");
    expect(jawaVocab.length).toBeGreaterThan(0);

    const sapaanVocab = getVocabulariesByLanguage("jawa", { category: "sapaan" });
    expect(sapaanVocab.every((v) => v.category === "sapaan")).toBe(true);

    const beginnerVocab = getVocabulariesByLanguage("jawa", { difficulty: "beginner" });
    expect(beginnerVocab.every((v) => v.difficulty === "beginner")).toBe(true);
  });

  it("should retrieve vocabularies linked to specific encyclopedia articles", () => {
    const batikVocab = getVocabulariesForArticle("batik-indonesia");
    expect(batikVocab.length).toBeGreaterThan(0);
    expect(batikVocab.some((v) => v.word.toLowerCase() === "canting")).toBe(true);

    const angklungVocab = getVocabulariesForArticle("angklung");
    expect(angklungVocab.length).toBeGreaterThan(0);
  });

  it("should generate balanced multiple choice quiz questions", () => {
    const quiz = generateLanguageQuiz("sunda", 3);
    expect(quiz.length).toBe(3);

    for (const q of quiz) {
      expect(q.prompt).toContain("Apa arti dari kata");
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      expect(q.options).toContain(q.correctAnswer);
      expect(q.explanation).toBeTruthy();
    }
  });
});
