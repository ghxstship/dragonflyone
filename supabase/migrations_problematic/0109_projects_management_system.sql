-- Migration: Projects Management System
-- Description: Tables for project management, phases, milestones, and deliverables

-- Projects table (enhanced)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  client_id UUID REFERENCES contacts(id),
  client_name TEXT,
  project_type TEXT CHECK (project_type IN ('event', 'tour', 'festival', 'corporate', 'broadcast', 'installation', 'rental', 'other')),
  phase TEXT NOT NULL DEFAULT 'intake' CHECK (phase IN ('intake', 'preproduction', 'in_production', 'post', 'completed', 'cancelled', 'on_hold')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'on_hold', 'archived')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  start_date DATE,
  end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  budget NUMERIC(15,2),
  actual_cost NUMERIC(15,2),
  revenue NUMERIC(15,2),
  profit_margin NUMERIC(5,2),
  currency TEXT DEFAULT 'USD',
  project_manager_id UUID REFERENCES platform_users(id),
  account_manager_id UUID REFERENCES platform_users(id),
  team_lead_id UUID REFERENCES platform_users(id),
  venue_id UUID REFERENCES venues(id),
  location TEXT,
  timezone TEXT DEFAULT 'America/New_York',
  tags TEXT[],
  custom_fields JSONB,
  notes TEXT,
  internal_notes TEXT,
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  completion_percentage INT DEFAULT 0,
  is_template BOOLEAN DEFAULT false,
  template_id UUID REFERENCES projects(id),
  parent_project_id UUID REFERENCES projects(id),
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, code)
);

CREATE INDEX IF NOT EXISTS idx_projects_org ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_code ON projects(code);
CREATE INDEX IF NOT EXISTS idx_projects_phase ON projects(phase);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_manager ON projects(project_manager_id);
CREATE INDEX IF NOT EXISTS idx_projects_dates ON projects(start_date, end_date);

-- Project phases table
CREATE TABLE IF NOT EXISTS project_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase_name TEXT NOT NULL,
  phase_order INT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  completion_percentage INT DEFAULT 0,
  deliverables TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, phase_name)
);

CREATE INDEX IF NOT EXISTS idx_project_phases_project ON project_phases(project_id);
CREATE INDEX IF NOT EXISTS idx_project_phases_status ON project_phases(status);

-- Project milestones table
CREATE TABLE IF NOT EXISTS project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES project_phases(id),
  name TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  completed_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  assigned_to UUID REFERENCES platform_users(id),
  dependencies UUID[],
  is_billable BOOLEAN DEFAULT false,
  billing_amount NUMERIC(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_milestones_project ON project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_project_milestones_phase ON project_milestones(phase_id);
CREATE INDEX IF NOT EXISTS idx_project_milestones_due ON project_milestones(due_date);
CREATE INDEX IF NOT EXISTS idx_project_milestones_status ON project_milestones(status);

-- Project tasks table
CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES project_phases(id),
  milestone_id UUID REFERENCES project_milestones(id),
  parent_task_id UUID REFERENCES project_tasks(id),
  task_number TEXT,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT CHECK (task_type IN ('task', 'subtask', 'bug', 'feature', 'improvement', 'documentation')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'completed', 'blocked', 'cancelled')),
  assigned_to UUID REFERENCES platform_users(id),
  reporter_id UUID REFERENCES platform_users(id),
  due_date DATE,
  start_date DATE,
  completed_date DATE,
  estimated_hours NUMERIC(6,2),
  actual_hours NUMERIC(6,2),
  tags TEXT[],
  attachments TEXT[],
  checklist JSONB,
  dependencies UUID[],
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_tasks_project ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_phase ON project_tasks(phase_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_milestone ON project_tasks(milestone_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_assigned ON project_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON project_tasks(status);
CREATE INDEX IF NOT EXISTS idx_project_tasks_due ON project_tasks(due_date);

-- Project team members table
CREATE TABLE IF NOT EXISTS project_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id),
  role TEXT NOT NULL,
  department TEXT,
  start_date DATE,
  end_date DATE,
  allocation_percentage INT DEFAULT 100,
  hourly_rate NUMERIC(10,2),
  is_lead BOOLEAN DEFAULT false,
  permissions TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_project_team_members_project ON project_team_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_team_members_user ON project_team_members(user_id);

-- Project budget items table
CREATE TABLE IF NOT EXISTS project_budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT NOT NULL,
  budget_type TEXT NOT NULL CHECK (budget_type IN ('expense', 'revenue', 'labor', 'equipment', 'venue', 'travel', 'other')),
  estimated_amount NUMERIC(15,2) NOT NULL,
  actual_amount NUMERIC(15,2) DEFAULT 0,
  variance NUMERIC(15,2) GENERATED ALWAYS AS (actual_amount - estimated_amount) STORED,
  vendor_id UUID ,
  invoice_id UUID,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'committed', 'paid', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_budget_items_project ON project_budget_items(project_id);
CREATE INDEX IF NOT EXISTS idx_project_budget_items_category ON project_budget_items(category);
CREATE INDEX IF NOT EXISTS idx_project_budget_items_type ON project_budget_items(budget_type);

-- Project documents table
CREATE TABLE IF NOT EXISTS project_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('contract', 'proposal', 'invoice', 'rider', 'technical', 'schedule', 'budget', 'report', 'other')),
  name TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_size INT,
  file_type TEXT,
  version INT DEFAULT 1,
  is_current BOOLEAN DEFAULT true,
  uploaded_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_documents_project ON project_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_project_documents_type ON project_documents(document_type);

-- Function to update project completion percentage
CREATE OR REPLACE FUNCTION update_project_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_total INT;
  v_completed INT;
  v_percentage INT;
BEGIN
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'completed')
  INTO v_total, v_completed
  FROM project_tasks
  WHERE project_id = COALESCE(NEW.project_id, OLD.project_id);
  
  v_percentage := CASE WHEN v_total > 0 THEN ROUND((v_completed::NUMERIC / v_total) * 100) ELSE 0 END;
  
  UPDATE projects SET
    completion_percentage = v_percentage,
    phase = CASE 
      WHEN v_percentage = 100 THEN 'completed'
      WHEN v_percentage > 0 THEN 'in_production'
      ELSE phase
    END,
    updated_at = NOW()
  WHERE id = COALESCE(NEW.project_id, OLD.project_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS project_task_completion_trigger ON project_tasks;
CREATE TRIGGER project_task_completion_trigger
  AFTER INSERT OR UPDATE OR DELETE ON project_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_project_completion();

-- Function to update milestone status
CREATE OR REPLACE FUNCTION update_milestone_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check for overdue milestones
  UPDATE project_milestones SET
    status = 'overdue'
  WHERE status = 'pending'
    AND due_date < CURRENT_DATE;
  
  RETURN NULL;
END;
$$;

-- Function to get project summary
CREATE OR REPLACE FUNCTION get_project_summary(p_project_id UUID)
RETURNS TABLE (
  project_id UUID,
  project_name TEXT,
  phase TEXT,
  completion_percentage INT,
  total_tasks INT,
  completed_tasks INT,
  overdue_tasks INT,
  budget NUMERIC,
  actual_cost NUMERIC,
  budget_variance NUMERIC,
  team_size INT,
  days_remaining INT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.phase,
    p.completion_percentage,
    (SELECT COUNT(*)::INT FROM project_tasks WHERE project_id = p.id) as total_tasks,
    (SELECT COUNT(*)::INT FROM project_tasks WHERE project_id = p.id AND status = 'completed') as completed_tasks,
    (SELECT COUNT(*)::INT FROM project_tasks WHERE project_id = p.id AND due_date < CURRENT_DATE AND status NOT IN ('completed', 'cancelled')) as overdue_tasks,
    p.budget,
    COALESCE(p.actual_cost, 0) as actual_cost,
    COALESCE(p.budget - p.actual_cost, p.budget) as budget_variance,
    (SELECT COUNT(DISTINCT user_id)::INT FROM project_team_members WHERE project_id = p.id) as team_size,
    CASE WHEN p.end_date IS NOT NULL THEN (p.end_date - CURRENT_DATE)::INT ELSE NULL END as days_remaining
  FROM projects p
  WHERE p.id = p_project_id;
END;
$$;

-- RLS policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON project_phases TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON project_milestones TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON project_tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON project_team_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON project_budget_items TO authenticated;
GRANT SELECT, INSERT, DELETE ON project_documents TO authenticated;
GRANT EXECUTE ON FUNCTION get_project_summary(UUID) TO authenticated;
