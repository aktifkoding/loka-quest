"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Reveal } from "@/components/ui/reveal";
import { Network, Info, ArrowRight } from "lucide-react";

type GraphNode = { id: string; type: string; label: string };
type GraphEdge = { source: string; target: string; relation: string; description: string | null };
type KnowledgeGraph = { nodes: GraphNode[]; edges: GraphEdge[] };

const relationLabel: Record<string, string> = {
  related_to: "Terhubung",
  originates_from: "Berawal dari",
  influences: "Mempengaruhi",
  part_of: "Bagian dari",
  depicts: "Menggambarkan",
  inspired_by: "Terinspirasi dari",
  practiced_in: "Dipelajari di",
};

export default function KnowledgeGraphPage() {
  const [graph, setGraph] = useState<KnowledgeGraph>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<GraphNode | null>(null);

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const res = await fetch("/api/v1/knowledge/graph");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Gagal memuat grafik");
        setGraph(json.data ?? { nodes: [], edges: [] });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };
    fetchGraph();
  }, []);

  const neighbors = selected
    ? {
        incoming: graph.edges.filter((e) => e.target === selected.id),
        outgoing: graph.edges.filter((e) => e.source === selected.id),
      }
    : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <header className="max-w-2xl">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Network className="size-5" aria-hidden="true" />
          </span>
          <h1 className="font-display text-4xl font-semibold tracking-tight">Grafik Budaya</h1>
        </div>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Peta hubungan antar wilayah, tradisi, tokoh, dan artefak. Sentuh simpul untuk menjelajahi keterkaitannya.
        </p>
      </header>

      {loading ? (
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="mt-10">
          <EmptyState icon={Network} title="Grafik belum siap" description={error} />
        </div>
      ) : graph.nodes.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={Network}
            title="Belum ada hubungan terdaftar"
            description="Tim substansi budaya sedang menambahkan hubungan antar entitas. Nanti akan muncul di sini."
          />
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
          <section aria-label="Simpul budaya">
            <Reveal>
              <h2 className="font-display text-xl font-semibold">Simpul</h2>
            </Reveal>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {graph.nodes.map((node, index) => (
                <Reveal key={node.id} delay={index * 60}>
                  <Card
                    interactive
                    className={
                      "cursor-pointer " + (selected?.id === node.id ? "ring-2 ring-primary" : "")
                    }
                    onClick={() => setSelected(node)}
                  >
                    <div className="px-5 py-5">
                      <p className="text-[12px] font-medium uppercase tracking-wide text-muted-foreground">{node.type}</p>
                      <p className="mt-1 font-display text-lg font-semibold leading-snug">{node.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">ID: {node.id}</p>
                    </div>
                  </Card>
                </Reveal>
              ))}
            </div>
          </section>

          <aside className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-2.5">
                <Info className="size-5 text-primary" aria-hidden="true" />
                <h3 className="font-display text-lg font-semibold">Detail hubungan</h3>
              </div>

              {!selected ? (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Pilih salah satu simpul di samping untuk melihat hubungan masuk dan keluar.
                </p>
              ) : (
                <div className="mt-4 space-y-5">
                  <div>
                    <p className="text-sm font-medium">Terpilih</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selected.label} <span className="text-xs">({selected.type})</span>
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Keluar</p>
                    {neighbors?.outgoing.length === 0 ? (
                      <p className="mt-1 text-sm text-muted-foreground">Tidak ada hubungan keluar.</p>
                    ) : (
                      <ul className="mt-2 space-y-2">
                        {neighbors?.outgoing.map((e) => (
                          <li key={e.source + e.target} className="rounded-lg border border-border bg-secondary/40 px-3 py-2.5">
                            <p className="text-sm font-medium">{relationLabel[e.relation] ?? e.relation}</p>
                            <p className="text-xs text-muted-foreground">{e.target}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium">Masuk</p>
                    {neighbors?.incoming.length === 0 ? (
                      <p className="mt-1 text-sm text-muted-foreground">Tidak ada hubungan masuk.</p>
                    ) : (
                      <ul className="mt-2 space-y-2">
                        {neighbors?.incoming.map((e) => (
                          <li key={e.source + e.target} className="rounded-lg border border-border bg-secondary/40 px-3 py-2.5">
                            <p className="text-sm font-medium">{relationLabel[e.relation] ?? e.relation}</p>
                            <p className="text-xs text-muted-foreground">{e.source}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="font-display text-lg font-semibold">Jumlah entitas</h3>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                {["region", "content", "source", "artifact", "person", "concept"].map((type) => {
                  const count = graph.nodes.filter((n) => n.type === type).length;
                  return (
                    <div key={type} className="rounded-lg border border-border bg-secondary/40 px-3 py-2">
                      <p className="text-xs text-muted-foreground">{type}</p>
                      <p className="text-sm font-semibold tabular-nums">{count}</p>
                    </div>
                  );
                })}
              </div>
            </Card>
          </aside>
        </div>
      )}
    </div>
  );
}
