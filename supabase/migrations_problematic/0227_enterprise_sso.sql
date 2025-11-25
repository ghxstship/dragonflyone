-- Migration: Enterprise SSO Configuration
-- Description: SAML and OIDC SSO support for enterprise customers

-- SSO providers configuration
CREATE TABLE IF NOT EXISTS sso_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider_type VARCHAR(20) NOT NULL CHECK (provider_type IN ('saml', 'oidc')),
  name VARCHAR(255) NOT NULL,
  is_enabled BOOLEAN DEFAULT FALSE,
  is_default BOOLEAN DEFAULT FALSE,
  
  -- SAML configuration
  saml_entity_id TEXT,
  saml_sso_url TEXT,
  saml_slo_url TEXT,
  saml_certificate TEXT,
  saml_signature_algorithm VARCHAR(50) DEFAULT 'sha256',
  saml_name_id_format VARCHAR(100) DEFAULT 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
  
  -- OIDC configuration
  oidc_issuer TEXT,
  oidc_client_id TEXT,
  oidc_client_secret_encrypted TEXT,
  oidc_authorization_endpoint TEXT,
  oidc_token_endpoint TEXT,
  oidc_userinfo_endpoint TEXT,
  oidc_jwks_uri TEXT,
  oidc_scopes JSONB DEFAULT '["openid", "email", "profile"]',
  
  -- Attribute mapping
  attribute_mapping JSONB DEFAULT '{
    "email": "email",
    "firstName": "given_name",
    "lastName": "family_name",
    "groups": "groups"
  }',
  
  -- Role mapping
  role_mapping JSONB DEFAULT '{}',
  default_role VARCHAR(100) DEFAULT 'ATLVS_VIEWER',
  
  -- Settings
  auto_provision_users BOOLEAN DEFAULT TRUE,
  auto_update_user_info BOOLEAN DEFAULT TRUE,
  require_sso BOOLEAN DEFAULT FALSE,
  allowed_domains JSONB DEFAULT '[]',
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id)
);

-- SSO sessions
CREATE TABLE IF NOT EXISTS sso_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES sso_providers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES platform_users(id) ON DELETE CASCADE,
  session_index VARCHAR(255),
  name_id VARCHAR(255),
  attributes JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SSO authentication requests (for SAML state tracking)
CREATE TABLE IF NOT EXISTS sso_auth_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES sso_providers(id) ON DELETE CASCADE,
  request_id VARCHAR(255) NOT NULL UNIQUE,
  relay_state TEXT,
  redirect_uri TEXT,
  state VARCHAR(255),
  nonce VARCHAR(255),
  code_verifier VARCHAR(255),
  expires_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SSO audit log
CREATE TABLE IF NOT EXISTS sso_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES sso_providers(id) ON DELETE SET NULL,
  user_id UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
    'login_initiated', 'login_success', 'login_failed',
    'logout_initiated', 'logout_success', 'logout_failed',
    'user_provisioned', 'user_updated', 'user_deprovisioned',
    'config_updated', 'provider_enabled', 'provider_disabled'
  )),
  event_details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Domain verification for SSO
CREATE TABLE IF NOT EXISTS sso_domain_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  domain VARCHAR(255) NOT NULL,
  verification_method VARCHAR(50) NOT NULL CHECK (verification_method IN ('dns_txt', 'dns_cname', 'meta_tag', 'file')),
  verification_token VARCHAR(255) NOT NULL,
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, domain)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sso_providers_org ON sso_providers(organization_id);
CREATE INDEX IF NOT EXISTS idx_sso_providers_enabled ON sso_providers(is_enabled);
CREATE INDEX IF NOT EXISTS idx_sso_sessions_provider ON sso_sessions(provider_id);
CREATE INDEX IF NOT EXISTS idx_sso_sessions_user ON sso_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sso_auth_requests_request ON sso_auth_requests(request_id);
CREATE INDEX IF NOT EXISTS idx_sso_auth_requests_expires ON sso_auth_requests(expires_at);
CREATE INDEX IF NOT EXISTS idx_sso_audit_log_provider ON sso_audit_log(provider_id);
CREATE INDEX IF NOT EXISTS idx_sso_audit_log_user ON sso_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_sso_audit_log_created ON sso_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_sso_domain_verifications_org ON sso_domain_verifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_sso_domain_verifications_domain ON sso_domain_verifications(domain);

-- RLS Policies
ALTER TABLE sso_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_auth_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_domain_verifications ENABLE ROW LEVEL SECURITY;

-- SSO providers - org admins can manage
CREATE POLICY "sso_providers_select" ON sso_providers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND (
        pu.organization_id = sso_providers.organization_id
        OR pu.platform_roles && ARRAY['LEGEND_SUPER_ADMIN']::text[]
      )
    )
  );

CREATE POLICY "sso_providers_manage" ON sso_providers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND (
        (pu.organization_id = sso_providers.organization_id AND pu.platform_roles && ARRAY['ATLVS_ADMIN']::text[])
        OR pu.platform_roles && ARRAY['LEGEND_SUPER_ADMIN']::text[]
      )
    )
  );

-- SSO sessions - users can see their own
CREATE POLICY "sso_sessions_select" ON sso_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "sso_sessions_insert" ON sso_sessions
  FOR INSERT WITH CHECK (true);

-- Auth requests - system only
CREATE POLICY "sso_auth_requests_insert" ON sso_auth_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "sso_auth_requests_select" ON sso_auth_requests
  FOR SELECT USING (true);

-- Audit log - org admins can view
CREATE POLICY "sso_audit_log_select" ON sso_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

CREATE POLICY "sso_audit_log_insert" ON sso_audit_log
  FOR INSERT WITH CHECK (true);

-- Domain verifications - org admins can manage
CREATE POLICY "sso_domain_verifications_select" ON sso_domain_verifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND (
        pu.organization_id = sso_domain_verifications.organization_id
        OR pu.platform_roles && ARRAY['LEGEND_SUPER_ADMIN']::text[]
      )
    )
  );

CREATE POLICY "sso_domain_verifications_manage" ON sso_domain_verifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND (
        (pu.organization_id = sso_domain_verifications.organization_id AND pu.platform_roles && ARRAY['ATLVS_ADMIN']::text[])
        OR pu.platform_roles && ARRAY['LEGEND_SUPER_ADMIN']::text[]
      )
    )
  );

-- Function to log SSO events
CREATE OR REPLACE FUNCTION log_sso_event(
  p_provider_id UUID,
  p_user_id UUID,
  p_event_type VARCHAR,
  p_event_details JSONB DEFAULT '{}',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO sso_audit_log (
    provider_id, user_id, event_type, event_details, ip_address, user_agent
  ) VALUES (
    p_provider_id, p_user_id, p_event_type, p_event_details, p_ip_address, p_user_agent
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- Function to find SSO provider by email domain
CREATE OR REPLACE FUNCTION find_sso_provider_by_email(p_email VARCHAR)
RETURNS UUID AS $$
DECLARE
  v_domain VARCHAR;
  v_provider_id UUID;
BEGIN
  -- Extract domain from email
  v_domain := split_part(p_email, '@', 2);
  
  -- Find provider with matching domain
  SELECT sp.id INTO v_provider_id
  FROM sso_providers sp
  JOIN sso_domain_verifications sdv ON sdv.organization_id = sp.organization_id
  WHERE sdv.domain = v_domain
  AND sdv.verified_at IS NOT NULL
  AND sp.is_enabled = TRUE
  LIMIT 1;
  
  RETURN v_provider_id;
END;
$$ LANGUAGE plpgsql;
