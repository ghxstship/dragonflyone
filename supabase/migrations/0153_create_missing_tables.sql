-- Migration: 0153_create_missing_tables.sql
-- Description: Create missing tables referenced by functions

-- tasks table (generic task management)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  production_id UUID REFERENCES productions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'blocked')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID REFERENCES platform_users(id),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  estimated_hours NUMERIC(6,2),
  actual_hours NUMERIC(6,2),
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_org ON tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_production ON tasks(production_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY tasks_select ON tasks FOR SELECT USING (org_matches(organization_id));
CREATE POLICY tasks_manage ON tasks FOR ALL USING (org_matches(organization_id));
GRANT SELECT, INSERT, UPDATE, DELETE ON tasks TO authenticated;

-- staff table (internal staff management)
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES platform_users(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  department TEXT,
  job_title TEXT,
  role TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave', 'terminated')),
  hire_date DATE,
  hourly_rate NUMERIC(10,2),
  salary NUMERIC(12,2),
  skills TEXT[],
  certifications TEXT[],
  availability JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_org ON staff(organization_id);
CREATE INDEX IF NOT EXISTS idx_staff_user ON staff(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_status ON staff(status);

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY staff_select ON staff FOR SELECT USING (org_matches(organization_id));
CREATE POLICY staff_manage ON staff FOR ALL USING (org_matches(organization_id));
GRANT SELECT, INSERT, UPDATE, DELETE ON staff TO authenticated;

-- budget_line_items table
CREATE TABLE IF NOT EXISTS budget_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT NOT NULL,
  planned_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  actual_amount NUMERIC(12,2) DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'committed', 'spent', 'cancelled')),
  vendor_id UUID REFERENCES vendors(id),
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_budget_line_items_org ON budget_line_items(organization_id);
CREATE INDEX IF NOT EXISTS idx_budget_line_items_budget ON budget_line_items(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_line_items_project ON budget_line_items(project_id);

ALTER TABLE budget_line_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY budget_line_items_select ON budget_line_items FOR SELECT USING (org_matches(organization_id));
CREATE POLICY budget_line_items_manage ON budget_line_items FOR ALL USING (org_matches(organization_id));
GRANT SELECT, INSERT, UPDATE, DELETE ON budget_line_items TO authenticated;

-- search_analytics table
CREATE TABLE IF NOT EXISTS search_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES platform_users(id),
  search_query TEXT NOT NULL,
  search_type TEXT DEFAULT 'general',
  result_count INT DEFAULT 0,
  clicked_result_id UUID,
  clicked_result_type TEXT,
  session_id TEXT,
  platform TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_analytics_org ON search_analytics(organization_id);
CREATE INDEX IF NOT EXISTS idx_search_analytics_created ON search_analytics(created_at);

ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY search_analytics_select ON search_analytics FOR SELECT USING (TRUE);
CREATE POLICY search_analytics_insert ON search_analytics FOR INSERT WITH CHECK (TRUE);
GRANT SELECT, INSERT ON search_analytics TO authenticated;

-- integration_deal_links table
CREATE TABLE IF NOT EXISTS integration_deal_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  integration_type TEXT NOT NULL,
  external_id TEXT NOT NULL,
  external_url TEXT,
  sync_status TEXT DEFAULT 'synced',
  last_synced_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(deal_id, integration_type)
);

CREATE INDEX IF NOT EXISTS idx_integration_deal_links_org ON integration_deal_links(organization_id);
CREATE INDEX IF NOT EXISTS idx_integration_deal_links_deal ON integration_deal_links(deal_id);

ALTER TABLE integration_deal_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY integration_deal_links_select ON integration_deal_links FOR SELECT USING (org_matches(organization_id));
CREATE POLICY integration_deal_links_manage ON integration_deal_links FOR ALL USING (org_matches(organization_id));
GRANT SELECT, INSERT, UPDATE, DELETE ON integration_deal_links TO authenticated;
