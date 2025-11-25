-- 0012_rls_full_coverage.sql
-- Enforce RLS across all public tables and add guard rails for newly added tables

DO $$
DECLARE
  rec record;
BEGIN
  FOR rec IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename NOT LIKE 'pg_%'
      AND tablename NOT LIKE 'sql_%'
  LOOP
    EXECUTE format('alter table public.%I enable row level security', rec.tablename);
  END LOOP;
END $$;

create or replace function public.ensure_rls_enabled()
returns void
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  missing_rls text[] := array(select tablename from pg_tables where schemaname = 'public' and rowsecurity = false);
begin
  if coalesce(array_length(missing_rls, 1), 0) > 0 then
    raise exception 'Tables missing RLS: %', missing_rls;
  end if;
end;
$$;

comment on function public.ensure_rls_enabled is 'utility check invoked by CI to ensure every public table has RLS enabled';
