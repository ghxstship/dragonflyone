-- Migration: Enterprise and Compliance Features
-- Description: Tables for regional compliance, white-label solutions, and data governance

-- Compliance regions
CREATE TABLE IF NOT EXISTS compliance_regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  data_retention_days INT,
  consent_required BOOLEAN DEFAULT true,
  cookie_consent_required BOOLEAN DEFAULT true,
  right_to_deletion BOOLEAN DEFAULT true,
  data_portability BOOLEAN DEFAULT true,
  breach_notification_hours INT,
  dpo_required BOOLEAN DEFAULT false,
  cross_border_transfer_allowed BOOLEAN DEFAULT true,
  allowed_transfer_regions TEXT[],
  tax_requirements JSONB,
  is_active BOOLEAN DEFAULT true,
  updated_by UUID REFERENCES platform_users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_regions_code ON compliance_regions(region_code);

-- User consents
CREATE TABLE IF NOT EXISTS user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  consent_type TEXT NOT NULL,
  granted BOOLEAN NOT NULL,
  region TEXT,
  purpose TEXT,
  ip_address TEXT,
  user_agent TEXT,
  withdrawn_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_consents_user ON user_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_consents_type ON user_consents(consent_type);

-- Compliance audit log
CREATE TABLE IF NOT EXISTS compliance_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  performed_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_audit_log_action ON compliance_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_log_created ON compliance_audit_log(created_at);

-- Data inventory
CREATE TABLE IF NOT EXISTS data_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  data_type TEXT NOT NULL,
  description TEXT,
  retention_period TEXT,
  legal_basis TEXT,
  processing_purposes TEXT[],
  recipients TEXT[],
  international_transfers TEXT[],
  security_measures TEXT[],
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_data_inventory_category ON data_inventory(category);

-- Data breaches
CREATE TABLE IF NOT EXISTS data_breaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  affected_users INT,
  data_types TEXT[],
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  discovered_at TIMESTAMPTZ NOT NULL,
  reported_to_authority_at TIMESTAMPTZ,
  users_notified_at TIMESTAMPTZ,
  status TEXT DEFAULT 'investigating' CHECK (status IN ('investigating', 'contained', 'resolved', 'closed')),
  resolution_notes TEXT,
  reported_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_data_breaches_status ON data_breaches(status);

-- Compliance reports
CREATE TABLE IF NOT EXISTS compliance_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type TEXT NOT NULL,
  data JSONB NOT NULL,
  generated_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- White-label configurations
CREATE TABLE IF NOT EXISTS white_label_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) UNIQUE,
  brand_name TEXT NOT NULL,
  domain TEXT UNIQUE,
  domain_verification_token TEXT,
  domain_verified BOOLEAN DEFAULT false,
  domain_verified_at TIMESTAMPTZ,
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  accent_color TEXT,
  font_family TEXT,
  custom_css TEXT,
  email_from_name TEXT,
  email_from_address TEXT,
  support_email TEXT,
  support_phone TEXT,
  terms_url TEXT,
  privacy_url TEXT,
  features JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  deactivated_at TIMESTAMPTZ,
  updated_by UUID REFERENCES platform_users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_white_label_configs_org ON white_label_configs(organization_id);
CREATE INDEX IF NOT EXISTS idx_white_label_configs_domain ON white_label_configs(domain);

-- White-label email templates
CREATE TABLE IF NOT EXISTS white_label_email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  template_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT,
  text_content TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, template_type)
);

CREATE INDEX IF NOT EXISTS idx_white_label_email_templates_org ON white_label_email_templates(organization_id);

-- White-label usage tracking
CREATE TABLE IF NOT EXISTS white_label_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID NOT NULL REFERENCES white_label_configs(id),
  period DATE NOT NULL,
  page_views INT DEFAULT 0,
  unique_visitors INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(config_id, period)
);

CREATE INDEX IF NOT EXISTS idx_white_label_usage_config ON white_label_usage(config_id);
CREATE INDEX IF NOT EXISTS idx_white_label_usage_period ON white_label_usage(period);

-- Add country and state to platform_users
ALTER TABLE platform_users ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE platform_users ADD COLUMN IF NOT EXISTS state TEXT;

-- Insert default compliance regions
INSERT INTO compliance_regions (region_code, name, data_retention_days, consent_required, breach_notification_hours, dpo_required) VALUES
('EU', 'European Union (GDPR)', 1095, true, 72, true),
('UK', 'United Kingdom (UK GDPR)', 1095, true, 72, true),
('US', 'United States (General)', NULL, false, NULL, false),
('US_CA', 'California (CCPA/CPRA)', NULL, true, NULL, false),
('CA', 'Canada (PIPEDA)', NULL, true, NULL, false),
('APAC', 'Asia-Pacific', NULL, true, NULL, false),
('LATAM', 'Latin America (LGPD)', 1825, true, NULL, true),
('DEFAULT', 'Default/Other', NULL, true, NULL, false)
ON CONFLICT (region_code) DO NOTHING;

-- RLS policies
ALTER TABLE compliance_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_breaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE white_label_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE white_label_email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE white_label_usage ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON compliance_regions TO authenticated;
GRANT SELECT, INSERT ON user_consents TO authenticated;
GRANT SELECT, INSERT ON compliance_audit_log TO authenticated;
GRANT SELECT, INSERT, UPDATE ON data_inventory TO authenticated;
GRANT SELECT, INSERT, UPDATE ON data_breaches TO authenticated;
GRANT SELECT, INSERT ON compliance_reports TO authenticated;
GRANT SELECT, INSERT, UPDATE ON white_label_configs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON white_label_email_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE ON white_label_usage TO authenticated;
