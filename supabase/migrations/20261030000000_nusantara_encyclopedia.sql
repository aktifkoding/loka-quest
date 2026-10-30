-- Additive encyclopedia schema. Existing game/content tables remain unchanged.
create extension if not exists pg_trgm;

create table if not exists public.encyclopedia_categories (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  cover_image_url text,
  icon text not null default 'BookOpen',
  sort_order integer not null default 0,
  status text not null default 'published' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.encyclopedia_articles (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  title text not null,
  summary text not null,
  body text not null default '',
  background text,
  historical_context text,
  cultural_meaning text,
  characteristics text,
  social_function text,
  practices text,
  preservation text,
  verified_facts jsonb not null default '[]'::jsonb,
  alternative_names text[] not null default '{}',
  featured_image_url text,
  video_url text,
  status text not null default 'draft' check (status in ('draft','review','approved','published','archived')),
  featured boolean not null default false,
  author_id uuid references public.profiles(id) on delete set null,
  reviewed_by uuid references public.profiles(id) on delete set null,
  last_reviewed_at timestamptz,
  published_at timestamptz,
  seo_title text,
  seo_description text,
  search_document tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('indonesian', coalesce(summary, '')), 'B') ||
    setweight(to_tsvector('indonesian', coalesce(body, '')), 'C') ||
    setweight(to_tsvector('indonesian', coalesce(array_to_string(alternative_names, ' '), '')), 'B')
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.encyclopedia_article_categories (
  article_id uuid not null references public.encyclopedia_articles(id) on delete cascade,
  category_id uuid not null references public.encyclopedia_categories(id) on delete cascade,
  primary key (article_id, category_id)
);

create table if not exists public.encyclopedia_article_regions (
  article_id uuid not null references public.encyclopedia_articles(id) on delete cascade,
  region_id uuid not null references public.cultural_regions(id) on delete cascade,
  primary key (article_id, region_id)
);

create table if not exists public.encyclopedia_sources (
  id uuid primary key default uuid_generate_v4(),
  article_id uuid not null references public.encyclopedia_articles(id) on delete cascade,
  source_id uuid references public.cultural_sources(id) on delete set null,
  source_title text not null,
  publisher text,
  source_url text,
  source_type text not null default 'documented_fact' check (source_type in ('documented_fact','academic_interpretation','oral_tradition','community_perspective','contemporary_practice')),
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.encyclopedia_media (
  id uuid primary key default uuid_generate_v4(),
  article_id uuid not null references public.encyclopedia_articles(id) on delete cascade,
  title text not null,
  description text,
  media_type text not null check (media_type in ('image','illustration','audio','video','document')),
  storage_path text,
  external_url text,
  creator text,
  rights_holder text,
  license text,
  attribution text,
  permission_status text not null check (permission_status in ('verified_license','permission_granted','public_domain','external_reference','pending_review')),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  check (storage_path is not null or external_url is not null)
);

create table if not exists public.encyclopedia_related_articles (
  article_id uuid not null references public.encyclopedia_articles(id) on delete cascade,
  related_article_id uuid not null references public.encyclopedia_articles(id) on delete cascade,
  relation text not null default 'related_to',
  primary key (article_id, related_article_id),
  check (article_id <> related_article_id)
);

create table if not exists public.encyclopedia_article_missions (
  article_id uuid not null references public.encyclopedia_articles(id) on delete cascade,
  mission_id uuid not null references public.missions(id) on delete cascade,
  relation text not null default 'supports_learning',
  primary key (article_id, mission_id)
);

create table if not exists public.encyclopedia_bookmarks (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  article_id uuid not null references public.encyclopedia_articles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, article_id)
);

create table if not exists public.encyclopedia_collections (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  is_private boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.encyclopedia_collection_articles (
  collection_id uuid not null references public.encyclopedia_collections(id) on delete cascade,
  article_id uuid not null references public.encyclopedia_articles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (collection_id, article_id)
);

create table if not exists public.encyclopedia_reading_history (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  article_id uuid not null references public.encyclopedia_articles(id) on delete cascade,
  progress integer not null default 0 check (progress between 0 and 100),
  viewed_at timestamptz not null default now(),
  primary key (profile_id, article_id)
);

create table if not exists public.encyclopedia_editor_roles (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  editor_role text not null check (editor_role in ('content_administrator','cultural_editor','reviewer','contributor')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.encyclopedia_reviews (
  id uuid primary key default uuid_generate_v4(),
  article_id uuid not null references public.encyclopedia_articles(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  decision text not null check (decision in ('changes_requested','approved','rejected')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.encyclopedia_revisions (
  id uuid primary key default uuid_generate_v4(),
  article_id uuid not null references public.encyclopedia_articles(id) on delete cascade,
  editor_id uuid references public.profiles(id) on delete set null,
  revision jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_encyclopedia_articles_search on public.encyclopedia_articles using gin(search_document);
create index if not exists idx_encyclopedia_articles_status_published on public.encyclopedia_articles(status, published_at desc);
create index if not exists idx_encyclopedia_categories_status on public.encyclopedia_categories(status, sort_order);
create index if not exists idx_encyclopedia_sources_article on public.encyclopedia_sources(article_id, sort_order);
create index if not exists idx_encyclopedia_media_article on public.encyclopedia_media(article_id, status, sort_order);
create index if not exists idx_encyclopedia_bookmarks_profile on public.encyclopedia_bookmarks(profile_id, created_at desc);
create index if not exists idx_encyclopedia_history_profile on public.encyclopedia_reading_history(profile_id, viewed_at desc);
create index if not exists idx_encyclopedia_collections_profile on public.encyclopedia_collections(profile_id, created_at desc);

alter table public.encyclopedia_categories enable row level security;
alter table public.encyclopedia_articles enable row level security;
alter table public.encyclopedia_article_categories enable row level security;
alter table public.encyclopedia_article_regions enable row level security;
alter table public.encyclopedia_sources enable row level security;
alter table public.encyclopedia_media enable row level security;
alter table public.encyclopedia_related_articles enable row level security;
alter table public.encyclopedia_article_missions enable row level security;
alter table public.encyclopedia_bookmarks enable row level security;
alter table public.encyclopedia_collections enable row level security;
alter table public.encyclopedia_collection_articles enable row level security;
alter table public.encyclopedia_reading_history enable row level security;
alter table public.encyclopedia_editor_roles enable row level security;
alter table public.encyclopedia_reviews enable row level security;
alter table public.encyclopedia_revisions enable row level security;

create policy "Public can view published encyclopedia categories" on public.encyclopedia_categories for select using (status = 'published');
create policy "Admins manage encyclopedia categories" on public.encyclopedia_categories for all using (public.is_admin()) with check (public.is_admin());
create policy "Public can view published encyclopedia articles" on public.encyclopedia_articles for select using (status = 'published');
create policy "Editors manage encyclopedia articles" on public.encyclopedia_articles for all using (public.is_admin() or exists (select 1 from public.encyclopedia_editor_roles r where r.profile_id = auth.uid() and r.editor_role in ('content_administrator','cultural_editor','reviewer')) or (author_id = auth.uid() and exists (select 1 from public.encyclopedia_editor_roles r where r.profile_id = auth.uid() and r.editor_role = 'contributor'))) with check (public.is_admin() or exists (select 1 from public.encyclopedia_editor_roles r where r.profile_id = auth.uid() and r.editor_role in ('content_administrator','cultural_editor','reviewer')) or (author_id = auth.uid() and exists (select 1 from public.encyclopedia_editor_roles r where r.profile_id = auth.uid() and r.editor_role = 'contributor')));
create policy "Public can view published article categories" on public.encyclopedia_article_categories for select using (exists (select 1 from public.encyclopedia_articles a where a.id = article_id and a.status = 'published'));
create policy "Admins manage article categories" on public.encyclopedia_article_categories for all using (public.is_admin()) with check (public.is_admin());
create policy "Public can view published article regions" on public.encyclopedia_article_regions for select using (exists (select 1 from public.encyclopedia_articles a where a.id = article_id and a.status = 'published'));
create policy "Admins manage article regions" on public.encyclopedia_article_regions for all using (public.is_admin()) with check (public.is_admin());
create policy "Public can view published article sources" on public.encyclopedia_sources for select using (exists (select 1 from public.encyclopedia_articles a where a.id = article_id and a.status = 'published'));
create policy "Admins manage article sources" on public.encyclopedia_sources for all using (public.is_admin()) with check (public.is_admin());
create policy "Public can view published article media" on public.encyclopedia_media for select using (status = 'published' and exists (select 1 from public.encyclopedia_articles a where a.id = article_id and a.status = 'published'));
create policy "Admins manage article media" on public.encyclopedia_media for all using (public.is_admin()) with check (public.is_admin());
create policy "Public can view published related articles" on public.encyclopedia_related_articles for select using (exists (select 1 from public.encyclopedia_articles a where a.id = article_id and a.status = 'published') and exists (select 1 from public.encyclopedia_articles b where b.id = related_article_id and b.status = 'published'));
create policy "Admins manage related articles" on public.encyclopedia_related_articles for all using (public.is_admin()) with check (public.is_admin());
create policy "Public can view published article missions" on public.encyclopedia_article_missions for select using (exists (select 1 from public.encyclopedia_articles a where a.id = article_id and a.status = 'published') and exists (select 1 from public.missions m where m.id = mission_id and m.status = 'published'));
create policy "Admins manage article missions" on public.encyclopedia_article_missions for all using (public.is_admin()) with check (public.is_admin());
create policy "Users manage own encyclopedia bookmarks" on public.encyclopedia_bookmarks for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy "Users manage own encyclopedia collections" on public.encyclopedia_collections for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy "Users manage own collection articles" on public.encyclopedia_collection_articles for all using (exists (select 1 from public.encyclopedia_collections c where c.id = collection_id and c.profile_id = auth.uid())) with check (exists (select 1 from public.encyclopedia_collections c where c.id = collection_id and c.profile_id = auth.uid()));
create policy "Users manage own encyclopedia reading history" on public.encyclopedia_reading_history for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy "Users view own editor role" on public.encyclopedia_editor_roles for select using (profile_id = auth.uid() or public.is_admin());
create policy "Admins manage editor roles" on public.encyclopedia_editor_roles for all using (public.is_admin()) with check (public.is_admin());
create policy "Reviewers and admins manage reviews" on public.encyclopedia_reviews for all using (public.is_admin() or exists (select 1 from public.encyclopedia_editor_roles r where r.profile_id = auth.uid() and r.editor_role in ('content_administrator','reviewer'))) with check (public.is_admin() or exists (select 1 from public.encyclopedia_editor_roles r where r.profile_id = auth.uid() and r.editor_role in ('content_administrator','reviewer')));
create policy "Editors and admins view revisions" on public.encyclopedia_revisions for select using (public.is_admin() or exists (select 1 from public.encyclopedia_editor_roles r where r.profile_id = auth.uid()));
create policy "Editors create revisions" on public.encyclopedia_revisions for insert with check (editor_id = auth.uid() and (public.is_admin() or exists (select 1 from public.encyclopedia_editor_roles r where r.profile_id = auth.uid())));

create or replace function public.touch_encyclopedia_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
create trigger encyclopedia_categories_updated_at before update on public.encyclopedia_categories for each row execute procedure public.touch_encyclopedia_updated_at();
create trigger encyclopedia_articles_updated_at before update on public.encyclopedia_articles for each row execute procedure public.touch_encyclopedia_updated_at();
create trigger encyclopedia_collections_updated_at before update on public.encyclopedia_collections for each row execute procedure public.touch_encyclopedia_updated_at();

create or replace function public.can_edit_encyclopedia_article(target_article_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin()
    or exists (select 1 from public.encyclopedia_editor_roles r where r.profile_id = auth.uid() and r.editor_role in ('content_administrator','cultural_editor','reviewer'))
    or exists (select 1 from public.encyclopedia_articles a join public.encyclopedia_editor_roles r on r.profile_id = auth.uid() where a.id = target_article_id and a.author_id = auth.uid() and r.editor_role = 'contributor');
$$;
revoke execute on function public.can_edit_encyclopedia_article(uuid) from public;
grant execute on function public.can_edit_encyclopedia_article(uuid) to authenticated;

drop policy if exists "Editors manage encyclopedia articles" on public.encyclopedia_articles;
create policy "Editors manage encyclopedia articles" on public.encyclopedia_articles for all using (public.can_edit_encyclopedia_article(id)) with check (public.can_edit_encyclopedia_article(id));
drop policy if exists "Admins manage article categories" on public.encyclopedia_article_categories;
create policy "Editors manage article categories" on public.encyclopedia_article_categories for all using (public.can_edit_encyclopedia_article(article_id)) with check (public.can_edit_encyclopedia_article(article_id));
drop policy if exists "Admins manage article regions" on public.encyclopedia_article_regions;
create policy "Editors manage article regions" on public.encyclopedia_article_regions for all using (public.can_edit_encyclopedia_article(article_id)) with check (public.can_edit_encyclopedia_article(article_id));
drop policy if exists "Admins manage article sources" on public.encyclopedia_sources;
create policy "Editors manage article sources" on public.encyclopedia_sources for all using (public.can_edit_encyclopedia_article(article_id)) with check (public.can_edit_encyclopedia_article(article_id));
drop policy if exists "Admins manage article media" on public.encyclopedia_media;
create policy "Editors manage article media" on public.encyclopedia_media for all using (public.can_edit_encyclopedia_article(article_id)) with check (public.can_edit_encyclopedia_article(article_id));
drop policy if exists "Admins manage related articles" on public.encyclopedia_related_articles;
create policy "Editors manage related articles" on public.encyclopedia_related_articles for all using (public.can_edit_encyclopedia_article(article_id)) with check (public.can_edit_encyclopedia_article(article_id));
drop policy if exists "Admins manage article missions" on public.encyclopedia_article_missions;
create policy "Editors manage article missions" on public.encyclopedia_article_missions for all using (public.can_edit_encyclopedia_article(article_id)) with check (public.can_edit_encyclopedia_article(article_id));
