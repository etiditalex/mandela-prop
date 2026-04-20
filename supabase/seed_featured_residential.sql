-- Seed the three "Signature" residential listings (matches lib/properties featured set).
-- Run in Supabase SQL Editor after you have at least one agent/admin profile.
-- Then the homepage and /properties read real rows you can edit under /agent/properties.

do $$
declare
  selected_agent_id uuid;
begin
  select id
  into selected_agent_id
  from public.profiles
  where role in ('agent', 'admin')
  order by created_at asc
  limit 1;

  if selected_agent_id is null then
    raise notice 'No agent or admin profile found. Sign up and set role before running this seed.';
    return;
  end if;

  insert into public.properties (
    title,
    slug,
    description,
    price,
    location,
    property_type,
    bedrooms,
    bathrooms,
    size,
    status,
    agent_id
  )
  values
    (
      'Nairobi Skyline Penthouse',
      'nairobi-skyline-penthouse',
      'A double-level penthouse with private terrace views, curated interior finishes, and concierge-grade lifestyle amenities.',
      245000,
      'Westlands, Nairobi',
      'Penthouse',
      4,
      4,
      3850,
      'available',
      selected_agent_id
    ),
    (
      'Karen Garden Villa',
      'karen-garden-villa',
      'An elegant villa in a serene gated enclave with mature gardens, expansive entertaining spaces, and private study wings.',
      320000,
      'Karen, Nairobi',
      'Villa',
      5,
      6,
      5200,
      'available',
      selected_agent_id
    ),
    (
      'Riverside Executive Apartment',
      'riverside-executive-apartment',
      'A refined residence designed for urban professionals, balancing convenience with premium modern finishes.',
      148000,
      'Riverside, Nairobi',
      'Apartment',
      3,
      3,
      2150,
      'available',
      selected_agent_id
    )
  on conflict (slug) do nothing;

  insert into public.property_images (property_id, image_url, is_primary)
  select p.id, v.image_url, true
  from (
    values
      ('nairobi-skyline-penthouse', 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80'),
      ('karen-garden-villa', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80'),
      ('riverside-executive-apartment', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80')
  ) as v(slug, image_url)
  join public.properties p on p.slug = v.slug
  where not exists (
    select 1
    from public.property_images pi
    where pi.property_id = p.id
      and pi.image_url = v.image_url
  );

  raise notice 'Featured residential listings inserted (or already present).';
end $$;
