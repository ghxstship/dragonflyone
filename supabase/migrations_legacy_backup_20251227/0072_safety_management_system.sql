-- Migration: Safety Management System
-- Description: Tables for safety incidents, investigations, and compliance

-- Safety incidents table
CREATE TABLE IF NOT EXISTS safety_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  incident_number TEXT NOT NULL,
  incident_type TEXT NOT NULL CHECK (incident_type IN ('near_miss', 'equipment_malfunction', 'injury', 'property_damage', 'environmental', 'security', 'fire', 'slip_fall', 'electrical', 'chemical', 'other')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  event_id UUID REFERENCES events(id),
  project_id UUID REFERENCES projects(id),
  venue_id UUID REFERENCES venues(id),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  injuries_count INT DEFAULT 0,
  fatalities_count INT DEFAULT 0,
  witnesses TEXT[],
  photos TEXT[],
  immediate_actions TEXT,
  root_cause TEXT,
  corrective_actions TEXT,
  preventive_measures TEXT,
  status TEXT NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'investigating', 'resolved', 'closed', 'reopened')),
  incident_date TIMESTAMPTZ NOT NULL,
  reported_by UUID REFERENCES platform_users(id),
  assigned_to UUID REFERENCES platform_users(id),
  investigation_started_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES platform_users(id),
  resolution_notes TEXT,
  closed_at TIMESTAMPTZ,
  closed_by UUID REFERENCES platform_users(id),
  osha_recordable BOOLEAN DEFAULT false,
  workers_comp_claim BOOLEAN DEFAULT false,
  insurance_claim_number TEXT,
  estimated_cost NUMERIC(15,2),
  actual_cost NUMERIC(15,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, incident_number)
);

CREATE INDEX IF NOT EXISTS idx_safety_incidents_org ON safety_incidents(organization_id);
CREATE INDEX IF NOT EXISTS idx_safety_incidents_type ON safety_incidents(incident_type);
CREATE INDEX IF NOT EXISTS idx_safety_incidents_severity ON safety_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_safety_incidents_status ON safety_incidents(status);
CREATE INDEX IF NOT EXISTS idx_safety_incidents_date ON safety_incidents(incident_date);
CREATE INDEX IF NOT EXISTS idx_safety_incidents_event ON safety_incidents(event_id);

-- Safety investigations table
CREATE TABLE IF NOT EXISTS safety_investigations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES safety_incidents(id),
  investigator_id UUID NOT NULL REFERENCES platform_users(id),
  investigation_type TEXT NOT NULL DEFAULT 'standard' CHECK (investigation_type IN ('standard', 'root_cause', 'comprehensive', 'external')),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'pending_review', 'completed', 'closed')),
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  findings TEXT,
  root_cause_analysis TEXT,
  contributing_factors TEXT[],
  recommendations TEXT,
  evidence_collected JSONB,
  interviews_conducted JSONB,
  timeline_of_events TEXT,
  reviewed_by UUID REFERENCES platform_users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_safety_investigations_incident ON safety_investigations(incident_id);
CREATE INDEX IF NOT EXISTS idx_safety_investigations_investigator ON safety_investigations(investigator_id);
CREATE INDEX IF NOT EXISTS idx_safety_investigations_status ON safety_investigations(status);

-- Safety corrective actions table
CREATE TABLE IF NOT EXISTS safety_corrective_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES safety_incidents(id),
  investigation_id UUID REFERENCES safety_investigations(id),
  action_type TEXT NOT NULL CHECK (action_type IN ('immediate', 'short_term', 'long_term', 'preventive', 'training', 'policy_change', 'equipment_modification')),
  description TEXT NOT NULL,
  assigned_to UUID REFERENCES platform_users(id),
  due_date DATE,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'verified', 'cancelled')),
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES platform_users(id),
  verification_required BOOLEAN DEFAULT true,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES platform_users(id),
  verification_notes TEXT,
  estimated_cost NUMERIC(10,2),
  actual_cost NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_safety_corrective_actions_incident ON safety_corrective_actions(incident_id);
CREATE INDEX IF NOT EXISTS idx_safety_corrective_actions_status ON safety_corrective_actions(status);
CREATE INDEX IF NOT EXISTS idx_safety_corrective_actions_due ON safety_corrective_actions(due_date);

-- Safety inspections table
CREATE TABLE IF NOT EXISTS safety_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  inspection_type TEXT NOT NULL CHECK (inspection_type IN ('routine', 'pre_event', 'post_event', 'equipment', 'fire', 'electrical', 'structural', 'compliance', 'special')),
  event_id UUID REFERENCES events(id),
  venue_id UUID REFERENCES venues(id),
  project_id UUID REFERENCES projects(id),
  inspector_id UUID NOT NULL REFERENCES platform_users(id),
  inspection_date DATE NOT NULL,
  scheduled_date DATE,
  checklist_template_id UUID,
  checklist_items JSONB,
  findings TEXT,
  deficiencies_found INT DEFAULT 0,
  critical_issues INT DEFAULT 0,
  overall_rating TEXT CHECK (overall_rating IN ('pass', 'pass_with_conditions', 'fail', 'needs_reinspection')),
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  photos TEXT[],
  documents TEXT[],
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_safety_inspections_org ON safety_inspections(organization_id);
CREATE INDEX IF NOT EXISTS idx_safety_inspections_type ON safety_inspections(inspection_type);
CREATE INDEX IF NOT EXISTS idx_safety_inspections_date ON safety_inspections(inspection_date);
CREATE INDEX IF NOT EXISTS idx_safety_inspections_venue ON safety_inspections(venue_id);

-- Safety training records table
CREATE TABLE IF NOT EXISTS safety_training_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  training_type TEXT NOT NULL CHECK (training_type IN ('orientation', 'hazard_communication', 'fire_safety', 'first_aid', 'cpr', 'equipment_specific', 'rigging', 'electrical', 'fall_protection', 'confined_space', 'lockout_tagout', 'other')),
  training_name TEXT NOT NULL,
  provider TEXT,
  completion_date DATE NOT NULL,
  expiration_date DATE,
  certificate_number TEXT,
  certificate_url TEXT,
  score NUMERIC(5,2),
  passed BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_safety_training_records_org ON safety_training_records(organization_id);
CREATE INDEX IF NOT EXISTS idx_safety_training_records_user ON safety_training_records(user_id);
CREATE INDEX IF NOT EXISTS idx_safety_training_records_type ON safety_training_records(training_type);
CREATE INDEX IF NOT EXISTS idx_safety_training_records_expiration ON safety_training_records(expiration_date);

-- Safety equipment table
CREATE TABLE IF NOT EXISTS safety_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  equipment_type TEXT NOT NULL CHECK (equipment_type IN ('fire_extinguisher', 'first_aid_kit', 'aed', 'eye_wash', 'safety_shower', 'spill_kit', 'ppe', 'fall_protection', 'barricade', 'signage', 'other')),
  name TEXT NOT NULL,
  serial_number TEXT,
  location TEXT NOT NULL,
  venue_id UUID REFERENCES venues(id),
  last_inspection_date DATE,
  next_inspection_date DATE,
  expiration_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'needs_inspection', 'needs_service', 'out_of_service', 'expired', 'retired')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_safety_equipment_org ON safety_equipment(organization_id);
CREATE INDEX IF NOT EXISTS idx_safety_equipment_type ON safety_equipment(equipment_type);
CREATE INDEX IF NOT EXISTS idx_safety_equipment_venue ON safety_equipment(venue_id);
CREATE INDEX IF NOT EXISTS idx_safety_equipment_next_inspection ON safety_equipment(next_inspection_date);

-- Function to generate incident number
CREATE OR REPLACE FUNCTION generate_incident_number(org_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  year_suffix TEXT;
  sequence_num INT;
BEGIN
  year_suffix := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  SELECT COALESCE(MAX(
    CASE WHEN incident_number ~ ('^INC-' || year_suffix || '-[0-9]+$')
    THEN CAST(SUBSTRING(incident_number FROM '[0-9]+$') AS INT) ELSE 0 END
  ), 0) + 1 INTO sequence_num
  FROM safety_incidents WHERE organization_id = org_id AND incident_number LIKE 'INC-' || year_suffix || '-%';
  
  RETURN 'INC-' || year_suffix || '-' || LPAD(sequence_num::TEXT, 4, '0');
END;
$$;

-- Function to get safety metrics
CREATE OR REPLACE FUNCTION get_safety_metrics(
  p_org_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  total_incidents INT,
  recordable_incidents INT,
  lost_time_incidents INT,
  near_misses INT,
  total_injuries INT,
  days_since_last_incident INT,
  incident_rate NUMERIC
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_last_incident_date DATE;
BEGIN
  SELECT MAX(incident_date::DATE) INTO v_last_incident_date
  FROM safety_incidents
  WHERE organization_id = p_org_id
    AND incident_type != 'near_miss';
  
  RETURN QUERY
  SELECT 
    COUNT(*)::INT AS total_incidents,
    COUNT(*) FILTER (WHERE osha_recordable = TRUE)::INT AS recordable_incidents,
    COUNT(*) FILTER (WHERE injuries_count > 0)::INT AS lost_time_incidents,
    COUNT(*) FILTER (WHERE incident_type = 'near_miss')::INT AS near_misses,
    COALESCE(SUM(injuries_count), 0)::INT AS total_injuries,
    COALESCE(CURRENT_DATE - v_last_incident_date, 0)::INT AS days_since_last_incident,
    CASE WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE osha_recordable = TRUE)::NUMERIC * 200000) / 
      (SELECT COALESCE(SUM(total_hours), 1) FROM time_entries WHERE organization_id = p_org_id AND clock_in_time::DATE BETWEEN p_start_date AND p_end_date), 2)
    ELSE 0 END AS incident_rate
  FROM safety_incidents
  WHERE organization_id = p_org_id
    AND incident_date::DATE BETWEEN p_start_date AND p_end_date;
END;
$$;

-- RLS policies
ALTER TABLE safety_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_corrective_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_training_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_equipment ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON safety_incidents TO authenticated;
GRANT SELECT, INSERT, UPDATE ON safety_investigations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON safety_corrective_actions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON safety_inspections TO authenticated;
GRANT SELECT, INSERT ON safety_training_records TO authenticated;
GRANT SELECT, INSERT, UPDATE ON safety_equipment TO authenticated;
GRANT EXECUTE ON FUNCTION generate_incident_number(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_safety_metrics(UUID, DATE, DATE) TO authenticated;
