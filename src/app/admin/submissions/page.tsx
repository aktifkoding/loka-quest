import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { AdminSubmissionsClient } from "./submissions-client";

export const dynamic = "force-dynamic";

export default async function AdminSubmissionsPage() {
  try {
    await requireRole(["admin", "educator"]);
  } catch {
    redirect("/");
  }

  const supabase = await createClient();
  const { data: submissions } = await supabase
    .from("community_submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <h1 className="font-display text-3xl font-semibold">Verifikasi Kontribusi Komunitas</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Tinjau usulan dokumentasi budaya dari komunitas sebelum dipublikasikan.
      </p>

      <div className="mt-8">
        <AdminSubmissionsClient initial={submissions ?? []} />
      </div>
    </div>
  );
}
