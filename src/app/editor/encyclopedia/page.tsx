import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { requireEncyclopediaRole } from "@/lib/encyclopedia";
import { getServerI18n } from "@/lib/i18n/server";
import { adminDict as d } from "@/lib/i18n/dict/admin";
import { Card } from "@/components/ui/card";
import { EditorialAction } from "@/components/encyclopedia/editorial-action";
import { BookOpen } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerI18n();
  return { title: t(d.encyclopediaMetaTitle) };
}

export default async function AdminEncyclopediaPage() {
  try {
    const user = await requireEncyclopediaRole(["content_administrator", "cultural_editor", "reviewer", "contributor"]);
    const supabase = await createClient();
    const { t } = await getServerI18n();
    const { data: articles } = await supabase.from("encyclopedia_articles").select("id,slug,title,status,updated_at").order("updated_at", { ascending: false }).limit(50);
    const links = [{href:"/editor/encyclopedia/articles/new",label:t(d.newArticleCta),icon:BookOpen},...(user.editorRole === "content_administrator" ? [{href:"/editor/encyclopedia/roles",label:t(d.editorialRolesCta),icon:BookOpen}] : [])];
    return <main className="mx-auto max-w-6xl px-4 py-10 md:py-14"><header><Link href="/" className="text-sm text-muted-foreground">← {t(d.homeLink)}</Link><h1 className="mt-3 font-display text-4xl font-semibold">{t(d.encyclopediaPageTitle)}</h1><p className="mt-2 text-muted-foreground">{t(d.encyclopediaPageDescription)}</p></header><div className="mt-6 flex gap-3">{links.map((link)=><Link key={link.href} href={link.href} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">{link.label}</Link>)}</div><Card className="mt-8"><div className="divide-y divide-border">{articles?.map((article)=><div key={article.id} className="flex flex-wrap items-center gap-3 p-4"><BookOpen className="size-4 text-primary" aria-hidden="true"/><div className="min-w-0 flex-1"><p className="font-medium">{article.title}</p><p className="text-xs text-muted-foreground">/{article.slug}</p></div><span className="rounded-full bg-secondary px-3 py-1 text-xs">{article.status}</span><Link className="text-sm text-primary" href={`/editor/encyclopedia/articles/new?id=${article.id}`}>{t(d.editCta)}</Link>{article.status==="review"&&user.editorRole!=="contributor"&&<EditorialAction articleId={article.id} action="review" label={t(d.reviewArticleCta)}/>}{article.status==="approved"&&user.editorRole==="content_administrator"&&<EditorialAction articleId={article.id} action="publish" label={t(d.publishArticleCta)}/>}</div>)}</div>{!articles?.length&&<p className="p-8 text-center text-sm text-muted-foreground">{t(d.emptyArticles)}</p>}</Card></main>;
  } catch { redirect("/auth/login"); }
}
