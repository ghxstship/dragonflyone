-- Migration: Document Management System
-- Description: Tables for document storage, versioning, folders, and sharing

-- Document folders table
CREATE TABLE IF NOT EXISTS document_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  parent_id UUID REFERENCES document_folders(id),
  description TEXT,
  color TEXT,
  icon TEXT,
  is_system BOOLEAN DEFAULT false,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, path)
);

CREATE INDEX IF NOT EXISTS idx_document_folders_org ON document_folders(organization_id);
CREATE INDEX IF NOT EXISTS idx_document_folders_parent ON document_folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_document_folders_path ON document_folders(path);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  folder_id UUID REFERENCES document_folders(id),
  folder_path TEXT,
  name TEXT NOT NULL,
  description TEXT,
  document_type TEXT NOT NULL CHECK (document_type IN ('contract', 'insurance', 'license', 'permit', 'policy', 'report', 'invoice', 'proposal', 'agreement', 'other')),
  file_url TEXT,
  file_size BIGINT,
  mime_type TEXT,
  version INT DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft', 'pending_review')),
  tags TEXT[],
  related_entity_type TEXT,
  related_entity_id UUID,
  expiration_date DATE,
  is_template BOOLEAN DEFAULT false,
  is_confidential BOOLEAN DEFAULT false,
  access_level TEXT DEFAULT 'organization' CHECK (access_level IN ('public', 'organization', 'department', 'private')),
  uploaded_by UUID REFERENCES platform_users(id),
  last_accessed_at TIMESTAMPTZ,
  last_accessed_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_org ON documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_documents_folder ON documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_related ON documents(related_entity_type, related_entity_id);
CREATE INDEX IF NOT EXISTS idx_documents_name ON documents USING gin(to_tsvector('english', name));

-- Document versions table
CREATE TABLE IF NOT EXISTS document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  change_notes TEXT,
  uploaded_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(document_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_document_versions_doc ON document_versions(document_id);

-- Document shares table
CREATE TABLE IF NOT EXISTS document_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  shared_with_user_id UUID REFERENCES platform_users(id),
  shared_with_email TEXT,
  permission TEXT NOT NULL DEFAULT 'view' CHECK (permission IN ('view', 'comment', 'edit', 'admin')),
  share_link TEXT UNIQUE,
  link_password TEXT,
  expires_at TIMESTAMPTZ,
  download_allowed BOOLEAN DEFAULT true,
  download_count INT DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  shared_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT share_target CHECK (shared_with_user_id IS NOT NULL OR shared_with_email IS NOT NULL OR share_link IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_document_shares_doc ON document_shares(document_id);
CREATE INDEX IF NOT EXISTS idx_document_shares_user ON document_shares(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_document_shares_link ON document_shares(share_link);

-- Document comments table
CREATE TABLE IF NOT EXISTS document_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id),
  content TEXT NOT NULL,
  parent_id UUID REFERENCES document_comments(id),
  page_number INT,
  position_x NUMERIC,
  position_y NUMERIC,
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES platform_users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_comments_doc ON document_comments(document_id);

-- Document activity log table
CREATE TABLE IF NOT EXISTS document_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES platform_users(id),
  action TEXT NOT NULL CHECK (action IN ('created', 'viewed', 'downloaded', 'edited', 'versioned', 'shared', 'unshared', 'commented', 'archived', 'restored', 'deleted')),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_activity_doc ON document_activity_log(document_id);
CREATE INDEX IF NOT EXISTS idx_document_activity_user ON document_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_document_activity_action ON document_activity_log(action);

-- Document templates table
CREATE TABLE IF NOT EXISTS document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  document_type TEXT NOT NULL,
  template_content TEXT,
  file_url TEXT,
  variables JSONB,
  is_active BOOLEAN DEFAULT true,
  usage_count INT DEFAULT 0,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_templates_org ON document_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_document_templates_type ON document_templates(document_type);

-- Function to log document activity
CREATE OR REPLACE FUNCTION log_document_activity(
  p_document_id UUID,
  p_user_id UUID,
  p_action TEXT,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO document_activity_log (document_id, user_id, action, details)
  VALUES (p_document_id, p_user_id, p_action, p_details)
  RETURNING id INTO v_log_id;
  
  -- Update last accessed
  IF p_action IN ('viewed', 'downloaded') THEN
    UPDATE documents SET
      last_accessed_at = NOW(),
      last_accessed_by = p_user_id
    WHERE id = p_document_id;
  END IF;
  
  RETURN v_log_id;
END;
$$;

-- Function to generate share link
CREATE OR REPLACE FUNCTION generate_share_link()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  result TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..32 LOOP
    result := result || SUBSTR(chars, FLOOR(RANDOM() * LENGTH(chars) + 1)::INT, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- RLS policies
ALTER TABLE document_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON document_folders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON documents TO authenticated;
GRANT SELECT, INSERT ON document_versions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON document_shares TO authenticated;
GRANT SELECT, INSERT, UPDATE ON document_comments TO authenticated;
GRANT SELECT, INSERT ON document_activity_log TO authenticated;
GRANT SELECT, INSERT, UPDATE ON document_templates TO authenticated;
GRANT EXECUTE ON FUNCTION log_document_activity(UUID, UUID, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_share_link() TO authenticated;
