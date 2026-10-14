-- Homepage hero and Karim portfolio (admin-managed)
-- Apply this in the Supabase SQL editor after `supabase/schema.sql`.

create table if not exists public.homepage_hero_settings (
  id int primary key default 1 check (id = 1),
  headline text not null,
  accent text not null default '',
  supporting_text text not null,
  cta_label text not null,
  cta_href text not null default '/properties',
  updated_at timestamptz not null default now()
);

create table if not exists public.homepage_hero_slides (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  alt text not null,
  sort_order int not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_homepage_hero_slides_order
  on public.homepage_hero_slides (sort_order asc, created_at asc);

create table if not exists public.homepage_portfolio_settings (
  id int primary key default 1 check (id = 1),
  heading text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.homepage_portfolio_items (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  title text not null,
  description text not null,
  image_url text not null,
  alt text not null,
  sort_order int not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_homepage_portfolio_items_order
  on public.homepage_portfolio_items (sort_order asc, created_at asc);

alter table public.homepage_hero_settings enable row level security;
alter table public.homepage_hero_slides enable row level security;
alter table public.homepage_portfolio_settings enable row level security;
alter table public.homepage_portfolio_items enable row level security;

drop policy if exists "homepage_hero_settings_public_read" on public.homepage_hero_settings;
create policy "homepage_hero_settings_public_read"
on public.homepage_hero_settings
for select
to anon, authenticated
using (true);

drop policy if exists "homepage_hero_settings_staff_manage" on public.homepage_hero_settings;
create policy "homepage_hero_settings_staff_manage"
on public.homepage_hero_settings
for all
to authenticated
using (public.current_user_role() in ('agent', 'admin'))
with check (public.current_user_role() in ('agent', 'admin'));

drop policy if exists "homepage_hero_slides_public_read_published" on public.homepage_hero_slides;
create policy "homepage_hero_slides_public_read_published"
on public.homepage_hero_slides
for select
to anon, authenticated
using (published_at is not null);

drop policy if exists "homepage_hero_slides_staff_manage" on public.homepage_hero_slides;
create policy "homepage_hero_slides_staff_manage"
on public.homepage_hero_slides
for all
to authenticated
using (public.current_user_role() in ('agent', 'admin'))
with check (public.current_user_role() in ('agent', 'admin'));

drop policy if exists "homepage_portfolio_settings_public_read" on public.homepage_portfolio_settings;
create policy "homepage_portfolio_settings_public_read"
on public.homepage_portfolio_settings
for select
to anon, authenticated
using (true);

drop policy if exists "homepage_portfolio_settings_staff_manage" on public.homepage_portfolio_settings;
create policy "homepage_portfolio_settings_staff_manage"
on public.homepage_portfolio_settings
for all
to authenticated
using (public.current_user_role() in ('agent', 'admin'))
with check (public.current_user_role() in ('agent', 'admin'));

drop policy if exists "homepage_portfolio_items_public_read_published" on public.homepage_portfolio_items;
create policy "homepage_portfolio_items_public_read_published"
on public.homepage_portfolio_items
for select
to anon, authenticated
using (published_at is not null);

drop policy if exists "homepage_portfolio_items_staff_manage" on public.homepage_portfolio_items;
create policy "homepage_portfolio_items_staff_manage"
on public.homepage_portfolio_items
for all
to authenticated
using (public.current_user_role() in ('agent', 'admin'))
with check (public.current_user_role() in ('agent', 'admin'));

create or replace function public.set_homepage_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_homepage_hero_settings_updated_at on public.homepage_hero_settings;
create trigger trg_homepage_hero_settings_updated_at
before update on public.homepage_hero_settings
for each row execute function public.set_homepage_updated_at();

drop trigger if exists trg_homepage_hero_slides_updated_at on public.homepage_hero_slides;
create trigger trg_homepage_hero_slides_updated_at
before update on public.homepage_hero_slides
for each row execute function public.set_homepage_updated_at();

drop trigger if exists trg_homepage_portfolio_settings_updated_at on public.homepage_portfolio_settings;
create trigger trg_homepage_portfolio_settings_updated_at
before update on public.homepage_portfolio_settings
for each row execute function public.set_homepage_updated_at();

drop trigger if exists trg_homepage_portfolio_items_updated_at on public.homepage_portfolio_items;
create trigger trg_homepage_portfolio_items_updated_at
before update on public.homepage_portfolio_items
for each row execute function public.set_homepage_updated_at();

insert into public.homepage_hero_settings (id, headline, accent, supporting_text, cta_label, cta_href)
values (
  1,
  'Coastal''s Gateway to',
  'Premium Real Estate',
  'Curated homes, land, and investment opportunities with trusted guidance and a seamless search experience tailored to you.',
  'Discover More',
  '/properties'
)
on conflict (id) do nothing;

insert into public.homepage_portfolio_settings (id, heading)
values (1, 'Karim Real Estate Portfolio')
on conflict (id) do nothing;

insert into public.homepage_hero_slides (image_url, alt, sort_order, published_at)
select * from (
  values
    ('https://res.cloudinary.com/dyfnobo9r/image/upload/f_auto,q_auto,w_2000/v1781594394/land_for_sale_-home_page_tjwng5.jpg', 'Green land with luxury homes', 0, now()),
    ('https://res.cloudinary.com/dyfnobo9r/image/upload/f_auto,q_auto,w_2000/v1776850166/properties_e0kxhw.jpg', 'Karim property portfolio', 1, now()),
    ('https://res.cloudinary.com/dyfnobo9r/image/upload/f_auto,q_auto,w_2000/v1777712579/apartment_vpzfn3.jpg', 'Apartment residence', 2, now()),
    ('https://res.cloudinary.com/dyfnobo9r/image/upload/f_auto,q_auto,w_2000/v1776763528/mandela_2_xvktej.jpg', 'Karim real estate', 3, now())
) as seed(image_url, alt, sort_order, published_at)
where not exists (select 1 from public.homepage_hero_slides);

insert into public.homepage_portfolio_items (label, title, description, image_url, alt, sort_order, published_at)
select * from (
  values
    (
      'Advisory',
      'Real Estate Due Diligence',
      'Structured reviews of title, compliance, and physical condition so you can transact with clarity. We ensure your investment is sound with comprehensive real estate due diligence, covering every detail from legal checks to property inspections and risk analysis.',
      'https://res.cloudinary.com/dyfnobo9r/image/upload/f_auto,q_auto,w_1200/v1776850166/properties_e0kxhw.jpg',
      'Karim property portfolio',
      0,
      now()
    ),
    (
      'Investments',
      'Portfolio Services',
      'Acquisition, disposition, and balance-sheet planning aligned to your growth and risk targets. We optimize and grow your investments with tailored real estate portfolio services designed to maximize returns and minimize risk.',
      'https://res.cloudinary.com/dyfnobo9r/image/upload/f_auto,q_auto,w_1200/v1777712579/apartment_vpzfn3.jpg',
      'Apartment residence',
      1,
      now()
    ),
    (
      'Research',
      'Real Estate Market Studies',
      'Demand drivers, pricing trends, and submarket benchmarks tailored to institutional and private clients. Real estate market studies provide in-depth insights into pricing, demand trends, development activity, and neighborhood dynamics.',
      'https://res.cloudinary.com/dyfnobo9r/image/upload/f_auto,q_auto,w_1200/v1781594394/land_for_sale_-home_page_tjwng5.jpg',
      'Green land with luxury homes',
      2,
      now()
    ),
    (
      'Advisory',
      'Real Estate Valuation Services',
      'Independent, evidence-backed opinions of value for financing, reporting, and negotiation support.',
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
      'Real estate advisory meeting',
      3,
      now()
    ),
    (
      'Portfolios',
      'Evaluating Large and Diverse Portfolios',
      'We consider each asset''s unique characteristics and market behavior. This approach supports confident decision-making, from asset mix and performance trends to neighborhood growth and liquidity.',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      'City buildings in the Karim portfolio',
      4,
      now()
    ),
    (
      'Analysis',
      'Single-Property Analysis',
      'We assess each property in depth to uncover opportunities, risks, and actions that improve long-term value. Location, demand, pricing, and financial performance back every recommendation.',
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
      'Residential street in a Karim market study',
      5,
      now()
    )
) as seed(label, title, description, image_url, alt, sort_order, published_at)
where not exists (select 1 from public.homepage_portfolio_items);
