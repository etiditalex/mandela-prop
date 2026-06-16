-- Run once in Supabase SQL editor if land sizes like "50*100" or "1 acre" fail with
-- "invalid input syntax for type numeric" or "operator does not exist: text >= numeric".
do $$
declare
  constraint_row record;
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'properties'
      and column_name = 'size'
      and data_type <> 'text'
  ) then
    raise notice 'properties.size is already text — no migration needed.';
    return;
  end if;

  -- Legacy databases often have `check (size >= 0)` on a numeric column.
  -- Drop those first or PostgreSQL cannot cast size to text.
  for constraint_row in
    select c.conname
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'properties'
      and c.contype = 'c'
      and pg_get_constraintdef(c.oid) ilike '%size%'
  loop
    execute format(
      'alter table public.properties drop constraint if exists %I',
      constraint_row.conname
    );
  end loop;

  alter table public.properties
    alter column size type text using size::text;

  alter table public.properties
    alter column size set not null;
end $$;
