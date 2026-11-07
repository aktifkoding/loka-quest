"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Compass, LogIn, LogOut, Trophy, Gamepad2, Network, Users, Lightbulb, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { dictionary, getLang, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type NavUser = {
  id: string;
  email: string;
  fullName: string | null;
};

const navLinks = [
  { href: "/encyclopedia", key: "encyclopedia", icon: BookOpen },
  { href: "/explore", key: "explore", icon: Compass },
  { href: "/missions", key: "missions", icon: Gamepad2 },
  { href: "/jelajahi", key: "graph", icon: Network },
  { href: "/komunitas", key: "community", icon: Users },
  { href: "/asisten", key: "assistant", icon: Lightbulb },
  { href: "/player/dashboard", key: "dashboard", icon: Trophy },
] as const;

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<NavUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setCurrentLang] = useState<Lang>("id");
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setCurrentLang(getLang());
  }, []);

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

  // Bayangan menguat saat halaman digulir — navbar terasa "terangkat"
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3 md:px-6">
      <div
        className={cn(
          "mx-auto flex h-14 max-w-7xl items-center justify-between rounded-2xl border border-border/80 bg-background/85 pl-4 pr-2 backdrop-blur-md transition-[box-shadow,border-color] duration-300 ease-out-expo",
          scrolled ? "border-border shadow-raised" : "shadow-card"
        )}
      >
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
                "relative flex min-h-9 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-sm font-medium transition-colors duration-200",
                "after:absolute after:inset-x-3.5 after:-bottom-px after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-gold after:transition-transform after:duration-200 after:ease-out-expo",
                isActive(link.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground after:scale-x-0 hover:bg-accent hover:text-foreground hover:after:scale-x-100"
              )}
            >
              <link.icon className="size-4" aria-hidden="true" />
              {dictionary[lang][link.key]}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageToggle />
          <ThemeToggle />
          {loading ? (
            <span
              className="h-9 w-40 animate-shimmer rounded-full"
              aria-hidden="true"
            />
          ) : user ? (
            <>
              <UserMenu user={user} />
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">
                  <LogIn className="size-4" aria-hidden="true" />
                  {dictionary[lang].login}
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/register">{dictionary[lang].register}</Link>
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

      {/* Mobile panel — slide-down + stagger per tautan */}
      {isOpen && (
        <div
          id="mobile-nav"
          className="animate-slide-up mx-auto mt-2 max-w-7xl origin-top rounded-2xl border border-border/80 bg-background/95 p-3 shadow-raised backdrop-blur-md md:hidden"
        >
          <nav className="flex flex-col" aria-label="Utama mobile">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                style={{ animationDelay: `${index * 40}ms` }}
                className={cn(
                  "animate-fade-in flex min-h-11 items-center gap-2.5 rounded-xl px-3.5 text-[15px] font-medium transition-colors",
                  isActive(link.href)
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-accent"
                )}
                onClick={() => setIsOpen(false)}
              >
                <link.icon className="size-5" aria-hidden="true" />
                {dictionary[lang][link.key]}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <p className="px-1 text-sm text-muted-foreground">Tampilan</p>
            <ThemeToggle />
          </div>
          <div className="mt-3 border-t border-border pt-3">
            <div className="mb-3 flex justify-end">
              <LanguageToggle />
            </div>
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
                  {dictionary[lang].logout}
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" asChild>
                  <Link href="/auth/login">{dictionary[lang].login}</Link>
                </Button>
                <Button className="flex-1" asChild>
                  <Link href="/auth/register">{dictionary[lang].register}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
