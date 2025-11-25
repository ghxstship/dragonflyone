-- 0008_security_controls.sql
-- MFA/session controls and impersonation audit trails

create table if not exists security_policy_config (
  id uuid primary key default gen_random_uuid(),
  mfa_required boolean not null default true,
  session_max_age_seconds integer not null default 3600,
  refresh_token_ttl_seconds integer not null default 86400,
  password_min_length integer not null default 14,
  password_require_special boolean not null default true,
  password_require_number boolean not null default true,
  password_require_uppercase boolean not null default true,
  updated_by uuid references platform_users(id) on delete set null,
  updated_at timestamptz not null default now()
);

insert into security_policy_config (id)
values (gen_random_uuid())
on conflict do nothing;

alter table security_policy_config enable row level security;

create policy security_policy_admin on security_policy_config
  for all using (role_in('LEGEND_SUPER_ADMIN','LEGEND_ADMIN','ATLVS_SUPER_ADMIN'))
  with check (role_in('LEGEND_SUPER_ADMIN','LEGEND_ADMIN','ATLVS_SUPER_ADMIN'));

create or replace function public.enforce_security_policy()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  cfg security_policy_config;
  claims jsonb := auth.jwt();
  issued_at bigint;
  exp_at bigint;
  now_epoch bigint := extract(epoch from now());
begin
  select * into cfg from security_policy_config limit 1;
  if cfg.mfa_required and coalesce(claims ->> 'amr','') = '' then
    raise exception 'MFA verification required';
  end if;

  issued_at := nullif(claims ->> 'iat','')::bigint;
  exp_at := nullif(claims ->> 'exp','')::bigint;

  if cfg.session_max_age_seconds is not null and issued_at is not null then
    if now_epoch - issued_at > cfg.session_max_age_seconds then
      raise exception 'Session lifetime exceeded';
    end if;
  end if;

  if cfg.refresh_token_ttl_seconds is not null and exp_at is not null then
    if exp_at - now_epoch > cfg.refresh_token_ttl_seconds then
      raise exception 'Refresh token lifetime exceeded';
    end if;
    if exp_at < now_epoch then
      raise exception 'Token expired';
    end if;
  end if;
end;
$$;

create or replace function public.require_mfa_claim()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.enforce_security_policy();
end;
$$;

create or replace function public.org_matches(p_org uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org uuid := current_organization_id();
begin
  perform public.enforce_security_policy();
  if current_app_role() like 'LEGEND_%' then
    return true;
  end if;
  if p_org is null then
    return v_org is null;
  end if;
  return v_org is not null and v_org = p_org;
end;
$$;

-- Impersonation permissions and sessions ------------------------------------------------

create table impersonation_permissions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  impersonator_platform_user_id uuid not null references platform_users(id) on delete cascade,
  target_platform_user_id uuid not null references platform_users(id) on delete cascade,
  granted_by uuid references platform_users(id) on delete set null,
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  unique (organization_id, impersonator_platform_user_id, target_platform_user_id)
);

create table impersonation_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete set null,
  impersonator_platform_user_id uuid not null references platform_users(id) on delete cascade,
  acting_platform_user_id uuid not null references platform_users(id) on delete cascade,
  permission_id uuid references impersonation_permissions(id) on delete set null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  context jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb
);

alter table impersonation_permissions enable row level security;
alter table impersonation_sessions enable row level security;

create policy impersonation_permissions_read on impersonation_permissions
  for select using (role_in('LEGEND_SUPER_ADMIN','LEGEND_ADMIN','LEGEND_SUPPORT','ATLVS_SUPER_ADMIN'));

create policy impersonation_permissions_manage on impersonation_permissions
  for all using (role_in('LEGEND_SUPER_ADMIN','LEGEND_ADMIN','LEGEND_SUPPORT','ATLVS_SUPER_ADMIN'))
  with check (role_in('LEGEND_SUPER_ADMIN','LEGEND_ADMIN','LEGEND_SUPPORT','ATLVS_SUPER_ADMIN'));

create policy impersonation_sessions_read on impersonation_sessions
  for select using (
    role_in('LEGEND_SUPER_ADMIN','LEGEND_ADMIN','LEGEND_SUPPORT','ATLVS_SUPER_ADMIN')
    or org_matches(organization_id)
  );

create policy impersonation_sessions_manage on impersonation_sessions
  for all using (
    role_in('LEGEND_SUPER_ADMIN','LEGEND_ADMIN','LEGEND_SUPPORT','ATLVS_SUPER_ADMIN')
    or org_matches(organization_id)
  )
  with check (
    role_in('LEGEND_SUPER_ADMIN','LEGEND_ADMIN','LEGEND_SUPPORT','ATLVS_SUPER_ADMIN')
    or org_matches(organization_id)
  );

create or replace function public.grant_impersonation_permission(
  p_target_auth_user uuid,
  p_expires_at timestamptz default null,
  p_reason text default null
)
returns impersonation_permissions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_impersonator uuid := current_platform_user_id();
  v_target uuid;
  v_org uuid := current_organization_id();
  v_perm impersonation_permissions;
begin
  if not role_in('LEGEND_SUPER_ADMIN','LEGEND_ADMIN','LEGEND_SUPPORT','ATLVS_SUPER_ADMIN') then
    raise exception 'Not authorized to grant impersonation';
  end if;
  if v_impersonator is null then
    raise exception 'Platform user required';
  end if;
  select id into v_target from platform_users where auth_user_id = p_target_auth_user limit 1;
  if v_target is null then
    raise exception 'Target user not found';
  end if;
  if v_org is null then
    select organization_id into v_org from platform_users where id = v_target limit 1;
  end if;
  insert into impersonation_permissions (
    organization_id,
    impersonator_platform_user_id,
    target_platform_user_id,
    granted_by,
    granted_at,
    expires_at,
    revoked_at,
    reason
  ) values (
    v_org,
    v_impersonator,
    v_target,
    v_impersonator,
    now(),
    coalesce(p_expires_at, now() + interval '4 hours'),
    null,
    p_reason
  )
  on conflict (organization_id, impersonator_platform_user_id, target_platform_user_id)
  do update set
    expires_at = excluded.expires_at,
    revoked_at = null,
    reason = excluded.reason,
    metadata = '{}'::jsonb,
    granted_at = now(),
    granted_by = excluded.granted_by
  returning * into v_perm;
  return v_perm;
end;
$$;

create or replace function public.revoke_impersonation_permission(
  p_target_auth_user uuid
)
returns impersonation_permissions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_impersonator uuid := current_platform_user_id();
  v_target uuid;
  v_perm impersonation_permissions;
begin
  if not role_in('LEGEND_SUPER_ADMIN','LEGEND_ADMIN','LEGEND_SUPPORT','ATLVS_SUPER_ADMIN') then
    raise exception 'Not authorized to revoke impersonation';
  end if;
  if v_impersonator is null then
    raise exception 'Platform user required';
  end if;
  select id into v_target from platform_users where auth_user_id = p_target_auth_user limit 1;
  if v_target is null then
    raise exception 'Target user not found';
  end if;
  update impersonation_permissions
  set revoked_at = now()
  where impersonator_platform_user_id = v_impersonator
    and target_platform_user_id = v_target
    and revoked_at is null
  returning * into v_perm;
  if not found then
    raise exception 'No active permission to revoke';
  end if;
  return v_perm;
end;
$$;

create or replace function public.log_impersonation_session(
  p_target_auth_user uuid,
  p_context jsonb default '{}'::jsonb
)
returns impersonation_sessions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_impersonator uuid := current_platform_user_id();
  v_target uuid;
  v_org uuid := current_organization_id();
  v_perm impersonation_permissions;
  v_session impersonation_sessions;
begin
  if v_impersonator is null then
    raise exception 'Platform user required';
  end if;
  select id into v_target from platform_users where auth_user_id = p_target_auth_user limit 1;
  if v_target is null then
    raise exception 'Target user not found';
  end if;

  if not role_in('LEGEND_INCOGNITO','LEGEND_SUPER_ADMIN') then
    select * into v_perm
    from impersonation_permissions
    where impersonator_platform_user_id = v_impersonator
      and target_platform_user_id = v_target
      and revoked_at is null
      and (expires_at is null or expires_at > now())
    order by granted_at desc
    limit 1;
    if not found then
      raise exception 'No active impersonation permission';
    end if;
  end if;

  if v_org is null then
    select organization_id into v_org from platform_users where id = v_target limit 1;
  end if;

  insert into impersonation_sessions (
    organization_id,
    impersonator_platform_user_id,
    acting_platform_user_id,
    permission_id,
    context
  ) values (
    v_org,
    v_impersonator,
    v_target,
    coalesce(v_perm.id, null),
    coalesce(p_context,'{}'::jsonb)
  ) returning * into v_session;

  return v_session;
end;
$$;

grant execute on function public.grant_impersonation_permission(uuid, timestamptz, text) to authenticated;
grant execute on function public.revoke_impersonation_permission(uuid) to authenticated;
grant execute on function public.log_impersonation_session(uuid, jsonb) to authenticated;
