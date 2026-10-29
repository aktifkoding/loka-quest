"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

interface Region {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
}

export default function AdminRegionsPage() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const res = await fetch("/api/v1/admin/regions");
        const data = await res.json();
        if (res.ok) setRegions(data.data || []);
      } catch (err) {
        console.error("Failed to fetch regions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRegions();
  }, []);

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Button asChild variant="ghost" className="mb-4">
              <Link href="/admin/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Dasbor
              </Link>
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Kelola Wilayah Budaya</h1>
                <p className="text-muted-foreground">
                  Tambah, edit, atau publikasikan wilayah budaya.
                </p>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Wilayah
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Daftar Wilayah</CardTitle>
              <CardDescription>
                Total {regions.length} wilayah
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground text-center py-8">
                  Memuat data...
                </p>
              ) : regions.length > 0 ? (
                <div className="space-y-3">
                  {regions.map((region) => (
                    <div
                      key={region.id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium">{region.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {region.description}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-3 py-1 rounded-full capitalize ${
                          region.status === "published"
                            ? "bg-green-100 text-green-700"
                            : region.status === "draft"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {region.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Belum ada wilayah budaya.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
