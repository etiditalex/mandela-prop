-- Podcast videos (admin-managed)
-- Apply this in Supabase SQL editor after `supabase/schema.sql`.

create table if not exists public.podcast_videos (
  id uuid primary key default gen_random_uuid(),
  title text,
  youtube_url text not null,
  youtube_id text,
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_podcast_videos_published_at on public.podcast_videos(published_at desc);

alter table public.podcast_videos enable row level security;

drop policy if exists "podcast_videos_public_read_published" on public.podcast_videos;
create policy "podcast_videos_public_read_published"
on public.podcast_videos
for select
to anon, authenticated
using (published_at is not null);

drop policy if exists "podcast_videos_staff_manage" on public.podcast_videos;
create policy "podcast_videos_staff_manage"
on public.podcast_videos
for all
to authenticated
using (public.current_user_role() in ('agent', 'admin'))
with check (public.current_user_role() in ('agent', 'admin'));

