import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/i18n";
import { getServerI18n } from "@/lib/i18n/server";
import { adminDict as d } from "@/lib/i18n/dict/admin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowLeft, ScrollText } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerI18n();
  return { title: t(d.auditMetaTitle) };
}

export default async function AdminAuditLogsPage() {
  try {
    await requireRole(["admin"]);
    const supabase = await createClient();
    const { t, lang } = await getServerI18n();

    const { data: logs } = await supabase
      .from("audit_logs")
      .select("id, action, resource_type, resource_id, details, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    const entries = logs ?? [];

    const actionLabel: Record<string, string> = {
      role_change: t(d.actionRoleChange),
      content_update: t(d.actionContentUpdate),
      content_create: t(d.actionContentCreate),
    };

    return (
      <div className="mx-auto max-w-4xl px-4 py-10 md:py-14">
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
          <Link href="/admin">
            <ArrowLeft className="size-4" aria-hidden="true" />
            {t(d.backToAdmin)}
          </Link>
        </Button>

        <header>
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            {t(d.auditTitle)}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t(d.auditDescription)}
          </p>
        </header>

        <div className="mt-10">
          {entries.length === 0 ? (
            <EmptyState
              icon={ScrollText}
              title={t(d.auditEmptyTitle)}
              description={t(d.auditEmptyDescription)}
            />
          ) : (
            <ol className="space-y-3">
              {entries.map((log) => (
                <li key={log.id}>
                  <Card>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-6 py-4 text-sm">
                      <span className="font-semibold">
                        {actionLabel[log.action] ?? log.action}
                      </span>
                      <span className="text-muted-foreground">
                        {log.resource_type}
                        {log.resource_id ? ` · ${String(log.resource_id).slice(0, 8)}` : ""}
                      </span>
                      <time className="ml-auto text-[13px] tabular-nums text-muted-foreground">
                        {formatDateTime(log.created_at, lang, {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                    </div>
                  </Card>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    );
  } catch {
    redirect("/auth/login");
  }
}
