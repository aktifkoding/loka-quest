import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowLeft, Gem, Gamepad2 } from "lucide-react";

const rarityStyle: Record<string, { label: string; ring: string; badge: string }> = {
  common: { label: "Umum", ring: "border-border", badge: "bg-muted text-muted-foreground" },
  uncommon: { label: "Tak Biasa", ring: "border-primary/40", badge: "bg-primary/10 text-primary" },
  rare: { label: "Langka", ring: "border-gold/50", badge: "bg-gold/15 text-gold" },
  legendary: {
    label: "Legendaris",
    ring: "border-gold ring-2 ring-gold/40",
    badge: "bg-gold text-black",
  },
};

export default async function CollectionPage() {
  try {
    const user = await requireAuth();
    const supabase = await createClient();

    const { data: owned } = await supabase
      .from("user_artifacts")
      .select("acquired_at, cultural_artifacts (id, name, description, rarity, region_id, cultural_regions (name))")
      .eq("profile_id", user.id)
      .order("acquired_at", { ascending: false });

    const artifacts = (owned ?? []).map((row) => {
      const raw = Array.isArray(row.cultural_artifacts)
        ? row.cultural_artifacts[0]
        : row.cultural_artifacts;
      const a = raw as {
        id: string;
        name: string;
        description: string;
        rarity: string;
        cultural_regions: { name: string } | { name: string }[] | null;
      } | null;
      const region = Array.isArray(a?.cultural_regions)
        ? a.cultural_regions[0]
        : a?.cultural_regions;
      return { ...a, region, acquiredAt: row.acquired_at };
    });

    return (
      <div className="mx-auto max-w-4xl px-4 py-10 md:py-14">
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
          <Link href="/player/dashboard">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Dasbor
          </Link>
        </Button>

        <header>
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            Koleksi artefak
          </h1>
          <p className="mt-2 text-muted-foreground">
            <span className="tabular-nums">{artifacts.length}</span> artefak budaya
            dimiliki. Selesaikan misi per wilayah untuk melengkapinya.
          </p>
        </header>

        <div className="mt-10">
          {artifacts.length === 0 ? (
            <EmptyState
              icon={Gem}
              title="Lemari masih kosong"
              description="Setiap wilayah menyimpan satu artefak budaya. Selesaikan misi pertamamu untuk memperolehnya."
              action={{ label: "Pilih misi", href: "/missions" }}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {artifacts.map((a, i) => {
                const style = rarityStyle[a?.rarity ?? ""] ?? rarityStyle.common;
                return (
                  <Card
                    key={a.id}
                    className={`animate-fade-up ${style.ring}`}
                    style={{ animationDelay: `${i * 70}ms` }}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-3">
                        <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Gem className="size-5" aria-hidden="true" />
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${style.badge}`}
                        >
                          {style.label}
                        </span>
                      </div>
                      <h2 className="mt-4 font-display text-lg font-semibold">{a.name}</h2>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {a.description}
                      </p>
                      <p className="mt-3 border-t border-border pt-3 text-[12px] text-muted-foreground">
                        {a.region?.name ?? "—"} · diperoleh{" "}
                        {new Date(a.acquiredAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <Card className="mt-8 border-dashed">
          <div className="flex items-center gap-4 p-6">
            <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
              <Gamepad2 className="size-5" aria-hidden="true" />
            </span>
            <p className="flex-1 text-sm text-muted-foreground">
              3 artefak menanti di tiga wilayah budaya.
            </p>
            <Button asChild size="sm">
              <Link href="/missions">Main misi lain</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  } catch {
    redirect("/auth/login");
  }
}
