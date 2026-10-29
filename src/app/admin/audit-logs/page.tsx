import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowLeft, ScrollText } from "lucide-react";

export const dynamic = "force-dynamic";

const actionLabel: Record<string, string> = {
  role_change: "Perubahan peran",
  content_update: "Pembaruan konten",
  content_create: "Konten baru",
};

export default async function AdminAuditLogsPage() {
  try {
    await requireRole(["admin"]);
    const supabase = await createClient();

    const { data: logs } = await supabase
      .from("audit_logs")
      .select("id, action, resource_type, resource_id, details, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    const entries = logs ?? [];

    return (
      <div className="mx-auto max-w-4xl px-4 py-10 md:py-14">
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
          <Link href="/admin">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Dasbor admin
          </Link>
        </Button>

        <header>
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            Log audit
          </h1>
          <p className="mt-2 text-muted-foreground">
            100 aktivitas administratif terakhir. Jejak tidak bisa diubah.
          </p>
        </header>

        <div className="mt-10">
          {entries.length === 0 ? (
            <EmptyState
              icon={ScrollText}
              title="Log masih kosong"
              description="Operasi sensitif seperti perubahan peran akan tercatat di sini."
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
                        {new Date(log.created_at).toLocaleString("id-ID", {
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
