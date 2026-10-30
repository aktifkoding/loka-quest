import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Kategori Budaya" };

export default async function EncyclopediaCategoriesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("encyclopedia_categories").select("id,slug,name,description,cover_image_url,icon").eq("status", "published").order("sort_order");
  return <div className="mx-auto max-w-6xl px-4 py-10 md:py-14"><header className="max-w-2xl"><Link href="/encyclopedia" className="text-sm text-muted-foreground">← Ensiklopedia</Link><h1 className="mt-4 font-display text-4xl font-semibold">Kategori budaya</h1><p className="mt-3 text-muted-foreground">Jelajahi warisan budaya melalui beragam bentuk pengetahuan.</p></header>{error || !data?.length ? <div className="mt-10"><EmptyState icon={BookOpen} title={error ? "Kategori belum dapat dimuat" : "Kategori sedang disiapkan"} description="Kategori dan artikel akan tampil ketika sudah tersedia." /></div> : <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{data.map((category) => <Link key={category.id} href={`/encyclopedia/explore?category=${category.slug}`}><Card interactive className="h-full"><div className="p-6"><span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><BookOpen className="size-5" aria-hidden="true"/></span><h2 className="mt-5 font-display text-xl font-semibold">{category.name}</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{category.description}</p></div></Card></Link>)}</div>}</div>;
}
