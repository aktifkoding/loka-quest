"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Reveal } from "@/components/ui/reveal";
import { Network, Info } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { publicDict as d } from "@/lib/i18n/dict/public";
import { commonDict } from "@/lib/i18n/dict/common";
import type { Localized } from "@/lib/i18n";

type GraphNode = { id: string; type: string; label: string };
type GraphEdge = { source: string; target: string; relation: string; description: string | null };
type KnowledgeGraph = { nodes: GraphNode[]; edges: GraphEdge[] };

const relationLabel: Record<string, Localized> = {
  related_to: d.relationRelatedTo,
  originates_from: d.relationOriginatesFrom,
  influences: d.relationInfluences,
  part_of: d.relationPartOf,
  depicts: d.relationDepicts,
  inspired_by: d.relationInspiredBy,
  practiced_in: d.relationPracticedIn,
};

export default function KnowledgeGraphPage() {
  const { t } = useI18n();
  const [graph, setGraph] = useState<KnowledgeGraph>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<GraphNode | null>(null);

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const res = await fetch("/api/v1/knowledge/graph");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || t(d.errorLoadGraph));
        setGraph(json.data ?? { nodes: [], edges: [] });
      } catch (err) {
        setError(err instanceof Error ? err.message : t(commonDict.errorGeneric));
      } finally {
        setLoading(false);
      }
    };
    fetchGraph();
  }, [t]);

  const neighbors = selected
    ? {
        incoming: graph.edges.filter((e) => e.target === selected.id),
        outgoing: graph.edges.filter((e) => e.source === selected.id),
      }
    : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <PageHeader
        icon={Network}
        title={t(d.graphTitle)}
        description={t(d.graphDescription)}
      />

      {loading ? (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]" aria-busy="true">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      ) : error ? (
        <div className="mt-10">
          <EmptyState icon={Network} title={t(d.graphErrorTitle)} description={error} />
        </div>
      ) : graph.nodes.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={Network}
            title={t(d.graphEmptyTitle)}
            description={t(d.graphEmptyDescription)}
          />
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
          <section aria-label={t(d.nodesSectionAria)}>
            <Reveal>
              <h2 className="font-display text-xl font-semibold">{t(d.nodesHeading)}</h2>
            </Reveal>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {graph.nodes.map((node, index) => {
                const connections = graph.edges.filter(
                  (e) => e.source === node.id || e.target === node.id
                ).length;
                return (
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
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t(d.connectionsCount, { x: connections })}
                      </p>
                    </div>
                  </Card>
                </Reveal>
                );
              })}
            </div>
          </section>

          <aside className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-2.5">
                <Info className="size-5 text-primary" aria-hidden="true" />
                <h3 className="font-display text-lg font-semibold">{t(d.detailHeading)}</h3>
              </div>

              {!selected ? (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {t(d.detailEmpty)}
                </p>
              ) : (
                <div className="mt-4 space-y-5">
                  <div>
                    <p className="text-sm font-medium">{t(d.selectedLabel)}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selected.label} <span className="text-xs">({selected.type})</span>
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium">{t(d.outgoingLabel)}</p>
                    {neighbors?.outgoing.length === 0 ? (
                      <p className="mt-1 text-sm text-muted-foreground">{t(d.noOutgoing)}</p>
                    ) : (
                      <ul className="mt-2 space-y-2">
                        {neighbors?.outgoing.map((e) => (
                          <li key={e.source + e.target} className="rounded-lg border border-border bg-secondary/40 px-3 py-2.5">
                            <p className="text-sm font-medium">
                              {relationLabel[e.relation] ? t(relationLabel[e.relation]) : e.relation}
                            </p>
                            <p className="text-xs text-muted-foreground">{e.target}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium">{t(d.incomingLabel)}</p>
                    {neighbors?.incoming.length === 0 ? (
                      <p className="mt-1 text-sm text-muted-foreground">{t(d.noIncoming)}</p>
                    ) : (
                      <ul className="mt-2 space-y-2">
                        {neighbors?.incoming.map((e) => (
                          <li key={e.source + e.target} className="rounded-lg border border-border bg-secondary/40 px-3 py-2.5">
                            <p className="text-sm font-medium">
                              {relationLabel[e.relation] ? t(relationLabel[e.relation]) : e.relation}
                            </p>
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
              <h3 className="font-display text-lg font-semibold">{t(d.entityCountHeading)}</h3>
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
