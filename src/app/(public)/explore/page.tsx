"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Compass, MapPin, ArrowRight } from "lucide-react";

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
          throw new Error(result.error || "Gagal memuat wilayah");
        }

        setRegions(result.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };

    fetchRegions();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          Jelajahi wilayah budaya
        </h1>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Setiap wilayah menyimpan tradisi dan cerita yang berbeda. Pilih satu
          untuk memulai, lalu selesaikan misinya.
        </p>
      </header>

      <div className="mt-10">
        {loading ? (
          <div
            className="grid gap-6 md:grid-cols-3"
            aria-busy="true"
            aria-label="Memuat wilayah budaya"
          >
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-xl border border-border/70 p-6">
                <Skeleton className="size-11 rounded-xl" />
                <Skeleton className="mt-4 h-6 w-2/3" />
                <Skeleton className="mt-2 h-4 w-1/2" />
                <Skeleton className="mt-4 h-16 w-full" />
                <Skeleton className="mt-5 h-9 w-full rounded-md" />
              </div>
            ))}
          </div>
        ) : error ? (
          <EmptyState
            icon={Compass}
            title="Wilayah tidak bisa dimuat"
            description={error}
          />
        ) : regions.length === 0 ? (
          <EmptyState
            icon={Compass}
            title="Belum ada wilayah terbuka"
            description="Tim konten sedang menyiapkan wilayah budaya. Muncul di sini begitu dipublikasikan."
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {regions.map((region, index) => (
              <Link key={region.id} href={`/regions/${region.slug}`} className="group">
                <Card
                  interactive
                  className="animate-fade-up h-full"
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <div className="flex items-start justify-between px-6 pt-6">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <MapPin className="size-5" aria-hidden="true" />
                    </span>
                    <ArrowRight
                      className="size-5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="px-6 pb-6 pt-4">
                    <h2 className="font-display text-xl font-semibold">
                      {region.name}
                    </h2>
                    <p className="mt-0.5 text-[13px] text-muted-foreground">
                      {region.geographic_context}
                    </p>
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {region.description}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
