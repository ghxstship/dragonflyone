-- Migration: User Invitations System
-- Description: Manage user invitations for signup flow

-- User invitations table
CREATE TABLE IF NOT EXISTS user_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  invite_code VARCHAR(64) NOT NULL UNIQUE,
  role VARCHAR(100) DEFAULT 'ATLVS_VIEWER',
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  invited_by UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  message TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  used_by UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Audit logs table for tracking user actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session tracking for security
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  session_token_hash VARCHAR(255) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  device_info JSONB DEFAULT '{}',
  location JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Login attempts tracking for security
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  failure_reason VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MFA settings
CREATE TABLE IF NOT EXISTS user_mfa_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE UNIQUE,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  mfa_type VARCHAR(50) CHECK (mfa_type IN ('totp', 'sms', 'email')),
  totp_secret_encrypted TEXT,
  backup_codes_encrypted TEXT,
  phone_number VARCHAR(50),
  last_mfa_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API keys for programmatic access
CREATE TABLE IF NOT EXISTS user_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  key_hash VARCHAR(255) NOT NULL UNIQUE,
  key_prefix VARCHAR(20) NOT NULL,
  scopes JSONB DEFAULT '["read"]',
  rate_limit_per_minute INTEGER DEFAULT 60,
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_invitations_email ON user_invitations(email);
CREATE INDEX IF NOT EXISTS idx_user_invitations_code ON user_invitations(invite_code);
CREATE INDEX IF NOT EXISTS idx_user_invitations_org ON user_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_invitations_expires ON user_invitations(expires_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_created ON login_attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_api_keys_user ON user_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_api_keys_hash ON user_api_keys(key_hash);

-- RLS Policies
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mfa_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;

-- User invitations policies
CREATE POLICY "invitations_select" ON user_invitations
  FOR SELECT USING (
    invited_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

CREATE POLICY "invitations_insert" ON user_invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'COMPVSS_ADMIN', 'GVTEWAY_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

-- Audit logs policies (admin read, system write)
CREATE POLICY "audit_logs_select" ON audit_logs
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

CREATE POLICY "audit_logs_insert" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- User sessions policies
CREATE POLICY "sessions_select" ON user_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "sessions_manage" ON user_sessions
  FOR ALL USING (user_id = auth.uid());

-- Login attempts (admin only)
CREATE POLICY "login_attempts_select" ON login_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

CREATE POLICY "login_attempts_insert" ON login_attempts
  FOR INSERT WITH CHECK (true);

-- Password reset tokens
CREATE POLICY "reset_tokens_select" ON password_reset_tokens
  FOR SELECT USING (user_id = auth.uid());

-- MFA settings
CREATE POLICY "mfa_settings_select" ON user_mfa_settings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "mfa_settings_manage" ON user_mfa_settings
  FOR ALL USING (user_id = auth.uid());

-- API keys
CREATE POLICY "api_keys_select" ON user_api_keys
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "api_keys_manage" ON user_api_keys
  FOR ALL USING (user_id = auth.uid());

-- Function to clean up expired invitations
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS void AS $$
BEGIN
  DELETE FROM user_invitations
  WHERE expires_at < NOW() - INTERVAL '30 days'
  AND used_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old audit logs
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM audit_logs
  WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- Function to detect suspicious login patterns
CREATE OR REPLACE FUNCTION check_suspicious_logins(p_email VARCHAR, p_window_hours INTEGER DEFAULT 1)
RETURNS TABLE(
  failed_attempts INTEGER,
  unique_ips INTEGER,
  is_suspicious BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) FILTER (WHERE NOT success)::INTEGER as failed_attempts,
    COUNT(DISTINCT ip_address)::INTEGER as unique_ips,
    (COUNT(*) FILTER (WHERE NOT success) > 5 OR COUNT(DISTINCT ip_address) > 3) as is_suspicious
  FROM login_attempts
  WHERE email = p_email
  AND created_at > NOW() - (p_window_hours || ' hours')::INTERVAL;
END;
$$ LANGUAGE plpgsql;
