"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Reveal } from "@/components/ui/reveal";
import { Lightbulb, Send, BookMarked, ExternalLink } from "lucide-react";

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
      if (!res.ok) throw new Error(json.error || "Gagal memproses pertanyaan");
      const data = json.data as AskResponse;
      setResponse(data);
      setHistory((h) => [...h, { q, a: data }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <header className="max-w-2xl">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Lightbulb className="size-5" aria-hidden="true" />
          </span>
          <h1 className="font-display text-4xl font-semibold tracking-tight">Asisten Budaya AI</h1>
        </div>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Tanyakan apa saja tentang budaya Indonesia. Jawaban disusun dari artikel dan sumber budaya terverifikasi di LokaQuest, dilengkapi referensi.
        </p>
      </header>

      <Reveal>
        <form onSubmit={handleAsk} className="mt-8">
          <Card className="p-4">
            <div className="flex items-center gap-2.5">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Contoh: Apa itu batik Parang Rusak?"
                className="flex-1"
                aria-label="Pertanyaan tentang budaya"
              />
              <Button type="submit" disabled={loading || !question.trim()}>
                <Send className="size-4" aria-hidden="true" />
                Tanya
              </Button>
            </div>
          </Card>
        </form>
      </Reveal>

      {error && (
        <Card className="mt-6 border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
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
          <p className="text-sm font-medium">Coba pertanyaan:</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {[
              "Apa itu batik Parang Rusak?",
              "Ceritakan tentang wayang kulit Yogyakarta.",
              "Apa perbedaan gamelan Jawa Barat dan Jawa Tengah?",
            ].map((q) => (
              <li key={q}>
                <button
                  type="button"
                  onClick={() => setQuestion(q)}
                  className="rounded-lg border border-border px-3 py-2 text-left hover:bg-secondary/60"
                >
                  {q}
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
              <p className="text-sm font-semibold text-primary">Pertanyaan</p>
              <p className="mt-1 text-sm leading-relaxed">{item.q}</p>
            </Card>
            <Card className="p-5">
              <p className="text-sm font-semibold text-primary">Jawaban</p>
              <p className="mt-2 text-sm leading-relaxed">{item.a.answer}</p>

              {item.a.citations.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Referensi</p>
                  <ul className="mt-2 space-y-2">
                    {item.a.citations.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2.5">
                        <BookMarked className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{c.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {c.region ? `Wilayah: ${c.region}` : ""}
                            {c.source ? ` · Sumber: ${c.source}` : ""}
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
