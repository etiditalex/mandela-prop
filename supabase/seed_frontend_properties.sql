-- Seed frontend property listings into Supabase so they appear in admin inventory.
-- Run this once in Supabase SQL Editor.
-- Safe to rerun: properties are upserted by slug; images are inserted only if missing.

do $$
begin
  if not exists (select 1 from public.profiles) then
    raise exception 'No profiles found. Create at least one user account first, then rerun this seed.';
  end if;
end
$$;

with owner_user as (
  select id
  from public.profiles
  where role in ('admin', 'agent')
  order by created_at asc
  limit 1
),
fallback_user as (
  select id
  from public.profiles
  order by created_at asc
  limit 1
),
seed_owner as (
  select id from owner_user
  union all
  select id from fallback_user
  where not exists (select 1 from owner_user)
),
seed_properties as (
  select *
  from (
    values
      (
        'Nairobi Skyline Penthouse',
        'nairobi-skyline-penthouse',
        'A double-level penthouse with private terrace views, curated interior finishes, and concierge-grade lifestyle amenities.',
        245000::numeric,
        'Westlands, Nairobi',
        'Penthouse',
        4,
        4,
        3850::numeric
      ),
      (
        'Karen Garden Villa',
        'karen-garden-villa',
        'An elegant villa in a serene gated enclave with mature gardens, expansive entertaining spaces, and private study wings.',
        320000::numeric,
        'Karen, Nairobi',
        'Villa',
        5,
        6,
        5200::numeric
      ),
      (
        'Riverside Executive Apartment',
        'riverside-executive-apartment',
        'A refined residence designed for urban professionals, balancing convenience with premium modern finishes.',
        148000::numeric,
        'Riverside, Nairobi',
        'Apartment',
        3,
        3,
        2150::numeric
      ),
      (
        'Lavington Signature Townhouse',
        'lavington-signature-townhouse',
        'A signature townhouse with curated finishes, private courtyard, and proximity to schools, retail, and social hubs.',
        198000::numeric,
        'Lavington, Nairobi',
        'Townhouse',
        4,
        4,
        3050::numeric
      ),
      (
        'Gigiri Diplomatic Residence',
        'gigiri-diplomatic-residence',
        'A diplomatic-grade residence with grand reception spaces, secure perimeter design, and discreet luxury detailing.',
        410000::numeric,
        'Gigiri, Nairobi',
        'Villa',
        6,
        7,
        6400::numeric
      ),
      (
        'Kilimani Modern Loft',
        'kilimani-modern-loft',
        'A modern loft aesthetic with polished finishes, abundant natural light, and close access to premium social amenities.',
        126000::numeric,
        'Kilimani, Nairobi',
        'Apartment',
        2,
        2,
        1520::numeric
      )
  ) as t(title, slug, description, price, location, property_type, bedrooms, bathrooms, size)
),
upserted as (
  insert into public.properties (
    title, slug, description, price, location, property_type,
    bedrooms, bathrooms, size, status, agent_id
  )
  select
    p.title, p.slug, p.description, p.price, p.location, p.property_type,
    p.bedrooms, p.bathrooms, p.size, 'available'::public.property_status, s.id
  from seed_properties p
  cross join seed_owner s
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    price = excluded.price,
    location = excluded.location,
    property_type = excluded.property_type,
    bedrooms = excluded.bedrooms,
    bathrooms = excluded.bathrooms,
    size = excluded.size
  returning id, slug
),
seed_images as (
  select *
  from (
    values
      ('nairobi-skyline-penthouse', 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80', true),
      ('nairobi-skyline-penthouse', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80', false),
      ('nairobi-skyline-penthouse', 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80', false),
      ('nairobi-skyline-penthouse', 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80', false),

      ('karen-garden-villa', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80', true),
      ('karen-garden-villa', 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80', false),
      ('karen-garden-villa', 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80', false),
      ('karen-garden-villa', 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=1200&q=80', false),

      ('riverside-executive-apartment', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80', true),
      ('riverside-executive-apartment', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80', false),
      ('riverside-executive-apartment', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', false),
      ('riverside-executive-apartment', 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1200&q=80', false),

      ('lavington-signature-townhouse', 'https://images.unsplash.com/photo-1617104551722-3b2d51366400?auto=format&fit=crop&w=1200&q=80', true),
      ('lavington-signature-townhouse', 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1200&q=80', false),
      ('lavington-signature-townhouse', 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1200&q=80', false),
      ('lavington-signature-townhouse', 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1200&q=80', false),

      ('gigiri-diplomatic-residence', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80', true),
      ('gigiri-diplomatic-residence', 'https://images.unsplash.com/photo-1599423300746-b62533397364?auto=format&fit=crop&w=1200&q=80', false),
      ('gigiri-diplomatic-residence', 'https://images.unsplash.com/photo-1584738766473-61c083514bf4?auto=format&fit=crop&w=1200&q=80', false),
      ('gigiri-diplomatic-residence', 'https://images.unsplash.com/photo-1618219740975-d40978bb7378?auto=format&fit=crop&w=1200&q=80', false),

      ('kilimani-modern-loft', 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1200&q=80', true),
      ('kilimani-modern-loft', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80', false),
      ('kilimani-modern-loft', 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb3?auto=format&fit=crop&w=1200&q=80', false),
      ('kilimani-modern-loft', 'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=1200&q=80', false)
  ) as t(slug, image_url, is_primary)
)
insert into public.property_images (property_id, image_url, is_primary)
select p.id, i.image_url, i.is_primary
from seed_images i
join public.properties p on p.slug = i.slug
where not exists (
  select 1
  from public.property_images existing
  where existing.property_id = p.id
    and existing.image_url = i.image_url
);
