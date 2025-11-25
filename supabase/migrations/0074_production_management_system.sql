-- Migration: Production Management System
-- Description: Tables for production planning, stages, departments, and workflows

-- Productions table
CREATE TABLE IF NOT EXISTS productions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  event_id UUID REFERENCES events(id),
  project_id UUID NOT NULL REFERENCES projects(id),
  production_type TEXT NOT NULL CHECK (production_type IN ('concert', 'festival', 'corporate', 'theater', 'sports', 'broadcast', 'film', 'other')),
  venue_id UUID REFERENCES venues(id),
  load_in_date DATE NOT NULL,
  load_out_date DATE NOT NULL,
  event_date DATE NOT NULL,
  event_end_date DATE,
  doors_time TIME,
  show_time TIME,
  curfew_time TIME,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'advancing', 'in_progress', 'completed', 'cancelled', 'postponed')),
  crew_count INT,
  budget NUMERIC(15,2),
  actual_cost NUMERIC(15,2),
  production_manager_id UUID REFERENCES platform_users(id),
  stage_manager_id UUID REFERENCES platform_users(id),
  technical_director_id UUID REFERENCES platform_users(id),
  notes TEXT,
  special_requirements TEXT,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (load_out_date >= load_in_date),
  CHECK (event_date >= load_in_date)
);

CREATE INDEX IF NOT EXISTS idx_productions_org ON productions(organization_id);
CREATE INDEX IF NOT EXISTS idx_productions_project ON productions(project_id);
CREATE INDEX IF NOT EXISTS idx_productions_event ON productions(event_id);
CREATE INDEX IF NOT EXISTS idx_productions_venue ON productions(venue_id);
CREATE INDEX IF NOT EXISTS idx_productions_status ON productions(status);
CREATE INDEX IF NOT EXISTS idx_productions_event_date ON productions(event_date);

-- Production departments table
CREATE TABLE IF NOT EXISTS production_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_id UUID NOT NULL REFERENCES productions(id) ON DELETE CASCADE,
  department_name TEXT NOT NULL CHECK (department_name IN ('audio', 'lighting', 'video', 'staging', 'rigging', 'backline', 'catering', 'security', 'transportation', 'hospitality', 'production', 'other')),
  head_id UUID REFERENCES platform_users(id),
  budget NUMERIC(10,2),
  actual_cost NUMERIC(10,2),
  crew_count INT,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(production_id, department_name)
);

CREATE INDEX IF NOT EXISTS idx_production_departments_production ON production_departments(production_id);
CREATE INDEX IF NOT EXISTS idx_production_departments_head ON production_departments(head_id);

-- Production stages table
CREATE TABLE IF NOT EXISTS production_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_id UUID NOT NULL REFERENCES productions(id) ON DELETE CASCADE,
  stage_name TEXT NOT NULL,
  stage_type TEXT CHECK (stage_type IN ('main', 'secondary', 'outdoor', 'indoor', 'tent', 'other')),
  capacity INT,
  dimensions JSONB,
  power_requirements TEXT,
  rigging_points INT,
  load_capacity_lbs NUMERIC(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(production_id, stage_name)
);

CREATE INDEX IF NOT EXISTS idx_production_stages_production ON production_stages(production_id);

-- Production timeline table
CREATE TABLE IF NOT EXISTS production_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_id UUID NOT NULL REFERENCES productions(id) ON DELETE CASCADE,
  milestone_name TEXT NOT NULL,
  milestone_type TEXT NOT NULL CHECK (milestone_type IN ('load_in', 'setup', 'soundcheck', 'doors', 'show_start', 'intermission', 'show_end', 'load_out', 'custom')),
  scheduled_time TIMESTAMPTZ NOT NULL,
  actual_time TIMESTAMPTZ,
  duration_minutes INT,
  department TEXT,
  responsible_id UUID REFERENCES platform_users(id),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'delayed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_production_timeline_production ON production_timeline(production_id);
CREATE INDEX IF NOT EXISTS idx_production_timeline_time ON production_timeline(scheduled_time);

-- Production checklist table
CREATE TABLE IF NOT EXISTS production_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_id UUID NOT NULL REFERENCES productions(id) ON DELETE CASCADE,
  checklist_name TEXT NOT NULL,
  department TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  completed_items INT DEFAULT 0,
  total_items INT DEFAULT 0,
  completion_percentage NUMERIC(5,2) DEFAULT 0,
  due_date TIMESTAMPTZ,
  assigned_to UUID REFERENCES platform_users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_production_checklists_production ON production_checklists(production_id);
CREATE INDEX IF NOT EXISTS idx_production_checklists_assigned ON production_checklists(assigned_to);

-- Production notes/logs table
CREATE TABLE IF NOT EXISTS production_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_id UUID NOT NULL REFERENCES productions(id) ON DELETE CASCADE,
  log_type TEXT NOT NULL CHECK (log_type IN ('note', 'issue', 'update', 'decision', 'change', 'communication')),
  title TEXT,
  content TEXT NOT NULL,
  department TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  visibility TEXT DEFAULT 'team' CHECK (visibility IN ('private', 'team', 'department', 'all')),
  attachments TEXT[],
  created_by UUID NOT NULL REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_production_logs_production ON production_logs(production_id);
CREATE INDEX IF NOT EXISTS idx_production_logs_type ON production_logs(log_type);
CREATE INDEX IF NOT EXISTS idx_production_logs_created ON production_logs(created_at);

-- Production contacts table
CREATE TABLE IF NOT EXISTS production_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_id UUID NOT NULL REFERENCES productions(id) ON DELETE CASCADE,
  contact_type TEXT NOT NULL CHECK (contact_type IN ('artist', 'management', 'agent', 'venue', 'vendor', 'sponsor', 'media', 'emergency', 'other')),
  name TEXT NOT NULL,
  company TEXT,
  role TEXT,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  notes TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_production_contacts_production ON production_contacts(production_id);
CREATE INDEX IF NOT EXISTS idx_production_contacts_type ON production_contacts(contact_type);

-- Function to update production status based on dates
CREATE OR REPLACE FUNCTION update_production_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status NOT IN ('cancelled', 'postponed') THEN
    IF CURRENT_DATE > NEW.load_out_date THEN
      NEW.status := 'completed';
    ELSIF CURRENT_DATE >= NEW.load_in_date AND CURRENT_DATE <= NEW.load_out_date THEN
      NEW.status := 'in_progress';
    ELSIF CURRENT_DATE >= NEW.load_in_date - 14 THEN
      NEW.status := 'advancing';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS production_status_trigger ON productions;
CREATE TRIGGER production_status_trigger
  BEFORE INSERT OR UPDATE ON productions
  FOR EACH ROW
  EXECUTE FUNCTION update_production_status();

-- Function to update checklist completion
CREATE OR REPLACE FUNCTION update_checklist_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_total INT;
  v_completed INT;
BEGIN
  SELECT 
    jsonb_array_length(NEW.items),
    COUNT(*) FILTER (WHERE (item->>'completed')::BOOLEAN = TRUE)
  INTO v_total, v_completed
  FROM jsonb_array_elements(NEW.items) AS item;
  
  NEW.total_items := v_total;
  NEW.completed_items := v_completed;
  NEW.completion_percentage := CASE WHEN v_total > 0 THEN ROUND((v_completed::NUMERIC / v_total) * 100, 2) ELSE 0 END;
  NEW.status := CASE 
    WHEN v_completed = v_total AND v_total > 0 THEN 'completed'
    WHEN v_completed > 0 THEN 'in_progress'
    ELSE 'pending'
  END;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS checklist_completion_trigger ON production_checklists;
CREATE TRIGGER checklist_completion_trigger
  BEFORE INSERT OR UPDATE ON production_checklists
  FOR EACH ROW
  EXECUTE FUNCTION update_checklist_completion();

-- Function to get production summary
CREATE OR REPLACE FUNCTION get_production_summary(p_production_id UUID)
RETURNS TABLE (
  production_id UUID,
  production_name TEXT,
  status TEXT,
  days_until_event INT,
  crew_assigned INT,
  budget_remaining NUMERIC,
  checklist_completion NUMERIC,
  open_issues INT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.status,
    (p.event_date - CURRENT_DATE)::INT as days_until_event,
    (SELECT COUNT(DISTINCT crew_id)::INT FROM crew_assignments WHERE project_id = p.project_id) as crew_assigned,
    COALESCE(p.budget - p.actual_cost, p.budget) as budget_remaining,
    COALESCE((SELECT AVG(completion_percentage) FROM production_checklists WHERE production_id = p.id), 0) as checklist_completion,
    (SELECT COUNT(*)::INT FROM production_logs WHERE production_id = p.id AND log_type = 'issue' AND priority IN ('high', 'urgent')) as open_issues
  FROM productions p
  WHERE p.id = p_production_id;
END;
$$;

-- RLS policies
ALTER TABLE productions ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_contacts ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON productions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON production_departments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON production_stages TO authenticated;
GRANT SELECT, INSERT, UPDATE ON production_timeline TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON production_checklists TO authenticated;
GRANT SELECT, INSERT ON production_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON production_contacts TO authenticated;
GRANT EXECUTE ON FUNCTION get_production_summary(UUID) TO authenticated;
