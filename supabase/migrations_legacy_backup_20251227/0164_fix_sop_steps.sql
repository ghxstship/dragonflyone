-- Migration: 0164_fix_sop_steps.sql
-- Description: Add missing column and fix get_sop_with_steps function

-- Add missing column to sop_steps
ALTER TABLE sop_steps ADD COLUMN IF NOT EXISTS is_required BOOLEAN DEFAULT TRUE;

-- Recreate get_sop_with_steps with proper column handling
DROP FUNCTION IF EXISTS get_sop_with_steps(UUID);
CREATE OR REPLACE FUNCTION get_sop_with_steps(p_sop_id UUID)
RETURNS TABLE (sop_id UUID, sop_name TEXT, sop_description TEXT, step_number INT, step_title TEXT, step_description TEXT, step_required BOOLEAN) AS $$
BEGIN
  RETURN QUERY
  SELECT s.id AS sop_id, COALESCE(s.name, s.title, 'SOP')::TEXT AS sop_name, 
    COALESCE(s.description, '')::TEXT AS sop_description, 
    ss.step_number, ss.title::TEXT AS step_title, 
    COALESCE(ss.description, '')::TEXT AS step_description, 
    COALESCE(ss.is_required, TRUE) AS step_required
  FROM sops s LEFT JOIN sop_steps ss ON s.id = ss.sop_id WHERE s.id = p_sop_id ORDER BY ss.step_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
