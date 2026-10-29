import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, FileText, Settings, BarChart3 } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  try {
    await requireRole(["admin"]);
    const supabase = await createClient();

    const [
      { count: userCount },
      { count: missionCount },
      { count: regionCount },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("missions").select("*", { count: "exact", head: true }),
      supabase.from("cultural_regions").select("*", { count: "exact", head: true }),
    ]);

    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">Dasbor Admin</h1>
              <p className="text-muted-foreground">
                Kelola konten, pengguna, dan pengaturan aplikasi.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pengguna</CardTitle>
                  <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{userCount || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total pengguna terdaftar
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Misi</CardTitle>
                  <FileText className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{missionCount || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total misi
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Wilayah</CardTitle>
                  <BarChart3 className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{regionCount || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Wilayah budaya
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pengaturan</CardTitle>
                  <Settings className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">✓</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sistem berjalan
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Manajemen Konten</CardTitle>
                  <CardDescription>
                    Kelola wilayah, misi, dan konten budaya
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild variant="outline" className="w-full justify-between">
                    <Link href="/admin/regions">Kelola Wilayah Budaya</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-between">
                    <Link href="/admin/missions">Kelola Misi</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-between">
                    <Link href="/admin/contents">Kelola Konten</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Manajemen Sistem</CardTitle>
                  <CardDescription>
                    Kelola pengguna dan lihat log sistem
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild variant="outline" className="w-full justify-between">
                    <Link href="/admin/users">Kelola Pengguna</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-between">
                    <Link href="/admin/audit-logs">Log Audit</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-between">
                    <Link href="/admin/analytics">Analitik</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  } catch {
    redirect("/auth/login");
  }
}
