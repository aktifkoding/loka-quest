import { Reveal } from "@/components/ui/reveal";
import type { LucideIcon } from "lucide-react";

/**
 * Header halaman yang konsisten: chip eyebrow + ikon, judul display,
 * deskripsi, dan entrance stagger bawaan. Server-safe (Reveal adalah
 * client component yang aman disarangkan).
 */
export function PageHeader({
  eyebrow,
  icon: Icon,
  title,
  description,
  actions,
  className = "",
}: {
  eyebrow: string;
  icon: LucideIcon;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={className}>
      <Reveal>
        <p className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground">
          <Icon className="size-3.5 text-gold" aria-hidden="true" />
          {eyebrow}
        </p>
      </Reveal>
      <Reveal delay={80}>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-4xl font-semibold tracking-tight md:text-[2.75rem]">
            {title}
          </h1>
          {actions}
        </div>
      </Reveal>
      {description && (
        <Reveal delay={140}>
          <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
        </Reveal>
      )}
    </header>
  );
}
