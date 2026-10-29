-- Fix infinite recursion (42P17) in RLS policies.
--
-- Root cause: several policies queried public.profiles, whose own policies
-- query profiles again — Postgres detects the cycle and fails EVERY query on
-- any table whose policies reference profiles.
--
-- Fix: replace every profile-reading policy with security-definer helpers.
-- Definer functions run as the table owner, which bypasses RLS on profiles,
-- so the role lookup cannot recurse.

create or replace function public.has_role(required_role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = required_role
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role('admin');
$$;

create or replace function public.is_admin_or_educator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role('admin') or public.has_role('educator');
$$;

-- profiles ------------------------------------------------------------------
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

-- cultural_regions ----------------------------------------------------------
drop policy if exists "Admins can manage regions" on public.cultural_regions;
create policy "Admins can manage regions"
  on public.cultural_regions for all
  using (public.is_admin_or_educator())
  with check (public.is_admin_or_educator());

-- cultural_contents ---------------------------------------------------------
drop policy if exists "Admins can manage contents" on public.cultural_contents;
create policy "Admins can manage contents"
  on public.cultural_contents for all
  using (public.is_admin_or_educator())
  with check (public.is_admin_or_educator());

-- cultural_sources ----------------------------------------------------------
drop policy if exists "Admins can manage sources" on public.cultural_sources;
create policy "Admins can manage sources"
  on public.cultural_sources for all
  using (public.is_admin_or_educator())
  with check (public.is_admin_or_educator());

-- missions ------------------------------------------------------------------
drop policy if exists "Admins can manage missions" on public.missions;
create policy "Admins can manage missions"
  on public.missions for all
  using (public.is_admin_or_educator())
  with check (public.is_admin_or_educator());

-- mission_questions ---------------------------------------------------------
drop policy if exists "Admins can manage questions" on public.mission_questions;
create policy "Admins can manage questions"
  on public.mission_questions for all
  using (public.is_admin_or_educator())
  with check (public.is_admin_or_educator());

-- achievements --------------------------------------------------------------
drop policy if exists "Admins can manage achievements" on public.achievements;
create policy "Admins can manage achievements"
  on public.achievements for all
  using (public.is_admin())
  with check (public.is_admin());

-- cultural_artifacts --------------------------------------------------------
drop policy if exists "Admins can manage artifacts" on public.cultural_artifacts;
create policy "Admins can manage artifacts"
  on public.cultural_artifacts for all
  using (public.is_admin_or_educator())
  with check (public.is_admin_or_educator());

-- audit_logs ----------------------------------------------------------------
drop policy if exists "Admins can view audit logs" on public.audit_logs;
create policy "Admins can view audit logs"
  on public.audit_logs for select
  using (public.is_admin());

-- player_progress rows are created lazily on first attempt completion,
-- so an INSERT policy is required for the upsert path.
drop policy if exists "Players can insert own progress" on public.player_progress;
create policy "Players can insert own progress"
  on public.player_progress for insert
  with check (auth.uid() = profile_id);

-- Report the caller's own role only — safe to expose to any caller.
revoke execute on function public.has_role(text) from public;
grant execute on function public.has_role(text) to authenticated;
revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
revoke execute on function public.is_admin_or_educator() from public;
grant execute on function public.is_admin_or_educator() to authenticated;
