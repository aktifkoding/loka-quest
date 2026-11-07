-- Feature expansion: educator groups, daily challenge, analytics, live quiz,
-- and audio narration metadata. Additive only.

-- ---------------------------------------------------------------------------
-- Educator groups: join code + assignments
-- ---------------------------------------------------------------------------
alter table public.educator_groups
  add column if not exists join_code text;

update public.educator_groups
  set join_code = upper(substr(md5(id::text), 1, 6))
  where join_code is null;

create unique index if not exists idx_educator_groups_join_code
  on public.educator_groups (join_code)
  where join_code is not null;

create table if not exists public.educator_assignments (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid not null references public.educator_groups(id) on delete cascade,
  mission_id uuid not null references public.missions(id) on delete cascade,
  due_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (group_id, mission_id)
);

alter table public.educator_assignments enable row level security;

drop policy if exists "Educators manage own assignments" on public.educator_assignments;
create policy "Educators manage own assignments"
  on public.educator_assignments for all
  to authenticated
  using (
    exists (
      select 1 from public.educator_groups g
      where g.id = public.educator_assignments.group_id
        and g.educator_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.educator_groups g
      where g.id = public.educator_assignments.group_id
        and g.educator_id = auth.uid()
    )
  );

drop policy if exists "Members view assignments" on public.educator_assignments;
create policy "Members view assignments"
  on public.educator_assignments for select
  to authenticated
  using (
    exists (
      select 1 from public.educator_group_members m
      where m.group_id = public.educator_assignments.group_id
        and m.profile_id = auth.uid()
    )
    or exists (
      select 1 from public.educator_groups g
      where g.id = public.educator_assignments.group_id
        and g.educator_id = auth.uid()
    )
  );

-- Players need to see their own memberships (dashboard, assignments).
drop policy if exists "Members view own membership" on public.educator_group_members;
create policy "Members view own membership"
  on public.educator_group_members for select
  to authenticated
  using (auth.uid() = profile_id);

create or replace function public.is_group_member(target_group uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.educator_group_members
    where group_id = target_group and profile_id = auth.uid()
  );
$$;

revoke execute on function public.is_group_member(uuid) from public;
grant execute on function public.is_group_member(uuid) to authenticated;

drop policy if exists "Members view their groups" on public.educator_groups;
create policy "Members view their groups"
  on public.educator_groups for select
  to authenticated
  using (public.is_group_member(id));

-- ---------------------------------------------------------------------------
-- Daily challenge completions (streak is handled by touch_streak)
-- ---------------------------------------------------------------------------
create table if not exists public.daily_challenge_completions (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  challenge_date date not null,
  mission_id uuid not null references public.missions(id) on delete cascade,
  bonus_xp integer not null default 25,
  created_at timestamptz not null default now(),
  primary key (profile_id, challenge_date)
);

alter table public.daily_challenge_completions enable row level security;

drop policy if exists "Players view own daily completions" on public.daily_challenge_completions;
create policy "Players view own daily completions"
  on public.daily_challenge_completions for select
  to authenticated
  using (auth.uid() = profile_id);

-- ---------------------------------------------------------------------------
-- Privacy-friendly product analytics (only after consent)
-- ---------------------------------------------------------------------------
create table if not exists public.analytics_events (
  id bigserial primary key,
  profile_id uuid references public.profiles(id) on delete set null,
  anonymous_id text,
  name text not null,
  props jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_analytics_events_name_date
  on public.analytics_events (name, created_at desc);

alter table public.analytics_events enable row level security;

drop policy if exists "Admins read analytics events" on public.analytics_events;
create policy "Admins read analytics events"
  on public.analytics_events for select
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Live quiz sessions
-- ---------------------------------------------------------------------------
create table if not exists public.quiz_sessions (
  id uuid primary key default uuid_generate_v4(),
  host_id uuid not null references public.profiles(id) on delete cascade,
  mission_id uuid not null references public.missions(id) on delete cascade,
  code text not null unique,
  status text not null default 'lobby' check (status in ('lobby', 'active', 'finished')),
  current_index integer not null default 0,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz
);

create table if not exists public.quiz_participants (
  session_id uuid not null references public.quiz_sessions(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  display_name text,
  score integer not null default 0,
  joined_at timestamptz not null default now(),
  primary key (session_id, profile_id)
);

create table if not exists public.quiz_answers (
  session_id uuid not null references public.quiz_sessions(id) on delete cascade,
  question_id uuid not null references public.mission_questions(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  is_correct boolean not null default false,
  answered_at timestamptz not null default now(),
  primary key (session_id, question_id, profile_id)
);

alter table public.quiz_sessions enable row level security;
alter table public.quiz_participants enable row level security;
alter table public.quiz_answers enable row level security;

-- Security-definer helpers avoid recursive RLS between sessions/participants.
create or replace function public.is_quiz_participant(target_session uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.quiz_participants
    where session_id = target_session and profile_id = auth.uid()
  );
$$;

create or replace function public.is_quiz_host(target_session uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.quiz_sessions
    where id = target_session and host_id = auth.uid()
  );
$$;

revoke execute on function public.is_quiz_participant(uuid) from public;
grant execute on function public.is_quiz_participant(uuid) to authenticated;
revoke execute on function public.is_quiz_host(uuid) from public;
grant execute on function public.is_quiz_host(uuid) to authenticated;

drop policy if exists "Hosts manage quiz sessions" on public.quiz_sessions;
create policy "Hosts manage quiz sessions"
  on public.quiz_sessions for all
  to authenticated
  using (host_id = auth.uid())
  with check (host_id = auth.uid());

drop policy if exists "Participants view quiz sessions" on public.quiz_sessions;
create policy "Participants view quiz sessions"
  on public.quiz_sessions for select
  to authenticated
  using (public.is_quiz_participant(id));

drop policy if exists "Participants view quiz participants" on public.quiz_participants;
create policy "Participants view quiz participants"
  on public.quiz_participants for select
  to authenticated
  using (
    profile_id = auth.uid()
    or public.is_quiz_host(session_id)
    or public.is_quiz_participant(session_id)
  );

drop policy if exists "Participants view own quiz answers" on public.quiz_answers;
create policy "Participants view own quiz answers"
  on public.quiz_answers for select
  to authenticated
  using (profile_id = auth.uid() or public.is_quiz_host(session_id));

create index if not exists idx_quiz_participants_session
  on public.quiz_participants (session_id, score desc);
create index if not exists idx_quiz_answers_session
  on public.quiz_answers (session_id, question_id);

-- ---------------------------------------------------------------------------
-- Audio narration metadata for encyclopedia articles
-- ---------------------------------------------------------------------------
alter table public.encyclopedia_articles
  add column if not exists audio_url text,
  add column if not exists audio_credit text;
