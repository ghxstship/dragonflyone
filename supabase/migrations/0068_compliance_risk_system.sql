-- Migration: Compliance & Risk Management System
-- Description: Tables for compliance tracking, risk management, and audit trails

-- Compliance items table
CREATE TABLE IF NOT EXISTS compliance_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  title TEXT NOT NULL,
  compliance_type TEXT NOT NULL CHECK (compliance_type IN ('insurance', 'license', 'certification', 'permit', 'registration', 'audit', 'inspection', 'regulation')),
  category TEXT,
  provider_name TEXT,
  provider_contact TEXT,
  policy_number TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'pending', 'cancelled', 'suspended')),
  issue_date DATE,
  effective_date DATE NOT NULL,
  expiration_date DATE,
  annual_cost NUMERIC(15,2),
  coverage_amount NUMERIC(15,2),
  deductible NUMERIC(15,2),
  reminder_days_before INT DEFAULT 30,
  auto_renew BOOLEAN DEFAULT false,
  notes TEXT,
  tags TEXT[],
  documents JSONB,
  owner_id UUID REFERENCES platform_users(id),
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_items_org ON compliance_items(organization_id);
CREATE INDEX IF NOT EXISTS idx_compliance_items_type ON compliance_items(compliance_type);
CREATE INDEX IF NOT EXISTS idx_compliance_items_status ON compliance_items(status);
CREATE INDEX IF NOT EXISTS idx_compliance_items_expiration ON compliance_items(expiration_date);

-- Compliance events table
CREATE TABLE IF NOT EXISTS compliance_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  compliance_item_id UUID NOT NULL REFERENCES compliance_items(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('created', 'updated', 'renewed', 'expired', 'cancelled', 'document_added', 'reminder_sent', 'reviewed')),
  description TEXT,
  metadata JSONB,
  performed_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_events_item ON compliance_events(compliance_item_id);

-- Risk register table
CREATE TABLE IF NOT EXISTS risk_register (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id UUID REFERENCES projects(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('financial', 'operational', 'strategic', 'compliance', 'reputational', 'safety', 'technical', 'environmental', 'legal')),
  probability TEXT NOT NULL CHECK (probability IN ('rare', 'unlikely', 'possible', 'likely', 'almost_certain')),
  impact TEXT NOT NULL CHECK (impact IN ('negligible', 'minor', 'moderate', 'major', 'catastrophic')),
  risk_score INT GENERATED ALWAYS AS (
    (CASE probability 
      WHEN 'rare' THEN 1 
      WHEN 'unlikely' THEN 2 
      WHEN 'possible' THEN 3 
      WHEN 'likely' THEN 4 
      WHEN 'almost_certain' THEN 5 
    END) *
    (CASE impact 
      WHEN 'negligible' THEN 1 
      WHEN 'minor' THEN 2 
      WHEN 'moderate' THEN 3 
      WHEN 'major' THEN 4 
      WHEN 'catastrophic' THEN 5 
    END)
  ) STORED,
  status TEXT NOT NULL DEFAULT 'identified' CHECK (status IN ('identified', 'assessed', 'mitigating', 'monitoring', 'closed', 'accepted')),
  mitigation_strategy TEXT,
  mitigation_status TEXT CHECK (mitigation_status IN ('not_started', 'in_progress', 'completed', 'ongoing')),
  contingency_plan TEXT,
  owner_id UUID REFERENCES platform_users(id),
  review_date DATE,
  last_reviewed_at TIMESTAMPTZ,
  last_reviewed_by UUID REFERENCES platform_users(id),
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_risk_register_org ON risk_register(organization_id);
CREATE INDEX IF NOT EXISTS idx_risk_register_project ON risk_register(project_id);
CREATE INDEX IF NOT EXISTS idx_risk_register_status ON risk_register(status);
CREATE INDEX IF NOT EXISTS idx_risk_register_score ON risk_register(risk_score);

-- Risk events table
CREATE TABLE IF NOT EXISTS risk_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id UUID NOT NULL REFERENCES risk_register(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('created', 'updated', 'escalated', 'mitigated', 'closed', 'reviewed', 'triggered')),
  description TEXT,
  previous_status TEXT,
  new_status TEXT,
  performed_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_risk_events_risk ON risk_events(risk_id);

-- Audit findings table
CREATE TABLE IF NOT EXISTS audit_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  audit_type TEXT NOT NULL CHECK (audit_type IN ('internal', 'external', 'regulatory', 'financial', 'operational', 'compliance', 'security')),
  audit_date DATE NOT NULL,
  auditor_name TEXT,
  auditor_organization TEXT,
  finding_type TEXT NOT NULL CHECK (finding_type IN ('observation', 'minor_nonconformity', 'major_nonconformity', 'opportunity_for_improvement', 'best_practice')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  affected_area TEXT,
  root_cause TEXT,
  corrective_action TEXT,
  preventive_action TEXT,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'pending_verification', 'closed', 'overdue')),
  assigned_to UUID REFERENCES platform_users(id),
  verified_by UUID REFERENCES platform_users(id),
  verified_at TIMESTAMPTZ,
  evidence_documents JSONB,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_findings_org ON audit_findings(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_findings_status ON audit_findings(status);
CREATE INDEX IF NOT EXISTS idx_audit_findings_type ON audit_findings(audit_type);

-- Incident reports table (business incidents, not event incidents)
CREATE TABLE IF NOT EXISTS incident_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  incident_number TEXT NOT NULL,
  incident_type TEXT NOT NULL CHECK (incident_type IN ('workplace_injury', 'property_damage', 'near_miss', 'security_breach', 'data_breach', 'environmental', 'vehicle_accident', 'theft', 'harassment', 'other')),
  severity TEXT NOT NULL CHECK (severity IN ('minor', 'moderate', 'serious', 'critical')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  incident_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  witnesses TEXT[],
  injured_parties JSONB,
  property_damage_estimate NUMERIC(15,2),
  root_cause TEXT,
  corrective_actions TEXT,
  preventive_measures TEXT,
  status TEXT NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'investigating', 'pending_review', 'closed', 'reopened')),
  reported_by UUID REFERENCES platform_users(id),
  investigated_by UUID REFERENCES platform_users(id),
  investigation_date TIMESTAMPTZ,
  closed_by UUID REFERENCES platform_users(id),
  closed_at TIMESTAMPTZ,
  insurance_claim_filed BOOLEAN DEFAULT false,
  insurance_claim_number TEXT,
  osha_recordable BOOLEAN DEFAULT false,
  photos TEXT[],
  documents JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incident_reports_org ON incident_reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_incident_reports_type ON incident_reports(incident_type);
CREATE INDEX IF NOT EXISTS idx_incident_reports_status ON incident_reports(status);
CREATE INDEX IF NOT EXISTS idx_incident_reports_date ON incident_reports(incident_date);

-- Generate incident number function
CREATE OR REPLACE FUNCTION generate_incident_number(org_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  year_suffix TEXT;
  sequence_num INT;
BEGIN
  year_suffix := TO_CHAR(CURRENT_DATE, 'YY');
  
  SELECT COALESCE(MAX(
    CASE WHEN incident_number ~ ('^INC' || year_suffix || '-[0-9]+$')
    THEN CAST(SUBSTRING(incident_number FROM '[0-9]+$') AS INT) ELSE 0 END
  ), 0) + 1 INTO sequence_num
  FROM incident_reports WHERE organization_id = org_id AND incident_number LIKE 'INC' || year_suffix || '-%';
  
  RETURN 'INC' || year_suffix || '-' || LPAD(sequence_num::TEXT, 4, '0');
END;
$$;

-- Function to check compliance expirations
CREATE OR REPLACE FUNCTION check_compliance_expirations()
RETURNS TABLE (
  item_id UUID,
  title TEXT,
  compliance_type TEXT,
  expiration_date DATE,
  days_until_expiration INT,
  owner_id UUID
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ci.id,
    ci.title,
    ci.compliance_type,
    ci.expiration_date,
    (ci.expiration_date - CURRENT_DATE)::INT AS days_until_expiration,
    ci.owner_id
  FROM compliance_items ci
  WHERE ci.status = 'active'
    AND ci.expiration_date IS NOT NULL
    AND ci.expiration_date <= CURRENT_DATE + ci.reminder_days_before
  ORDER BY ci.expiration_date ASC;
END;
$$;

-- RLS policies
ALTER TABLE compliance_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_register ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_reports ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON compliance_items TO authenticated;
GRANT SELECT, INSERT ON compliance_events TO authenticated;
GRANT SELECT, INSERT, UPDATE ON risk_register TO authenticated;
GRANT SELECT, INSERT ON risk_events TO authenticated;
GRANT SELECT, INSERT, UPDATE ON audit_findings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON incident_reports TO authenticated;
GRANT EXECUTE ON FUNCTION generate_incident_number(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_compliance_expirations() TO authenticated;
