"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Gamepad2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        router.push("/player/dashboard");
      } else {
        router.push("/auth/login");
      }
    };

    handleAuthCallback();
  }, [router, supabase.auth]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="animate-fade-up text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-raised">
          <Gamepad2 className="size-7" aria-hidden="true" />
        </span>
        <p className="mt-4 font-display text-lg font-semibold">Menyiapkan sesimu…</p>
        <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
          Memproses autentikasi
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="animate-typing-dot size-1.5 rounded-full bg-primary/60"
              style={{ animationDelay: `${i * 160}ms` }}
              aria-hidden="true"
            />
          ))}
        </p>
      </div>
    </div>
  );
}
