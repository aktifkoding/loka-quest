import Link from "next/link";
import type { Metadata } from "next";
import { WikimediaImage } from "@/components/wikimedia-image";
import { createClient } from "@/lib/supabase/server";
import { MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { getServerI18n } from "@/lib/i18n/server";
import { encyclopediaDict as d } from "@/lib/i18n/dict/encyclopedia";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerI18n();
  return { title: t(d.regionsMetaTitle) };
}

export default async function EncyclopediaRegionsPage() {
  const { t } = await getServerI18n();
  const supabase = await createClient();
  const { data: rawArticleRegions, error } = await supabase
    .from("encyclopedia_article_regions")
    .select("region:cultural_regions!inner(id,slug,name,description,image_url)")
    .eq("region.status", "published");
  const articleRegions = (rawArticleRegions ?? []) as unknown as {
    region: {
      id: string;
      slug: string;
      name: string;
      description: string;
      image_url: string | null;
    } | null;
  }[];
  const regions = Array.from(
    new Map(
      articleRegions.flatMap((row) => (row.region ? [[row.region.id, row.region] as const] : []))
    ).values()
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <PageHeader
        icon={MapPin}
        title={t(d.regionsPageTitle)}
        description={t(d.regionsPageDescription)}
        backHref="/encyclopedia"
        backLabel={t(d.backToEncyclopedia)}
      />

      {error || !regions.length ? (
        <div className="mt-10">
          <EmptyState
            icon={MapPin}
            title={error ? t(d.regionsErrorTitle) : t(d.regionsEmptyTitle)}
            description={t(d.regionsEmptyDescription)}
            action={{ label: t(d.exploreLokaQuestRegionsCta), href: "/explore" }}
          />
        </div>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {regions.map((region) => (
            <Link key={region.id} href={`/encyclopedia/explore?region=${region.slug}`}>
              <Card interactive className="h-full overflow-hidden">
                {region.image_url ? (
                  <div className="relative aspect-[16/9] w-full">
                    <WikimediaImage
                                        src={region.image_url}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="batik-grid flex aspect-[16/9] items-center justify-center bg-secondary">
                    <MapPin className="size-9 text-primary/60" aria-hidden="true" />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="font-display text-xl font-semibold">{region.name}</h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {region.description}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
