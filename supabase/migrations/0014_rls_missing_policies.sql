-- 0013_rls_missing_policies.sql
-- Complete RLS coverage for tables missing explicit policies

-- risk_levels policies
create policy risk_levels_select on risk_levels
  for select using (org_matches(organization_id) and role_in('ATLVS_VIEWER','ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'));

create policy risk_levels_manage on risk_levels
  for all using (org_matches(organization_id) and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'))
  with check (org_matches(organization_id) and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'));

-- workforce_employee_roles policies
create policy workforce_employee_roles_select on workforce_employee_roles
  for select using (
    exists (
      select 1 from workforce_employees we
      where we.id = employee_id
        and org_matches(we.organization_id)
        and role_in('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','WORKFORCE_MANAGER','LEGEND_SUPER_ADMIN')
    )
  );

create policy workforce_employee_roles_manage on workforce_employee_roles
  for all using (
    exists (
      select 1 from workforce_employees we
      where we.id = employee_id
        and org_matches(we.organization_id)
        and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','WORKFORCE_MANAGER','LEGEND_SUPER_ADMIN')
    )
  )
  with check (
    exists (
      select 1 from workforce_employees we
      where we.id = employee_id
        and org_matches(we.organization_id)
        and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','WORKFORCE_MANAGER','LEGEND_SUPER_ADMIN')
    )
  );

-- workforce_certifications policies
create policy workforce_certifications_select on workforce_certifications
  for select using (
    exists (
      select 1 from workforce_employees we
      where we.id = employee_id
        and org_matches(we.organization_id)
        and role_in('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','WORKFORCE_MANAGER','LEGEND_SUPER_ADMIN')
    )
  );

create policy workforce_certifications_manage on workforce_certifications
  for all using (
    exists (
      select 1 from workforce_employees we
      where we.id = employee_id
        and org_matches(we.organization_id)
        and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','WORKFORCE_MANAGER','LEGEND_SUPER_ADMIN')
    )
  )
  with check (
    exists (
      select 1 from workforce_employees we
      where we.id = employee_id
        and org_matches(we.organization_id)
        and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','WORKFORCE_MANAGER','LEGEND_SUPER_ADMIN')
    )
  );

-- procurement_vendors policies
create policy procurement_vendors_select on procurement_vendors
  for select using (org_matches(organization_id) and role_in('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','PROCUREMENT_MANAGER','LEGEND_SUPER_ADMIN'));

create policy procurement_vendors_manage on procurement_vendors
  for all using (org_matches(organization_id) and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','PROCUREMENT_MANAGER','LEGEND_SUPER_ADMIN'))
  with check (org_matches(organization_id) and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','PROCUREMENT_MANAGER','LEGEND_SUPER_ADMIN'));

-- role_definitions policies (global lookup table)
create policy role_definitions_public_select on role_definitions
  for select using (true);

create policy role_definitions_manage on role_definitions
  for all using (current_app_role() in ('LEGEND_SUPER_ADMIN','LEGEND_ADMIN'))
  with check (current_app_role() in ('LEGEND_SUPER_ADMIN','LEGEND_ADMIN'));

comment on policy risk_levels_select on risk_levels is 'Read access to risk levels for team members and above';
comment on policy risk_levels_manage on risk_levels is 'Full management for admins';
comment on policy workforce_employee_roles_select on workforce_employee_roles is 'Read access via parent employee org check';
comment on policy workforce_employee_roles_manage on workforce_employee_roles is 'Manage via parent employee org check';
comment on policy workforce_certifications_select on workforce_certifications is 'Read access via parent employee org check';
comment on policy workforce_certifications_manage on workforce_certifications is 'Manage via parent employee org check';
comment on policy procurement_vendors_select on procurement_vendors is 'Read vendor directory';
comment on policy procurement_vendors_manage on procurement_vendors is 'Manage vendor records';
comment on policy role_definitions_public_select on role_definitions is 'Public read access to role definitions';
comment on policy role_definitions_manage on role_definitions is 'Legend-only role definition management';
