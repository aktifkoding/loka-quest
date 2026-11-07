import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { AdminMissionsClient } from "./missions-client";

export default async function AdminMissionsPage() {
  await requireRole(["admin"]);
  const supabase = await createClient();

  const { data: missions } = await supabase
    .from("missions")
    .select("*, cultural_regions(name), mission_questions(count)")
    .order("sort_order", { ascending: true });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <AdminMissionsClient initial={missions ?? []} />
    </div>
  );
}
