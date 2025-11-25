-- Migration: Cost Allocation and Profit Sharing Tables
-- Description: Tables for cost allocation rules and profit sharing plans

-- Cost pools table
CREATE TABLE IF NOT EXISTS cost_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  account_ids UUID[],
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allocation rules table
CREATE TABLE IF NOT EXISTS allocation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  allocation_type VARCHAR(30) NOT NULL CHECK (allocation_type IN ('percentage', 'headcount', 'square_footage', 'revenue', 'direct_labor', 'custom')),
  source_account_id UUID,
  source_cost_pool VARCHAR(50),
  effective_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allocation rule targets table
CREATE TABLE IF NOT EXISTS allocation_rule_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL REFERENCES allocation_rules(id) ON DELETE CASCADE,
  target_type VARCHAR(30) NOT NULL CHECK (target_type IN ('project', 'department', 'cost_center', 'entity')),
  target_id UUID NOT NULL,
  allocation_percentage DECIMAL(5, 2),
  allocation_basis DECIMAL(12, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cost allocations table
CREATE TABLE IF NOT EXISTS cost_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL REFERENCES allocation_rules(id),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  source_amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'reversed')),
  allocated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allocation details table
CREATE TABLE IF NOT EXISTS allocation_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  allocation_id UUID NOT NULL REFERENCES cost_allocations(id) ON DELETE CASCADE,
  target_type VARCHAR(30) NOT NULL,
  target_id UUID NOT NULL,
  allocation_percentage DECIMAL(5, 2) NOT NULL,
  allocated_amount DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profit sharing plans table
CREATE TABLE IF NOT EXISTS profit_sharing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  plan_type VARCHAR(30) NOT NULL CHECK (plan_type IN ('percentage_of_profit', 'percentage_of_salary', 'tiered', 'points_based')),
  profit_threshold DECIMAL(14, 2) DEFAULT 0,
  distribution_rate DECIMAL(5, 4),
  allocation_method VARCHAR(30) NOT NULL CHECK (allocation_method IN ('equal', 'salary_weighted', 'tenure_weighted', 'performance_weighted', 'custom')),
  vesting_schedule JSONB,
  eligibility_criteria JSONB,
  effective_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profit sharing distributions table
CREATE TABLE IF NOT EXISTS profit_sharing_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES profit_sharing_plans(id),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  total_profit DECIMAL(14, 2) NOT NULL,
  distribution_percentage DECIMAL(5, 2) NOT NULL,
  distribution_amount DECIMAL(14, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'allocated', 'approved', 'paid', 'cancelled')),
  approved_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profit sharing allocations table
CREATE TABLE IF NOT EXISTS profit_sharing_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distribution_id UUID NOT NULL REFERENCES profit_sharing_distributions(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES platform_users(id),
  gross_amount DECIMAL(12, 2) NOT NULL,
  vested_amount DECIMAL(12, 2) NOT NULL,
  forfeited_amount DECIMAL(12, 2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'vested', 'paid', 'forfeited')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add cost_pool column to ledger_entries if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ledger_entries' AND column_name = 'cost_pool') THEN
    ALTER TABLE ledger_entries ADD COLUMN cost_pool VARCHAR(50);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ledger_entries' AND column_name = 'department_id') THEN
    ALTER TABLE ledger_entries ADD COLUMN department_id UUID;
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_allocation_rules_status ON allocation_rules(status);
CREATE INDEX IF NOT EXISTS idx_allocation_rule_targets_rule ON allocation_rule_targets(rule_id);
CREATE INDEX IF NOT EXISTS idx_cost_allocations_rule ON cost_allocations(rule_id);
CREATE INDEX IF NOT EXISTS idx_cost_allocations_period ON cost_allocations(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_allocation_details_allocation ON allocation_details(allocation_id);
CREATE INDEX IF NOT EXISTS idx_allocation_details_target ON allocation_details(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_profit_sharing_plans_status ON profit_sharing_plans(status);
CREATE INDEX IF NOT EXISTS idx_profit_sharing_distributions_plan ON profit_sharing_distributions(plan_id);
CREATE INDEX IF NOT EXISTS idx_profit_sharing_distributions_period ON profit_sharing_distributions(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_profit_sharing_allocations_distribution ON profit_sharing_allocations(distribution_id);
CREATE INDEX IF NOT EXISTS idx_profit_sharing_allocations_employee ON profit_sharing_allocations(employee_id);

-- RLS Policies
ALTER TABLE cost_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocation_rule_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocation_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE profit_sharing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE profit_sharing_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profit_sharing_allocations ENABLE ROW LEVEL SECURITY;

-- View policies
CREATE POLICY cost_pools_view ON cost_pools FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY allocation_rules_view ON allocation_rules FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY allocation_rule_targets_view ON allocation_rule_targets FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY cost_allocations_view ON cost_allocations FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY allocation_details_view ON allocation_details FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY profit_sharing_plans_view ON profit_sharing_plans FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY profit_sharing_distributions_view ON profit_sharing_distributions FOR SELECT USING (auth.uid() IS NOT NULL);

-- Employee can view their own allocations
CREATE POLICY profit_sharing_allocations_view ON profit_sharing_allocations FOR SELECT USING (
  employee_id = auth.uid() OR
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND 'ATLVS_ADMIN' = ANY(platform_roles))
);

-- Admin manage policies
CREATE POLICY allocation_rules_manage ON allocation_rules FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND 'ATLVS_ADMIN' = ANY(platform_roles))
);

CREATE POLICY profit_sharing_plans_manage ON profit_sharing_plans FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND 'ATLVS_ADMIN' = ANY(platform_roles))
);

CREATE POLICY profit_sharing_distributions_manage ON profit_sharing_distributions FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND 'ATLVS_ADMIN' = ANY(platform_roles))
);
