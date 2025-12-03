-- Migration: Lost & Found, API Keys, and Metrics Systems
-- Description: Remaining operational systems from ExperienceGeneratorSchema

-- ============================================================================
-- LOST & FOUND SYSTEM
-- ============================================================================

-- Add lost found category enum
DO $$ BEGIN
  CREATE TYPE lost_found_category_enum AS ENUM (
    'electronics', 'clothing', 'wallet_id', 'keys', 'jewelry', 
    'bag', 'glasses', 'medication', 'phone', 'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add lost found status enum
DO $$ BEGIN
  CREATE TYPE lost_found_status_enum AS ENUM (
    'stored', 'claimed', 'donated', 'disposed', 'transferred'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Lost & Found Items table
CREATE TABLE IF NOT EXISTS lost_found_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  production_id UUID REFERENCES productions(id) ON DELETE CASCADE,
  show_id UUID REFERENCES shows(id),
  event_id UUID REFERENCES events(id),
  item_number VARCHAR(50) UNIQUE,
  
  -- Item Details
  description TEXT NOT NULL,
  category lost_found_category_enum,
  brand TEXT,
  color TEXT,
  distinguishing_features TEXT,
  estimated_value NUMERIC(10,2),
  
  -- Found
  found_at TIMESTAMPTZ NOT NULL,
  found_zone_id UUID REFERENCES zones(id),
  found_location TEXT,
  found_by_id UUID REFERENCES platform_users(id),
  found_by_name TEXT,
  
  -- Storage
  storage_location VARCHAR(255),
  storage_bin TEXT,
  status lost_found_status_enum DEFAULT 'stored',
  
  -- Claim
  owner_name VARCHAR(255),
  owner_phone TEXT,
  owner_email TEXT,
  owner_address TEXT,
  id_verified BOOLEAN DEFAULT false,
  id_type TEXT,
  id_number TEXT,
  claimed_at TIMESTAMPTZ,
  returned_by_id UUID REFERENCES platform_users(id),
  owner_signature_url TEXT,
  
  -- Disposal
  disposed_at TIMESTAMPTZ,
  disposal_method VARCHAR(100),
  disposal_notes TEXT,
  donated_to TEXT,
  
  -- Photos
  photos TEXT[] DEFAULT '{}',
  
  -- Meta
  notes TEXT,
  internal_notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lost & Found Claims table
CREATE TABLE IF NOT EXISTS lost_found_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES lost_found_items(id) ON DELETE CASCADE,
  claimant_name TEXT NOT NULL,
  claimant_phone TEXT,
  claimant_email TEXT,
  claim_description TEXT,
  proof_of_ownership TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'completed')),
  verified_by_id UUID REFERENCES platform_users(id),
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Lost & Found
CREATE INDEX IF NOT EXISTS idx_lost_found_items_org ON lost_found_items(organization_id);
CREATE INDEX IF NOT EXISTS idx_lost_found_items_production ON lost_found_items(production_id);
CREATE INDEX IF NOT EXISTS idx_lost_found_items_status ON lost_found_items(status);
CREATE INDEX IF NOT EXISTS idx_lost_found_items_category ON lost_found_items(category);
CREATE INDEX IF NOT EXISTS idx_lost_found_items_found_at ON lost_found_items(found_at);
CREATE INDEX IF NOT EXISTS idx_lost_found_claims_item ON lost_found_claims(item_id);

-- ============================================================================
-- API KEY MANAGEMENT ENHANCEMENTS
-- ============================================================================
-- Note: api_keys table already exists from 0041_integration_systems.sql
-- Adding organization-level support and additional fields

-- Add new columns to existing api_keys table
ALTER TABLE api_keys
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS permissions TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS rate_limit_window_seconds INTEGER DEFAULT 3600,
  ADD COLUMN IF NOT EXISTS allowed_ips INET[],
  ADD COLUMN IF NOT EXISTS allowed_origins TEXT[],
  ADD COLUMN IF NOT EXISTS allowed_endpoints TEXT[],
  ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_by_id UUID REFERENCES platform_users(id),
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- API Key Usage Logs table (enhanced version of api_key_usage)
CREATE TABLE IF NOT EXISTS api_key_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INTEGER,
  response_time_ms INTEGER,
  ip_address INET,
  user_agent TEXT,
  request_id UUID,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for API Keys enhancements
CREATE INDEX IF NOT EXISTS idx_api_keys_org ON api_keys(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_api_key_usage_logs_key ON api_key_usage_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_key_usage_logs_created ON api_key_usage_logs(created_at);

-- ============================================================================
-- METRICS SYSTEM
-- ============================================================================

-- Add granularity enum
DO $$ BEGIN
  CREATE TYPE metrics_granularity_enum AS ENUM (
    'minute', 'hour', 'day', 'week', 'month', 'quarter', 'year'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Metrics table
CREATE TABLE IF NOT EXISTS production_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  production_id UUID REFERENCES productions(id),
  
  -- Metric identification
  metric_type VARCHAR(100) NOT NULL,
  metric_name VARCHAR(100) NOT NULL,
  
  -- Value
  value NUMERIC(15,4) NOT NULL,
  unit VARCHAR(50),
  
  -- Dimensions
  dimensions JSONB DEFAULT '{}',
  tags TEXT[],
  
  -- Time
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  granularity metrics_granularity_enum,
  
  -- Source
  source VARCHAR(100),
  
  -- Meta
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Metric Definitions table
CREATE TABLE IF NOT EXISTS metric_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  unit VARCHAR(50),
  aggregation_type VARCHAR(20) CHECK (aggregation_type IN ('sum', 'avg', 'min', 'max', 'count', 'last')),
  is_calculated BOOLEAN DEFAULT false,
  calculation_formula TEXT,
  thresholds JSONB,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, code)
);

-- Indexes for Metrics
CREATE INDEX IF NOT EXISTS idx_production_metrics_org ON production_metrics(organization_id);
CREATE INDEX IF NOT EXISTS idx_production_metrics_production ON production_metrics(production_id);
CREATE INDEX IF NOT EXISTS idx_production_metrics_type ON production_metrics(metric_type, metric_name);
CREATE INDEX IF NOT EXISTS idx_production_metrics_period ON production_metrics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_production_metrics_granularity ON production_metrics(granularity);
CREATE INDEX IF NOT EXISTS idx_metric_definitions_org ON metric_definitions(organization_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to generate lost item number
CREATE OR REPLACE FUNCTION generate_lost_item_number(p_org_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_year TEXT;
  v_sequence INTEGER;
BEGIN
  v_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  SELECT COALESCE(MAX(
    CASE WHEN item_number ~ ('^LF-' || v_year || '-[0-9]+$')
    THEN CAST(SUBSTRING(item_number FROM '[0-9]+$') AS INTEGER) ELSE 0 END
  ), 0) + 1 INTO v_sequence
  FROM lost_found_items 
  WHERE organization_id = p_org_id 
    AND item_number LIKE 'LF-' || v_year || '-%';
  
  RETURN 'LF-' || v_year || '-' || LPAD(v_sequence::TEXT, 5, '0');
END;
$$;

-- Function to validate API key
CREATE OR REPLACE FUNCTION validate_api_key(p_key_hash VARCHAR(255))
RETURNS TABLE (
  api_key_id UUID,
  organization_id UUID,
  is_valid BOOLEAN,
  permissions TEXT[],
  rate_limit INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_key RECORD;
BEGIN
  SELECT * INTO v_key
  FROM api_keys
  WHERE key_hash = p_key_hash
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW());
  
  IF v_key IS NULL THEN
    RETURN QUERY SELECT NULL::UUID, NULL::UUID, false, '{}'::TEXT[], 0;
    RETURN;
  END IF;
  
  -- Update usage
  UPDATE api_keys
  SET last_used_at = NOW(), usage_count = usage_count + 1
  WHERE id = v_key.id;
  
  RETURN QUERY SELECT v_key.id, v_key.organization_id, true, v_key.permissions, v_key.rate_limit;
END;
$$;

-- Function to record metric
CREATE OR REPLACE FUNCTION record_metric(
  p_org_id UUID,
  p_production_id UUID,
  p_metric_type VARCHAR(100),
  p_metric_name VARCHAR(100),
  p_value NUMERIC,
  p_unit VARCHAR(50) DEFAULT NULL,
  p_dimensions JSONB DEFAULT '{}',
  p_granularity metrics_granularity_enum DEFAULT 'day'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_metric_id UUID;
  v_period_start TIMESTAMPTZ;
  v_period_end TIMESTAMPTZ;
BEGIN
  -- Calculate period based on granularity
  CASE p_granularity
    WHEN 'minute' THEN
      v_period_start := date_trunc('minute', NOW());
      v_period_end := v_period_start + INTERVAL '1 minute';
    WHEN 'hour' THEN
      v_period_start := date_trunc('hour', NOW());
      v_period_end := v_period_start + INTERVAL '1 hour';
    WHEN 'day' THEN
      v_period_start := date_trunc('day', NOW());
      v_period_end := v_period_start + INTERVAL '1 day';
    WHEN 'week' THEN
      v_period_start := date_trunc('week', NOW());
      v_period_end := v_period_start + INTERVAL '1 week';
    WHEN 'month' THEN
      v_period_start := date_trunc('month', NOW());
      v_period_end := v_period_start + INTERVAL '1 month';
    ELSE
      v_period_start := date_trunc('day', NOW());
      v_period_end := v_period_start + INTERVAL '1 day';
  END CASE;
  
  INSERT INTO production_metrics (
    organization_id, production_id, metric_type, metric_name,
    value, unit, dimensions, period_start, period_end, granularity
  ) VALUES (
    p_org_id, p_production_id, p_metric_type, p_metric_name,
    p_value, p_unit, p_dimensions, v_period_start, v_period_end, p_granularity
  ) RETURNING id INTO v_metric_id;
  
  RETURN v_metric_id;
END;
$$;

-- Function to get metrics summary
CREATE OR REPLACE FUNCTION get_metrics_summary(
  p_production_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  metric_type VARCHAR(100),
  metric_name VARCHAR(100),
  total_value NUMERIC,
  avg_value NUMERIC,
  min_value NUMERIC,
  max_value NUMERIC,
  data_points INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pm.metric_type,
    pm.metric_name,
    SUM(pm.value) AS total_value,
    AVG(pm.value) AS avg_value,
    MIN(pm.value) AS min_value,
    MAX(pm.value) AS max_value,
    COUNT(*)::INTEGER AS data_points
  FROM production_metrics pm
  WHERE pm.production_id = p_production_id
    AND pm.period_start::DATE >= p_start_date
    AND pm.period_end::DATE <= p_end_date
  GROUP BY pm.metric_type, pm.metric_name
  ORDER BY pm.metric_type, pm.metric_name;
END;
$$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_misc_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS lost_found_items_updated_at ON lost_found_items;
CREATE TRIGGER lost_found_items_updated_at
  BEFORE UPDATE ON lost_found_items
  FOR EACH ROW EXECUTE FUNCTION update_misc_timestamp();

DROP TRIGGER IF EXISTS api_keys_updated_at ON api_keys;
CREATE TRIGGER api_keys_updated_at
  BEFORE UPDATE ON api_keys
  FOR EACH ROW EXECUTE FUNCTION update_misc_timestamp();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE lost_found_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_found_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_key_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE metric_definitions ENABLE ROW LEVEL SECURITY;

-- Lost & Found policies
CREATE POLICY lost_found_items_select ON lost_found_items
  FOR SELECT TO authenticated
  USING (org_matches(organization_id));

CREATE POLICY lost_found_items_manage ON lost_found_items
  FOR ALL TO authenticated
  USING (role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN'))
  WITH CHECK (role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN'));

CREATE POLICY lost_found_claims_select ON lost_found_claims
  FOR SELECT TO authenticated
  USING (item_id IN (SELECT id FROM lost_found_items WHERE org_matches(organization_id)));

CREATE POLICY lost_found_claims_manage ON lost_found_claims
  FOR ALL TO authenticated
  USING (role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'))
  WITH CHECK (role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- API Keys policies (enhanced - drop existing if any)
DROP POLICY IF EXISTS api_keys_select ON api_keys;
DROP POLICY IF EXISTS api_keys_manage ON api_keys;
DROP POLICY IF EXISTS "Users can view their own API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can manage their own API keys" ON api_keys;

CREATE POLICY api_keys_select ON api_keys
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() 
    OR (organization_id IS NOT NULL AND org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'))
  );

CREATE POLICY api_keys_manage ON api_keys
  FOR ALL TO authenticated
  USING (
    user_id = auth.uid() 
    OR role_in('ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  )
  WITH CHECK (
    user_id = auth.uid() 
    OR role_in('ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

CREATE POLICY api_key_usage_logs_select ON api_key_usage_logs
  FOR SELECT TO authenticated
  USING (api_key_id IN (SELECT id FROM api_keys WHERE user_id = auth.uid() OR (organization_id IS NOT NULL AND org_matches(organization_id))));

-- Metrics policies
CREATE POLICY production_metrics_select ON production_metrics
  FOR SELECT TO authenticated
  USING (org_matches(organization_id));

CREATE POLICY production_metrics_insert ON production_metrics
  FOR INSERT TO authenticated
  WITH CHECK (org_matches(organization_id));

CREATE POLICY metric_definitions_select ON metric_definitions
  FOR SELECT TO authenticated
  USING (organization_id IS NULL OR org_matches(organization_id));

CREATE POLICY metric_definitions_manage ON metric_definitions
  FOR ALL TO authenticated
  USING (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'))
  WITH CHECK (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE ON lost_found_items TO authenticated;
GRANT SELECT, INSERT, UPDATE ON lost_found_claims TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON api_keys TO authenticated;
GRANT SELECT, INSERT ON api_key_usage_logs TO authenticated;
GRANT SELECT, INSERT ON production_metrics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON metric_definitions TO authenticated;

GRANT EXECUTE ON FUNCTION generate_lost_item_number(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_api_key(VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION record_metric(UUID, UUID, VARCHAR, VARCHAR, NUMERIC, VARCHAR, JSONB, metrics_granularity_enum) TO authenticated;
GRANT EXECUTE ON FUNCTION get_metrics_summary(UUID, DATE, DATE) TO authenticated;
