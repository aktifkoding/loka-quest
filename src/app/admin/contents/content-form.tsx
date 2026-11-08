"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { adminDict as d } from "@/lib/i18n/dict/admin";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Region = { id: string; name: string };
type Source = { id: string; title: string };

export function ContentForm({ regions, sources }: { regions: Region[]; sources: Source[] }) {
  const router = useRouter();
  const { t } = useI18n();
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
      if (!res.ok) throw new Error(json.error ?? t(d.saveContentFailed));
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
      setError(err instanceof Error ? err.message : t(d.saveContentFailed));
    } finally {
      setBusy(false);
    }
  }

  if (regions.length === 0) {
    return (
      <p className="mt-4 text-sm text-muted-foreground">
        {t(d.needRegionFirst)}
      </p>
    );
  }

  const CONTENT_TYPES = [
    { value: "tradition", label: t(d.typeTradition) },
    { value: "artifact", label: t(d.typeArtifact) },
    { value: "practice", label: t(d.typePractice) },
    { value: "story", label: t(d.typeStory) },
  ] as const;

  const STATUSES = ["draft", "review", "published", "archived"] as const;
  const statusLabels: Record<(typeof STATUSES)[number], string> = {
    draft: t(d.statusDraft),
    review: t(d.statusReview),
    published: t(d.statusPublished),
    archived: t(d.statusArchived),
  };

  return (
    <div className="mt-4">
      <Button type="button" onClick={() => setOpen((value) => !value)}>
        <Plus className="size-4" aria-hidden="true" />
        {open ? t(d.closeFormCta) : t(d.addContentCta)}
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
                <Label htmlFor="content-title">{t(d.titleLabel)}</Label>
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
                <Label htmlFor="content-region">{t(d.regionLabel)}</Label>
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
                <Label htmlFor="content-type">{t(d.typeLabel)}</Label>
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
                <Label htmlFor="content-status">{t(d.statusLabel)}</Label>
                <select
                  id="content-status"
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                  value={form.status}
                  onChange={(e) => update("status", e.target.value)}
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {statusLabels[status]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="content-description">{t(d.descriptionLabel)}</Label>
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
              <Label htmlFor="content-body">{t(d.bodyLabel)}</Label>
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
              <Label htmlFor="content-source">{t(d.sourceLabel)}</Label>
              <select
                id="content-source"
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                value={form.sourceId}
                onChange={(e) => update("sourceId", e.target.value)}
              >
                <option value="">{t(d.noSourceOption)}</option>
                {sources.map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.title}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[13px] text-muted-foreground">
                {t(d.sourceRequiredNote)}
              </p>
            </div>

            <div>
              <Label htmlFor="content-media">{t(d.mediaUrlLabel)}</Label>
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
              {t(d.saveContentCta)}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
