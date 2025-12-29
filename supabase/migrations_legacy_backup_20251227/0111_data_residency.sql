-- Migration: Data Residency
-- Description: Tables for data residency configuration and tracking

-- Data residency configurations
CREATE TABLE IF NOT EXISTS data_residency_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) UNIQUE,
  primary_region TEXT NOT NULL,
  backup_region TEXT,
  data_classification TEXT DEFAULT 'internal' CHECK (data_classification IN ('public', 'internal', 'confidential', 'restricted')),
  encryption_at_rest BOOLEAN DEFAULT true,
  encryption_in_transit BOOLEAN DEFAULT true,
  cross_border_allowed BOOLEAN DEFAULT false,
  allowed_regions TEXT[],
  retention_policy JSONB DEFAULT '{"default_days": 365, "pii_days": 90, "financial_days": 2555, "audit_days": 2555}',
  updated_by UUID REFERENCES platform_users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_data_residency_configs_org ON data_residency_configs(organization_id);

-- Data location registry
CREATE TABLE IF NOT EXISTS data_location_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  data_type TEXT NOT NULL,
  region TEXT NOT NULL,
  storage_provider TEXT,
  encryption_key_id TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, data_type)
);

CREATE INDEX IF NOT EXISTS idx_data_location_registry_org ON data_location_registry(organization_id);

-- Data transfer requests
CREATE TABLE IF NOT EXISTS data_transfer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  data_type TEXT NOT NULL,
  from_region TEXT NOT NULL,
  to_region TEXT NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
  requested_by UUID REFERENCES platform_users(id),
  approved_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  rejected_by UUID REFERENCES platform_users(id),
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_data_transfer_requests_org ON data_transfer_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_data_transfer_requests_status ON data_transfer_requests(status);

-- Data residency audit
CREATE TABLE IF NOT EXISTS data_residency_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  action TEXT NOT NULL,
  details JSONB,
  performed_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_data_residency_audit_org ON data_residency_audit(organization_id);
CREATE INDEX IF NOT EXISTS idx_data_residency_audit_created ON data_residency_audit(created_at);

-- RLS policies
ALTER TABLE data_residency_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_location_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_transfer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_residency_audit ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON data_residency_configs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON data_location_registry TO authenticated;
GRANT SELECT, INSERT, UPDATE ON data_transfer_requests TO authenticated;
GRANT SELECT, INSERT ON data_residency_audit TO authenticated;
