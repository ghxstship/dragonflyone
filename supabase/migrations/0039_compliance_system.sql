-- =====================================================
-- COMPLIANCE SYSTEM
-- =====================================================
-- Tracks insurance policies, licenses, certifications, and regulatory compliance
-- Critical for ATLVS business operations and risk management

-- =====================================================
-- COMPLIANCE ITEMS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS compliance_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Item details
  title TEXT NOT NULL,
  compliance_type TEXT NOT NULL CHECK (compliance_type IN (
    'insurance', 'license', 'certification', 'permit', 'registration', 'audit', 'inspection', 'regulation'
  )),
  category TEXT, -- General liability, workers comp, business license, etc.
  
  -- Provider/issuer
  provider_name TEXT, -- Insurance company, licensing authority
  provider_contact TEXT,
  policy_number TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'pending', 'cancelled', 'suspended')),
  
  -- Dates
  issue_date DATE,
  effective_date DATE NOT NULL,
  expiration_date DATE,
  renewal_date DATE,
  last_inspection_date DATE,
  
  -- Financial
  annual_cost NUMERIC(12, 2),
  currency TEXT DEFAULT 'USD',
  coverage_amount NUMERIC(15, 2), -- For insurance
  deductible NUMERIC(12, 2), -- For insurance
  
  -- Requirements
  required_by TEXT[], -- Which projects, venues, or regulations require this
  coverage_details JSONB, -- Structured coverage information
  
  -- Documents
  document_url TEXT,
  certificate_url TEXT,
  
  -- Notifications
  reminder_days_before INTEGER DEFAULT 30,
  auto_renew BOOLEAN DEFAULT false,
  
  -- Tracking
  owner_id UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id),
  
  notes TEXT,
  tags TEXT[]
);

-- =====================================================
-- COMPLIANCE REQUIREMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS compliance_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  requirement_type TEXT NOT NULL,
  source TEXT, -- Regulatory body, client requirement, venue requirement
  
  -- Applicability
  applies_to TEXT[], -- project types, event types, locations
  mandatory BOOLEAN DEFAULT true,
  
  -- Tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'compliant', 'non_compliant')),
  
  compliance_item_id UUID REFERENCES compliance_items(id), -- Link to actual compliance item
  
  due_date DATE,
  last_verified_date DATE,
  verification_frequency_days INTEGER, -- How often verification is needed
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id),
  
  notes TEXT
);

-- =====================================================
-- COMPLIANCE EVENTS TABLE  
-- =====================================================

CREATE TABLE IF NOT EXISTS compliance_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  compliance_item_id UUID NOT NULL REFERENCES compliance_items(id) ON DELETE CASCADE,
  
  event_type TEXT NOT NULL CHECK (event_type IN (
    'created', 'renewed', 'expired', 'cancelled', 'updated', 'verified', 'flagged', 'resolved'
  )),
  
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Financial tracking for renewals
  cost NUMERIC(12, 2),
  
  performed_by UUID REFERENCES platform_users(id),
  
  metadata JSONB, -- Additional event data
  notes TEXT
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_compliance_items_org ON compliance_items(organization_id);
CREATE INDEX idx_compliance_items_type ON compliance_items(compliance_type);
CREATE INDEX idx_compliance_items_status ON compliance_items(status);
CREATE INDEX idx_compliance_items_expiration ON compliance_items(expiration_date);
CREATE INDEX idx_compliance_items_owner ON compliance_items(owner_id);

CREATE INDEX idx_compliance_requirements_org ON compliance_requirements(organization_id);
CREATE INDEX idx_compliance_requirements_status ON compliance_requirements(status);
CREATE INDEX idx_compliance_requirements_due ON compliance_requirements(due_date);

CREATE INDEX idx_compliance_events_item ON compliance_events(compliance_item_id);
CREATE INDEX idx_compliance_events_type ON compliance_events(event_type);
CREATE INDEX idx_compliance_events_date ON compliance_events(event_date);

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE compliance_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_events ENABLE ROW LEVEL SECURITY;

-- Compliance items policies
CREATE POLICY "Users can view compliance items in their organization"
  ON compliance_items FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM platform_users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage compliance items"
  ON compliance_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM platform_users
      WHERE id = auth.uid()
      AND organization_id = compliance_items.organization_id
      AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
    )
  );

-- Compliance requirements policies (similar pattern)
CREATE POLICY "Users can view requirements in their organization"
  ON compliance_requirements FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM platform_users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage requirements"
  ON compliance_requirements FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM platform_users
      WHERE id = auth.uid()
      AND organization_id = compliance_requirements.organization_id
      AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
    )
  );

-- Compliance events policies
CREATE POLICY "Users can view events in their organization"
  ON compliance_events FOR SELECT
  TO authenticated
  USING (
    compliance_item_id IN (
      SELECT id FROM compliance_items
      WHERE organization_id IN (
        SELECT organization_id FROM platform_users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create events"
  ON compliance_events FOR INSERT
  TO authenticated
  WITH CHECK (
    compliance_item_id IN (
      SELECT id FROM compliance_items
      WHERE organization_id IN (
        SELECT organization_id FROM platform_users WHERE id = auth.uid()
      )
    )
  );

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to get items expiring soon
CREATE OR REPLACE FUNCTION get_expiring_compliance(days_ahead INTEGER DEFAULT 30)
RETURNS TABLE (
  item_id UUID,
  title TEXT,
  compliance_type TEXT,
  expiration_date DATE,
  days_until_expiry INTEGER,
  owner_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ci.id,
    ci.title,
    ci.compliance_type,
    ci.expiration_date,
    (ci.expiration_date - CURRENT_DATE)::INTEGER as days_until_expiry,
    pu.full_name
  FROM compliance_items ci
  LEFT JOIN platform_users pu ON ci.owner_id = pu.id
  WHERE ci.status = 'active'
    AND ci.expiration_date IS NOT NULL
    AND ci.expiration_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + days_ahead)
  ORDER BY ci.expiration_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-expire items
CREATE OR REPLACE FUNCTION auto_expire_compliance()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  -- Update expired items
  UPDATE compliance_items
  SET status = 'expired',
      updated_at = NOW()
  WHERE status = 'active'
    AND expiration_date < CURRENT_DATE
    AND auto_renew = false;
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  
  -- Log expiration events
  INSERT INTO compliance_events (compliance_item_id, event_type, description)
  SELECT id, 'expired', 'Automatically expired'
  FROM compliance_items
  WHERE status = 'expired'
    AND updated_at >= NOW() - INTERVAL '1 minute';
  
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate compliance score
CREATE OR REPLACE FUNCTION calculate_compliance_score(org_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  total_items INTEGER;
  compliant_items INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_items
  FROM compliance_items
  WHERE organization_id = org_id;
  
  IF total_items = 0 THEN
    RETURN 100.0;
  END IF;
  
  SELECT COUNT(*) INTO compliant_items
  FROM compliance_items
  WHERE organization_id = org_id
    AND status = 'active'
    AND (expiration_date IS NULL OR expiration_date >= CURRENT_DATE);
  
  RETURN ROUND((compliant_items::NUMERIC / total_items::NUMERIC) * 100, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_compliance_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_compliance_items_timestamp
  BEFORE UPDATE ON compliance_items
  FOR EACH ROW
  EXECUTE FUNCTION update_compliance_timestamp();

CREATE TRIGGER update_compliance_requirements_timestamp
  BEFORE UPDATE ON compliance_requirements
  FOR EACH ROW
  EXECUTE FUNCTION update_compliance_timestamp();

-- Log status changes
CREATE OR REPLACE FUNCTION log_compliance_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO compliance_events (compliance_item_id, event_type, description)
    VALUES (NEW.id, 'updated', 'Status changed from ' || OLD.status || ' to ' || NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_compliance_status
  AFTER UPDATE OF status ON compliance_items
  FOR EACH ROW
  EXECUTE FUNCTION log_compliance_status_change();

COMMENT ON TABLE compliance_items IS 'Tracks insurance, licenses, certifications, and regulatory compliance';
COMMENT ON TABLE compliance_requirements IS 'Defines compliance requirements and their applicability';
COMMENT ON TABLE compliance_events IS 'Audit trail for compliance item lifecycle events';
