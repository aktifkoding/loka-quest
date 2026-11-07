import type { createServiceClient } from "@/lib/supabase/service-role";

type ServiceClient = ReturnType<typeof createServiceClient>;

export type DailyMission = {
  date: string;
  mission: {
    id: string;
    slug: string;
    title: string;
    description: string;
    xp_reward: number;
    difficulty: string;
  };
  bonusXp: number;
};

/** Date key in Asia/Jakarta so the challenge rolls over at local midnight. */
export function jakartaDateKey(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function dayNumber(dateKey: string): number {
  return Math.floor(Date.parse(`${dateKey}T00:00:00Z`) / 86_400_000);
}

/**
 * Deterministic daily challenge: one published mission per day, rotating
 * through the catalogue. No extra table is needed to pick it.
 */
export async function getDailyMission(
  service: ServiceClient,
  dateKey = jakartaDateKey()
): Promise<DailyMission | null> {
  const { data: missions } = await service
    .from("missions")
    .select("id, slug, title, description, xp_reward, difficulty")
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .limit(60);

  if (!missions || missions.length === 0) return null;

  const mission = missions[dayNumber(dateKey) % missions.length];
  return { date: dateKey, mission, bonusXp: 25 };
}
