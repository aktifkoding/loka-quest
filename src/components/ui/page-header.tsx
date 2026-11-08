import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeaderBackLabel } from "@/components/ui/page-header-back-label";

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** Tampilkan tautan kembali di atas judul (navigasi mundur yang konsisten). */
  backHref?: string;
  backLabel?: string;
  /** Slot kanan header — tombol aksi, share, dsb. */
  actions?: React.ReactNode;
  /** Sembunyikan garis tenun di bawah header (mis. saat card langsung menyambung). */
  noDivider?: boolean;
  className?: string;
}

/**
 * Header halaman bersama: chip ikon, judul display serif, deskripsi,
 * garis tenun — satu pola budaya untuk semua halaman.
 */
export function PageHeader({
  icon: Icon,
  title,
  description,
  backHref,
  backLabel,
  actions,
  noDivider = false,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn(className)}>
      {backHref && (
        <Link
          href={backHref}
          className="mb-4 inline-flex items-center gap-1.5 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          <PageHeaderBackLabel label={backLabel} />
        </Link>
      )}

      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <div className="flex items-start gap-3.5">
          <span className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              {title}
            </h1>
            {description && (
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-[15px]">
                {description}
              </p>
            )}
          </div>
        </div>

        {actions && <div className="flex items-center gap-2 pt-1">{actions}</div>}
      </div>

      {!noDivider && <div className="tenun mt-6" aria-hidden="true" />}
    </div>
  );
}
