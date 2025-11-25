-- Migration: Contract Management System
-- Description: Tables for contract negotiation, vendor contracts, and renewals

-- Contract negotiations
CREATE TABLE IF NOT EXISTS contract_negotiations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  contract_id UUID REFERENCES contracts(id),
  counterparty_id UUID,
  counterparty_name TEXT NOT NULL,
  counterparty_contact TEXT,
  start_date DATE NOT NULL,
  target_close_date DATE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_negotiation', 'pending_approval', 'approved', 'executed', 'terminated')),
  key_terms JSONB,
  notes TEXT,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contract_negotiations_contract ON contract_negotiations(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_negotiations_status ON contract_negotiations(status);

-- Contract versions
CREATE TABLE IF NOT EXISTS contract_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  document_url TEXT NOT NULL,
  changes_summary TEXT,
  redlines JSONB,
  is_current BOOLEAN DEFAULT false,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(contract_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_contract_versions_contract ON contract_versions(contract_id);

-- Negotiation history
CREATE TABLE IF NOT EXISTS negotiation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  negotiation_id UUID NOT NULL REFERENCES contract_negotiations(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  performed_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_negotiation_history_negotiation ON negotiation_history(negotiation_id);

-- Vendor contracts
CREATE TABLE IF NOT EXISTS vendor_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  contract_type TEXT NOT NULL CHECK (contract_type IN ('master_service', 'purchase', 'rental', 'nda', 'sow', 'other')),
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  auto_renew BOOLEAN DEFAULT false,
  renewal_notice_days INT DEFAULT 30,
  value NUMERIC(12,2),
  payment_terms TEXT,
  document_url TEXT,
  key_terms JSONB,
  contacts JSONB,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'expired', 'terminated', 'renewed')),
  renewal_count INT DEFAULT 0,
  last_renewed_at TIMESTAMPTZ,
  terminated_at TIMESTAMPTZ,
  terminated_by UUID REFERENCES platform_users(id),
  termination_reason TEXT,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_contracts_vendor ON vendor_contracts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_contracts_status ON vendor_contracts(status);
CREATE INDEX IF NOT EXISTS idx_vendor_contracts_end_date ON vendor_contracts(end_date);

-- Contract renewals
CREATE TABLE IF NOT EXISTS contract_renewals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES vendor_contracts(id) ON DELETE CASCADE,
  previous_end_date DATE NOT NULL,
  new_end_date DATE NOT NULL,
  previous_value NUMERIC(12,2),
  new_value NUMERIC(12,2),
  notes TEXT,
  renewed_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contract_renewals_contract ON contract_renewals(contract_id);

-- Scheduled notifications
CREATE TABLE IF NOT EXISTS scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  is_sent BOOLEAN DEFAULT false,
  reference_type TEXT,
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_user ON scheduled_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_scheduled ON scheduled_notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_sent ON scheduled_notifications(is_sent);

-- Function to get expiring contracts
CREATE OR REPLACE FUNCTION get_expiring_contracts(p_days INT DEFAULT 30)
RETURNS TABLE (
  id UUID,
  name TEXT,
  vendor_name TEXT,
  end_date DATE,
  days_until_expiry INT,
  auto_renew BOOLEAN,
  renewal_notice_days INT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vc.id,
    vc.name,
    v.name as vendor_name,
    vc.end_date,
    (vc.end_date - CURRENT_DATE)::INT as days_until_expiry,
    vc.auto_renew,
    vc.renewal_notice_days
  FROM vendor_contracts vc
  JOIN vendors v ON vc.vendor_id = v.id
  WHERE vc.status = 'active'
    AND vc.end_date <= CURRENT_DATE + p_days
    AND vc.end_date >= CURRENT_DATE
  ORDER BY vc.end_date ASC;
END;
$$;

-- Function to process scheduled notifications
CREATE OR REPLACE FUNCTION process_scheduled_notifications()
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  v_count INT := 0;
  v_notification RECORD;
BEGIN
  FOR v_notification IN 
    SELECT * FROM scheduled_notifications 
    WHERE scheduled_for <= NOW() 
      AND is_sent = FALSE
  LOOP
    -- Create actual notification
    INSERT INTO notifications (
      user_id, type, title, message, link, reference_type, reference_id
    )
    VALUES (
      v_notification.user_id,
      v_notification.type,
      v_notification.title,
      v_notification.message,
      v_notification.link,
      v_notification.reference_type,
      v_notification.reference_id
    );
    
    -- Mark as sent
    UPDATE scheduled_notifications SET
      is_sent = TRUE,
      sent_at = NOW()
    WHERE id = v_notification.id;
    
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$;

-- Function to auto-expire contracts
CREATE OR REPLACE FUNCTION auto_expire_contracts()
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  v_count INT;
BEGIN
  UPDATE vendor_contracts SET
    status = 'expired',
    updated_at = NOW()
  WHERE status = 'active'
    AND end_date < CURRENT_DATE
    AND auto_renew = FALSE;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- RLS policies
ALTER TABLE contract_negotiations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE negotiation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_renewals ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON contract_negotiations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON contract_versions TO authenticated;
GRANT SELECT, INSERT ON negotiation_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON vendor_contracts TO authenticated;
GRANT SELECT, INSERT ON contract_renewals TO authenticated;
GRANT SELECT, INSERT, UPDATE ON scheduled_notifications TO authenticated;
GRANT EXECUTE ON FUNCTION get_expiring_contracts(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION process_scheduled_notifications() TO authenticated;
GRANT EXECUTE ON FUNCTION auto_expire_contracts() TO authenticated;
