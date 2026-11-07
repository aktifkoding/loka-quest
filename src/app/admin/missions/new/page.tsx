import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { MissionNewForm } from "../mission-new-form";

export default async function AdminNewMissionPage() {
  await requireRole(["admin"]);
  const supabase = await createClient();

  const [{ data: regions }, { data: missions }] = await Promise.all([
    supabase.from("cultural_regions").select("id, name").order("name"),
    supabase.from("missions").select("sort_order").order("sort_order", { ascending: false }).limit(1),
  ]);

  const nextSort = (missions?.[0]?.sort_order ?? 0) + 1;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:py-14">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
        <Link href="/admin/missions">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Daftar misi
        </Link>
      </Button>

      <header>
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          Tambah misi
        </h1>
        <p className="mt-2 text-muted-foreground">
          Isi detail misi terlebih dahulu, lalu kelola soalnya di halaman berikutnya.
        </p>
      </header>

      <div className="mt-8">
        <MissionNewForm regions={regions ?? []} nextSort={nextSort} />
      </div>
    </div>
  );
}
