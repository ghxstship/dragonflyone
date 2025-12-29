-- ============================================================================
-- 0027_compvss_production_ops.sql
-- COMPVSS Production Operations - 3NF Single Source of Truth
-- GHXSTSHIP Platform - Production/Crew Management Support
-- ============================================================================

-- ============================================================================
-- SECTION 1: ENUM TYPES
-- ============================================================================

CREATE TYPE incident_severity AS ENUM ('minor', 'moderate', 'major', 'critical');
CREATE TYPE incident_status AS ENUM ('reported', 'investigating', 'resolved', 'closed');
CREATE TYPE risk_likelihood AS ENUM ('rare', 'unlikely', 'possible', 'likely', 'almost_certain');
CREATE TYPE risk_impact AS ENUM ('negligible', 'minor', 'moderate', 'major', 'catastrophic');
CREATE TYPE risk_status AS ENUM ('identified', 'assessed', 'mitigating', 'accepted', 'closed');
CREATE TYPE permit_status AS ENUM ('draft', 'submitted', 'pending_review', 'approved', 'denied', 'expired', 'revoked');
CREATE TYPE delivery_status AS ENUM ('scheduled', 'in_transit', 'arrived', 'unloading', 'completed', 'delayed', 'cancelled');
CREATE TYPE qa_status AS ENUM ('pending', 'in_progress', 'passed', 'failed', 'needs_rework', 'verified');
CREATE TYPE kb_document_type AS ENUM ('sop', 'guide', 'checklist', 'template', 'reference', 'training', 'policy');
CREATE TYPE background_check_status AS ENUM ('pending', 'in_progress', 'passed', 'failed', 'expired', 'waived');
CREATE TYPE settlement_status AS ENUM ('draft', 'pending', 'under_review', 'approved', 'disputed', 'paid', 'closed');

-- ============================================================================
-- SECTION 2: RUN OF SHOW / SHOW CALL / CUE MANAGEMENT
-- ============================================================================

CREATE TABLE run_of_show (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES legend_events(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  show_date DATE NOT NULL,
  doors_time TIME,
  show_start TIME,
  show_end TIME,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  is_locked BOOLEAN DEFAULT false,
  locked_by UUID REFERENCES platform_users(id),
  locked_at TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE show_cues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  run_of_show_id UUID NOT NULL REFERENCES run_of_show(id) ON DELETE CASCADE,
  cue_number TEXT NOT NULL,
  cue_type TEXT NOT NULL,
  scheduled_time TIME,
  actual_time TIME,
  duration_seconds INTEGER,
  description TEXT NOT NULL,
  department TEXT,
  assigned_to UUID REFERENCES workforce_employees(id),
  depends_on_cue_id UUID REFERENCES show_cues(id),
  is_critical BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE show_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES legend_events(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  call_type TEXT NOT NULL,
  call_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  location_id UUID REFERENCES legend_places(id),
  department TEXT,
  role_id UUID REFERENCES workforce_roles(id),
  description TEXT,
  special_instructions TEXT,
  is_mandatory BOOLEAN DEFAULT true,
  headcount_required INTEGER,
  headcount_confirmed INTEGER DEFAULT 0,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE show_call_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  show_call_id UUID NOT NULL REFERENCES show_calls(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES workforce_employees(id) ON DELETE CASCADE,
  response TEXT NOT NULL,
  response_time TIMESTAMPTZ DEFAULT now(),
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(show_call_id, employee_id)
);

-- ============================================================================
-- SECTION 3: INCIDENT REPORTING & EMERGENCY
-- ============================================================================

CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  incident_number TEXT NOT NULL,
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  location_id UUID REFERENCES legend_places(id),
  location_description TEXT,
  incident_type TEXT NOT NULL,
  severity incident_severity NOT NULL DEFAULT 'minor',
  status incident_status NOT NULL DEFAULT 'reported',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  reported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reported_by UUID NOT NULL REFERENCES platform_users(id),
  assigned_to UUID REFERENCES platform_users(id),
  witnesses JSONB DEFAULT '[]'::jsonb,
  injuries_reported BOOLEAN DEFAULT false,
  injury_count INTEGER DEFAULT 0,
  property_damage BOOLEAN DEFAULT false,
  damage_estimate NUMERIC(12,2),
  emergency_services_called BOOLEAN DEFAULT false,
  police_report_number TEXT,
  insurance_claim_number TEXT,
  root_cause TEXT,
  corrective_actions TEXT,
  preventive_actions TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES platform_users(id),
  resolution_notes TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE incident_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  update_type TEXT NOT NULL,
  previous_status incident_status,
  new_status incident_status,
  notes TEXT NOT NULL,
  updated_by UUID NOT NULL REFERENCES platform_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES legend_events(id) ON DELETE CASCADE,
  contact_type TEXT NOT NULL,
  name TEXT NOT NULL,
  title TEXT,
  phone TEXT NOT NULL,
  phone_secondary TEXT,
  email TEXT,
  is_primary BOOLEAN DEFAULT false,
  is_24_hour BOOLEAN DEFAULT false,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE emergency_procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES legend_events(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES legend_places(id),
  procedure_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  assembly_points JSONB DEFAULT '[]'::jsonb,
  responsible_parties JSONB DEFAULT '[]'::jsonb,
  equipment_required JSONB DEFAULT '[]'::jsonb,
  last_drill_date DATE,
  next_drill_date DATE,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  approved_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 4: RISK REGISTER & SAFETY
-- ============================================================================

CREATE TABLE risk_register (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  risk_number TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  likelihood risk_likelihood NOT NULL,
  impact risk_impact NOT NULL,
  risk_score INTEGER GENERATED ALWAYS AS (
    (CASE likelihood WHEN 'rare' THEN 1 WHEN 'unlikely' THEN 2 WHEN 'possible' THEN 3 WHEN 'likely' THEN 4 WHEN 'almost_certain' THEN 5 END) *
    (CASE impact WHEN 'negligible' THEN 1 WHEN 'minor' THEN 2 WHEN 'moderate' THEN 3 WHEN 'major' THEN 4 WHEN 'catastrophic' THEN 5 END)
  ) STORED,
  status risk_status NOT NULL DEFAULT 'identified',
  owner_id UUID REFERENCES platform_users(id),
  mitigation_strategy TEXT,
  mitigation_actions JSONB DEFAULT '[]'::jsonb,
  contingency_plan TEXT,
  triggers TEXT,
  residual_likelihood risk_likelihood,
  residual_impact risk_impact,
  cost_of_mitigation NUMERIC(12,2),
  review_date DATE,
  last_reviewed_at TIMESTAMPTZ,
  last_reviewed_by UUID REFERENCES platform_users(id),
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE safety_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  location_id UUID REFERENCES legend_places(id),
  inspection_type TEXT NOT NULL,
  inspection_date DATE NOT NULL,
  inspector_id UUID NOT NULL REFERENCES platform_users(id),
  inspector_name TEXT,
  inspector_company TEXT,
  checklist_template_id UUID,
  overall_status TEXT NOT NULL DEFAULT 'pending',
  findings JSONB DEFAULT '[]'::jsonb,
  corrective_actions JSONB DEFAULT '[]'::jsonb,
  photos JSONB DEFAULT '[]'::jsonb,
  signature_inspector TEXT,
  signature_site_manager TEXT,
  signed_at TIMESTAMPTZ,
  next_inspection_date DATE,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 5: INDEXES
-- ============================================================================

CREATE INDEX idx_run_of_show_org_event ON run_of_show(organization_id, event_id);
CREATE INDEX idx_run_of_show_date ON run_of_show(organization_id, show_date);
CREATE INDEX idx_show_cues_ros ON show_cues(run_of_show_id, sort_order);
CREATE INDEX idx_show_calls_event ON show_calls(organization_id, event_id, call_time);
CREATE INDEX idx_show_call_responses_call ON show_call_responses(show_call_id);
CREATE INDEX idx_incidents_org_event ON incidents(organization_id, event_id);
CREATE INDEX idx_incidents_status ON incidents(organization_id, status, severity);
CREATE INDEX idx_incidents_date ON incidents(organization_id, occurred_at DESC);
CREATE INDEX idx_incident_updates_incident ON incident_updates(incident_id, created_at DESC);
CREATE INDEX idx_emergency_contacts_org ON emergency_contacts(organization_id, event_id);
CREATE INDEX idx_emergency_procedures_org ON emergency_procedures(organization_id, event_id);
CREATE INDEX idx_risk_register_org ON risk_register(organization_id, status);
CREATE INDEX idx_risk_register_event ON risk_register(event_id) WHERE event_id IS NOT NULL;
CREATE INDEX idx_risk_register_score ON risk_register(organization_id, risk_score DESC) WHERE is_active = true;
CREATE INDEX idx_safety_inspections_org ON safety_inspections(organization_id, inspection_date DESC);

-- ============================================================================
-- SECTION 6: RLS POLICIES
-- ============================================================================

ALTER TABLE run_of_show ENABLE ROW LEVEL SECURITY;
ALTER TABLE show_cues ENABLE ROW LEVEL SECURITY;
ALTER TABLE show_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE show_call_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_register ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_inspections ENABLE ROW LEVEL SECURITY;

CREATE POLICY run_of_show_org_access ON run_of_show FOR ALL USING (org_matches(organization_id));
CREATE POLICY show_cues_org_access ON show_cues FOR ALL USING (org_matches(organization_id));
CREATE POLICY show_calls_org_access ON show_calls FOR ALL USING (org_matches(organization_id));
CREATE POLICY show_call_responses_access ON show_call_responses FOR ALL USING (
  EXISTS (SELECT 1 FROM show_calls sc WHERE sc.id = show_call_id AND org_matches(sc.organization_id))
);
CREATE POLICY incidents_org_access ON incidents FOR ALL USING (org_matches(organization_id));
CREATE POLICY incident_updates_access ON incident_updates FOR ALL USING (
  EXISTS (SELECT 1 FROM incidents i WHERE i.id = incident_id AND org_matches(i.organization_id))
);
CREATE POLICY emergency_contacts_org_access ON emergency_contacts FOR ALL USING (org_matches(organization_id));
CREATE POLICY emergency_procedures_org_access ON emergency_procedures FOR ALL USING (org_matches(organization_id));
CREATE POLICY risk_register_org_access ON risk_register FOR ALL USING (org_matches(organization_id));
CREATE POLICY safety_inspections_org_access ON safety_inspections FOR ALL USING (org_matches(organization_id));

-- ============================================================================
-- SECTION 7: GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON run_of_show TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON show_cues TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON show_calls TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON show_call_responses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON incidents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON incident_updates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON emergency_contacts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON emergency_procedures TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON risk_register TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON safety_inspections TO authenticated;

-- ============================================================================
-- SECTION 8: TRIGGERS
-- ============================================================================

CREATE TRIGGER run_of_show_updated_at BEFORE UPDATE ON run_of_show FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER show_cues_updated_at BEFORE UPDATE ON show_cues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER show_calls_updated_at BEFORE UPDATE ON show_calls FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER incidents_updated_at BEFORE UPDATE ON incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER emergency_contacts_updated_at BEFORE UPDATE ON emergency_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER emergency_procedures_updated_at BEFORE UPDATE ON emergency_procedures FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER risk_register_updated_at BEFORE UPDATE ON risk_register FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER safety_inspections_updated_at BEFORE UPDATE ON safety_inspections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
