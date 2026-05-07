-- Extensions
create extension if not exists "pgcrypto";

-- Enums
do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin', 'agent', 'client');
  end if;
  if not exists (select 1 from pg_type where typname = 'property_status') then
    create type public.property_status as enum ('available', 'sold', 'rented');
  end if;
  if not exists (select 1 from pg_type where typname = 'listing_kind') then
    create type public.listing_kind as enum ('sale', 'rent');
  end if;
  if not exists (select 1 from pg_type where typname = 'lead_intent') then
    create type public.lead_intent as enum ('sell', 'let');
  end if;
  if not exists (select 1 from pg_type where typname = 'lead_status') then
    create type public.lead_status as enum ('new', 'contacted', 'closed');
  end if;
end $$;

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  phone text,
  role public.app_role not null default 'client',
  created_at timestamptz not null default now()
);

-- Properties
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  price numeric(14,2) not null check (price >= 0),
  location text not null,
  property_type text not null,
  bedrooms integer not null default 0 check (bedrooms >= 0),
  bathrooms integer not null default 0 check (bathrooms >= 0),
  size text not null,
  listing_kind public.listing_kind not null default 'sale',
  status public.property_status not null default 'available',
  agent_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

-- Backfill/migrate existing databases where `properties` already exists.
alter table public.properties
  add column if not exists listing_kind public.listing_kind not null default 'sale';

-- Property Images
create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  image_url text not null,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

-- Saved Properties
create table if not exists public.saved_properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, property_id)
);

-- Inquiries
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  message text not null check (char_length(message) >= 10),
  created_at timestamptz not null default now()
);

-- Sell / Let leads (agents can submit property leads)
create table if not exists public.listing_leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  intent public.lead_intent not null,
  title text not null,
  location text not null,
  property_type text not null,
  bedrooms integer not null default 0 check (bedrooms >= 0),
  bathrooms integer not null default 0 check (bathrooms >= 0),
  price numeric(14,2) not null default 0 check (price >= 0),
  message text,
  status public.lead_status not null default 'new',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_properties_status on public.properties(status);
create index if not exists idx_properties_listing_kind on public.properties(listing_kind);
create index if not exists idx_properties_agent_id on public.properties(agent_id);
create index if not exists idx_properties_location on public.properties(location);
create index if not exists idx_property_images_property_id on public.property_images(property_id);
create index if not exists idx_saved_properties_user_id on public.saved_properties(user_id);
create index if not exists idx_inquiries_property_id on public.inquiries(property_id);
create index if not exists idx_listing_leads_status on public.listing_leads(status);
create index if not exists idx_listing_leads_created_at on public.listing_leads(created_at);

-- Helper function to fetch current user role
create or replace function public.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid()),
    'client'::public.app_role
  )
$$;

-- Create profile automatically on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(
      nullif(coalesce(new.raw_user_meta_data->>'full_name', ''), ''),
      nullif(split_part(new.email, '@', 1), ''),
      'User'
    ),
    new.email,
    'client'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Storage bucket
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.saved_properties enable row level security;
alter table public.inquiries enable row level security;
alter table public.listing_leads enable row level security;

-- Profiles policies
drop policy if exists "profiles_public_agent_view" on public.profiles;
create policy "profiles_public_agent_view"
on public.profiles
for select
to anon, authenticated
using (role = 'agent');

drop policy if exists "profiles_self_view" on public.profiles;
create policy "profiles_self_view"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all"
on public.profiles
for all
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

-- Properties policies
drop policy if exists "properties_public_available_read" on public.properties;
create policy "properties_public_available_read"
on public.properties
for select
to anon, authenticated
using (status = 'available');

drop policy if exists "properties_agent_manage_own" on public.properties;
create policy "properties_agent_manage_own"
on public.properties
for all
to authenticated
using (agent_id = auth.uid())
with check (agent_id = auth.uid());

drop policy if exists "properties_admin_all" on public.properties;
create policy "properties_admin_all"
on public.properties
for all
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

-- Property images policies
drop policy if exists "property_images_public_read" on public.property_images;
create policy "property_images_public_read"
on public.property_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.properties p
    where p.id = property_images.property_id
      and p.status = 'available'
  )
);

drop policy if exists "property_images_agent_manage_own_property" on public.property_images;
create policy "property_images_agent_manage_own_property"
on public.property_images
for all
to authenticated
using (
  exists (
    select 1
    from public.properties p
    where p.id = property_images.property_id
      and p.agent_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.properties p
    where p.id = property_images.property_id
      and p.agent_id = auth.uid()
  )
);

drop policy if exists "property_images_admin_all" on public.property_images;
create policy "property_images_admin_all"
on public.property_images
for all
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

-- Saved properties policies
drop policy if exists "saved_properties_own_read" on public.saved_properties;
create policy "saved_properties_own_read"
on public.saved_properties
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "saved_properties_own_insert" on public.saved_properties;
create policy "saved_properties_own_insert"
on public.saved_properties
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "saved_properties_own_delete" on public.saved_properties;
create policy "saved_properties_own_delete"
on public.saved_properties
for delete
to authenticated
using (user_id = auth.uid());

-- Inquiries policies
drop policy if exists "inquiries_own_insert" on public.inquiries;
create policy "inquiries_own_insert"
on public.inquiries
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "inquiries_own_read" on public.inquiries;
create policy "inquiries_own_read"
on public.inquiries
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "inquiries_agent_read_own_property" on public.inquiries;
create policy "inquiries_agent_read_own_property"
on public.inquiries
for select
to authenticated
using (
  exists (
    select 1
    from public.properties p
    where p.id = inquiries.property_id
      and p.agent_id = auth.uid()
  )
);

drop policy if exists "inquiries_admin_all" on public.inquiries;
create policy "inquiries_admin_all"
on public.inquiries
for all
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

-- Listing leads policies
drop policy if exists "listing_leads_public_insert" on public.listing_leads;
create policy "listing_leads_public_insert"
on public.listing_leads
for insert
to anon, authenticated
with check (true);

drop policy if exists "listing_leads_agent_admin_read" on public.listing_leads;
create policy "listing_leads_agent_admin_read"
on public.listing_leads
for select
to authenticated
using (public.current_user_role() in ('agent', 'admin'));

drop policy if exists "listing_leads_admin_update" on public.listing_leads;
create policy "listing_leads_admin_update"
on public.listing_leads
for update
to authenticated
using (public.current_user_role() in ('agent', 'admin'))
with check (public.current_user_role() in ('agent', 'admin'));

-- Storage policies
drop policy if exists "property_images_public_download" on storage.objects;
create policy "property_images_public_download"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'property-images');

drop policy if exists "property_images_agent_upload" on storage.objects;
create policy "property_images_agent_upload"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'property-images'
  and public.current_user_role() in ('agent', 'admin')
);

drop policy if exists "property_images_agent_update" on storage.objects;
create policy "property_images_agent_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'property-images'
  and public.current_user_role() in ('agent', 'admin')
);

drop policy if exists "property_images_agent_delete" on storage.objects;
create policy "property_images_agent_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'property-images'
  and public.current_user_role() in ('agent', 'admin')
);
