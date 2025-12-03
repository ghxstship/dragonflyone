-- Migration: Enrich Compliance with Permits and Insurance
-- Description: Detailed permit and insurance tracking from ExperienceGeneratorSchema

-- Add permit type enum
DO $$ BEGIN
  CREATE TYPE permit_type_enum AS ENUM (
    'business', 'event', 'fire', 'building', 'liquor', 'food', 'music', 
    'noise', 'temporary_structure', 'electrical', 'pyrotechnics', 
    'street_closure', 'parking', 'health', 'occupancy', 'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add permit status enum
DO $$ BEGIN
  CREATE TYPE permit_status_enum AS ENUM (
    'not_started', 'researching', 'applied', 'pending', 
    'approved', 'denied', 'expired', 'revoked'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add insurance type enum
DO $$ BEGIN
  CREATE TYPE insurance_type_enum AS ENUM (
    'general_liability', 'workers_comp', 'employers_liability', 
    'liquor_liability', 'event_cancellation', 'property', 'auto', 
    'umbrella', 'cyber', 'dno', 'professional_liability', 'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add policy status enum
DO $$ BEGIN
  CREATE TYPE policy_status_enum AS ENUM ('pending', 'active', 'expired', 'cancelled', 'lapsed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Permits table
CREATE TABLE IF NOT EXISTS permits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  production_id UUID REFERENCES productions(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES venues(id),
  permit_type permit_type_enum NOT NULL,
  name VARCHAR(255) NOT NULL,
  permit_number VARCHAR(100),
  issuing_authority VARCHAR(255),
  issuing_department VARCHAR(255),
  jurisdiction VARCHAR(100),
  status permit_status_enum DEFAULT 'not_started',
  
  -- Dates
  application_date DATE,
  submitted_date DATE,
  approval_date DATE,
  effective_date DATE,
  expiration_date DATE,
  
  -- Financial
  application_fee NUMERIC(10,2),
  permit_fee NUMERIC(10,2),
  total_cost NUMERIC(10,2),
  paid_date DATE,
  
  -- Requirements
  requirements TEXT[] DEFAULT '{}',
  conditions TEXT,
  restrictions TEXT,
  inspections_required BOOLEAN DEFAULT false,
  
  -- Documents
  application_url TEXT,
  permit_document_url TEXT,
  supporting_docs JSONB DEFAULT '[]',
  
  -- Contacts
  contact_id UUID REFERENCES contacts(id),
  inspector_name TEXT,
  inspector_phone TEXT,
  inspector_email TEXT,
  
  -- Tracking
  notes TEXT,
  internal_notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permit inspections table
CREATE TABLE IF NOT EXISTS permit_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  permit_id UUID NOT NULL REFERENCES permits(id) ON DELETE CASCADE,
  inspection_type TEXT NOT NULL,
  scheduled_date DATE,
  actual_date DATE,
  inspector_name TEXT,
  result TEXT CHECK (result IN ('passed', 'failed', 'conditional', 'rescheduled', 'cancelled')),
  deficiencies TEXT[],
  corrective_actions TEXT,
  reinspection_required BOOLEAN DEFAULT false,
  reinspection_date DATE,
  notes TEXT,
  report_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insurance policies table
CREATE TABLE IF NOT EXISTS insurance_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  production_id UUID REFERENCES productions(id),
  insurance_type insurance_type_enum NOT NULL,
  policy_number VARCHAR(100),
  carrier VARCHAR(255) NOT NULL,
  carrier_am_best_rating VARCHAR(10),
  
  -- Broker
  broker_name TEXT,
  broker_contact_id UUID REFERENCES contacts(id),
  broker_phone TEXT,
  broker_email TEXT,
  
  -- Coverage
  coverage_amount NUMERIC(12,2),
  aggregate_limit NUMERIC(12,2),
  per_occurrence_limit NUMERIC(12,2),
  deductible NUMERIC(10,2),
  self_insured_retention NUMERIC(10,2),
  
  -- Premium
  premium NUMERIC(10,2),
  premium_frequency TEXT CHECK (premium_frequency IN ('annual', 'semi_annual', 'quarterly', 'monthly')),
  next_premium_due DATE,
  
  -- Dates
  effective_date DATE NOT NULL,
  expiration_date DATE NOT NULL,
  
  -- Status
  status policy_status_enum DEFAULT 'active',
  
  -- Documents
  policy_document_url TEXT,
  coi_url TEXT,
  declarations_url TEXT,
  
  -- Additional insureds
  additional_insureds JSONB DEFAULT '[]',
  
  -- Endorsements
  endorsements JSONB DEFAULT '[]',
  exclusions TEXT[],
  
  -- Claims
  claims JSONB DEFAULT '[]',
  claims_count INTEGER DEFAULT 0,
  
  -- Tracking
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insurance certificates (COIs)
CREATE TABLE IF NOT EXISTS insurance_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID NOT NULL REFERENCES insurance_policies(id) ON DELETE CASCADE,
  certificate_number VARCHAR(100),
  certificate_holder TEXT NOT NULL,
  certificate_holder_address TEXT,
  issued_date DATE NOT NULL,
  expiration_date DATE,
  additional_insured BOOLEAN DEFAULT false,
  waiver_of_subrogation BOOLEAN DEFAULT false,
  primary_noncontributory BOOLEAN DEFAULT false,
  certificate_url TEXT,
  requested_by UUID REFERENCES platform_users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance checklists table (enhanced)
CREATE TABLE IF NOT EXISTS compliance_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  production_id UUID REFERENCES productions(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES venues(id),
  category TEXT NOT NULL CHECK (category IN ('permits', 'insurance', 'safety', 'employment', 'privacy', 'accessibility', 'environmental', 'other')),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_id UUID,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'complete', 'blocked')),
  completion_percent INTEGER DEFAULT 0,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  completed_by_id UUID REFERENCES platform_users(id),
  approved_by_id UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance checklist items
CREATE TABLE IF NOT EXISTS compliance_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID NOT NULL REFERENCES compliance_checklists(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'complete', 'na', 'blocked')),
  is_required BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  category TEXT,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  completed_by_id UUID REFERENCES platform_users(id),
  evidence_url TEXT,
  evidence_type TEXT,
  linked_permit_id UUID REFERENCES permits(id),
  linked_policy_id UUID REFERENCES insurance_policies(id),
  linked_contract_id UUID REFERENCES contracts(id),
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_permits_org ON permits(organization_id);
CREATE INDEX IF NOT EXISTS idx_permits_production ON permits(production_id);
CREATE INDEX IF NOT EXISTS idx_permits_venue ON permits(venue_id);
CREATE INDEX IF NOT EXISTS idx_permits_type ON permits(permit_type);
CREATE INDEX IF NOT EXISTS idx_permits_status ON permits(status);
CREATE INDEX IF NOT EXISTS idx_permits_expiration ON permits(expiration_date);

CREATE INDEX IF NOT EXISTS idx_permit_inspections_permit ON permit_inspections(permit_id);
CREATE INDEX IF NOT EXISTS idx_permit_inspections_date ON permit_inspections(scheduled_date);

CREATE INDEX IF NOT EXISTS idx_insurance_policies_org ON insurance_policies(organization_id);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_production ON insurance_policies(production_id);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_type ON insurance_policies(insurance_type);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_status ON insurance_policies(status);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_expiration ON insurance_policies(expiration_date);

CREATE INDEX IF NOT EXISTS idx_insurance_certificates_policy ON insurance_certificates(policy_id);
CREATE INDEX IF NOT EXISTS idx_insurance_certificates_holder ON insurance_certificates(certificate_holder);

CREATE INDEX IF NOT EXISTS idx_compliance_checklists_org ON compliance_checklists(organization_id);
CREATE INDEX IF NOT EXISTS idx_compliance_checklists_production ON compliance_checklists(production_id);
CREATE INDEX IF NOT EXISTS idx_compliance_checklists_status ON compliance_checklists(status);

CREATE INDEX IF NOT EXISTS idx_compliance_checklist_items_checklist ON compliance_checklist_items(checklist_id);
CREATE INDEX IF NOT EXISTS idx_compliance_checklist_items_status ON compliance_checklist_items(status);

-- Function to get compliance dashboard
CREATE OR REPLACE FUNCTION get_compliance_dashboard(p_production_id UUID)
RETURNS TABLE (
  production_id UUID,
  permits_total INTEGER,
  permits_approved INTEGER,
  permits_pending INTEGER,
  permits_expiring_soon INTEGER,
  policies_total INTEGER,
  policies_active INTEGER,
  policies_expiring_soon INTEGER,
  checklists_total INTEGER,
  checklists_complete INTEGER,
  overall_compliance_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p_production_id,
    (SELECT COUNT(*)::INTEGER FROM permits WHERE production_id = p_production_id) AS permits_total,
    (SELECT COUNT(*)::INTEGER FROM permits WHERE production_id = p_production_id AND status = 'approved') AS permits_approved,
    (SELECT COUNT(*)::INTEGER FROM permits WHERE production_id = p_production_id AND status IN ('applied', 'pending')) AS permits_pending,
    (SELECT COUNT(*)::INTEGER FROM permits WHERE production_id = p_production_id AND status = 'approved' AND expiration_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 30) AS permits_expiring_soon,
    (SELECT COUNT(*)::INTEGER FROM insurance_policies WHERE production_id = p_production_id) AS policies_total,
    (SELECT COUNT(*)::INTEGER FROM insurance_policies WHERE production_id = p_production_id AND status = 'active') AS policies_active,
    (SELECT COUNT(*)::INTEGER FROM insurance_policies WHERE production_id = p_production_id AND status = 'active' AND expiration_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 30) AS policies_expiring_soon,
    (SELECT COUNT(*)::INTEGER FROM compliance_checklists WHERE production_id = p_production_id) AS checklists_total,
    (SELECT COUNT(*)::INTEGER FROM compliance_checklists WHERE production_id = p_production_id AND status = 'complete') AS checklists_complete,
    ROUND(
      (
        (SELECT COUNT(*)::NUMERIC FROM permits WHERE production_id = p_production_id AND status = 'approved') +
        (SELECT COUNT(*)::NUMERIC FROM insurance_policies WHERE production_id = p_production_id AND status = 'active') +
        (SELECT COUNT(*)::NUMERIC FROM compliance_checklists WHERE production_id = p_production_id AND status = 'complete')
      ) / NULLIF(
        (SELECT COUNT(*)::NUMERIC FROM permits WHERE production_id = p_production_id) +
        (SELECT COUNT(*)::NUMERIC FROM insurance_policies WHERE production_id = p_production_id) +
        (SELECT COUNT(*)::NUMERIC FROM compliance_checklists WHERE production_id = p_production_id)
      , 0) * 100, 2
    ) AS overall_compliance_score;
END;
$$;

-- Function to get expiring compliance items
CREATE OR REPLACE FUNCTION get_expiring_compliance_items(
  p_org_id UUID,
  p_days_ahead INTEGER DEFAULT 30
)
RETURNS TABLE (
  item_type TEXT,
  item_id UUID,
  item_name TEXT,
  expiration_date DATE,
  days_until_expiry INTEGER,
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  -- Expiring permits
  SELECT 
    'permit'::TEXT AS item_type,
    p.id,
    p.name,
    p.expiration_date,
    (p.expiration_date - CURRENT_DATE)::INTEGER AS days_until_expiry,
    p.status::TEXT
  FROM permits p
  WHERE p.organization_id = p_org_id
    AND p.status = 'approved'
    AND p.expiration_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + p_days_ahead)
  
  UNION ALL
  
  -- Expiring insurance policies
  SELECT 
    'insurance'::TEXT,
    ip.id,
    ip.carrier || ' - ' || ip.insurance_type::TEXT,
    ip.expiration_date,
    (ip.expiration_date - CURRENT_DATE)::INTEGER,
    ip.status::TEXT
  FROM insurance_policies ip
  WHERE ip.organization_id = p_org_id
    AND ip.status = 'active'
    AND ip.expiration_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + p_days_ahead)
  
  ORDER BY days_until_expiry;
END;
$$;

-- Function to update checklist completion
CREATE OR REPLACE FUNCTION update_checklist_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_total INTEGER;
  v_completed INTEGER;
BEGIN
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status IN ('complete', 'na'))
  INTO v_total, v_completed
  FROM compliance_checklist_items
  WHERE checklist_id = COALESCE(NEW.checklist_id, OLD.checklist_id);
  
  UPDATE compliance_checklists
  SET 
    completion_percent = CASE WHEN v_total > 0 THEN ROUND((v_completed::NUMERIC / v_total) * 100) ELSE 0 END,
    status = CASE 
      WHEN v_completed = v_total AND v_total > 0 THEN 'complete'
      WHEN v_completed > 0 THEN 'in_progress'
      ELSE 'not_started'
    END,
    completed_at = CASE WHEN v_completed = v_total AND v_total > 0 THEN NOW() ELSE NULL END,
    updated_at = NOW()
  WHERE id = COALESCE(NEW.checklist_id, OLD.checklist_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS checklist_item_completion_trigger ON compliance_checklist_items;
CREATE TRIGGER checklist_item_completion_trigger
  AFTER INSERT OR UPDATE OR DELETE ON compliance_checklist_items
  FOR EACH ROW
  EXECUTE FUNCTION update_checklist_completion();

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_compliance_tables_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS permits_updated_at ON permits;
CREATE TRIGGER permits_updated_at
  BEFORE UPDATE ON permits
  FOR EACH ROW EXECUTE FUNCTION update_compliance_tables_timestamp();

DROP TRIGGER IF EXISTS permit_inspections_updated_at ON permit_inspections;
CREATE TRIGGER permit_inspections_updated_at
  BEFORE UPDATE ON permit_inspections
  FOR EACH ROW EXECUTE FUNCTION update_compliance_tables_timestamp();

DROP TRIGGER IF EXISTS insurance_policies_updated_at ON insurance_policies;
CREATE TRIGGER insurance_policies_updated_at
  BEFORE UPDATE ON insurance_policies
  FOR EACH ROW EXECUTE FUNCTION update_compliance_tables_timestamp();

DROP TRIGGER IF EXISTS compliance_checklists_updated_at ON compliance_checklists;
CREATE TRIGGER compliance_checklists_updated_at
  BEFORE UPDATE ON compliance_checklists
  FOR EACH ROW EXECUTE FUNCTION update_compliance_tables_timestamp();

DROP TRIGGER IF EXISTS compliance_checklist_items_updated_at ON compliance_checklist_items;
CREATE TRIGGER compliance_checklist_items_updated_at
  BEFORE UPDATE ON compliance_checklist_items
  FOR EACH ROW EXECUTE FUNCTION update_compliance_tables_timestamp();

-- RLS Policies
ALTER TABLE permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE permit_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY permits_select ON permits
  FOR SELECT TO authenticated
  USING (org_matches(organization_id) OR production_id IN (SELECT id FROM productions WHERE org_matches(organization_id)));

CREATE POLICY permits_manage ON permits
  FOR ALL TO authenticated
  USING (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'))
  WITH CHECK (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

CREATE POLICY permit_inspections_select ON permit_inspections
  FOR SELECT TO authenticated
  USING (permit_id IN (SELECT id FROM permits WHERE org_matches(organization_id)));

CREATE POLICY permit_inspections_manage ON permit_inspections
  FOR ALL TO authenticated
  USING (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'))
  WITH CHECK (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

CREATE POLICY insurance_policies_select ON insurance_policies
  FOR SELECT TO authenticated
  USING (org_matches(organization_id));

CREATE POLICY insurance_policies_manage ON insurance_policies
  FOR ALL TO authenticated
  USING (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'))
  WITH CHECK (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

CREATE POLICY insurance_certificates_select ON insurance_certificates
  FOR SELECT TO authenticated
  USING (policy_id IN (SELECT id FROM insurance_policies WHERE org_matches(organization_id)));

CREATE POLICY insurance_certificates_manage ON insurance_certificates
  FOR ALL TO authenticated
  USING (role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'))
  WITH CHECK (role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

CREATE POLICY compliance_checklists_select ON compliance_checklists
  FOR SELECT TO authenticated
  USING (org_matches(organization_id) OR production_id IN (SELECT id FROM productions WHERE org_matches(organization_id)));

CREATE POLICY compliance_checklists_manage ON compliance_checklists
  FOR ALL TO authenticated
  USING (role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'))
  WITH CHECK (role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

CREATE POLICY compliance_checklist_items_select ON compliance_checklist_items
  FOR SELECT TO authenticated
  USING (checklist_id IN (SELECT id FROM compliance_checklists WHERE org_matches(organization_id)));

CREATE POLICY compliance_checklist_items_manage ON compliance_checklist_items
  FOR ALL TO authenticated
  USING (role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'))
  WITH CHECK (role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON permits TO authenticated;
GRANT SELECT, INSERT, UPDATE ON permit_inspections TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON insurance_policies TO authenticated;
GRANT SELECT, INSERT, UPDATE ON insurance_certificates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON compliance_checklists TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON compliance_checklist_items TO authenticated;

GRANT EXECUTE ON FUNCTION get_compliance_dashboard(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_expiring_compliance_items(UUID, INTEGER) TO authenticated;
