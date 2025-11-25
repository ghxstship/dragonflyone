-- Migration: Asset Insurance Tables
-- Description: Tables for insurance policy linkage and coverage verification

-- Insurance policies table
CREATE TABLE IF NOT EXISTS insurance_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_number VARCHAR(100) NOT NULL UNIQUE,
  provider VARCHAR(200) NOT NULL,
  policy_type VARCHAR(30) NOT NULL CHECK (policy_type IN ('property', 'liability', 'equipment', 'comprehensive', 'transit')),
  coverage_amount DECIMAL(14, 2) NOT NULL,
  deductible DECIMAL(12, 2) DEFAULT 0,
  premium_amount DECIMAL(12, 2) NOT NULL,
  premium_frequency VARCHAR(20) NOT NULL CHECK (premium_frequency IN ('monthly', 'quarterly', 'annual')),
  effective_date TIMESTAMPTZ NOT NULL,
  expiration_date TIMESTAMPTZ NOT NULL,
  coverage_details TEXT,
  contact_name VARCHAR(200),
  contact_phone VARCHAR(50),
  contact_email VARCHAR(255),
  documents JSONB,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asset insurance coverage (many-to-many)
CREATE TABLE IF NOT EXISTS asset_insurance_coverage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  policy_id UUID NOT NULL REFERENCES insurance_policies(id) ON DELETE CASCADE,
  coverage_amount DECIMAL(12, 2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(asset_id, policy_id)
);

-- Insurance claims table
CREATE TABLE IF NOT EXISTS insurance_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID NOT NULL REFERENCES insurance_policies(id),
  asset_id UUID REFERENCES assets(id),
  claim_number VARCHAR(100),
  incident_date TIMESTAMPTZ NOT NULL,
  filed_date TIMESTAMPTZ NOT NULL,
  description TEXT NOT NULL,
  claim_amount DECIMAL(12, 2) NOT NULL,
  paid_amount DECIMAL(12, 2),
  damage_type VARCHAR(30) NOT NULL CHECK (damage_type IN ('theft', 'damage', 'loss', 'accident', 'natural_disaster', 'other')),
  incident_location TEXT,
  police_report_number VARCHAR(100),
  witnesses TEXT[],
  photos JSONB,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'denied', 'paid', 'closed')),
  adjuster_name VARCHAR(200),
  adjuster_notes TEXT,
  resolution_date TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_insurance_policies_expiration ON insurance_policies(expiration_date);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_status ON insurance_policies(status);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_provider ON insurance_policies(provider);
CREATE INDEX IF NOT EXISTS idx_asset_insurance_coverage_asset ON asset_insurance_coverage(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_insurance_coverage_policy ON asset_insurance_coverage(policy_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_policy ON insurance_claims(policy_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_asset ON insurance_claims(asset_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_status ON insurance_claims(status);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_incident ON insurance_claims(incident_date);

-- RLS Policies
ALTER TABLE insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_insurance_coverage ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_claims ENABLE ROW LEVEL SECURITY;

-- View policies
CREATE POLICY insurance_policies_view ON insurance_policies FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY asset_insurance_coverage_view ON asset_insurance_coverage FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY insurance_claims_view ON insurance_claims FOR SELECT USING (auth.uid() IS NOT NULL);

-- Manage policies (admin only)
CREATE POLICY insurance_policies_manage ON insurance_policies FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND 'ATLVS_ADMIN' = ANY(platform_roles))
);

CREATE POLICY asset_insurance_coverage_manage ON asset_insurance_coverage FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND ('ATLVS_TEAM_MEMBER' = ANY(platform_roles) OR 'ATLVS_ADMIN' = ANY(platform_roles)))
);

CREATE POLICY insurance_claims_manage ON insurance_claims FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND ('ATLVS_TEAM_MEMBER' = ANY(platform_roles) OR 'ATLVS_ADMIN' = ANY(platform_roles)))
);

-- Function to check coverage gaps
CREATE OR REPLACE FUNCTION get_uncovered_high_value_assets(min_value DECIMAL DEFAULT 1000)
RETURNS TABLE (
  asset_id UUID,
  asset_name VARCHAR,
  asset_tag VARCHAR,
  category VARCHAR,
  purchase_price DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.name,
    a.asset_tag,
    a.category,
    a.purchase_price
  FROM assets a
  WHERE a.purchase_price >= min_value
    AND NOT EXISTS (
      SELECT 1 FROM asset_insurance_coverage aic
      JOIN insurance_policies ip ON aic.policy_id = ip.id
      WHERE aic.asset_id = a.id
        AND ip.expiration_date > NOW()
        AND ip.status = 'active'
    )
  ORDER BY a.purchase_price DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get expiring policies
CREATE OR REPLACE FUNCTION get_expiring_policies(days_ahead INTEGER DEFAULT 60)
RETURNS TABLE (
  policy_id UUID,
  policy_number VARCHAR,
  provider VARCHAR,
  expiration_date TIMESTAMPTZ,
  days_until_expiry INTEGER,
  coverage_amount DECIMAL,
  covered_asset_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ip.id,
    ip.policy_number,
    ip.provider,
    ip.expiration_date,
    EXTRACT(DAY FROM ip.expiration_date - NOW())::INTEGER,
    ip.coverage_amount,
    COUNT(aic.id)
  FROM insurance_policies ip
  LEFT JOIN asset_insurance_coverage aic ON ip.id = aic.policy_id
  WHERE ip.expiration_date <= NOW() + (days_ahead || ' days')::INTERVAL
    AND ip.expiration_date > NOW()
    AND ip.status = 'active'
  GROUP BY ip.id
  ORDER BY ip.expiration_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update policy status on expiration
CREATE OR REPLACE FUNCTION update_expired_policies()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE insurance_policies
  SET status = 'expired', updated_at = NOW()
  WHERE expiration_date < NOW()
    AND status = 'active';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled check (would be called by cron or Edge Function)
-- This is a placeholder - actual scheduling done via Supabase cron or external scheduler
