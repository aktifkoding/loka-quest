import {
  generatePersonalizedRecommendations,
  type PlayerContext,
} from "@/lib/recommendations";

describe("Personalized Recommendations Engine", () => {
  it("prioritizes spaced repetition review when due items exist", () => {
    const ctx: PlayerContext = {
      userId: "user-1",
      totalXp: 450,
      currentLevel: 1,
      missionsCompleted: 1,
      completedSlugs: ["batik-detective"],
      recentScores: [85],
      dueReviewCount: 3,
      dailyCompletedToday: false,
    };

    const recs = generatePersonalizedRecommendations(ctx);
    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].category).toBe("review");
    expect(recs[0].badgeVariant).toBe("urgent");
    expect(recs[0].href).toBe("/player/review");
  });

  it("recommends starter mission to new players without batik completion", () => {
    const ctx: PlayerContext = {
      userId: "user-new",
      totalXp: 0,
      currentLevel: 1,
      missionsCompleted: 0,
      completedSlugs: [],
      recentScores: [],
      dueReviewCount: 0,
      dailyCompletedToday: false,
    };

    const recs = generatePersonalizedRecommendations(ctx);
    const missionRec = recs.find((r) => r.category === "misi");
    expect(missionRec).toBeDefined();
    expect(missionRec?.href).toBe("/missions/batik-detective");
    expect(missionRec?.badge).toBe("Rekomendasi Pemula");
  });

  it("recommends regional language vocabulary module and interactive media", () => {
    const ctx: PlayerContext = {
      userId: "user-2",
      totalXp: 1200,
      currentLevel: 3,
      missionsCompleted: 2,
      completedSlugs: ["batik-detective", "gamelan-maestro"],
      recentScores: [90, 85],
      dueReviewCount: 0,
      dailyCompletedToday: true,
    };

    const recs = generatePersonalizedRecommendations(ctx);
    expect(recs.some((r) => r.category === "bahasa")).toBe(true);
    expect(recs.some((r) => r.category === "ensiklopedia")).toBe(true);
  });
});
