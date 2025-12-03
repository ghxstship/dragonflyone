-- Migration: Investment & Fundraising System
-- Description: Investor tracking, investment rounds, and funding management from ExperienceGeneratorSchema

-- Add investor type enum
DO $$ BEGIN
  CREATE TYPE investor_type_enum AS ENUM (
    'individual', 'institution', 'family_office', 'vc', 
    'angel', 'corporate', 'foundation', 'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add investor status enum
DO $$ BEGIN
  CREATE TYPE investor_status_enum AS ENUM (
    'prospect', 'contacted', 'meeting', 'due_diligence', 
    'committed', 'funded', 'declined', 'inactive'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add round type enum
DO $$ BEGIN
  CREATE TYPE round_type_enum AS ENUM (
    'pre_seed', 'seed', 'series_a', 'series_b', 'series_c',
    'bridge', 'growth', 'mezzanine', 'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add round status enum
DO $$ BEGIN
  CREATE TYPE round_status_enum AS ENUM ('planning', 'open', 'closing', 'closed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add instrument enum
DO $$ BEGIN
  CREATE TYPE investment_instrument_enum AS ENUM (
    'equity', 'safe', 'convertible_note', 'revenue_share', 
    'profit_share', 'debt', 'grant', 'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add investment status enum
DO $$ BEGIN
  CREATE TYPE investment_status_enum AS ENUM (
    'committed', 'docs_sent', 'docs_signed', 'wired', 'funded', 'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Investors table
CREATE TABLE IF NOT EXISTS investors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id),
  
  -- Investor info
  investor_type investor_type_enum,
  entity_name TEXT,
  entity_type TEXT,
  
  -- Status
  status investor_status_enum DEFAULT 'prospect',
  
  -- Accreditation
  accredited BOOLEAN,
  accreditation_verified BOOLEAN DEFAULT false,
  accreditation_verified_at TIMESTAMPTZ,
  accreditation_document_url TEXT,
  
  -- Investment preferences
  investment_min NUMERIC(12,2),
  investment_max NUMERIC(12,2),
  preferred_instruments TEXT[],
  interests TEXT[] DEFAULT '{}',
  sectors TEXT[] DEFAULT '{}',
  geographic_focus TEXT[],
  
  -- Relationship
  source TEXT,
  referred_by UUID REFERENCES contacts(id),
  relationship_owner_id UUID REFERENCES platform_users(id),
  last_contact_date DATE,
  next_follow_up DATE,
  
  -- Documents
  nda_signed BOOLEAN DEFAULT false,
  nda_signed_at TIMESTAMPTZ,
  nda_document_url TEXT,
  
  -- Meta
  notes TEXT,
  internal_notes TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Investment Rounds table
CREATE TABLE IF NOT EXISTS investment_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  production_id UUID REFERENCES productions(id),
  
  -- Round info
  name VARCHAR(100) NOT NULL,
  round_type round_type_enum,
  status round_status_enum DEFAULT 'planning',
  
  -- Targets
  target_amount NUMERIC(12,2),
  minimum_amount NUMERIC(12,2),
  maximum_amount NUMERIC(12,2),
  amount_raised NUMERIC(12,2) DEFAULT 0,
  amount_committed NUMERIC(12,2) DEFAULT 0,
  
  -- Valuation
  pre_money_valuation NUMERIC(14,2),
  post_money_valuation NUMERIC(14,2),
  
  -- Terms
  instrument investment_instrument_enum,
  discount_rate NUMERIC(5,2),
  valuation_cap NUMERIC(14,2),
  interest_rate NUMERIC(5,2),
  maturity_months INTEGER,
  
  -- Dates
  open_date DATE,
  target_close_date DATE,
  actual_close_date DATE,
  
  -- Minimums
  minimum_investment NUMERIC(10,2),
  
  -- Documents
  terms_url TEXT,
  deck_url TEXT,
  data_room_url TEXT,
  subscription_agreement_url TEXT,
  
  -- Meta
  notes TEXT,
  internal_notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Investments table
CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES investment_rounds(id) ON DELETE CASCADE,
  investor_id UUID NOT NULL REFERENCES investors(id),
  
  -- Amount
  amount NUMERIC(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Status
  status investment_status_enum DEFAULT 'committed',
  
  -- Dates
  committed_at TIMESTAMPTZ,
  docs_sent_at TIMESTAMPTZ,
  docs_signed_at TIMESTAMPTZ,
  wired_at TIMESTAMPTZ,
  funded_at TIMESTAMPTZ,
  
  -- Equity
  equity_percent NUMERIC(6,4),
  shares_issued INTEGER,
  share_price NUMERIC(10,4),
  
  -- Documents
  subscription_agreement_url TEXT,
  wire_confirmation_url TEXT,
  stock_certificate_url TEXT,
  
  -- Contract
  contract_id UUID REFERENCES contracts(id),
  
  -- Meta
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Investor Communications table
CREATE TABLE IF NOT EXISTS investor_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID REFERENCES investors(id) ON DELETE CASCADE,
  round_id UUID REFERENCES investment_rounds(id),
  
  -- Communication
  communication_type TEXT NOT NULL CHECK (communication_type IN (
    'email', 'call', 'meeting', 'presentation', 'update', 'document', 'other'
  )),
  subject TEXT,
  content TEXT,
  
  -- Participants
  participants JSONB DEFAULT '[]',
  
  -- Scheduling
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  
  -- Follow-up
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  follow_up_notes TEXT,
  
  -- Attachments
  attachments JSONB DEFAULT '[]',
  
  -- Meta
  created_by_id UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_investors_org ON investors(organization_id);
CREATE INDEX IF NOT EXISTS idx_investors_contact ON investors(contact_id);
CREATE INDEX IF NOT EXISTS idx_investors_type ON investors(investor_type);
CREATE INDEX IF NOT EXISTS idx_investors_status ON investors(status);
CREATE INDEX IF NOT EXISTS idx_investors_owner ON investors(relationship_owner_id);

CREATE INDEX IF NOT EXISTS idx_investment_rounds_org ON investment_rounds(organization_id);
CREATE INDEX IF NOT EXISTS idx_investment_rounds_production ON investment_rounds(production_id);
CREATE INDEX IF NOT EXISTS idx_investment_rounds_type ON investment_rounds(round_type);
CREATE INDEX IF NOT EXISTS idx_investment_rounds_status ON investment_rounds(status);

CREATE INDEX IF NOT EXISTS idx_investments_round ON investments(round_id);
CREATE INDEX IF NOT EXISTS idx_investments_investor ON investments(investor_id);
CREATE INDEX IF NOT EXISTS idx_investments_status ON investments(status);

CREATE INDEX IF NOT EXISTS idx_investor_communications_investor ON investor_communications(investor_id);
CREATE INDEX IF NOT EXISTS idx_investor_communications_round ON investor_communications(round_id);

-- Function to update round totals
CREATE OR REPLACE FUNCTION update_round_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE investment_rounds
  SET 
    amount_committed = (
      SELECT COALESCE(SUM(amount), 0) 
      FROM investments 
      WHERE round_id = COALESCE(NEW.round_id, OLD.round_id)
        AND status IN ('committed', 'docs_sent', 'docs_signed', 'wired', 'funded')
    ),
    amount_raised = (
      SELECT COALESCE(SUM(amount), 0) 
      FROM investments 
      WHERE round_id = COALESCE(NEW.round_id, OLD.round_id)
        AND status = 'funded'
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.round_id, OLD.round_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS investment_totals_trigger ON investments;
CREATE TRIGGER investment_totals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON investments
  FOR EACH ROW
  EXECUTE FUNCTION update_round_totals();

-- Function to get round summary
CREATE OR REPLACE FUNCTION get_round_summary(p_round_id UUID)
RETURNS TABLE (
  round_id UUID,
  round_name TEXT,
  round_type round_type_enum,
  status round_status_enum,
  target_amount NUMERIC,
  amount_committed NUMERIC,
  amount_raised NUMERIC,
  progress_percent NUMERIC,
  investors_count INTEGER,
  investments_count INTEGER,
  days_until_close INTEGER,
  average_investment NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.name,
    r.round_type,
    r.status,
    r.target_amount,
    r.amount_committed,
    r.amount_raised,
    CASE WHEN r.target_amount > 0 
      THEN ROUND((r.amount_committed / r.target_amount) * 100, 2) 
      ELSE 0 
    END AS progress_percent,
    (SELECT COUNT(DISTINCT investor_id)::INTEGER FROM investments WHERE round_id = r.id) AS investors_count,
    (SELECT COUNT(*)::INTEGER FROM investments WHERE round_id = r.id) AS investments_count,
    (r.target_close_date - CURRENT_DATE)::INTEGER AS days_until_close,
    (SELECT AVG(amount) FROM investments WHERE round_id = r.id) AS average_investment
  FROM investment_rounds r
  WHERE r.id = p_round_id;
END;
$$;

-- Function to get investor portfolio
CREATE OR REPLACE FUNCTION get_investor_portfolio(p_investor_id UUID)
RETURNS TABLE (
  investor_id UUID,
  total_invested NUMERIC,
  investments_count INTEGER,
  rounds_participated INTEGER,
  by_status JSONB,
  investments JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p_investor_id,
    COALESCE(SUM(i.amount), 0) AS total_invested,
    COUNT(i.id)::INTEGER AS investments_count,
    COUNT(DISTINCT i.round_id)::INTEGER AS rounds_participated,
    (SELECT jsonb_object_agg(status, cnt) FROM (
      SELECT status, COUNT(*) AS cnt 
      FROM investments WHERE investor_id = p_investor_id 
      GROUP BY status
    ) sub) AS by_status,
    (SELECT jsonb_agg(jsonb_build_object(
      'round_name', r.name,
      'amount', i2.amount,
      'status', i2.status,
      'funded_at', i2.funded_at,
      'equity_percent', i2.equity_percent
    ) ORDER BY i2.created_at DESC)
    FROM investments i2
    JOIN investment_rounds r ON i2.round_id = r.id
    WHERE i2.investor_id = p_investor_id) AS investments
  FROM investments i
  WHERE i.investor_id = p_investor_id
  GROUP BY i.investor_id;
END;
$$;

-- Function to get fundraising dashboard
CREATE OR REPLACE FUNCTION get_fundraising_dashboard(p_org_id UUID)
RETURNS TABLE (
  total_raised_all_time NUMERIC,
  active_rounds INTEGER,
  total_investors INTEGER,
  active_round_summary JSONB,
  recent_investments JSONB,
  investor_pipeline JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COALESCE(SUM(amount_raised), 0) FROM investment_rounds WHERE organization_id = p_org_id) AS total_raised_all_time,
    (SELECT COUNT(*)::INTEGER FROM investment_rounds WHERE organization_id = p_org_id AND status IN ('open', 'closing')) AS active_rounds,
    (SELECT COUNT(*)::INTEGER FROM investors WHERE organization_id = p_org_id AND status NOT IN ('declined', 'inactive')) AS total_investors,
    (SELECT jsonb_agg(jsonb_build_object(
      'id', r.id,
      'name', r.name,
      'target', r.target_amount,
      'raised', r.amount_raised,
      'committed', r.amount_committed,
      'status', r.status
    ))
    FROM investment_rounds r
    WHERE r.organization_id = p_org_id AND r.status IN ('open', 'closing')) AS active_round_summary,
    (SELECT jsonb_agg(jsonb_build_object(
      'investor', COALESCE(inv.entity_name, c.first_name || ' ' || c.last_name),
      'amount', i.amount,
      'status', i.status,
      'date', i.created_at
    ) ORDER BY i.created_at DESC)
    FROM investments i
    JOIN investors inv ON i.investor_id = inv.id
    LEFT JOIN contacts c ON inv.contact_id = c.id
    JOIN investment_rounds r ON i.round_id = r.id
    WHERE r.organization_id = p_org_id
    LIMIT 10) AS recent_investments,
    (SELECT jsonb_object_agg(status, cnt) FROM (
      SELECT status, COUNT(*) AS cnt 
      FROM investors WHERE organization_id = p_org_id 
      GROUP BY status
    ) sub) AS investor_pipeline;
END;
$$;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_investment_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS investors_updated_at ON investors;
CREATE TRIGGER investors_updated_at
  BEFORE UPDATE ON investors
  FOR EACH ROW EXECUTE FUNCTION update_investment_timestamp();

DROP TRIGGER IF EXISTS investment_rounds_updated_at ON investment_rounds;
CREATE TRIGGER investment_rounds_updated_at
  BEFORE UPDATE ON investment_rounds
  FOR EACH ROW EXECUTE FUNCTION update_investment_timestamp();

DROP TRIGGER IF EXISTS investments_updated_at ON investments;
CREATE TRIGGER investments_updated_at
  BEFORE UPDATE ON investments
  FOR EACH ROW EXECUTE FUNCTION update_investment_timestamp();

-- RLS Policies
ALTER TABLE investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_communications ENABLE ROW LEVEL SECURITY;

CREATE POLICY investors_select ON investors
  FOR SELECT TO authenticated
  USING (org_matches(organization_id));

CREATE POLICY investors_manage ON investors
  FOR ALL TO authenticated
  USING (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'))
  WITH CHECK (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

CREATE POLICY investment_rounds_select ON investment_rounds
  FOR SELECT TO authenticated
  USING (org_matches(organization_id));

CREATE POLICY investment_rounds_manage ON investment_rounds
  FOR ALL TO authenticated
  USING (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'))
  WITH CHECK (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

CREATE POLICY investments_select ON investments
  FOR SELECT TO authenticated
  USING (round_id IN (SELECT id FROM investment_rounds WHERE org_matches(organization_id)));

CREATE POLICY investments_manage ON investments
  FOR ALL TO authenticated
  USING (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'))
  WITH CHECK (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

CREATE POLICY investor_communications_select ON investor_communications
  FOR SELECT TO authenticated
  USING (investor_id IN (SELECT id FROM investors WHERE org_matches(organization_id)));

CREATE POLICY investor_communications_manage ON investor_communications
  FOR ALL TO authenticated
  USING (role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'))
  WITH CHECK (role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON investors TO authenticated;
GRANT SELECT, INSERT, UPDATE ON investment_rounds TO authenticated;
GRANT SELECT, INSERT, UPDATE ON investments TO authenticated;
GRANT SELECT, INSERT ON investor_communications TO authenticated;

GRANT EXECUTE ON FUNCTION get_round_summary(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_investor_portfolio(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_fundraising_dashboard(UUID) TO authenticated;
