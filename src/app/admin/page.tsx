import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Users,
  FileText,
  MapPin,
  Settings,
  ArrowUpRight,
} from "lucide-react";

const contentLinks = [
  { href: "/admin/regions", label: "Wilayah budaya", icon: MapPin },
  { href: "/admin/missions", label: "Misi & soal", icon: FileText },
  { href: "/admin/contents", label: "Konten & sumber", icon: FileText },
];

const systemLinks = [
  { href: "/admin/users", label: "Pengguna & peran", icon: Users },
  { href: "/admin/audit-logs", label: "Log audit", icon: Settings },
  { href: "/admin/analytics", label: "Analitik aplikasi", icon: Settings },
];

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
      supabase
        .from("cultural_regions")
        .select("*", { count: "exact", head: true }),
    ]);

    return (
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <header className="max-w-2xl">
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            Dasbor admin
          </h1>
          <p className="mt-2 text-muted-foreground">
            Kelola konten budaya, pengguna, dan pengaturan aplikasi.
          </p>
        </header>

        {/* Metric strip */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <Card className="border-primary/25 bg-primary/5">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  Pengguna
                </p>
                <Users className="size-5 text-muted-foreground" aria-hidden="true" />
              </div>
              <p className="mt-4 font-display text-4xl font-semibold tabular-nums">
                {userCount ?? 0}
              </p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                akun terdaftar
              </p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  Misi
                </p>
                <FileText className="size-5 text-muted-foreground" aria-hidden="true" />
              </div>
              <p className="mt-4 font-display text-4xl font-semibold tabular-nums">
                {missionCount ?? 0}
              </p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                termasuk draf dan terbit
              </p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  Wilayah
                </p>
                <MapPin className="size-5 text-muted-foreground" aria-hidden="true" />
              </div>
              <p className="mt-4 font-display text-4xl font-semibold tabular-nums">
                {regionCount ?? 0}
              </p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                wilayah budaya terdaftar
              </p>
            </div>
          </Card>
        </div>

        {/* Management links */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <div className="p-6">
              <h2 className="font-display text-xl font-semibold">
                Manajemen konten
              </h2>
              <ul className="mt-4 divide-y divide-border">
                {contentLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-3.5 py-3.5 transition-colors first:pt-1"
                    >
                      <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                        <link.icon className="size-4" aria-hidden="true" />
                      </span>
                      <span className="flex-1 text-sm font-medium">
                        {link.label}
                      </span>
                      <ArrowUpRight
                        className="size-4 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h2 className="font-display text-xl font-semibold">
                Manajemen sistem
              </h2>
              <ul className="mt-4 divide-y divide-border">
                {systemLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-3.5 py-3.5 transition-colors first:pt-1"
                    >
                      <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                        <link.icon className="size-4" aria-hidden="true" />
                      </span>
                      <span className="flex-1 text-sm font-medium">
                        {link.label}
                      </span>
                      <ArrowUpRight
                        className="size-4 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>
      </div>
    );
  } catch {
    redirect("/auth/login");
  }
}
