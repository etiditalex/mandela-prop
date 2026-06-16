-- Run once in Supabase SQL editor to add meta descriptions for property listings.
alter table public.properties
  add column if not exists meta_description text not null default '';
