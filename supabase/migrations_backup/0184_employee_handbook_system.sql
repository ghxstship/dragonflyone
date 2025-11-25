-- Migration: Employee Handbook and Policy Acknowledgment System
-- Description: Track employee handbook versions, policies, and acknowledgments

-- Handbook versions
CREATE TABLE IF NOT EXISTS handbook_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_number VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  effective_date DATE NOT NULL,
  expiration_date DATE,
  document_url TEXT,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'active', 'archived')),
  requires_acknowledgment BOOLEAN DEFAULT TRUE,
  acknowledgment_deadline_days INTEGER DEFAULT 30,
  change_summary TEXT,
  approved_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id)
);

-- Handbook sections/chapters
CREATE TABLE IF NOT EXISTS handbook_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handbook_version_id UUID NOT NULL REFERENCES handbook_versions(id) ON DELETE CASCADE,
  parent_section_id UUID REFERENCES handbook_sections(id) ON DELETE CASCADE,
  section_number VARCHAR(20),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  content_type VARCHAR(50) DEFAULT 'text' CHECK (content_type IN ('text', 'html', 'markdown', 'pdf')),
  sort_order INTEGER DEFAULT 0,
  is_required_reading BOOLEAN DEFAULT FALSE,
  estimated_read_time_minutes INTEGER,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Company policies
CREATE TABLE IF NOT EXISTS company_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_code VARCHAR(50) UNIQUE,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  content TEXT,
  content_type VARCHAR(50) DEFAULT 'text' CHECK (content_type IN ('text', 'html', 'markdown', 'pdf')),
  document_url TEXT,
  version VARCHAR(20) NOT NULL,
  effective_date DATE NOT NULL,
  review_date DATE,
  expiration_date DATE,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'active', 'archived', 'superseded')),
  requires_acknowledgment BOOLEAN DEFAULT TRUE,
  acknowledgment_frequency VARCHAR(50) DEFAULT 'once' CHECK (acknowledgment_frequency IN ('once', 'annually', 'semi_annually', 'quarterly')),
  applies_to_roles JSONB DEFAULT '[]',
  applies_to_departments JSONB DEFAULT '[]',
  owner_id UUID REFERENCES platform_users(id),
  approved_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  supersedes_policy_id UUID REFERENCES company_policies(id),
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id)
);

-- Employee acknowledgments
CREATE TABLE IF NOT EXISTS employee_acknowledgments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  acknowledgment_type VARCHAR(50) NOT NULL CHECK (acknowledgment_type IN ('handbook', 'policy', 'section')),
  handbook_version_id UUID REFERENCES handbook_versions(id) ON DELETE CASCADE,
  policy_id UUID REFERENCES company_policies(id) ON DELETE CASCADE,
  section_id UUID REFERENCES handbook_sections(id) ON DELETE CASCADE,
  acknowledged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  signature_data TEXT,
  acknowledgment_method VARCHAR(50) DEFAULT 'electronic' CHECK (acknowledgment_method IN ('electronic', 'physical', 'verbal')),
  notes TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT acknowledgment_target CHECK (
    handbook_version_id IS NOT NULL OR policy_id IS NOT NULL OR section_id IS NOT NULL
  )
);

-- Acknowledgment reminders
CREATE TABLE IF NOT EXISTS acknowledgment_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  acknowledgment_type VARCHAR(50) NOT NULL,
  handbook_version_id UUID REFERENCES handbook_versions(id) ON DELETE CASCADE,
  policy_id UUID REFERENCES company_policies(id) ON DELETE CASCADE,
  reminder_date DATE NOT NULL,
  reminder_count INTEGER DEFAULT 0,
  last_reminder_sent TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'acknowledged', 'escalated', 'cancelled')),
  escalated_to UUID REFERENCES platform_users(id),
  escalated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Policy change log
CREATE TABLE IF NOT EXISTS policy_change_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID NOT NULL REFERENCES company_policies(id) ON DELETE CASCADE,
  change_type VARCHAR(50) NOT NULL CHECK (change_type IN ('created', 'updated', 'approved', 'activated', 'archived', 'superseded')),
  previous_version VARCHAR(20),
  new_version VARCHAR(20),
  change_summary TEXT,
  changed_fields JSONB DEFAULT '[]',
  changed_by UUID REFERENCES platform_users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_handbook_versions_status ON handbook_versions(status);
CREATE INDEX IF NOT EXISTS idx_handbook_versions_effective ON handbook_versions(effective_date);
CREATE INDEX IF NOT EXISTS idx_handbook_sections_version ON handbook_sections(handbook_version_id);
CREATE INDEX IF NOT EXISTS idx_handbook_sections_parent ON handbook_sections(parent_section_id);
CREATE INDEX IF NOT EXISTS idx_company_policies_status ON company_policies(status);
CREATE INDEX IF NOT EXISTS idx_company_policies_category ON company_policies(category);
CREATE INDEX IF NOT EXISTS idx_company_policies_effective ON company_policies(effective_date);
CREATE INDEX IF NOT EXISTS idx_employee_acknowledgments_user ON employee_acknowledgments(user_id);
CREATE INDEX IF NOT EXISTS idx_employee_acknowledgments_handbook ON employee_acknowledgments(handbook_version_id);
CREATE INDEX IF NOT EXISTS idx_employee_acknowledgments_policy ON employee_acknowledgments(policy_id);
CREATE INDEX IF NOT EXISTS idx_acknowledgment_reminders_user ON acknowledgment_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_acknowledgment_reminders_status ON acknowledgment_reminders(status);

-- RLS Policies
ALTER TABLE handbook_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE handbook_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_acknowledgments ENABLE ROW LEVEL SECURITY;
ALTER TABLE acknowledgment_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_change_log ENABLE ROW LEVEL SECURITY;

-- Handbook version policies
CREATE POLICY "handbook_versions_select" ON handbook_versions
  FOR SELECT USING (status = 'active' OR EXISTS (
    SELECT 1 FROM platform_users pu
    WHERE pu.id = auth.uid()
    AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
  ));

CREATE POLICY "handbook_versions_manage" ON handbook_versions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

-- Handbook sections policies
CREATE POLICY "handbook_sections_select" ON handbook_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM handbook_versions hv
      WHERE hv.id = handbook_version_id AND hv.status = 'active'
    )
    OR EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

CREATE POLICY "handbook_sections_manage" ON handbook_sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

-- Company policies policies
CREATE POLICY "company_policies_select" ON company_policies
  FOR SELECT USING (status = 'active' OR EXISTS (
    SELECT 1 FROM platform_users pu
    WHERE pu.id = auth.uid()
    AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
  ));

CREATE POLICY "company_policies_manage" ON company_policies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

-- Acknowledgment policies
CREATE POLICY "acknowledgments_select" ON employee_acknowledgments
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

CREATE POLICY "acknowledgments_insert" ON employee_acknowledgments
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Reminder policies
CREATE POLICY "reminders_select" ON acknowledgment_reminders
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

CREATE POLICY "reminders_manage" ON acknowledgment_reminders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

-- Change log policies
CREATE POLICY "change_log_select" ON policy_change_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'ATLVS_TEAM_MEMBER', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

-- Trigger for policy change logging
CREATE OR REPLACE FUNCTION log_policy_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO policy_change_log (policy_id, change_type, new_version, changed_by)
    VALUES (NEW.id, 'created', NEW.version, NEW.created_by);
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      INSERT INTO policy_change_log (policy_id, change_type, previous_version, new_version, change_summary, changed_by)
      VALUES (NEW.id, NEW.status, OLD.version, NEW.version, 'Status changed from ' || OLD.status || ' to ' || NEW.status, NEW.updated_by);
    ELSIF OLD.version != NEW.version THEN
      INSERT INTO policy_change_log (policy_id, change_type, previous_version, new_version, changed_by)
      VALUES (NEW.id, 'updated', OLD.version, NEW.version, NEW.updated_by);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER policy_change_trigger
  AFTER INSERT OR UPDATE ON company_policies
  FOR EACH ROW
  EXECUTE FUNCTION log_policy_change();

-- View for pending acknowledgments
CREATE OR REPLACE VIEW pending_acknowledgments AS
SELECT 
  pu.id as user_id,
  pu.email,
  pu.full_name,
  'handbook' as acknowledgment_type,
  hv.id as item_id,
  hv.title as item_title,
  hv.version_number,
  hv.effective_date,
  hv.effective_date + (hv.acknowledgment_deadline_days || ' days')::interval as deadline,
  NULL as last_acknowledged
FROM platform_users pu
CROSS JOIN handbook_versions hv
WHERE hv.status = 'active' 
  AND hv.requires_acknowledgment = TRUE
  AND NOT EXISTS (
    SELECT 1 FROM employee_acknowledgments ea
    WHERE ea.user_id = pu.id 
    AND ea.handbook_version_id = hv.id
  )
UNION ALL
SELECT 
  pu.id as user_id,
  pu.email,
  pu.full_name,
  'policy' as acknowledgment_type,
  cp.id as item_id,
  cp.title as item_title,
  cp.version,
  cp.effective_date,
  cp.effective_date + INTERVAL '30 days' as deadline,
  (SELECT MAX(acknowledged_at) FROM employee_acknowledgments ea2 WHERE ea2.user_id = pu.id AND ea2.policy_id = cp.id) as last_acknowledged
FROM platform_users pu
CROSS JOIN company_policies cp
WHERE cp.status = 'active' 
  AND cp.requires_acknowledgment = TRUE
  AND (
    -- Never acknowledged
    NOT EXISTS (
      SELECT 1 FROM employee_acknowledgments ea
      WHERE ea.user_id = pu.id 
      AND ea.policy_id = cp.id
    )
    -- Or needs re-acknowledgment based on frequency
    OR (
      cp.acknowledgment_frequency != 'once'
      AND (
        SELECT MAX(acknowledged_at) FROM employee_acknowledgments ea
        WHERE ea.user_id = pu.id AND ea.policy_id = cp.id
      ) < CASE cp.acknowledgment_frequency
        WHEN 'annually' THEN NOW() - INTERVAL '1 year'
        WHEN 'semi_annually' THEN NOW() - INTERVAL '6 months'
        WHEN 'quarterly' THEN NOW() - INTERVAL '3 months'
      END
    )
  );
