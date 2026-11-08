"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { commonDict } from "@/lib/i18n/dict/common";
import { shellDict as d } from "@/lib/i18n/dict/shell";

type ToastKind = "success" | "error";

export type ToastState = { kind: ToastKind; message: string } | null;

/**
 * Toast ringan untuk umpan balik aksi admin — pengganti `alert()`.
 * Render hasil `useToast()` langsung di ujung komponen:
 *   const { toast, showToast, toastNode } = useToast();
 *   ... {toastNode}
 */
export function useToast(duration = 3200) {
  const [toast, setToast] = useState<ToastState>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(null);
  const { t } = useI18n();

  const showToast = (kind: ToastKind, message: string) => {
    setToast({ kind, message });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), duration);
  };

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const toastNode = (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
      {toast && (
        <div
          role="status"
          className={`animate-slide-up pointer-events-auto flex max-w-md items-center gap-3 rounded-xl border px-4 py-3 shadow-raised backdrop-blur-md ${
            toast.kind === "success"
              ? "border-primary/25 bg-card/95"
              : "border-destructive/30 bg-card/95"
          }`}
        >
          {toast.kind === "success" ? (
            <CheckCircle2 className="size-5 shrink-0 text-primary" aria-hidden="true" />
          ) : (
            <AlertTriangle className="size-5 shrink-0 text-destructive" aria-hidden="true" />
          )}
          <p className="text-sm">{toast.message}</p>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label={t(d.toastCloseAria)}
            className="ml-1 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );

  return { toast, showToast, toastNode };
}

/**
 * Dialog konfirmasi animasi — pengganti `confirm()` dengan tetap sinkron
 * lewat callback: <ConfirmDialog open={...} onConfirm={() => ...} onClose={...} />
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  pending = false,
  destructive = true,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  pending?: boolean;
  destructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const { t } = useI18n();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="animate-fade-in fixed inset-0 z-[60] flex items-center justify-center bg-foreground/40 px-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="animate-scale-in w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-raised"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          {destructive && (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <AlertTriangle className="size-4" aria-hidden="true" />
            </span>
          )}
          <div>
            <p className="font-display text-lg font-semibold">{title}</p>
            {description && (
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            {t(commonDict.cancel)}
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            size="sm"
            onClick={onConfirm}
            disabled={pending}
          >
            {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {confirmLabel ?? t(commonDict.delete)}
          </Button>
        </div>
      </div>
    </div>
  );
}
