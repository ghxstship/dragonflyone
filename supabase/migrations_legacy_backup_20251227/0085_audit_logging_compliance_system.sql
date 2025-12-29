-- Migration: Audit Logging & Compliance System
-- Description: Tables for audit trails, compliance tracking, and data retention

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES platform_users(id),
  session_id TEXT,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  resource_name TEXT,
  old_values JSONB,
  new_values JSONB,
  changes JSONB,
  ip_address TEXT,
  user_agent TEXT,
  request_id TEXT,
  request_method TEXT,
  request_path TEXT,
  response_status INT,
  duration_ms INT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip ON audit_logs(ip_address);

-- Security events table
CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES platform_users(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('login_success', 'login_failure', 'logout', 'password_change', 'password_reset', 'mfa_enabled', 'mfa_disabled', 'api_key_created', 'api_key_revoked', 'suspicious_activity', 'account_locked', 'account_unlocked', 'permission_change', 'data_export', 'data_deletion')),
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  description TEXT,
  ip_address TEXT,
  user_agent TEXT,
  location JSONB,
  device_info JSONB,
  risk_score INT,
  blocked BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_events_user ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_created ON security_events(created_at);

-- Data retention policies table
CREATE TABLE IF NOT EXISTS data_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  table_name TEXT NOT NULL,
  retention_days INT NOT NULL,
  archive_before_delete BOOLEAN DEFAULT true,
  archive_location TEXT,
  filter_conditions JSONB,
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  records_deleted INT DEFAULT 0,
  records_archived INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_data_retention_policies_org ON data_retention_policies(organization_id);
CREATE INDEX IF NOT EXISTS idx_data_retention_policies_active ON data_retention_policies(is_active);

-- Compliance reports table
CREATE TABLE IF NOT EXISTS compliance_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  report_type TEXT NOT NULL CHECK (report_type IN ('gdpr', 'ccpa', 'pci_dss', 'soc2', 'hipaa', 'custom')),
  report_name TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
  findings JSONB,
  recommendations JSONB,
  score NUMERIC(5,2),
  file_url TEXT,
  generated_by UUID REFERENCES platform_users(id),
  generated_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES platform_users(id),
  reviewed_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_reports_org ON compliance_reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_type ON compliance_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_status ON compliance_reports(status);

-- Data subject requests (GDPR/CCPA)
CREATE TABLE IF NOT EXISTS data_subject_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES platform_users(id),
  request_type TEXT NOT NULL CHECK (request_type IN ('access', 'rectification', 'erasure', 'portability', 'restriction', 'objection', 'opt_out')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected', 'cancelled')),
  requester_email TEXT NOT NULL,
  requester_name TEXT,
  verification_method TEXT,
  verified_at TIMESTAMPTZ,
  description TEXT,
  data_categories TEXT[],
  response TEXT,
  response_file_url TEXT,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES platform_users(id),
  rejection_reason TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_data_subject_requests_org ON data_subject_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_data_subject_requests_user ON data_subject_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_data_subject_requests_type ON data_subject_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_data_subject_requests_status ON data_subject_requests(status);

-- Consent records table
CREATE TABLE IF NOT EXISTS consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  consent_type TEXT NOT NULL CHECK (consent_type IN ('marketing_email', 'marketing_sms', 'marketing_push', 'data_processing', 'data_sharing', 'analytics', 'personalization', 'third_party', 'terms_of_service', 'privacy_policy')),
  granted BOOLEAN NOT NULL,
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT,
  consent_text TEXT,
  consent_version TEXT,
  source TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consent_records_user ON consent_records(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_records_type ON consent_records(consent_type);
CREATE INDEX IF NOT EXISTS idx_consent_records_granted ON consent_records(granted);

-- Function to log audit event
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_audit_id UUID;
  v_changes JSONB;
BEGIN
  -- Calculate changes if both old and new values provided
  IF p_old_values IS NOT NULL AND p_new_values IS NOT NULL THEN
    SELECT jsonb_object_agg(key, jsonb_build_object('old', p_old_values->key, 'new', value))
    INTO v_changes
    FROM jsonb_each(p_new_values)
    WHERE p_old_values->key IS DISTINCT FROM value;
  END IF;
  
  INSERT INTO audit_logs (
    user_id, action, resource_type, resource_id, old_values, new_values, changes, ip_address, metadata
  )
  VALUES (
    p_user_id, p_action, p_resource_type, p_resource_id, p_old_values, p_new_values, v_changes, p_ip_address, p_metadata
  )
  RETURNING id INTO v_audit_id;
  
  RETURN v_audit_id;
END;
$$;

-- Function to log security event
CREATE OR REPLACE FUNCTION log_security_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_severity TEXT DEFAULT 'info',
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO security_events (
    user_id, event_type, description, ip_address, severity, metadata
  )
  VALUES (
    p_user_id, p_event_type, p_description, p_ip_address, p_severity, p_metadata
  )
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$;

-- Function to record consent
CREATE OR REPLACE FUNCTION record_consent(
  p_user_id UUID,
  p_consent_type TEXT,
  p_granted BOOLEAN,
  p_ip_address TEXT DEFAULT NULL,
  p_consent_version TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_consent_id UUID;
BEGIN
  INSERT INTO consent_records (
    user_id, consent_type, granted, granted_at, revoked_at, ip_address, consent_version
  )
  VALUES (
    p_user_id, p_consent_type, p_granted,
    CASE WHEN p_granted THEN NOW() ELSE NULL END,
    CASE WHEN NOT p_granted THEN NOW() ELSE NULL END,
    p_ip_address, p_consent_version
  )
  RETURNING id INTO v_consent_id;
  
  RETURN v_consent_id;
END;
$$;

-- Function to get user consent status
CREATE OR REPLACE FUNCTION get_user_consent_status(p_user_id UUID)
RETURNS TABLE (
  consent_type TEXT,
  granted BOOLEAN,
  last_updated TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (cr.consent_type)
    cr.consent_type,
    cr.granted,
    cr.created_at as last_updated
  FROM consent_records cr
  WHERE cr.user_id = p_user_id
  ORDER BY cr.consent_type, cr.created_at DESC;
END;
$$;

-- Function to apply data retention
CREATE OR REPLACE FUNCTION apply_data_retention()
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  v_policy RECORD;
  v_deleted INT := 0;
  v_total_deleted INT := 0;
BEGIN
  FOR v_policy IN 
    SELECT * FROM data_retention_policies 
    WHERE is_active = TRUE 
      AND (next_run_at IS NULL OR next_run_at <= NOW())
  LOOP
    -- This is a simplified version - in production, use dynamic SQL
    -- based on table_name and filter_conditions
    
    UPDATE data_retention_policies SET
      last_run_at = NOW(),
      next_run_at = NOW() + INTERVAL '1 day',
      updated_at = NOW()
    WHERE id = v_policy.id;
    
    v_total_deleted := v_total_deleted + v_deleted;
  END LOOP;
  
  RETURN v_total_deleted;
END;
$$;

-- RLS policies
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_subject_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT ON audit_logs TO authenticated;
GRANT SELECT, INSERT ON security_events TO authenticated;
GRANT SELECT ON data_retention_policies TO authenticated;
GRANT SELECT ON compliance_reports TO authenticated;
GRANT SELECT, INSERT, UPDATE ON data_subject_requests TO authenticated;
GRANT SELECT, INSERT ON consent_records TO authenticated;
GRANT EXECUTE ON FUNCTION log_audit_event(UUID, TEXT, TEXT, UUID, JSONB, JSONB, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION log_security_event(UUID, TEXT, TEXT, TEXT, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION record_consent(UUID, TEXT, BOOLEAN, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_consent_status(UUID) TO authenticated;
