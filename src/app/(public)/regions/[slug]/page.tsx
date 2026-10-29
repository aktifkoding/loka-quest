"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MapPin } from "lucide-react";

interface RegionDetail {
  id: string;
  slug: string;
  name: string;
  description: string;
  geographic_context: string;
  image_url: string | null;
}

interface Mission {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: string;
  xp_reward: number;
}

export default function RegionDetailPage() {
  const params = useParams();
  const [region, setRegion] = useState<RegionDetail | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRegion = async () => {
      try {
        const [regionRes, missionsRes] = await Promise.all([
          fetch(`/api/v1/regions?slug=${params.slug}`),
          fetch(`/api/v1/missions?region=${params.slug}`),
        ]);

        const regionData = await regionRes.json();
        const missionsData = await missionsRes.json();

        if (!regionRes.ok) {
          throw new Error(regionData.error || "Failed to fetch region");
        }

        setRegion(regionData.data?.[0] || null);
        setMissions(missionsData.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchRegion();
    }
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Memuat detail wilayah...</p>
      </div>
    );
  }

  if (error || !region) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || "Wilayah tidak ditemukan"}</p>
          <Button asChild>
            <Link href="/explore">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Jelajahi
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/explore">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Link>
        </Button>

        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-6 w-6 text-primary" />
              <h1 className="text-4xl font-bold">{region.name}</h1>
            </div>
            <p className="text-muted-foreground text-lg">{region.geographic_context}</p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Tentang Wilayah Ini</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-line">
                {region.description}
              </p>
            </CardContent>
          </Card>

          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Misi di Wilayah Ini</h2>
            <div className="grid gap-4">
              {missions.map((mission) => (
                <Card key={mission.id}>
                  <CardHeader>
                    <CardTitle>{mission.title}</CardTitle>
                    <CardDescription>{mission.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="capitalize">{mission.difficulty}</span>
                        <span>•</span>
                        <span>{mission.xp_reward} XP</span>
                      </div>
                      <Button asChild>
                        <Link href={`/missions/${mission.slug}`}>Mainkan Misi</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {missions.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">
                    Belum ada misi tersedia di wilayah ini.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
