import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BookOpen, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Jelajahi Ensiklopedia" };

type ArticleCard = {
  id: string; slug: string; title: string; summary: string; featured_image_url: string | null;
  encyclopedia_article_categories: { category: { name: string } | null }[];
  encyclopedia_article_regions: { region: { name: string } | null }[];
};

export default async function ExploreEncyclopediaPage() {
  const supabase = await createClient();
  const { data: rawArticles, error } = await supabase.from("encyclopedia_articles")
    .select("id,slug,title,summary,featured_image_url,encyclopedia_article_categories(category:encyclopedia_categories(name)),encyclopedia_article_regions(region:cultural_regions(name))")
    .eq("status", "published").order("published_at", { ascending: false }).limit(24);
  const articles = (rawArticles ?? []) as unknown as ArticleCard[];
  return <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
    <header className="max-w-2xl"><Link href="/encyclopedia" className="text-sm text-muted-foreground hover:text-foreground">← Ensiklopedia</Link><h1 className="mt-4 font-display text-4xl font-semibold">Jelajahi pengetahuan budaya</h1><p className="mt-3 leading-relaxed text-muted-foreground">Artikel yang telah dipublikasikan melalui proses tinjauan editorial.</p></header>
    {error ? <div className="mt-10"><EmptyState icon={BookOpen} title="Artikel belum dapat dimuat" description="Silakan coba kembali nanti." /></div> : !articles.length ? <div className="mt-10"><EmptyState icon={BookOpen} title="Koleksi sedang disiapkan" description="Artikel ensiklopedia akan muncul setelah ditinjau dan diterbitkan. Konten lama tetap tersedia di Jelajahi Nusantara." action={{ label: "Jelajahi wilayah", href: "/explore" }} /></div> : <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{articles.map((article) => <Link key={article.id} href={`/encyclopedia/${article.slug}`} className="group"><Card interactive className="h-full overflow-hidden">{article.featured_image_url ? <img src={article.featured_image_url} alt="" loading="lazy" className="aspect-[16/9] w-full object-cover"/> : <div className="flex aspect-[16/9] items-center justify-center bg-secondary"><BookOpen className="size-9 text-primary/60" aria-hidden="true"/></div>}<div className="p-5"><div className="flex flex-wrap gap-2 text-xs text-muted-foreground">{article.encyclopedia_article_categories.map((row, i) => <span key={i} className="rounded-full bg-secondary px-2.5 py-1">{row.category?.name}</span>)}</div><h2 className="mt-3 font-display text-xl font-semibold group-hover:text-primary">{article.title}</h2><p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{article.summary}</p><p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="size-3.5" aria-hidden="true"/>{article.encyclopedia_article_regions.map((row) => row.region?.name).filter(Boolean).join(", ") || "Wilayah belum ditentukan"}</p></div></Card></Link>)}</div>}
  </div>;
}
