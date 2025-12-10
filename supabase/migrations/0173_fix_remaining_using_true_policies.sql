-- Migration: 0173_fix_remaining_using_true_policies.sql
-- Description: Fix the last remaining policies with USING (true)

-- FIX change_requests policy
DROP POLICY IF EXISTS "change_requests_select" ON change_requests;
CREATE POLICY "change_requests_select" ON change_requests FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

-- FIX discounts policy
DROP POLICY IF EXISTS "discounts_select" ON discounts;
CREATE POLICY "discounts_select" ON discounts FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

-- FIX version_snapshots policy
DROP POLICY IF EXISTS "version_snapshots_select" ON version_snapshots;
CREATE POLICY "version_snapshots_select" ON version_snapshots FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);
