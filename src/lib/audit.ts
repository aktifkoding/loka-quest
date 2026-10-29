import { createServiceClient } from "@/lib/supabase/service-role";

/**
 * Append an audit log row. Uses the service client because audit inserts are
 * system events, not user-writable rows. Never blocks the caller on failure.
 */
export async function auditLog(entry: {
  actorId: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  details?: Record<string, unknown>;
  ipAddress?: string | null;
}): Promise<void> {
  try {
    const service = createServiceClient();
    await service.from("audit_logs").insert({
      actor_id: entry.actorId,
      action: entry.action,
      resource_type: entry.resourceType,
      resource_id: entry.resourceId ?? null,
      details: entry.details ?? {},
      ip_address: entry.ipAddress ?? null,
    });
  } catch (error) {
    console.error("[audit] failed to write log:", error);
  }
}
