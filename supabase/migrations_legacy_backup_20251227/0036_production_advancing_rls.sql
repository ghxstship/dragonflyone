-- 0032_production_advancing_rls.sql
-- Row Level Security policies for Production Advancing

-- Enable RLS on all tables
alter table production_advancing_catalog enable row level security;
alter table production_advances enable row level security;
alter table production_advance_items enable row level security;

-- ============================================================================
-- CATALOG POLICIES (Global Read Access)
-- ============================================================================

-- Anyone authenticated can view the enabled catalog
create policy catalog_global_read on production_advancing_catalog
  for select 
  using (
    enabled = true
    and auth.role() = 'authenticated'
  );

-- Only super admins can manage catalog
create policy catalog_admin_manage on production_advancing_catalog
  for all 
  using (
    role_in('ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  )
  with check (
    role_in('ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

-- ============================================================================
-- PRODUCTION ADVANCES POLICIES
-- ============================================================================

-- COMPVSS team can view advances for their organization
create policy advances_compvss_select on production_advances
  for select
  using (
    org_matches(organization_id) 
    and role_in(
      'COMPVSS_TEAM_MEMBER',
      'COMPVSS_ADMIN',
      'COMPVSS_SUPER_ADMIN',
      'LEGEND_SUPER_ADMIN'
    )
  );

-- COMPVSS team can create advances for their organization
create policy advances_compvss_insert on production_advances
  for insert
  with check (
    org_matches(organization_id) 
    and role_in(
      'COMPVSS_TEAM_MEMBER',
      'COMPVSS_ADMIN',
      'COMPVSS_SUPER_ADMIN'
    )
    and submitter_id = current_platform_user_id()
  );

-- COMPVSS team can update their own advances (draft, cancel, fulfill)
create policy advances_compvss_update on production_advances
  for update
  using (
    org_matches(organization_id) 
    and role_in(
      'COMPVSS_TEAM_MEMBER',
      'COMPVSS_ADMIN',
      'COMPVSS_SUPER_ADMIN'
    )
    and (
      -- Can update own draft advances
      (submitter_id = current_platform_user_id() and status = 'draft')
      or
      -- Admins can update any advance for fulfillment
      (role_in('COMPVSS_ADMIN', 'COMPVSS_SUPER_ADMIN') and status in ('approved', 'in_progress'))
    )
  )
  with check (
    org_matches(organization_id) 
    and role_in(
      'COMPVSS_TEAM_MEMBER',
      'COMPVSS_ADMIN',
      'COMPVSS_SUPER_ADMIN'
    )
  );

-- ATLVS team can view all advances for review
create policy advances_atlvs_select on production_advances
  for select
  using (
    org_matches(organization_id) 
    and role_in(
      'ATLVS_TEAM_MEMBER',
      'ATLVS_ADMIN',
      'ATLVS_SUPER_ADMIN',
      'PROCUREMENT_MANAGER',
      'FINANCE_ADMIN',
      'LEGEND_SUPER_ADMIN'
    )
  );

-- ATLVS team can update advances for approval/rejection
create policy advances_atlvs_update on production_advances
  for update
  using (
    org_matches(organization_id) 
    and role_in(
      'ATLVS_ADMIN',
      'ATLVS_SUPER_ADMIN',
      'PROCUREMENT_MANAGER',
      'LEGEND_SUPER_ADMIN'
    )
    and status in ('submitted', 'under_review', 'approved')
  )
  with check (
    org_matches(organization_id) 
    and role_in(
      'ATLVS_ADMIN',
      'ATLVS_SUPER_ADMIN',
      'PROCUREMENT_MANAGER',
      'LEGEND_SUPER_ADMIN'
    )
  );

-- ============================================================================
-- PRODUCTION ADVANCE ITEMS POLICIES
-- ============================================================================

-- Access to items follows parent advance permissions
create policy advance_items_select on production_advance_items
  for select
  using (
    exists (
      select 1 from production_advances 
      where id = advance_id 
      and org_matches(organization_id)
      and role_in(
        'COMPVSS_TEAM_MEMBER', 'COMPVSS_ADMIN', 'COMPVSS_SUPER_ADMIN',
        'ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 
        'PROCUREMENT_MANAGER', 'FINANCE_ADMIN',
        'LEGEND_SUPER_ADMIN'
      )
    )
  );

-- COMPVSS can insert items for their own advances
create policy advance_items_insert on production_advance_items
  for insert
  with check (
    exists (
      select 1 from production_advances 
      where id = advance_id 
      and org_matches(organization_id)
      and submitter_id = current_platform_user_id()
      and status = 'draft'
      and role_in(
        'COMPVSS_TEAM_MEMBER',
        'COMPVSS_ADMIN',
        'COMPVSS_SUPER_ADMIN'
      )
    )
  );

-- COMPVSS can update items in draft advances or for fulfillment
create policy advance_items_update on production_advance_items
  for update
  using (
    exists (
      select 1 from production_advances pa
      where pa.id = advance_id 
      and org_matches(pa.organization_id)
      and role_in(
        'COMPVSS_TEAM_MEMBER',
        'COMPVSS_ADMIN',
        'COMPVSS_SUPER_ADMIN'
      )
      and (
        (pa.submitter_id = current_platform_user_id() and pa.status = 'draft')
        or
        (role_in('COMPVSS_ADMIN', 'COMPVSS_SUPER_ADMIN') and pa.status in ('approved', 'in_progress'))
      )
    )
  )
  with check (
    exists (
      select 1 from production_advances pa
      where pa.id = advance_id 
      and org_matches(pa.organization_id)
      and role_in(
        'COMPVSS_TEAM_MEMBER',
        'COMPVSS_ADMIN',
        'COMPVSS_SUPER_ADMIN'
      )
    )
  );

-- COMPVSS can delete items from draft advances
create policy advance_items_delete on production_advance_items
  for delete
  using (
    exists (
      select 1 from production_advances 
      where id = advance_id 
      and org_matches(organization_id)
      and submitter_id = current_platform_user_id()
      and status = 'draft'
      and role_in(
        'COMPVSS_TEAM_MEMBER',
        'COMPVSS_ADMIN',
        'COMPVSS_SUPER_ADMIN'
      )
    )
  );

-- Add comments for documentation
comment on policy catalog_global_read on production_advancing_catalog is 'All authenticated users can view enabled catalog items';
comment on policy catalog_admin_manage on production_advancing_catalog is 'Only super admins can manage catalog';
comment on policy advances_compvss_select on production_advances is 'COMPVSS team can view advances for their organization';
comment on policy advances_compvss_insert on production_advances is 'COMPVSS team can create advances for their organization';
comment on policy advances_compvss_update on production_advances is 'COMPVSS team can update draft advances or fulfill approved ones';
comment on policy advances_atlvs_select on production_advances is 'ATLVS team can view all advances for review';
comment on policy advances_atlvs_update on production_advances is 'ATLVS team can approve/reject submitted advances';
comment on policy advance_items_select on production_advance_items is 'Access to items follows parent advance permissions';
comment on policy advance_items_insert on production_advance_items is 'COMPVSS can add items to draft advances';
comment on policy advance_items_update on production_advance_items is 'COMPVSS can update items in draft or for fulfillment';
comment on policy advance_items_delete on production_advance_items is 'COMPVSS can delete items from draft advances';
