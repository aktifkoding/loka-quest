"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowLeft, Plus, MapPin, FileText } from "lucide-react";

interface Region {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
}

const statusDot: Record<string, string> = {
  published: "bg-primary",
  review: "bg-gold",
  draft: "bg-muted-foreground/50",
  archived: "bg-muted-foreground/30",
};

const statusLabel: Record<string, string> = {
  published: "Terbit",
  review: "Review",
  draft: "Draf",
  archived: "Arsip",
};

export default function AdminRegionsPage() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const res = await fetch("/api/v1/admin/regions");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal memuat wilayah");
        setRegions(data.data || []);
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
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
        <Link href="/admin">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Dasbor admin
        </Link>
      </Button>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            Wilayah budaya
          </h1>
          <p className="mt-2 text-muted-foreground">
            Atur wilayah lewat status editorial: draf, review, terbit, arsip.
          </p>
        </div>
        <Button>
          <Plus className="size-4" aria-hidden="true" />
          Tambah wilayah
        </Button>
      </header>

      <div className="mt-8">
        {loading ? (
          <div
            className="space-y-3"
            aria-busy="true"
            aria-label="Memuat wilayah"
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-xl border border-border/70 px-6 py-5"
              >
                <Skeleton className="size-10 rounded-xl" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-1/4" />
                  <Skeleton className="mt-2 h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <EmptyState
            icon={MapPin}
            title="Wilayah tidak bisa dimuat"
            description={error}
          />
        ) : regions.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="Belum ada wilayah"
            description="Tambahkan wilayah pertama, lalu isi konten dan sumbernya sebelum menerbitkan."
          />
        ) : (
          <ul className="space-y-3">
            {regions.map((region) => (
              <li key={region.id}>
                <Card>
                  <div className="flex items-center gap-4 px-6 py-5">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                      <MapPin className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{region.name}</p>
                      <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                        {region.description}
                      </p>
                    </div>
                    <span className="flex shrink-0 items-center gap-2 text-[13px] text-muted-foreground">
                      <span
                        className={`size-2 rounded-full ${statusDot[region.status] ?? "bg-muted-foreground/50"}`}
                        aria-hidden="true"
                      />
                      {statusLabel[region.status] ?? region.status}
                    </span>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
