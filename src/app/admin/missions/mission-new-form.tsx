"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/feedback";
import {
  emptyMeta,
  MissionMetaFields,
  toMetaPayload,
  type MissionMetaState,
  type RegionOption,
} from "./mission-meta";

export function MissionNewForm({ regions, nextSort }: { regions: RegionOption[]; nextSort: number }) {
  const [state, setState] = useState<MissionMetaState>(() => emptyMeta(nextSort));
  const [saving, setSaving] = useState(false);
  const { showToast, toastNode } = useToast();
  const router = useRouter();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/v1/admin/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toMetaPayload(state)),
      });
      const json = await res.json();
      if (!res.ok) {
        showToast("error", json.error || "Gagal membuat misi");
        return;
      }
      router.push(`/admin/missions/${json.data.id}/edit`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <Card>
        <div className="p-6">
          <MissionMetaFields state={state} onChange={setState} regions={regions} />
        </div>
      </Card>

      <div className="mt-6 flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          Buat misi &amp; lanjut ke soal
        </Button>
        <p className="text-[13px] text-muted-foreground">
          Misi dibuat sebagai draf — soal bisa ditambahkan setelah ini.
        </p>
      </div>
      {toastNode}
    </form>
  );
}
