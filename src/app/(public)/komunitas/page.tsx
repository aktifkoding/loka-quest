"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Reveal } from "@/components/ui/reveal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  BookMarked,
  Lightbulb,
  Network,
} from "lucide-react";
import { useI18n, formatDate } from "@/lib/i18n";
import { publicDict as d } from "@/lib/i18n/dict/public";
import { commonDict } from "@/lib/i18n/dict/common";
import type { Localized } from "@/lib/i18n";

type Submission = {
  id: string;
  title: string;
  body: string;
  submitter_name: string;
  region_slug: string | null;
  status: "pending" | "published" | "rejected";
  admin_note: string | null;
  created_at: string;
};

export default function CommunityPage() {
  const { lang, t } = useI18n();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", submitter_name: "", submitter_email: "", region_slug: "" });

  const fetchSubmissions = async () => {
    try {
      const res = await fetch("/api/v1/community/submissions?status=published");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || t(d.errorLoad));
      setSubmissions(json.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t(commonDict.errorGeneric));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/community/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || t(d.errorSubmit));
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t(d.errorSubmit));
    } finally {
      setSubmitting(false);
    }
  };

  const statusMeta: Record<
    string,
    { label: Localized; icon: typeof Clock; variant: "warning" | "success" | "destructive" }
  > = {
    pending: { label: d.statusPending, icon: Clock, variant: "warning" },
    published: { label: d.statusPublished, icon: CheckCircle2, variant: "success" },
    rejected: { label: d.statusRejected, icon: XCircle, variant: "destructive" },
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
      <PageHeader
        icon={Users}
        title={t(d.communityTitle)}
        description={t(d.communityDescription)}
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
        <section aria-label={t(d.communitySectionAria)}>
          <Reveal>
            <h2 className="font-display text-xl font-semibold">{t(d.verifiedHeading)}</h2>
          </Reveal>

          {loading ? (
            <div className="mt-6 space-y-4">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))}
            </div>
          ) : error ? (
            <div className="mt-6">
              <EmptyState icon={Users} title={t(d.errorLoad)} description={error} />
            </div>
          ) : submissions.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                icon={BookMarked}
                title={t(d.docsEmptyTitle)}
                description={t(d.docsEmptyDescription)}
                action={{ label: t(d.proposeCta), href: "#form" }}
              />
            </div>
          ) : (
            <ul className="mt-6 space-y-4">
              {submissions.map((item, index) => {
                const meta = statusMeta[item.status] ?? statusMeta.pending;
                return (
                  <li key={item.id}>
                    <Reveal delay={index * 70}>
                      <Card interactive>
                        <div className="flex items-start justify-between gap-3 px-6 py-5">
                          <div className="min-w-0">
                            <p className="font-display text-lg font-semibold leading-snug">{item.title}</p>
                            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                            <p className="mt-2 text-[12px] text-muted-foreground">
                              {item.submitter_name} · {formatDate(item.created_at, lang)}
                              {item.region_slug ? ` · ${item.region_slug}` : ""}
                            </p>
                          </div>
                          <Badge variant={meta.variant} className="shrink-0">
                            <meta.icon aria-hidden="true" />
                            {t(meta.label)}
                          </Badge>
                        </div>
                      </Card>
                    </Reveal>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <aside className="space-y-6">
          <Card id="form" className="p-6">
            <div className="flex items-center gap-2.5">
              <Lightbulb className="size-5 text-gold" aria-hidden="true" />
              <h3 className="font-display text-lg font-semibold">{t(d.proposeHeading)}</h3>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t(d.proposeIntro)}
            </p>

            {submitted ? (
              <div className="mt-4 rounded-lg border border-border bg-secondary/40 p-4 text-sm">
                {t(d.proposeSuccess)}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title">{t(d.labelTitle)}</Label>
                  <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="body">{t(d.labelBody)}</Label>
                  <Textarea
                    id="body"
                    className="min-h-[120px]"
                    value={form.body}
                    onChange={(e) => setForm({ ...form, body: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="region">{t(d.labelRegionOptional)}</Label>
                  <Input id="region" value={form.region_slug} onChange={(e) => setForm({ ...form, region_slug: e.target.value })} placeholder={t(d.placeholderRegion)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="name">{t(d.labelSubmitterName)}</Label>
                  <Input id="name" value={form.submitter_name} onChange={(e) => setForm({ ...form, submitter_name: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">{t(d.labelSubmitterEmail)}</Label>
                  <Input id="email" type="email" value={form.submitter_email} onChange={(e) => setForm({ ...form, submitter_email: e.target.value })} required />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? t(commonDict.sending) : t(d.submitProposalCta)}
                </Button>
              </form>
            )}
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2.5">
              <Network className="size-5 text-primary" aria-hidden="true" />
              <h3 className="font-display text-lg font-semibold">{t(d.graphTitle)}</h3>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t(d.graphCardDescription)}
            </p>
            <Button asChild variant="outline" className="mt-4 w-full">
              <Link href="/jelajahi">
                {t(d.openGraphCta)}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </Card>
        </aside>
      </div>
    </div>
  );
}

