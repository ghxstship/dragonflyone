-- Migration: Payments & Financial System
-- Description: Tables for payments, refunds, payouts, and financial tracking

-- Payment methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  type TEXT NOT NULL CHECK (type IN ('card', 'bank_account', 'paypal', 'apple_pay', 'google_pay')),
  provider TEXT DEFAULT 'stripe',
  provider_id TEXT,
  last_four TEXT,
  brand TEXT,
  exp_month INT,
  exp_year INT,
  bank_name TEXT,
  account_type TEXT,
  is_default BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  billing_address JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_default ON payment_methods(user_id, is_default);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  order_id UUID REFERENCES orders(id),
  user_id UUID REFERENCES platform_users(id),
  payment_method_id UUID REFERENCES payment_methods(id),
  amount NUMERIC(15,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded', 'partially_refunded')),
  payment_type TEXT DEFAULT 'purchase' CHECK (payment_type IN ('purchase', 'subscription', 'payout', 'refund', 'transfer', 'fee')),
  provider TEXT DEFAULT 'stripe',
  provider_payment_id TEXT,
  provider_charge_id TEXT,
  provider_transfer_id TEXT,
  description TEXT,
  statement_descriptor TEXT,
  receipt_url TEXT,
  receipt_number TEXT,
  failure_code TEXT,
  failure_message TEXT,
  refunded_amount NUMERIC(15,2) DEFAULT 0,
  fee_amount NUMERIC(10,2) DEFAULT 0,
  net_amount NUMERIC(15,2),
  metadata JSONB,
  ip_address TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_org ON payments(organization_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_provider ON payments(provider_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_created ON payments(created_at);

-- Refunds table
CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id),
  order_id UUID REFERENCES orders(id),
  amount NUMERIC(15,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled')),
  reason TEXT CHECK (reason IN ('duplicate', 'fraudulent', 'requested_by_customer', 'event_cancelled', 'event_postponed', 'other')),
  reason_details TEXT,
  provider_refund_id TEXT,
  refund_type TEXT DEFAULT 'full' CHECK (refund_type IN ('full', 'partial')),
  initiated_by UUID REFERENCES platform_users(id),
  approved_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  failure_reason TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refunds_payment ON refunds(payment_id);
CREATE INDEX IF NOT EXISTS idx_refunds_order ON refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);

-- Payouts table (for organizers/sellers)
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID REFERENCES platform_users(id),
  amount NUMERIC(15,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'in_transit', 'paid', 'failed', 'cancelled')),
  payout_type TEXT DEFAULT 'standard' CHECK (payout_type IN ('standard', 'instant', 'manual')),
  provider TEXT DEFAULT 'stripe',
  provider_payout_id TEXT,
  provider_transfer_id TEXT,
  destination_type TEXT CHECK (destination_type IN ('bank_account', 'card', 'paypal')),
  destination_id TEXT,
  destination_last_four TEXT,
  description TEXT,
  statement_descriptor TEXT,
  fee_amount NUMERIC(10,2) DEFAULT 0,
  net_amount NUMERIC(15,2),
  arrival_date DATE,
  failure_code TEXT,
  failure_message TEXT,
  metadata JSONB,
  initiated_by UUID REFERENCES platform_users(id),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payouts_org ON payouts(organization_id);
CREATE INDEX IF NOT EXISTS idx_payouts_user ON payouts(user_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_created ON payouts(created_at);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  customer_id UUID REFERENCES platform_users(id),
  contact_id UUID REFERENCES contacts(id),
  invoice_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'paid', 'partial', 'overdue', 'cancelled', 'void')),
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  paid_date DATE,
  subtotal NUMERIC(15,2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5,4) DEFAULT 0,
  tax_amount NUMERIC(15,2) DEFAULT 0,
  discount_amount NUMERIC(15,2) DEFAULT 0,
  total_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  amount_paid NUMERIC(15,2) DEFAULT 0,
  amount_due NUMERIC(15,2) GENERATED ALWAYS AS (total_amount - amount_paid) STORED,
  currency TEXT DEFAULT 'USD',
  payment_terms TEXT,
  notes TEXT,
  footer TEXT,
  billing_address JSONB,
  line_items JSONB NOT NULL DEFAULT '[]',
  pdf_url TEXT,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  reminder_sent_at TIMESTAMPTZ,
  metadata JSONB,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, invoice_number)
);

CREATE INDEX IF NOT EXISTS idx_invoices_org ON invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due ON invoices(due_date);

-- Financial transactions ledger
CREATE TABLE IF NOT EXISTS financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('sale', 'refund', 'payout', 'fee', 'adjustment', 'transfer', 'chargeback', 'dispute')),
  reference_type TEXT,
  reference_id UUID,
  payment_id UUID REFERENCES payments(id),
  order_id UUID REFERENCES orders(id),
  amount NUMERIC(15,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  balance_before NUMERIC(15,2),
  balance_after NUMERIC(15,2),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_financial_transactions_org ON financial_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_type ON financial_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_payment ON financial_transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_created ON financial_transactions(created_at);

-- Organization balances
CREATE TABLE IF NOT EXISTS organization_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) UNIQUE,
  available_balance NUMERIC(15,2) DEFAULT 0,
  pending_balance NUMERIC(15,2) DEFAULT 0,
  reserved_balance NUMERIC(15,2) DEFAULT 0,
  total_sales NUMERIC(15,2) DEFAULT 0,
  total_refunds NUMERIC(15,2) DEFAULT 0,
  total_fees NUMERIC(15,2) DEFAULT 0,
  total_payouts NUMERIC(15,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  last_payout_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organization_balances_org ON organization_balances(organization_id);

-- Stripe connect accounts
CREATE TABLE IF NOT EXISTS stripe_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) UNIQUE,
  user_id UUID REFERENCES platform_users(id),
  stripe_account_id TEXT NOT NULL UNIQUE,
  account_type TEXT DEFAULT 'express' CHECK (account_type IN ('standard', 'express', 'custom')),
  business_type TEXT,
  charges_enabled BOOLEAN DEFAULT false,
  payouts_enabled BOOLEAN DEFAULT false,
  details_submitted BOOLEAN DEFAULT false,
  requirements JSONB,
  capabilities JSONB,
  country TEXT,
  default_currency TEXT,
  metadata JSONB,
  onboarding_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stripe_accounts_org ON stripe_accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_stripe_accounts_stripe ON stripe_accounts(stripe_account_id);

-- Function to update organization balance
CREATE OR REPLACE FUNCTION update_organization_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update balance based on transaction type
    IF NEW.transaction_type = 'sale' THEN
      UPDATE organization_balances SET
        pending_balance = pending_balance + NEW.amount,
        total_sales = total_sales + NEW.amount,
        updated_at = NOW()
      WHERE organization_id = NEW.organization_id;
    ELSIF NEW.transaction_type = 'refund' THEN
      UPDATE organization_balances SET
        available_balance = available_balance - NEW.amount,
        total_refunds = total_refunds + NEW.amount,
        updated_at = NOW()
      WHERE organization_id = NEW.organization_id;
    ELSIF NEW.transaction_type = 'fee' THEN
      UPDATE organization_balances SET
        available_balance = available_balance - NEW.amount,
        total_fees = total_fees + NEW.amount,
        updated_at = NOW()
      WHERE organization_id = NEW.organization_id;
    ELSIF NEW.transaction_type = 'payout' THEN
      UPDATE organization_balances SET
        available_balance = available_balance - NEW.amount,
        total_payouts = total_payouts + NEW.amount,
        last_payout_at = NOW(),
        updated_at = NOW()
      WHERE organization_id = NEW.organization_id;
    END IF;
    
    -- Create balance record if not exists
    INSERT INTO organization_balances (organization_id)
    VALUES (NEW.organization_id)
    ON CONFLICT (organization_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS financial_transaction_balance_trigger ON financial_transactions;
CREATE TRIGGER financial_transaction_balance_trigger
  AFTER INSERT ON financial_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_organization_balance();

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number(org_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_sequence INT;
  v_number TEXT;
BEGIN
  SELECT COALESCE(MAX(
    CASE WHEN invoice_number ~ '^INV-[0-9]+$'
    THEN CAST(SUBSTRING(invoice_number FROM 5) AS INT) ELSE 0 END
  ), 0) + 1 INTO v_sequence
  FROM invoices WHERE organization_id = org_id;
  
  v_number := 'INV-' || LPAD(v_sequence::TEXT, 6, '0');
  
  RETURN v_number;
END;
$$;

-- RLS policies
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_accounts ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON payment_methods TO authenticated;
GRANT SELECT, INSERT, UPDATE ON payments TO authenticated;
GRANT SELECT, INSERT, UPDATE ON refunds TO authenticated;
GRANT SELECT, INSERT, UPDATE ON payouts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON invoices TO authenticated;
GRANT SELECT, INSERT ON financial_transactions TO authenticated;
GRANT SELECT ON organization_balances TO authenticated;
GRANT SELECT, INSERT, UPDATE ON stripe_accounts TO authenticated;
GRANT EXECUTE ON FUNCTION generate_invoice_number(UUID) TO authenticated;
