/**
 * Adaptive Learning Path & Spaced Repetition Engine for LokaQuest
 * Dynamically computes player skill mastery and recommends personalized
 * difficulty tiers and review sequences.
 */

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
 */
export function generateAdaptiveProfile(
  attempts: AttemptSummary[],
  reviewItems: SpacedRepetitionItem[],
  totalMissionsCompleted = 0
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
    adjustmentReason = `Terdapat ${dueItems.length} materi review yang perlu diperkuat dengan spaced-repetition sebelum tingkat kesulitan dinaikkan.`;
  } else if (recommendedDifficulty === "advanced") {
    adjustmentReason = `Akurasi rata-ratamu ${recentAverage}% sangat konsisten. Jalur adaptif menaikkan tantangan ke level Lanjutan.`;
  } else if (recommendedDifficulty === "intermediate") {
    adjustmentReason = `Performa stabil (rata-rata ${recentAverage}%). Kamu siap menyelesaikan misi Menengah.`;
  } else {
    adjustmentReason = `Jalur adaptif memfokuskan pemantapan konsep dasar dan pengulangan berkala.`;
  }

  // Construct personalized adaptive path steps
  const path: AdaptiveStep[] = [];

  // Step 1: Spaced Repetition if items are due
  if (dueItems.length > 0) {
    path.push({
      id: "step-spaced-review",
      type: "spaced_review",
      title: "Review Pintar Terjadwal",
      description: `${dueItems.length} soal yang pernah dijawab salah telah jatuh tempo untuk diulang hari ini agar tersimpan di memori jangka panjang.`,
      priority: "urgent",
      difficulty: "beginner",
      href: "/player/review",
      reason: "Spaced-repetition mengoptimalkan kurva daya ingat Ebbinghaus.",
      xpRewardEstimate: dueItems.length * 20,
    });
  }

  // Step 2: Next Mission recommendation based on difficulty
  if (recommendedDifficulty === "advanced") {
    path.push({
      id: "step-mission-advanced",
      type: "mission",
      title: "Misi Tingkat Lanjutan: Wayang Story Adventure",
      description: "Tantangan penataan lakon Mahabharata & analisis filosofi pertunjukan wayang kulit purwa.",
      priority: "recommended",
      difficulty: "advanced",
      href: "/missions/wayang-story",
      reason: "Tingkat akurasi tinggi memenuhi syarat untuk tantangan urutan (sequencing) lanjutan.",
      xpRewardEstimate: 150,
    });
  } else if (recommendedDifficulty === "intermediate") {
    path.push({
      id: "step-mission-intermediate",
      type: "mission",
      title: "Misi Tingkat Menengah: Gamelan Maestro",
      description: "Harmonisasi ritme kendang, laras slendro-pelog, dan struktur gongan gamelan Jawa.",
      priority: "recommended",
      difficulty: "intermediate",
      href: "/missions/gamelan-maestro",
      reason: "Tingkat pemahaman fondasi telah tercapai, saatnya eksplorasi musikal yang lebih dinamis.",
      xpRewardEstimate: 120,
    });
  } else {
    path.push({
      id: "step-mission-beginner",
      type: "mission",
      title: "Misi Tingkat Pemula: Batik Detective",
      description: "Eksplorasi motif klasik Parang & Kawung serta teknik canting lilin malam.",
      priority: "recommended",
      difficulty: "beginner",
      href: "/missions/batik-detective",
      reason: "Latihan mengenali pola dasar visual dan sejarah budaya Nusantara.",
      xpRewardEstimate: 100,
    });
  }

  // Step 3: Vocabulary Quiz recommendation
  path.push({
    id: "step-vocab-quiz",
    type: "vocabulary_quiz",
    title: "Kuis Kosakata Bahasa Daerah",
    description: "Perkuat pemahaman kosakata adat & pelafalan audio fonetis bahasa Nusantara.",
    priority: "recommended",
    difficulty: recommendedDifficulty,
    href: "/bahasa",
    reason: "Penguasaan istilah budaya terbukti meningkatkan kecepatan memahami soal misi.",
    xpRewardEstimate: 75,
  });

  // Step 4: Cultural Reading
  path.push({
    id: "step-reading",
    type: "cultural_reading",
    title: "Eksplorasi Ensiklopedia & Media",
    description: "Saksikan video tari tradisional dan dengarkan rekaman audio musik instrumen daerah.",
    priority: "optional",
    difficulty: "beginner",
    href: "/encyclopedia/explore",
    reason: "Memperkaya konteks kultural dengan media interaktif.",
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
