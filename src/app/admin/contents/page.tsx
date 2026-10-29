import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowLeft, FileText, BookMarked } from "lucide-react";

export const dynamic = "force-dynamic";

const statusDot: Record<string, string> = {
  published: "bg-primary",
  review: "bg-gold",
  draft: "bg-muted-foreground/50",
  archived: "bg-muted-foreground/30",
};

export default async function AdminContentsPage() {
  try {
    await requireRole(["admin"]);
    const supabase = await createClient();

    const [{ data: contents }, { data: sources }] = await Promise.all([
      supabase
        .from("cultural_contents")
        .select("id, title, content_type, status, cultural_regions (name)")
        .order("status", { ascending: true }),
      supabase
        .from("cultural_sources")
        .select("id, title, publisher, license")
        .order("title", { ascending: true }),
    ]);

    const contentRows = (contents ?? []).map((c) => ({
      ...c,
      region: Array.isArray(c.cultural_regions)
        ? (c.cultural_regions[0] as { name: string } | undefined)?.name
        : ((c.cultural_regions as { name: string } | null)?.name ?? null),
    }));
    const sourceRows = sources ?? [];

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
            Konten & sumber
          </h1>
          <p className="mt-2 text-muted-foreground">
            Setiap konten wajib bersumber tercatat sebelum diterbitkan.
          </p>
        </header>

        <section className="mt-10" aria-label="Konten budaya">
          <h2 className="font-display text-xl font-semibold">Konten budaya</h2>
          {contentRows.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                icon={FileText}
                title="Belum ada konten"
                description="Tambahkan konten budaya per wilayah melalui Supabase, lengkap dengan status editorialnya."
              />
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {contentRows.map((c) => (
                <li key={c.id}>
                  <Card>
                    <div className="flex items-center gap-4 px-6 py-4">
                      <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{c.title}</p>
                        <p className="text-[13px] text-muted-foreground">
                          {c.region ?? "tanpa wilayah"} · {c.content_type}
                        </p>
                      </div>
                      <span className="flex shrink-0 items-center gap-2 text-[13px] text-muted-foreground">
                        <span
                          className={`size-2 rounded-full ${statusDot[c.status] ?? "bg-muted-foreground/50"}`}
                          aria-hidden="true"
                        />
                        {c.status}
                      </span>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-10" aria-label="Register sumber">
          <h2 className="font-display text-xl font-semibold">Register sumber</h2>
          {sourceRows.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Belum ada sumber terdaftar.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {sourceRows.map((s) => (
                <li key={s.id}>
                  <Card>
                    <div className="flex items-center gap-4 px-6 py-4">
                      <BookMarked className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{s.title}</p>
                        <p className="text-[13px] text-muted-foreground">
                          {s.publisher ?? "—"} · {s.license ?? "lisensi belum dicatat"}
                        </p>
                      </div>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    );
  } catch {
    redirect("/auth/login");
  }
}
