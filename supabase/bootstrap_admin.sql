-- Run this once in Supabase SQL editor to bootstrap staff access.
-- Replace each email with your real staff account email address.

update public.profiles
set role = 'admin'
where email in (
  'etiditalex@gmail.com'
);

-- Optional: promote additional staff accounts to agent.
-- Uncomment and add emails if needed.
-- update public.profiles
-- set role = 'agent'
-- where email in (
--   'agent@yourdomain.com'
-- );
