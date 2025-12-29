-- Migration: 0172_final_security_performance_fixes.sql
-- Description: Final comprehensive fix for all remaining Security and Performance Advisor issues
-- This migration ensures ALL policies use (SELECT auth.uid()) and (SELECT auth.role())

-- ============================================================================
-- PART 1: FIX QUICK_LINKS AND USER_QUICK_LINK_FAVORITES (0144)
-- ============================================================================

DO $$
BEGIN
  -- quick_links
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quick_links') THEN
    DROP POLICY IF EXISTS "quick_links_select_policy" ON quick_links;
    DROP POLICY IF EXISTS "quick_links_insert_policy" ON quick_links;
    DROP POLICY IF EXISTS "quick_links_update_policy" ON quick_links;
    DROP POLICY IF EXISTS "quick_links_select" ON quick_links;
    DROP POLICY IF EXISTS "quick_links_insert" ON quick_links;
    DROP POLICY IF EXISTS "quick_links_update" ON quick_links;
    DROP POLICY IF EXISTS "quick_links_select" ON quick_links;
    CREATE POLICY "quick_links_select" ON quick_links FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);
    DROP POLICY IF EXISTS "quick_links_insert" ON quick_links;
    CREATE POLICY "quick_links_insert" ON quick_links FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);
    DROP POLICY IF EXISTS "quick_links_update" ON quick_links;
    CREATE POLICY "quick_links_update" ON quick_links FOR UPDATE USING ((SELECT auth.uid()) IS NOT NULL);
  END IF;

  -- user_quick_link_favorites
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_quick_link_favorites') THEN
    DROP POLICY IF EXISTS "user_quick_link_favorites_select_policy" ON user_quick_link_favorites;
    DROP POLICY IF EXISTS "user_quick_link_favorites_insert_policy" ON user_quick_link_favorites;
    DROP POLICY IF EXISTS "user_quick_link_favorites_update_policy" ON user_quick_link_favorites;
    DROP POLICY IF EXISTS "user_quick_link_favorites_delete_policy" ON user_quick_link_favorites;
    DROP POLICY IF EXISTS "user_quick_link_favorites_select" ON user_quick_link_favorites;
    CREATE POLICY "user_quick_link_favorites_select" ON user_quick_link_favorites FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);
    DROP POLICY IF EXISTS "user_quick_link_favorites_insert" ON user_quick_link_favorites;
    CREATE POLICY "user_quick_link_favorites_insert" ON user_quick_link_favorites FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);
    DROP POLICY IF EXISTS "user_quick_link_favorites_update" ON user_quick_link_favorites;
    CREATE POLICY "user_quick_link_favorites_update" ON user_quick_link_favorites FOR UPDATE USING ((SELECT auth.uid()) IS NOT NULL);
    DROP POLICY IF EXISTS "user_quick_link_favorites_delete" ON user_quick_link_favorites;
    CREATE POLICY "user_quick_link_favorites_delete" ON user_quick_link_favorites FOR DELETE USING ((SELECT auth.uid()) IS NOT NULL);
  END IF;
END $$;

-- ============================================================================
-- PART 2: FIX SCHEDULE_TASKS SYSTEM (0145)
-- ============================================================================

DO $$
BEGIN
  -- schedule_tasks
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'schedule_tasks') THEN
    DROP POLICY IF EXISTS "schedule_tasks_select_policy" ON schedule_tasks;
    DROP POLICY IF EXISTS "schedule_tasks_insert_policy" ON schedule_tasks;
    DROP POLICY IF EXISTS "schedule_tasks_update_policy" ON schedule_tasks;
    DROP POLICY IF EXISTS "schedule_tasks_delete_policy" ON schedule_tasks;
    DROP POLICY IF EXISTS "schedule_tasks_select" ON schedule_tasks;
    DROP POLICY IF EXISTS "schedule_tasks_insert" ON schedule_tasks;
    DROP POLICY IF EXISTS "schedule_tasks_update" ON schedule_tasks;
    DROP POLICY IF EXISTS "schedule_tasks_delete" ON schedule_tasks;
    DROP POLICY IF EXISTS "schedule_tasks_select" ON schedule_tasks;
    CREATE POLICY "schedule_tasks_select" ON schedule_tasks FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);
    DROP POLICY IF EXISTS "schedule_tasks_insert" ON schedule_tasks;
    CREATE POLICY "schedule_tasks_insert" ON schedule_tasks FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);
    DROP POLICY IF EXISTS "schedule_tasks_update" ON schedule_tasks;
    CREATE POLICY "schedule_tasks_update" ON schedule_tasks FOR UPDATE USING ((SELECT auth.uid()) IS NOT NULL);
    DROP POLICY IF EXISTS "schedule_tasks_delete" ON schedule_tasks;
    CREATE POLICY "schedule_tasks_delete" ON schedule_tasks FOR DELETE USING ((SELECT auth.uid()) IS NOT NULL);
  END IF;

  -- schedule_task_comments
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'schedule_task_comments') THEN
    DROP POLICY IF EXISTS "schedule_task_comments_select_policy" ON schedule_task_comments;
    DROP POLICY IF EXISTS "schedule_task_comments_insert_policy" ON schedule_task_comments;
    DROP POLICY IF EXISTS "schedule_task_comments_select" ON schedule_task_comments;
    DROP POLICY IF EXISTS "schedule_task_comments_insert" ON schedule_task_comments;
    DROP POLICY IF EXISTS "schedule_task_comments_select" ON schedule_task_comments;
    CREATE POLICY "schedule_task_comments_select" ON schedule_task_comments FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);
    DROP POLICY IF EXISTS "schedule_task_comments_insert" ON schedule_task_comments;
    CREATE POLICY "schedule_task_comments_insert" ON schedule_task_comments FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);
  END IF;

  -- schedule_task_time_entries
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'schedule_task_time_entries') THEN
    DROP POLICY IF EXISTS "schedule_task_time_entries_select_policy" ON schedule_task_time_entries;
    DROP POLICY IF EXISTS "schedule_task_time_entries_insert_policy" ON schedule_task_time_entries;
    DROP POLICY IF EXISTS "schedule_task_time_entries_update_policy" ON schedule_task_time_entries;
    DROP POLICY IF EXISTS "schedule_task_time_entries_delete_policy" ON schedule_task_time_entries;
    DROP POLICY IF EXISTS "schedule_task_time_entries_select" ON schedule_task_time_entries;
    DROP POLICY IF EXISTS "schedule_task_time_entries_insert" ON schedule_task_time_entries;
    DROP POLICY IF EXISTS "schedule_task_time_entries_update" ON schedule_task_time_entries;
    DROP POLICY IF EXISTS "schedule_task_time_entries_delete" ON schedule_task_time_entries;
    DROP POLICY IF EXISTS "schedule_task_time_entries_select" ON schedule_task_time_entries;
    CREATE POLICY "schedule_task_time_entries_select" ON schedule_task_time_entries FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);
    DROP POLICY IF EXISTS "schedule_task_time_entries_insert" ON schedule_task_time_entries;
    CREATE POLICY "schedule_task_time_entries_insert" ON schedule_task_time_entries FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);
    DROP POLICY IF EXISTS "schedule_task_time_entries_update" ON schedule_task_time_entries;
    CREATE POLICY "schedule_task_time_entries_update" ON schedule_task_time_entries FOR UPDATE USING ((SELECT auth.uid()) IS NOT NULL);
    DROP POLICY IF EXISTS "schedule_task_time_entries_delete" ON schedule_task_time_entries;
    CREATE POLICY "schedule_task_time_entries_delete" ON schedule_task_time_entries FOR DELETE USING ((SELECT auth.uid()) IS NOT NULL);
  END IF;
END $$;

-- ============================================================================
-- PART 3: FIX TASK_TEMPLATES (0149)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'task_templates') THEN
    DROP POLICY IF EXISTS "task_templates_select_policy" ON task_templates;
    DROP POLICY IF EXISTS "task_templates_insert_policy" ON task_templates;
    DROP POLICY IF EXISTS "task_templates_update_policy" ON task_templates;
    DROP POLICY IF EXISTS "task_templates_delete_policy" ON task_templates;
    DROP POLICY IF EXISTS "task_templates_select" ON task_templates;
    DROP POLICY IF EXISTS "task_templates_insert" ON task_templates;
    DROP POLICY IF EXISTS "task_templates_update" ON task_templates;
    DROP POLICY IF EXISTS "task_templates_delete" ON task_templates;
    DROP POLICY IF EXISTS "task_templates_select" ON task_templates;
    CREATE POLICY "task_templates_select" ON task_templates FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);
    DROP POLICY IF EXISTS "task_templates_insert" ON task_templates;
    CREATE POLICY "task_templates_insert" ON task_templates FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);
    DROP POLICY IF EXISTS "task_templates_update" ON task_templates;
    CREATE POLICY "task_templates_update" ON task_templates FOR UPDATE USING ((SELECT auth.uid()) IS NOT NULL);
    DROP POLICY IF EXISTS "task_templates_delete" ON task_templates;
    CREATE POLICY "task_templates_delete" ON task_templates FOR DELETE USING ((SELECT auth.uid()) IS NOT NULL);
  END IF;
END $$;

-- ============================================================================
-- PART 4: FIX COLLABORATION TABLES (0037)
-- ============================================================================

DO $$
BEGIN
  -- document_locks
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'document_locks') THEN
    DROP POLICY IF EXISTS "Users can view all document locks" ON document_locks;
    DROP POLICY IF EXISTS "document_locks_select" ON document_locks;
    DROP POLICY IF EXISTS "document_locks_select" ON document_locks;
    CREATE POLICY "document_locks_select" ON document_locks FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);
  END IF;

  -- status_updates
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'status_updates') THEN
    DROP POLICY IF EXISTS "Users can view all status updates" ON status_updates;
    DROP POLICY IF EXISTS "status_updates_select" ON status_updates;
    DROP POLICY IF EXISTS "status_updates_select" ON status_updates;
    CREATE POLICY "status_updates_select" ON status_updates FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);
  END IF;
END $$;

-- ============================================================================
-- PART 5: FIX ADVANCED FEATURES (0039)
-- ============================================================================

DO $$
BEGIN
  -- search_index
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'search_index') THEN
    DROP POLICY IF EXISTS "Users can view all search index entries" ON search_index;
    DROP POLICY IF EXISTS "search_index_select" ON search_index;
    DROP POLICY IF EXISTS "search_index_select" ON search_index;
    CREATE POLICY "search_index_select" ON search_index FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);
  END IF;
END $$;

-- ============================================================================
-- PART 6: FIX INTEGRATION SYSTEMS (0041)
-- ============================================================================

DO $$
BEGIN
  -- job_executions
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'job_executions') THEN
    DROP POLICY IF EXISTS "Users can view job executions" ON job_executions;
    DROP POLICY IF EXISTS "job_executions_select" ON job_executions;
    DROP POLICY IF EXISTS "job_executions_select" ON job_executions;
    CREATE POLICY "job_executions_select" ON job_executions FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);
  END IF;
END $$;

-- ============================================================================
-- PART 7: FIX FINAL FEATURES (0043)
-- ============================================================================

DO $$
BEGIN
  -- entity_comments
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'entity_comments') THEN
    DROP POLICY IF EXISTS "Users can view comments" ON entity_comments;
    DROP POLICY IF EXISTS "entity_comments_select" ON entity_comments;
    DROP POLICY IF EXISTS "entity_comments_select" ON entity_comments;
    CREATE POLICY "entity_comments_select" ON entity_comments FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);
  END IF;

  -- import_templates
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'import_templates') THEN
    DROP POLICY IF EXISTS "Users can view import templates" ON import_templates;
    DROP POLICY IF EXISTS "import_templates_select" ON import_templates;
    DROP POLICY IF EXISTS "import_templates_select" ON import_templates;
    CREATE POLICY "import_templates_select" ON import_templates FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);
  END IF;
END $$;

-- ============================================================================
-- PART 8: FIX REVIEWS SYSTEM (0044)
-- ============================================================================

DO $$
BEGIN
  -- review_reactions
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'review_reactions') THEN
    DROP POLICY IF EXISTS "Anyone can view reactions" ON review_reactions;
    DROP POLICY IF EXISTS "review_reactions_select" ON review_reactions;
    DROP POLICY IF EXISTS "review_reactions_select" ON review_reactions;
    CREATE POLICY "review_reactions_select" ON review_reactions FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);
  END IF;

  -- review_statistics
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'review_statistics') THEN
    DROP POLICY IF EXISTS "Anyone can view review statistics" ON review_statistics;
    DROP POLICY IF EXISTS "review_statistics_select" ON review_statistics;
    DROP POLICY IF EXISTS "review_statistics_select" ON review_statistics;
    CREATE POLICY "review_statistics_select" ON review_statistics FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);
  END IF;
END $$;

-- ============================================================================
-- PART 9: FIX CERTIFICATIONS SYSTEM (0046)
-- ============================================================================

DO $$
BEGIN
  -- certification_requirements
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'certification_requirements') THEN
    DROP POLICY IF EXISTS "Anyone can view certification requirements" ON certification_requirements;
    DROP POLICY IF EXISTS "certification_requirements_select" ON certification_requirements;
    DROP POLICY IF EXISTS "certification_requirements_select" ON certification_requirements;
    CREATE POLICY "certification_requirements_select" ON certification_requirements FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);
  END IF;
END $$;

-- ============================================================================
-- PART 10: FIX VERSION CONTROL (0066)
-- ============================================================================

DO $$
BEGIN
  -- field_history
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'field_history') THEN
    DROP POLICY IF EXISTS "field_history_select" ON field_history;
    DROP POLICY IF EXISTS "field_history_select" ON field_history;
    CREATE POLICY "field_history_select" ON field_history FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);
  END IF;
END $$;

-- ============================================================================
-- PART 11: FIX ROLE_DEFINITIONS (0014)
-- ============================================================================

DO $$
BEGIN
  -- role_definitions
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'role_definitions') THEN
    DROP POLICY IF EXISTS "role_definitions_public_select" ON role_definitions;
    DROP POLICY IF EXISTS "role_definitions_select" ON role_definitions;
    DROP POLICY IF EXISTS "role_definitions_select" ON role_definitions;
    CREATE POLICY "role_definitions_select" ON role_definitions FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);
  END IF;
END $$;

-- ============================================================================
-- PART 12: FIX SEARCH_ANALYTICS (0153)
-- ============================================================================

DO $$
BEGIN
  -- search_analytics
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'search_analytics') THEN
    DROP POLICY IF EXISTS "search_analytics_select" ON search_analytics;
    DROP POLICY IF EXISTS "search_analytics_insert" ON search_analytics;
    DROP POLICY IF EXISTS "search_analytics_select" ON search_analytics;
    CREATE POLICY "search_analytics_select" ON search_analytics FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);
    DROP POLICY IF EXISTS "search_analytics_insert" ON search_analytics;
    CREATE POLICY "search_analytics_insert" ON search_analytics FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);
  END IF;
END $$;

-- ============================================================================
-- PART 13: FIX URGENCY_TACTICS (0115)
-- ============================================================================

DO $$
BEGIN
  -- urgency_tactics
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'urgency_tactics') THEN
    DROP POLICY IF EXISTS "urgency_tactics_view" ON urgency_tactics;
    DROP POLICY IF EXISTS "urgency_tactics_select" ON urgency_tactics;
    DROP POLICY IF EXISTS "urgency_tactics_select" ON urgency_tactics;
    CREATE POLICY "urgency_tactics_select" ON urgency_tactics FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);
  END IF;
END $$;

-- ============================================================================
-- PART 14: ENSURE ALL TABLES HAVE RLS ENABLED
-- ============================================================================

DO $$
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
      AND tablename NOT LIKE 'pg_%'
      AND tablename NOT LIKE '_prisma_%'
      AND tablename NOT IN ('schema_migrations', 'supabase_migrations')
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl.tablename);
    EXCEPTION WHEN OTHERS THEN
      -- Ignore errors (table might not exist or RLS already enabled)
      NULL;
    END;
  END LOOP;
END $$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON SCHEMA public IS 'Final security and performance fixes applied. All policies use (SELECT auth.uid()) for optimal performance.';
