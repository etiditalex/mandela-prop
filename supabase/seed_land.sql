-- Seed sample land listings into the existing properties table.
-- This script uses the first available agent/admin profile as agent_id.

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
    raise notice 'No agent or admin profile found. Create one before running seed_land.sql.';
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
      'Nakuru Greenbelt Farm Estate',
      'nakuru-greenbelt-farm-estate',
      'Expansive agricultural land with fertile soils, road access, and reliable water availability for farming and agribusiness.',
      185000,
      'Nakuru',
      'Agricultural Land',
      0,
      0,
      540000,
      'available',
      selected_agent_id
    ),
    (
      'Athi River Logistics Park Plot',
      'athi-river-logistics-park-plot',
      'Industrial land positioned near key transport corridors and suited for warehousing, logistics, and light manufacturing.',
      265000,
      'Athi River',
      'Industrial Land',
      0,
      0,
      325000,
      'available',
      selected_agent_id
    ),
    (
      'Kitengela Garden Residential Plots',
      'kitengela-garden-residential-plots',
      'Serviced residential land ideal for gated community development and private home construction in a fast-growing area.',
      94000,
      'Kitengela',
      'Residential Land',
      0,
      0,
      98000,
      'available',
      selected_agent_id
    ),
    (
      'Mombasa Road Commercial Corner Plot',
      'mombasa-road-commercial-corner-plot',
      'High-visibility commercial land with strong frontage and strategic positioning for mixed-use or retail development.',
      315000,
      'Mombasa Road, Nairobi',
      'Commercial Land',
      0,
      0,
      87000,
      'available',
      selected_agent_id
    )
  on conflict (slug) do nothing;

  insert into public.property_images (property_id, image_url, is_primary)
  select p.id, v.image_url, true
  from (
    values
      ('nakuru-greenbelt-farm-estate', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'),
      ('athi-river-logistics-park-plot', 'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1200&q=80'),
      ('kitengela-garden-residential-plots', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'),
      ('mombasa-road-commercial-corner-plot', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80')
  ) as v(slug, image_url)
  join public.properties p on p.slug = v.slug
  where not exists (
    select 1
    from public.property_images pi
    where pi.property_id = p.id
      and pi.image_url = v.image_url
  );

  raise notice 'Sample land listings inserted successfully.';
end $$;
