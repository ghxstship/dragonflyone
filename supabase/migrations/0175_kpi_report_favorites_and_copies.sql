-- 0175_kpi_report_favorites_and_copies.sql
-- Adds user favorites for KPI reports and ability to duplicate/edit reports

-- =============================================================================
-- KPI Report Favorites Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS kpi_report_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_id UUID NOT NULL REFERENCES kpi_reports(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, report_id)
);

CREATE INDEX IF NOT EXISTS idx_kpi_report_favorites_user ON kpi_report_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_kpi_report_favorites_report ON kpi_report_favorites(report_id);

-- RLS Policies for kpi_report_favorites
ALTER TABLE kpi_report_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kpi_report_favorites_select" ON kpi_report_favorites
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "kpi_report_favorites_insert" ON kpi_report_favorites
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "kpi_report_favorites_delete" ON kpi_report_favorites
  FOR DELETE USING (user_id = auth.uid());

-- =============================================================================
-- Add columns to kpi_reports for user copies
-- =============================================================================
ALTER TABLE kpi_reports ADD COLUMN IF NOT EXISTS source_report_id UUID REFERENCES kpi_reports(id) ON DELETE SET NULL;
ALTER TABLE kpi_reports ADD COLUMN IF NOT EXISTS is_user_copy BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_kpi_reports_source ON kpi_reports(source_report_id) WHERE source_report_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_kpi_reports_user_copy ON kpi_reports(is_user_copy) WHERE is_user_copy = true;

-- =============================================================================
-- Function to toggle favorite status
-- =============================================================================
CREATE OR REPLACE FUNCTION toggle_kpi_report_favorite(p_report_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_exists BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM kpi_report_favorites
    WHERE user_id = v_user_id AND report_id = p_report_id
  ) INTO v_exists;

  IF v_exists THEN
    DELETE FROM kpi_report_favorites
    WHERE user_id = v_user_id AND report_id = p_report_id;
    RETURN false;
  ELSE
    INSERT INTO kpi_report_favorites (user_id, report_id)
    VALUES (v_user_id, p_report_id);
    RETURN true;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION toggle_kpi_report_favorite TO authenticated;

-- =============================================================================
-- Function to duplicate a KPI report
-- =============================================================================
CREATE OR REPLACE FUNCTION duplicate_kpi_report(
  p_report_id UUID,
  p_new_name TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_org_id UUID;
  v_source_report RECORD;
  v_new_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get user's organization
  SELECT organization_id INTO v_org_id
  FROM user_organizations
  WHERE user_id = v_user_id
  LIMIT 1;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'User organization not found';
  END IF;

  -- Get source report
  SELECT * INTO v_source_report
  FROM kpi_reports
  WHERE id = p_report_id;

  IF v_source_report IS NULL THEN
    RAISE EXCEPTION 'Source report not found';
  END IF;

  -- Create duplicate
  INSERT INTO kpi_reports (
    organization_id,
    name,
    description,
    kpi_codes,
    category,
    filters,
    is_global,
    is_user_copy,
    source_report_id,
    created_by
  ) VALUES (
    v_org_id,
    COALESCE(p_new_name, v_source_report.name || ' (Copy)'),
    v_source_report.description,
    v_source_report.kpi_codes,
    v_source_report.category,
    v_source_report.filters,
    false,
    true,
    p_report_id,
    v_user_id
  ) RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION duplicate_kpi_report TO authenticated;

-- =============================================================================
-- Function to check if report is favorited by current user
-- =============================================================================
CREATE OR REPLACE FUNCTION is_kpi_report_favorited(p_report_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM kpi_report_favorites
    WHERE user_id = auth.uid() AND report_id = p_report_id
  );
$$;

GRANT EXECUTE ON FUNCTION is_kpi_report_favorited TO authenticated;

-- =============================================================================
-- Function to get user's favorite reports
-- =============================================================================
CREATE OR REPLACE FUNCTION get_user_favorite_kpi_reports()
RETURNS SETOF kpi_reports
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.*
  FROM kpi_reports r
  INNER JOIN kpi_report_favorites f ON f.report_id = r.id
  WHERE f.user_id = auth.uid()
  ORDER BY f.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION get_user_favorite_kpi_reports TO authenticated;

-- =============================================================================
-- Function to get user's custom reports (copies they've made)
-- =============================================================================
CREATE OR REPLACE FUNCTION get_user_custom_kpi_reports()
RETURNS SETOF kpi_reports
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM kpi_reports
  WHERE created_by = auth.uid() AND is_user_copy = true
  ORDER BY created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION get_user_custom_kpi_reports TO authenticated;

-- =============================================================================
-- Comments
-- =============================================================================
COMMENT ON TABLE kpi_report_favorites IS 'User favorites for KPI reports';
COMMENT ON COLUMN kpi_reports.source_report_id IS 'Reference to original report if this is a user copy';
COMMENT ON COLUMN kpi_reports.is_user_copy IS 'True if this report was duplicated by a user';
COMMENT ON FUNCTION toggle_kpi_report_favorite IS 'Toggle favorite status for a KPI report';
COMMENT ON FUNCTION duplicate_kpi_report IS 'Create a user copy of a KPI report';
