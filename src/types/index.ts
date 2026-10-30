export interface CulturalRelationship {
  id: string;
  source_type: "region" | "content" | "source" | "artifact" | "person" | "concept";
  source_id: string;
  target_type: "region" | "content" | "source" | "artifact" | "person" | "concept";
  target_id: string;
  relation: "related_to" | "originates_from" | "influences" | "part_of" | "depicts" | "inspired_by" | "practiced_in";
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CommunitySubmission {
  id: string;
  submitter_id: string | null;
  submitter_name: string;
  submitter_email: string;
  title: string;
  body: string;
  region_id: string | null;
  region_slug: string | null;
  status: "pending" | "published" | "rejected";
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface AiQaLog {
  id: string;
  profile_id: string | null;
  question: string;
  answer: string;
  citations: Record<string, unknown>[];
  created_at: string;
}

export interface GraphNode {
  id: string;
  type: CulturalRelationship["source_type"];
  label: string;
  description?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  relation: CulturalRelationship["relation"];
  description: string | null;
}

export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
