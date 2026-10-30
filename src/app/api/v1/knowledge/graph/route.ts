import { withErrorHandling } from "@/lib/api/handler";
import { createClient } from "@/lib/supabase/server";

type RelRow = {
  id: string;
  source_type: string;
  source_id: string;
  target_type: string;
  target_id: string;
  relation: string;
  description: string | null;
};

type RegionRow = { id: string; slug: string; name: string; description: string };
type ContentRow = { id: string; title: string; description: string; body: string | null };
type SourceRow = { id: string; title: string; author: string | null; publisher: string | null; license: string | null };
type ArtifactRow = { id: string; name: string; description: string };

const labelCache = new Map<string, string>();

function cacheKey(type: string, id: string) {
  return `${type}:${id}`;
}

async function labelFor(supabase: Awaited<ReturnType<typeof createClient>>, type: string, id: string): Promise<string> {
  const key = cacheKey(type, id);
  if (labelCache.has(key)) return labelCache.get(key)!;

  let label = id;
  if (type === "region") {
    const { data } = await supabase.from("cultural_regions").select("name").eq("id", id).maybeSingle();
    if (data?.name) label = data.name;
  } else if (type === "content") {
    const { data } = await supabase.from("cultural_contents").select("title").eq("id", id).maybeSingle();
    if (data?.title) label = data.title;
  } else if (type === "source") {
    const { data } = await supabase.from("cultural_sources").select("title, author, publisher").eq("id", id).maybeSingle();
    if (data) label = [data.title, data.author, data.publisher].filter(Boolean).join(" — ");
  } else if (type === "artifact") {
    const { data } = await supabase.from("cultural_artifacts").select("name").eq("id", id).maybeSingle();
    if (data?.name) label = data.name;
  }

  labelCache.set(key, label);
  return label;
}

function toNode(type: string, id: string, label: string): { id: string; type: string; label: string } {
  return { id: `${type}:${id}`, type, label };
}

export async function GET() {
  return withErrorHandling(async () => {
    const supabase = await createClient();
    const url = new URL("http://localhost" + "/api/v1/knowledge/graph");

    const seed = url.searchParams.get("seed"); // optional seed like "region:jawa-tengah"
    const relation = url.searchParams.get("relation"); // optional filter

    let relQuery = supabase
      .from("cultural_relationships")
      .select("*");

    if (relation) relQuery = relQuery.eq("relation", relation);

    const { data: rels, error } = await relQuery.limit(200);

    if (error) {
      return Response.json({ success: true, data: { nodes: [], edges: [] } });
    }

    const rows = (rels ?? []) as RelRow[];
    const ids = new Set<string>();
    rows.forEach((r) => {
      ids.add(cacheKey(r.source_type, r.source_id));
      ids.add(cacheKey(r.target_type, r.target_id));
    });

    const nodes = new Map<string, { id: string; type: string; label: string }>();
    const edges: { source: string; target: string; relation: string; description: string | null }[] = [];

    for (const key of ids) {
      const [type, id] = key.split(":");
      const label = await labelFor(supabase, type, id);
      nodes.set(key, { id: key, type, label });
    }

    for (const r of rows) {
      const sKey = cacheKey(r.source_type, r.source_id);
      const tKey = cacheKey(r.target_type, r.target_id);
      edges.push({
        source: sKey,
        target: tKey,
        relation: r.relation,
        description: r.description,
      });
    }

    const graph = {
      nodes: Array.from(nodes.values()),
      edges,
    };

    return Response.json({ success: true, data: graph });
  });
}
