"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Compass, LogIn, LogOut, Trophy, Gamepad2, Network, Users, Lightbulb, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

type NavUser = {
  id: string;
  email: string;
  fullName: string | null;
};

const navLinks = [
  { href: "/encyclopedia", label: "Ensiklopedia", icon: BookOpen },
  { href: "/explore", label: "Jelajahi", icon: Compass },
  { href: "/missions", label: "Misi", icon: Gamepad2 },
  { href: "/jelajahi", label: "Grafik Budaya", icon: Network },
  { href: "/komunitas", label: "Komunitas", icon: Users },
  { href: "/asisten", label: "Asisten AI", icon: Lightbulb },
  { href: "/player/dashboard", label: "Dasbor", icon: Trophy },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<NavUser | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (user) {
        setUser({
          id: user.id,
          email: user.email ?? "",
          fullName: (user.user_metadata?.full_name as string) ?? null,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsOpen(false);
    router.push("/");
    router.refresh();
  };

  const isActive = (href: string) =>
    href === "/player/dashboard"
      ? pathname.startsWith("/player") || pathname.startsWith("/educator")
      : pathname.startsWith(href);

  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3 md:px-6">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between rounded-2xl border border-border/80 bg-background/85 pl-4 pr-2 shadow-card backdrop-blur-md">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-md"
          aria-label="LokaQuest, ke beranda"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Gamepad2 className="size-5" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            LokaQuest
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Utama">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(
                "flex min-h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors duration-200",
                isActive(link.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <link.icon className="size-4" aria-hidden="true" />
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {loading ? (
            <span
              className="h-9 w-40 animate-shimmer rounded-full"
              aria-hidden="true"
            />
          ) : user ? (
            <>
              <span
                className="max-w-44 truncate rounded-full bg-secondary px-3 py-1.5 text-sm text-secondary-foreground"
                title={user.email}
              >
                {user.fullName || user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="size-4" aria-hidden="true" />
                Keluar
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">
                  <LogIn className="size-4" aria-hidden="true" />
                  Masuk
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/register">Daftar</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-accent md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls="mobile-nav"
          aria-label={isOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
        >
          {isOpen ? (
            <X className="size-5" aria-hidden="true" />
          ) : (
            <Menu className="size-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile panel */}
      {isOpen && (
        <div
          id="mobile-nav"
          className="mx-auto mt-2 max-w-6xl rounded-2xl border border-border/80 bg-background/95 p-3 shadow-raised backdrop-blur-md md:hidden"
        >
          <nav className="flex flex-col" aria-label="Utama mobile">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-2.5 rounded-xl px-3.5 text-[15px] font-medium transition-colors",
                  isActive(link.href)
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-accent"
                )}
                onClick={() => setIsOpen(false)}
              >
                <link.icon className="size-5" aria-hidden="true" />
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 border-t border-border pt-3">
            {user ? (
              <div className="space-y-2">
                <p className="truncate px-1 text-sm text-muted-foreground">
                  {user.fullName || user.email}
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleLogout}
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  Keluar
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" asChild>
                  <Link href="/auth/login">Masuk</Link>
                </Button>
                <Button className="flex-1" asChild>
                  <Link href="/auth/register">Daftar</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
