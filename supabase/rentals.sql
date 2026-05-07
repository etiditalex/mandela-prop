-- Rentals extensions (optional)
-- Apply this in Supabase SQL editor AFTER running `supabase/schema.sql`.
--
-- This keeps rentals inside `public.properties` (listing_kind = 'rent'),
-- but adds rental-specific fields like unit type + own compound.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'rental_unit_type') then
    create type public.rental_unit_type as enum (
      'ensuite',
      '1_bedroom',
      '2_bedrooms',
      '3_bedrooms',
      '4_bedrooms'
    );
  end if;
end $$;

alter table public.properties
  add column if not exists rental_unit_type public.rental_unit_type,
  add column if not exists own_compound boolean not null default false,
  add column if not exists rent_deposit numeric(14,2) check (rent_deposit is null or rent_deposit >= 0),
  add column if not exists available_from date,
  add column if not exists amenities text,
  add column if not exists furnished boolean not null default false;

create index if not exists idx_properties_rental_unit_type on public.properties(rental_unit_type);
create index if not exists idx_properties_own_compound on public.properties(own_compound);

