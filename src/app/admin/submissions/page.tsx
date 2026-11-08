import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { createServiceClient } from "@/lib/supabase/service-role";
import { getServerI18n } from "@/lib/i18n/server";
import { adminDict as d } from "@/lib/i18n/dict/admin";
import { AdminSubmissionsClient } from "./submissions-client";

export const dynamic = "force-dynamic";

export default async function AdminSubmissionsPage() {
  try {
    await requireRole(["admin", "educator"]);
  } catch {
    redirect("/");
  }

  const { t } = await getServerI18n();

  const supabase = createServiceClient();
  const { data: submissions } = await supabase
    .from("community_submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <h1 className="font-display text-3xl font-semibold">{t(d.submissionsTitle)}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t(d.submissionsDescription)}
      </p>

      <div className="mt-8">
        <AdminSubmissionsClient initial={submissions ?? []} />
      </div>
    </div>
  );
}
