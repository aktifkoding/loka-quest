import Link from "next/link";
import { WikimediaImage } from "@/components/wikimedia-image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/i18n";
import { getServerI18n } from "@/lib/i18n/server";
import { encyclopediaDict as d } from "@/lib/i18n/dict/encyclopedia";
import { Card } from "@/components/ui/card";
import { ShareButton } from "@/components/layout/share-button";
import { BookmarkButton } from "@/components/encyclopedia/bookmark-button";
import { ReadingHistoryTracker } from "@/components/encyclopedia/reading-history-tracker";
import { ArticleFeedback } from "@/components/encyclopedia/article-feedback";
import { RelatedVocabularies } from "@/components/encyclopedia/related-vocabularies";
import { MediaGallery } from "@/components/encyclopedia/media-gallery";
import { MapPin, Gamepad2, ExternalLink, ArrowLeft } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const { t } = await getServerI18n();
  const supabase = await createClient();
  const { data } = await supabase.from("encyclopedia_articles").select("title,summary,seo_title,seo_description").eq("slug", slug).eq("status", "published").maybeSingle();
  if (!data) return { title: t(d.articleNotFoundTitle) };
  return { title: data.seo_title || data.title, description: data.seo_description || data.summary, alternates: { canonical: `/encyclopedia/${slug}` }, openGraph: { title: data.seo_title || data.title, description: data.seo_description || data.summary, type: "article" } };
}

export default async function EncyclopediaArticlePage({ params }: Props) {
  const { slug } = await params;
  const { lang, t } = await getServerI18n();
  const supabase = await createClient();
  const { data: rawArticle } = await supabase.from("encyclopedia_articles")
    .select("*,encyclopedia_article_categories(category:encyclopedia_categories(id,slug,name)),encyclopedia_article_regions(region:cultural_regions(id,slug,name)),encyclopedia_sources(id,source_title,publisher,source_url,source_type,notes,sort_order),encyclopedia_media(id,title,description,media_type,storage_path,external_url,creator,license,attribution,sort_order),encyclopedia_related_articles!article_id(related:encyclopedia_articles!related_article_id(id,slug,title,summary)),encyclopedia_article_missions(mission:missions(id,slug,title,description,xp_reward))")
    .eq("slug", slug).eq("status", "published").maybeSingle();
  if (!rawArticle) notFound();
  const article = rawArticle as unknown as {
    id:string; slug:string; title:string; summary:string; body:string; featured_image_url:string|null; audio_url:string|null; audio_credit:string|null; published_at:string|null; updated_at:string; last_reviewed_at:string|null; background:string|null; historical_context:string|null; cultural_meaning:string|null; characteristics:string|null; social_function:string|null; practices:string|null; preservation:string|null; verified_facts:unknown[];
    encyclopedia_article_categories:{category:{slug:string;name:string}|null}[]; encyclopedia_article_regions:{region:{slug:string;name:string}|null}[];
    encyclopedia_sources:{id:string;source_title:string;publisher:string|null;source_url:string|null;source_type:string;notes:string|null;sort_order:number}[];
    encyclopedia_media:{id:string;title:string;description:string|null;media_type:string;storage_path:string|null;external_url:string|null;creator:string|null;license:string|null;attribution:string|null;sort_order:number}[];
    encyclopedia_related_articles:{related:{slug:string;title:string;summary:string}|null}[];
    encyclopedia_article_missions:{mission:{id:string;slug:string;title:string;description:string;xp_reward:number}|null}[];
  };
  const sections = [
    [t(d.sectionBackground), article.background], [t(d.sectionHistory), article.historical_context], [t(d.sectionMeaning), article.cultural_meaning], [t(d.sectionCharacteristics), article.characteristics], [t(d.sectionSocialFunction), article.social_function], [t(d.sectionPractices), article.practices], [t(d.sectionPreservation), article.preservation],
  ].filter((section): section is [string, string] => Boolean(section[1]));
  const categories = (article.encyclopedia_article_categories ?? []).map((row) => row.category as {slug:string;name:string}|null).filter((row): row is {slug:string;name:string} => Boolean(row));
  const regions = (article.encyclopedia_article_regions ?? []).map((row) => row.region as {slug:string;name:string}|null).filter((row): row is {slug:string;name:string} => Boolean(row));
  const sources = article.encyclopedia_sources ?? [];
  const media = article.encyclopedia_media ?? [];
  const related = article.encyclopedia_related_articles ?? [];
  const missions = article.encyclopedia_article_missions ?? [];
  const jsonLd = { "@context": "https://schema.org", "@type": "Article", headline: article.title, description: article.summary, datePublished: article.published_at, dateModified: article.updated_at, author: { "@type": "Organization", name: "Nusantara Cultural Encyclopedia" }, image: article.featured_image_url || undefined, citation: sources.map((source) => source.source_url).filter(Boolean) };
  return <article className="mx-auto max-w-4xl px-4 py-10 md:py-14">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    <Link href="/encyclopedia/explore" className="inline-flex items-center gap-1.5 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="size-4" aria-hidden="true"/>{t(d.backToEncyclopediaLink)}</Link>
    <header className="mt-6"><div className="flex flex-wrap gap-2">{categories.map((category) => <Link key={category.slug} href={`/encyclopedia/explore?category=${category.slug}`} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{category.name}</Link>)}</div><h1 className="mt-5 font-display text-4xl font-semibold tracking-tight md:text-5xl">{article.title}</h1><p className="mt-5 text-lg leading-relaxed text-muted-foreground">{article.summary}</p><div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">{regions.map((region) => <Link key={region.slug} href={`/encyclopedia/explore?region=${region.slug}`} className="inline-flex items-center gap-1 hover:text-primary"><MapPin className="size-4" aria-hidden="true"/>{region.name}</Link>)}{article.last_reviewed_at && <span>{t(d.reviewedAt, { date: formatDate(article.last_reviewed_at, lang) })}</span>}</div></header>
    <div className="mt-6 flex flex-wrap items-center gap-3"><ShareButton title={article.title} text={article.summary}/><BookmarkButton articleId={article.id}/><ReadingHistoryTracker articleId={article.id}/></div>
    {article.audio_url && <div className="mt-6 rounded-2xl border border-border bg-secondary/40 p-4"><p className="text-sm font-medium">{t(d.audioNarrationHeading)}</p><audio controls preload="none" src={article.audio_url} className="mt-2 w-full">{t(d.audioUnsupported)}</audio>{article.audio_credit && <p className="mt-2 text-xs text-muted-foreground">{t(d.audioCredit, { credit: article.audio_credit })}</p>}</div>}
    {article.featured_image_url && <figure className="mt-8"><div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border/60"><WikimediaImage src={article.featured_image_url} alt={article.title} fill priority sizes="(min-width: 1024px) 896px, 100vw" className="object-cover"/></div><figcaption className="mt-2 text-xs text-muted-foreground">{t(d.featuredImageCaption)}</figcaption></figure>}
    <div className="tenun my-10" aria-hidden="true"/>
    {article.body && <section className="prose prose-stone max-w-none dark:prose-invert"><h2 className="font-display">{t(d.bodyHeading, { title: article.title })}</h2>{article.body.split(/\n\n+/).map((paragraph, index) => <p key={index} className="leading-[1.85]">{paragraph}</p>)}</section>}
    {sections.map(([title, content]) => <section key={title} className="mt-10"><h2 className="font-display text-2xl font-semibold">{title}</h2><div className="mt-4 space-y-4">{content.split(/\n\n+/).map((paragraph, index) => <p key={index} className="leading-[1.85] text-foreground/85">{paragraph}</p>)}</div></section>)}
    {Array.isArray(article.verified_facts) && article.verified_facts.length > 0 && <section className="mt-10 rounded-2xl bg-secondary/70 p-6"><h2 className="font-display text-2xl font-semibold">{t(d.verifiedFactsHeading)}</h2><ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed">{article.verified_facts.map((fact: unknown, index: number) => <li key={index}>{typeof fact === "string" ? fact : JSON.stringify(fact)}</li>)}</ul></section>}
    <MediaGallery articleSlug={article.slug} articleTitle={article.title} dbMedia={media} />
    <RelatedVocabularies articleSlug={article.slug} articleTitle={article.title} />
    {sources.length > 0 && <section className="mt-12 border-t border-border pt-8"><h2 className="font-display text-2xl font-semibold">{t(d.sourcesHeading)}</h2><ol className="mt-4 space-y-3">{sources.map((source) => <li key={source.id} className="text-sm leading-relaxed"><span className="font-medium">{source.source_title}</span>{source.publisher && ` — ${source.publisher}`}<span className="ml-2 rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground">{source.source_type.replaceAll("_", " ")}</span>{source.source_url && <a href={source.source_url} target="_blank" rel="noreferrer" className="ml-2 inline-flex items-center gap-1 text-primary underline">{t(d.openSourceCta)} <ExternalLink className="size-3" aria-hidden="true"/></a>}{source.notes && <p className="mt-1 text-muted-foreground">{source.notes}</p>}</li>)}</ol></section>}
    {missions.length > 0 && <section className="mt-12"><h2 className="font-display text-2xl font-semibold">{t(d.missionsHeading)}</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">{missions.map((row, i) => { const mission = row.mission as {id:string;slug:string;title:string;description:string;xp_reward:number}|null; return mission && <Link key={i} href={`/missions/${mission.slug}`}><Card interactive className="h-full"><div className="p-5"><Gamepad2 className="size-5 text-primary" aria-hidden="true"/><h3 className="mt-3 font-display text-lg font-semibold">{mission.title}</h3><p className="mt-2 text-sm text-muted-foreground">{mission.description}</p><p className="mt-3 text-sm font-medium text-gold">{mission.xp_reward} XP</p></div></Card></Link>; })}</div></section>}
    {related.length > 0 && <section className="mt-12"><h2 className="font-display text-2xl font-semibold">{t(d.relatedArticlesHeading)}</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">{related.map((row, i) => { const item = row.related as {slug:string;title:string;summary:string}|null; return item && <Link key={i} href={`/encyclopedia/${item.slug}`}><Card interactive className="h-full"><div className="p-5"><h3 className="font-display text-lg font-semibold">{item.title}</h3><p className="mt-2 text-sm text-muted-foreground">{item.summary}</p></div></Card></Link>; })}</div></section>}
    <footer className="mt-12 rounded-2xl border border-border p-6"><h2 className="font-display text-lg font-semibold">{t(d.feedbackHeading)}</h2><p className="mt-2 text-sm text-muted-foreground">{t(d.feedbackIntro)}</p><ArticleFeedback articleTitle={article.title}/></footer>
  </article>;
}
