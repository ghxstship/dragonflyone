-- Migration: Payroll System
-- Description: Tables for payroll runs, items, deductions, and tax calculations

-- Payroll runs table
CREATE TABLE IF NOT EXISTS payroll_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  run_number TEXT NOT NULL,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  pay_date DATE NOT NULL,
  payroll_type TEXT NOT NULL CHECK (payroll_type IN ('regular', 'bonus', 'commission', 'adjustment', 'final')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'processing', 'completed', 'cancelled')),
  total_employees INT DEFAULT 0,
  total_hours NUMERIC(10,2) DEFAULT 0,
  total_gross NUMERIC(15,2) DEFAULT 0,
  total_deductions NUMERIC(15,2) DEFAULT 0,
  total_taxes NUMERIC(15,2) DEFAULT 0,
  total_net NUMERIC(15,2) DEFAULT 0,
  employer_taxes NUMERIC(15,2) DEFAULT 0,
  employer_benefits NUMERIC(15,2) DEFAULT 0,
  total_cost NUMERIC(15,2) DEFAULT 0,
  notes TEXT,
  submitted_at TIMESTAMPTZ,
  submitted_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES platform_users(id),
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES platform_users(id),
  cancellation_reason TEXT,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, run_number)
);

CREATE INDEX IF NOT EXISTS idx_payroll_runs_org ON payroll_runs(organization_id);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_status ON payroll_runs(status);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_pay_date ON payroll_runs(pay_date);

-- Payroll items table
CREATE TABLE IF NOT EXISTS payroll_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_id UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id),
  pay_type TEXT NOT NULL CHECK (pay_type IN ('salary', 'hourly', 'commission', 'bonus', 'overtime', 'adjustment')),
  regular_hours NUMERIC(10,2) DEFAULT 0,
  overtime_hours NUMERIC(10,2) DEFAULT 0,
  pto_hours NUMERIC(10,2) DEFAULT 0,
  sick_hours NUMERIC(10,2) DEFAULT 0,
  holiday_hours NUMERIC(10,2) DEFAULT 0,
  total_hours NUMERIC(10,2) DEFAULT 0,
  hourly_rate NUMERIC(10,2),
  gross_pay NUMERIC(15,2) NOT NULL,
  federal_tax NUMERIC(15,2) DEFAULT 0,
  state_tax NUMERIC(15,2) DEFAULT 0,
  local_tax NUMERIC(15,2) DEFAULT 0,
  social_security NUMERIC(15,2) DEFAULT 0,
  medicare NUMERIC(15,2) DEFAULT 0,
  total_taxes NUMERIC(15,2) DEFAULT 0,
  health_insurance NUMERIC(15,2) DEFAULT 0,
  dental_insurance NUMERIC(15,2) DEFAULT 0,
  vision_insurance NUMERIC(15,2) DEFAULT 0,
  retirement_401k NUMERIC(15,2) DEFAULT 0,
  hsa_contribution NUMERIC(15,2) DEFAULT 0,
  other_deductions NUMERIC(15,2) DEFAULT 0,
  total_deductions NUMERIC(15,2) DEFAULT 0,
  net_pay NUMERIC(15,2) NOT NULL,
  employer_ss NUMERIC(15,2) DEFAULT 0,
  employer_medicare NUMERIC(15,2) DEFAULT 0,
  employer_futa NUMERIC(15,2) DEFAULT 0,
  employer_suta NUMERIC(15,2) DEFAULT 0,
  employer_health NUMERIC(15,2) DEFAULT 0,
  employer_retirement NUMERIC(15,2) DEFAULT 0,
  total_employer_cost NUMERIC(15,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'voided')),
  paid_at TIMESTAMPTZ,
  payment_method TEXT,
  check_number TEXT,
  direct_deposit_ref TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payroll_items_run ON payroll_items(payroll_run_id);
CREATE INDEX IF NOT EXISTS idx_payroll_items_employee ON payroll_items(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_items_status ON payroll_items(status);

-- Payroll deduction types table
CREATE TABLE IF NOT EXISTS payroll_deduction_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('tax', 'insurance', 'retirement', 'garnishment', 'voluntary', 'other')),
  calculation_type TEXT NOT NULL CHECK (calculation_type IN ('fixed', 'percentage', 'formula')),
  default_amount NUMERIC(15,2),
  default_percentage NUMERIC(5,2),
  formula TEXT,
  is_pretax BOOLEAN DEFAULT false,
  is_employer_match BOOLEAN DEFAULT false,
  employer_match_percentage NUMERIC(5,2),
  employer_match_limit NUMERIC(15,2),
  annual_limit NUMERIC(15,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, code)
);

CREATE INDEX IF NOT EXISTS idx_payroll_deduction_types_org ON payroll_deduction_types(organization_id);

-- Employee deductions table
CREATE TABLE IF NOT EXISTS employee_deductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  deduction_type_id UUID NOT NULL REFERENCES payroll_deduction_types(id),
  amount NUMERIC(15,2),
  percentage NUMERIC(5,2),
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employee_deductions_employee ON employee_deductions(employee_id);

-- Tax brackets table
CREATE TABLE IF NOT EXISTS tax_brackets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tax_type TEXT NOT NULL CHECK (tax_type IN ('federal', 'state', 'local', 'social_security', 'medicare')),
  jurisdiction TEXT,
  filing_status TEXT CHECK (filing_status IN ('single', 'married_filing_jointly', 'married_filing_separately', 'head_of_household')),
  min_income NUMERIC(15,2) NOT NULL,
  max_income NUMERIC(15,2),
  rate NUMERIC(5,4) NOT NULL,
  base_tax NUMERIC(15,2) DEFAULT 0,
  effective_date DATE NOT NULL,
  expiration_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tax_brackets_type ON tax_brackets(tax_type);
CREATE INDEX IF NOT EXISTS idx_tax_brackets_jurisdiction ON tax_brackets(jurisdiction);

-- Payroll activity log table
CREATE TABLE IF NOT EXISTS payroll_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_id UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('created', 'updated', 'submitted', 'approved', 'rejected', 'processed', 'cancelled', 'voided')),
  user_id UUID REFERENCES platform_users(id),
  description TEXT,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payroll_activity_log_run ON payroll_activity_log(payroll_run_id);

-- Generate payroll run number function
CREATE OR REPLACE FUNCTION generate_payroll_run_number(org_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  year_suffix TEXT;
  sequence_num INT;
BEGIN
  year_suffix := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  SELECT COALESCE(MAX(
    CASE WHEN run_number ~ ('^PR-' || year_suffix || '-[0-9]+$')
    THEN CAST(SUBSTRING(run_number FROM '[0-9]+$') AS INT) ELSE 0 END
  ), 0) + 1 INTO sequence_num
  FROM payroll_runs WHERE organization_id = org_id AND run_number LIKE 'PR-' || year_suffix || '-%';
  
  RETURN 'PR-' || year_suffix || '-' || LPAD(sequence_num::TEXT, 4, '0');
END;
$$;

-- Calculate payroll totals function
CREATE OR REPLACE FUNCTION calculate_payroll_totals(p_payroll_run_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE payroll_runs SET
    total_employees = (SELECT COUNT(DISTINCT employee_id) FROM payroll_items WHERE payroll_run_id = p_payroll_run_id),
    total_hours = (SELECT COALESCE(SUM(total_hours), 0) FROM payroll_items WHERE payroll_run_id = p_payroll_run_id),
    total_gross = (SELECT COALESCE(SUM(gross_pay), 0) FROM payroll_items WHERE payroll_run_id = p_payroll_run_id),
    total_deductions = (SELECT COALESCE(SUM(total_deductions), 0) FROM payroll_items WHERE payroll_run_id = p_payroll_run_id),
    total_taxes = (SELECT COALESCE(SUM(total_taxes), 0) FROM payroll_items WHERE payroll_run_id = p_payroll_run_id),
    total_net = (SELECT COALESCE(SUM(net_pay), 0) FROM payroll_items WHERE payroll_run_id = p_payroll_run_id),
    employer_taxes = (SELECT COALESCE(SUM(employer_ss + employer_medicare + employer_futa + employer_suta), 0) FROM payroll_items WHERE payroll_run_id = p_payroll_run_id),
    employer_benefits = (SELECT COALESCE(SUM(employer_health + employer_retirement), 0) FROM payroll_items WHERE payroll_run_id = p_payroll_run_id),
    total_cost = (SELECT COALESCE(SUM(gross_pay + total_employer_cost), 0) FROM payroll_items WHERE payroll_run_id = p_payroll_run_id),
    updated_at = NOW()
  WHERE id = p_payroll_run_id;
END;
$$;

-- Trigger to update payroll totals
CREATE OR REPLACE FUNCTION update_payroll_totals_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM calculate_payroll_totals(NEW.payroll_run_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM calculate_payroll_totals(OLD.payroll_run_id);
    RETURN OLD;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS payroll_items_totals_trigger ON payroll_items;
CREATE TRIGGER payroll_items_totals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON payroll_items
  FOR EACH ROW
  EXECUTE FUNCTION update_payroll_totals_trigger();

-- RLS policies
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_deduction_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_deductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_brackets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_activity_log ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON payroll_runs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON payroll_items TO authenticated;
GRANT SELECT, INSERT, UPDATE ON payroll_deduction_types TO authenticated;
GRANT SELECT, INSERT, UPDATE ON employee_deductions TO authenticated;
GRANT SELECT ON tax_brackets TO authenticated;
GRANT SELECT, INSERT ON payroll_activity_log TO authenticated;
GRANT EXECUTE ON FUNCTION generate_payroll_run_number(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_payroll_totals(UUID) TO authenticated;
