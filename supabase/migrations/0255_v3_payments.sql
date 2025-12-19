-- Migration: 0055_v3_payments.sql
-- Description: PM-001 Integrated Payment Gateway System
-- Created: 2024-01-18

-- =====================================================
-- ENUMS
-- =====================================================

DO $$ BEGIN
  CREATE TYPE gateway_type AS ENUM (
    'stripe',
    'square',
    'paypal',
    'authorize_net'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE transaction_status AS ENUM (
    'pending',
    'processing',
    'succeeded',
    'failed',
    'cancelled',
    'refunded',
    'partially_refunded',
    'disputed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE refund_status AS ENUM (
    'pending',
    'succeeded',
    'failed',
    'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- TABLES
-- =====================================================

-- Payment Gateway Configuration
CREATE TABLE IF NOT EXISTS payment_gateways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  gateway_type gateway_type NOT NULL,
  name TEXT NOT NULL,
  
  -- Encrypted credentials
  credentials JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Settings
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  supports_ach BOOLEAN DEFAULT false,
  supports_apple_pay BOOLEAN DEFAULT false,
  supports_google_pay BOOLEAN DEFAULT false,
  
  -- Stripe specific
  stripe_account_id TEXT,
  stripe_publishable_key TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  gateway_id UUID REFERENCES payment_gateways(id),
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  
  -- Transaction details
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'USD',
  status transaction_status DEFAULT 'pending',
  
  -- Payment method
  payment_method_type TEXT,
  card_brand TEXT,
  card_last_four TEXT,
  
  -- Gateway references
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  stripe_customer_id TEXT,
  
  -- Processing
  processed_at TIMESTAMPTZ,
  failure_code TEXT,
  failure_message TEXT,
  
  -- Metadata
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Refunds
CREATE TABLE IF NOT EXISTS payment_refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  transaction_id UUID NOT NULL REFERENCES payment_transactions(id) ON DELETE CASCADE,
  
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  reason TEXT,
  status refund_status DEFAULT 'pending',
  
  -- Gateway references
  stripe_refund_id TEXT,
  
  processed_at TIMESTAMPTZ,
  failure_message TEXT,
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook Events
CREATE TABLE IF NOT EXISTS payment_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  gateway_type gateway_type NOT NULL,
  
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_webhook_event UNIQUE (gateway_type, event_id)
);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Update transaction status from refunds
CREATE OR REPLACE FUNCTION update_transaction_refund_status()
RETURNS TRIGGER AS $$
DECLARE
  total_refunded DECIMAL(12,2);
  transaction_amount DECIMAL(12,2);
BEGIN
  IF NEW.status = 'succeeded' THEN
    SELECT COALESCE(SUM(amount), 0) INTO total_refunded
    FROM payment_refunds
    WHERE transaction_id = NEW.transaction_id AND status = 'succeeded';
    
    SELECT amount INTO transaction_amount
    FROM payment_transactions
    WHERE id = NEW.transaction_id;
    
    UPDATE payment_transactions
    SET status = CASE 
      WHEN total_refunded >= transaction_amount THEN 'refunded'::transaction_status
      WHEN total_refunded > 0 THEN 'partially_refunded'::transaction_status
      ELSE status
    END,
    updated_at = NOW()
    WHERE id = NEW.transaction_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_transaction_refund_status ON payment_refunds;
CREATE TRIGGER trigger_update_transaction_refund_status
  AFTER INSERT OR UPDATE ON payment_refunds
  FOR EACH ROW
  EXECUTE FUNCTION update_transaction_refund_status();

-- =====================================================
-- ADD MISSING COLUMNS TO EXISTING TABLES
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_transactions' AND column_name = 'organization_id') THEN
    ALTER TABLE payment_transactions ADD COLUMN organization_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_transactions' AND column_name = 'invoice_id') THEN
    ALTER TABLE payment_transactions ADD COLUMN invoice_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_transactions' AND column_name = 'booking_id') THEN
    ALTER TABLE payment_transactions ADD COLUMN booking_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_transactions' AND column_name = 'status') THEN
    ALTER TABLE payment_transactions ADD COLUMN status TEXT DEFAULT 'pending';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_transactions' AND column_name = 'stripe_payment_intent_id') THEN
    ALTER TABLE payment_transactions ADD COLUMN stripe_payment_intent_id TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_refunds' AND column_name = 'transaction_id') THEN
    ALTER TABLE payment_refunds ADD COLUMN transaction_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_refunds' AND column_name = 'organization_id') THEN
    ALTER TABLE payment_refunds ADD COLUMN organization_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_gateways' AND column_name = 'organization_id') THEN
    ALTER TABLE payment_gateways ADD COLUMN organization_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_webhook_events' AND column_name = 'organization_id') THEN
    ALTER TABLE payment_webhook_events ADD COLUMN organization_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_webhook_events' AND column_name = 'processed') THEN
    ALTER TABLE payment_webhook_events ADD COLUMN processed BOOLEAN DEFAULT false;
  END IF;
END $$;

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_payment_gateways_organization ON payment_gateways(organization_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_organization ON payment_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_invoice ON payment_transactions(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_booking ON payment_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_stripe_intent ON payment_transactions(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_refunds_transaction ON payment_refunds(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_webhook_events_processed ON payment_webhook_events(processed);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE payment_gateways ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_webhook_events ENABLE ROW LEVEL SECURITY;

-- Gateway policies
DROP POLICY IF EXISTS "Users can view gateways in their organization" ON payment_gateways;
CREATE POLICY "Users can view gateways in their organization"
  ON payment_gateways FOR SELECT
  USING (org_matches(organization_id));

DROP POLICY IF EXISTS "Admins can manage gateways in their organization" ON payment_gateways;
CREATE POLICY "Admins can manage gateways in their organization"
  ON payment_gateways FOR ALL
  USING (org_matches(organization_id));

-- Transaction policies
DROP POLICY IF EXISTS "Users can view transactions in their organization" ON payment_transactions;
CREATE POLICY "Users can view transactions in their organization"
  ON payment_transactions FOR SELECT
  USING (org_matches(organization_id));

DROP POLICY IF EXISTS "Users can create transactions in their organization" ON payment_transactions;
CREATE POLICY "Users can create transactions in their organization"
  ON payment_transactions FOR INSERT
  WITH CHECK (org_matches(organization_id));

-- Refund policies
DROP POLICY IF EXISTS "Users can view refunds in their organization" ON payment_refunds;
CREATE POLICY "Users can view refunds in their organization"
  ON payment_refunds FOR SELECT
  USING (org_matches(organization_id));

DROP POLICY IF EXISTS "Admins can create refunds in their organization" ON payment_refunds;
CREATE POLICY "Admins can create refunds in their organization"
  ON payment_refunds FOR INSERT
  WITH CHECK (org_matches(organization_id));

-- Webhook policies (service role only typically)
DROP POLICY IF EXISTS "Users can view webhook events in their organization" ON payment_webhook_events;
CREATE POLICY "Users can view webhook events in their organization"
  ON payment_webhook_events FOR SELECT
  USING (org_matches(organization_id));

-- =====================================================
-- GRANTS
-- =====================================================

GRANT SELECT ON payment_gateways TO authenticated;
GRANT SELECT, INSERT ON payment_transactions TO authenticated;
GRANT SELECT ON payment_refunds TO authenticated;
GRANT SELECT ON payment_webhook_events TO authenticated;
