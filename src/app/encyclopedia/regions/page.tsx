import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Wilayah Nusantara" };

export default async function EncyclopediaRegionsPage() {
  const supabase = await createClient();
  const { data: rawArticleRegions, error } = await supabase.from("encyclopedia_article_regions").select("region:cultural_regions!inner(id,slug,name,description,image_url)").eq("region.status", "published");
  const articleRegions = (rawArticleRegions ?? []) as unknown as { region: { id:string; slug:string; name:string; description:string; image_url:string|null } | null }[];
  const regions = Array.from(new Map(articleRegions.flatMap((row) => row.region ? [[row.region.id, row.region] as const] : [])).values());
  return <div className="mx-auto max-w-6xl px-4 py-10 md:py-14"><header className="max-w-2xl"><Link href="/encyclopedia" className="text-sm text-muted-foreground">← Ensiklopedia</Link><h1 className="mt-4 font-display text-4xl font-semibold">Wilayah Nusantara</h1><p className="mt-3 text-muted-foreground">Wilayah ditampilkan berdasarkan keterkaitan artikel yang sudah diterbitkan. Lokasi tidak ditambahkan tanpa verifikasi.</p></header>{error || !regions.length ? <div className="mt-10"><EmptyState icon={MapPin} title={error ? "Wilayah belum dapat dimuat" : "Belum ada wilayah terkait"} description="Wilayah akan ditampilkan ketika ada artikel ensiklopedia terbit yang terhubung." action={{ label: "Jelajahi wilayah LokaQuest", href: "/explore" }} /></div> : <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{regions.map((region) => <Link key={region.id} href={`/encyclopedia/explore?region=${region.slug}`}><Card interactive className="h-full overflow-hidden">{region.image_url && <img src={region.image_url} alt="" loading="lazy" className="aspect-[16/9] w-full object-cover"/>}<div className="p-6"><h2 className="font-display text-xl font-semibold">{region.name}</h2><p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{region.description}</p></div></Card></Link>)}</div>}</div>;
}
