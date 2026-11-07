import {
  determineRecommendedDifficulty,
  calculateRetentionScore,
  generateAdaptiveProfile,
  type SpacedRepetitionItem,
  type AttemptSummary,
} from "@/lib/adaptive";

describe("Adaptive Learning Path Engine", () => {
  describe("determineRecommendedDifficulty", () => {
    it("returns beginner when no attempts exist", () => {
      expect(determineRecommendedDifficulty([], 0, 0)).toBe("beginner");
    });

    it("returns beginner when average score is below 65", () => {
      expect(determineRecommendedDifficulty([50, 60, 55], 0, 1)).toBe("beginner");
    });

    it("returns beginner when player has high spaced repetition lapses", () => {
      // Even with 80% score, high lapses demotes to beginner for reinforcement
      expect(determineRecommendedDifficulty([80, 85], 1, 4)).toBe("beginner");
    });

    it("returns intermediate for moderate average scores (65 - 84)", () => {
      expect(determineRecommendedDifficulty([70, 75, 80], 0, 1)).toBe("intermediate");
    });

    it("returns advanced for high scores (>= 85) with minimal due items and low lapses", () => {
      expect(determineRecommendedDifficulty([90, 95, 100], 0, 0)).toBe("advanced");
    });
  });

  describe("calculateRetentionScore", () => {
    it("returns 100 when there are no review items", () => {
      expect(calculateRetentionScore([])).toBe(100);
    });

    it("calculates high retention for items with long intervals and high ease", () => {
      const items: SpacedRepetitionItem[] = [
        {
          question_id: "q1",
          mission_id: "m1",
          interval_days: 15,
          ease: 2.8,
          lapses: 0,
          due_at: new Date(Date.now() + 86400000).toISOString(),
        },
      ];
      const score = calculateRetentionScore(items);
      expect(score).toBeGreaterThanOrEqual(80);
    });

    it("penalizes retention score when items have repeated lapses", () => {
      const strugglingItems: SpacedRepetitionItem[] = [
        {
          question_id: "q1",
          mission_id: "m1",
          interval_days: 1,
          ease: 1.5,
          lapses: 4,
          due_at: new Date().toISOString(),
        },
      ];
      const score = calculateRetentionScore(strugglingItems);
      expect(score).toBeLessThan(50);
    });
  });

  describe("generateAdaptiveProfile", () => {
    it("prioritizes spaced review when items are due", () => {
      const pastDue = new Date(Date.now() - 3600000).toISOString();
      const reviewItems: SpacedRepetitionItem[] = [
        {
          question_id: "q1",
          mission_id: "m1",
          interval_days: 1,
          ease: 2.0,
          lapses: 1,
          due_at: pastDue,
        },
      ];

      const profile = generateAdaptiveProfile([], reviewItems, 0);
      expect(profile.dueReviewCount).toBe(1);
      expect(profile.path[0].type).toBe("spaced_review");
      expect(profile.path[0].priority).toBe("urgent");
    });

    it("suggests advanced mission when player is high-performing", () => {
      const attempts: AttemptSummary[] = [
        { score: 95, xp_earned: 100, completed: true, completed_at: new Date().toISOString() },
        { score: 100, xp_earned: 100, completed: true, completed_at: new Date().toISOString() },
      ];

      const profile = generateAdaptiveProfile(attempts, [], 3);
      expect(profile.recommendedDifficulty).toBe("advanced");
      expect(profile.learningStage).toBe("maestro");
      expect(profile.path.some((s) => s.difficulty === "advanced")).toBe(true);
    });
  });
});
