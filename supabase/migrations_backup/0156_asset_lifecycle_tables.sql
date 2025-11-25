-- Migration: Asset Lifecycle Tables
-- Description: Tables for asset replacement planning, retirement, and transfers

-- Asset replacement plans table
CREATE TABLE IF NOT EXISTS asset_replacement_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  planned_replacement_date TIMESTAMPTZ NOT NULL,
  replacement_reason VARCHAR(30) NOT NULL CHECK (replacement_reason IN ('end_of_life', 'obsolete', 'upgrade', 'damage', 'capacity', 'cost_efficiency')),
  estimated_replacement_cost DECIMAL(12, 2) NOT NULL,
  replacement_asset_specs TEXT,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  budget_approved BOOLEAN DEFAULT FALSE,
  budget_approved_by UUID REFERENCES platform_users(id),
  budget_approved_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'approved', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asset retirements table
CREATE TABLE IF NOT EXISTS asset_retirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id),
  retirement_date TIMESTAMPTZ NOT NULL,
  retirement_reason VARCHAR(30) NOT NULL CHECK (retirement_reason IN ('end_of_life', 'obsolete', 'damaged_beyond_repair', 'sold', 'donated', 'scrapped', 'lost', 'stolen')),
  disposal_method VARCHAR(30) CHECK (disposal_method IN ('sale', 'donation', 'recycling', 'scrap', 'trade_in', 'internal_transfer', 'write_off')),
  disposal_value DECIMAL(12, 2),
  disposal_recipient VARCHAR(200),
  documentation JSONB,
  notes TEXT,
  retired_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asset transfers table
CREATE TABLE IF NOT EXISTS asset_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id),
  from_project_id UUID REFERENCES projects(id),
  to_project_id UUID NOT NULL REFERENCES projects(id),
  transfer_date TIMESTAMPTZ NOT NULL,
  reason TEXT,
  approved_by UUID REFERENCES platform_users(id),
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'approved', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add lifecycle columns to assets table if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'expected_lifespan_years') THEN
    ALTER TABLE assets ADD COLUMN expected_lifespan_years INTEGER DEFAULT 5;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'retired_date') THEN
    ALTER TABLE assets ADD COLUMN retired_date TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'current_project_id') THEN
    ALTER TABLE assets ADD COLUMN current_project_id UUID REFERENCES projects(id);
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_asset_replacement_plans_asset ON asset_replacement_plans(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_replacement_plans_date ON asset_replacement_plans(planned_replacement_date);
CREATE INDEX IF NOT EXISTS idx_asset_replacement_plans_status ON asset_replacement_plans(status);
CREATE INDEX IF NOT EXISTS idx_asset_retirements_asset ON asset_retirements(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_retirements_date ON asset_retirements(retirement_date);
CREATE INDEX IF NOT EXISTS idx_asset_transfers_asset ON asset_transfers(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_transfers_from ON asset_transfers(from_project_id);
CREATE INDEX IF NOT EXISTS idx_asset_transfers_to ON asset_transfers(to_project_id);

-- RLS Policies
ALTER TABLE asset_replacement_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_retirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_transfers ENABLE ROW LEVEL SECURITY;

-- View policies
CREATE POLICY asset_replacement_plans_view ON asset_replacement_plans FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY asset_retirements_view ON asset_retirements FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY asset_transfers_view ON asset_transfers FOR SELECT USING (auth.uid() IS NOT NULL);

-- Manage policies
CREATE POLICY asset_replacement_plans_manage ON asset_replacement_plans FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND ('ATLVS_TEAM_MEMBER' = ANY(platform_roles) OR 'ATLVS_ADMIN' = ANY(platform_roles)))
);

CREATE POLICY asset_retirements_manage ON asset_retirements FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND 'ATLVS_ADMIN' = ANY(platform_roles))
);

CREATE POLICY asset_transfers_manage ON asset_transfers FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND ('ATLVS_TEAM_MEMBER' = ANY(platform_roles) OR 'ATLVS_ADMIN' = ANY(platform_roles)))
);

-- Function to get assets approaching end of life
CREATE OR REPLACE FUNCTION get_end_of_life_assets(months_ahead INTEGER DEFAULT 12)
RETURNS TABLE (
  asset_id UUID,
  asset_name VARCHAR,
  asset_tag VARCHAR,
  category VARCHAR,
  purchase_price DECIMAL,
  age_years NUMERIC,
  remaining_life_months INTEGER,
  urgency VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.name,
    a.asset_tag,
    a.category,
    a.purchase_price,
    ROUND(EXTRACT(EPOCH FROM (NOW() - a.purchase_date)) / (365.25 * 24 * 60 * 60), 1),
    ROUND((COALESCE(a.expected_lifespan_years, 5) * 12) - 
          (EXTRACT(EPOCH FROM (NOW() - a.purchase_date)) / (30.44 * 24 * 60 * 60)))::INTEGER,
    CASE 
      WHEN (COALESCE(a.expected_lifespan_years, 5) * 12) - 
           (EXTRACT(EPOCH FROM (NOW() - a.purchase_date)) / (30.44 * 24 * 60 * 60)) <= 0 THEN 'past_due'
      WHEN (COALESCE(a.expected_lifespan_years, 5) * 12) - 
           (EXTRACT(EPOCH FROM (NOW() - a.purchase_date)) / (30.44 * 24 * 60 * 60)) <= 6 THEN 'critical'
      ELSE 'approaching'
    END::VARCHAR
  FROM assets a
  WHERE a.status NOT IN ('retired', 'disposed')
    AND (COALESCE(a.expected_lifespan_years, 5) * 12) - 
        (EXTRACT(EPOCH FROM (NOW() - a.purchase_date)) / (30.44 * 24 * 60 * 60)) <= months_ahead
  ORDER BY remaining_life_months ASC;
END;
$$ LANGUAGE plpgsql;
