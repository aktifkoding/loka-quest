import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { BookMarked, ExternalLink } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/service-role";
import { getServerI18n } from "@/lib/i18n/server";
import { staticDict as d } from "@/lib/i18n/dict/static";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerI18n();
  return { title: t(d.sourcesMetaTitle), description: t(d.sourcesMetaDescription) };
}

export const dynamic = "force-dynamic";

/**
 * Public cultural-source register. Strengthens the "akar budaya dan hak
 * karya" criterion: every referenced tradition maps back to a catalogued,
 * licensed source.
 */
export default async function SourcesPage() {
  const { t } = await getServerI18n();
  const service = createServiceClient();
  const { data: sources } = await service
    .from("cultural_sources")
    .select("id, title, author, publisher, year, url, license, attribution")
    .order("title", { ascending: true });

  const rows = sources ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <PageHeader
        icon={BookMarked}
        title={t(d.sourcesPageTitle)}
        description={t(d.sourcesPageDescription)}
        backHref="/"
        backLabel={t(d.backHomeLabel)}
      />

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
                    {source.license ?? t(d.licenseOnRecord)}
                  </span>
                  {source.url && source.url.startsWith("http") && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary"
                    >
                      {t(d.catalogCta)}
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
        {t(d.sourcesLicenseNote)}
      </p>
    </div>
  );
}
