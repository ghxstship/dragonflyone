-- Migration: GDPR/CCPA Compliance Tools
-- Description: Data privacy compliance infrastructure

-- Consent records
CREATE TABLE IF NOT EXISTS consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES platform_users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  
  -- Consent types
  consent_type VARCHAR(50) NOT NULL CHECK (consent_type IN (
    'marketing_email', 'marketing_sms', 'marketing_push',
    'analytics', 'personalization', 'third_party_sharing',
    'terms_of_service', 'privacy_policy', 'cookie_policy'
  )),
  
  -- Consent status
  is_granted BOOLEAN NOT NULL,
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  
  -- Context
  source VARCHAR(100) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  
  -- Legal basis (GDPR)
  legal_basis VARCHAR(50) CHECK (legal_basis IN ('consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests')),
  
  -- Version tracking
  policy_version VARCHAR(50),
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, consent_type) WHERE user_id IS NOT NULL,
  UNIQUE(email, consent_type) WHERE email IS NOT NULL AND user_id IS NULL
);

-- Data subject requests (DSR)
CREATE TABLE IF NOT EXISTS data_subject_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Requester info
  user_id UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  
  -- Request details
  request_type VARCHAR(50) NOT NULL CHECK (request_type IN (
    'access', 'rectification', 'erasure', 'restriction',
    'portability', 'objection', 'automated_decision_opt_out'
  )),
  
  -- CCPA specific
  ccpa_request_type VARCHAR(50) CHECK (ccpa_request_type IN (
    'know', 'delete', 'opt_out_sale', 'opt_in_sale', 'non_discrimination'
  )),
  
  description TEXT,
  
  -- Verification
  verification_method VARCHAR(50) CHECK (verification_method IN ('email', 'id_document', 'account_login', 'other')),
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES platform_users(id),
  
  -- Processing
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'in_progress', 'completed', 'rejected', 'cancelled')),
  assigned_to UUID REFERENCES platform_users(id),
  
  -- Deadlines (GDPR: 30 days, CCPA: 45 days)
  deadline_at TIMESTAMPTZ,
  extended_deadline_at TIMESTAMPTZ,
  extension_reason TEXT,
  
  -- Completion
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES platform_users(id),
  completion_notes TEXT,
  
  -- Response
  response_sent_at TIMESTAMPTZ,
  response_method VARCHAR(50),
  
  -- Rejection
  rejection_reason TEXT,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data processing activities (Article 30 GDPR)
CREATE TABLE IF NOT EXISTS data_processing_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Processing details
  purpose TEXT NOT NULL,
  legal_basis VARCHAR(50) NOT NULL,
  
  -- Data categories
  data_categories JSONB DEFAULT '[]',
  special_categories JSONB DEFAULT '[]',
  
  -- Data subjects
  data_subject_categories JSONB DEFAULT '[]',
  
  -- Recipients
  recipients JSONB DEFAULT '[]',
  third_country_transfers JSONB DEFAULT '[]',
  
  -- Retention
  retention_period VARCHAR(100),
  retention_criteria TEXT,
  
  -- Security measures
  security_measures JSONB DEFAULT '[]',
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  last_reviewed_at TIMESTAMPTZ,
  next_review_at TIMESTAMPTZ,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id)
);

-- Data retention policies
CREATE TABLE IF NOT EXISTS data_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Scope
  data_category VARCHAR(100) NOT NULL,
  table_name VARCHAR(100),
  
  -- Retention rules
  retention_days INTEGER NOT NULL,
  retention_action VARCHAR(50) NOT NULL CHECK (retention_action IN ('delete', 'anonymize', 'archive')),
  
  -- Conditions
  condition_column VARCHAR(100),
  condition_value VARCHAR(255),
  
  -- Execution
  is_active BOOLEAN DEFAULT TRUE,
  last_executed_at TIMESTAMPTZ,
  records_processed INTEGER DEFAULT 0,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id)
);

-- Data breach records
CREATE TABLE IF NOT EXISTS data_breach_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Breach details
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  breach_type VARCHAR(50) NOT NULL CHECK (breach_type IN ('confidentiality', 'integrity', 'availability')),
  
  -- Timeline
  discovered_at TIMESTAMPTZ NOT NULL,
  occurred_at TIMESTAMPTZ,
  contained_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  
  -- Impact assessment
  affected_records_count INTEGER,
  affected_data_categories JSONB DEFAULT '[]',
  affected_data_subjects JSONB DEFAULT '[]',
  risk_level VARCHAR(50) CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  
  -- Notification
  dpa_notified BOOLEAN DEFAULT FALSE,
  dpa_notified_at TIMESTAMPTZ,
  dpa_reference VARCHAR(255),
  
  subjects_notified BOOLEAN DEFAULT FALSE,
  subjects_notified_at TIMESTAMPTZ,
  notification_method VARCHAR(100),
  
  -- Remediation
  remediation_steps JSONB DEFAULT '[]',
  preventive_measures JSONB DEFAULT '[]',
  
  -- Status
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'contained', 'resolved', 'closed')),
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  reported_by UUID REFERENCES platform_users(id)
);

-- Privacy impact assessments (DPIA)
CREATE TABLE IF NOT EXISTS privacy_impact_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Project/feature being assessed
  project_name VARCHAR(255),
  project_description TEXT,
  
  -- Assessment
  necessity_assessment TEXT,
  proportionality_assessment TEXT,
  risks_identified JSONB DEFAULT '[]',
  mitigation_measures JSONB DEFAULT '[]',
  
  -- Consultation
  dpo_consulted BOOLEAN DEFAULT FALSE,
  dpo_consulted_at TIMESTAMPTZ,
  dpo_opinion TEXT,
  
  dpa_consulted BOOLEAN DEFAULT FALSE,
  dpa_consulted_at TIMESTAMPTZ,
  dpa_reference VARCHAR(255),
  
  -- Decision
  decision VARCHAR(50) CHECK (decision IN ('approved', 'approved_with_conditions', 'rejected', 'pending')),
  decision_at TIMESTAMPTZ,
  decision_by UUID REFERENCES platform_users(id),
  decision_notes TEXT,
  
  -- Review
  next_review_at TIMESTAMPTZ,
  
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'completed', 'archived')),
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id)
);

-- Cookie consent
CREATE TABLE IF NOT EXISTS cookie_consent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  
  -- Consent categories
  necessary BOOLEAN DEFAULT TRUE,
  functional BOOLEAN DEFAULT FALSE,
  analytics BOOLEAN DEFAULT FALSE,
  advertising BOOLEAN DEFAULT FALSE,
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  country_code VARCHAR(2),
  
  -- Timestamps
  consented_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  metadata JSONB DEFAULT '{}'
);

-- Audit log for privacy actions
CREATE TABLE IF NOT EXISTS privacy_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  
  action_type VARCHAR(50) NOT NULL CHECK (action_type IN (
    'consent_granted', 'consent_revoked', 'dsr_created', 'dsr_completed',
    'data_exported', 'data_deleted', 'data_anonymized', 'breach_reported',
    'dpia_created', 'policy_updated', 'retention_executed'
  )),
  
  entity_type VARCHAR(50),
  entity_id UUID,
  
  details JSONB DEFAULT '{}',
  
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_consent_records_user ON consent_records(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_records_email ON consent_records(email);
CREATE INDEX IF NOT EXISTS idx_consent_records_type ON consent_records(consent_type);
CREATE INDEX IF NOT EXISTS idx_dsr_org ON data_subject_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_dsr_user ON data_subject_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_dsr_status ON data_subject_requests(status);
CREATE INDEX IF NOT EXISTS idx_dsr_deadline ON data_subject_requests(deadline_at);
CREATE INDEX IF NOT EXISTS idx_dpa_org ON data_processing_activities(organization_id);
CREATE INDEX IF NOT EXISTS idx_retention_org ON data_retention_policies(organization_id);
CREATE INDEX IF NOT EXISTS idx_breach_org ON data_breach_records(organization_id);
CREATE INDEX IF NOT EXISTS idx_breach_status ON data_breach_records(status);
CREATE INDEX IF NOT EXISTS idx_dpia_org ON privacy_impact_assessments(organization_id);
CREATE INDEX IF NOT EXISTS idx_cookie_consent_session ON cookie_consent(session_id);
CREATE INDEX IF NOT EXISTS idx_privacy_audit_org ON privacy_audit_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_privacy_audit_action ON privacy_audit_log(action_type);

-- RLS Policies
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_subject_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_processing_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_breach_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_impact_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cookie_consent ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_audit_log ENABLE ROW LEVEL SECURITY;

-- Consent records - users can see their own
CREATE POLICY "consent_records_select" ON consent_records
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "consent_records_manage" ON consent_records
  FOR ALL USING (user_id = auth.uid());

-- DSR - users can see their own, admins can see all
CREATE POLICY "dsr_select" ON data_subject_requests
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.organization_id = data_subject_requests.organization_id
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

CREATE POLICY "dsr_insert" ON data_subject_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "dsr_manage" ON data_subject_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.organization_id = data_subject_requests.organization_id
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

-- Data processing activities - admin only
CREATE POLICY "dpa_select" ON data_processing_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.organization_id = data_processing_activities.organization_id
    )
  );

CREATE POLICY "dpa_manage" ON data_processing_activities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.organization_id = data_processing_activities.organization_id
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

-- Retention policies - admin only
CREATE POLICY "retention_manage" ON data_retention_policies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.organization_id = data_retention_policies.organization_id
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

-- Breach records - admin only
CREATE POLICY "breach_manage" ON data_breach_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.organization_id = data_breach_records.organization_id
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

-- DPIA - admin only
CREATE POLICY "dpia_manage" ON privacy_impact_assessments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.organization_id = privacy_impact_assessments.organization_id
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

-- Cookie consent - public insert, user can see own
CREATE POLICY "cookie_consent_insert" ON cookie_consent
  FOR INSERT WITH CHECK (true);

CREATE POLICY "cookie_consent_select" ON cookie_consent
  FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

-- Privacy audit log - admin only
CREATE POLICY "privacy_audit_select" ON privacy_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.organization_id = privacy_audit_log.organization_id
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

CREATE POLICY "privacy_audit_insert" ON privacy_audit_log
  FOR INSERT WITH CHECK (true);

-- Function to log privacy actions
CREATE OR REPLACE FUNCTION log_privacy_action(
  p_organization_id UUID,
  p_user_id UUID,
  p_action_type VARCHAR,
  p_entity_type VARCHAR DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO privacy_audit_log (
    organization_id, user_id, action_type, entity_type, entity_id,
    details, ip_address, user_agent
  ) VALUES (
    p_organization_id, p_user_id, p_action_type, p_entity_type, p_entity_id,
    p_details, p_ip_address, p_user_agent
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- Function to anonymize user data
CREATE OR REPLACE FUNCTION anonymize_user_data(p_user_id UUID)
RETURNS void AS $$
BEGIN
  -- Anonymize platform_users
  UPDATE platform_users SET
    full_name = 'Anonymized User',
    email = 'anonymized_' || id || '@deleted.local',
    phone = NULL,
    avatar_url = NULL,
    metadata = '{}'
  WHERE id = p_user_id;
  
  -- Log the action
  PERFORM log_privacy_action(
    NULL, p_user_id, 'data_anonymized', 'platform_users', p_user_id,
    '{"reason": "DSR erasure request"}'::jsonb
  );
END;
$$ LANGUAGE plpgsql;

-- Function to export user data (returns JSON)
CREATE OR REPLACE FUNCTION export_user_data(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'user', (SELECT row_to_json(pu.*) FROM platform_users pu WHERE pu.id = p_user_id),
    'consent_records', (SELECT jsonb_agg(row_to_json(cr.*)) FROM consent_records cr WHERE cr.user_id = p_user_id),
    'exported_at', NOW()
  ) INTO v_result;
  
  -- Log the action
  PERFORM log_privacy_action(
    NULL, p_user_id, 'data_exported', 'platform_users', p_user_id,
    '{"format": "json"}'::jsonb
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;
