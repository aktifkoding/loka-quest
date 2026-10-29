-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.cultural_regions enable row level security;
alter table public.cultural_contents enable row level security;
alter table public.cultural_sources enable row level security;
alter table public.missions enable row level security;
alter table public.mission_questions enable row level security;
alter table public.mission_attempts enable row level security;
alter table public.mission_answers enable row level security;
alter table public.player_progress enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;
alter table public.cultural_artifacts enable row level security;
alter table public.user_artifacts enable row level security;
alter table public.learning_assessments enable row level security;
alter table public.assessment_responses enable row level security;
alter table public.educator_groups enable row level security;
alter table public.educator_group_members enable row level security;
alter table public.audit_logs enable row level security;

-- Profiles policies
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Admins can view all profiles" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Cultural regions policies
create policy "Public can view published regions" on public.cultural_regions
  for select using (status = 'published');

create policy "Admins can manage regions" on public.cultural_regions
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'educator')
    )
  );

-- Cultural contents policies
create policy "Public can view published contents" on public.cultural_contents
  for select using (status = 'published');

create policy "Admins can manage contents" on public.cultural_contents
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'educator')
    )
  );

-- Cultural sources policies
create policy "Public can view sources" on public.cultural_sources
  for select using (true);

create policy "Admins can manage sources" on public.cultural_sources
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'educator')
    )
  );

-- Missions policies
create policy "Public can view published missions" on public.missions
  for select using (status = 'published');

create policy "Admins can manage missions" on public.missions
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'educator')
    )
  );

-- Mission questions policies
create policy "Public can view questions for published missions" on public.mission_questions
  for select using (
    exists (
      select 1 from public.missions
      where missions.id = mission_questions.mission_id
      and missions.status = 'published'
    )
  );

create policy "Admins can manage questions" on public.mission_questions
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'educator')
    )
  );

-- Mission attempts policies
create policy "Players can view own attempts" on public.mission_attempts
  for select using (auth.uid() = profile_id);

create policy "Players can create attempts" on public.mission_attempts
  for insert with check (auth.uid() = profile_id);

create policy "Players can update own attempts" on public.mission_attempts
  for update using (auth.uid() = profile_id);

-- Mission answers policies
create policy "Players can view own answers" on public.mission_answers
  for select using (
    exists (
      select 1 from public.mission_attempts
      where mission_attempts.id = mission_answers.attempt_id
      and mission_attempts.profile_id = auth.uid()
    )
  );

create policy "Players can create answers" on public.mission_answers
  for insert with check (
    exists (
      select 1 from public.mission_attempts
      where mission_attempts.id = mission_answers.attempt_id
      and mission_attempts.profile_id = auth.uid()
    )
  );

-- Player progress policies
create policy "Players can view own progress" on public.player_progress
  for select using (auth.uid() = profile_id);

create policy "Players can update own progress" on public.player_progress
  for update using (auth.uid() = profile_id);

-- Achievements policies
create policy "Public can view achievements" on public.achievements
  for select using (true);

create policy "Admins can manage achievements" on public.achievements
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- User achievements policies
create policy "Players can view own achievements" on public.user_achievements
  for select using (auth.uid() = profile_id);

create policy "System can create user achievements" on public.user_achievements
  for insert with check (auth.uid() = profile_id);

-- Cultural artifacts policies
create policy "Public can view artifacts" on public.cultural_artifacts
  for select using (true);

create policy "Admins can manage artifacts" on public.cultural_artifacts
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'educator')
    )
  );

-- User artifacts policies
create policy "Players can view own artifacts" on public.user_artifacts
  for select using (auth.uid() = profile_id);

create policy "System can create user artifacts" on public.user_artifacts
  for insert with check (auth.uid() = profile_id);

-- Learning assessments policies
create policy "Public can view assessments" on public.learning_assessments
  for select using (true);

create policy "Players can submit responses" on public.assessment_responses
  for insert with check (auth.uid() = profile_id);

create policy "Players can view own responses" on public.assessment_responses
  for select using (auth.uid() = profile_id);

-- Educator groups policies
create policy "Educators can view own groups" on public.educator_groups
  for select using (auth.uid() = educator_id);

create policy "Educators can manage own groups" on public.educator_groups
  for all using (auth.uid() = educator_id);

-- Educator group members policies
create policy "Educators can view group members" on public.educator_group_members
  for select using (
    exists (
      select 1 from public.educator_groups
      where educator_groups.id = educator_group_members.group_id
      and educator_groups.educator_id = auth.uid()
    )
  );

-- Audit logs policies
create policy "Admins can view audit logs" on public.audit_logs
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Functions
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'player');
  return new;
end;
$$ language plpgsql security definer;

create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at();

create trigger update_regions_updated_at
  before update on public.cultural_regions
  for each row execute procedure public.update_updated_at();

create trigger update_missions_updated_at
  before update on public.missions
  for each row execute procedure public.update_updated_at();

create trigger update_attempts_updated_at
  before update on public.mission_attempts
  for each row execute procedure public.update_updated_at();

create trigger update_progress_updated_at
  before update on public.player_progress
  for each row execute procedure public.update_updated_at();
