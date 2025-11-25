-- Migration: Multi-Entity Management
-- Description: Tables for managing multiple business entities, subsidiaries, and intercompany transactions

-- Entities (companies, divisions, departments)
CREATE TABLE IF NOT EXISTS entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('company', 'division', 'department', 'branch', 'subsidiary')),
  parent_id UUID REFERENCES entities(id),
  legal_name TEXT,
  tax_id TEXT,
  address JSONB,
  settings JSONB DEFAULT '{"currency": "USD"}',
  is_active BOOLEAN DEFAULT true,
  deactivated_at TIMESTAMPTZ,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entities_parent ON entities(parent_id);
CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type);
CREATE INDEX IF NOT EXISTS idx_entities_active ON entities(is_active);

-- Entity user access
CREATE TABLE IF NOT EXISTS entity_user_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'member', 'viewer')),
  granted_by UUID REFERENCES platform_users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_entity_user_access_entity ON entity_user_access(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_user_access_user ON entity_user_access(user_id);

-- Entity financials (for consolidated reporting)
CREATE TABLE IF NOT EXISTS entity_financials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entity_financials_entity ON entity_financials(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_financials_period ON entity_financials(period_start, period_end);

-- Intercompany transactions
CREATE TABLE IF NOT EXISTS intercompany_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_entity_id UUID NOT NULL REFERENCES entities(id),
  to_entity_id UUID NOT NULL REFERENCES entities(id),
  amount NUMERIC(14,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  transaction_type TEXT NOT NULL,
  reference TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  approved_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_intercompany_transactions_from ON intercompany_transactions(from_entity_id);
CREATE INDEX IF NOT EXISTS idx_intercompany_transactions_to ON intercompany_transactions(to_entity_id);
CREATE INDEX IF NOT EXISTS idx_intercompany_transactions_status ON intercompany_transactions(status);

-- User preferences (for current entity context)
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) UNIQUE,
  current_entity_id UUID REFERENCES entities(id),
  preferences JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);

-- Add entity_id to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS entity_id UUID REFERENCES entities(id);

-- RLS policies
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_user_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE intercompany_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON entities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON entity_user_access TO authenticated;
GRANT SELECT, INSERT ON entity_financials TO authenticated;
GRANT SELECT, INSERT, UPDATE ON intercompany_transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_preferences TO authenticated;

-- Function to get entity hierarchy
CREATE OR REPLACE FUNCTION get_entity_hierarchy(p_entity_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  type TEXT,
  parent_id UUID,
  level INT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE entity_tree AS (
    SELECT e.id, e.name, e.type, e.parent_id, 0 as level
    FROM entities e
    WHERE e.id = p_entity_id
    
    UNION ALL
    
    SELECT e.id, e.name, e.type, e.parent_id, et.level + 1
    FROM entities e
    JOIN entity_tree et ON e.parent_id = et.id
    WHERE e.is_active = true
  )
  SELECT * FROM entity_tree;
END;
$$;

GRANT EXECUTE ON FUNCTION get_entity_hierarchy(UUID) TO authenticated;
