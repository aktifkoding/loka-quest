import { createServiceClient } from "@/lib/supabase/service-role";
import { requireRole } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";
import { durableRateLimit } from "@/lib/security/rate-limit-db";
import { getLangFromRequest } from "@/lib/i18n/server";
import { errorsDict as E } from "@/lib/i18n/dict/errors";

type MemberRow = {
  profile_id: string;
  joined_at: string;
  profiles:
    | { full_name: string | null; email: string; level: number; xp: number }
    | { full_name: string | null; email: string; level: number; xp: number }[]
    | null;
};

type AttemptRow = {
  profile_id: string;
  mission_id: string;
  score: number;
  completed: boolean;
  completed_at: string | null;
  started_at: string;
};

/**
 * GET /api/v1/educator/groups/[id]/report
 * Rapor kelas untuk guru: statistik belajar per siswa (upaya, misi selesai,
 * skor, aktivitas) plus progres tugas. Data ditarik dengan service client —
 * operasi istimewa yang sudah dipagari kepemilikan grup seperti route lain.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const rl = await durableRateLimit(_request, "educator-report", 30, 60);
    const lang = getLangFromRequest(_request);
    if (!rl.ok) {
      return Response.json(
        { success: false, error: E.rateLimitGeneric[lang] },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    const user = await requireRole(["educator", "admin"]);
    const { id } = await params;
    const service = createServiceClient();

    const { data: group } = await service
      .from("educator_groups")
      .select("id, name, description, educator_id, created_at")
      .eq("id", id)
      .maybeSingle();

    if (!group) {
      return Response.json(
        { success: false, error: "Group not found" },
        { status: 404 }
      );
    }
    if (group.educator_id !== user.id && user.role !== "admin") {
      return Response.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { data: members } = await service
      .from("educator_group_members")
      .select("profile_id, joined_at, profiles:profile_id (full_name, email, level, xp)")
      .eq("group_id", id);

    const memberRows = (members ?? []) as MemberRow[];
    const profileIds = memberRows.map((m) => m.profile_id);

    const { data: assignments } = await service
      .from("educator_assignments")
      .select("id, mission_id")
      .eq("group_id", id);

    const attemptsByStudent = new Map<string, AttemptRow[]>();
    const completedAssignmentsByStudent = new Map<string, Set<string>>();

    if (profileIds.length > 0) {
      const { data: attempts } = await service
        .from("mission_attempts")
        .select("profile_id, mission_id, score, completed, completed_at, started_at")
        .in("profile_id", profileIds)
        .order("started_at", { ascending: false })
        .limit(2000);

      for (const a of attempts ?? []) {
        const list = attemptsByStudent.get(a.profile_id) ?? [];
        list.push(a);
        attemptsByStudent.set(a.profile_id, list);
      }

      // Tugas dianggap selesai jika siswa menyelesaikan minimal satu upaya
      // pada misi yang ditugaskan (mission_attempts.completed = true).
      const missionToAssignment = new Map<string, string>();
      for (const am of assignments ?? []) {
        missionToAssignment.set(am.mission_id, am.id);
      }
      if (missionToAssignment.size > 0) {
        const { data: submissions } = await service
          .from("mission_attempts")
          .select("profile_id, mission_id")
          .in("profile_id", profileIds)
          .eq("completed", true)
          .in("mission_id", [...missionToAssignment.keys()])
          .limit(2000);
        for (const s of submissions ?? []) {
          const assignmentId = missionToAssignment.get(s.mission_id);
          if (!assignmentId) continue;
          const set = completedAssignmentsByStudent.get(s.profile_id) ?? new Set();
          set.add(assignmentId);
          completedAssignmentsByStudent.set(s.profile_id, set);
        }
      }
    }

    const rows = memberRows.map((m) => {
      const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
      const attempts = attemptsByStudent.get(m.profile_id) ?? [];
      const completedAttempts = attempts.filter((a) => a.completed);
      return {
        profileId: m.profile_id,
        studentName: profile?.full_name ?? "(tanpa nama)",
        studentEmail: profile?.email ?? "",
        joinedAt: m.joined_at,
        level: profile?.level ?? 1,
        totalXp: profile?.xp ?? 0,
        attempts: attempts.length,
        missionsCompleted: completedAttempts.length,
        avgScore:
          completedAttempts.length > 0
            ? Math.round(
                (completedAttempts.reduce((sum, a) => sum + a.score, 0) /
                  completedAttempts.length) * 10
              ) / 10
            : null,
        bestScore:
          completedAttempts.length > 0
            ? Math.max(...completedAttempts.map((a) => a.score))
            : null,
        lastActivityAt: attempts[0]?.started_at ?? m.joined_at,
        assignmentsTotal: (assignments ?? []).length,
        assignmentsCompleted: completedAssignmentsByStudent.get(m.profile_id)?.size ?? 0,
      };
    });

    return Response.json(
      {
        success: true,
        data: {
          group: {
            id: group.id,
            name: group.name,
            description: group.description,
            createdAt: group.created_at,
          },
          rows,
          generatedAt: new Date().toISOString(),
        },
      },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  });
}
