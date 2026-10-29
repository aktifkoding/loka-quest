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
import { Users, BookOpen } from "lucide-react";
import Link from "next/link";

export default async function EducatorDashboardPage() {
  try {
    const user = await requireRole(["educator", "admin"]);
    const supabase = await createClient();

    // Get educator's groups
    const { data: groups } = await supabase
      .from("educator_groups")
      .select("*")
      .eq("educator_id", user.id);

    const groupCount = groups?.length || 0;

    // Get member count
    const { data: members } = await supabase
      .from("educator_group_members")
      .select("profile_id", { count: "exact" })
      .in(
        "group_id",
        groups?.map((g) => g.id) || []
      );

    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">Dasbor Edukator</h1>
              <p className="text-muted-foreground">
                Kelola pembelajaran dan pantau progres siswa Anda.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Kelompok</CardTitle>
                  <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{groupCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Kelompok yang dikelola
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Peserta</CardTitle>
                  <Users className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{members?.length || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total peserta
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Misi Aktif</CardTitle>
                  <BookOpen className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Misi tersedia
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Kelompok Saya</CardTitle>
                  <CardDescription>Daftar kelompok yang Anda kelola</CardDescription>
                </CardHeader>
                <CardContent>
                  {groups && groups.length > 0 ? (
                    <div className="space-y-3">
                      {groups.map((group) => (
                        <div
                          key={group.id}
                          className="p-4 bg-muted/50 rounded-lg"
                        >
                          <h3 className="font-medium">{group.name}</h3>
                          {group.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {group.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Belum ada kelompok. Buat kelompok untuk memulai.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Analisis Pembelajaran</CardTitle>
                  <CardDescription>Lihat hasil assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">
                    Pantau hasil pre-test dan post-test siswa untuk mengukur
                    peningkatan pembelajaran.
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/educator/analytics">Lihat Analisis</Link>
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
