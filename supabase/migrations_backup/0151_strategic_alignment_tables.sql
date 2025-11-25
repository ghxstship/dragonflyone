-- Migration: Strategic Alignment Tables
-- Description: Tables for strategic alignment scoring and objective tracking

-- Strategic objectives table
CREATE TABLE IF NOT EXISTS strategic_objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(30) NOT NULL CHECK (category IN ('growth', 'efficiency', 'innovation', 'customer', 'financial', 'operational', 'talent')),
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived', 'on_hold')),
  target_date TIMESTAMPTZ,
  success_metrics JSONB,
  owner_id UUID REFERENCES platform_users(id),
  parent_objective_id UUID REFERENCES strategic_objectives(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project alignment scores table
CREATE TABLE IF NOT EXISTS project_alignment_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  strategic_objective_id UUID NOT NULL REFERENCES strategic_objectives(id) ON DELETE CASCADE,
  alignment_score INTEGER NOT NULL CHECK (alignment_score >= 0 AND alignment_score <= 100),
  impact_score INTEGER DEFAULT 50 CHECK (impact_score >= 0 AND impact_score <= 100),
  effort_score INTEGER DEFAULT 50 CHECK (effort_score >= 0 AND effort_score <= 100),
  risk_score INTEGER DEFAULT 50 CHECK (risk_score >= 0 AND risk_score <= 100),
  notes TEXT,
  scored_by UUID NOT NULL REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, strategic_objective_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_strategic_objectives_category ON strategic_objectives(category);
CREATE INDEX IF NOT EXISTS idx_strategic_objectives_priority ON strategic_objectives(priority);
CREATE INDEX IF NOT EXISTS idx_strategic_objectives_status ON strategic_objectives(status);
CREATE INDEX IF NOT EXISTS idx_strategic_objectives_owner ON strategic_objectives(owner_id);
CREATE INDEX IF NOT EXISTS idx_strategic_objectives_parent ON strategic_objectives(parent_objective_id);
CREATE INDEX IF NOT EXISTS idx_project_alignment_project ON project_alignment_scores(project_id);
CREATE INDEX IF NOT EXISTS idx_project_alignment_objective ON project_alignment_scores(strategic_objective_id);

-- RLS Policies
ALTER TABLE strategic_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_alignment_scores ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view objectives
CREATE POLICY objectives_view ON strategic_objectives
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Admins can manage objectives
CREATE POLICY objectives_admin ON strategic_objectives
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users 
      WHERE id = auth.uid() 
      AND ('ATLVS_ADMIN' = ANY(platform_roles) OR 'LEGEND_ADMIN' = ANY(platform_roles))
    )
  );

-- Team members can view alignment scores
CREATE POLICY alignment_view ON project_alignment_scores
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Team members can create/update scores
CREATE POLICY alignment_manage ON project_alignment_scores
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users 
      WHERE id = auth.uid() 
      AND ('ATLVS_TEAM_MEMBER' = ANY(platform_roles) OR 'ATLVS_ADMIN' = ANY(platform_roles))
    )
  );

-- Function to calculate composite alignment score
CREATE OR REPLACE FUNCTION calculate_project_alignment(p_project_id UUID)
RETURNS TABLE (
  composite_score NUMERIC,
  alignment_grade VARCHAR(2),
  objective_count INTEGER
) AS $$
DECLARE
  v_score NUMERIC;
  v_count INTEGER;
BEGIN
  SELECT 
    AVG((alignment_score * 0.4) + (impact_score * 0.3) + ((100 - effort_score) * 0.15) + ((100 - risk_score) * 0.15)),
    COUNT(*)
  INTO v_score, v_count
  FROM project_alignment_scores
  WHERE project_id = p_project_id;

  RETURN QUERY SELECT 
    ROUND(COALESCE(v_score, 0), 2),
    CASE 
      WHEN v_score >= 90 THEN 'A+'
      WHEN v_score >= 85 THEN 'A'
      WHEN v_score >= 80 THEN 'A-'
      WHEN v_score >= 75 THEN 'B+'
      WHEN v_score >= 70 THEN 'B'
      WHEN v_score >= 65 THEN 'B-'
      WHEN v_score >= 60 THEN 'C+'
      WHEN v_score >= 55 THEN 'C'
      WHEN v_score >= 50 THEN 'C-'
      WHEN v_score >= 45 THEN 'D+'
      WHEN v_score >= 40 THEN 'D'
      ELSE 'F'
    END::VARCHAR(2),
    COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql;
