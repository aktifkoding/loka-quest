/**
 * Pure helpers for the region completion certificate.
 * Keputusan kelayakan dihitung dari misi published pada satu wilayah
 * vs upaya (mission_attempts) milik pemain.
 */

export type CertificateMissionInput = {
  mission_id: string;
  completed: boolean;
  completedAt: string | null;
};

export type CertificateOutcome = {
  totalMissions: number;
  completedMissions: number;
  eligible: boolean;
  lastCompletedAt: string | null;
};

/**
 * Hitung kelayakan sertifikat wilayah. Eligible hanya jika SEMUA misi
 * published pada wilayah tersebut sudah diselesaikan pemain.
 */
export function evaluateCertificate(
  regionMissions: { id: string }[],
  attempts: CertificateMissionInput[]
): CertificateOutcome {
  const regionIds = new Set(regionMissions.map((m) => m.id));
  const progress = new Map<string, { completed: boolean; completedAt: string | null }>();

  for (const attempt of attempts) {
    if (!regionIds.has(attempt.mission_id)) continue;
    const prev = progress.get(attempt.mission_id);
    if (attempt.completed) {
      // Simpan penyelesaian terbaru per misi
      if (
        !prev?.completed ||
        (attempt.completedAt &&
          (!prev.completedAt || attempt.completedAt > prev.completedAt))
      ) {
        progress.set(attempt.mission_id, {
          completed: true,
          completedAt: attempt.completedAt ?? null,
        });
      }
    } else if (!prev) {
      progress.set(attempt.mission_id, { completed: false, completedAt: null });
    }
  }

  let completed = 0;
  let lastCompletedAt: string | null = null;
  for (const mission of regionMissions) {
    const state = progress.get(mission.id);
    if (state?.completed) {
      completed += 1;
      const at = state.completedAt;
      if (at && (lastCompletedAt === null || at > lastCompletedAt)) {
        lastCompletedAt = at;
      }
    }
  }

  return {
    totalMissions: regionMissions.length,
    completedMissions: completed,
    eligible:
      regionMissions.length > 0 && completed === regionMissions.length,
    lastCompletedAt,
  };
}
