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

type GraphNode = { id: string; type: string; label: string };
type GraphEdge = {
  source: string;
  target: string;
  relation: string;
  description: string | null;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const nodeKey = (type: string, id: string) => `${type}:${id}`;

async function labelFor(
  supabase: Awaited<ReturnType<typeof createClient>>,
  type: string,
  id: string,
  cache: Map<string, string>
): Promise<string> {
  const key = nodeKey(type, id);
  const cached = cache.get(key);
  if (cached) return cached;

  let label = id;
  if (type === "region") {
    const { data } = await supabase
      .from("cultural_regions")
      .select("name")
      .eq("id", id)
      .maybeSingle();
    if (data?.name) label = data.name;
  } else if (type === "content") {
    const { data } = await supabase
      .from("cultural_contents")
      .select("title")
      .eq("id", id)
      .maybeSingle();
    if (data?.title) label = data.title;
  } else if (type === "source") {
    const { data } = await supabase
      .from("cultural_sources")
      .select("title, author, publisher")
      .eq("id", id)
      .maybeSingle();
    if (data) {
      label = [data.title, data.author, data.publisher]
        .filter(Boolean)
        .join(" — ");
    }
  } else if (type === "artifact") {
    const { data } = await supabase
      .from("cultural_artifacts")
      .select("name")
      .eq("id", id)
      .maybeSingle();
    if (data?.name) label = data.name;
  }

  // Bounded per-request cache: avoids the N+1 queries for repeated nodes
  // without keeping stale labels in a module-level Map forever.
  if (cache.size < 500) cache.set(key, label);
  return label;
}

export async function GET(request: Request) {
  return withErrorHandling(async () => {
    const supabase = await createClient();
    const url = new URL(request.url);
    const relation = url.searchParams.get("relation");
    const seed = url.searchParams.get("seed"); // "<type>:<uuid>"

    let seedType: string | null = null;
    let seedId: string | null = null;
    if (seed) {
      const [type, id] = seed.split(":");
      if (type && id && UUID_RE.test(id)) {
        seedType = type;
        seedId = id;
      }
    }

    let relQuery = supabase.from("cultural_relationships").select("*");
    if (relation) relQuery = relQuery.eq("relation", relation);

    const { data: rels, error } = await relQuery
      .order("created_at", { ascending: true })
      .limit(200);

    if (error) {
      // The graph is an enhancement; keep the page usable if it is unavailable.
      return Response.json(
        { success: true, data: { nodes: [], edges: [] } },
        { headers: { "Cache-Control": "public, s-maxage=60" } }
      );
    }

    let rows = (rels ?? []) as RelRow[];
    if (seedType && seedId) {
      rows = rows.filter(
        (row) =>
          (row.source_type === seedType && row.source_id === seedId) ||
          (row.target_type === seedType && row.target_id === seedId)
      );
    }

    const cache = new Map<string, string>();
    const nodes = new Map<string, GraphNode>();
    const edges: GraphEdge[] = [];

    for (const row of rows) {
      const source = nodeKey(row.source_type, row.source_id);
      const target = nodeKey(row.target_type, row.target_id);

      if (!nodes.has(source)) {
        nodes.set(source, {
          id: source,
          type: row.source_type,
          label: await labelFor(
            supabase,
            row.source_type,
            row.source_id,
            cache
          ),
        });
      }
      if (!nodes.has(target)) {
        nodes.set(target, {
          id: target,
          type: row.target_type,
          label: await labelFor(
            supabase,
            row.target_type,
            row.target_id,
            cache
          ),
        });
      }

      edges.push({
        source,
        target,
        relation: row.relation,
        description: row.description,
      });
    }

    return Response.json(
      {
        success: true,
        data: { nodes: Array.from(nodes.values()), edges },
      },
      { headers: { "Cache-Control": "public, s-maxage=60" } }
    );
  });
}
