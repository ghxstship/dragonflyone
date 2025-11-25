-- Migration: Vendor Management Extended System
-- Description: Tables for vendor compliance, onboarding, and qualification

-- Vendor compliance documents
CREATE TABLE IF NOT EXISTS vendor_compliance_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  vendor_id UUID REFERENCES vendors(id),
  onboarding_request_id UUID,
  document_type TEXT NOT NULL CHECK (document_type IN ('w9', 'business_license', 'insurance', 'safety_certification', 'background_check', 'contract', 'nda', 'other')),
  name TEXT NOT NULL,
  description TEXT,
  document_url TEXT NOT NULL,
  effective_date DATE,
  expiration_date DATE,
  requires_renewal BOOLEAN DEFAULT false,
  renewal_reminder_days INT DEFAULT 30,
  is_required BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'superseded', 'archived')),
  notes TEXT,
  uploaded_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_compliance_documents_vendor ON vendor_compliance_documents(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_compliance_documents_type ON vendor_compliance_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_vendor_compliance_documents_expiration ON vendor_compliance_documents(expiration_date);

-- Compliance requirements
CREATE TABLE IF NOT EXISTS compliance_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('w9', 'business_license', 'insurance', 'safety_certification', 'background_check', 'contract', 'nda', 'other')),
  description TEXT,
  is_required BOOLEAN DEFAULT true,
  applies_to_vendor_types TEXT[],
  renewal_frequency_months INT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_requirements_type ON compliance_requirements(document_type);

-- Compliance document requests
CREATE TABLE IF NOT EXISTS compliance_document_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  document_type TEXT NOT NULL,
  message TEXT,
  due_date DATE,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'received', 'completed', 'overdue')),
  requested_by UUID REFERENCES platform_users(id),
  completed_at TIMESTAMPTZ,
  document_id UUID REFERENCES vendor_compliance_documents(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_document_requests_vendor ON compliance_document_requests(vendor_id);

-- Vendor onboarding requests
CREATE TABLE IF NOT EXISTS vendor_onboarding_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  vendor_name TEXT NOT NULL,
  vendor_type TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'USA',
  services_offered TEXT[],
  annual_revenue TEXT,
  years_in_business INT,
  references JSONB,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'pending_info', 'approved', 'rejected')),
  vendor_id UUID REFERENCES vendors(id),
  approved_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  approval_notes TEXT,
  rejected_by UUID REFERENCES platform_users(id),
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  info_requested_at TIMESTAMPTZ,
  info_requested_by UUID REFERENCES platform_users(id),
  info_items_needed TEXT[],
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_onboarding_requests_status ON vendor_onboarding_requests(status);
CREATE INDEX IF NOT EXISTS idx_vendor_onboarding_requests_type ON vendor_onboarding_requests(vendor_type);

-- Vendor qualification criteria
CREATE TABLE IF NOT EXISTS vendor_qualification_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  criteria_type TEXT NOT NULL CHECK (criteria_type IN ('document', 'certification', 'insurance', 'financial', 'reference', 'other')),
  description TEXT,
  is_required BOOLEAN DEFAULT true,
  weight INT DEFAULT 10 CHECK (weight >= 0 AND weight <= 100),
  applies_to_vendor_types TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_qualification_criteria_type ON vendor_qualification_criteria(criteria_type);

-- Vendor onboarding checklist
CREATE TABLE IF NOT EXISTS vendor_onboarding_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_request_id UUID NOT NULL REFERENCES vendor_onboarding_requests(id) ON DELETE CASCADE,
  criteria_id UUID REFERENCES vendor_qualification_criteria(id),
  name TEXT NOT NULL,
  description TEXT,
  is_required BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'waived')),
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES platform_users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_onboarding_checklist_request ON vendor_onboarding_checklist(onboarding_request_id);

-- Vendor qualification evaluations
CREATE TABLE IF NOT EXISTS vendor_qualification_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_request_id UUID NOT NULL REFERENCES vendor_onboarding_requests(id) ON DELETE CASCADE,
  criteria_id UUID NOT NULL REFERENCES vendor_qualification_criteria(id),
  is_met BOOLEAN NOT NULL,
  notes TEXT,
  evidence_url TEXT,
  evaluated_by UUID REFERENCES platform_users(id),
  evaluated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(onboarding_request_id, criteria_id)
);

CREATE INDEX IF NOT EXISTS idx_vendor_qualification_evaluations_request ON vendor_qualification_evaluations(onboarding_request_id);

-- Spend approval matrices
CREATE TABLE IF NOT EXISTS spend_approval_matrices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  min_amount NUMERIC(12,2) NOT NULL,
  max_amount NUMERIC(12,2),
  required_approvers INT DEFAULT 1,
  approver_roles TEXT[],
  approver_users UUID[],
  requires_sequential BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_spend_approval_matrices_category ON spend_approval_matrices(category);
CREATE INDEX IF NOT EXISTS idx_spend_approval_matrices_amount ON spend_approval_matrices(min_amount, max_amount);

-- Blanket POs
CREATE TABLE IF NOT EXISTS blanket_purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  po_number TEXT NOT NULL UNIQUE,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL,
  amount_used NUMERIC(12,2) DEFAULT 0,
  amount_remaining NUMERIC(12,2),
  release_limit NUMERIC(12,2),
  terms TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'suspended', 'completed', 'cancelled')),
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blanket_purchase_orders_vendor ON blanket_purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_blanket_purchase_orders_status ON blanket_purchase_orders(status);

-- Blanket PO releases
CREATE TABLE IF NOT EXISTS blanket_po_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blanket_po_id UUID NOT NULL REFERENCES blanket_purchase_orders(id),
  release_number INT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  description TEXT,
  delivery_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'received', 'invoiced', 'paid')),
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blanket_po_releases_blanket ON blanket_po_releases(blanket_po_id);

-- Function to calculate vendor compliance score
CREATE OR REPLACE FUNCTION calculate_vendor_compliance_score(p_vendor_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_required INT;
  v_compliant INT;
BEGIN
  SELECT COUNT(*) INTO v_total_required
  FROM compliance_requirements
  WHERE is_active = TRUE AND is_required = TRUE;
  
  IF v_total_required = 0 THEN
    RETURN 100;
  END IF;
  
  SELECT COUNT(DISTINCT cr.document_type) INTO v_compliant
  FROM compliance_requirements cr
  JOIN vendor_compliance_documents vcd ON vcd.document_type = cr.document_type
  WHERE cr.is_active = TRUE 
    AND cr.is_required = TRUE
    AND vcd.vendor_id = p_vendor_id
    AND vcd.status = 'active'
    AND (vcd.expiration_date IS NULL OR vcd.expiration_date >= CURRENT_DATE);
  
  RETURN (v_compliant::NUMERIC / v_total_required * 100)::NUMERIC(5,2);
END;
$$;

-- Function to get approval matrix for amount
CREATE OR REPLACE FUNCTION get_approval_matrix(
  p_amount NUMERIC,
  p_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  matrix_id UUID,
  matrix_name TEXT,
  required_approvers INT,
  approver_roles TEXT[],
  requires_sequential BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sam.id as matrix_id,
    sam.name as matrix_name,
    sam.required_approvers,
    sam.approver_roles,
    sam.requires_sequential
  FROM spend_approval_matrices sam
  WHERE sam.is_active = TRUE
    AND sam.min_amount <= p_amount
    AND (sam.max_amount IS NULL OR sam.max_amount >= p_amount)
    AND (p_category IS NULL OR sam.category IS NULL OR sam.category = p_category)
  ORDER BY sam.min_amount DESC
  LIMIT 1;
END;
$$;

-- RLS policies
ALTER TABLE vendor_compliance_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_document_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_onboarding_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_qualification_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_onboarding_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_qualification_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE spend_approval_matrices ENABLE ROW LEVEL SECURITY;
ALTER TABLE blanket_purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE blanket_po_releases ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON vendor_compliance_documents TO authenticated;
GRANT SELECT, INSERT, UPDATE ON compliance_requirements TO authenticated;
GRANT SELECT, INSERT, UPDATE ON compliance_document_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE ON vendor_onboarding_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE ON vendor_qualification_criteria TO authenticated;
GRANT SELECT, INSERT, UPDATE ON vendor_onboarding_checklist TO authenticated;
GRANT SELECT, INSERT, UPDATE ON vendor_qualification_evaluations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON spend_approval_matrices TO authenticated;
GRANT SELECT, INSERT, UPDATE ON blanket_purchase_orders TO authenticated;
GRANT SELECT, INSERT, UPDATE ON blanket_po_releases TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_vendor_compliance_score(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_approval_matrix(NUMERIC, TEXT) TO authenticated;
