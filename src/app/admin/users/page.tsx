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
import { ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";

export default async function AdminUsersPage() {
  try {
    await requireRole(["admin"]);
    const supabase = await createClient();

    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

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
              <h1 className="text-4xl font-bold mb-2">Kelola Pengguna</h1>
              <p className="text-muted-foreground">
                Lihat dan kelola akun pengguna terdaftar.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Daftar Pengguna</CardTitle>
                <CardDescription>
                  Total {profiles?.length || 0} pengguna terdaftar
                </CardDescription>
              </CardHeader>
              <CardContent>
                {profiles && profiles.length > 0 ? (
                  <div className="space-y-3">
                    {profiles.map((profile) => (
                      <div
                        key={profile.id}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {profile.full_name || "Tanpa nama"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {profile.email}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-xs px-3 py-1 rounded-full capitalize ${
                            profile.role === "admin"
                              ? "bg-red-100 text-red-700"
                              : profile.role === "educator"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {profile.role}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Belum ada pengguna terdaftar.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  } catch {
    redirect("/auth/login");
  }
}
