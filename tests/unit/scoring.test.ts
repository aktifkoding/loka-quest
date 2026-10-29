import {
  isAnswerCorrect,
  calculateScore,
  calculateXp,
  calculateLevel,
} from "@/lib/scoring";

describe("isAnswerCorrect", () => {
  it("accepts an exact selected choice", () => {
    expect(
      isAnswerCorrect({ selected: "Parang Rusak" }, { correct: "Parang Rusak" })
    ).toBe(true);
  });

  it("is case and whitespace insensitive", () => {
    expect(
      isAnswerCorrect({ selected: "  parang rusak  " }, { correct: "Parang Rusak" })
    ).toBe(true);
  });

  it("accepts free-text answers via the value key", () => {
    expect(
      isAnswerCorrect({ value: "Semar" }, { correct: "Semar" })
    ).toBe(true);
  });

  it("rejects a wrong answer", () => {
    expect(
      isAnswerCorrect({ selected: "Kawung" }, { correct: "Parang Rusak" })
    ).toBe(false);
  });

  it("rejects empty submissions", () => {
    expect(isAnswerCorrect({ selected: "" }, { correct: "Parang Rusak" })).toBe(false);
    expect(isAnswerCorrect({ value: "   " }, { correct: "Semar" })).toBe(false);
    expect(isAnswerCorrect({}, { correct: "Semar" })).toBe(false);
  });

  it("compares objects ignoring key order", () => {
    expect(
      isAnswerCorrect(
        { selected: { a: 1, b: 2 } },
        { correct: { b: 2, a: 1 } }
      )
    ).toBe(true);
  });
});

describe("calculateScore", () => {
  it("returns 0 for zero questions", () => {
    expect(calculateScore(0, 0)).toBe(0);
  });

  it("returns 100 for a perfect run", () => {
    expect(calculateScore(6, 6)).toBe(100);
  });

  it("rounds to the nearest integer", () => {
    expect(calculateScore(1, 3)).toBe(33);
    expect(calculateScore(2, 3)).toBe(67);
  });

  it("never exceeds 100", () => {
    expect(calculateScore(8, 6)).toBeLessThanOrEqual(100);
  });
});

describe("calculateXp", () => {
  it("scales XP proportionally to the score", () => {
    expect(calculateXp(100, 150)).toBe(150);
    expect(calculateXp(50, 150)).toBe(75);
    expect(calculateXp(0, 150)).toBe(0);
  });

  it("rounds XP to whole numbers", () => {
    expect(calculateXp(33, 100)).toBe(33);
    expect(calculateXp(67, 100)).toBe(67);
  });
});

describe("calculateLevel", () => {
  it("starts at level 1", () => {
    expect(calculateLevel(0)).toBe(1);
    expect(calculateLevel(499)).toBe(1);
  });

  it("advances every 500 XP", () => {
    expect(calculateLevel(500)).toBe(2);
    expect(calculateLevel(999)).toBe(2);
    expect(calculateLevel(1000)).toBe(3);
  });
});
