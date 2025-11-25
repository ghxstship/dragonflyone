-- Migration: Extended Finance Tables
-- Description: Tables for bank reconciliation, payment processing, deferred revenue, and job costing

-- Bank accounts table
CREATE TABLE IF NOT EXISTS bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  routing_number VARCHAR(20),
  bank_name VARCHAR(200) NOT NULL,
  account_type VARCHAR(30) NOT NULL CHECK (account_type IN ('checking', 'savings', 'money_market', 'credit_line')),
  currency VARCHAR(3) DEFAULT 'USD',
  opening_balance DECIMAL(14, 2) DEFAULT 0,
  current_balance DECIMAL(14, 2) DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  last_reconciled_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bank transactions table
CREATE TABLE IF NOT EXISTS bank_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_account_id UUID NOT NULL REFERENCES bank_accounts(id),
  transaction_date TIMESTAMPTZ NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'transfer', 'fee', 'interest', 'adjustment')),
  description TEXT NOT NULL,
  reference_number VARCHAR(100),
  payee VARCHAR(200),
  category VARCHAR(100),
  reconciled BOOLEAN DEFAULT FALSE,
  reconciled_at TIMESTAMPTZ,
  matched_ledger_entry_id UUID,
  imported_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bank reconciliations table
CREATE TABLE IF NOT EXISTS bank_reconciliations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_account_id UUID NOT NULL REFERENCES bank_accounts(id),
  statement_date TIMESTAMPTZ NOT NULL,
  statement_ending_balance DECIMAL(14, 2) NOT NULL,
  book_balance DECIMAL(14, 2) NOT NULL,
  difference DECIMAL(12, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'unbalanced' CHECK (status IN ('balanced', 'unbalanced', 'adjusted')),
  reconciled_by UUID REFERENCES platform_users(id),
  reconciled_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_reference VARCHAR(50) NOT NULL UNIQUE,
  payment_type VARCHAR(30) NOT NULL CHECK (payment_type IN ('vendor', 'employee', 'refund', 'transfer')),
  payee_type VARCHAR(30) NOT NULL CHECK (payee_type IN ('vendor', 'employee', 'customer', 'other')),
  payee_id UUID NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_method VARCHAR(30) NOT NULL CHECK (payment_method IN ('ach', 'wire', 'check', 'credit_card', 'debit_card', 'cash')),
  payment_date TIMESTAMPTZ NOT NULL,
  reference_ids UUID[],
  memo TEXT,
  bank_account_id UUID REFERENCES bank_accounts(id),
  batch_id UUID,
  check_number VARCHAR(20),
  check_details JSONB,
  ach_details JSONB,
  wire_details JSONB,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'processing', 'printed', 'completed', 'failed', 'voided', 'cancelled')),
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  void_reason TEXT,
  voided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment batches table
CREATE TABLE IF NOT EXISTS payment_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  payment_method VARCHAR(30) NOT NULL,
  scheduled_date TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deferred revenue table
CREATE TABLE IF NOT EXISTS deferred_revenue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES contacts(id),
  project_id UUID REFERENCES projects(id),
  contract_id UUID REFERENCES contracts(id),
  invoice_id UUID,
  total_amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  recognition_method VARCHAR(30) NOT NULL CHECK (recognition_method IN ('straight_line', 'milestone', 'percentage_completion', 'deliverable')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'fully_recognized', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deferred revenue milestones table
CREATE TABLE IF NOT EXISTS deferred_revenue_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deferred_revenue_id UUID NOT NULL REFERENCES deferred_revenue(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  percentage DECIMAL(5, 2) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  target_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  sequence INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Revenue recognitions table
CREATE TABLE IF NOT EXISTS revenue_recognitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deferred_revenue_id UUID NOT NULL REFERENCES deferred_revenue(id),
  amount DECIMAL(12, 2) NOT NULL,
  recognition_date TIMESTAMPTZ NOT NULL,
  milestone_id UUID REFERENCES deferred_revenue_milestones(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cost codes table
CREATE TABLE IF NOT EXISTS cost_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(30) NOT NULL CHECK (category IN ('labor', 'material', 'equipment', 'subcontractor', 'overhead', 'other')),
  description TEXT,
  default_rate DECIMAL(10, 2),
  is_billable BOOLEAN DEFAULT TRUE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job costs table
CREATE TABLE IF NOT EXISTS job_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  cost_type VARCHAR(30) NOT NULL CHECK (cost_type IN ('labor', 'material', 'equipment', 'subcontractor', 'overhead', 'other')),
  cost_code VARCHAR(50),
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2),
  unit_cost DECIMAL(10, 2),
  total_cost DECIMAL(12, 2) NOT NULL,
  billable BOOLEAN DEFAULT TRUE,
  billing_rate DECIMAL(10, 2),
  employee_id UUID REFERENCES platform_users(id),
  vendor_id UUID REFERENCES vendors(id),
  expense_id UUID,
  timesheet_id UUID,
  cost_date TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add matched_bank_transaction_id to ledger_entries if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ledger_entries' AND column_name = 'matched_bank_transaction_id') THEN
    ALTER TABLE ledger_entries ADD COLUMN matched_bank_transaction_id UUID;
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bank_accounts_status ON bank_accounts(status);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_account ON bank_transactions(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_date ON bank_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_reconciled ON bank_transactions(reconciled);
CREATE INDEX IF NOT EXISTS idx_bank_reconciliations_account ON bank_reconciliations(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_payments_payee ON payments(payee_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_batch ON payments(batch_id);
CREATE INDEX IF NOT EXISTS idx_deferred_revenue_client ON deferred_revenue(client_id);
CREATE INDEX IF NOT EXISTS idx_deferred_revenue_project ON deferred_revenue(project_id);
CREATE INDEX IF NOT EXISTS idx_deferred_revenue_status ON deferred_revenue(status);
CREATE INDEX IF NOT EXISTS idx_revenue_recognitions_deferred ON revenue_recognitions(deferred_revenue_id);
CREATE INDEX IF NOT EXISTS idx_revenue_recognitions_date ON revenue_recognitions(recognition_date);
CREATE INDEX IF NOT EXISTS idx_job_costs_project ON job_costs(project_id);
CREATE INDEX IF NOT EXISTS idx_job_costs_type ON job_costs(cost_type);
CREATE INDEX IF NOT EXISTS idx_job_costs_date ON job_costs(cost_date);

-- RLS Policies
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_reconciliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE deferred_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE deferred_revenue_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_recognitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_costs ENABLE ROW LEVEL SECURITY;

-- View policies for authenticated users
CREATE POLICY bank_accounts_view ON bank_accounts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY bank_transactions_view ON bank_transactions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY bank_reconciliations_view ON bank_reconciliations FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY payments_view ON payments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY payment_batches_view ON payment_batches FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY deferred_revenue_view ON deferred_revenue FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY deferred_revenue_milestones_view ON deferred_revenue_milestones FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY revenue_recognitions_view ON revenue_recognitions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY cost_codes_view ON cost_codes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY job_costs_view ON job_costs FOR SELECT USING (auth.uid() IS NOT NULL);

-- Admin manage policies
CREATE POLICY bank_accounts_manage ON bank_accounts FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND 'ATLVS_ADMIN' = ANY(platform_roles))
);

CREATE POLICY payments_manage ON payments FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND ('ATLVS_TEAM_MEMBER' = ANY(platform_roles) OR 'ATLVS_ADMIN' = ANY(platform_roles)))
);

CREATE POLICY deferred_revenue_manage ON deferred_revenue FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND ('ATLVS_TEAM_MEMBER' = ANY(platform_roles) OR 'ATLVS_ADMIN' = ANY(platform_roles)))
);

CREATE POLICY job_costs_manage ON job_costs FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND ('ATLVS_TEAM_MEMBER' = ANY(platform_roles) OR 'ATLVS_ADMIN' = ANY(platform_roles)))
);

-- Function to update bank balance
CREATE OR REPLACE FUNCTION update_bank_balance(p_account_id UUID, p_amount DECIMAL)
RETURNS VOID AS $$
BEGIN
  UPDATE bank_accounts
  SET current_balance = current_balance + p_amount,
      updated_at = NOW()
  WHERE id = p_account_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get project profitability
CREATE OR REPLACE FUNCTION get_project_profitability(p_project_id UUID)
RETURNS TABLE (
  total_cost DECIMAL,
  billable_cost DECIMAL,
  revenue DECIMAL,
  gross_profit DECIMAL,
  gross_margin DECIMAL
) AS $$
DECLARE
  v_total_cost DECIMAL;
  v_billable_cost DECIMAL;
  v_revenue DECIMAL;
BEGIN
  SELECT 
    COALESCE(SUM(jc.total_cost), 0),
    COALESCE(SUM(jc.total_cost) FILTER (WHERE jc.billable), 0)
  INTO v_total_cost, v_billable_cost
  FROM job_costs jc
  WHERE jc.project_id = p_project_id;

  SELECT COALESCE(p.revenue, 0) INTO v_revenue
  FROM projects p
  WHERE p.id = p_project_id;

  RETURN QUERY SELECT 
    v_total_cost,
    v_billable_cost,
    v_revenue,
    v_revenue - v_total_cost,
    CASE WHEN v_revenue > 0 THEN ((v_revenue - v_total_cost) / v_revenue) * 100 ELSE 0 END;
END;
$$ LANGUAGE plpgsql;
