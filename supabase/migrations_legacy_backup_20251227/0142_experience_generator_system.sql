-- ============================================================================
-- EXPERIENCE GENERATOR SYSTEM
-- Tables for the AI-powered experience generator lead magnet
-- ============================================================================

-- ============================================================================
-- SHARED BLUEPRINTS TABLE
-- Stores generated blueprints for sharing
-- ============================================================================

CREATE TABLE IF NOT EXISTS shared_blueprints (
  id VARCHAR(36) PRIMARY KEY,
  blueprint_id UUID NOT NULL,
  creative_seed VARCHAR(100) NOT NULL,
  blueprint_data JSONB NOT NULL,
  
  -- Metadata
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  export_count INTEGER DEFAULT 0,
  
  -- Expiration
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- Tracking
  created_by_email VARCHAR(255),
  created_by_user_id UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shared_blueprints_blueprint_id ON shared_blueprints(blueprint_id);
CREATE INDEX IF NOT EXISTS idx_shared_blueprints_creative_seed ON shared_blueprints(creative_seed);
CREATE INDEX IF NOT EXISTS idx_shared_blueprints_expires_at ON shared_blueprints(expires_at);
CREATE INDEX IF NOT EXISTS idx_shared_blueprints_created_at ON shared_blueprints(created_at);

-- ============================================================================
-- GENERATOR LEADS TABLE
-- Captures email addresses from PDF downloads
-- ============================================================================

CREATE TABLE IF NOT EXISTS generator_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Lead info
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  company VARCHAR(255),
  role VARCHAR(100),
  
  -- Blueprint reference
  blueprint_id UUID NOT NULL,
  creative_seed VARCHAR(100) NOT NULL,
  
  -- Consent & preferences
  marketing_consent BOOLEAN DEFAULT FALSE,
  newsletter_consent BOOLEAN DEFAULT FALSE,
  
  -- Source tracking
  source VARCHAR(50) DEFAULT 'generator',
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  utm_content VARCHAR(100),
  utm_term VARCHAR(100),
  referrer TEXT,
  
  -- Device info
  ip_address INET,
  user_agent TEXT,
  device_type VARCHAR(20),
  browser VARCHAR(50),
  os VARCHAR(50),
  
  -- Status
  status VARCHAR(20) DEFAULT 'new',
  converted_at TIMESTAMPTZ,
  converted_user_id UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_generator_leads_email ON generator_leads(email);
CREATE INDEX IF NOT EXISTS idx_generator_leads_blueprint_id ON generator_leads(blueprint_id);
CREATE INDEX IF NOT EXISTS idx_generator_leads_status ON generator_leads(status);
CREATE INDEX IF NOT EXISTS idx_generator_leads_created_at ON generator_leads(created_at);
CREATE INDEX IF NOT EXISTS idx_generator_leads_source ON generator_leads(source);

-- ============================================================================
-- GENERATOR ANALYTICS TABLE
-- Tracks all generator events for analytics
-- ============================================================================

CREATE TABLE IF NOT EXISTS generator_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Event info
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB DEFAULT '{}',
  
  -- Blueprint reference (optional)
  blueprint_id UUID,
  creative_seed VARCHAR(100),
  
  -- User reference (optional)
  user_id UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  session_id VARCHAR(100),
  
  -- Source tracking
  page_url TEXT,
  referrer TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  
  -- Device info
  ip_address INET,
  user_agent TEXT,
  device_type VARCHAR(20),
  browser VARCHAR(50),
  os VARCHAR(50),
  screen_resolution VARCHAR(20),
  
  -- Performance
  duration_ms INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_generator_analytics_event_type ON generator_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_generator_analytics_blueprint_id ON generator_analytics(blueprint_id);
CREATE INDEX IF NOT EXISTS idx_generator_analytics_session_id ON generator_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_generator_analytics_created_at ON generator_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_generator_analytics_user_id ON generator_analytics(user_id);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_generator_analytics_event_date 
  ON generator_analytics(event_type, created_at);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to increment view count on shared blueprints
CREATE OR REPLACE FUNCTION increment_blueprint_view(p_share_id VARCHAR)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE shared_blueprints
  SET view_count = view_count + 1,
      updated_at = NOW()
  WHERE id = p_share_id;
END;
$$;

-- Function to increment download count on shared blueprints
CREATE OR REPLACE FUNCTION increment_blueprint_download(p_share_id VARCHAR)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE shared_blueprints
  SET download_count = download_count + 1,
      updated_at = NOW()
  WHERE id = p_share_id;
END;
$$;

-- Function to increment export count on shared blueprints
CREATE OR REPLACE FUNCTION increment_blueprint_export(p_share_id VARCHAR)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE shared_blueprints
  SET export_count = export_count + 1,
      updated_at = NOW()
  WHERE id = p_share_id;
END;
$$;

-- Function to track generator analytics
CREATE OR REPLACE FUNCTION track_generator_event(
  p_event_type VARCHAR,
  p_event_data JSONB DEFAULT '{}',
  p_blueprint_id UUID DEFAULT NULL,
  p_creative_seed VARCHAR DEFAULT NULL,
  p_session_id VARCHAR DEFAULT NULL,
  p_page_url TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL,
  p_duration_ms INTEGER DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO generator_analytics (
    event_type, event_data, blueprint_id, creative_seed,
    user_id, session_id, page_url, referrer, duration_ms
  ) VALUES (
    p_event_type, p_event_data, p_blueprint_id, p_creative_seed,
    auth.uid(), p_session_id, p_page_url, p_referrer, p_duration_ms
  )
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$;

-- Function to get generator analytics summary
CREATE OR REPLACE FUNCTION get_generator_analytics_summary(
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  event_type VARCHAR,
  event_count BIGINT,
  unique_sessions BIGINT,
  unique_blueprints BIGINT,
  avg_duration_ms NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ga.event_type,
    COUNT(*) as event_count,
    COUNT(DISTINCT ga.session_id) as unique_sessions,
    COUNT(DISTINCT ga.blueprint_id) as unique_blueprints,
    AVG(ga.duration_ms)::NUMERIC as avg_duration_ms
  FROM generator_analytics ga
  WHERE ga.created_at BETWEEN p_start_date AND p_end_date
  GROUP BY ga.event_type
  ORDER BY event_count DESC;
END;
$$;

-- Function to clean up expired shared blueprints
CREATE OR REPLACE FUNCTION cleanup_expired_blueprints()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM shared_blueprints
  WHERE expires_at < NOW()
  RETURNING COUNT(*) INTO v_deleted_count;
  
  RETURN COALESCE(v_deleted_count, 0);
END;
$$;

-- Function to convert lead to user
CREATE OR REPLACE FUNCTION convert_generator_lead(
  p_lead_id UUID,
  p_user_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE generator_leads
  SET status = 'converted',
      converted_at = NOW(),
      converted_user_id = p_user_id,
      updated_at = NOW()
  WHERE id = p_lead_id;
END;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE shared_blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE generator_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE generator_analytics ENABLE ROW LEVEL SECURITY;

-- Shared blueprints: Public read for non-expired, admin manage
CREATE POLICY shared_blueprints_public_read ON shared_blueprints
  FOR SELECT TO anon, authenticated
  USING (expires_at > NOW());

CREATE POLICY shared_blueprints_admin_manage ON shared_blueprints
  FOR ALL TO authenticated
  USING (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'))
  WITH CHECK (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Generator leads: Admin only
CREATE POLICY generator_leads_admin ON generator_leads
  FOR ALL TO authenticated
  USING (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'))
  WITH CHECK (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Generator analytics: Admin read, insert for all
CREATE POLICY generator_analytics_insert ON generator_analytics
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY generator_analytics_admin_read ON generator_analytics
  FOR SELECT TO authenticated
  USING (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamp trigger
CREATE TRIGGER update_shared_blueprints_updated_at
  BEFORE UPDATE ON shared_blueprints
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generator_leads_updated_at
  BEFORE UPDATE ON generator_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE shared_blueprints IS 'Stores generated experience blueprints for sharing via URL';
COMMENT ON TABLE generator_leads IS 'Captures email leads from PDF downloads in the experience generator';
COMMENT ON TABLE generator_analytics IS 'Tracks all events in the experience generator for analytics';

COMMENT ON FUNCTION increment_blueprint_view IS 'Increments view count for a shared blueprint';
COMMENT ON FUNCTION increment_blueprint_download IS 'Increments download count for a shared blueprint';
COMMENT ON FUNCTION increment_blueprint_export IS 'Increments export count for a shared blueprint';
COMMENT ON FUNCTION track_generator_event IS 'Tracks an analytics event in the generator';
COMMENT ON FUNCTION get_generator_analytics_summary IS 'Returns summary analytics for the generator';
COMMENT ON FUNCTION cleanup_expired_blueprints IS 'Removes expired shared blueprints';
COMMENT ON FUNCTION convert_generator_lead IS 'Marks a lead as converted when they sign up';
