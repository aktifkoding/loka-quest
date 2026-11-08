import { REGIONAL_LANGUAGES } from "./languages";
import type { Lang } from "./i18n/types";

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
  ctx: PlayerContext,
  lang: Lang = "id"
): PersonalizedRecommendation[] {
  const recommendations: PersonalizedRecommendation[] = [];

  // 1. Spaced Repetition urgency
  if (ctx.dueReviewCount > 0) {
    recommendations.push({
      id: "rec-spaced-repetition",
      category: "review",
      title: lang === "en" ? "Smart Review Awaits You" : "Review Pintar Menunggumu",
      subtitle:
        lang === "en"
          ? `${ctx.dueReviewCount} questions due today`
          : `${ctx.dueReviewCount} soal jatuh tempo hari ini`,
      description:
        lang === "en"
          ? "Revisit questions you got wrong using spaced repetition so the material sticks in your long-term memory."
          : "Ulangi soal yang pernah keliru dengan metode spaced-repetition agar materi melekat kuat di ingatan jangka panjang.",
      badge: lang === "en" ? "Learning priority" : "Prioritas Belajar",
      badgeVariant: "urgent",
      href: "/player/review",
      actionLabel: lang === "en" ? "Start review" : "Mulai Review",
      xpReward: ctx.dueReviewCount * 20,
      iconName: "rotate",
      reason:
        lang === "en"
          ? "Prevents forgetting based on the learning retention curve."
          : "Mencegah lupa berdasarkan kurva retensi belajar.",
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
      subtitle: lang === "en" ? "Beginner level · 100 XP" : "Tingkat Pemula · 100 XP",
      description:
        lang === "en"
          ? "Discover the philosophy behind the classic Parang & Kawung motifs and master the traditional canting technique."
          : "Temukan filosofi di balik motif klasik Parang & Kawung dan kuasai teknik canting tradisional.",
      badge: lang === "en" ? "Beginner recommendation" : "Rekomendasi Pemula",
      badgeVariant: "default",
      href: "/missions/batik-detective",
      actionLabel: lang === "en" ? "Start mission" : "Mulai Misi",
      xpReward: 100,
      iconName: "gamepad",
      reason:
        lang === "en"
          ? "The best visual foundation for understanding Indonesian craft art."
          : "Fondasi visual terbaik untuk memahami seni kriya Nusantara.",
    });
  } else if (!ctx.completedSlugs.includes("gamelan-maestro") || avgScore >= 75) {
    recommendations.push({
      id: "rec-mission-gamelan",
      category: "misi",
      title: "Misi: Gamelan Maestro",
      subtitle: lang === "en" ? "Intermediate level · 150 XP" : "Tingkat Menengah · 150 XP",
      description:
        lang === "en"
          ? "Listen to the kendang, pelog, and slendro in the sublime Javanese gamelan ensemble."
          : "Dengarkan alunan kendang, pelog, dan slendro dalam ansambel musik adiluhung Jawa.",
      badge: lang === "en" ? "Intermediate challenge" : "Tantangan Menengah",
      badgeVariant: "gold",
      href: "/missions/gamelan-maestro",
      actionLabel: lang === "en" ? "Start mission" : "Mulai Misi",
      xpReward: 150,
      iconName: "gamepad",
      reason:
        lang === "en"
          ? "Your accuracy is steady — perfect for exploring rhythm and identifying instruments."
          : "Akurasi bermainmu stabil, cocok untuk eksplorasi ritme dan identifikasi instrumen.",
    });
  } else {
    recommendations.push({
      id: "rec-mission-wayang",
      category: "misi",
      title: "Misi: Wayang Story Adventure",
      subtitle: lang === "en" ? "Advanced level · 200 XP" : "Tingkat Lanjutan · 200 XP",
      description:
        lang === "en"
          ? "Test your skill at sequencing wayang story acts and delve into the meaning of the Mahabharata."
          : "Uji kemampuan menata urutan lakon wayang dan mendalami makna lakon Mahabharata.",
      badge: lang === "en" ? "Maestro challenge" : "Tantangan Maestro",
      badgeVariant: "gold",
      href: "/missions/wayang-story",
      actionLabel: lang === "en" ? "Start mission" : "Mulai Misi",
      xpReward: 200,
      iconName: "gamepad",
      reason:
        lang === "en"
          ? "You have completed the basic missions — time to test your sequential reasoning."
          : "Kamu telah menyelesaikan misi dasar; saatnya menguji daya nalar sekuensial.",
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
    title: lang === "en" ? `Vocabulary: ${recommendedLang.name}` : `Kosakata ${recommendedLang.name}`,
    subtitle:
      lang === "en"
        ? `${recommendedLang.nativeName} · pronunciation audio`
        : `${recommendedLang.nativeName} · Audio Pelafalan`,
    description:
      lang === "en"
        ? `Learn the greeting "${recommendedLang.greeting.word}" and take a mini vocabulary quiz for bonus XP.`
        : `Pelajari kosakata sapaan "${recommendedLang.greeting.word}" dan ikuti mini kuis kosakata untuk tambahan XP.`,
    badge: lang === "en" ? "Regional language module" : "Modul Bahasa Daerah",
    badgeVariant: "success",
    href: `/bahasa/${recommendedLang.slug}`,
    actionLabel: lang === "en" ? "Learn vocabulary" : "Pelajari Kosakata",
    xpReward: 75,
    iconName: "languages",
    reason:
      lang === "en"
        ? "Knowing a regional language enriches how you read articles and interpret artifacts."
        : "Mengetahui bahasa daerah memperkaya pemahaman konteks artikel dan artefak.",
  });

  // 4. Cultural Encyclopedia with Audio/Video Media
  recommendations.push({
    id: "rec-article-media",
    category: "ensiklopedia",
    title: lang === "en" ? "Explore Culture Audio & Video" : "Eksplorasi Audio & Video Budaya",
    subtitle:
      lang === "en"
        ? "Javanese Gamelan, Saman Dance, & Kecak Dance"
        : "Gamelan Jawa, Tari Saman, & Tari Kecak",
    description:
      lang === "en"
        ? "Enjoy documentaries of traditional dance performances and audio recordings of authentic Indonesian instruments."
        : "Nikmati dokumentasi pertunjukan tari tradisional dan rekaman audio instrumen otentik Nusantara.",
    badge: lang === "en" ? "Interactive media" : "Media Interaktif",
    badgeVariant: "default",
    href: "/encyclopedia/gamelan-jawa",
    actionLabel: lang === "en" ? "Open media gallery" : "Buka Galeri Media",
    iconName: "book",
    reason:
      lang === "en"
        ? "Broadens your horizons before the next mission."
        : "Memperluas wawasan sebelum menempuh misi berikutnya.",
  });

  return recommendations;
}
