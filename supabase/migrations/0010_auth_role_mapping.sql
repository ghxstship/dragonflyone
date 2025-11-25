-- 0010_auth_role_mapping.sql
-- Map platform roles to Supabase Auth claims and ensure user bootstrap

create or replace function public.ensure_primary_organization()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org uuid;
begin
  select id into v_org from organizations where slug = 'ghxstship-industries' limit 1;
  if v_org is null then
    insert into organizations (slug, name)
    values ('ghxstship-industries','GHXSTSHIP Industries')
    returning id into v_org;
  end if;
  return v_org;
end;
$$;

create or replace function public.refresh_user_role_claims(p_auth_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_claims jsonb;
  v_highest text;
begin
  if p_auth_user_id is null then
    return;
  end if;
  v_claims := public.get_user_role_claims(p_auth_user_id);
  v_highest := public.get_highest_platform_role(p_auth_user_id);

  update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object(
    'app_role', coalesce(v_highest, 'ATLVS_VIEWER'),
    'role_claims', v_claims
  )
  where id = p_auth_user_id;
end;
$$;

create or replace function public.handle_auth_user_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org uuid := public.ensure_primary_organization();
  v_platform_user_id uuid;
  v_full_name text;
begin
  v_full_name := coalesce(new.raw_user_meta_data ->> 'full_name', new.email);

  insert into platform_users (auth_user_id, organization_id, email, full_name)
  values (new.id, v_org, new.email, v_full_name)
  on conflict (auth_user_id) do update
    set organization_id = excluded.organization_id,
        email = excluded.email,
        full_name = excluded.full_name
  returning id into v_platform_user_id;

  insert into user_roles (platform_user_id, organization_id, role_code)
  values (v_platform_user_id, v_org, 'ATLVS_VIEWER')
  on conflict do nothing;

  perform public.refresh_user_role_claims(new.id);

  return new;
end;
$$;

create or replace function public.handle_platform_user_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_auth_user_id uuid;
begin
  v_auth_user_id := coalesce(
    (select auth_user_id from platform_users where id = coalesce(new.platform_user_id, old.platform_user_id)),
    null
  );
  perform public.refresh_user_role_claims(v_auth_user_id);
  if TG_OP = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create or replace function public.handle_event_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_auth_user_id uuid;
begin
  v_auth_user_id := coalesce(
    (select auth_user_id from platform_users where id = coalesce(new.platform_user_id, old.platform_user_id)),
    null
  );
  perform public.refresh_user_role_claims(v_auth_user_id);
  if TG_OP = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_auth_user_insert();

create trigger on_user_roles_change
  after insert or update or delete on user_roles
  for each row execute function public.handle_platform_user_role_change();

create trigger on_event_roles_change
  after insert or update or delete on event_role_assignments
  for each row execute function public.handle_event_role_change();
