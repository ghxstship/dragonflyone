-- Migration: 0054_v3_invoices.sql
-- Description: DG-004 Invoice & Payment Generation System
-- Created: 2024-01-18

-- =====================================================
-- ENUMS
-- =====================================================

DO $$ BEGIN
  CREATE TYPE invoice_status AS ENUM (
    'draft',
    'sent',
    'viewed',
    'partially_paid',
    'paid',
    'overdue',
    'void'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM (
    'pending',
    'processing',
    'succeeded',
    'failed',
    'refunded',
    'partially_refunded'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_method_type AS ENUM (
    'credit_card',
    'debit_card',
    'ach',
    'check',
    'cash',
    'wire',
    'apple_pay',
    'google_pay',
    'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- TABLES
-- =====================================================

-- Tax Rates
CREATE TABLE IF NOT EXISTS tax_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rate DECIMAL(5,4) NOT NULL CHECK (rate >= 0 AND rate <= 1),
  description TEXT,
  applies_to JSONB DEFAULT '[]'::jsonb,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  status invoice_status DEFAULT 'draft',
  
  -- Line items stored as JSONB
  line_items JSONB DEFAULT '[]'::jsonb,
  
  -- Financial
  subtotal DECIMAL(12,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(12,2) DEFAULT 0,
  tax_rate_id UUID REFERENCES tax_rates(id),
  tax_rate DECIMAL(5,4) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) DEFAULT 0,
  
  -- Payment tracking
  paid_amount DECIMAL(12,2) DEFAULT 0,
  balance_due DECIMAL(12,2) GENERATED ALWAYS AS (total - paid_amount) STORED,
  
  -- Terms
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  payment_terms TEXT DEFAULT 'net_30',
  notes TEXT,
  terms_and_conditions TEXT,
  
  -- Payment schedule (milestones)
  payment_schedule JSONB DEFAULT '[]'::jsonb,
  
  -- External integrations
  stripe_invoice_id TEXT,
  quickbooks_invoice_id TEXT,
  
  -- Metadata
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  voided_at TIMESTAMPTZ,
  void_reason TEXT,
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_invoice_number UNIQUE (organization_id, invoice_number)
);

-- Invoice Payments
CREATE TABLE IF NOT EXISTS invoice_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  payment_method payment_method_type NOT NULL,
  reference_number TEXT,
  
  -- Stripe integration
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  
  status payment_status DEFAULT 'pending',
  
  -- Refund tracking
  refunded_amount DECIMAL(12,2) DEFAULT 0,
  refund_ids JSONB DEFAULT '[]'::jsonb,
  
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  processed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Methods (stored for customers)
CREATE TABLE IF NOT EXISTS stored_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  
  type payment_method_type NOT NULL,
  last_four TEXT,
  brand TEXT,
  exp_month INTEGER,
  exp_year INTEGER,
  
  stripe_payment_method_id TEXT,
  is_default BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice Templates
CREATE TABLE IF NOT EXISTS invoice_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Template content
  line_items JSONB DEFAULT '[]'::jsonb,
  payment_terms TEXT DEFAULT 'net_30',
  notes TEXT,
  terms_and_conditions TEXT,
  
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  year_prefix TEXT;
  sequence_num INTEGER;
  new_number TEXT;
BEGIN
  year_prefix := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(invoice_number FROM 'INV-\d{4}-(\d+)') AS INTEGER)
  ), 0) + 1
  INTO sequence_num
  FROM invoices
  WHERE organization_id = NEW.organization_id
    AND invoice_number LIKE 'INV-' || year_prefix || '-%';
  
  new_number := 'INV-' || year_prefix || '-' || LPAD(sequence_num::TEXT, 5, '0');
  NEW.invoice_number := new_number;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_invoice_number ON invoices;
CREATE TRIGGER trigger_generate_invoice_number
  BEFORE INSERT ON invoices
  FOR EACH ROW
  WHEN (NEW.invoice_number IS NULL OR NEW.invoice_number = '')
  EXECUTE FUNCTION generate_invoice_number();

-- Update invoice paid amount when payment is added
CREATE OR REPLACE FUNCTION update_invoice_paid_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'succeeded' THEN
    UPDATE invoices
    SET paid_amount = paid_amount + NEW.amount,
        status = CASE 
          WHEN paid_amount + NEW.amount >= total THEN 'paid'::invoice_status
          WHEN paid_amount + NEW.amount > 0 THEN 'partially_paid'::invoice_status
          ELSE status
        END,
        paid_at = CASE 
          WHEN paid_amount + NEW.amount >= total THEN NOW()
          ELSE paid_at
        END,
        updated_at = NOW()
    WHERE id = NEW.invoice_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_invoice_paid_amount ON invoice_payments;
CREATE TRIGGER trigger_update_invoice_paid_amount
  AFTER INSERT ON invoice_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_paid_amount();

-- Check overdue invoices (to be called by cron)
CREATE OR REPLACE FUNCTION check_overdue_invoices()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE invoices
  SET status = 'overdue'::invoice_status,
      updated_at = NOW()
  WHERE status IN ('sent', 'viewed', 'partially_paid')
    AND due_date < CURRENT_DATE;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ADD MISSING COLUMNS TO EXISTING TABLES
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'organization_id') THEN
    ALTER TABLE invoices ADD COLUMN organization_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'booking_id') THEN
    ALTER TABLE invoices ADD COLUMN booking_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'contact_id') THEN
    ALTER TABLE invoices ADD COLUMN contact_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'status') THEN
    ALTER TABLE invoices ADD COLUMN status TEXT DEFAULT 'draft';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'due_date') THEN
    ALTER TABLE invoices ADD COLUMN due_date DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'invoice_number') THEN
    ALTER TABLE invoices ADD COLUMN invoice_number TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoice_payments' AND column_name = 'invoice_id') THEN
    ALTER TABLE invoice_payments ADD COLUMN invoice_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoice_payments' AND column_name = 'organization_id') THEN
    ALTER TABLE invoice_payments ADD COLUMN organization_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoice_payments' AND column_name = 'status') THEN
    ALTER TABLE invoice_payments ADD COLUMN status TEXT DEFAULT 'pending';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tax_rates' AND column_name = 'organization_id') THEN
    ALTER TABLE tax_rates ADD COLUMN organization_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stored_payment_methods' AND column_name = 'contact_id') THEN
    ALTER TABLE stored_payment_methods ADD COLUMN contact_id UUID;
  END IF;
END $$;

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_invoices_organization ON invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoices_booking ON invoices(booking_id);
CREATE INDEX IF NOT EXISTS idx_invoices_contact ON invoices(contact_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);

CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice ON invoice_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_organization ON invoice_payments(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_status ON invoice_payments(status);

CREATE INDEX IF NOT EXISTS idx_tax_rates_organization ON tax_rates(organization_id);
CREATE INDEX IF NOT EXISTS idx_stored_payment_methods_contact ON stored_payment_methods(contact_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE stored_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_templates ENABLE ROW LEVEL SECURITY;

-- Invoices policies
DROP POLICY IF EXISTS "Users can view invoices in their organization" ON invoices;
CREATE POLICY "Users can view invoices in their organization"
  ON invoices FOR SELECT
  USING (org_matches(organization_id));

DROP POLICY IF EXISTS "Users can create invoices in their organization" ON invoices;
CREATE POLICY "Users can create invoices in their organization"
  ON invoices FOR INSERT
  WITH CHECK (org_matches(organization_id));

DROP POLICY IF EXISTS "Users can update invoices in their organization" ON invoices;
CREATE POLICY "Users can update invoices in their organization"
  ON invoices FOR UPDATE
  USING (org_matches(organization_id));

DROP POLICY IF EXISTS "Users can delete draft invoices in their organization" ON invoices;
CREATE POLICY "Users can delete draft invoices in their organization"
  ON invoices FOR DELETE
  USING (org_matches(organization_id) AND status = 'draft');

-- Invoice payments policies
DROP POLICY IF EXISTS "Users can view payments in their organization" ON invoice_payments;
CREATE POLICY "Users can view payments in their organization"
  ON invoice_payments FOR SELECT
  USING (org_matches(organization_id));

DROP POLICY IF EXISTS "Users can create payments in their organization" ON invoice_payments;
CREATE POLICY "Users can create payments in their organization"
  ON invoice_payments FOR INSERT
  WITH CHECK (org_matches(organization_id));

-- Tax rates policies
DROP POLICY IF EXISTS "Users can view tax rates in their organization" ON tax_rates;
CREATE POLICY "Users can view tax rates in their organization"
  ON tax_rates FOR SELECT
  USING (org_matches(organization_id));

DROP POLICY IF EXISTS "Users can manage tax rates in their organization" ON tax_rates;
CREATE POLICY "Users can manage tax rates in their organization"
  ON tax_rates FOR ALL
  USING (org_matches(organization_id));

-- Stored payment methods policies
DROP POLICY IF EXISTS "Users can view payment methods in their organization" ON stored_payment_methods;
CREATE POLICY "Users can view payment methods in their organization"
  ON stored_payment_methods FOR SELECT
  USING (org_matches(organization_id));

DROP POLICY IF EXISTS "Users can manage payment methods in their organization" ON stored_payment_methods;
CREATE POLICY "Users can manage payment methods in their organization"
  ON stored_payment_methods FOR ALL
  USING (org_matches(organization_id));

-- Invoice templates policies
DROP POLICY IF EXISTS "Users can view templates in their organization" ON invoice_templates;
CREATE POLICY "Users can view templates in their organization"
  ON invoice_templates FOR SELECT
  USING (org_matches(organization_id));

DROP POLICY IF EXISTS "Users can manage templates in their organization" ON invoice_templates;
CREATE POLICY "Users can manage templates in their organization"
  ON invoice_templates FOR ALL
  USING (org_matches(organization_id));

-- =====================================================
-- GRANTS
-- =====================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON invoices TO authenticated;
GRANT SELECT, INSERT ON invoice_payments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tax_rates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON stored_payment_methods TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON invoice_templates TO authenticated;
