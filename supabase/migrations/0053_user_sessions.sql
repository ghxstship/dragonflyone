-- Migration: 0053_user_sessions.sql
-- Description: BACK-102 - Concurrent Session Management
-- Creates user_sessions table for tracking active sessions across devices
-- 3NF Compliant: No transitive dependencies, all attributes depend on primary key
-- SSOT Compliant: Single source for session data, references platform_users via FK

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE session_status AS ENUM ('active', 'expired', 'revoked');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- USER SESSIONS TABLE (3NF Compliant)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_sessions (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Keys (SSOT - references existing tables)
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  
  -- Session Identification
  session_token TEXT NOT NULL UNIQUE,
  refresh_token TEXT UNIQUE,
  
  -- Device Information (normalized - no redundant data)
  device_type TEXT NOT NULL DEFAULT 'unknown', -- desktop, mobile, tablet, unknown
  device_name TEXT, -- e.g., "Chrome on MacOS", "Safari on iPhone"
  browser TEXT, -- e.g., "Chrome 120", "Safari 17"
  os TEXT, -- e.g., "MacOS 14.2", "iOS 17.2"
  
  -- Location Information
  ip_address INET NOT NULL,
  city TEXT,
  region TEXT,
  country TEXT,
  country_code CHAR(2),
  
  -- Session Metadata
  user_agent TEXT,
  is_current BOOLEAN NOT NULL DEFAULT false,
  
  -- Status and Timestamps
  status session_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  revoke_reason TEXT,
  
  -- Constraints
  CONSTRAINT valid_expiry CHECK (expires_at > created_at),
  CONSTRAINT valid_revocation CHECK (
    (status != 'revoked') OR (revoked_at IS NOT NULL)
  )
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_status ON user_sessions(status);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_status ON user_sessions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_active ON user_sessions(last_active_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at) WHERE status = 'active';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_sessions_updated_at ON user_sessions;
CREATE TRIGGER trigger_user_sessions_updated_at
  BEFORE UPDATE ON user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_sessions_updated_at();

-- Auto-expire old sessions
CREATE OR REPLACE FUNCTION expire_old_sessions()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark expired sessions
  UPDATE user_sessions
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'active' AND expires_at < NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions"
  ON user_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own sessions (for marking as current, revoking)
CREATE POLICY "Users can update own sessions"
  ON user_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own sessions
CREATE POLICY "Users can delete own sessions"
  ON user_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Service role can manage all sessions (for system operations)
CREATE POLICY "Service role full access"
  ON user_sessions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Admins can view all sessions in their organization
CREATE POLICY "Admins can view org sessions"
  ON user_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.organization_id = user_sessions.organization_id
      AND pu.platform_role IN ('admin', 'owner')
    )
  );

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON user_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_sessions TO service_role;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to create a new session
CREATE OR REPLACE FUNCTION create_user_session(
  p_user_id UUID,
  p_session_token TEXT,
  p_refresh_token TEXT DEFAULT NULL,
  p_device_type TEXT DEFAULT 'unknown',
  p_device_name TEXT DEFAULT NULL,
  p_browser TEXT DEFAULT NULL,
  p_os TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT '0.0.0.0'::INET,
  p_user_agent TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_region TEXT DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_country_code CHAR(2) DEFAULT NULL,
  p_expires_in INTERVAL DEFAULT INTERVAL '7 days'
)
RETURNS UUID AS $$
DECLARE
  v_session_id UUID;
  v_org_id UUID;
BEGIN
  -- Get user's organization
  SELECT organization_id INTO v_org_id
  FROM platform_users
  WHERE id = p_user_id;

  -- Clear is_current flag from other sessions
  UPDATE user_sessions
  SET is_current = false
  WHERE user_id = p_user_id AND is_current = true;

  -- Insert new session
  INSERT INTO user_sessions (
    user_id,
    organization_id,
    session_token,
    refresh_token,
    device_type,
    device_name,
    browser,
    os,
    ip_address,
    user_agent,
    city,
    region,
    country,
    country_code,
    is_current,
    expires_at
  ) VALUES (
    p_user_id,
    v_org_id,
    p_session_token,
    p_refresh_token,
    p_device_type,
    p_device_name,
    p_browser,
    p_os,
    p_ip_address,
    p_user_agent,
    p_city,
    p_region,
    p_country,
    p_country_code,
    true,
    NOW() + p_expires_in
  )
  RETURNING id INTO v_session_id;

  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to revoke a session
CREATE OR REPLACE FUNCTION revoke_user_session(
  p_session_id UUID,
  p_revoked_by UUID DEFAULT NULL,
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_sessions
  SET 
    status = 'revoked',
    revoked_at = NOW(),
    revoked_by = COALESCE(p_revoked_by, auth.uid()),
    revoke_reason = p_reason
  WHERE id = p_session_id
    AND status = 'active'
    AND (user_id = auth.uid() OR p_revoked_by IS NOT NULL);

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to revoke all sessions except current
CREATE OR REPLACE FUNCTION revoke_all_other_sessions(
  p_current_session_id UUID,
  p_user_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE user_sessions
  SET 
    status = 'revoked',
    revoked_at = NOW(),
    revoked_by = COALESCE(p_user_id, auth.uid()),
    revoke_reason = 'Signed out from all other devices'
  WHERE user_id = COALESCE(p_user_id, auth.uid())
    AND id != p_current_session_id
    AND status = 'active';

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update session activity
CREATE OR REPLACE FUNCTION touch_user_session(
  p_session_token TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_sessions
  SET last_active_at = NOW()
  WHERE session_token = p_session_token
    AND status = 'active'
    AND expires_at > NOW();

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get active session count for a user
CREATE OR REPLACE FUNCTION get_active_session_count(
  p_user_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM user_sessions
    WHERE user_id = COALESCE(p_user_id, auth.uid())
      AND status = 'active'
      AND expires_at > NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION create_user_session TO authenticated;
GRANT EXECUTE ON FUNCTION revoke_user_session TO authenticated;
GRANT EXECUTE ON FUNCTION revoke_all_other_sessions TO authenticated;
GRANT EXECUTE ON FUNCTION touch_user_session TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_session_count TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE user_sessions IS 'Tracks user sessions across devices for concurrent session management (BACK-102)';
COMMENT ON COLUMN user_sessions.session_token IS 'Unique token identifying this session';
COMMENT ON COLUMN user_sessions.device_type IS 'Type of device: desktop, mobile, tablet, unknown';
COMMENT ON COLUMN user_sessions.is_current IS 'Whether this is the user''s current active session';
COMMENT ON COLUMN user_sessions.last_active_at IS 'Last time this session was used';
COMMENT ON COLUMN user_sessions.revoked_by IS 'User who revoked this session (self or admin)';
