-- Newsroom / Updates (admin-managed posts)
-- Apply this in Supabase SQL editor after `supabase/schema.sql`.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'news_update_kind') then
    create type public.news_update_kind as enum ('blog', 'property');
  end if;
end $$;

create table if not exists public.news_updates (
  id uuid primary key default gen_random_uuid(),
  kind public.news_update_kind not null default 'blog',
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  cover_image_url text,
  related_property_id uuid references public.properties(id) on delete set null,
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_news_updates_published_at on public.news_updates(published_at desc);
create index if not exists idx_news_updates_kind on public.news_updates(kind);

alter table public.news_updates enable row level security;

drop policy if exists "news_updates_public_read_published" on public.news_updates;
create policy "news_updates_public_read_published"
on public.news_updates
for select
to anon, authenticated
using (published_at is not null);

drop policy if exists "news_updates_staff_manage" on public.news_updates;
create policy "news_updates_staff_manage"
on public.news_updates
for all
to authenticated
using (public.current_user_role() in ('agent', 'admin'))
with check (public.current_user_role() in ('agent', 'admin'));

create or replace function public.set_news_updates_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_news_updates_updated_at on public.news_updates;
create trigger trg_news_updates_updated_at
before update on public.news_updates
for each row execute function public.set_news_updates_updated_at();

