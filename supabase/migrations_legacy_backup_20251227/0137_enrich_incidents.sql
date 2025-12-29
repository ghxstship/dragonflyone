-- Migration: Enrich Incidents System
-- Description: Enhanced incident reporting from ExperienceGeneratorSchema

-- Add incident type enum (more comprehensive)
DO $$ BEGIN
  CREATE TYPE incident_category_enum AS ENUM (
    'medical', 'security', 'property', 'guest_complaint', 'injury', 
    'theft', 'altercation', 'technical', 'weather', 'crowd', 
    'fire', 'hazmat', 'missing_person', 'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add severity level enum
DO $$ BEGIN
  CREATE TYPE severity_level_enum AS ENUM ('1', '2', '3', '4', '5');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add incident status enum
DO $$ BEGIN
  CREATE TYPE incident_resolution_status_enum AS ENUM (
    'open', 'investigating', 'pending_review', 'resolved', 'closed', 'reopened'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Enrich existing incident tables or create comprehensive one
CREATE TABLE IF NOT EXISTS production_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  production_id UUID REFERENCES productions(id) ON DELETE CASCADE,
  show_id UUID REFERENCES shows(id),
  event_id UUID REFERENCES events(id),
  report_number VARCHAR(50) UNIQUE,
  
  -- Time & Location
  incident_at TIMESTAMPTZ NOT NULL,
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  zone_id UUID REFERENCES zones(id),
  location_description TEXT,
  latitude NUMERIC(10,8),
  longitude NUMERIC(11,8),
  
  -- Classification
  incident_category incident_category_enum NOT NULL,
  severity severity_level_enum NOT NULL,
  status incident_resolution_status_enum DEFAULT 'open',
  
  -- Description
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- People Involved
  persons_involved JSONB DEFAULT '[]',
  witnesses JSONB DEFAULT '[]',
  injured_parties JSONB DEFAULT '[]',
  
  -- Response
  immediate_actions TEXT,
  response_actions TEXT,
  response_time_minutes INTEGER,
  
  -- Medical
  medical_attention BOOLEAN DEFAULT false,
  medical_details TEXT,
  ems_called BOOLEAN DEFAULT false,
  ems_arrival_time TIMESTAMPTZ,
  hospital_transport BOOLEAN DEFAULT false,
  hospital_name TEXT,
  
  -- Law Enforcement
  law_enforcement_called BOOLEAN DEFAULT false,
  law_enforcement_arrival_time TIMESTAMPTZ,
  law_enforcement_report VARCHAR(100),
  law_enforcement_officer TEXT,
  law_enforcement_badge TEXT,
  arrest_made BOOLEAN DEFAULT false,
  
  -- Fire Department
  fire_dept_called BOOLEAN DEFAULT false,
  fire_dept_arrival_time TIMESTAMPTZ,
  fire_dept_report VARCHAR(100),
  
  -- Documentation
  photos TEXT[] DEFAULT '{}',
  videos TEXT[] DEFAULT '{}',
  audio_recordings TEXT[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  
  -- Follow-up
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_description TEXT,
  follow_up_due DATE,
  follow_up_completed BOOLEAN DEFAULT false,
  follow_up_completed_at TIMESTAMPTZ,
  follow_up_completed_by UUID REFERENCES platform_users(id),
  
  -- Insurance
  insurance_notified BOOLEAN DEFAULT false,
  insurance_notified_at TIMESTAMPTZ,
  insurance_claim_number VARCHAR(100),
  insurance_claim_status TEXT,
  estimated_damages NUMERIC(12,2),
  
  -- Legal
  legal_notified BOOLEAN DEFAULT false,
  legal_notified_at TIMESTAMPTZ,
  legal_case_number VARCHAR(100),
  litigation_status TEXT,
  
  -- Signatures/Review
  reported_by_id UUID REFERENCES platform_users(id),
  reported_by_name TEXT,
  reported_by_role TEXT,
  reviewed_by_id UUID REFERENCES platform_users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  closed_by_id UUID REFERENCES platform_users(id),
  closed_at TIMESTAMPTZ,
  closure_notes TEXT,
  
  -- Root Cause
  root_cause TEXT,
  contributing_factors TEXT[],
  preventive_measures TEXT,
  
  -- Meta
  is_osha_recordable BOOLEAN DEFAULT false,
  is_workers_comp BOOLEAN DEFAULT false,
  notes TEXT,
  internal_notes TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Incident updates/timeline
CREATE TABLE IF NOT EXISTS incident_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES production_incidents(id) ON DELETE CASCADE,
  update_type TEXT NOT NULL CHECK (update_type IN ('status_change', 'note', 'action', 'escalation', 'resolution', 'follow_up')),
  previous_status incident_resolution_status_enum,
  new_status incident_resolution_status_enum,
  title TEXT,
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  created_by_id UUID REFERENCES platform_users(id),
  created_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Incident corrective actions
CREATE TABLE IF NOT EXISTS incident_corrective_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES production_incidents(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('immediate', 'short_term', 'long_term', 'preventive', 'training', 'policy_change')),
  title TEXT NOT NULL,
  description TEXT,
  assigned_to_id UUID REFERENCES platform_users(id),
  assigned_to_name TEXT,
  due_date DATE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'verified', 'cancelled')),
  completed_at TIMESTAMPTZ,
  completed_by_id UUID REFERENCES platform_users(id),
  verification_required BOOLEAN DEFAULT true,
  verified_at TIMESTAMPTZ,
  verified_by_id UUID REFERENCES platform_users(id),
  verification_notes TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_production_incidents_org ON production_incidents(organization_id);
CREATE INDEX IF NOT EXISTS idx_production_incidents_production ON production_incidents(production_id);
CREATE INDEX IF NOT EXISTS idx_production_incidents_show ON production_incidents(show_id);
CREATE INDEX IF NOT EXISTS idx_production_incidents_category ON production_incidents(incident_category);
CREATE INDEX IF NOT EXISTS idx_production_incidents_severity ON production_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_production_incidents_status ON production_incidents(status);
CREATE INDEX IF NOT EXISTS idx_production_incidents_date ON production_incidents(incident_at);
CREATE INDEX IF NOT EXISTS idx_production_incidents_report_number ON production_incidents(report_number);

CREATE INDEX IF NOT EXISTS idx_incident_updates_incident ON incident_updates(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_updates_type ON incident_updates(update_type);

CREATE INDEX IF NOT EXISTS idx_incident_corrective_actions_incident ON incident_corrective_actions(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_corrective_actions_status ON incident_corrective_actions(status);
CREATE INDEX IF NOT EXISTS idx_incident_corrective_actions_due ON incident_corrective_actions(due_date);

-- Function to generate incident report number
CREATE OR REPLACE FUNCTION generate_incident_report_number(p_org_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_year TEXT;
  v_sequence INTEGER;
BEGIN
  v_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  SELECT COALESCE(MAX(
    CASE WHEN report_number ~ ('^IR-' || v_year || '-[0-9]+$')
    THEN CAST(SUBSTRING(report_number FROM '[0-9]+$') AS INTEGER) ELSE 0 END
  ), 0) + 1 INTO v_sequence
  FROM production_incidents 
  WHERE organization_id = p_org_id 
    AND report_number LIKE 'IR-' || v_year || '-%';
  
  RETURN 'IR-' || v_year || '-' || LPAD(v_sequence::TEXT, 5, '0');
END;
$$;

-- Function to get incident summary
CREATE OR REPLACE FUNCTION get_incident_summary(p_incident_id UUID)
RETURNS TABLE (
  incident_id UUID,
  report_number VARCHAR(50),
  title TEXT,
  incident_category incident_category_enum,
  severity severity_level_enum,
  status incident_resolution_status_enum,
  incident_at TIMESTAMPTZ,
  location TEXT,
  persons_involved_count INTEGER,
  has_injuries BOOLEAN,
  has_law_enforcement BOOLEAN,
  has_insurance_claim BOOLEAN,
  updates_count INTEGER,
  corrective_actions_count INTEGER,
  corrective_actions_pending INTEGER,
  days_open INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pi.id,
    pi.report_number,
    pi.title,
    pi.incident_category,
    pi.severity,
    pi.status,
    pi.incident_at,
    COALESCE(z.name, pi.location_description) AS location,
    jsonb_array_length(pi.persons_involved)::INTEGER AS persons_involved_count,
    pi.medical_attention OR jsonb_array_length(pi.injured_parties) > 0 AS has_injuries,
    pi.law_enforcement_called AS has_law_enforcement,
    pi.insurance_claim_number IS NOT NULL AS has_insurance_claim,
    (SELECT COUNT(*)::INTEGER FROM incident_updates WHERE incident_id = pi.id) AS updates_count,
    (SELECT COUNT(*)::INTEGER FROM incident_corrective_actions WHERE incident_id = pi.id) AS corrective_actions_count,
    (SELECT COUNT(*)::INTEGER FROM incident_corrective_actions WHERE incident_id = pi.id AND status IN ('pending', 'in_progress')) AS corrective_actions_pending,
    (CURRENT_DATE - pi.incident_at::DATE)::INTEGER AS days_open
  FROM production_incidents pi
  LEFT JOIN zones z ON pi.zone_id = z.id
  WHERE pi.id = p_incident_id;
END;
$$;

-- Function to get incident statistics
CREATE OR REPLACE FUNCTION get_incident_statistics(
  p_production_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  total_incidents INTEGER,
  open_incidents INTEGER,
  resolved_incidents INTEGER,
  by_category JSONB,
  by_severity JSONB,
  avg_resolution_days NUMERIC,
  incidents_with_injuries INTEGER,
  incidents_with_law_enforcement INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER AS total_incidents,
    COUNT(*) FILTER (WHERE status IN ('open', 'investigating'))::INTEGER AS open_incidents,
    COUNT(*) FILTER (WHERE status IN ('resolved', 'closed'))::INTEGER AS resolved_incidents,
    (SELECT jsonb_object_agg(incident_category, cnt) FROM (
      SELECT incident_category, COUNT(*) AS cnt 
      FROM production_incidents 
      WHERE production_id = p_production_id
        AND (p_start_date IS NULL OR incident_at::DATE >= p_start_date)
        AND (p_end_date IS NULL OR incident_at::DATE <= p_end_date)
      GROUP BY incident_category
    ) sub) AS by_category,
    (SELECT jsonb_object_agg(severity, cnt) FROM (
      SELECT severity, COUNT(*) AS cnt 
      FROM production_incidents 
      WHERE production_id = p_production_id
        AND (p_start_date IS NULL OR incident_at::DATE >= p_start_date)
        AND (p_end_date IS NULL OR incident_at::DATE <= p_end_date)
      GROUP BY severity
    ) sub) AS by_severity,
    ROUND(AVG(
      CASE WHEN closed_at IS NOT NULL 
      THEN EXTRACT(EPOCH FROM (closed_at - incident_at)) / 86400 
      ELSE NULL END
    )::NUMERIC, 2) AS avg_resolution_days,
    COUNT(*) FILTER (WHERE medical_attention = true)::INTEGER AS incidents_with_injuries,
    COUNT(*) FILTER (WHERE law_enforcement_called = true)::INTEGER AS incidents_with_law_enforcement
  FROM production_incidents
  WHERE production_id = p_production_id
    AND (p_start_date IS NULL OR incident_at::DATE >= p_start_date)
    AND (p_end_date IS NULL OR incident_at::DATE <= p_end_date);
END;
$$;

-- Trigger to log status changes
CREATE OR REPLACE FUNCTION log_incident_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO incident_updates (
      incident_id, update_type, previous_status, new_status, 
      content, created_by_id
    ) VALUES (
      NEW.id, 'status_change', OLD.status, NEW.status,
      'Status changed from ' || OLD.status || ' to ' || NEW.status,
      NEW.reviewed_by_id
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS incident_status_change_trigger ON production_incidents;
CREATE TRIGGER incident_status_change_trigger
  AFTER UPDATE OF status ON production_incidents
  FOR EACH ROW
  EXECUTE FUNCTION log_incident_status_change();

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_incidents_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS production_incidents_updated_at ON production_incidents;
CREATE TRIGGER production_incidents_updated_at
  BEFORE UPDATE ON production_incidents
  FOR EACH ROW EXECUTE FUNCTION update_incidents_timestamp();

DROP TRIGGER IF EXISTS incident_corrective_actions_updated_at ON incident_corrective_actions;
CREATE TRIGGER incident_corrective_actions_updated_at
  BEFORE UPDATE ON incident_corrective_actions
  FOR EACH ROW EXECUTE FUNCTION update_incidents_timestamp();

-- RLS Policies
ALTER TABLE production_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_corrective_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY production_incidents_select ON production_incidents
  FOR SELECT TO authenticated
  USING (org_matches(organization_id) OR production_id IN (SELECT id FROM productions WHERE org_matches(organization_id)));

CREATE POLICY production_incidents_manage ON production_incidents
  FOR ALL TO authenticated
  USING (role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN'))
  WITH CHECK (role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN'));

CREATE POLICY incident_updates_select ON incident_updates
  FOR SELECT TO authenticated
  USING (incident_id IN (SELECT id FROM production_incidents WHERE org_matches(organization_id)));

CREATE POLICY incident_updates_insert ON incident_updates
  FOR INSERT TO authenticated
  WITH CHECK (role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN'));

CREATE POLICY incident_corrective_actions_select ON incident_corrective_actions
  FOR SELECT TO authenticated
  USING (incident_id IN (SELECT id FROM production_incidents WHERE org_matches(organization_id)));

CREATE POLICY incident_corrective_actions_manage ON incident_corrective_actions
  FOR ALL TO authenticated
  USING (role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN'))
  WITH CHECK (role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON production_incidents TO authenticated;
GRANT SELECT, INSERT ON incident_updates TO authenticated;
GRANT SELECT, INSERT, UPDATE ON incident_corrective_actions TO authenticated;

GRANT EXECUTE ON FUNCTION generate_incident_report_number(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_incident_summary(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_incident_statistics(UUID, DATE, DATE) TO authenticated;
