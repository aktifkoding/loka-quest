"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { Lightbulb, Send, BookMarked, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { publicDict as d } from "@/lib/i18n/dict/public";
import { commonDict } from "@/lib/i18n/dict/common";

type Citation = {
  content_id: string;
  title: string;
  region: string | null;
  source: string | null;
  license: string | null;
  score: number;
};

type AskResponse = {
  answer: string;
  citations: Citation[];
  disclaimer: string;
};

export default function AiAssistantPage() {
  const { t } = useI18n();
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AskResponse | null>(null);
  const [asked, setAsked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ q: string; a: AskResponse }[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, response]);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = question.trim();
    if (!q || loading) return;

    setLoading(true);
    setError(null);
    setAsked(true);
    setQuestion("");

    try {
      const res = await fetch("/api/v1/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || t(d.errorAsk));
      const data = json.data as AskResponse;
      setResponse(data);
      setHistory((h) => [...h, { q, a: data }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : t(commonDict.errorGeneric));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <PageHeader
        icon={Lightbulb}
        title={t(d.assistantTitle)}
        description={t(d.assistantDescription)}
      />

      <Reveal>
        <form onSubmit={handleAsk} className="mt-8">
          <Card className="p-4">
            <div className="flex items-center gap-2.5">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={t(d.assistantPlaceholder)}
                className="flex-1"
                aria-label={t(d.assistantInputAria)}
              />
              <Button type="submit" disabled={loading || !question.trim()}>
                <Send className="size-4" aria-hidden="true" />
                {t(d.askCta)}
              </Button>
            </div>
          </Card>
        </form>
      </Reveal>

      {error && (
        <Card
          className="mt-6 border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
          role="alert"
        >
          {error}
        </Card>
      )}

      {loading && (
        <Card className="mt-6 p-6">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mt-3 h-4 w-5/6" />
          <Skeleton className="mt-3 h-4 w-4/6" />
        </Card>
      )}

      {!asked && !loading && (
        <Card className="mt-8 p-6">
          <p className="text-sm font-medium">{t(d.tryHeading)}</p>
          <ul className="mt-3 space-y-2 text-sm">
            {[
              d.sampleQuestion1,
              d.sampleQuestion2,
              d.sampleQuestion3,
            ].map((q) => (
              <li key={q.en}>
                <button
                  type="button"
                  onClick={() => setQuestion(t(q))}
                  className="group flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-card px-3.5 py-2.5 text-left transition-colors duration-200 hover:border-primary/40 hover:bg-secondary/60"
                >
                  <span className="text-muted-foreground transition-colors group-hover:text-foreground">
                    {t(q)}
                  </span>
                  <ArrowRight
                    className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary"
                    aria-hidden="true"
                  />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="mt-8 space-y-6">
        {history.map((item, index) => (
          <div key={index} className="space-y-4">
            <Card className="bg-secondary/40 p-5">
              <p className="text-sm font-semibold text-primary">{t(d.questionLabel)}</p>
              <p className="mt-1 text-sm leading-relaxed">{item.q}</p>
            </Card>
            <Card className="p-5">
              <p className="text-sm font-semibold text-primary">{t(d.answerLabel)}</p>
              <p className="mt-2 text-sm leading-relaxed">{item.a.answer}</p>

              {item.a.citations.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t(d.citationsLabel)}</p>
                  <ul className="mt-2 space-y-2">
                    {item.a.citations.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2.5">
                        <BookMarked className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{c.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {c.region ? t(d.regionPrefix, { x: c.region }) : ""}
                            {c.source ? ` · ${t(d.sourcePrefix, { x: c.source })}` : ""}
                            {c.license ? ` · ${c.license}` : ""}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
                {item.a.disclaimer}
              </p>
            </Card>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
