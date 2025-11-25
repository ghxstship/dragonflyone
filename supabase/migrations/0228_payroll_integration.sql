-- Migration: Payroll Integration System
-- Description: Integration with payroll providers and payroll processing

-- Payroll providers configuration
CREATE TABLE IF NOT EXISTS payroll_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider_type VARCHAR(50) NOT NULL CHECK (provider_type IN ('adp', 'gusto', 'paychex', 'quickbooks_payroll', 'rippling', 'zenefits', 'custom')),
  name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  
  -- API configuration
  api_endpoint TEXT,
  api_key_encrypted TEXT,
  api_secret_encrypted TEXT,
  oauth_access_token_encrypted TEXT,
  oauth_refresh_token_encrypted TEXT,
  oauth_expires_at TIMESTAMPTZ,
  
  -- Sync settings
  sync_frequency VARCHAR(50) DEFAULT 'daily' CHECK (sync_frequency IN ('realtime', 'hourly', 'daily', 'weekly', 'manual')),
  last_sync_at TIMESTAMPTZ,
  last_sync_status VARCHAR(50),
  last_sync_error TEXT,
  
  -- Mapping configuration
  department_mapping JSONB DEFAULT '{}',
  job_code_mapping JSONB DEFAULT '{}',
  pay_type_mapping JSONB DEFAULT '{}',
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id)
);

-- Payroll periods
CREATE TABLE IF NOT EXISTS payroll_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES payroll_providers(id) ON DELETE SET NULL,
  period_name VARCHAR(100) NOT NULL,
  period_type VARCHAR(50) NOT NULL CHECK (period_type IN ('weekly', 'biweekly', 'semimonthly', 'monthly')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  pay_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'processing', 'approved', 'paid', 'cancelled')),
  total_gross DECIMAL(12,2) DEFAULT 0,
  total_deductions DECIMAL(12,2) DEFAULT 0,
  total_net DECIMAL(12,2) DEFAULT 0,
  total_employer_taxes DECIMAL(12,2) DEFAULT 0,
  employee_count INTEGER DEFAULT 0,
  approved_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  external_id VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payroll entries (individual employee pay)
CREATE TABLE IF NOT EXISTS payroll_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_period_id UUID NOT NULL REFERENCES payroll_periods(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  
  -- Hours and earnings
  regular_hours DECIMAL(6,2) DEFAULT 0,
  overtime_hours DECIMAL(6,2) DEFAULT 0,
  double_time_hours DECIMAL(6,2) DEFAULT 0,
  pto_hours DECIMAL(6,2) DEFAULT 0,
  sick_hours DECIMAL(6,2) DEFAULT 0,
  holiday_hours DECIMAL(6,2) DEFAULT 0,
  
  -- Pay rates
  regular_rate DECIMAL(10,2),
  overtime_rate DECIMAL(10,2),
  double_time_rate DECIMAL(10,2),
  
  -- Earnings breakdown
  regular_pay DECIMAL(12,2) DEFAULT 0,
  overtime_pay DECIMAL(12,2) DEFAULT 0,
  double_time_pay DECIMAL(12,2) DEFAULT 0,
  pto_pay DECIMAL(12,2) DEFAULT 0,
  sick_pay DECIMAL(12,2) DEFAULT 0,
  holiday_pay DECIMAL(12,2) DEFAULT 0,
  bonus DECIMAL(12,2) DEFAULT 0,
  commission DECIMAL(12,2) DEFAULT 0,
  other_earnings DECIMAL(12,2) DEFAULT 0,
  gross_pay DECIMAL(12,2) DEFAULT 0,
  
  -- Deductions
  federal_tax DECIMAL(12,2) DEFAULT 0,
  state_tax DECIMAL(12,2) DEFAULT 0,
  local_tax DECIMAL(12,2) DEFAULT 0,
  social_security DECIMAL(12,2) DEFAULT 0,
  medicare DECIMAL(12,2) DEFAULT 0,
  health_insurance DECIMAL(12,2) DEFAULT 0,
  dental_insurance DECIMAL(12,2) DEFAULT 0,
  vision_insurance DECIMAL(12,2) DEFAULT 0,
  retirement_401k DECIMAL(12,2) DEFAULT 0,
  hsa_contribution DECIMAL(12,2) DEFAULT 0,
  fsa_contribution DECIMAL(12,2) DEFAULT 0,
  garnishments DECIMAL(12,2) DEFAULT 0,
  other_deductions DECIMAL(12,2) DEFAULT 0,
  total_deductions DECIMAL(12,2) DEFAULT 0,
  
  -- Net pay
  net_pay DECIMAL(12,2) DEFAULT 0,
  
  -- Employer costs
  employer_social_security DECIMAL(12,2) DEFAULT 0,
  employer_medicare DECIMAL(12,2) DEFAULT 0,
  employer_futa DECIMAL(12,2) DEFAULT 0,
  employer_suta DECIMAL(12,2) DEFAULT 0,
  employer_health_contribution DECIMAL(12,2) DEFAULT 0,
  employer_retirement_match DECIMAL(12,2) DEFAULT 0,
  total_employer_cost DECIMAL(12,2) DEFAULT 0,
  
  -- Payment info
  payment_method VARCHAR(50) DEFAULT 'direct_deposit' CHECK (payment_method IN ('direct_deposit', 'check', 'cash', 'paycard')),
  bank_account_last4 VARCHAR(4),
  check_number VARCHAR(50),
  
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processed', 'paid', 'voided')),
  notes TEXT,
  external_id VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payroll adjustments
CREATE TABLE IF NOT EXISTS payroll_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_entry_id UUID NOT NULL REFERENCES payroll_entries(id) ON DELETE CASCADE,
  adjustment_type VARCHAR(50) NOT NULL CHECK (adjustment_type IN ('bonus', 'reimbursement', 'correction', 'deduction', 'garnishment', 'other')),
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  is_taxable BOOLEAN DEFAULT TRUE,
  approved_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id)
);

-- Payroll sync logs
CREATE TABLE IF NOT EXISTS payroll_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES payroll_providers(id) ON DELETE CASCADE,
  sync_type VARCHAR(50) NOT NULL CHECK (sync_type IN ('full', 'incremental', 'employees', 'timesheets', 'payroll')),
  status VARCHAR(50) NOT NULL CHECK (status IN ('started', 'in_progress', 'completed', 'failed')),
  records_processed INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  error_details JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES platform_users(id)
);

-- Employee payroll settings
CREATE TABLE IF NOT EXISTS employee_payroll_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE UNIQUE,
  
  -- Tax withholding
  federal_filing_status VARCHAR(50) DEFAULT 'single',
  federal_allowances INTEGER DEFAULT 0,
  additional_federal_withholding DECIMAL(10,2) DEFAULT 0,
  state_filing_status VARCHAR(50),
  state_allowances INTEGER DEFAULT 0,
  additional_state_withholding DECIMAL(10,2) DEFAULT 0,
  
  -- Pay information
  pay_type VARCHAR(50) DEFAULT 'hourly' CHECK (pay_type IN ('hourly', 'salary', 'commission', 'contract')),
  pay_rate DECIMAL(10,2),
  pay_frequency VARCHAR(50) DEFAULT 'biweekly',
  
  -- Direct deposit
  direct_deposit_enabled BOOLEAN DEFAULT FALSE,
  bank_name VARCHAR(255),
  bank_routing_number_encrypted TEXT,
  bank_account_number_encrypted TEXT,
  bank_account_type VARCHAR(50) CHECK (bank_account_type IN ('checking', 'savings')),
  
  -- Benefits elections
  health_plan_id VARCHAR(100),
  dental_plan_id VARCHAR(100),
  vision_plan_id VARCHAR(100),
  retirement_contribution_percent DECIMAL(5,2) DEFAULT 0,
  hsa_contribution_per_period DECIMAL(10,2) DEFAULT 0,
  fsa_contribution_per_period DECIMAL(10,2) DEFAULT 0,
  
  external_employee_id VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payroll_providers_org ON payroll_providers(organization_id);
CREATE INDEX IF NOT EXISTS idx_payroll_periods_org ON payroll_periods(organization_id);
CREATE INDEX IF NOT EXISTS idx_payroll_periods_dates ON payroll_periods(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_payroll_periods_status ON payroll_periods(status);
CREATE INDEX IF NOT EXISTS idx_payroll_entries_period ON payroll_entries(payroll_period_id);
CREATE INDEX IF NOT EXISTS idx_payroll_entries_employee ON payroll_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_adjustments_entry ON payroll_adjustments(payroll_entry_id);
CREATE INDEX IF NOT EXISTS idx_payroll_sync_logs_provider ON payroll_sync_logs(provider_id);
CREATE INDEX IF NOT EXISTS idx_employee_payroll_settings_employee ON employee_payroll_settings(employee_id);

-- RLS Policies
ALTER TABLE payroll_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_payroll_settings ENABLE ROW LEVEL SECURITY;

-- Payroll providers - admin only
CREATE POLICY "payroll_providers_manage" ON payroll_providers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.organization_id = payroll_providers.organization_id
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

-- Payroll periods - admin only
CREATE POLICY "payroll_periods_manage" ON payroll_periods
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.organization_id = payroll_periods.organization_id
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

-- Payroll entries - employees can see their own, admins can see all
CREATE POLICY "payroll_entries_select" ON payroll_entries
  FOR SELECT USING (
    employee_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM platform_users pu
      JOIN payroll_periods pp ON pp.id = payroll_entries.payroll_period_id
      WHERE pu.id = auth.uid()
      AND pu.organization_id = pp.organization_id
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

CREATE POLICY "payroll_entries_manage" ON payroll_entries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      JOIN payroll_periods pp ON pp.id = payroll_entries.payroll_period_id
      WHERE pu.id = auth.uid()
      AND pu.organization_id = pp.organization_id
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

-- Employee payroll settings - employees can see their own
CREATE POLICY "employee_payroll_settings_select" ON employee_payroll_settings
  FOR SELECT USING (employee_id = auth.uid());

CREATE POLICY "employee_payroll_settings_manage" ON employee_payroll_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

-- Function to calculate payroll entry totals
CREATE OR REPLACE FUNCTION calculate_payroll_entry_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate gross pay
  NEW.regular_pay := COALESCE(NEW.regular_hours, 0) * COALESCE(NEW.regular_rate, 0);
  NEW.overtime_pay := COALESCE(NEW.overtime_hours, 0) * COALESCE(NEW.overtime_rate, NEW.regular_rate * 1.5, 0);
  NEW.double_time_pay := COALESCE(NEW.double_time_hours, 0) * COALESCE(NEW.double_time_rate, NEW.regular_rate * 2, 0);
  
  NEW.gross_pay := COALESCE(NEW.regular_pay, 0) + COALESCE(NEW.overtime_pay, 0) + 
                   COALESCE(NEW.double_time_pay, 0) + COALESCE(NEW.pto_pay, 0) + 
                   COALESCE(NEW.sick_pay, 0) + COALESCE(NEW.holiday_pay, 0) + 
                   COALESCE(NEW.bonus, 0) + COALESCE(NEW.commission, 0) + 
                   COALESCE(NEW.other_earnings, 0);
  
  -- Calculate total deductions
  NEW.total_deductions := COALESCE(NEW.federal_tax, 0) + COALESCE(NEW.state_tax, 0) + 
                          COALESCE(NEW.local_tax, 0) + COALESCE(NEW.social_security, 0) + 
                          COALESCE(NEW.medicare, 0) + COALESCE(NEW.health_insurance, 0) + 
                          COALESCE(NEW.dental_insurance, 0) + COALESCE(NEW.vision_insurance, 0) + 
                          COALESCE(NEW.retirement_401k, 0) + COALESCE(NEW.hsa_contribution, 0) + 
                          COALESCE(NEW.fsa_contribution, 0) + COALESCE(NEW.garnishments, 0) + 
                          COALESCE(NEW.other_deductions, 0);
  
  -- Calculate net pay
  NEW.net_pay := NEW.gross_pay - NEW.total_deductions;
  
  -- Calculate employer costs
  NEW.total_employer_cost := COALESCE(NEW.employer_social_security, 0) + 
                             COALESCE(NEW.employer_medicare, 0) + 
                             COALESCE(NEW.employer_futa, 0) + 
                             COALESCE(NEW.employer_suta, 0) + 
                             COALESCE(NEW.employer_health_contribution, 0) + 
                             COALESCE(NEW.employer_retirement_match, 0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payroll_entry_calculate_totals
  BEFORE INSERT OR UPDATE ON payroll_entries
  FOR EACH ROW
  EXECUTE FUNCTION calculate_payroll_entry_totals();

-- Function to update payroll period totals
CREATE OR REPLACE FUNCTION update_payroll_period_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE payroll_periods
  SET 
    total_gross = (SELECT COALESCE(SUM(gross_pay), 0) FROM payroll_entries WHERE payroll_period_id = COALESCE(NEW.payroll_period_id, OLD.payroll_period_id)),
    total_deductions = (SELECT COALESCE(SUM(total_deductions), 0) FROM payroll_entries WHERE payroll_period_id = COALESCE(NEW.payroll_period_id, OLD.payroll_period_id)),
    total_net = (SELECT COALESCE(SUM(net_pay), 0) FROM payroll_entries WHERE payroll_period_id = COALESCE(NEW.payroll_period_id, OLD.payroll_period_id)),
    total_employer_taxes = (SELECT COALESCE(SUM(total_employer_cost), 0) FROM payroll_entries WHERE payroll_period_id = COALESCE(NEW.payroll_period_id, OLD.payroll_period_id)),
    employee_count = (SELECT COUNT(*) FROM payroll_entries WHERE payroll_period_id = COALESCE(NEW.payroll_period_id, OLD.payroll_period_id)),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.payroll_period_id, OLD.payroll_period_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payroll_entry_update_period_totals
  AFTER INSERT OR UPDATE OR DELETE ON payroll_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_payroll_period_totals();
