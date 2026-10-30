import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { requireEncyclopediaRole } from "@/lib/encyclopedia";
import { Card } from "@/components/ui/card";
import { EditorialAction } from "@/components/encyclopedia/editorial-action";
import { BookOpen } from "lucide-react";

export const metadata = { title: "Manajemen Ensiklopedia" };

export default async function AdminEncyclopediaPage() {
  try {
    const user = await requireEncyclopediaRole(["content_administrator", "cultural_editor", "reviewer", "contributor"]);
    const supabase = await createClient();
    const { data: articles } = await supabase.from("encyclopedia_articles").select("id,slug,title,status,updated_at").order("updated_at", { ascending: false }).limit(50);
    const links = [{href:"/admin/encyclopedia/articles/new",label:"Artikel baru",icon:BookOpen},...(user.editorRole === "content_administrator" ? [{href:"/admin/encyclopedia/roles",label:"Peran editorial",icon:BookOpen}] : [])];
    return <main className="mx-auto max-w-6xl px-4 py-10 md:py-14"><header><Link href="/admin" className="text-sm text-muted-foreground">← Dasbor admin</Link><h1 className="mt-3 font-display text-4xl font-semibold">Ensiklopedia budaya</h1><p className="mt-2 text-muted-foreground">Kelola artikel dan pantau status editorial.</p></header><div className="mt-6 flex gap-3">{links.map((link)=><Link key={link.href} href={link.href} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">{link.label}</Link>)}</div><Card className="mt-8"><div className="divide-y divide-border">{articles?.map((article)=><div key={article.id} className="flex flex-wrap items-center gap-3 p-4"><BookOpen className="size-4 text-primary" aria-hidden="true"/><div className="min-w-0 flex-1"><p className="font-medium">{article.title}</p><p className="text-xs text-muted-foreground">/{article.slug}</p></div><span className="rounded-full bg-secondary px-3 py-1 text-xs">{article.status}</span><Link className="text-sm text-primary" href={`/admin/encyclopedia/articles/new?id=${article.id}`}>Sunting</Link>{article.status==="review"&&user.editorRole!=="contributor"&&<EditorialAction articleId={article.id} action="review" label="Tinjau"/>}{article.status==="approved"&&user.editorRole==="content_administrator"&&<EditorialAction articleId={article.id} action="publish" label="Terbitkan"/>}</div>)}</div>{!articles?.length&&<p className="p-8 text-center text-sm text-muted-foreground">Belum ada artikel.</p>}</Card></main>;
  } catch { redirect("/auth/login"); }
}
