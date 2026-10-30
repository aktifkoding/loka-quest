-- Cultural Knowledge Graph
-- Stores typed relationships between cultural entities so the app can
-- render a browsable knowledge graph (region ↔ content ↔ source ↔ artifact).

create table if not exists public.cultural_relationships (
  id uuid default uuid_generate_v4() primary key,
  source_type text not null check (source_type in ('region', 'content', 'source', 'artifact', 'person', 'concept')),
  source_id uuid not null,
  target_type text not null check (target_type in ('region', 'content', 'source', 'artifact', 'person', 'concept')),
  target_id uuid not null,
  relation text not null check (relation in ('related_to', 'originates_from', 'influences', 'part_of', 'depicts', 'inspired_by', 'practiced_in')),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Community Contributions
-- Public submissions from artists, cultural workers, and communities.
-- Admin workflow: pending → published / rejected.

create table if not exists public.community_submissions (
  id uuid default uuid_generate_v4() primary key,
  submitter_id uuid references public.profiles on delete set null,
  submitter_name text not null,
  submitter_email text not null,
  title text not null,
  body text not null,
  region_id uuid references public.cultural_regions on delete set null,
  region_slug text,
  status text not null default 'pending' check (status in ('pending', 'published', 'rejected')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- AI Q&A memory (optional log of assistant interactions)
create table if not exists public.ai_qa_logs (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles on delete set null,
  question text not null,
  answer text not null,
  citations jsonb not null default '[]',
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_cultural_relationships_source on public.cultural_relationships (source_type, source_id);
create index if not exists idx_cultural_relationships_target on public.cultural_relationships (target_type, target_id);
create index if not exists idx_cultural_relationships_relation on public.cultural_relationships (relation);
create index if not exists idx_community_submissions_status on public.community_submissions (status, created_at);
create index if not exists idx_community_submissions_region on public.community_submissions (region_slug);
create index if not exists idx_ai_qa_logs_profile on public.ai_qa_logs (profile_id);
