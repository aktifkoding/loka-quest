import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Reveal } from "@/components/ui/reveal";

export const metadata = { title: "Kategori Budaya" };

export default async function EncyclopediaCategoriesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("encyclopedia_categories").select("id,slug,name,description,cover_image_url,icon").eq("status", "published").order("sort_order");
  return <div className="mx-auto max-w-6xl px-4 py-10 md:py-14"><Reveal><header className="max-w-2xl"><Link href="/encyclopedia" className="text-sm text-muted-foreground transition-colors hover:text-foreground">← Ensiklopedia</Link><h1 className="mt-4 font-display text-4xl font-semibold">Kategori budaya</h1><p className="mt-3 text-muted-foreground">Jelajahi warisan budaya melalui beragam bentuk pengetahuan.</p></header></Reveal>{error || !data?.length ? <div className="mt-10"><EmptyState icon={BookOpen} title={error ? "Kategori belum dapat dimuat" : "Kategori sedang disiapkan"} description="Kategori dan artikel akan tampil ketika sudah tersedia." /></div> : <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{data.map((category, index) => <Reveal key={category.id} delay={Math.min(index, 8) * 70}><Link href={`/encyclopedia/explore?category=${category.slug}`} className="group block h-full"><Card interactive className="h-full overflow-hidden">{category.cover_image_url ? <div className="overflow-hidden"><img src={category.cover_image_url} alt="" loading="lazy" className="aspect-[16/6] w-full object-cover transition-transform duration-500 ease-out-expo group-hover:scale-[1.045]"/></div> : null}<div className="p-6"><span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary/15"><BookOpen className="size-5" aria-hidden="true"/></span><h2 className="mt-5 font-display text-xl font-semibold transition-colors group-hover:text-primary">{category.name}</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{category.description}</p></div></Card></Link></Reveal>)}</div>}</div>;
}
