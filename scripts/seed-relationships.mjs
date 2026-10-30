import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SECRET_KEY!;
const supabase = createClient(url, key);

type Relationship = {
  source_type: string;
  source_id: string;
  target_type: string;
  target_id: string;
  relation: string;
  description?: string;
};

const relationships: Relationship[] = [
  // Jawa Tengah
  { source_type: "region", source_id: "jawa-tengah", target_type: "content", target_id: "", relation: "part_of", description: "Wilayah asal" },
  // Jawa Barat
  { source_type: "region", source_id: "jawa-barat", target_type: "content", target_id: "", relation: "part_of", description: "Wilayah asal" },
  // Yogyakarta
  { source_type: "region", source_id: "yogyakarta", target_id: "", relation: "part_of", description: "Wilayah asal" },
];

async function resolveIds() {
  const [{ data: jt }, { data: jb }, { data: yk }, { data: contents }] = await Promise.all([
    supabase.from("cultural_regions").select("id, slug").eq("slug", "jawa-tengah").single(),
    supabase.from("cultural_regions").select("id, slug").eq("slug", "jawa-barat").single(),
    supabase.from("cultural_regions").select("id, slug").eq("slug", "yogyakarta").single(),
    supabase.from("cultural_contents").select("id, title, region_id"),
  ]);

  const byTitle = new Map((contents ?? []).map((c) => [c.title.toLowerCase(), c.id]));
  const bySlug = new Map([[jt?.slug, jt?.id], [jb?.slug, jb?.id], [yk?.slug, yk?.id]] as [string, string | undefined][]);

  const resolved: Relationship[] = [];

  for (const r of relationships) {
    let sid = r.source_id;
    let tid = r.target_id;

    if (r.source_type === "region") sid = bySlug.get(sid) ?? sid;
    if (r.target_type === "region") tid = bySlug.get(tid) ?? tid;

    resolved.push({ ...r, source_id: sid, target_id: tid });
  }

  // Link specific known contents to their regions
  const links: { source_type: string; source_id: string; target_type: string; target_id: string; relation: string }[] = [
    { source_type: "content", source_id: byTitle.get("filosofi parang rusak") ?? "", target_type: "region", target_id: jt?.id ?? "", relation: "originates_from" },
    { source_type: "content", source_id: byTitle.get("filosofi kawung") ?? "", target_type: "region", target_id: jt?.id ?? "", relation: "originates_from" },
    { source_type: "content", source_id: byTitle.get("gamelan / degung") ?? "", target_type: "region", target_id: jb?.id ?? "", relation: "originates_from" },
    { source_type: "content", source_id: byTitle.get("tokoh punakawan") ?? "", target_type: "region", target_id: yk?.id ?? "", relation: "originates_from" },
    { source_type: "content", source_id: byTitle.get("wayang kulit") ?? "", target_type: "region", target_id: yk?.id ?? "", relation: "originates_from" },
    { source_type: "content", source_id: byTitle.get("filosofi parang rusak") ?? "", target_type: "content", source_id: byTitle.get("filosofi kawung") ?? "", target_id: byTitle.get("filosofi kawung") ?? "", relation: "related_to", description: "Kedua motif batik klasik dari Tanah Air" },
    { source_type: "content", source_id: byTitle.get("gamelan / degung") ?? "", target_type: "content", target_id: byTitle.get("wayang kulit") ?? "", relation: "related_to", description: "Keduanya merupakan warisan budaya Jawa" },
  ];

  for (const l of links) {
    if (l.source_id && l.target_id) resolved.push(l);
  }

  return resolved;
}

async function main() {
  const rows = await resolveIds();
  const unique = new Map<string, Relationship>();
  for (const r of rows) {
    const key = `${r.source_type}:${r.source_id}->${r.relation}->${r.target_type}:${r.target_id}`;
    if (!unique.has(key)) unique.set(key, r);
  }

  const { error } = await supabase.from("cultural_relationships").upsert(
    Array.from(unique.values()).map((r) => ({
      source_type: r.source_type,
      source_id: r.source_id,
      target_type: r.target_type,
      target_id: r.target_id,
      relation: r.relation,
      description: r.description ?? null,
    })),
    { onConflict: "source_type,source_id,target_type,target_id,relation", ignoreDuplicates: true }
  );

  if (error) {
    console.error("seed failed:", error);
    process.exit(1);
  }

  console.log(`seeded ${unique.size} relationships`);
}

main();
