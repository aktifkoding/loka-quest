import Link from "next/link";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service-role";
import { requireRole } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { RoleSelect } from "./role-select";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  try {
    const admin = await requireRole(["admin"]);

    // Service client: admin needs the full user list including roles.
    // This read is authorized by requireRole above.
    const service = createServiceClient();
    const { data: profiles } = await service
      .from("profiles")
      .select("id, email, full_name, role, xp, level, created_at")
      .order("created_at", { ascending: false });

    const users = profiles ?? [];

    return (
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
          <Link href="/admin">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Dasbor admin
          </Link>
        </Button>

        <header>
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            Pengguna & peran
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            <span className="tabular-nums">{users.length}</span> akun. Perubahan
            peran berlaku seketika dan tercatat di log audit.
          </p>
        </header>

        <Card className="mt-8 overflow-hidden">
          {users.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-muted-foreground">
              Belum ada pengguna terdaftar.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">
                  Daftar pengguna dengan pengaturan peran
                </caption>
                <thead>
                  <tr className="border-b border-border bg-secondary/40 text-left text-[13px] text-muted-foreground">
                    <th scope="col" className="px-6 py-3 font-medium">
                      Nama
                    </th>
                    <th scope="col" className="px-6 py-3 font-medium">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 font-medium">
                      Peran
                    </th>
                    <th scope="col" className="px-6 py-3 text-right font-medium">
                      XP
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((profile) => (
                    <tr
                      key={profile.id}
                      className="transition-colors hover:bg-secondary/50"
                    >
                      <td className="px-6 py-3.5 font-medium">
                        <span className="flex items-center gap-2">
                          {profile.full_name || "Tanpa nama"}
                          {profile.id === admin.id && (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                              kamu
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-muted-foreground">
                        {profile.email}
                      </td>
                      <td className="px-6 py-3.5">
                        {profile.id === admin.id ? (
                          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                            <ShieldCheck className="size-3.5" aria-hidden="true" />
                            admin
                          </span>
                        ) : (
                          <RoleSelect userId={profile.id} currentRole={profile.role} />
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right tabular-nums">
                        {profile.xp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    );
  } catch {
    redirect("/auth/login");
  }
}
