"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Region = { id: string; name: string };
type Source = { id: string; title: string };

const CONTENT_TYPES = [
  { value: "tradition", label: "Tradisi" },
  { value: "artifact", label: "Artefak" },
  { value: "practice", label: "Praktik" },
  { value: "story", label: "Cerita" },
] as const;

const STATUSES = ["draft", "review", "published", "archived"] as const;

export function ContentForm({ regions, sources }: { regions: Region[]; sources: Source[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    regionId: regions[0]?.id ?? "",
    title: "",
    description: "",
    contentType: "tradition",
    body: "",
    mediaUrl: "",
    sourceId: "",
    status: "draft",
  });

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/admin/contents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          regionId: form.regionId,
          title: form.title,
          description: form.description,
          contentType: form.contentType,
          body: form.body || null,
          mediaUrl: form.mediaUrl || null,
          sourceId: form.sourceId || null,
          status: form.status,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Gagal menyimpan konten");
      setOpen(false);
      setForm((prev) => ({
        ...prev,
        title: "",
        description: "",
        body: "",
        mediaUrl: "",
        sourceId: "",
      }));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan konten");
    } finally {
      setBusy(false);
    }
  }

  if (regions.length === 0) {
    return (
      <p className="mt-4 text-sm text-muted-foreground">
        Tambahkan wilayah terlebih dahulu sebelum membuat konten.
      </p>
    );
  }

  return (
    <div className="mt-4">
      <Button type="button" onClick={() => setOpen((value) => !value)}>
        <Plus className="size-4" aria-hidden="true" />
        {open ? "Tutup form" : "Tambah konten"}
      </Button>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      {open && (
        <Card className="mt-4 p-6">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="content-title">Judul</Label>
                <Input
                  id="content-title"
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  required
                  minLength={3}
                  maxLength={180}
                />
              </div>
              <div>
                <Label htmlFor="content-region">Wilayah</Label>
                <select
                  id="content-region"
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                  value={form.regionId}
                  onChange={(e) => update("regionId", e.target.value)}
                  required
                >
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="content-type">Jenis</Label>
                <select
                  id="content-type"
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                  value={form.contentType}
                  onChange={(e) => update("contentType", e.target.value)}
                >
                  {CONTENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="content-status">Status</Label>
                <select
                  id="content-status"
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                  value={form.status}
                  onChange={(e) => update("status", e.target.value)}
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="content-description">Deskripsi</Label>
              <textarea
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                id="content-description"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                required
                minLength={10}
                maxLength={4000}
                rows={3}
              ></textarea>
            </div>

            <div>
              <Label htmlFor="content-body">Isi (opsional)</Label>
              <textarea
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                id="content-body"
                value={form.body}
                onChange={(e) => update("body", e.target.value)}
                rows={6}
                maxLength={50000}
              ></textarea>
            </div>

            <div>
              <Label htmlFor="content-source">Sumber</Label>
              <select
                id="content-source"
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                value={form.sourceId}
                onChange={(e) => update("sourceId", e.target.value)}
              >
                <option value="">Belum ada sumber</option>
                {sources.map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.title}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Wajib dipilih sebelum status diubah menjadi published.
              </p>
            </div>

            <div>
              <Label htmlFor="content-media">URL media (opsional)</Label>
              <Input
                id="content-media"
                type="url"
                value={form.mediaUrl}
                onChange={(e) => update("mediaUrl", e.target.value)}
                placeholder="https://"
              />
            </div>

            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              Simpan konten
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
