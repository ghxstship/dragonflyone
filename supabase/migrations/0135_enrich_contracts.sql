-- Migration: Enrich Contracts System
-- Description: Enhanced contract management with multi-party support and compliance tracking

-- Add contract category enum
DO $$ BEGIN
  CREATE TYPE contract_category_enum AS ENUM (
    'partner', 'employment', 'contractor', 'subcontractor', 
    'vendor', 'artist', 'sponsor', 'intern', 'nda', 'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add contract status enum (more granular)
DO $$ BEGIN
  CREATE TYPE contract_lifecycle_status_enum AS ENUM (
    'draft', 'pending_review', 'pending_signature', 
    'active', 'completed', 'terminated', 'expired'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create contract_types table
CREATE TABLE IF NOT EXISTS contract_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20),
  category contract_category_enum,
  description TEXT,
  template_url TEXT,
  required_fields JSONB DEFAULT '[]',
  default_terms JSONB DEFAULT '{}',
  default_payment_terms TEXT,
  requires_legal_review BOOLEAN DEFAULT true,
  requires_insurance BOOLEAN DEFAULT false,
  requires_w9 BOOLEAN DEFAULT false,
  requires_background_check BOOLEAN DEFAULT false,
  requires_nda BOOLEAN DEFAULT false,
  expiration_reminder_days INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, code)
);

-- Enrich contracts table
ALTER TABLE contracts
  ADD COLUMN IF NOT EXISTS contract_type_id UUID REFERENCES contract_types(id),
  ADD COLUMN IF NOT EXISTS category contract_category_enum,
  ADD COLUMN IF NOT EXISTS lifecycle_status contract_lifecycle_status_enum DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS production_id UUID REFERENCES productions(id),
  ADD COLUMN IF NOT EXISTS party_a_org_id UUID REFERENCES organizations(id),
  ADD COLUMN IF NOT EXISTS party_a_contact_id UUID REFERENCES contacts(id),
  ADD COLUMN IF NOT EXISTS party_b_org_id UUID REFERENCES organizations(id),
  ADD COLUMN IF NOT EXISTS party_b_contact_id UUID REFERENCES contacts(id),
  ADD COLUMN IF NOT EXISTS payment_schedule JSONB,
  ADD COLUMN IF NOT EXISTS party_a_signed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS party_a_signed_by TEXT,
  ADD COLUMN IF NOT EXISTS party_b_signed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS party_b_signed_by TEXT,
  ADD COLUMN IF NOT EXISTS insurance_required BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS insurance_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS insurance_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS insurance_policy_id UUID,
  ADD COLUMN IF NOT EXISTS w9_required BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS w9_received BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS w9_received_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS w9_document_url TEXT,
  ADD COLUMN IF NOT EXISTS background_check_required BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS background_check_passed BOOLEAN,
  ADD COLUMN IF NOT EXISTS background_check_date DATE,
  ADD COLUMN IF NOT EXISTS nda_required BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS nda_signed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS nda_contract_id UUID REFERENCES contracts(id),
  ADD COLUMN IF NOT EXISTS legal_review_required BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS legal_review_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS legal_review_by UUID REFERENCES platform_users(id),
  ADD COLUMN IF NOT EXISTS legal_review_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS legal_review_notes TEXT,
  ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Contract signatories table
CREATE TABLE IF NOT EXISTS contract_signatories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  party TEXT NOT NULL CHECK (party IN ('party_a', 'party_b', 'witness', 'notary')),
  signatory_name TEXT NOT NULL,
  signatory_title TEXT,
  signatory_email TEXT,
  signatory_contact_id UUID REFERENCES contacts(id),
  signature_required BOOLEAN DEFAULT true,
  signature_order INTEGER DEFAULT 1,
  signed_at TIMESTAMPTZ,
  signature_url TEXT,
  ip_address INET,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contract deliverables table
CREATE TABLE IF NOT EXISTS contract_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES contract_milestones(id),
  title TEXT NOT NULL,
  description TEXT,
  deliverable_type TEXT CHECK (deliverable_type IN ('service', 'product', 'document', 'payment', 'approval', 'other')),
  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC(12,2),
  total_value NUMERIC(12,2),
  due_date DATE,
  delivered_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'delivered', 'accepted', 'rejected')),
  acceptance_criteria TEXT,
  accepted_by UUID REFERENCES platform_users(id),
  accepted_at TIMESTAMPTZ,
  rejection_reason TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contract_types_org ON contract_types(organization_id);
CREATE INDEX IF NOT EXISTS idx_contract_types_category ON contract_types(category);

CREATE INDEX IF NOT EXISTS idx_contracts_type ON contracts(contract_type_id);
CREATE INDEX IF NOT EXISTS idx_contracts_category ON contracts(category);
CREATE INDEX IF NOT EXISTS idx_contracts_lifecycle ON contracts(lifecycle_status);
CREATE INDEX IF NOT EXISTS idx_contracts_production ON contracts(production_id);
CREATE INDEX IF NOT EXISTS idx_contracts_party_a_org ON contracts(party_a_org_id);
CREATE INDEX IF NOT EXISTS idx_contracts_party_b_org ON contracts(party_b_org_id);
CREATE INDEX IF NOT EXISTS idx_contracts_deleted ON contracts(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_contract_signatories_contract ON contract_signatories(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_signatories_contact ON contract_signatories(signatory_contact_id);

CREATE INDEX IF NOT EXISTS idx_contract_deliverables_contract ON contract_deliverables(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_deliverables_milestone ON contract_deliverables(milestone_id);
CREATE INDEX IF NOT EXISTS idx_contract_deliverables_status ON contract_deliverables(status);
CREATE INDEX IF NOT EXISTS idx_contract_deliverables_due ON contract_deliverables(due_date);

-- Comments
COMMENT ON TABLE contract_types IS 'Contract templates and type definitions';
COMMENT ON TABLE contract_signatories IS 'Signatories for contract execution';
COMMENT ON TABLE contract_deliverables IS 'Deliverables and obligations within contracts';

-- Function to check contract compliance
CREATE OR REPLACE FUNCTION check_contract_compliance(p_contract_id UUID)
RETURNS TABLE (
  contract_id UUID,
  is_compliant BOOLEAN,
  missing_requirements TEXT[],
  compliance_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_contract RECORD;
  v_missing TEXT[] := '{}';
  v_total_checks INTEGER := 0;
  v_passed_checks INTEGER := 0;
BEGIN
  SELECT * INTO v_contract FROM contracts WHERE id = p_contract_id;
  
  -- Check insurance
  IF v_contract.insurance_required THEN
    v_total_checks := v_total_checks + 1;
    IF v_contract.insurance_verified THEN
      v_passed_checks := v_passed_checks + 1;
    ELSE
      v_missing := array_append(v_missing, 'Insurance verification required');
    END IF;
  END IF;
  
  -- Check W9
  IF v_contract.w9_required THEN
    v_total_checks := v_total_checks + 1;
    IF v_contract.w9_received THEN
      v_passed_checks := v_passed_checks + 1;
    ELSE
      v_missing := array_append(v_missing, 'W9 form required');
    END IF;
  END IF;
  
  -- Check background check
  IF v_contract.background_check_required THEN
    v_total_checks := v_total_checks + 1;
    IF v_contract.background_check_passed THEN
      v_passed_checks := v_passed_checks + 1;
    ELSE
      v_missing := array_append(v_missing, 'Background check required');
    END IF;
  END IF;
  
  -- Check NDA
  IF v_contract.nda_required THEN
    v_total_checks := v_total_checks + 1;
    IF v_contract.nda_signed THEN
      v_passed_checks := v_passed_checks + 1;
    ELSE
      v_missing := array_append(v_missing, 'NDA signature required');
    END IF;
  END IF;
  
  -- Check legal review
  IF v_contract.legal_review_required THEN
    v_total_checks := v_total_checks + 1;
    IF v_contract.legal_review_completed THEN
      v_passed_checks := v_passed_checks + 1;
    ELSE
      v_missing := array_append(v_missing, 'Legal review required');
    END IF;
  END IF;
  
  -- Check signatures
  v_total_checks := v_total_checks + 1;
  IF v_contract.party_a_signed_at IS NOT NULL AND v_contract.party_b_signed_at IS NOT NULL THEN
    v_passed_checks := v_passed_checks + 1;
  ELSE
    IF v_contract.party_a_signed_at IS NULL THEN
      v_missing := array_append(v_missing, 'Party A signature required');
    END IF;
    IF v_contract.party_b_signed_at IS NULL THEN
      v_missing := array_append(v_missing, 'Party B signature required');
    END IF;
  END IF;
  
  RETURN QUERY
  SELECT 
    p_contract_id,
    array_length(v_missing, 1) IS NULL OR array_length(v_missing, 1) = 0,
    v_missing,
    CASE WHEN v_total_checks > 0 THEN ROUND((v_passed_checks::NUMERIC / v_total_checks) * 100, 2) ELSE 100 END;
END;
$$;

-- Function to get contract summary
CREATE OR REPLACE FUNCTION get_contract_summary(p_contract_id UUID)
RETURNS TABLE (
  contract_id UUID,
  title TEXT,
  contract_number TEXT,
  category contract_category_enum,
  lifecycle_status contract_lifecycle_status_enum,
  total_value NUMERIC,
  party_a_name TEXT,
  party_b_name TEXT,
  start_date DATE,
  end_date DATE,
  days_remaining INTEGER,
  is_fully_signed BOOLEAN,
  deliverables_total INTEGER,
  deliverables_completed INTEGER,
  milestones_total INTEGER,
  milestones_completed INTEGER,
  compliance_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_compliance RECORD;
BEGIN
  SELECT * INTO v_compliance FROM check_contract_compliance(p_contract_id);
  
  RETURN QUERY
  SELECT 
    c.id,
    c.title,
    c.contract_number,
    c.category,
    c.lifecycle_status,
    c.value,
    COALESCE(oa.name, ca.first_name || ' ' || ca.last_name) AS party_a_name,
    COALESCE(ob.name, cb.first_name || ' ' || cb.last_name) AS party_b_name,
    c.start_date,
    c.end_date,
    (c.end_date - CURRENT_DATE)::INTEGER AS days_remaining,
    c.party_a_signed_at IS NOT NULL AND c.party_b_signed_at IS NOT NULL AS is_fully_signed,
    (SELECT COUNT(*)::INTEGER FROM contract_deliverables WHERE contract_id = c.id) AS deliverables_total,
    (SELECT COUNT(*)::INTEGER FROM contract_deliverables WHERE contract_id = c.id AND status IN ('delivered', 'accepted')) AS deliverables_completed,
    (SELECT COUNT(*)::INTEGER FROM contract_milestones WHERE contract_id = c.id) AS milestones_total,
    (SELECT COUNT(*)::INTEGER FROM contract_milestones WHERE contract_id = c.id AND status = 'completed') AS milestones_completed,
    v_compliance.compliance_score
  FROM contracts c
  LEFT JOIN organizations oa ON c.party_a_org_id = oa.id
  LEFT JOIN contacts ca ON c.party_a_contact_id = ca.id
  LEFT JOIN organizations ob ON c.party_b_org_id = ob.id
  LEFT JOIN contacts cb ON c.party_b_contact_id = cb.id
  WHERE c.id = p_contract_id
    AND c.deleted_at IS NULL;
END;
$$;

-- Function to get contracts needing attention
CREATE OR REPLACE FUNCTION get_contracts_needing_attention(
  p_org_id UUID,
  p_days_ahead INTEGER DEFAULT 30
)
RETURNS TABLE (
  contract_id UUID,
  title TEXT,
  attention_type TEXT,
  attention_detail TEXT,
  due_date DATE,
  days_until_due INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  -- Expiring contracts
  SELECT 
    c.id,
    c.title,
    'expiring'::TEXT AS attention_type,
    'Contract expires soon'::TEXT AS attention_detail,
    c.end_date AS due_date,
    (c.end_date - CURRENT_DATE)::INTEGER AS days_until_due
  FROM contracts c
  WHERE c.organization_id = p_org_id
    AND c.lifecycle_status = 'active'
    AND c.end_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + p_days_ahead)
    AND c.deleted_at IS NULL
  
  UNION ALL
  
  -- Pending signatures
  SELECT 
    c.id,
    c.title,
    'pending_signature'::TEXT,
    'Awaiting signature'::TEXT,
    c.start_date,
    (c.start_date - CURRENT_DATE)::INTEGER
  FROM contracts c
  WHERE c.organization_id = p_org_id
    AND c.lifecycle_status = 'pending_signature'
    AND c.deleted_at IS NULL
  
  UNION ALL
  
  -- Overdue deliverables
  SELECT 
    c.id,
    c.title,
    'overdue_deliverable'::TEXT,
    'Deliverable: ' || cd.title,
    cd.due_date,
    (cd.due_date - CURRENT_DATE)::INTEGER
  FROM contracts c
  JOIN contract_deliverables cd ON cd.contract_id = c.id
  WHERE c.organization_id = p_org_id
    AND cd.status IN ('pending', 'in_progress')
    AND cd.due_date < CURRENT_DATE
    AND c.deleted_at IS NULL
  
  ORDER BY days_until_due;
END;
$$;

-- Trigger for contract lifecycle
CREATE OR REPLACE FUNCTION update_contract_lifecycle()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Auto-expire if past end date
  IF NEW.lifecycle_status = 'active' AND NEW.end_date < CURRENT_DATE THEN
    NEW.lifecycle_status := 'expired';
  END IF;
  
  -- Auto-activate if fully signed and start date reached
  IF NEW.lifecycle_status = 'pending_signature' 
     AND NEW.party_a_signed_at IS NOT NULL 
     AND NEW.party_b_signed_at IS NOT NULL
     AND (NEW.start_date IS NULL OR NEW.start_date <= CURRENT_DATE) THEN
    NEW.lifecycle_status := 'active';
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS contract_lifecycle_trigger ON contracts;
CREATE TRIGGER contract_lifecycle_trigger
  BEFORE INSERT OR UPDATE ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_contract_lifecycle();

-- RLS Policies
ALTER TABLE contract_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_signatories ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_deliverables ENABLE ROW LEVEL SECURITY;

CREATE POLICY contract_types_select ON contract_types
  FOR SELECT TO authenticated
  USING (organization_id IS NULL OR org_matches(organization_id));

CREATE POLICY contract_types_manage ON contract_types
  FOR ALL TO authenticated
  USING (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'))
  WITH CHECK (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

CREATE POLICY contract_signatories_select ON contract_signatories
  FOR SELECT TO authenticated
  USING (contract_id IN (SELECT id FROM contracts WHERE org_matches(organization_id)));

CREATE POLICY contract_signatories_manage ON contract_signatories
  FOR ALL TO authenticated
  USING (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'))
  WITH CHECK (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

CREATE POLICY contract_deliverables_select ON contract_deliverables
  FOR SELECT TO authenticated
  USING (contract_id IN (SELECT id FROM contracts WHERE org_matches(organization_id)));

CREATE POLICY contract_deliverables_manage ON contract_deliverables
  FOR ALL TO authenticated
  USING (role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'))
  WITH CHECK (role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON contract_types TO authenticated;
GRANT SELECT, INSERT, UPDATE ON contract_signatories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON contract_deliverables TO authenticated;

GRANT EXECUTE ON FUNCTION check_contract_compliance(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_contract_summary(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_contracts_needing_attention(UUID, INTEGER) TO authenticated;

-- Seed default contract types
INSERT INTO contract_types (organization_id, name, code, category, description, requires_legal_review, requires_insurance, requires_w9) VALUES
  (NULL, 'Vendor Agreement', 'VND', 'vendor', 'Standard vendor service agreement', true, true, true),
  (NULL, 'Contractor Agreement', 'CTR', 'contractor', 'Independent contractor agreement', true, true, true),
  (NULL, 'Artist Agreement', 'ART', 'artist', 'Artist/performer engagement contract', true, false, true),
  (NULL, 'Sponsor Agreement', 'SPN', 'sponsor', 'Sponsorship agreement', true, false, false),
  (NULL, 'Non-Disclosure Agreement', 'NDA', 'nda', 'Confidentiality agreement', false, false, false),
  (NULL, 'Employment Agreement', 'EMP', 'employment', 'Full-time employment contract', true, false, false),
  (NULL, 'Venue Agreement', 'VEN', 'partner', 'Venue rental/partnership agreement', true, true, false),
  (NULL, 'Subcontractor Agreement', 'SUB', 'subcontractor', 'Subcontractor engagement', true, true, true)
ON CONFLICT DO NOTHING;
