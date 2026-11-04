-- Security hardening for LokaQuest.
--
-- Threat model: the Supabase anon/publishable key ships to every browser.
-- Row Level Security alone only limits *which rows* a caller may touch, not
-- which columns. This migration closes the gaps found during review:
--   1. users could update their own `role`, `xp` and `level` (privilege escalation)
--   2. correct answers and assessment keys were readable through PostgREST
--   3. community_submissions / ai_qa_logs / cultural_relationships had no RLS
--   4. game state (XP, attempts, achievements) was writable by clients
--
-- All privileged writes now go through server routes using the service role.

-- ---------------------------------------------------------------------------
-- 1. profiles: players may only change their display name
-- ---------------------------------------------------------------------------
revoke update on public.profiles from anon, authenticated;
grant update (full_name) on public.profiles to authenticated;

comment on policy "Users can update own profile" on public.profiles is
  'Column privileges restrict this update to full_name only.';

-- ---------------------------------------------------------------------------
-- 2. mission_questions: never expose correct_answer to clients
-- ---------------------------------------------------------------------------
revoke select on public.mission_questions from anon, authenticated;
grant select (
  id, mission_id, question_type, prompt, options,
  sort_order, created_at, updated_at
) on public.mission_questions to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. learning_assessments: questions JSONB contains the answer key
-- ---------------------------------------------------------------------------
revoke select on public.learning_assessments from anon, authenticated;
grant select (
  id, title, description, assessment_type, created_at, updated_at
) on public.learning_assessments to anon, authenticated;

-- Matching questions previously shipped the full answer mapping inside
-- options.pairs. Split it into independent left/right lists so the client can
-- render the exercise without receiving the key. The key stays in
-- correct_answer.matches.
update public.mission_questions
set correct_answer = jsonb_build_object('matches', options->'pairs'),
    options = jsonb_build_object(
      'lefts', (select coalesce(jsonb_agg(key order by key), '[]'::jsonb) from jsonb_each(options->'pairs')),
      'rights', (select coalesce(jsonb_agg(value), '[]'::jsonb) from jsonb_each(options->'pairs'))
    )
where question_type = 'matching'
  and options ? 'pairs'
  and not (correct_answer ? 'matches');

update public.mission_questions
set options = jsonb_build_object(
  'lefts', (select coalesce(jsonb_agg(key order by key), '[]'::jsonb) from jsonb_each(options->'pairs')),
  'rights', (select coalesce(jsonb_agg(value), '[]'::jsonb) from jsonb_each(options->'pairs'))
)
where question_type = 'matching'
  and options ? 'pairs';

-- ---------------------------------------------------------------------------
-- 4. Game state is server-owned. Reads stay owner-scoped via existing RLS.
-- ---------------------------------------------------------------------------
revoke insert, update, delete on public.player_progress from anon, authenticated;
revoke insert, update, delete on public.mission_attempts from anon, authenticated;
revoke insert, update, delete on public.mission_answers from anon, authenticated;
revoke insert, update, delete on public.user_achievements from anon, authenticated;
revoke insert, update, delete on public.user_artifacts from anon, authenticated;
revoke insert, update, delete on public.assessment_responses from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 5. community_submissions: enable RLS + scoped policies
-- ---------------------------------------------------------------------------
alter table public.community_submissions enable row level security;

-- RLS limits rows, not columns. Without column grants an anon caller could
-- still select submitter_email/admin_note from published rows via PostgREST.
revoke select on public.community_submissions from anon, authenticated;
grant select (
  id, title, body, submitter_name, region_slug, status, created_at
) on public.community_submissions to anon, authenticated;

drop policy if exists "Public can view published submissions" on public.community_submissions;
create policy "Public can view published submissions"
  on public.community_submissions for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "Users can view own submissions" on public.community_submissions;
create policy "Users can view own submissions"
  on public.community_submissions for select
  to authenticated
  using (auth.uid() = submitter_id);

drop policy if exists "Admins can view all submissions" on public.community_submissions;
create policy "Admins can view all submissions"
  on public.community_submissions for select
  to authenticated
  using (public.is_admin_or_educator());

drop policy if exists "Users can submit contributions" on public.community_submissions;
create policy "Users can submit contributions"
  on public.community_submissions for insert
  to authenticated
  with check (auth.uid() = submitter_id and status = 'pending');

drop policy if exists "Admins can update submissions" on public.community_submissions;
create policy "Admins can update submissions"
  on public.community_submissions for update
  to authenticated
  using (public.is_admin_or_educator())
  with check (public.is_admin_or_educator());

-- ---------------------------------------------------------------------------
-- 6. ai_qa_logs: private Q&A history, admin-readable only
-- ---------------------------------------------------------------------------
alter table public.ai_qa_logs enable row level security;

drop policy if exists "Users can log own questions" on public.ai_qa_logs;
create policy "Users can log own questions"
  on public.ai_qa_logs for insert
  to authenticated
  with check (auth.uid() = profile_id);

drop policy if exists "Admins can read ai logs" on public.ai_qa_logs;
create policy "Admins can read ai logs"
  on public.ai_qa_logs for select
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- 7. cultural_relationships: public read, editor write
-- ---------------------------------------------------------------------------
alter table public.cultural_relationships enable row level security;

drop policy if exists "Public can view cultural relationships" on public.cultural_relationships;
create policy "Public can view cultural relationships"
  on public.cultural_relationships for select
  to anon, authenticated
  using (true);

drop policy if exists "Editors manage cultural relationships" on public.cultural_relationships;
create policy "Editors manage cultural relationships"
  on public.cultural_relationships for all
  to authenticated
  using (public.is_admin_or_educator())
  with check (public.is_admin_or_educator());

-- ---------------------------------------------------------------------------
-- 8. Atomic progress update used by POST /api/v1/attempts
-- ---------------------------------------------------------------------------
create or replace function public.apply_xp(
  p_profile_id uuid,
  p_xp integer,
  p_first_completion boolean
)
returns table (total_xp integer, missions_completed integer, current_level integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total integer;
  v_completed integer;
  v_increment integer := greatest(coalesce(p_xp, 0), 0);
begin
  insert into public.player_progress (profile_id, total_xp, missions_completed, current_level)
  values (p_profile_id, v_increment, case when p_first_completion then 1 else 0 end, 1)
  on conflict (profile_id) do update
    set total_xp = public.player_progress.total_xp + v_increment,
        missions_completed = public.player_progress.missions_completed
          + case when p_first_completion then 1 else 0 end,
        updated_at = now()
  returning public.player_progress.total_xp, public.player_progress.missions_completed
    into v_total, v_completed;

  update public.player_progress
    set current_level = floor(v_total / 500) + 1
    where profile_id = p_profile_id;

  return query select v_total, v_completed, floor(v_total / 500) + 1;
end;
$$;

revoke execute on function public.apply_xp(uuid, integer, boolean) from public;
grant execute on function public.apply_xp(uuid, integer, boolean) to service_role;

-- ---------------------------------------------------------------------------
-- 9. Streak tracking (daily activity)
-- ---------------------------------------------------------------------------
create table if not exists public.player_streaks (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_activity_date date,
  updated_at timestamptz not null default now()
);

alter table public.player_streaks enable row level security;

drop policy if exists "Players can view own streak" on public.player_streaks;
create policy "Players can view own streak"
  on public.player_streaks for select
  to authenticated
  using (auth.uid() = profile_id);

create or replace function public.touch_streak(p_profile_id uuid)
returns table (current_streak integer, longest_streak integer, last_activity_date date)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current integer;
  v_longest integer;
  v_last date;
begin
  insert into public.player_streaks (profile_id, current_streak, longest_streak, last_activity_date)
  values (p_profile_id, 1, 1, current_date)
  on conflict (profile_id) do update
    set current_streak = case
          when public.player_streaks.last_activity_date = current_date
            then public.player_streaks.current_streak
          when public.player_streaks.last_activity_date = current_date - 1
            then public.player_streaks.current_streak + 1
          else 1
        end,
        longest_streak = greatest(
          public.player_streaks.longest_streak,
          case
            when public.player_streaks.last_activity_date = current_date
              then public.player_streaks.current_streak
            when public.player_streaks.last_activity_date = current_date - 1
              then public.player_streaks.current_streak + 1
            else 1
          end
        ),
        last_activity_date = current_date,
        updated_at = now()
  returning public.player_streaks.current_streak,
            public.player_streaks.longest_streak,
            public.player_streaks.last_activity_date
    into v_current, v_longest, v_last;

  return query select v_current, v_longest, v_last;
end;
$$;

revoke execute on function public.touch_streak(uuid) from public;
grant execute on function public.touch_streak(uuid) to service_role;

-- ---------------------------------------------------------------------------
-- 10. Durable rate limiting (survives serverless instances)
-- ---------------------------------------------------------------------------
create table if not exists public.rate_limits (
  bucket_key text primary key,
  count integer not null default 0,
  reset_at timestamptz not null
);

alter table public.rate_limits enable row level security;

create or replace function public.check_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns table (allowed boolean, retry_after integer)
language plpgsql
security definer
set search_path = public
as $$
 declare
  v_count integer;
  v_reset timestamptz;
begin
  insert into public.rate_limits (bucket_key, count, reset_at)
  values (p_key, 1, now() + make_interval(secs => p_window_seconds))
  on conflict (bucket_key) do update
    set count = case
          when public.rate_limits.reset_at <= now() then 1
          else public.rate_limits.count + 1
        end,
        reset_at = case
          when public.rate_limits.reset_at <= now()
            then now() + make_interval(secs => p_window_seconds)
          else public.rate_limits.reset_at
        end
  returning public.rate_limits.count, public.rate_limits.reset_at
    into v_count, v_reset;

  if v_count > p_limit then
    return query
      select false,
        greatest(1, ceil(extract(epoch from (v_reset - now()))))::integer;
  else
    return query select true, 0;
  end if;
end;
$$;

revoke execute on function public.check_rate_limit(text, integer, integer) from public;
grant execute on function public.check_rate_limit(text, integer, integer) to service_role;

-- ---------------------------------------------------------------------------
-- 11. Spaced-repetition review queue
-- ---------------------------------------------------------------------------
create table if not exists public.review_items (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  question_id uuid not null references public.mission_questions(id) on delete cascade,
  mission_id uuid not null references public.missions(id) on delete cascade,
  interval_days integer not null default 1,
  ease numeric(4,2) not null default 2.5,
  lapses integer not null default 0,
  due_at timestamptz not null default now(),
  last_reviewed_at timestamptz,
  primary key (profile_id, question_id)
);

create index if not exists idx_review_items_due
  on public.review_items (profile_id, due_at);

alter table public.review_items enable row level security;

drop policy if exists "Players can view own review queue" on public.review_items;
create policy "Players can view own review queue"
  on public.review_items for select
  to authenticated
  using (auth.uid() = profile_id);

-- Writers use the service role from server routes.
