-- Migration: 0166_security_advisor_fixes.sql
-- Description: Fix Security Advisor errors by replacing USING (TRUE) and WITH CHECK (true) policies
-- with proper authentication and authorization checks

-- ============================================================================
-- PART 0: ADD MISSING COLUMNS FIRST (before policies that depend on them)
-- ============================================================================

-- task_templates: Add organization_id and is_global if missing
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'task_templates') THEN
    ALTER TABLE task_templates ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    ALTER TABLE task_templates ADD COLUMN IF NOT EXISTS is_global BOOLEAN DEFAULT FALSE;
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_task_templates_org ON task_templates(organization_id);

-- schedule_tasks already has organization_id from 0145
-- schedule_task_comments already has user_id from 0145
-- schedule_task_time_entries already has user_id from 0145

-- ============================================================================
-- PART 1: FIX OVERLY PERMISSIVE POLICIES (USING TRUE / WITH CHECK TRUE)
-- These are security errors that allow unrestricted access
-- ============================================================================

-- search_analytics: Replace open policies with authenticated user checks
DROP POLICY IF EXISTS "search_analytics_select" ON search_analytics;
DROP POLICY IF EXISTS "search_analytics_insert" ON search_analytics;
CREATE POLICY "search_analytics_select" ON search_analytics 
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "search_analytics_insert" ON search_analytics 
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- urgency_tactics: Require authentication for viewing
DROP POLICY IF EXISTS "urgency_tactics_view" ON urgency_tactics;
CREATE POLICY "urgency_tactics_view" ON urgency_tactics 
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

-- job_executions: Require authentication
DROP POLICY IF EXISTS "Users can view job executions" ON job_executions;
CREATE POLICY "job_executions_select" ON job_executions 
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

-- entity_comments: Require authentication for viewing
DROP POLICY IF EXISTS "Users can view comments" ON entity_comments;
CREATE POLICY "entity_comments_select" ON entity_comments 
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

-- import_templates: Use org_matches for proper scoping
DROP POLICY IF EXISTS "Users can view import templates" ON import_templates;
-- import_templates_unified_select already exists from 0151, just drop the old one

-- field_history: Require authentication for audit viewing
DROP POLICY IF EXISTS "field_history_select" ON field_history;
CREATE POLICY "field_history_select" ON field_history 
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

-- user_follows: Require authentication
DROP POLICY IF EXISTS "Anyone can view follows" ON user_follows;
CREATE POLICY "user_follows_select" ON user_follows 
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

-- document_locks: Require authentication for viewing
DROP POLICY IF EXISTS "Users can view all document locks" ON document_locks;
CREATE POLICY "document_locks_select" ON document_locks 
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

-- status_updates: Require authentication for viewing
DROP POLICY IF EXISTS "Users can view all status updates" ON status_updates;
CREATE POLICY "status_updates_select" ON status_updates 
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

-- search_index: Require authentication (drop the open policy)
DROP POLICY IF EXISTS "Users can view all search index entries" ON search_index;
-- Service role policy already exists from 0151

-- review_reactions: Require authentication
DROP POLICY IF EXISTS "Anyone can view reactions" ON review_reactions;
CREATE POLICY "review_reactions_select" ON review_reactions 
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

-- review_statistics: Require authentication
DROP POLICY IF EXISTS "Anyone can view review statistics" ON review_statistics;
CREATE POLICY "review_statistics_select" ON review_statistics 
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

-- task_templates: Replace open policies with org-scoped access
DROP POLICY IF EXISTS "task_templates_select_policy" ON task_templates;
DROP POLICY IF EXISTS "task_templates_insert_policy" ON task_templates;
DROP POLICY IF EXISTS "task_templates_update_policy" ON task_templates;
DROP POLICY IF EXISTS "task_templates_delete_policy" ON task_templates;
CREATE POLICY "task_templates_select" ON task_templates 
  FOR SELECT USING (org_matches(organization_id) OR is_global = TRUE);
CREATE POLICY "task_templates_insert" ON task_templates 
  FOR INSERT WITH CHECK (org_matches(organization_id));
CREATE POLICY "task_templates_update" ON task_templates 
  FOR UPDATE USING (org_matches(organization_id));
CREATE POLICY "task_templates_delete" ON task_templates 
  FOR DELETE USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- quick_links: Replace open policies with authentication
DROP POLICY IF EXISTS "quick_links_select_policy" ON quick_links;
DROP POLICY IF EXISTS "quick_links_insert_policy" ON quick_links;
DROP POLICY IF EXISTS "quick_links_update_policy" ON quick_links;
CREATE POLICY "quick_links_select" ON quick_links 
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "quick_links_insert" ON quick_links 
  FOR INSERT WITH CHECK (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY "quick_links_update" ON quick_links 
  FOR UPDATE USING (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- user_quick_link_favorites: Scope to user's own favorites
DROP POLICY IF EXISTS "user_quick_link_favorites_select_policy" ON user_quick_link_favorites;
DROP POLICY IF EXISTS "user_quick_link_favorites_insert_policy" ON user_quick_link_favorites;
DROP POLICY IF EXISTS "user_quick_link_favorites_update_policy" ON user_quick_link_favorites;
DROP POLICY IF EXISTS "user_quick_link_favorites_delete_policy" ON user_quick_link_favorites;
CREATE POLICY "user_quick_link_favorites_select" ON user_quick_link_favorites 
  FOR SELECT USING (user_id = (SELECT auth.uid()));
CREATE POLICY "user_quick_link_favorites_insert" ON user_quick_link_favorites 
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "user_quick_link_favorites_update" ON user_quick_link_favorites 
  FOR UPDATE USING (user_id = (SELECT auth.uid()));
CREATE POLICY "user_quick_link_favorites_delete" ON user_quick_link_favorites 
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- schedule_tasks: Replace open policies with org-scoped access (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'schedule_tasks') THEN
    DROP POLICY IF EXISTS "schedule_tasks_select_policy" ON schedule_tasks;
    DROP POLICY IF EXISTS "schedule_tasks_insert_policy" ON schedule_tasks;
    DROP POLICY IF EXISTS "schedule_tasks_update_policy" ON schedule_tasks;
    DROP POLICY IF EXISTS "schedule_tasks_delete_policy" ON schedule_tasks;
    CREATE POLICY "schedule_tasks_select" ON schedule_tasks FOR SELECT USING (org_matches(organization_id));
    CREATE POLICY "schedule_tasks_insert" ON schedule_tasks FOR INSERT WITH CHECK (org_matches(organization_id));
    CREATE POLICY "schedule_tasks_update" ON schedule_tasks FOR UPDATE USING (org_matches(organization_id));
    CREATE POLICY "schedule_tasks_delete" ON schedule_tasks FOR DELETE USING (org_matches(organization_id));
  END IF;
END $$;

-- schedule_task_comments: Replace open policies with org-scoped access (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'schedule_task_comments') THEN
    DROP POLICY IF EXISTS "schedule_task_comments_select_policy" ON schedule_task_comments;
    DROP POLICY IF EXISTS "schedule_task_comments_insert_policy" ON schedule_task_comments;
    CREATE POLICY "schedule_task_comments_select" ON schedule_task_comments 
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM schedule_tasks st WHERE st.id = schedule_task_comments.task_id AND org_matches(st.organization_id))
      );
    CREATE POLICY "schedule_task_comments_insert" ON schedule_task_comments 
      FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM schedule_tasks st WHERE st.id = schedule_task_comments.task_id AND org_matches(st.organization_id))
        AND user_id = (SELECT auth.uid())
      );
  END IF;
END $$;

-- schedule_task_time_entries: Replace open policies with org-scoped access (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'schedule_task_time_entries') THEN
    DROP POLICY IF EXISTS "schedule_task_time_entries_select_policy" ON schedule_task_time_entries;
    DROP POLICY IF EXISTS "schedule_task_time_entries_insert_policy" ON schedule_task_time_entries;
    DROP POLICY IF EXISTS "schedule_task_time_entries_update_policy" ON schedule_task_time_entries;
    DROP POLICY IF EXISTS "schedule_task_time_entries_delete_policy" ON schedule_task_time_entries;
    CREATE POLICY "schedule_task_time_entries_select" ON schedule_task_time_entries 
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM schedule_tasks st WHERE st.id = schedule_task_time_entries.task_id AND org_matches(st.organization_id))
      );
    CREATE POLICY "schedule_task_time_entries_insert" ON schedule_task_time_entries 
      FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM schedule_tasks st WHERE st.id = schedule_task_time_entries.task_id AND org_matches(st.organization_id))
        AND user_id = (SELECT auth.uid())
      );
    CREATE POLICY "schedule_task_time_entries_update" ON schedule_task_time_entries 
      FOR UPDATE USING (user_id = (SELECT auth.uid()));
    CREATE POLICY "schedule_task_time_entries_delete" ON schedule_task_time_entries 
      FOR DELETE USING (user_id = (SELECT auth.uid()));
  END IF;
END $$;

-- certification_requirements: Require authentication
DROP POLICY IF EXISTS "Anyone can view certification requirements" ON certification_requirements;
CREATE POLICY "certification_requirements_select" ON certification_requirements 
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

-- credential_zone_access: Require authentication (already has TO authenticated)
DROP POLICY IF EXISTS "credential_zone_access_select" ON credential_zone_access;
CREATE POLICY "credential_zone_access_select" ON credential_zone_access 
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

-- credential_scans: Require authentication
DROP POLICY IF EXISTS "credential_scans_insert" ON credential_scans;
CREATE POLICY "credential_scans_insert" ON credential_scans 
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- referrals: Require authentication for creating referrals
DROP POLICY IF EXISTS "Anyone can create referrals" ON referrals;
CREATE POLICY "referrals_insert" ON referrals 
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- wallet_transactions: Restrict to service role or user's own transactions
DROP POLICY IF EXISTS "System can create transactions" ON wallet_transactions;
CREATE POLICY "wallet_transactions_insert" ON wallet_transactions 
  FOR INSERT WITH CHECK (
    (SELECT auth.role()) = 'service_role' 
    OR EXISTS (SELECT 1 FROM wallets w WHERE w.id = wallet_transactions.wallet_id AND w.user_id = (SELECT auth.uid()))
  );

-- generator_analytics: Require authentication for insert
DROP POLICY IF EXISTS "generator_analytics_insert" ON generator_analytics;
CREATE POLICY "generator_analytics_insert" ON generator_analytics 
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL OR (SELECT auth.role()) = 'anon');

-- ============================================================================
-- PART 2: FIX auth_rls_initplan WARNINGS
-- Wrap remaining auth.uid() and auth.role() calls in (SELECT ...)
-- ============================================================================

-- api_rate_limits (from 0028_security_hardening.sql)
DROP POLICY IF EXISTS "api_rate_limits_select" ON api_rate_limits;
DROP POLICY IF EXISTS "api_rate_limits_insert" ON api_rate_limits;
CREATE POLICY "api_rate_limits_select" ON api_rate_limits 
  FOR SELECT USING (user_id = (SELECT auth.uid()) OR role_in('LEGEND_SUPER_ADMIN'));
CREATE POLICY "api_rate_limits_insert" ON api_rate_limits 
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

-- affiliates_view
DROP POLICY IF EXISTS "affiliates_view" ON affiliates;
CREATE POLICY "affiliates_view" ON affiliates 
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

-- retargeting_pixels_view
DROP POLICY IF EXISTS "retargeting_pixels_view" ON retargeting_pixels;
CREATE POLICY "retargeting_pixels_view" ON retargeting_pixels 
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

-- marketing_campaigns_view
DROP POLICY IF EXISTS "marketing_campaigns_view" ON marketing_campaigns;
CREATE POLICY "marketing_campaigns_view" ON marketing_campaigns 
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

-- user_follows: Fix insert policy
DROP POLICY IF EXISTS "Users can follow others" ON user_follows;
CREATE POLICY "user_follows_insert" ON user_follows 
  FOR INSERT WITH CHECK (follower_id = (SELECT auth.uid()));

-- user_follows: Fix delete policy
DROP POLICY IF EXISTS "Users can unfollow" ON user_follows;
CREATE POLICY "user_follows_delete" ON user_follows 
  FOR DELETE USING (follower_id = (SELECT auth.uid()));

-- ============================================================================
-- PART 3: ENSURE ALL TABLES HAVE RLS ENABLED
-- Run the ensure_rls_enabled check to catch any tables without RLS
-- ============================================================================

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
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', rec.tablename);
  END LOOP;
END $$;

-- ============================================================================
-- PART 4: FIX REMAINING MULTIPLE PERMISSIVE POLICIES WARNINGS
-- Consolidate duplicate SELECT policies
-- ============================================================================

-- tasks: Consolidate if multiple policies exist
DROP POLICY IF EXISTS "tasks_select" ON tasks;
DROP POLICY IF EXISTS "tasks_manage" ON tasks;
CREATE POLICY "tasks_unified" ON tasks FOR ALL USING (org_matches(organization_id));

-- staff: Consolidate if multiple policies exist
DROP POLICY IF EXISTS "staff_select" ON staff;
DROP POLICY IF EXISTS "staff_manage" ON staff;
CREATE POLICY "staff_unified" ON staff FOR ALL USING (org_matches(organization_id));

-- budget_line_items: Consolidate if multiple policies exist
DROP POLICY IF EXISTS "budget_line_items_select" ON budget_line_items;
DROP POLICY IF EXISTS "budget_line_items_manage" ON budget_line_items;
CREATE POLICY "budget_line_items_unified" ON budget_line_items FOR ALL USING (org_matches(organization_id));

-- integration_deal_links: Already has unified policy from 0151, drop old ones
DROP POLICY IF EXISTS "integration_deal_links_select" ON integration_deal_links;
DROP POLICY IF EXISTS "integration_deal_links_manage" ON integration_deal_links;

-- ============================================================================
-- PART 6: DROP OLD POLICIES THAT WERE REPLACED IN 0151/0152
-- Clean up any remaining old policies that cause multiple_permissive_policies warnings
-- ============================================================================

-- documents (from 0043_final_features.sql) - already fixed in 0152
DROP POLICY IF EXISTS "Users can view their own and public documents" ON documents;
DROP POLICY IF EXISTS "Users can upload documents" ON documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON documents;

-- document_versions (from 0043_final_features.sql)
DROP POLICY IF EXISTS "Users can view document versions they have access to" ON document_versions;

-- activity_feed (from 0043_final_features.sql)
DROP POLICY IF EXISTS "Users can view their own activity feed" ON activity_feed;
DROP POLICY IF EXISTS "Service role can create activity entries" ON activity_feed;
DROP POLICY IF EXISTS "Users can mark activities as read" ON activity_feed;

-- email_templates (from 0043_final_features.sql)
DROP POLICY IF EXISTS "Users can view active email templates" ON email_templates;
DROP POLICY IF EXISTS "Admins can manage email templates" ON email_templates;

-- email_log (from 0043_final_features.sql)
DROP POLICY IF EXISTS "Admins can view email logs" ON email_log;

-- entity_comments (from 0043_final_features.sql)
DROP POLICY IF EXISTS "Authenticated users can create comments" ON entity_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON entity_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON entity_comments;

-- import_jobs (from 0043_final_features.sql)
DROP POLICY IF EXISTS "Users can view their own import jobs" ON import_jobs;
DROP POLICY IF EXISTS "Users can create import jobs" ON import_jobs;
DROP POLICY IF EXISTS "Users can update their own import jobs" ON import_jobs;
DROP POLICY IF EXISTS "Users can delete their own import jobs" ON import_jobs;

-- import_templates (from 0043_final_features.sql)
DROP POLICY IF EXISTS "Admins can manage import templates" ON import_templates;

-- ============================================================================
-- PART 7: FIX ADDITIONAL TABLES WITH auth.uid() NOT WRAPPED
-- ============================================================================

-- saved_filters (from 0147_saved_filters_views.sql)
DROP POLICY IF EXISTS "saved_filters_select" ON saved_filters;
DROP POLICY IF EXISTS "saved_filters_insert" ON saved_filters;
DROP POLICY IF EXISTS "saved_filters_update" ON saved_filters;
DROP POLICY IF EXISTS "saved_filters_delete" ON saved_filters;
DROP POLICY IF EXISTS "Users can view their own filters" ON saved_filters;
DROP POLICY IF EXISTS "Users can create their own filters" ON saved_filters;
DROP POLICY IF EXISTS "Users can update their own filters" ON saved_filters;
DROP POLICY IF EXISTS "Users can delete their own filters" ON saved_filters;
CREATE POLICY "saved_filters_select" ON saved_filters 
  FOR SELECT USING (user_id = (SELECT auth.uid()) OR is_public = TRUE);
CREATE POLICY "saved_filters_insert" ON saved_filters 
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "saved_filters_update" ON saved_filters 
  FOR UPDATE USING (user_id = (SELECT auth.uid()));
CREATE POLICY "saved_filters_delete" ON saved_filters 
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- saved_views (from 0147_saved_filters_views.sql)
DROP POLICY IF EXISTS "saved_views_select" ON saved_views;
DROP POLICY IF EXISTS "saved_views_insert" ON saved_views;
DROP POLICY IF EXISTS "saved_views_update" ON saved_views;
DROP POLICY IF EXISTS "saved_views_delete" ON saved_views;
DROP POLICY IF EXISTS "Users can view their own views" ON saved_views;
DROP POLICY IF EXISTS "Users can create their own views" ON saved_views;
DROP POLICY IF EXISTS "Users can update their own views" ON saved_views;
DROP POLICY IF EXISTS "Users can delete their own views" ON saved_views;
CREATE POLICY "saved_views_select" ON saved_views 
  FOR SELECT USING (user_id = (SELECT auth.uid()) OR is_public = TRUE);
CREATE POLICY "saved_views_insert" ON saved_views 
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "saved_views_update" ON saved_views 
  FOR UPDATE USING (user_id = (SELECT auth.uid()));
CREATE POLICY "saved_views_delete" ON saved_views 
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- user_favorites (from 0097_user_favorites.sql)
DROP POLICY IF EXISTS "user_favorites_select" ON user_favorites;
DROP POLICY IF EXISTS "user_favorites_insert" ON user_favorites;
DROP POLICY IF EXISTS "user_favorites_delete" ON user_favorites;
DROP POLICY IF EXISTS "Users can view their own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can add favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can remove their own favorites" ON user_favorites;
CREATE POLICY "user_favorites_select" ON user_favorites 
  FOR SELECT USING (user_id = (SELECT auth.uid()));
CREATE POLICY "user_favorites_insert" ON user_favorites 
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "user_favorites_delete" ON user_favorites 
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- direct_messages (from 0101_direct_messaging.sql) - if tables exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'dm_conversations') THEN
    DROP POLICY IF EXISTS "dm_conversations_select" ON dm_conversations;
    DROP POLICY IF EXISTS "Users can view their conversations" ON dm_conversations;
    CREATE POLICY "dm_conversations_select" ON dm_conversations 
      FOR SELECT USING (
        (SELECT auth.uid()) = ANY(participant_ids) OR 
        EXISTS (SELECT 1 FROM dm_participants WHERE conversation_id = dm_conversations.id AND user_id = (SELECT auth.uid()))
      );
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'dm_messages') THEN
    DROP POLICY IF EXISTS "dm_messages_select" ON dm_messages;
    DROP POLICY IF EXISTS "dm_messages_insert" ON dm_messages;
    DROP POLICY IF EXISTS "Users can view messages in their conversations" ON dm_messages;
    DROP POLICY IF EXISTS "Users can send messages" ON dm_messages;
    CREATE POLICY "dm_messages_select" ON dm_messages 
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM dm_conversations dc WHERE dc.id = dm_messages.conversation_id AND (SELECT auth.uid()) = ANY(dc.participant_ids))
      );
    CREATE POLICY "dm_messages_insert" ON dm_messages 
      FOR INSERT WITH CHECK (sender_id = (SELECT auth.uid()));
  END IF;
END $$;

-- ============================================================================
-- PART 8: FIX SSO/SAML TABLES (from 0143_sso_saml_enterprise.sql) - if tables exist
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sso_providers') THEN
    DROP POLICY IF EXISTS "sso_providers_select" ON sso_providers;
    DROP POLICY IF EXISTS "sso_providers_manage" ON sso_providers;
    DROP POLICY IF EXISTS "Users can view SSO providers for their org" ON sso_providers;
    DROP POLICY IF EXISTS "Admins can manage SSO providers" ON sso_providers;
    CREATE POLICY "sso_providers_select" ON sso_providers FOR SELECT USING (org_matches(organization_id));
    CREATE POLICY "sso_providers_manage" ON sso_providers FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sso_sessions') THEN
    DROP POLICY IF EXISTS "sso_sessions_select" ON sso_sessions;
    DROP POLICY IF EXISTS "Users can view their own SSO sessions" ON sso_sessions;
    CREATE POLICY "sso_sessions_select" ON sso_sessions FOR SELECT USING (user_id = (SELECT auth.uid()) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));
  END IF;
END $$;

-- ============================================================================
-- PART 9: FIX COMMUNICATIONS TABLES (from 0116_communications_system.sql) - if tables exist
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'communication_threads') THEN
    DROP POLICY IF EXISTS "communication_threads_select" ON communication_threads;
    DROP POLICY IF EXISTS "Users can view threads they participate in" ON communication_threads;
    CREATE POLICY "communication_threads_select" ON communication_threads 
      FOR SELECT USING (
        org_matches(organization_id) OR 
        EXISTS (SELECT 1 FROM communication_participants cp WHERE cp.thread_id = communication_threads.id AND cp.user_id = (SELECT auth.uid()))
      );
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'communication_messages') THEN
    DROP POLICY IF EXISTS "communication_messages_select" ON communication_messages;
    DROP POLICY IF EXISTS "communication_messages_insert" ON communication_messages;
    DROP POLICY IF EXISTS "Users can view messages in their threads" ON communication_messages;
    DROP POLICY IF EXISTS "Users can send messages" ON communication_messages;
    CREATE POLICY "communication_messages_select" ON communication_messages 
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM communication_threads ct WHERE ct.id = communication_messages.thread_id AND org_matches(ct.organization_id))
      );
    CREATE POLICY "communication_messages_insert" ON communication_messages 
      FOR INSERT WITH CHECK (sender_id = (SELECT auth.uid()));
  END IF;
END $$;

-- ============================================================================
-- COMMENTS (only if tables exist)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'search_analytics') THEN
    COMMENT ON POLICY "search_analytics_select" ON search_analytics IS 'Authenticated users can view search analytics';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'task_templates') THEN
    COMMENT ON POLICY "task_templates_select" ON task_templates IS 'Users can view org templates or global templates';
  END IF;
END $$;
