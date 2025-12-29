-- Migration: Standard Operating Procedures (SOP) System
-- Description: Versioned procedures with approval workflow from ExperienceGeneratorSchema

-- Add SOP status enum
DO $$ BEGIN
  CREATE TYPE sop_status_enum AS ENUM ('draft', 'review', 'approved', 'archived', 'superseded');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- SOP Categories table
CREATE TABLE IF NOT EXISTS sop_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20),
  description TEXT,
  color VARCHAR(7),
  icon TEXT,
  parent_id UUID REFERENCES sop_categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, code)
);

-- SOPs table
CREATE TABLE IF NOT EXISTS sops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  production_id UUID REFERENCES productions(id),
  category_id UUID REFERENCES sop_categories(id),
  
  -- Identification
  sop_number VARCHAR(50),
  title VARCHAR(255) NOT NULL,
  version VARCHAR(20) DEFAULT '1.0',
  
  -- Status
  status sop_status_enum DEFAULT 'draft',
  effective_date DATE,
  review_date DATE,
  expiration_date DATE,
  
  -- Content
  purpose TEXT,
  scope TEXT,
  definitions JSONB DEFAULT '[]',
  responsibilities JSONB DEFAULT '[]',
  prerequisites TEXT,
  safety_warnings TEXT[],
  equipment_required TEXT[],
  materials_required TEXT[],
  sop_references JSONB DEFAULT '[]',
  
  -- Approval
  author_id UUID REFERENCES platform_users(id),
  reviewer_id UUID REFERENCES platform_users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  approver_id UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  approval_notes TEXT,
  
  -- Versioning
  previous_version_id UUID REFERENCES sops(id),
  revision_history JSONB DEFAULT '[]',
  change_summary TEXT,
  
  -- Documents
  document_url TEXT,
  attachments JSONB DEFAULT '[]',
  
  -- Training
  training_required BOOLEAN DEFAULT false,
  training_frequency_days INTEGER,
  
  -- Meta
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SOP Steps table
CREATE TABLE IF NOT EXISTS sop_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sop_id UUID NOT NULL REFERENCES sops(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  title VARCHAR(255),
  instruction TEXT NOT NULL,
  
  -- Details
  responsible_role TEXT,
  responsible_role_id UUID,
  estimated_duration_minutes INTEGER,
  
  -- Guidance
  notes TEXT,
  tips TEXT,
  warnings TEXT[] DEFAULT '{}',
  cautions TEXT[] DEFAULT '{}',
  
  -- Media
  image_url TEXT,
  video_url TEXT,
  media_urls TEXT[] DEFAULT '{}',
  
  -- Verification
  verification_required BOOLEAN DEFAULT false,
  verification_method TEXT,
  
  -- Branching
  decision_point BOOLEAN DEFAULT false,
  decision_options JSONB,
  
  -- Meta
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sop_id, step_number)
);

-- SOP Acknowledgments table
CREATE TABLE IF NOT EXISTS sop_acknowledgments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sop_id UUID NOT NULL REFERENCES sops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id),
  acknowledged_at TIMESTAMPTZ DEFAULT NOW(),
  version_acknowledged VARCHAR(20),
  ip_address INET,
  notes TEXT,
  UNIQUE(sop_id, user_id, version_acknowledged)
);

-- SOP Training Records table
CREATE TABLE IF NOT EXISTS sop_training_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sop_id UUID NOT NULL REFERENCES sops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id),
  training_date DATE NOT NULL,
  trainer_id UUID REFERENCES platform_users(id),
  training_type TEXT CHECK (training_type IN ('initial', 'refresher', 'update', 'remedial')),
  passed BOOLEAN DEFAULT true,
  score NUMERIC(5,2),
  expiration_date DATE,
  certificate_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sop_categories_org ON sop_categories(organization_id);
CREATE INDEX IF NOT EXISTS idx_sop_categories_parent ON sop_categories(parent_id);

CREATE INDEX IF NOT EXISTS idx_sops_org ON sops(organization_id);
CREATE INDEX IF NOT EXISTS idx_sops_production ON sops(production_id);
CREATE INDEX IF NOT EXISTS idx_sops_category ON sops(category_id);
CREATE INDEX IF NOT EXISTS idx_sops_status ON sops(status);
CREATE INDEX IF NOT EXISTS idx_sops_number ON sops(sop_number);

CREATE INDEX IF NOT EXISTS idx_sop_steps_sop ON sop_steps(sop_id);
CREATE INDEX IF NOT EXISTS idx_sop_steps_number ON sop_steps(sop_id, step_number);

CREATE INDEX IF NOT EXISTS idx_sop_acknowledgments_sop ON sop_acknowledgments(sop_id);
CREATE INDEX IF NOT EXISTS idx_sop_acknowledgments_user ON sop_acknowledgments(user_id);

CREATE INDEX IF NOT EXISTS idx_sop_training_records_sop ON sop_training_records(sop_id);
CREATE INDEX IF NOT EXISTS idx_sop_training_records_user ON sop_training_records(user_id);
CREATE INDEX IF NOT EXISTS idx_sop_training_records_expiration ON sop_training_records(expiration_date);

-- Function to create new SOP version
CREATE OR REPLACE FUNCTION create_sop_version(
  p_sop_id UUID,
  p_new_version VARCHAR(20),
  p_change_summary TEXT,
  p_author_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_sop_id UUID;
  v_old_sop RECORD;
BEGIN
  -- Get existing SOP
  SELECT * INTO v_old_sop FROM sops WHERE id = p_sop_id;
  
  IF v_old_sop IS NULL THEN
    RAISE EXCEPTION 'SOP not found';
  END IF;
  
  -- Create new version
  INSERT INTO sops (
    organization_id, production_id, category_id, sop_number, title,
    version, status, purpose, scope, definitions, responsibilities,
    prerequisites, safety_warnings, equipment_required, materials_required,
    sop_references, author_id, previous_version_id, change_summary,
    document_url, attachments, training_required, training_frequency_days,
    tags, metadata
  )
  SELECT 
    organization_id, production_id, category_id, sop_number, title,
    p_new_version, 'draft', purpose, scope, definitions, responsibilities,
    prerequisites, safety_warnings, equipment_required, materials_required,
    sop_references, p_author_id, p_sop_id, p_change_summary,
    document_url, attachments, training_required, training_frequency_days,
    tags, metadata
  FROM sops WHERE id = p_sop_id
  RETURNING id INTO v_new_sop_id;
  
  -- Copy steps
  INSERT INTO sop_steps (
    sop_id, step_number, title, instruction, responsible_role,
    estimated_duration_minutes, notes, tips, warnings, cautions,
    image_url, video_url, media_urls, verification_required,
    verification_method, decision_point, decision_options, metadata
  )
  SELECT 
    v_new_sop_id, step_number, title, instruction, responsible_role,
    estimated_duration_minutes, notes, tips, warnings, cautions,
    image_url, video_url, media_urls, verification_required,
    verification_method, decision_point, decision_options, metadata
  FROM sop_steps WHERE sop_id = p_sop_id;
  
  -- Mark old version as superseded
  UPDATE sops SET status = 'superseded', updated_at = NOW() WHERE id = p_sop_id;
  
  RETURN v_new_sop_id;
END;
$$;

-- Function to get SOP with steps
CREATE OR REPLACE FUNCTION get_sop_with_steps(p_sop_id UUID)
RETURNS TABLE (
  sop_id UUID,
  sop_number VARCHAR(50),
  title VARCHAR(255),
  version VARCHAR(20),
  status sop_status_enum,
  category_name TEXT,
  purpose TEXT,
  scope TEXT,
  author_name TEXT,
  approver_name TEXT,
  approved_at TIMESTAMPTZ,
  steps JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.sop_number,
    s.title,
    s.version,
    s.status,
    sc.name AS category_name,
    s.purpose,
    s.scope,
    au.full_name AS author_name,
    ap.full_name AS approver_name,
    s.approved_at,
    (SELECT jsonb_agg(jsonb_build_object(
      'step_number', st.step_number,
      'title', st.title,
      'instruction', st.instruction,
      'notes', st.notes,
      'warnings', st.warnings,
      'image_url', st.image_url,
      'verification_required', st.verification_required
    ) ORDER BY st.step_number)
    FROM sop_steps st WHERE st.sop_id = s.id) AS steps
  FROM sops s
  LEFT JOIN sop_categories sc ON s.category_id = sc.id
  LEFT JOIN platform_users au ON s.author_id = au.id
  LEFT JOIN platform_users ap ON s.approver_id = ap.id
  WHERE s.id = p_sop_id;
END;
$$;

-- Function to check user SOP compliance
CREATE OR REPLACE FUNCTION check_user_sop_compliance(
  p_user_id UUID,
  p_org_id UUID
)
RETURNS TABLE (
  sop_id UUID,
  sop_title TEXT,
  requires_acknowledgment BOOLEAN,
  acknowledged BOOLEAN,
  requires_training BOOLEAN,
  training_current BOOLEAN,
  training_expires DATE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.title,
    true AS requires_acknowledgment,
    EXISTS (
      SELECT 1 FROM sop_acknowledgments 
      WHERE sop_id = s.id AND user_id = p_user_id AND version_acknowledged = s.version
    ) AS acknowledged,
    s.training_required,
    EXISTS (
      SELECT 1 FROM sop_training_records 
      WHERE sop_id = s.id AND user_id = p_user_id 
        AND passed = true 
        AND (expiration_date IS NULL OR expiration_date >= CURRENT_DATE)
    ) AS training_current,
    (SELECT MAX(expiration_date) FROM sop_training_records 
     WHERE sop_id = s.id AND user_id = p_user_id AND passed = true) AS training_expires
  FROM sops s
  WHERE s.organization_id = p_org_id
    AND s.status = 'approved';
END;
$$;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_sop_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sop_categories_updated_at ON sop_categories;
CREATE TRIGGER sop_categories_updated_at
  BEFORE UPDATE ON sop_categories
  FOR EACH ROW EXECUTE FUNCTION update_sop_timestamp();

DROP TRIGGER IF EXISTS sops_updated_at ON sops;
CREATE TRIGGER sops_updated_at
  BEFORE UPDATE ON sops
  FOR EACH ROW EXECUTE FUNCTION update_sop_timestamp();

DROP TRIGGER IF EXISTS sop_steps_updated_at ON sop_steps;
CREATE TRIGGER sop_steps_updated_at
  BEFORE UPDATE ON sop_steps
  FOR EACH ROW EXECUTE FUNCTION update_sop_timestamp();

-- RLS Policies
ALTER TABLE sop_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sops ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_acknowledgments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_training_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY sop_categories_select ON sop_categories
  FOR SELECT TO authenticated
  USING (organization_id IS NULL OR org_matches(organization_id));

CREATE POLICY sop_categories_manage ON sop_categories
  FOR ALL TO authenticated
  USING (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'))
  WITH CHECK (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

CREATE POLICY sops_select ON sops
  FOR SELECT TO authenticated
  USING (org_matches(organization_id) OR production_id IN (SELECT id FROM productions WHERE org_matches(organization_id)));

CREATE POLICY sops_manage ON sops
  FOR ALL TO authenticated
  USING (role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'))
  WITH CHECK (role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

CREATE POLICY sop_steps_select ON sop_steps
  FOR SELECT TO authenticated
  USING (sop_id IN (SELECT id FROM sops WHERE org_matches(organization_id)));

CREATE POLICY sop_steps_manage ON sop_steps
  FOR ALL TO authenticated
  USING (role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'))
  WITH CHECK (role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

CREATE POLICY sop_acknowledgments_select ON sop_acknowledgments
  FOR SELECT TO authenticated
  USING (user_id = current_platform_user_id() OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

CREATE POLICY sop_acknowledgments_insert ON sop_acknowledgments
  FOR INSERT TO authenticated
  WITH CHECK (user_id = current_platform_user_id());

CREATE POLICY sop_training_records_select ON sop_training_records
  FOR SELECT TO authenticated
  USING (user_id = current_platform_user_id() OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

CREATE POLICY sop_training_records_manage ON sop_training_records
  FOR ALL TO authenticated
  USING (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'))
  WITH CHECK (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON sop_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON sops TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON sop_steps TO authenticated;
GRANT SELECT, INSERT ON sop_acknowledgments TO authenticated;
GRANT SELECT, INSERT ON sop_training_records TO authenticated;

GRANT EXECUTE ON FUNCTION create_sop_version(UUID, VARCHAR, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_sop_with_steps(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_user_sop_compliance(UUID, UUID) TO authenticated;

-- Seed default SOP categories
INSERT INTO sop_categories (organization_id, name, code, description, sort_order, color) VALUES
  (NULL, 'Guest Services', 'GS', 'Guest arrival, complaints, accommodations', 1, '#3498db'),
  (NULL, 'Security', 'SEC', 'Access control, incident response, ejections', 2, '#e74c3c'),
  (NULL, 'Emergency', 'EMG', 'Medical, fire, evacuation, weather', 3, '#c0392b'),
  (NULL, 'Food & Beverage', 'FB', 'Service, alcohol, cash handling, safety', 4, '#27ae60'),
  (NULL, 'Production', 'PRD', 'Show call, technical, performer protocols', 5, '#9b59b6'),
  (NULL, 'Operations', 'OPS', 'General operations procedures', 6, '#f39c12'),
  (NULL, 'HR', 'HR', 'Human resources procedures', 7, '#1abc9c'),
  (NULL, 'Finance', 'FIN', 'Financial procedures and controls', 8, '#34495e')
ON CONFLICT DO NOTHING;
