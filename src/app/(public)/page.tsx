import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Gamepad2,
  Trophy,
  BookOpen,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Jelajahi Nusantara,
              <br />
              <span className="text-primary">Hidupkan Warisan Budaya</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Selami kekayaan budaya Indonesia melalui permainan edukatif yang
              interaktif. Pelajari batik, gamelan, wayang, dan banyak lagi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/auth/register">Mulai Petualangan</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/explore">Jelajahi</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Belajar Budaya dengan Cara yang Menarik
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              LokaQuest menggabungkan teknologi permainan dengan warisan budaya
              Indonesia untuk pengalaman pembelajaran yang tak terlupakan.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Gamepad2 className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Mini-Game Interaktif</CardTitle>
                <CardDescription>
                  Mainkan misi-misi edukatif yang dirancang untuk melibatkan dan
                  mengajarkan nilai-nilai budaya.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <BookOpen className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Konten Budaya Asli</CardTitle>
                <CardDescription>
                  Setiap konten disusun dengan referensi sejarah dan budaya yang
                  terpercaya.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Trophy className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Sistem Pencapaian</CardTitle>
                <CardDescription>
                  Kumpulkan XP, level up, dan raih badge prestasi seiring
                  kemajuan Anda.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Missions Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Misi Budaya yang Menantang
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Setiap misi dirancang untuk mengajarkan aspek budaya Indonesia
              tertentu melalui permainan yang engaging.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-4xl mb-2">🧵</div>
                <CardTitle>Batik Detective</CardTitle>
                <CardDescription>
                  Pelajari motif dan filosofi batik khas Nusantara
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/missions/batik-detective">Mainkan Misi</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-4xl mb-2">🎶</div>
                <CardTitle>Gamelan Maestro</CardTitle>
                <CardDescription>
                  Kenali instrumen dan harmoni gamelan tradisional
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/missions/gamelan-maestro">Mainkan Misi</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-4xl mb-2">🎭</div>
                <CardTitle>Wayang Story Adventure</CardTitle>
                <CardDescription>
                  Ikuti petualangan wayang dan pelajari cerita rakyat
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/missions/wayang-story">Mainkan Misi</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Siap Memulai Petualangan?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan pelajar yang telah menjelajahi warisan
            budaya Indonesia bersama LokaQuest.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/auth/register">Daftar Gratis Sekarang</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
