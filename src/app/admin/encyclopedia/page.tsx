import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { requireEncyclopediaRole } from "@/lib/encyclopedia";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { EmptyState } from "@/components/ui/empty-state";
import { EditorialAction } from "@/components/encyclopedia/editorial-action";
import { BookOpen, Plus } from "lucide-react";

export const metadata = { title: "Manajemen Ensiklopedia" };

const statusChip: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  review: "bg-gold/15 text-gold",
  approved: "bg-primary/10 text-primary",
  published: "bg-primary text-primary-foreground",
  archived: "bg-muted text-muted-foreground/70",
};

export default async function AdminEncyclopediaPage() {
  try {
    const user = await requireEncyclopediaRole(["content_administrator", "cultural_editor", "reviewer", "contributor"]);
    const supabase = await createClient();
    const { data: articles } = await supabase.from("encyclopedia_articles").select("id,slug,title,status,updated_at").order("updated_at", { ascending: false }).limit(50);
    return <main className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <Reveal>
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link href="/admin" className="text-sm text-muted-foreground transition-colors hover:text-foreground">← Dasbor admin</Link>
            <h1 className="mt-3 font-display text-4xl font-semibold">Ensiklopedia budaya</h1>
            <p className="mt-2 text-muted-foreground">Kelola artikel dan pantau status editorial.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/admin/encyclopedia/articles/new">
                <Plus className="size-4" aria-hidden="true" />
                Artikel baru
              </Link>
            </Button>
          </div>
        </header>
      </Reveal>
      <Reveal delay={120}>
        <Card className="mt-8">
          <div className="divide-y divide-border">
            {articles?.map((article) => (
              <div key={article.id} className="group flex flex-wrap items-center gap-3 p-4 transition-colors duration-200 hover:bg-secondary/40">
                <BookOpen className="size-4 text-primary transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium transition-colors group-hover:text-primary">{article.title}</p>
                  <p className="text-xs text-muted-foreground">/{article.slug}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusChip[article.status] ?? "bg-secondary"}`}>{article.status}</span>
                <Link className="text-sm font-medium text-primary underline-offset-4 hover:underline" href={`/admin/encyclopedia/articles/new?id=${article.id}`}>Sunting</Link>
                {article.status === "review" && user.editorRole !== "contributor" && <EditorialAction articleId={article.id} action="review" label="Tinjau" />}
                {article.status === "approved" && user.editorRole === "content_administrator" && <EditorialAction articleId={article.id} action="publish" label="Terbitkan" />}
              </div>
            ))}
          </div>
          {!articles?.length && <div className="p-6"><EmptyState icon={BookOpen} title="Belum ada artikel" description="Mulai dengan menulis artikel pertama lewat tombol Artikel baru." /></div>}
        </Card>
      </Reveal>
    </main>;
  } catch { redirect("/auth/login"); }
}
