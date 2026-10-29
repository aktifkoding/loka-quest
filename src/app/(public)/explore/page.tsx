"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Compass, MapPin } from "lucide-react";

interface Region {
  id: string;
  slug: string;
  name: string;
  description: string;
  geographic_context: string;
  image_url: string | null;
}

export default function ExplorePage() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await fetch("/api/v1/regions");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch regions");
        }

        setRegions(result.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchRegions();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Memuat wilayah budaya...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Compass className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Jelajahi Wilayah Budaya</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Pilih wilayah untuk mempelajari warisan budaya, tradisi, dan cerita
            yang kaya dari Nusantara.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regions.map((region) => (
            <Link key={region.id} href={`/regions/${region.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <CardTitle>{region.name}</CardTitle>
                  </div>
                  <CardDescription>{region.geographic_context}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {region.description}
                  </p>
                  <Button variant="outline" className="w-full mt-4">
                    Jelajahi Wilayah
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {regions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Belum ada wilayah budaya yang tersedia.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
