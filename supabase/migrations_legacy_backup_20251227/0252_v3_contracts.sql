-- V3 Contracts & E-Signatures Migration
-- DG-002: Contract Generation with Electronic Signatures

-- Contract status enum
DO $$ BEGIN
  CREATE TYPE contract_status AS ENUM (
    'draft',
    'pending_signatures',
    'partially_signed',
    'completed',
    'voided',
    'expired'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Signature status enum
DO $$ BEGIN
  CREATE TYPE signature_status AS ENUM (
    'pending',
    'signed',
    'declined',
    'expired'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Contract clauses library
CREATE TABLE IF NOT EXISTS contract_clauses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  is_required BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contract templates
CREATE TABLE IF NOT EXISTS contract_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  event_type TEXT,
  clauses JSONB DEFAULT '[]'::jsonb,
  default_signers JSONB DEFAULT '[]'::jsonb,
  variables JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contracts
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL,
  template_id UUID REFERENCES contract_templates(id) ON DELETE SET NULL,
  contract_number TEXT NOT NULL,
  name TEXT NOT NULL,
  status contract_status DEFAULT 'draft',
  content JSONB DEFAULT '{}'::jsonb,
  clauses JSONB DEFAULT '[]'::jsonb,
  signers JSONB DEFAULT '[]'::jsonb,
  signature_order BOOLEAN DEFAULT false,
  public_token TEXT UNIQUE,
  valid_until TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  voided_at TIMESTAMPTZ,
  voided_reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contract signatures
CREATE TABLE IF NOT EXISTS contract_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  signer_email TEXT NOT NULL,
  signer_name TEXT NOT NULL,
  signer_role TEXT,
  sign_order INTEGER DEFAULT 0,
  status signature_status DEFAULT 'pending',
  signature_data JSONB,
  signed_ip TEXT,
  signed_user_agent TEXT,
  signed_at TIMESTAMPTZ,
  reminder_sent_at TIMESTAMPTZ,
  reminder_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contract audit trail
CREATE TABLE IF NOT EXISTS contract_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  actor_id UUID REFERENCES auth.users(id),
  actor_email TEXT,
  actor_ip TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-generate contract number
CREATE OR REPLACE FUNCTION generate_contract_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.contract_number IS NULL OR NEW.contract_number = '' THEN
    NEW.contract_number := 'CTR-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
      LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_contract_number ON contracts;
CREATE TRIGGER trigger_generate_contract_number
  BEFORE INSERT ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION generate_contract_number();

-- Generate public token for signing
CREATE OR REPLACE FUNCTION generate_contract_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.public_token IS NULL THEN
    NEW.public_token := encode(gen_random_bytes(32), 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_contract_token ON contracts;
CREATE TRIGGER trigger_generate_contract_token
  BEFORE INSERT ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION generate_contract_token();

-- Update contract status when all signed
CREATE OR REPLACE FUNCTION update_contract_status_on_sign()
RETURNS TRIGGER AS $$
DECLARE
  pending_count INTEGER;
  total_count INTEGER;
BEGIN
  IF NEW.status = 'signed' AND OLD.status != 'signed' THEN
    SELECT COUNT(*) INTO total_count
    FROM contract_signatures
    WHERE contract_id = NEW.contract_id;
    
    SELECT COUNT(*) INTO pending_count
    FROM contract_signatures
    WHERE contract_id = NEW.contract_id AND status = 'pending';
    
    IF pending_count = 0 THEN
      UPDATE contracts
      SET status = 'completed', completed_at = NOW(), updated_at = NOW()
      WHERE id = NEW.contract_id;
    ELSIF pending_count < total_count THEN
      UPDATE contracts
      SET status = 'partially_signed', updated_at = NOW()
      WHERE id = NEW.contract_id;
    END IF;
    
    -- Add audit log
    INSERT INTO contract_audit_logs (contract_id, action, actor_email, details)
    VALUES (NEW.contract_id, 'signature_added', NEW.signer_email, 
      jsonb_build_object('signer_name', NEW.signer_name, 'signed_at', NEW.signed_at));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_contract_status ON contract_signatures;
CREATE TRIGGER trigger_update_contract_status
  AFTER UPDATE ON contract_signatures
  FOR EACH ROW
  EXECUTE FUNCTION update_contract_status_on_sign();

-- Add missing columns to existing tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'organization_id') THEN
    ALTER TABLE contracts ADD COLUMN organization_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'booking_id') THEN
    ALTER TABLE contracts ADD COLUMN booking_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'public_token') THEN
    ALTER TABLE contracts ADD COLUMN public_token TEXT UNIQUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'status') THEN
    ALTER TABLE contracts ADD COLUMN status TEXT DEFAULT 'draft';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contract_signatures' AND column_name = 'contract_id') THEN
    ALTER TABLE contract_signatures ADD COLUMN contract_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contract_signatures' AND column_name = 'signer_email') THEN
    ALTER TABLE contract_signatures ADD COLUMN signer_email TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contract_clauses' AND column_name = 'organization_id') THEN
    ALTER TABLE contract_clauses ADD COLUMN organization_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contract_templates' AND column_name = 'organization_id') THEN
    ALTER TABLE contract_templates ADD COLUMN organization_id UUID;
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contracts_org ON contracts(organization_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_booking ON contracts(booking_id);
CREATE INDEX IF NOT EXISTS idx_contracts_token ON contracts(public_token);
CREATE INDEX IF NOT EXISTS idx_contract_signatures_contract ON contract_signatures(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_signatures_email ON contract_signatures(signer_email);
CREATE INDEX IF NOT EXISTS idx_contract_clauses_org ON contract_clauses(organization_id);
CREATE INDEX IF NOT EXISTS idx_contract_templates_org ON contract_templates(organization_id);

-- RLS Policies
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_clauses ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_audit_logs ENABLE ROW LEVEL SECURITY;

-- Contracts policies
DROP POLICY IF EXISTS contracts_org_access ON contracts;
CREATE POLICY contracts_org_access ON contracts
  FOR ALL USING (org_matches(organization_id));

-- Contract signatures policies
DROP POLICY IF EXISTS signatures_contract_access ON contract_signatures;
CREATE POLICY signatures_contract_access ON contract_signatures
  FOR ALL USING (
    contract_id IN (
      SELECT id FROM contracts WHERE org_matches(organization_id)
    )
  );

-- Clauses policies
DROP POLICY IF EXISTS clauses_org_access ON contract_clauses;
CREATE POLICY clauses_org_access ON contract_clauses
  FOR ALL USING (org_matches(organization_id));

-- Templates policies
DROP POLICY IF EXISTS templates_org_access ON contract_templates;
CREATE POLICY templates_org_access ON contract_templates
  FOR ALL USING (org_matches(organization_id));

-- Audit logs policies
DROP POLICY IF EXISTS audit_contract_access ON contract_audit_logs;
CREATE POLICY audit_contract_access ON contract_audit_logs
  FOR SELECT USING (
    contract_id IN (
      SELECT id FROM contracts WHERE org_matches(organization_id)
    )
  );

-- Grants
GRANT ALL ON contracts TO authenticated;
GRANT ALL ON contract_signatures TO authenticated;
GRANT ALL ON contract_clauses TO authenticated;
GRANT ALL ON contract_templates TO authenticated;
GRANT SELECT ON contract_audit_logs TO authenticated;

-- Default clauses for new organizations
CREATE OR REPLACE FUNCTION create_default_contract_clauses()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO contract_clauses (organization_id, name, category, content, is_required, sort_order) VALUES
    (NEW.id, 'Event Details', 'general', 'This agreement is for the event described herein, including date, time, location, and guest count as specified in the attached proposal.', true, 1),
    (NEW.id, 'Payment Terms', 'financial', 'Payment shall be made according to the payment schedule outlined in this agreement. A deposit of {{deposit_percentage}}% is required to confirm the booking.', true, 2),
    (NEW.id, 'Cancellation Policy', 'legal', 'Cancellations made within {{cancellation_days}} days of the event date will forfeit the deposit. Cancellations made within 7 days will be charged the full amount.', true, 3),
    (NEW.id, 'Liability Waiver', 'legal', 'Client agrees to indemnify and hold harmless the venue from any claims arising from the event, except in cases of gross negligence.', true, 4),
    (NEW.id, 'Force Majeure', 'legal', 'Neither party shall be liable for failure to perform obligations due to circumstances beyond reasonable control, including natural disasters, pandemics, or government actions.', false, 5),
    (NEW.id, 'Venue Rules', 'operational', 'Client agrees to abide by all venue rules and regulations, including noise restrictions, capacity limits, and designated areas for activities.', false, 6),
    (NEW.id, 'Insurance Requirements', 'legal', 'Client is required to provide proof of event liability insurance with a minimum coverage of ${{insurance_amount}} at least {{insurance_days}} days prior to the event.', false, 7),
    (NEW.id, 'Catering Terms', 'operational', 'Final guest count must be provided {{final_count_days}} days before the event. The venue will bill for the confirmed count or actual attendance, whichever is greater.', false, 8);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE contracts IS 'DG-002: Contracts with electronic signatures';
COMMENT ON TABLE contract_signatures IS 'Individual signer records for contracts';
COMMENT ON TABLE contract_clauses IS 'Reusable clause library for contract building';
COMMENT ON TABLE contract_templates IS 'Contract templates for quick creation';
