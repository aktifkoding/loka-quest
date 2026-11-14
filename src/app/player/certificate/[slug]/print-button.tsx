"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export function PrintButton({ label }: { label: string }) {
  return (
    <Button size="sm" onClick={() => window.print()} className="no-print">
      <Printer className="size-4" aria-hidden="true" />
      {label}
    </Button>
  );
}
