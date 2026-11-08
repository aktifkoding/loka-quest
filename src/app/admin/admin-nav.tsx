"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";
import { adminDict as d } from "@/lib/i18n/dict/admin";
import { LogOut, MapPin, BarChart3, BookOpen, FileText, Home, MessageSquare, ScrollText, Users } from "lucide-react";

export function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { t } = useI18n();

  const LINKS = [
    { href: "/admin", label: t(d.navDashboard), icon: Home, exact: true },
    { href: "/admin/regions", label: t(d.navRegions), icon: MapPin },
    { href: "/admin/missions", label: t(d.navMissions), icon: FileText },
    { href: "/editor/encyclopedia", label: t(d.navEncyclopedia), icon: BookOpen },
    { href: "/admin/contents", label: t(d.navContents), icon: ScrollText },
    { href: "/admin/submissions", label: t(d.navSubmissions), icon: MessageSquare },
    { href: "/admin/users", label: t(d.navUsers), icon: Users },
    { href: "/admin/audit-logs", label: t(d.navAuditLogs), icon: ScrollText },
    { href: "/admin/analytics", label: t(d.navAnalytics), icon: BarChart3 },
  ];

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link
          href="/admin"
          className="flex shrink-0 items-center gap-2 font-display text-sm font-semibold tracking-tight"
        >
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            LQ
          </span>
          <span className="hidden sm:inline">LokaQuest Admin</span>
        </Link>

        <nav aria-label={t(d.navAria)} className="flex-1 overflow-x-auto">
          <ul className="flex items-center gap-1 text-[13px] font-medium">
            {LINKS.map((link) => (
              <li key={link.href} className="shrink-0">
                <Link
                  href={link.href}
                  aria-current={isActive(link.href, link.exact) ? "page" : undefined}
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition-colors ${
                    isActive(link.href, link.exact)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <link.icon className="size-3.5" aria-hidden="true" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden max-w-[180px] truncate text-xs text-muted-foreground md:inline">
            {email}
          </span>
          <button
            type="button"
            onClick={() => void signOut()}
            aria-label={t(d.signOutAria)}
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
