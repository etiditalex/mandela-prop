-- Run this once in Supabase SQL editor to bootstrap staff access.
-- Replace each email with your real staff account email address.

update public.profiles
set role = 'admin'
where email in (
  'admin@example.com'
);

-- Optional: promote additional staff accounts to agent.
update public.profiles
set role = 'agent'
where email in (
  'agent@example.com'
);
