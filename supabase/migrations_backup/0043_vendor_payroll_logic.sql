-- Migration: Vendor & Payroll Business Logic Functions
-- Description: RPC functions for vendor management and payroll processing

-- Generate vendor code function
CREATE OR REPLACE FUNCTION generate_vendor_code(org_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  prefix TEXT;
  sequence_num INT;
BEGIN
  SELECT COALESCE(settings->>'vendor_prefix', 'VND') INTO prefix FROM organizations WHERE id = org_id;
  IF prefix IS NULL THEN prefix := 'VND'; END IF;
  
  SELECT COALESCE(MAX(
    CASE WHEN vendor_code ~ ('^' || prefix || '-[0-9]+$')
    THEN CAST(SUBSTRING(vendor_code FROM '[0-9]+$') AS INT) ELSE 0 END
  ), 0) + 1 INTO sequence_num
  FROM vendors WHERE organization_id = org_id AND vendor_code LIKE prefix || '-%';
  
  RETURN prefix || '-' || LPAD(sequence_num::TEXT, 5, '0');
END;
$$;

-- Generate payroll run number function
CREATE OR REPLACE FUNCTION generate_payroll_run_number(org_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  prefix TEXT;
  year_suffix TEXT;
  sequence_num INT;
BEGIN
  SELECT COALESCE(settings->>'payroll_prefix', 'PR') INTO prefix FROM organizations WHERE id = org_id;
  IF prefix IS NULL THEN prefix := 'PR'; END IF;
  year_suffix := TO_CHAR(CURRENT_DATE, 'YY');
  
  SELECT COALESCE(MAX(
    CASE WHEN run_number ~ ('^' || prefix || year_suffix || '-[0-9]+$')
    THEN CAST(SUBSTRING(run_number FROM '[0-9]+$') AS INT) ELSE 0 END
  ), 0) + 1 INTO sequence_num
  FROM payroll_runs WHERE organization_id = org_id AND run_number LIKE prefix || year_suffix || '-%';
  
  RETURN prefix || year_suffix || '-' || LPAD(sequence_num::TEXT, 4, '0');
END;
$$;

-- Vendor activity log table
CREATE TABLE IF NOT EXISTS vendor_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  user_id UUID REFERENCES platform_users(id),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_activity_log_vendor_id ON vendor_activity_log(vendor_id);

-- Payroll runs table
CREATE TABLE IF NOT EXISTS payroll_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_number TEXT NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  pay_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'processing', 'completed', 'cancelled')),
  total_gross NUMERIC(15,2) DEFAULT 0,
  total_net NUMERIC(15,2) DEFAULT 0,
  total_taxes NUMERIC(15,2) DEFAULT 0,
  employee_count INT DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES platform_users(id),
  submitted_by UUID REFERENCES platform_users(id),
  submitted_at TIMESTAMPTZ,
  approved_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES platform_users(id),
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payroll_runs_org ON payroll_runs(organization_id);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_status ON payroll_runs(status);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_pay_date ON payroll_runs(pay_date);

-- Payroll items table
CREATE TABLE IF NOT EXISTS payroll_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_id UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id),
  regular_hours NUMERIC(10,2) DEFAULT 0,
  overtime_hours NUMERIC(10,2) DEFAULT 0,
  regular_pay NUMERIC(15,2) DEFAULT 0,
  overtime_pay NUMERIC(15,2) DEFAULT 0,
  bonus NUMERIC(15,2) DEFAULT 0,
  commission NUMERIC(15,2) DEFAULT 0,
  gross_pay NUMERIC(15,2) DEFAULT 0,
  federal_tax NUMERIC(15,2) DEFAULT 0,
  state_tax NUMERIC(15,2) DEFAULT 0,
  local_tax NUMERIC(15,2) DEFAULT 0,
  social_security NUMERIC(15,2) DEFAULT 0,
  medicare NUMERIC(15,2) DEFAULT 0,
  health_insurance NUMERIC(15,2) DEFAULT 0,
  retirement_401k NUMERIC(15,2) DEFAULT 0,
  other_deductions NUMERIC(15,2) DEFAULT 0,
  total_deductions NUMERIC(15,2) DEFAULT 0,
  net_pay NUMERIC(15,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'voided')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payroll_items_run ON payroll_items(payroll_run_id);
CREATE INDEX IF NOT EXISTS idx_payroll_items_employee ON payroll_items(employee_id);

-- Payroll activity log table
CREATE TABLE IF NOT EXISTS payroll_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_id UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  user_id UUID REFERENCES platform_users(id),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payroll_activity_log_run ON payroll_activity_log(payroll_run_id);

-- Invoice activity log table
CREATE TABLE IF NOT EXISTS invoice_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  user_id UUID REFERENCES platform_users(id),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_activity_log_invoice ON invoice_activity_log(invoice_id);

-- RLS policies
ALTER TABLE vendor_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_activity_log ENABLE ROW LEVEL SECURITY;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION generate_vendor_code(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_payroll_run_number(UUID) TO authenticated;
