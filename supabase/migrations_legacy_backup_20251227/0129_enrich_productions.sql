-- Migration: Enrich Productions Table
-- Description: Add immersive experience production fields from ExperienceGeneratorSchema

-- Add production format enum
DO $$ BEGIN
  CREATE TYPE production_format_enum AS ENUM (
    'immersive', 'festival', 'activation', 'installation', 
    'theater', 'concert', 'conference', 'corporate', 'private', 'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add production status enum (more granular than existing)
DO $$ BEGIN
  CREATE TYPE production_lifecycle_enum AS ENUM (
    'draft', 'planning', 'pre_production', 'production', 
    'active', 'completed', 'cancelled', 'archived'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add new columns to productions table
ALTER TABLE productions
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS tagline TEXT,
  ADD COLUMN IF NOT EXISTS elevator_pitch TEXT,
  ADD COLUMN IF NOT EXISTS format production_format_enum,
  ADD COLUMN IF NOT EXISTS lifecycle_status production_lifecycle_enum DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS genre TEXT,
  ADD COLUMN IF NOT EXISTS target_transformation TEXT,
  ADD COLUMN IF NOT EXISTS capacity_per_show INTEGER,
  ADD COLUMN IF NOT EXISTS shows_per_day INTEGER,
  ADD COLUMN IF NOT EXISTS runtime_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS announcement_date DATE,
  ADD COLUMN IF NOT EXISTS on_sale_date DATE,
  ADD COLUMN IF NOT EXISTS preview_start DATE,
  ADD COLUMN IF NOT EXISTS opening_date DATE,
  ADD COLUMN IF NOT EXISTS closing_date DATE,
  ADD COLUMN IF NOT EXISTS load_in_start DATE,
  ADD COLUMN IF NOT EXISTS load_out_end DATE,
  ADD COLUMN IF NOT EXISTS production_budget NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS operating_budget_weekly NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS ticket_price_min NUMERIC(8,2),
  ADD COLUMN IF NOT EXISTS ticket_price_max NUMERIC(8,2),
  ADD COLUMN IF NOT EXISTS projected_gross NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS break_even_percentage NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS sponsorship_target NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS color_palette JSONB,
  ADD COLUMN IF NOT EXISTS sensory_design JSONB,
  ADD COLUMN IF NOT EXISTS xyz_foundation JSONB,
  ADD COLUMN IF NOT EXISTS url_irl_journey JSONB,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_productions_slug ON productions(slug);
CREATE INDEX IF NOT EXISTS idx_productions_format ON productions(format);
CREATE INDEX IF NOT EXISTS idx_productions_lifecycle ON productions(lifecycle_status);
CREATE INDEX IF NOT EXISTS idx_productions_opening ON productions(opening_date);
CREATE INDEX IF NOT EXISTS idx_productions_closing ON productions(closing_date);
CREATE INDEX IF NOT EXISTS idx_productions_deleted ON productions(deleted_at) WHERE deleted_at IS NULL;

-- Add comments
COMMENT ON COLUMN productions.tagline IS 'Short marketing tagline for the production';
COMMENT ON COLUMN productions.elevator_pitch IS 'Brief description for pitching to stakeholders';
COMMENT ON COLUMN productions.format IS 'Production format: immersive, festival, activation, etc.';
COMMENT ON COLUMN productions.target_transformation IS 'Desired audience transformation/experience outcome';
COMMENT ON COLUMN productions.sensory_design IS 'Sensory design elements: sight, sound, smell, touch, taste';
COMMENT ON COLUMN productions.xyz_foundation IS 'XYZ foundation framework data for immersive design';
COMMENT ON COLUMN productions.url_irl_journey IS 'URL to IRL journey mapping and experience design';
COMMENT ON COLUMN productions.break_even_percentage IS 'Percentage of capacity needed to break even';

-- Function to calculate production financials
CREATE OR REPLACE FUNCTION calculate_production_financials(p_production_id UUID)
RETURNS TABLE (
  production_id UUID,
  total_budget NUMERIC,
  projected_revenue NUMERIC,
  break_even_attendance INTEGER,
  projected_profit NUMERIC,
  roi_percentage NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_prod RECORD;
  v_total_shows INTEGER;
  v_break_even_attendance INTEGER;
BEGIN
  SELECT * INTO v_prod FROM productions WHERE id = p_production_id;
  
  -- Calculate total shows
  v_total_shows := COALESCE(v_prod.shows_per_day, 1) * 
    COALESCE(
      (v_prod.closing_date - v_prod.opening_date + 1),
      30
    );
  
  -- Calculate break even attendance
  IF v_prod.ticket_price_min > 0 AND v_prod.production_budget > 0 THEN
    v_break_even_attendance := CEIL(v_prod.production_budget / v_prod.ticket_price_min);
  ELSE
    v_break_even_attendance := 0;
  END IF;
  
  RETURN QUERY
  SELECT 
    p_production_id,
    COALESCE(v_prod.production_budget, 0) + 
      COALESCE(v_prod.operating_budget_weekly, 0) * 
      CEIL(COALESCE((v_prod.closing_date - v_prod.opening_date + 1)::NUMERIC / 7, 4)) AS total_budget,
    COALESCE(v_prod.projected_gross, 0) AS projected_revenue,
    v_break_even_attendance,
    COALESCE(v_prod.projected_gross, 0) - 
      (COALESCE(v_prod.production_budget, 0) + 
       COALESCE(v_prod.operating_budget_weekly, 0) * 
       CEIL(COALESCE((v_prod.closing_date - v_prod.opening_date + 1)::NUMERIC / 7, 4))) AS projected_profit,
    CASE 
      WHEN COALESCE(v_prod.production_budget, 0) > 0 THEN
        ROUND(((COALESCE(v_prod.projected_gross, 0) - v_prod.production_budget) / v_prod.production_budget) * 100, 2)
      ELSE 0
    END AS roi_percentage;
END;
$$;

-- Function to get production dashboard summary
CREATE OR REPLACE FUNCTION get_production_dashboard_summary(p_production_id UUID)
RETURNS TABLE (
  production_id UUID,
  production_name TEXT,
  format production_format_enum,
  lifecycle_status production_lifecycle_enum,
  days_until_opening INTEGER,
  days_until_closing INTEGER,
  total_shows_scheduled INTEGER,
  crew_count INTEGER,
  open_tasks INTEGER,
  budget_utilization NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.format,
    p.lifecycle_status,
    (p.opening_date - CURRENT_DATE)::INTEGER AS days_until_opening,
    (p.closing_date - CURRENT_DATE)::INTEGER AS days_until_closing,
    COALESCE((SELECT COUNT(*)::INTEGER FROM run_of_shows WHERE project_id = p.project_id), 0) AS total_shows_scheduled,
    COALESCE((SELECT COUNT(DISTINCT crew_id)::INTEGER FROM crew_assignments WHERE project_id = p.project_id), 0) AS crew_count,
    COALESCE((SELECT COUNT(*)::INTEGER FROM tasks WHERE project_id = p.project_id AND status NOT IN ('completed', 'cancelled')), 0) AS open_tasks,
    CASE 
      WHEN p.production_budget > 0 THEN
        ROUND((COALESCE(p.actual_cost, 0) / p.production_budget) * 100, 2)
      ELSE 0
    END AS budget_utilization
  FROM productions p
  WHERE p.id = p_production_id
    AND p.deleted_at IS NULL;
END;
$$;

-- Trigger to auto-update lifecycle status based on dates
CREATE OR REPLACE FUNCTION update_production_lifecycle()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Don't override if manually set to cancelled or archived
  IF NEW.lifecycle_status IN ('cancelled', 'archived') THEN
    RETURN NEW;
  END IF;
  
  -- Auto-determine status based on dates
  IF NEW.closing_date IS NOT NULL AND CURRENT_DATE > NEW.closing_date THEN
    NEW.lifecycle_status := 'completed';
  ELSIF NEW.opening_date IS NOT NULL AND CURRENT_DATE >= NEW.opening_date THEN
    NEW.lifecycle_status := 'active';
  ELSIF NEW.load_in_start IS NOT NULL AND CURRENT_DATE >= NEW.load_in_start THEN
    NEW.lifecycle_status := 'production';
  ELSIF NEW.preview_start IS NOT NULL AND CURRENT_DATE >= NEW.preview_start - 30 THEN
    NEW.lifecycle_status := 'pre_production';
  ELSIF NEW.announcement_date IS NOT NULL THEN
    NEW.lifecycle_status := 'planning';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS production_lifecycle_trigger ON productions;
CREATE TRIGGER production_lifecycle_trigger
  BEFORE INSERT OR UPDATE ON productions
  FOR EACH ROW
  EXECUTE FUNCTION update_production_lifecycle();

-- Grant permissions
GRANT EXECUTE ON FUNCTION calculate_production_financials(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_production_dashboard_summary(UUID) TO authenticated;
