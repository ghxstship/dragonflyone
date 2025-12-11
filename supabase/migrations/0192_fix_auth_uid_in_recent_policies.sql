-- Migration: Fix auth.uid() in Recent Policies
-- Description: Wraps auth.uid() in (SELECT auth.uid()) for performance in policies created after 0172
-- Date: 2025-12-11

-- ============================================================================
-- FIX SAVED_FILTERS POLICIES (from 0174)
-- ============================================================================

DROP POLICY IF EXISTS "saved_filters_select" ON public.saved_filters;
CREATE POLICY "saved_filters_select" ON public.saved_filters
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "saved_filters_insert" ON public.saved_filters;
CREATE POLICY "saved_filters_insert" ON public.saved_filters
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "saved_filters_update" ON public.saved_filters;
CREATE POLICY "saved_filters_update" ON public.saved_filters
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "saved_filters_delete" ON public.saved_filters;
CREATE POLICY "saved_filters_delete" ON public.saved_filters
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- ============================================================================
-- FIX SAVED_VIEWS POLICIES (from 0174)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own saved views" ON public.saved_views;
CREATE POLICY "Users can view their own saved views" ON public.saved_views
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can create their own saved views" ON public.saved_views;
CREATE POLICY "Users can create their own saved views" ON public.saved_views
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update their own saved views" ON public.saved_views;
CREATE POLICY "Users can update their own saved views" ON public.saved_views
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own saved views" ON public.saved_views;
CREATE POLICY "Users can delete their own saved views" ON public.saved_views
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- ============================================================================
-- FIX KPI_REPORT_FAVORITES POLICIES (from 0175)
-- ============================================================================

DROP POLICY IF EXISTS "kpi_report_favorites_select" ON public.kpi_report_favorites;
CREATE POLICY "kpi_report_favorites_select" ON public.kpi_report_favorites
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "kpi_report_favorites_insert" ON public.kpi_report_favorites;
CREATE POLICY "kpi_report_favorites_insert" ON public.kpi_report_favorites
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "kpi_report_favorites_delete" ON public.kpi_report_favorites;
CREATE POLICY "kpi_report_favorites_delete" ON public.kpi_report_favorites
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- ============================================================================
-- NOTE: The auth.uid() calls inside function bodies (0175, 0185) are fine
-- because they are inside SECURITY DEFINER functions with SET search_path
-- The linter only flags auth.uid() in RLS policies, not in function bodies
-- ============================================================================
