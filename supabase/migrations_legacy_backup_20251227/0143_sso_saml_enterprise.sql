-- ============================================================================
-- SSO/SAML ENTERPRISE AUTHENTICATION SYSTEM
-- Enables Single Sign-On for enterprise customers
-- ============================================================================

-- ============================================================================
-- ORGANIZATION SSO CONFIGURATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS organization_sso_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Provider configuration
  provider_type VARCHAR(50) NOT NULL CHECK (provider_type IN ('saml', 'oidc', 'azure', 'okta', 'google-workspace')),
  display_name VARCHAR(255) NOT NULL,
  identifier VARCHAR(255) NOT NULL, -- Domain or entity ID
  
  -- Status
  enabled BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  
  -- Configuration metadata (encrypted in production)
  metadata JSONB DEFAULT '{}',
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  
  -- Ensure one SSO config per organization
  CONSTRAINT unique_org_sso UNIQUE (organization_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_org_sso_org_id ON organization_sso_configs(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_sso_identifier ON organization_sso_configs(identifier);
CREATE INDEX IF NOT EXISTS idx_org_sso_enabled ON organization_sso_configs(enabled) WHERE enabled = true;

-- ============================================================================
-- SSO DOMAIN MAPPINGS TABLE
-- Maps email domains to SSO configurations
-- ============================================================================

CREATE TABLE IF NOT EXISTS sso_domain_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sso_config_id UUID NOT NULL REFERENCES organization_sso_configs(id) ON DELETE CASCADE,
  domain VARCHAR(255) NOT NULL,
  
  -- Verification
  verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(255),
  verification_method VARCHAR(50) CHECK (verification_method IN ('dns', 'email', 'manual')),
  verified_at TIMESTAMPTZ,
  
  -- Status
  enabled BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique domain mapping
  CONSTRAINT unique_domain UNIQUE (domain)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sso_domain_config ON sso_domain_mappings(sso_config_id);
CREATE INDEX IF NOT EXISTS idx_sso_domain_domain ON sso_domain_mappings(domain);
CREATE INDEX IF NOT EXISTS idx_sso_domain_verified ON sso_domain_mappings(verified) WHERE verified = true;

-- ============================================================================
-- SSO SESSIONS TABLE
-- Tracks SSO sessions for audit and management
-- ============================================================================

CREATE TABLE IF NOT EXISTS sso_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  sso_config_id UUID NOT NULL REFERENCES organization_sso_configs(id) ON DELETE CASCADE,
  
  -- Session info
  provider_session_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES platform_users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sso_sessions_user ON sso_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sso_sessions_config ON sso_sessions(sso_config_id);
CREATE INDEX IF NOT EXISTS idx_sso_sessions_status ON sso_sessions(status);
CREATE INDEX IF NOT EXISTS idx_sso_sessions_expires ON sso_sessions(expires_at);

-- ============================================================================
-- SSO AUDIT LOG TABLE
-- Tracks all SSO-related events for compliance
-- ============================================================================

CREATE TABLE IF NOT EXISTS sso_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  sso_config_id UUID REFERENCES organization_sso_configs(id) ON DELETE SET NULL,
  user_id UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  
  -- Event info
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
    'config_created', 'config_updated', 'config_enabled', 'config_disabled',
    'domain_added', 'domain_verified', 'domain_removed',
    'login_initiated', 'login_success', 'login_failed',
    'logout', 'session_expired', 'session_revoked',
    'user_provisioned', 'user_deprovisioned'
  )),
  event_data JSONB DEFAULT '{}',
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sso_audit_org ON sso_audit_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_sso_audit_config ON sso_audit_log(sso_config_id);
CREATE INDEX IF NOT EXISTS idx_sso_audit_user ON sso_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_sso_audit_event ON sso_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_sso_audit_created ON sso_audit_log(created_at);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to check if email domain has SSO
CREATE OR REPLACE FUNCTION check_email_domain_sso(p_email VARCHAR)
RETURNS TABLE (
  has_sso BOOLEAN,
  sso_config_id UUID,
  provider_type VARCHAR,
  display_name VARCHAR,
  organization_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_domain VARCHAR;
BEGIN
  -- Extract domain from email
  v_domain := split_part(p_email, '@', 2);
  
  RETURN QUERY
  SELECT 
    true as has_sso,
    osc.id as sso_config_id,
    osc.provider_type,
    osc.display_name,
    osc.organization_id
  FROM organization_sso_configs osc
  JOIN sso_domain_mappings sdm ON sdm.sso_config_id = osc.id
  WHERE sdm.domain = v_domain
    AND sdm.enabled = true
    AND sdm.verified = true
    AND osc.enabled = true;
END;
$$;

-- Function to log SSO event
CREATE OR REPLACE FUNCTION log_sso_event(
  p_organization_id UUID,
  p_sso_config_id UUID,
  p_user_id UUID,
  p_event_type VARCHAR,
  p_event_data JSONB DEFAULT '{}',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO sso_audit_log (
    organization_id, sso_config_id, user_id,
    event_type, event_data, ip_address, user_agent
  ) VALUES (
    p_organization_id, p_sso_config_id, p_user_id,
    p_event_type, p_event_data, p_ip_address, p_user_agent
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Function to revoke all SSO sessions for a user
CREATE OR REPLACE FUNCTION revoke_user_sso_sessions(
  p_user_id UUID,
  p_revoked_by UUID DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE sso_sessions
  SET status = 'revoked',
      revoked_at = NOW(),
      revoked_by = p_revoked_by
  WHERE user_id = p_user_id
    AND status = 'active';
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Function to cleanup expired SSO sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sso_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE sso_sessions
  SET status = 'expired'
  WHERE status = 'active'
    AND expires_at < NOW();
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE organization_sso_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_domain_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_audit_log ENABLE ROW LEVEL SECURITY;

-- SSO configs: Org admins can manage
CREATE POLICY sso_configs_org_admin ON organization_sso_configs
  FOR ALL TO authenticated
  USING (
    organization_id IN (
      SELECT pu.organization_id FROM platform_users pu
      JOIN user_roles ur ON ur.platform_user_id = pu.id
      WHERE pu.id = auth.uid() 
      AND ur.role_code IN ('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT pu.organization_id FROM platform_users pu
      JOIN user_roles ur ON ur.platform_user_id = pu.id
      WHERE pu.id = auth.uid() 
      AND ur.role_code IN ('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
    )
  );

-- Domain mappings: Same as SSO configs
CREATE POLICY sso_domains_org_admin ON sso_domain_mappings
  FOR ALL TO authenticated
  USING (
    sso_config_id IN (
      SELECT id FROM organization_sso_configs 
      WHERE organization_id IN (
        SELECT pu.organization_id FROM platform_users pu
        JOIN user_roles ur ON ur.platform_user_id = pu.id
        WHERE pu.id = auth.uid() 
        AND ur.role_code IN ('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
      )
    )
  );

-- SSO sessions: Users can see their own, admins can see all in org
CREATE POLICY sso_sessions_user ON sso_sessions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY sso_sessions_admin ON sso_sessions
  FOR ALL TO authenticated
  USING (
    sso_config_id IN (
      SELECT id FROM organization_sso_configs 
      WHERE organization_id IN (
        SELECT pu.organization_id FROM platform_users pu
        JOIN user_roles ur ON ur.platform_user_id = pu.id
        WHERE pu.id = auth.uid() 
        AND ur.role_code IN ('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
      )
    )
  );

-- Audit log: Org admins can view
CREATE POLICY sso_audit_org_admin ON sso_audit_log
  FOR SELECT TO authenticated
  USING (
    organization_id IN (
      SELECT pu.organization_id FROM platform_users pu
      JOIN user_roles ur ON ur.platform_user_id = pu.id
      WHERE pu.id = auth.uid() 
      AND ur.role_code IN ('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
    )
  );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamp trigger
CREATE TRIGGER update_org_sso_configs_updated_at
  BEFORE UPDATE ON organization_sso_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sso_domain_mappings_updated_at
  BEFORE UPDATE ON sso_domain_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE organization_sso_configs IS 'SSO/SAML configurations for enterprise organizations';
COMMENT ON TABLE sso_domain_mappings IS 'Maps email domains to SSO configurations';
COMMENT ON TABLE sso_sessions IS 'Tracks active SSO sessions for audit and management';
COMMENT ON TABLE sso_audit_log IS 'Audit log for all SSO-related events';

COMMENT ON FUNCTION check_email_domain_sso IS 'Checks if an email domain has SSO configured';
COMMENT ON FUNCTION log_sso_event IS 'Logs an SSO event for audit purposes';
COMMENT ON FUNCTION revoke_user_sso_sessions IS 'Revokes all active SSO sessions for a user';
COMMENT ON FUNCTION cleanup_expired_sso_sessions IS 'Marks expired SSO sessions as expired';
