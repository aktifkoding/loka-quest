import { REGIONAL_LANGUAGES } from "./languages";

export interface PersonalizedRecommendation {
  id: string;
  category: "misi" | "review" | "ensiklopedia" | "bahasa";
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  badgeVariant?: "default" | "gold" | "urgent" | "success";
  href: string;
  actionLabel: string;
  xpReward?: number;
  iconName: "gamepad" | "rotate" | "book" | "languages" | "zap" | "star";
  reason: string;
}

export interface PlayerContext {
  userId: string;
  totalXp: number;
  currentLevel: number;
  missionsCompleted: number;
  completedSlugs: string[];
  recentScores: number[];
  dueReviewCount: number;
  dailyCompletedToday: boolean;
}

export function generatePersonalizedRecommendations(
  ctx: PlayerContext
): PersonalizedRecommendation[] {
  const recommendations: PersonalizedRecommendation[] = [];

  // 1. Spaced Repetition urgency
  if (ctx.dueReviewCount > 0) {
    recommendations.push({
      id: "rec-spaced-repetition",
      category: "review",
      title: "Review Pintar Menunggumu",
      subtitle: `${ctx.dueReviewCount} soal jatuh tempo hari ini`,
      description: "Ulangi soal yang pernah keliru dengan metode spaced-repetition agar materi melekat kuat di ingatan jangka panjang.",
      badge: "Prioritas Belajar",
      badgeVariant: "urgent",
      href: "/player/review",
      actionLabel: "Mulai Review",
      xpReward: ctx.dueReviewCount * 20,
      iconName: "rotate",
      reason: "Mencegah lupa berdasarkan kurva retensi belajar.",
    });
  }

  // 2. Adaptive Mission Recommendation
  const avgScore =
    ctx.recentScores.length > 0
      ? ctx.recentScores.reduce((a, b) => a + b, 0) / ctx.recentScores.length
      : 0;

  if (!ctx.completedSlugs.includes("batik-detective")) {
    recommendations.push({
      id: "rec-mission-batik",
      category: "misi",
      title: "Misi: Batik Detective",
      subtitle: "Tingkat Pemula · 100 XP",
      description: "Temukan filosofi di balik motif klasik Parang & Kawung dan kuasai teknik canting tradisional.",
      badge: "Rekomendasi Pemula",
      badgeVariant: "default",
      href: "/missions/batik-detective",
      actionLabel: "Mulai Misi",
      xpReward: 100,
      iconName: "gamepad",
      reason: "Fondasi visual terbaik untuk memahami seni kriya Nusantara.",
    });
  } else if (!ctx.completedSlugs.includes("gamelan-maestro") || avgScore >= 75) {
    recommendations.push({
      id: "rec-mission-gamelan",
      category: "misi",
      title: "Misi: Gamelan Maestro",
      subtitle: "Tingkat Menengah · 150 XP",
      description: "Dengarkan alunan kendang, pelog, dan slendro dalam ansambel musik adiluhung Jawa.",
      badge: "Tantangan Menengah",
      badgeVariant: "gold",
      href: "/missions/gamelan-maestro",
      actionLabel: "Mulai Misi",
      xpReward: 150,
      iconName: "gamepad",
      reason: "Akurasi bermainmu stabil, cocok untuk eksplorasi ritme dan identifikasi instrumen.",
    });
  } else {
    recommendations.push({
      id: "rec-mission-wayang",
      category: "misi",
      title: "Misi: Wayang Story Adventure",
      subtitle: "Tingkat Lanjutan · 200 XP",
      description: "Uji kemampuan menata urutan lakon wayang dan mendalami makna lakon Mahabharata.",
      badge: "Tantangan Maestro",
      badgeVariant: "gold",
      href: "/missions/wayang-story",
      actionLabel: "Mulai Misi",
      xpReward: 200,
      iconName: "gamepad",
      reason: "Kamu telah menyelesaikan misi dasar; saatnya menguji daya nalar sekuensial.",
    });
  }

  // 3. Regional Language Module recommendation
  // Pick language based on mission or cycling
  const recommendedLang =
    REGIONAL_LANGUAGES[ctx.missionsCompleted % REGIONAL_LANGUAGES.length] ||
    REGIONAL_LANGUAGES[0];

  recommendations.push({
    id: `rec-lang-${recommendedLang.slug}`,
    category: "bahasa",
    title: `Kosakata ${recommendedLang.name}`,
    subtitle: `${recommendedLang.nativeName} · Audio Pelafalan`,
    description: `Pelajari kosakata sapaan "${recommendedLang.greeting.word}" dan ikuti mini kuis kosakata untuk tambahan XP.`,
    badge: "Modul Bahasa Daerah",
    badgeVariant: "success",
    href: `/bahasa/${recommendedLang.slug}`,
    actionLabel: "Pelajari Kosakata",
    xpReward: 75,
    iconName: "languages",
    reason: "Mengetahui bahasa daerah memperkaya pemahaman konteks artikel dan artefak.",
  });

  // 4. Cultural Encyclopedia with Audio/Video Media
  recommendations.push({
    id: "rec-article-media",
    category: "ensiklopedia",
    title: "Eksplorasi Audio & Video Budaya",
    subtitle: "Gamelan Jawa, Tari Saman, & Tari Kecak",
    description: "Nikmati dokumentasi pertunjukan tari tradisional dan rekaman audio instrumen otentik Nusantara.",
    badge: "Media Interaktif",
    badgeVariant: "default",
    href: "/encyclopedia/gamelan-jawa",
    actionLabel: "Buka Galeri Media",
    iconName: "book",
    reason: "Memperluas wawasan sebelum menempuh misi berikutnya.",
  });

  return recommendations;
}
