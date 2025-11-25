-- =====================================================
-- CONTRACTS SYSTEM
-- =====================================================
-- Complete contract lifecycle management for ATLVS
-- Tracks client contracts, vendor agreements, NDAs, employment contracts

-- =====================================================
-- CONTRACTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Contract details
  title TEXT NOT NULL,
  contract_number TEXT, -- Custom contract numbering system
  type TEXT NOT NULL CHECK (type IN ('service', 'product', 'nda', 'employment', 'partnership', 'licensing')),
  
  -- Parties (FK constraints added later after vendors table exists)
  vendor_id UUID,
  client_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  counterparty_name TEXT, -- For non-vendor/client contracts
  
  -- Financial
  value NUMERIC(15, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_terms TEXT, -- Net 30, Net 60, etc.
  
  -- Dates
  start_date DATE NOT NULL,
  end_date DATE,
  notice_period_days INTEGER DEFAULT 30,
  renewal_date DATE,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'active', 'expired', 'terminated', 'renewed')),
  
  -- Terms
  terms TEXT, -- Contract terms and conditions
  auto_renew BOOLEAN DEFAULT false,
  renewal_terms TEXT,
  
  -- Documents
  document_url TEXT,
  signed_document_url TEXT,
  
  -- Metadata
  tags TEXT[], -- For categorization
  notes TEXT,
  owner_id UUID REFERENCES platform_users(id), -- Contract owner
  
  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id),
  signed_at TIMESTAMPTZ,
  terminated_at TIMESTAMPTZ,
  termination_reason TEXT
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_contracts_organization ON contracts(organization_id);
CREATE INDEX idx_contracts_vendor ON contracts(vendor_id);
CREATE INDEX idx_contracts_client ON contracts(client_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_dates ON contracts(start_date, end_date);
CREATE INDEX idx_contracts_renewal ON contracts(renewal_date) WHERE renewal_date IS NOT NULL;
CREATE INDEX idx_contracts_owner ON contracts(owner_id);

-- =====================================================
-- CONTRACT MILESTONES
-- =====================================================

CREATE TABLE IF NOT EXISTS contract_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'missed')),
  
  -- Deliverables
  deliverable_type TEXT, -- Payment, service, product, review
  amount NUMERIC(15, 2),
  
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES platform_users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contract_milestones_contract ON contract_milestones(contract_id);
CREATE INDEX idx_contract_milestones_status ON contract_milestones(status);
CREATE INDEX idx_contract_milestones_due_date ON contract_milestones(due_date);

-- =====================================================
-- CONTRACT AMENDMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS contract_amendments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  
  amendment_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  
  changes JSONB, -- Structured changes data
  
  effective_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES platform_users(id)
);

CREATE INDEX idx_contract_amendments_contract ON contract_amendments(contract_id);

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_amendments ENABLE ROW LEVEL SECURITY;

-- Contracts policies
CREATE POLICY "Users can view contracts in their organization"
  ON contracts FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM platform_users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert contracts"
  ON contracts FOR INSERT
  TO authenticated
  WITH CHECK (
    org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

CREATE POLICY "Admins can update contracts"
  ON contracts FOR UPDATE
  TO authenticated
  USING (
    org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

CREATE POLICY "Admins can delete contracts"
  ON contracts FOR DELETE
  TO authenticated
  USING (
    org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

-- Contract milestones policies (similar pattern)
CREATE POLICY "Users can view milestones in their organization"
  ON contract_milestones FOR SELECT
  TO authenticated
  USING (
    contract_id IN (
      SELECT id FROM contracts
      WHERE organization_id IN (
        SELECT organization_id FROM platform_users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage milestones"
  ON contract_milestones FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM contracts c
      WHERE c.id = contract_milestones.contract_id
      AND org_matches(c.organization_id) 
      AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
    )
  );

-- Contract amendments policies (similar pattern)
CREATE POLICY "Users can view amendments in their organization"
  ON contract_amendments FOR SELECT
  TO authenticated
  USING (
    contract_id IN (
      SELECT id FROM contracts
      WHERE organization_id IN (
        SELECT organization_id FROM platform_users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage amendments"
  ON contract_amendments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM contracts c
      WHERE c.id = contract_amendments.contract_id
      AND org_matches(c.organization_id) 
      AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
    )
  );

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to get contracts expiring soon
CREATE OR REPLACE FUNCTION get_expiring_contracts(days_ahead INTEGER DEFAULT 30)
RETURNS TABLE (
  contract_id UUID,
  title TEXT,
  end_date DATE,
  days_until_expiry INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.title,
    c.end_date,
    (c.end_date - CURRENT_DATE)::INTEGER as days_until_expiry
  FROM contracts c
  WHERE c.status = 'active'
    AND c.end_date IS NOT NULL
    AND c.end_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + days_ahead)
  ORDER BY c.end_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-expire contracts
CREATE OR REPLACE FUNCTION auto_expire_contracts()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE contracts
  SET status = 'expired',
      updated_at = NOW()
  WHERE status = 'active'
    AND end_date < CURRENT_DATE
    AND auto_renew = false;
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_contracts_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contracts_timestamp
  BEFORE UPDATE ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_contracts_timestamp();

CREATE TRIGGER update_contract_milestones_timestamp
  BEFORE UPDATE ON contract_milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_contracts_timestamp();

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Add contract type to vendors table if needed (will be added when vendors table exists)
-- This is handled in a later migration after vendors table is created

COMMENT ON TABLE contracts IS 'Contract lifecycle management for all agreement types';
COMMENT ON TABLE contract_milestones IS 'Key milestones and deliverables within contracts';
COMMENT ON TABLE contract_amendments IS 'Contract amendments and change orders';
