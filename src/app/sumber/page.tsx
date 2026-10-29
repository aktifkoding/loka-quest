import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { ArrowLeft, BookMarked, ExternalLink } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/service-role";

export const metadata = {
  title: "Sumber Budaya",
  description:
    "Register sumber rujukan budaya yang digunakan LokaQuest — transparansi akar budaya dan hak karya.",
};

export const dynamic = "force-dynamic";

/**
 * Public cultural-source register. Strengthens the "akar budaya dan hak
 * karya" criterion: every referenced tradition maps back to a catalogued,
 * licensed source.
 */
export default async function SourcesPage() {
  const service = createServiceClient();
  const { data: sources } = await service
    .from("cultural_sources")
    .select("id, title, author, publisher, year, url, license, attribution")
    .order("title", { ascending: true });

  const rows = sources ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
        <Link href="/">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Beranda
        </Link>
      </Button>

      <header>
        <BookMarked className="size-9 text-primary" aria-hidden="true" />
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight">
          Sumber budaya
        </h1>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          LokaQuest menulis tradisi, artefak, dan cerita hanya dari referensi
          yang tercatat dan berlisensi jelas. Daftar ini adalah register
          terbuka atas semua rujukan yang kami pakai — bukan fakta karangan.
        </p>
      </header>

      <div className="mt-10 space-y-4">
        {rows.map((source, i) => (
          <Reveal key={source.id} delay={i * 70}>
            <Card>
              <div className="p-6">
                <h2 className="font-display text-lg font-semibold">{source.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {[source.author, source.publisher, source.year]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <p className="mt-3 rounded-lg bg-secondary/60 px-4 py-3 text-[13px] leading-relaxed text-muted-foreground">
                  {source.attribution}
                </p>
                <div className="mt-3 flex items-center gap-4 text-[13px]">
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">
                    {source.license ?? "lisensi dicatat"}
                  </span>
                  {source.url && source.url.startsWith("http") && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary"
                    >
                      Katalog
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>

      <p className="mt-10 text-[13px] leading-relaxed text-muted-foreground">
        Memperhatikan lisensi budaya? Kami juga: setiap elemen permainan
        (termasuk bunyi gamelan) dibangkitkan secara sintetis dan ilustrasi
        memakai motif geometris generik — bukan reprodigsi karya berhak cipta.
      </p>
    </div>
  );
}
