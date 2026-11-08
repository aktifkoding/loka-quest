/**
 * Adaptive Learning Path & Spaced Repetition Engine for LokaQuest
 * Dynamically computes player skill mastery and recommends personalized
 * difficulty tiers and review sequences.
 */

import type { Lang } from "./i18n/types";

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export type LearningStage = "fondasi" | "eksplorasi" | "maestro";

export interface SpacedRepetitionItem {
  question_id: string;
  mission_id: string;
  interval_days: number;
  ease: number;
  lapses: number;
  due_at: string;
  last_reviewed_at?: string | null;
}

export interface AttemptSummary {
  score: number;
  xp_earned: number;
  completed: boolean;
  completed_at: string | null;
}

export interface AdaptiveStep {
  id: string;
  type: "spaced_review" | "mission" | "vocabulary_quiz" | "cultural_reading";
  title: string;
  description: string;
  priority: "urgent" | "recommended" | "optional";
  difficulty: DifficultyLevel;
  href: string;
  reason: string;
  xpRewardEstimate?: number;
}

export interface AdaptiveProfile {
  recommendedDifficulty: DifficultyLevel;
  learningStage: LearningStage;
  performanceIndex: number; // 0 - 100
  retentionScore: number; // 0 - 100
  recentAverageScore: number;
  totalAttempts: number;
  dueReviewCount: number;
  adjustmentReason: string;
  path: AdaptiveStep[];
}

/**
 * Compute the recommended difficulty based on recent attempts and error rate.
 * - Score < 65% or high lapses -> beginner
 * - Score 65% - 84% -> intermediate
 * - Score >= 85% with >= 2 completed missions -> advanced
 */
export function determineRecommendedDifficulty(
  recentScores: number[],
  dueReviewsCount: number,
  lapsesCount: number
): DifficultyLevel {
  if (recentScores.length === 0) {
    return "beginner";
  }

  const average =
    recentScores.reduce((sum, val) => sum + val, 0) / recentScores.length;

  // If player is struggling or has many lapses in spaced repetition
  if (average < 65 || lapsesCount >= 3) {
    return "beginner";
  }

  // If consistently scoring high with low lapses
  if (average >= 85 && dueReviewsCount <= 2 && recentScores.length >= 2) {
    return "advanced";
  }

  return "intermediate";
}

/**
 * Calculate retention score from spaced repetition items
 * Higher interval_days and ease with low lapses yield higher retention score.
 */
export function calculateRetentionScore(items: SpacedRepetitionItem[]): number {
  if (items.length === 0) return 100;

  const totalScore = items.reduce((acc, item) => {
    const easeFactor = Math.min(Math.max(Number(item.ease) || 2.5, 1.3), 3.0);
    const intervalBonus = Math.min((item.interval_days || 1) * 3, 40);
    const lapsePenalty = (item.lapses || 0) * 15;
    const itemScore = Math.max(0, Math.min(100, easeFactor * 25 + intervalBonus - lapsePenalty));
    return acc + itemScore;
  }, 0);

  return Math.round(totalScore / items.length);
}

/**
 * Generate full adaptive profile for a player.
 * Strings default to Indonesian ("id"); pass lang="en" for English UI copy.
 */
export function generateAdaptiveProfile(
  attempts: AttemptSummary[],
  reviewItems: SpacedRepetitionItem[],
  totalMissionsCompleted = 0,
  lang: Lang = "id"
): AdaptiveProfile {
  const now = new Date();
  const dueItems = reviewItems.filter(
    (item) => new Date(item.due_at).getTime() <= now.getTime()
  );
  const totalLapses = reviewItems.reduce((acc, i) => acc + (i.lapses || 0), 0);

  const completedAttempts = attempts.filter((a) => a.completed);
  const recentScores = completedAttempts.slice(0, 5).map((a) => a.score);

  const recentAverage =
    recentScores.length > 0
      ? Math.round(recentScores.reduce((s, v) => s + v, 0) / recentScores.length)
      : 0;

  const recommendedDifficulty = determineRecommendedDifficulty(
    recentScores,
    dueItems.length,
    totalLapses
  );

  const retentionScore = calculateRetentionScore(reviewItems);

  // Performance index combines recent scores and retention
  const performanceIndex = Math.round(
    recentScores.length > 0
      ? recentAverage * 0.7 + retentionScore * 0.3
      : 50
  );

  let learningStage: LearningStage = "fondasi";
  if (totalMissionsCompleted >= 3 && performanceIndex >= 80) {
    learningStage = "maestro";
  } else if (totalMissionsCompleted >= 1 || performanceIndex >= 65) {
    learningStage = "eksplorasi";
  }

  let adjustmentReason = "";
  if (dueItems.length > 0) {
    adjustmentReason =
      lang === "en"
        ? `There are ${dueItems.length} review items to reinforce with spaced repetition before the difficulty is raised.`
        : `Terdapat ${dueItems.length} materi review yang perlu diperkuat dengan spaced-repetition sebelum tingkat kesulitan dinaikkan.`;
  } else if (recommendedDifficulty === "advanced") {
    adjustmentReason =
      lang === "en"
        ? `Your average accuracy of ${recentAverage}% is very consistent. The adaptive path raises the challenge to the Advanced level.`
        : `Akurasi rata-ratamu ${recentAverage}% sangat konsisten. Jalur adaptif menaikkan tantangan ke level Lanjutan.`;
  } else if (recommendedDifficulty === "intermediate") {
    adjustmentReason =
      lang === "en"
        ? `Steady performance (average ${recentAverage}%). You are ready to complete Intermediate missions.`
        : `Performa stabil (rata-rata ${recentAverage}%). Kamu siap menyelesaikan misi Menengah.`;
  } else {
    adjustmentReason =
      lang === "en"
        ? `The adaptive path focuses on consolidating the basics with regular review.`
        : `Jalur adaptif memfokuskan pemantapan konsep dasar dan pengulangan berkala.`;
  }

  // Construct personalized adaptive path steps
  const path: AdaptiveStep[] = [];

  // Step 1: Spaced Repetition if items are due
  if (dueItems.length > 0) {
    path.push({
      id: "step-spaced-review",
      type: "spaced_review",
      title: lang === "en" ? "Scheduled Smart Review" : "Review Pintar Terjadwal",
      description:
        lang === "en"
          ? `${dueItems.length} questions you previously answered incorrectly are due to be repeated today so they stick in long-term memory.`
          : `${dueItems.length} soal yang pernah dijawab salah telah jatuh tempo untuk diulang hari ini agar tersimpan di memori jangka panjang.`,
      priority: "urgent",
      difficulty: "beginner",
      href: "/player/review",
      reason:
        lang === "en"
          ? "Spaced repetition optimizes the Ebbinghaus forgetting curve."
          : "Spaced-repetition mengoptimalkan kurva daya ingat Ebbinghaus.",
      xpRewardEstimate: dueItems.length * 20,
    });
  }

  // Step 2: Next Mission recommendation based on difficulty
  if (recommendedDifficulty === "advanced") {
    path.push({
      id: "step-mission-advanced",
      type: "mission",
      title: lang === "en" ? "Advanced Mission: Wayang Story Adventure" : "Misi Tingkat Lanjutan: Wayang Story Adventure",
      description:
        lang === "en"
          ? "A challenge in sequencing Mahabharata story acts and analyzing the philosophy of shadow puppet performances."
          : "Tantangan penataan lakon Mahabharata & analisis filosofi pertunjukan wayang kulit purwa.",
      priority: "recommended",
      difficulty: "advanced",
      href: "/missions/wayang-story",
      reason:
        lang === "en"
          ? "Your high accuracy qualifies you for advanced sequencing challenges."
          : "Tingkat akurasi tinggi memenuhi syarat untuk tantangan urutan (sequencing) lanjutan.",
      xpRewardEstimate: 150,
    });
  } else if (recommendedDifficulty === "intermediate") {
    path.push({
      id: "step-mission-intermediate",
      type: "mission",
      title: lang === "en" ? "Intermediate Mission: Gamelan Maestro" : "Misi Tingkat Menengah: Gamelan Maestro",
      description:
        lang === "en"
          ? "Harmonize kendang rhythms, slendro-pelog tunings, and the gong structures of Javanese gamelan."
          : "Harmonisasi ritme kendang, laras slendro-pelog, dan struktur gongan gamelan Jawa.",
      priority: "recommended",
      difficulty: "intermediate",
      href: "/missions/gamelan-maestro",
      reason:
        lang === "en"
          ? "You have mastered the foundations — time for more dynamic musical exploration."
          : "Tingkat pemahaman fondasi telah tercapai, saatnya eksplorasi musikal yang lebih dinamis.",
      xpRewardEstimate: 120,
    });
  } else {
    path.push({
      id: "step-mission-beginner",
      type: "mission",
      title: lang === "en" ? "Beginner Mission: Batik Detective" : "Misi Tingkat Pemula: Batik Detective",
      description:
        lang === "en"
          ? "Explore the classic Parang & Kawung motifs and the wax-resist canting technique."
          : "Eksplorasi motif klasik Parang & Kawung serta teknik canting lilin malam.",
      priority: "recommended",
      difficulty: "beginner",
      href: "/missions/batik-detective",
      reason:
        lang === "en"
          ? "Practice recognizing basic visual patterns and the cultural history of the archipelago."
          : "Latihan mengenali pola dasar visual dan sejarah budaya Nusantara.",
      xpRewardEstimate: 100,
    });
  }

  // Step 3: Vocabulary Quiz recommendation
  path.push({
    id: "step-vocab-quiz",
    type: "vocabulary_quiz",
    title: lang === "en" ? "Regional Language Vocabulary Quiz" : "Kuis Kosakata Bahasa Daerah",
    description:
      lang === "en"
        ? "Strengthen your grasp of traditional vocabulary and the phonetic audio pronunciation of regional languages."
        : "Perkuat pemahaman kosakata adat & pelafalan audio fonetis bahasa Nusantara.",
    priority: "recommended",
    difficulty: recommendedDifficulty,
    href: "/bahasa",
    reason:
      lang === "en"
        ? "Mastering cultural terms is proven to speed up understanding of mission questions."
        : "Penguasaan istilah budaya terbukti meningkatkan kecepatan memahami soal misi.",
    xpRewardEstimate: 75,
  });

  // Step 4: Cultural Reading
  path.push({
    id: "step-reading",
    type: "cultural_reading",
    title: lang === "en" ? "Encyclopedia & Media Exploration" : "Eksplorasi Ensiklopedia & Media",
    description:
      lang === "en"
        ? "Watch traditional dance videos and listen to audio recordings of regional instruments."
        : "Saksikan video tari tradisional dan dengarkan rekaman audio musik instrumen daerah.",
    priority: "optional",
    difficulty: "beginner",
    href: "/encyclopedia/explore",
    reason:
      lang === "en"
        ? "Enrich your cultural context with interactive media."
        : "Memperkaya konteks kultural dengan media interaktif.",
  });

  return {
    recommendedDifficulty,
    learningStage,
    performanceIndex,
    retentionScore,
    recentAverageScore: recentAverage,
    totalAttempts: attempts.length,
    dueReviewCount: dueItems.length,
    adjustmentReason,
    path,
  };
}
