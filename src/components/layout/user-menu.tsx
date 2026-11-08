"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { ChevronDown, LogOut, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { navDict as d } from "@/lib/i18n/dict/nav";
import { cn } from "@/lib/utils";

type NavUser = {
  id: string;
  email: string;
  fullName: string | null;
};

const itemClass =
  "flex min-h-10 select-none items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground";

/**
 * Menu akun di navbar — menggantikan chip nama + tombol keluar yang
 * membuat cluster kanan navbar meluber keluar pill pada layar sempit.
 */
export function UserMenu({ user }: { user: NavUser }) {
  const router = useRouter();
  const { t } = useI18n();

  const supabase = createClient();
  const initial = (user.fullName || user.email).trim().charAt(0).toUpperCase();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className={cn(
          "group flex min-h-10 items-center gap-2 rounded-full border border-border/80 bg-card py-1 pl-1 pr-2.5 text-sm font-medium",
          "transition-[border-color,box-shadow] duration-200 outline-none",
          "hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          "data-[state=open]:border-primary/40 data-[state=open]:shadow-card",
        )}
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {initial}
        </span>
        <span className="max-w-32 truncate text-left leading-tight">
          {user.fullName || user.email}
        </span>
        <ChevronDown
          className="size-3.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
          aria-hidden="true"
        />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={10}
          className="z-50 w-56 origin-top rounded-xl border border-border/80 bg-popover p-1.5 shadow-raised data-[state=open]:animate-scale-in"
        >
          <div className="border-b border-border/70 px-3 pb-2.5 pt-2">
            <p className="truncate text-sm font-semibold">
              {user.fullName || t(d.userFallback)}
            </p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <div className="p-1">
            <DropdownMenu.Item asChild>
              <Link href="/player/dashboard" className={itemClass}>
                <Trophy className="size-4 text-muted-foreground" aria-hidden="true" />
                {t(d.dashboard)}
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="my-1.5 h-px bg-border/70" />
            <DropdownMenu.Item
              className={cn(itemClass, "text-destructive data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive")}
              onSelect={handleLogout}
            >
              <LogOut className="size-4" aria-hidden="true" />
              {t(d.logout)}
            </DropdownMenu.Item>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
