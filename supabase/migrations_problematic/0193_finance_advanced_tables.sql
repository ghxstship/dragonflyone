-- Migration: Advanced Finance Tables
-- Description: Tables for bad debt, intercompany, and fixed assets

-- Bad debt write-offs table
CREATE TABLE IF NOT EXISTS bad_debt_write_offs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES client_invoices(id),
  write_off_amount DECIMAL(12, 2) NOT NULL,
  write_off_reason VARCHAR(30) NOT NULL CHECK (write_off_reason IN ('uncollectible', 'bankruptcy', 'dispute_settled', 'statute_of_limitations', 'customer_deceased', 'other')),
  write_off_date TIMESTAMPTZ NOT NULL,
  notes TEXT,
  approved_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bad debt reserves table
CREATE TABLE IF NOT EXISTS bad_debt_reserves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES contacts(id),
  invoice_id UUID REFERENCES client_invoices(id),
  reserve_amount DECIMAL(12, 2) NOT NULL,
  reserve_percentage DECIMAL(5, 2),
  reason TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'released', 'applied')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bad debt reserve adjustments table
CREATE TABLE IF NOT EXISTS bad_debt_reserve_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reserve_id UUID NOT NULL REFERENCES bad_debt_reserves(id),
  previous_amount DECIMAL(12, 2),
  new_amount DECIMAL(12, 2) NOT NULL,
  adjustment_amount DECIMAL(12, 2) NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bad debt recoveries table
CREATE TABLE IF NOT EXISTS bad_debt_recoveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  write_off_id UUID NOT NULL REFERENCES bad_debt_write_offs(id),
  recovery_amount DECIMAL(12, 2) NOT NULL,
  recovery_method VARCHAR(50),
  recovery_date TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Entities table (for multi-entity/intercompany)
CREATE TABLE IF NOT EXISTS entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  code VARCHAR(20) NOT NULL UNIQUE,
  entity_type VARCHAR(30) CHECK (entity_type IN ('parent', 'subsidiary', 'affiliate', 'branch')),
  parent_entity_id UUID REFERENCES entities(id),
  tax_id VARCHAR(50),
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Intercompany transactions table
CREATE TABLE IF NOT EXISTS intercompany_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_entity_id UUID NOT NULL REFERENCES entities(id),
  to_entity_id UUID NOT NULL REFERENCES entities(id),
  transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN ('service', 'goods', 'loan', 'dividend', 'management_fee', 'royalty', 'cost_sharing')),
  amount DECIMAL(14, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  description TEXT NOT NULL,
  transaction_date TIMESTAMPTZ NOT NULL,
  invoice_number VARCHAR(50),
  cost_center VARCHAR(50),
  project_id UUID REFERENCES projects(id),
  confirmed_by_receiver BOOLEAN DEFAULT FALSE,
  confirmed_at TIMESTAMPTZ,
  confirmed_by UUID REFERENCES platform_users(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'settled', 'eliminated', 'disputed', 'voided')),
  settlement_date TIMESTAMPTZ,
  settlement_method VARCHAR(50),
  settlement_notes TEXT,
  elimination_id UUID,
  void_reason TEXT,
  voided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Intercompany eliminations table
CREATE TABLE IF NOT EXISTS intercompany_eliminations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  consolidation_entity_id UUID REFERENCES entities(id),
  total_eliminated DECIMAL(14, 2) NOT NULL,
  transaction_count INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'reversed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Elimination details table
CREATE TABLE IF NOT EXISTS elimination_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  elimination_id UUID NOT NULL REFERENCES intercompany_eliminations(id) ON DELETE CASCADE,
  transaction_id UUID NOT NULL REFERENCES intercompany_transactions(id),
  from_entity_id UUID NOT NULL,
  to_entity_id UUID NOT NULL,
  amount DECIMAL(14, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fixed assets table
CREATE TABLE IF NOT EXISTS fixed_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  asset_number VARCHAR(50) UNIQUE,
  category VARCHAR(30) NOT NULL CHECK (category IN ('land', 'buildings', 'equipment', 'vehicles', 'furniture', 'computers', 'leasehold_improvements', 'intangible')),
  description TEXT,
  acquisition_date TIMESTAMPTZ NOT NULL,
  acquisition_cost DECIMAL(14, 2) NOT NULL,
  useful_life_years INTEGER NOT NULL,
  salvage_value DECIMAL(12, 2) DEFAULT 0,
  depreciation_method VARCHAR(30) NOT NULL CHECK (depreciation_method IN ('straight_line', 'declining_balance', 'sum_of_years', 'units_of_production')),
  depreciation_rate DECIMAL(5, 4),
  location VARCHAR(200),
  department_id UUID REFERENCES departments(id),
  vendor_id UUID REFERENCES vendors(id),
  serial_number VARCHAR(100),
  warranty_expiration TIMESTAMPTZ,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'disposed', 'fully_depreciated')),
  disposal_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Depreciation entries table
CREATE TABLE IF NOT EXISTS depreciation_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES fixed_assets(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  depreciation_amount DECIMAL(12, 2) NOT NULL,
  accumulated_after DECIMAL(14, 2) NOT NULL,
  book_value_after DECIMAL(14, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asset disposals table
CREATE TABLE IF NOT EXISTS asset_disposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES fixed_assets(id),
  disposal_date TIMESTAMPTZ NOT NULL,
  disposal_method VARCHAR(30) NOT NULL CHECK (disposal_method IN ('sale', 'trade_in', 'scrap', 'donation', 'theft', 'write_off')),
  disposal_amount DECIMAL(12, 2) NOT NULL,
  book_value_at_disposal DECIMAL(12, 2) NOT NULL,
  accumulated_depreciation DECIMAL(14, 2) NOT NULL,
  gain_loss DECIMAL(12, 2) NOT NULL,
  disposal_reason TEXT,
  buyer_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add entity_id to ledger_entries if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ledger_entries' AND column_name = 'entity_id') THEN
    ALTER TABLE ledger_entries ADD COLUMN entity_id UUID REFERENCES entities(id);
  END IF;
END $$;

-- Add written_off columns to client_invoices if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_invoices' AND column_name = 'written_off_amount') THEN
    ALTER TABLE client_invoices ADD COLUMN written_off_amount DECIMAL(12, 2);
    ALTER TABLE client_invoices ADD COLUMN written_off_date TIMESTAMPTZ;
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bad_debt_write_offs_invoice ON bad_debt_write_offs(invoice_id);
CREATE INDEX IF NOT EXISTS idx_bad_debt_reserves_client ON bad_debt_reserves(client_id);
CREATE INDEX IF NOT EXISTS idx_bad_debt_reserves_status ON bad_debt_reserves(status);
CREATE INDEX IF NOT EXISTS idx_intercompany_transactions_from ON intercompany_transactions(from_entity_id);
CREATE INDEX IF NOT EXISTS idx_intercompany_transactions_to ON intercompany_transactions(to_entity_id);
CREATE INDEX IF NOT EXISTS idx_intercompany_transactions_status ON intercompany_transactions(status);
CREATE INDEX IF NOT EXISTS idx_intercompany_transactions_date ON intercompany_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_intercompany_eliminations_period ON intercompany_eliminations(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_fixed_assets_category ON fixed_assets(category);
CREATE INDEX IF NOT EXISTS idx_fixed_assets_status ON fixed_assets(status);
CREATE INDEX IF NOT EXISTS idx_depreciation_entries_asset ON depreciation_entries(asset_id);
CREATE INDEX IF NOT EXISTS idx_depreciation_entries_period ON depreciation_entries(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_asset_disposals_asset ON asset_disposals(asset_id);

-- RLS Policies
ALTER TABLE bad_debt_write_offs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bad_debt_reserves ENABLE ROW LEVEL SECURITY;
ALTER TABLE bad_debt_recoveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE intercompany_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE intercompany_eliminations ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixed_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE depreciation_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_disposals ENABLE ROW LEVEL SECURITY;

-- View policies
CREATE POLICY bad_debt_write_offs_view ON bad_debt_write_offs FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY bad_debt_reserves_view ON bad_debt_reserves FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY bad_debt_recoveries_view ON bad_debt_recoveries FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY entities_view ON entities FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY intercompany_transactions_view ON intercompany_transactions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY intercompany_eliminations_view ON intercompany_eliminations FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY fixed_assets_view ON fixed_assets FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY depreciation_entries_view ON depreciation_entries FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY asset_disposals_view ON asset_disposals FOR SELECT USING (auth.uid() IS NOT NULL);

-- Admin manage policies
CREATE POLICY bad_debt_manage ON bad_debt_write_offs FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND 'ATLVS_ADMIN' = ANY(platform_roles))
);

CREATE POLICY intercompany_manage ON intercompany_transactions FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND ('ATLVS_TEAM_MEMBER' = ANY(platform_roles) OR 'ATLVS_ADMIN' = ANY(platform_roles)))
);

CREATE POLICY fixed_assets_manage ON fixed_assets FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND ('ATLVS_TEAM_MEMBER' = ANY(platform_roles) OR 'ATLVS_ADMIN' = ANY(platform_roles)))
);
