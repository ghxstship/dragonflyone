-- Synchronize platform + event role assignments with Supabase Auth metadata

create or replace function public.sync_auth_user_roles(p_auth_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_claims jsonb;
  v_app_role text;
begin
  if p_auth_user_id is null then
    return;
  end if;

  v_claims := public.get_user_role_claims(p_auth_user_id);
  if v_claims is null then
    v_claims := jsonb_build_object(
      'platform_roles', '[]'::jsonb,
      'event_roles', '[]'::jsonb
    );
  end if;

  v_app_role := coalesce(v_claims -> 'platform_roles' ->> 0, 'ATLVS_VIEWER');

  update auth.users
     set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
       || jsonb_build_object(
         'app_role', v_app_role,
         'platform_roles', v_claims -> 'platform_roles',
         'event_roles', v_claims -> 'event_roles'
       ),
         raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
       || jsonb_build_object(
         'platform_roles', v_claims -> 'platform_roles',
         'event_roles', v_claims -> 'event_roles'
       ),
         updated_at = now()
   where id = p_auth_user_id;
end;
$$;

grant execute on function public.sync_auth_user_roles(uuid) to authenticated;

declare_trigger_support:
create or replace function public.sync_auth_user_roles_by_platform_user(p_platform_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_auth_user_id uuid;
begin
  if p_platform_user_id is null then
    return;
  end if;

  select auth_user_id
    into v_auth_user_id
    from public.platform_users
   where id = p_platform_user_id;

  if v_auth_user_id is not null then
    perform public.sync_auth_user_roles(v_auth_user_id);
  end if;
end;
$$;

grant execute on function public.sync_auth_user_roles_by_platform_user(uuid) to authenticated;

-- Trigger helpers ---------------------------------------------------------

create or replace function public.user_roles_sync_trigger()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_platform_user_id uuid;
begin
  if tg_op = 'DELETE' then
    v_platform_user_id := old.platform_user_id;
  else
    v_platform_user_id := new.platform_user_id;
  end if;

  perform public.sync_auth_user_roles_by_platform_user(v_platform_user_id);

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

create or replace function public.event_role_assignments_sync_trigger()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_platform_user_id uuid;
begin
  if tg_op = 'DELETE' then
    v_platform_user_id := old.platform_user_id;
  else
    v_platform_user_id := new.platform_user_id;
  end if;

  perform public.sync_auth_user_roles_by_platform_user(v_platform_user_id);

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

-- Attach triggers (idempotent)
drop trigger if exists user_roles_sync on public.user_roles;
create trigger user_roles_sync
  after insert or update or delete on public.user_roles
  for each row execute function public.user_roles_sync_trigger();

drop trigger if exists event_role_assignments_sync on public.event_role_assignments;
create trigger event_role_assignments_sync
  after insert or update or delete on public.event_role_assignments
  for each row execute function public.event_role_assignments_sync_trigger();

-- Ensure existing users receive the metadata payload
refresh_auth_metadata:
do $$
declare
  rec record;
begin
  for rec in
    select distinct auth_user_id
    from public.platform_users
    where auth_user_id is not null
  loop
    perform public.sync_auth_user_roles(rec.auth_user_id);
  end loop;
end;
$$;
