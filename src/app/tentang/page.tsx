import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Code2, TrendingUp, BookMarked } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

export const metadata = {
  title: "Tentang Kami",
};

const ROLES = [
  {
    icon: Code2,
    role: "Pengembang Produk",
    body: "Merancang dan membangun LokaQuest: Next.js, Phaser 3, dan Supabase — dengan nilai jawaban dinilai di server dan data dilindungi keamanan tingkat baris.",
  },
  {
    icon: TrendingUp,
    role: "Pengampu Ekonomi & Bisnis",
    body: "Menjaga agar produk berjalan pada kuota layanan gratis, merancang jalur keberlanjutan, dan menyiapkan model pertumbuhan pasca-kompetisi.",
  },
  {
    icon: BookMarked,
    role: "Pengampu Substansi Kebudayaan",
    body: "Memverifikasi setiap tradisi yang ditulis, menjaga register sumber dan lisensi, serta memastikan penyajian yang hormat pada masyarakat pemilik budaya.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
        <Link href="/">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Beranda
        </Link>
      </Button>

      <h1 className="font-display text-4xl font-semibold tracking-tight">
        Tentang LokaQuest
      </h1>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        LokaQuest lahir dari satu keyakinan: warisan budaya paling hidup
        ketika generasi muda menyentuhnya lewat cara mereka paling suka —
        bermain. Tiga misi kami (batik, gamelan, wayang) dibangun di atas
        konten bersumber dan teknologi yang menghormati privasi pemain.
      </p>

      <div className="mt-10 space-y-4">
        {ROLES.map((r, i) => (
          <Reveal key={r.role} delay={i * 80}>
            <Card>
              <div className="flex gap-4 p-6">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <r.icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-display text-lg font-semibold">{r.role}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {r.body}
                  </p>
                </div>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>

      <p className="mt-10 text-sm leading-relaxed text-muted-foreground">
        Ingin berkolaborasi atau memakai LokaQuest di kelas Anda?{" "}
        <Link href="/sumber" className="font-medium text-primary hover:underline">
          Lihat register sumber budaya kami
        </Link>{" "}
        untuk transparansi penuh atas rujukan dan lisensi.
      </p>
    </div>
  );
}
