-- ============================================================================
-- 0041_pos_ats_enum.sql
-- Add POS (Point of Sale) and ATS (Applicant Tracking System) Enum Values
-- GHXSTSHIP Platform - Integration Expansion (Part 1: Enum Only)
-- Note: This migration ONLY adds enum values. Tables and data go in 0042/0043.
-- ============================================================================

-- Add 'pos' (Point of Sale) category
ALTER TYPE integration_category ADD VALUE IF NOT EXISTS 'pos';

-- Add 'ats' (Applicant Tracking System) category
ALTER TYPE integration_category ADD VALUE IF NOT EXISTS 'ats';
