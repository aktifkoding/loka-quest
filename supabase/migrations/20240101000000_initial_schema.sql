-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  role text not null default 'player' check (role in ('player', 'educator', 'admin')),
  xp integer not null default 0,
  level integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Cultural regions
create table if not exists public.cultural_regions (
  id uuid default uuid_generate_v4() primary key,
  slug text not null unique,
  name text not null,
  description text not null,
  geographic_context text,
  image_url text,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'review', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Cultural sources
create table if not exists public.cultural_sources (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  author text,
  publisher text,
  year integer,
  url text,
  license text,
  attribution text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Cultural contents
create table if not exists public.cultural_contents (
  id uuid default uuid_generate_v4() primary key,
  region_id uuid not null references public.cultural_regions on delete cascade,
  title text not null,
  description text not null,
  content_type text not null check (content_type in ('tradition', 'artifact', 'practice', 'story')),
  body text,
  media_url text,
  media_type text,
  source_id uuid references public.cultural_sources on delete set null,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'review', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Missions
create table if not exists public.missions (
  id uuid default uuid_generate_v4() primary key,
  region_id uuid not null references public.cultural_regions on delete cascade,
  slug text not null unique,
  title text not null,
  description text not null,
  learning_objectives jsonb not null default '[]',
  difficulty text not null default 'beginner' check (difficulty in ('beginner', 'intermediate', 'advanced')),
  xp_reward integer not null default 100,
  status text not null default 'draft' check (status in ('draft', 'review', 'published', 'archived')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Mission questions
create table if not exists public.mission_questions (
  id uuid default uuid_generate_v4() primary key,
  mission_id uuid not null references public.missions on delete cascade,
  question_type text not null check (question_type in ('multiple_choice', 'sequencing', 'matching', 'identification')),
  prompt text not null,
  options jsonb not null default '{}',
  correct_answer jsonb not null,
  explanation text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Mission attempts
create table if not exists public.mission_attempts (
  id uuid default uuid_generate_v4() primary key,
  mission_id uuid not null references public.missions on delete cascade,
  profile_id uuid not null references public.profiles on delete cascade,
  score integer not null default 0,
  xp_earned integer not null default 0,
  completed boolean not null default false,
  answers jsonb not null default '[]',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(mission_id, profile_id, started_at)
);

-- Mission answers
create table if not exists public.mission_answers (
  id uuid default uuid_generate_v4() primary key,
  attempt_id uuid not null references public.mission_attempts on delete cascade,
  question_id uuid not null references public.mission_questions on delete cascade,
  answer jsonb not null,
  is_correct boolean not null,
  created_at timestamptz not null default now()
);

-- Player progress
create table if not exists public.player_progress (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid not null references public.profiles on delete cascade unique,
  total_xp integer not null default 0,
  missions_completed integer not null default 0,
  current_level integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Achievements
create table if not exists public.achievements (
  id uuid default uuid_generate_v4() primary key,
  slug text not null unique,
  title text not null,
  description text not null,
  icon text not null,
  criteria jsonb not null default '{}',
  xp_bonus integer not null default 0,
  created_at timestamptz not null default now()
);

-- User achievements
create table if not exists public.user_achievements (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid not null references public.profiles on delete cascade,
  achievement_id uuid not null references public.achievements on delete cascade,
  earned_at timestamptz not null default now(),
  unique(profile_id, achievement_id)
);

-- Cultural artifacts
create table if not exists public.cultural_artifacts (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text not null,
  region_id uuid not null references public.cultural_regions on delete cascade,
  image_url text,
  rarity text not null default 'common' check (rarity in ('common', 'uncommon', 'rare', 'legendary')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- User artifacts
create table if not exists public.user_artifacts (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid not null references public.profiles on delete cascade,
  artifact_id uuid not null references public.cultural_artifacts on delete cascade,
  acquired_at timestamptz not null default now(),
  unique(profile_id, artifact_id)
);

-- Learning assessments
create table if not exists public.learning_assessments (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  assessment_type text not null check (assessment_type in ('pre', 'post')),
  questions jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Assessment responses
create table if not exists public.assessment_responses (
  id uuid default uuid_generate_v4() primary key,
  assessment_id uuid not null references public.learning_assessments on delete cascade,
  profile_id uuid not null references public.profiles on delete cascade,
  answers jsonb not null default '[]',
  score integer not null default 0,
  submitted_at timestamptz not null default now()
);

-- Educator groups
create table if not exists public.educator_groups (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  educator_id uuid not null references public.profiles on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Educator group members
create table if not exists public.educator_group_members (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid not null references public.educator_groups on delete cascade,
  profile_id uuid not null references public.profiles on delete cascade,
  joined_at timestamptz not null default now(),
  unique(group_id, profile_id)
);

-- Audit logs
create table if not exists public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  actor_id uuid,
  action text not null,
  resource_type text not null,
  resource_id uuid,
  details jsonb not null default '{}',
  ip_address text,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_missions_status on public.missions(status);
create index if not exists idx_cultural_regions_status on public.cultural_regions(status);
create index if not exists idx_cultural_contents_status on public.cultural_contents(status);
create index if not exists idx_mission_attempts_profile on public.mission_attempts(profile_id);
create index if not exists idx_mission_answers_attempt on public.mission_answers(attempt_id);
create index if not exists idx_user_achievements_profile on public.user_achievements(profile_id);
create index if not exists idx_audit_logs_actor on public.audit_logs(actor_id);
