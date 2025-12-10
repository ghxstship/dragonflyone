-- Migration: 0152_rls_performance_fixes_batch2.sql
-- Description: Fix remaining auth_rls_initplan and multiple_permissive_policies warnings
-- Batch 2: Additional tables not covered in 0151

-- ============================================================================
-- PART 0: ADD MISSING COLUMNS FOR ENRICHMENT
-- ============================================================================

-- webhooks: Add organization_id
ALTER TABLE webhooks ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_webhooks_org ON webhooks(organization_id);

-- campaign_sends: Add organization_id if missing
ALTER TABLE campaign_sends ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_campaign_sends_org ON campaign_sends(organization_id);

-- campaign_metrics: Add organization_id if missing
ALTER TABLE campaign_metrics ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_org ON campaign_metrics(organization_id);

-- import_jobs: Add organization_id if missing
ALTER TABLE import_jobs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_import_jobs_org ON import_jobs(organization_id);

-- labor_rules: Add is_default for default rules
ALTER TABLE labor_rules ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE;

-- ============================================================================
-- PART 1: FIX auth_rls_initplan WARNINGS
-- Wrap auth.uid() and auth.role() calls in (SELECT ...) to prevent per-row re-evaluation
-- ============================================================================

-- compliance_events (gets org through compliance_item_id)
DROP POLICY IF EXISTS "Users can view events in their organization" ON public.compliance_events;
DROP POLICY IF EXISTS "Users can create events" ON public.compliance_events;
CREATE POLICY "compliance_events_select" ON public.compliance_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM compliance_items ci WHERE ci.id = compliance_events.compliance_item_id AND org_matches(ci.organization_id))
);
CREATE POLICY "compliance_events_insert" ON public.compliance_events FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM compliance_items ci WHERE ci.id = compliance_events.compliance_item_id AND org_matches(ci.organization_id))
  AND (SELECT auth.uid()) IS NOT NULL
);

-- webhooks
DROP POLICY IF EXISTS "Users can manage their own webhooks" ON public.webhooks;
CREATE POLICY "webhooks_manage" ON public.webhooks FOR ALL USING (user_id = (SELECT auth.uid()) OR org_matches(organization_id));

-- webhook_deliveries
DROP POLICY IF EXISTS "Users can view their webhook deliveries" ON public.webhook_deliveries;
CREATE POLICY "webhook_deliveries_select" ON public.webhook_deliveries FOR SELECT USING (
  EXISTS (SELECT 1 FROM webhooks w WHERE w.id = webhook_deliveries.webhook_id AND (w.user_id = (SELECT auth.uid()) OR org_matches(w.organization_id)))
);

-- campaign_sends
DROP POLICY IF EXISTS "campaign_sends_view" ON public.campaign_sends;
CREATE POLICY "campaign_sends_select" ON public.campaign_sends FOR SELECT USING (org_matches(organization_id) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- api_key_usage
DROP POLICY IF EXISTS "Users can view their API key usage" ON public.api_key_usage;
DROP POLICY IF EXISTS "Service role can log API usage" ON public.api_key_usage;
CREATE POLICY "api_key_usage_select" ON public.api_key_usage FOR SELECT USING (
  EXISTS (SELECT 1 FROM api_keys ak WHERE ak.id = api_key_usage.api_key_id AND ak.user_id = (SELECT auth.uid()))
);
CREATE POLICY "api_key_usage_insert" ON public.api_key_usage FOR INSERT WITH CHECK ((SELECT auth.role()) = 'service_role' OR (SELECT auth.uid()) IS NOT NULL);

-- scheduled_jobs
DROP POLICY IF EXISTS "Admins can manage scheduled jobs" ON public.scheduled_jobs;
CREATE POLICY "scheduled_jobs_manage" ON public.scheduled_jobs FOR ALL USING (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- notification_preferences
DROP POLICY IF EXISTS "Users can manage their own notification preferences" ON public.notification_preferences;
CREATE POLICY "notification_preferences_manage" ON public.notification_preferences FOR ALL USING (user_id = (SELECT auth.uid()));

-- time_entries (uses crew_member_id which links to user_id)
DROP POLICY IF EXISTS "Users can view time entries in their organization" ON public.time_entries;
DROP POLICY IF EXISTS "Crew members can create their own time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can update their own pending time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Admins can manage all time entries" ON public.time_entries;
CREATE POLICY "time_entries_select" ON public.time_entries FOR SELECT USING (
  org_matches(organization_id) OR 
  EXISTS (SELECT 1 FROM crew_members cm WHERE cm.id = time_entries.crew_member_id AND cm.user_id = (SELECT auth.uid()))
);
CREATE POLICY "time_entries_insert" ON public.time_entries FOR INSERT WITH CHECK (
  org_matches(organization_id) AND 
  EXISTS (SELECT 1 FROM crew_members cm WHERE cm.id = time_entries.crew_member_id AND cm.user_id = (SELECT auth.uid()))
);
CREATE POLICY "time_entries_update" ON public.time_entries FOR UPDATE USING (
  (EXISTS (SELECT 1 FROM crew_members cm WHERE cm.id = time_entries.crew_member_id AND cm.user_id = (SELECT auth.uid())) AND status = 'pending') 
  OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN')
);
CREATE POLICY "time_entries_admin" ON public.time_entries FOR ALL USING (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- campaign_metrics
DROP POLICY IF EXISTS "campaign_metrics_view" ON public.campaign_metrics;
CREATE POLICY "campaign_metrics_select" ON public.campaign_metrics FOR SELECT USING (org_matches(organization_id) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- timesheet_periods
DROP POLICY IF EXISTS "Users can view periods in their organization" ON public.timesheet_periods;
DROP POLICY IF EXISTS "Admins can manage timesheet periods" ON public.timesheet_periods;
CREATE POLICY "timesheet_periods_select" ON public.timesheet_periods FOR SELECT USING (org_matches(organization_id));
CREATE POLICY "timesheet_periods_manage" ON public.timesheet_periods FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- labor_rules
DROP POLICY IF EXISTS "Users can view labor rules" ON public.labor_rules;
DROP POLICY IF EXISTS "Admins can manage labor rules" ON public.labor_rules;
CREATE POLICY "labor_rules_select" ON public.labor_rules FOR SELECT USING (org_matches(organization_id) OR is_default = TRUE);
CREATE POLICY "labor_rules_manage" ON public.labor_rules FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- documents (additional policies)
DROP POLICY IF EXISTS "Users can view their own and public documents" ON public.documents;
DROP POLICY IF EXISTS "Users can upload documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;
CREATE POLICY "documents_view" ON public.documents FOR SELECT USING (
  uploaded_by = (SELECT auth.uid()) OR access_level = 'public' OR org_matches(organization_id)
);
CREATE POLICY "documents_insert" ON public.documents FOR INSERT WITH CHECK (uploaded_by = (SELECT auth.uid()));
CREATE POLICY "documents_update" ON public.documents FOR UPDATE USING (uploaded_by = (SELECT auth.uid()) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY "documents_delete" ON public.documents FOR DELETE USING (uploaded_by = (SELECT auth.uid()) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- document_versions
DROP POLICY IF EXISTS "Users can view document versions they have access to" ON public.document_versions;
CREATE POLICY "document_versions_select" ON public.document_versions FOR SELECT USING (
  EXISTS (SELECT 1 FROM documents d WHERE d.id = document_versions.document_id AND (d.uploaded_by = (SELECT auth.uid()) OR d.access_level = 'public' OR org_matches(d.organization_id)))
);

-- activity_feed
DROP POLICY IF EXISTS "Users can view their own activity feed" ON public.activity_feed;
DROP POLICY IF EXISTS "Service role can create activity entries" ON public.activity_feed;
DROP POLICY IF EXISTS "Users can mark activities as read" ON public.activity_feed;
CREATE POLICY "activity_feed_select" ON public.activity_feed FOR SELECT USING (user_id = (SELECT auth.uid()));
CREATE POLICY "activity_feed_insert" ON public.activity_feed FOR INSERT WITH CHECK ((SELECT auth.role()) = 'service_role' OR user_id = (SELECT auth.uid()));
CREATE POLICY "activity_feed_update" ON public.activity_feed FOR UPDATE USING (user_id = (SELECT auth.uid()));

-- email_templates (additional policies)
DROP POLICY IF EXISTS "Admins can manage email templates" ON public.email_templates;
DROP POLICY IF EXISTS "Users can view active email templates" ON public.email_templates;
CREATE POLICY "email_templates_admin" ON public.email_templates FOR ALL USING (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY "email_templates_view" ON public.email_templates FOR SELECT USING (is_active = TRUE OR org_matches(organization_id));

-- email_log
DROP POLICY IF EXISTS "Admins can view email logs" ON public.email_log;
CREATE POLICY "email_log_select" ON public.email_log FOR SELECT USING (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- entity_comments
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.entity_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.entity_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.entity_comments;
CREATE POLICY "entity_comments_insert" ON public.entity_comments FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "entity_comments_update" ON public.entity_comments FOR UPDATE USING (user_id = (SELECT auth.uid()));
CREATE POLICY "entity_comments_delete" ON public.entity_comments FOR DELETE USING (user_id = (SELECT auth.uid()) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- import_jobs
DROP POLICY IF EXISTS "Users can view their own import jobs" ON public.import_jobs;
DROP POLICY IF EXISTS "Users can create import jobs" ON public.import_jobs;
DROP POLICY IF EXISTS "Users can update their own import jobs" ON public.import_jobs;
DROP POLICY IF EXISTS "Users can delete their own import jobs" ON public.import_jobs;
CREATE POLICY "import_jobs_select" ON public.import_jobs FOR SELECT USING (user_id = (SELECT auth.uid()) OR org_matches(organization_id));
CREATE POLICY "import_jobs_insert" ON public.import_jobs FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "import_jobs_update" ON public.import_jobs FOR UPDATE USING (user_id = (SELECT auth.uid()));
CREATE POLICY "import_jobs_delete" ON public.import_jobs FOR DELETE USING (user_id = (SELECT auth.uid()));

-- reviews (uses is_public not is_published)
DROP POLICY IF EXISTS "Users can view their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own pending reviews" ON public.reviews;
DROP POLICY IF EXISTS "Moderators can manage reviews" ON public.reviews;
CREATE POLICY "reviews_select" ON public.reviews FOR SELECT USING (user_id = (SELECT auth.uid()) OR is_public = TRUE);
CREATE POLICY "reviews_insert" ON public.reviews FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "reviews_update" ON public.reviews FOR UPDATE USING (
  (user_id = (SELECT auth.uid()) AND status = 'pending') OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
);
CREATE POLICY "reviews_admin" ON public.reviews FOR ALL USING (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- review_responses (uses user_id not responder_id)
DROP POLICY IF EXISTS "Venue owners and organizers can respond" ON public.review_responses;
CREATE POLICY "review_responses_insert" ON public.review_responses FOR INSERT WITH CHECK (
  user_id = (SELECT auth.uid()) AND role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'GVTEWAY_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- review_reactions
DROP POLICY IF EXISTS "Authenticated users can react" ON public.review_reactions;
DROP POLICY IF EXISTS "Users can delete their own reactions" ON public.review_reactions;
CREATE POLICY "review_reactions_insert" ON public.review_reactions FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "review_reactions_delete" ON public.review_reactions FOR DELETE USING (user_id = (SELECT auth.uid()));

-- ============================================================================
-- PART 2: FIX multiple_permissive_policies WARNINGS
-- Drop duplicate policies and consolidate into unified policies
-- ============================================================================

-- activation_assignments (gets org through activation_id)
DROP POLICY IF EXISTS "activation_assignments_manage" ON public.activation_assignments;
DROP POLICY IF EXISTS "activation_assignments_select" ON public.activation_assignments;
CREATE POLICY "activation_assignments_unified" ON public.activation_assignments FOR SELECT USING (
  EXISTS (SELECT 1 FROM activations a WHERE a.id = activation_assignments.activation_id AND org_matches(a.organization_id))
  OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- activations
DROP POLICY IF EXISTS "activations_manage" ON public.activations;
DROP POLICY IF EXISTS "activations_select" ON public.activations;
CREATE POLICY "activations_unified" ON public.activations FOR SELECT USING (org_matches(organization_id) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- advance_templates (consolidate)
DROP POLICY IF EXISTS "advance_templates_manage" ON public.advance_templates;
DROP POLICY IF EXISTS "advance_templates_select" ON public.advance_templates;
CREATE POLICY "advance_templates_unified" ON public.advance_templates FOR SELECT USING (org_matches(organization_id) OR is_global = TRUE OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- approval_workflows (consolidate)
DROP POLICY IF EXISTS "approval_workflows_manage" ON public.approval_workflows;
DROP POLICY IF EXISTS "approval_workflows_select" ON public.approval_workflows;
CREATE POLICY "approval_workflows_unified" ON public.approval_workflows FOR SELECT USING (org_matches(organization_id) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- artists (consolidate with org_policy)
DROP POLICY IF EXISTS "artists_org_policy" ON public.artists;
-- artists_unified_select already exists from 0151

-- assets (consolidate with access)
DROP POLICY IF EXISTS "assets_access" ON public.assets;
-- assets_unified_select already exists from 0151

-- budgets (consolidate with org_policy)
DROP POLICY IF EXISTS "budgets_org_policy" ON public.budgets;
-- budgets_unified_select already exists from 0151

-- client_feedback
DROP POLICY IF EXISTS "client_feedback_manage" ON public.client_feedback;
DROP POLICY IF EXISTS "client_feedback_select" ON public.client_feedback;
CREATE POLICY "client_feedback_unified" ON public.client_feedback FOR SELECT USING (org_matches(organization_id) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- compliance_items (drop old, keep new from 0151)
DROP POLICY IF EXISTS "Users can view compliance items in their organization" ON public.compliance_items;
DROP POLICY IF EXISTS "Admins can manage compliance items" ON public.compliance_items;
-- compliance_items policies were already fixed in 0151

-- compliance_requirements (drop old, keep new from 0151)
DROP POLICY IF EXISTS "Users can view requirements in their organization" ON public.compliance_requirements;
DROP POLICY IF EXISTS "Admins can manage requirements" ON public.compliance_requirements;
-- compliance_requirements policies were already fixed in 0151

-- contacts
DROP POLICY IF EXISTS "contacts_select" ON public.contacts;
DROP POLICY IF EXISTS "contacts_write" ON public.contacts;
CREATE POLICY "contacts_unified" ON public.contacts FOR SELECT USING (org_matches(organization_id) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- crew_members (consolidate with org_policy)
DROP POLICY IF EXISTS "crew_members_org_policy" ON public.crew_members;
-- crew_members_unified_select already exists from 0151

-- custom_field_definitions
DROP POLICY IF EXISTS "custom_field_defs_manage" ON public.custom_field_definitions;
DROP POLICY IF EXISTS "custom_field_defs_select" ON public.custom_field_definitions;
CREATE POLICY "custom_field_definitions_unified" ON public.custom_field_definitions FOR SELECT USING (org_matches(organization_id) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- custom_field_values (gets org through field_definition_id)
DROP POLICY IF EXISTS "custom_field_values_manage" ON public.custom_field_values;
DROP POLICY IF EXISTS "custom_field_values_select" ON public.custom_field_values;
CREATE POLICY "custom_field_values_unified" ON public.custom_field_values FOR SELECT USING (
  EXISTS (SELECT 1 FROM custom_field_definitions cfd WHERE cfd.id = custom_field_values.field_definition_id AND org_matches(cfd.organization_id))
  OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- deals (consolidate with write)
DROP POLICY IF EXISTS "deals_write" ON public.deals;
-- deals_unified_select already exists from 0151

-- document_templates (consolidate)
DROP POLICY IF EXISTS "document_templates_manage" ON public.document_templates;
DROP POLICY IF EXISTS "document_templates_select" ON public.document_templates;
CREATE POLICY "document_templates_unified" ON public.document_templates FOR SELECT USING (org_matches(organization_id) OR is_global = TRUE OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- documents (drop old unified, we created new specific ones above)
DROP POLICY IF EXISTS "documents_unified_select" ON public.documents;

-- email_templates (drop unified, we created new specific ones above)
DROP POLICY IF EXISTS "email_templates_unified_select" ON public.email_templates;

-- event_role_assignments (has organization_id directly)
DROP POLICY IF EXISTS "event_role_assignments_manage" ON public.event_role_assignments;
DROP POLICY IF EXISTS "event_role_assignments_select" ON public.event_role_assignments;
DROP POLICY IF EXISTS "event_roles_manage" ON public.event_role_assignments;
DROP POLICY IF EXISTS "event_roles_select" ON public.event_role_assignments;
CREATE POLICY "event_role_assignments_unified" ON public.event_role_assignments FOR ALL USING (
  org_matches(organization_id) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'GVTEWAY_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- events (consolidate with org_policy)
DROP POLICY IF EXISTS "events_org_policy" ON public.events;
-- events_unified_select already exists from 0151

-- procurement_vendors
DROP POLICY IF EXISTS "procurement_vendors_manage" ON public.procurement_vendors;
DROP POLICY IF EXISTS "procurement_vendors_select" ON public.procurement_vendors;
CREATE POLICY "procurement_vendors_unified" ON public.procurement_vendors FOR SELECT USING (org_matches(organization_id) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- team_permissions (has organization_id directly)
DROP POLICY IF EXISTS "team_permissions_manage" ON public.team_permissions;
DROP POLICY IF EXISTS "team_permissions_select" ON public.team_permissions;
CREATE POLICY "team_permissions_unified" ON public.team_permissions FOR SELECT USING (
  org_matches(organization_id) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- workflow_assignment_events
DROP POLICY IF EXISTS "workflow_assignment_events_manage" ON public.workflow_assignment_events;
DROP POLICY IF EXISTS "workflow_assignment_events_read" ON public.workflow_assignment_events;
CREATE POLICY "workflow_assignment_events_unified" ON public.workflow_assignment_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM workflow_assignments wa WHERE wa.id = workflow_assignment_events.assignment_id AND org_matches(wa.organization_id))
  OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- workforce_certifications (gets org through employee_id)
DROP POLICY IF EXISTS "workforce_certifications_manage" ON public.workforce_certifications;
DROP POLICY IF EXISTS "workforce_certifications_select" ON public.workforce_certifications;
CREATE POLICY "workforce_certifications_unified" ON public.workforce_certifications FOR SELECT USING (
  EXISTS (SELECT 1 FROM workforce_employees we WHERE we.id = workforce_certifications.employee_id AND org_matches(we.organization_id))
  OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- workforce_employee_roles
DROP POLICY IF EXISTS "workforce_employee_roles_manage" ON public.workforce_employee_roles;
DROP POLICY IF EXISTS "workforce_employee_roles_select" ON public.workforce_employee_roles;
CREATE POLICY "workforce_employee_roles_unified" ON public.workforce_employee_roles FOR SELECT USING (
  EXISTS (SELECT 1 FROM workforce_employees we WHERE we.id = workforce_employee_roles.employee_id AND org_matches(we.organization_id))
  OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- workforce_employees
DROP POLICY IF EXISTS "workforce_employees_rw" ON public.workforce_employees;
DROP POLICY IF EXISTS "workforce_employees_select" ON public.workforce_employees;
CREATE POLICY "workforce_employees_unified" ON public.workforce_employees FOR SELECT USING (org_matches(organization_id) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- workspace_projects
DROP POLICY IF EXISTS "workspace_projects_manage" ON public.workspace_projects;
DROP POLICY IF EXISTS "workspace_projects_select" ON public.workspace_projects;
CREATE POLICY "workspace_projects_unified" ON public.workspace_projects FOR SELECT USING (
  EXISTS (SELECT 1 FROM workspaces w WHERE w.id = workspace_projects.workspace_id AND org_matches(w.organization_id))
  OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
);
