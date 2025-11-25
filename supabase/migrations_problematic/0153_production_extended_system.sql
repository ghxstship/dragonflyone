-- Migration: Production Extended System
-- Description: Tables for stakeholder portal, file management, and production operations

-- Project stakeholders
CREATE TABLE IF NOT EXISTS project_stakeholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('client', 'sponsor', 'vendor', 'partner', 'observer', 'approver')),
  organization_name TEXT,
  phone TEXT,
  permissions TEXT[] DEFAULT ARRAY['view_schedule'],
  notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "digest_frequency": "daily"}',
  access_token TEXT,
  last_accessed_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  deactivated_at TIMESTAMPTZ,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_stakeholders_project ON project_stakeholders(project_id);
CREATE INDEX IF NOT EXISTS idx_project_stakeholders_email ON project_stakeholders(email);
CREATE INDEX IF NOT EXISTS idx_project_stakeholders_active ON project_stakeholders(is_active);

-- Stakeholder communications
CREATE TABLE IF NOT EXISTS stakeholder_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  stakeholder_ids UUID[],
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('update', 'announcement', 'request', 'approval_needed', 'milestone')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  attachments JSONB,
  sent_by UUID REFERENCES platform_users(id),
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  read_by UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stakeholder_communications_project ON stakeholder_communications(project_id);
CREATE INDEX IF NOT EXISTS idx_stakeholder_communications_sent ON stakeholder_communications(sent_at);

-- Stakeholder approvals
CREATE TABLE IF NOT EXISTS stakeholder_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  stakeholder_ids UUID[] NOT NULL,
  item_type TEXT NOT NULL,
  item_id UUID NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'changes_requested')),
  requested_by UUID REFERENCES platform_users(id),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  decided_by UUID REFERENCES platform_users(id),
  decided_at TIMESTAMPTZ,
  decision_comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stakeholder_approvals_project ON stakeholder_approvals(project_id);
CREATE INDEX IF NOT EXISTS idx_stakeholder_approvals_status ON stakeholder_approvals(status);

-- Project folders
CREATE TABLE IF NOT EXISTS project_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES project_folders(id),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_folders_project ON project_folders(project_id);
CREATE INDEX IF NOT EXISTS idx_project_folders_parent ON project_folders(parent_id);

-- Project documents (enhanced)
ALTER TABLE project_documents ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES project_folders(id);
ALTER TABLE project_documents ADD COLUMN IF NOT EXISTS version INT DEFAULT 1;
ALTER TABLE project_documents ADD COLUMN IF NOT EXISTS is_stakeholder_visible BOOLEAN DEFAULT false;
ALTER TABLE project_documents ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES platform_users(id);

CREATE INDEX IF NOT EXISTS idx_project_documents_folder ON project_documents(folder_id);

-- Document versions
CREATE TABLE IF NOT EXISTS document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES project_documents(id) ON DELETE CASCADE,
  version INT NOT NULL,
  url TEXT NOT NULL,
  size INT,
  changes_description TEXT,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_versions_document ON document_versions(document_id);

-- CAD/Drawing files
CREATE TABLE IF NOT EXISTS cad_drawings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  document_id UUID REFERENCES project_documents(id),
  name TEXT NOT NULL,
  drawing_type TEXT NOT NULL CHECK (drawing_type IN ('floor_plan', 'elevation', 'section', 'detail', 'rigging', 'lighting', 'audio', 'video', 'power', 'other')),
  file_format TEXT,
  scale TEXT,
  revision TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'for_review', 'approved', 'superseded')),
  approved_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cad_drawings_project ON cad_drawings(project_id);
CREATE INDEX IF NOT EXISTS idx_cad_drawings_type ON cad_drawings(drawing_type);

-- Drawing markups
CREATE TABLE IF NOT EXISTS drawing_markups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drawing_id UUID NOT NULL REFERENCES cad_drawings(id) ON DELETE CASCADE,
  markup_type TEXT NOT NULL CHECK (markup_type IN ('comment', 'dimension', 'highlight', 'arrow', 'text', 'shape')),
  content JSONB NOT NULL,
  position JSONB NOT NULL,
  color TEXT,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES platform_users(id)
);

CREATE INDEX IF NOT EXISTS idx_drawing_markups_drawing ON drawing_markups(drawing_id);

-- Backup plans
CREATE TABLE IF NOT EXISTS backup_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  scenario TEXT NOT NULL,
  trigger_conditions TEXT,
  response_actions TEXT NOT NULL,
  responsible_party UUID REFERENCES platform_users(id),
  resources_needed TEXT,
  estimated_cost NUMERIC(12,2),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'triggered', 'resolved', 'archived')),
  triggered_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_backup_plans_project ON backup_plans(project_id);
CREATE INDEX IF NOT EXISTS idx_backup_plans_status ON backup_plans(status);

-- Technical specifications
CREATE TABLE IF NOT EXISTS technical_specifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('audio', 'lighting', 'video', 'rigging', 'power', 'staging', 'backline', 'other')),
  name TEXT NOT NULL,
  description TEXT,
  requirements JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'modified', 'fulfilled')),
  vendor_id UUID REFERENCES vendors(id),
  notes TEXT,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_technical_specifications_project ON technical_specifications(project_id);
CREATE INDEX IF NOT EXISTS idx_technical_specifications_category ON technical_specifications(category);

-- Background checks
CREATE TABLE IF NOT EXISTS background_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  check_type TEXT NOT NULL CHECK (check_type IN ('criminal', 'employment', 'education', 'credit', 'drug_test', 'comprehensive')),
  provider TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'passed', 'failed', 'expired')),
  submitted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  result_summary TEXT,
  document_url TEXT,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_background_checks_user ON background_checks(user_id);
CREATE INDEX IF NOT EXISTS idx_background_checks_status ON background_checks(status);
CREATE INDEX IF NOT EXISTS idx_background_checks_expires ON background_checks(expires_at);

-- Function to check stakeholder permissions
CREATE OR REPLACE FUNCTION check_stakeholder_permission(
  p_stakeholder_id UUID,
  p_permission TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_permissions TEXT[];
BEGIN
  SELECT permissions INTO v_permissions
  FROM project_stakeholders
  WHERE id = p_stakeholder_id AND is_active = TRUE;
  
  RETURN p_permission = ANY(v_permissions);
END;
$$;

-- Function to get expiring background checks
CREATE OR REPLACE FUNCTION get_expiring_background_checks(p_days INT DEFAULT 30)
RETURNS TABLE (
  user_id UUID,
  user_name TEXT,
  check_type TEXT,
  expires_at TIMESTAMPTZ,
  days_until_expiry INT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bc.user_id,
    CONCAT(pu.first_name, ' ', pu.last_name) as user_name,
    bc.check_type,
    bc.expires_at,
    EXTRACT(DAY FROM bc.expires_at - NOW())::INT as days_until_expiry
  FROM background_checks bc
  JOIN platform_users pu ON bc.user_id = pu.id
  WHERE bc.status = 'passed'
    AND bc.expires_at <= NOW() + (p_days || ' days')::INTERVAL
    AND bc.expires_at >= NOW()
  ORDER BY bc.expires_at ASC;
END;
$$;

-- RLS policies
ALTER TABLE project_stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakeholder_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakeholder_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cad_drawings ENABLE ROW LEVEL SECURITY;
ALTER TABLE drawing_markups ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE technical_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE background_checks ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON project_stakeholders TO authenticated;
GRANT SELECT, INSERT ON stakeholder_communications TO authenticated;
GRANT SELECT, INSERT, UPDATE ON stakeholder_approvals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON project_folders TO authenticated;
GRANT SELECT, INSERT ON document_versions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON cad_drawings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON drawing_markups TO authenticated;
GRANT SELECT, INSERT, UPDATE ON backup_plans TO authenticated;
GRANT SELECT, INSERT, UPDATE ON technical_specifications TO authenticated;
GRANT SELECT, INSERT, UPDATE ON background_checks TO authenticated;
GRANT EXECUTE ON FUNCTION check_stakeholder_permission(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_expiring_background_checks(INT) TO authenticated;
