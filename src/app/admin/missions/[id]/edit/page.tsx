import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { MissionEditor } from "../../mission-editor";

export default async function AdminEditMissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["admin"]);
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: mission }, { data: questions }, { data: regions }] =
    await Promise.all([
      supabase.from("missions").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("mission_questions")
        .select("*")
        .eq("mission_id", id)
        .order("sort_order", { ascending: true }),
      supabase.from("cultural_regions").select("id, name").order("name"),
    ]);

  if (!mission) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:py-14">
      <MissionEditor
        mission={mission}
        initialQuestions={questions ?? []}
        regions={regions ?? []}
      />
    </div>
  );
}
