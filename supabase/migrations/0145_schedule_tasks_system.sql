-- =============================================================================
-- SCHEDULE TASKS SYSTEM
-- Task management for production schedules and action items
-- Required by: apps/atlvs/src/hooks/useActionItems.ts
-- =============================================================================

-- Schedule Tasks Table
CREATE TABLE IF NOT EXISTS schedule_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  production_id UUID REFERENCES productions(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  
  -- Task details
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT DEFAULT 'general' CHECK (task_type IN (
    'general', 'milestone', 'deadline', 'meeting', 'review', 
    'approval', 'delivery', 'setup', 'rehearsal', 'show'
  )),
  
  -- Priority and status
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'blocked')),
  
  -- Scheduling
  start_date TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Assignment
  assigned_to UUID REFERENCES platform_users(id),
  assigned_by UUID REFERENCES platform_users(id),
  department TEXT,
  
  -- Dependencies
  depends_on UUID[] DEFAULT '{}',
  blocks UUID[] DEFAULT '{}',
  
  -- Progress tracking
  estimated_hours NUMERIC(6,2),
  actual_hours NUMERIC(6,2),
  progress_percent INT DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  attachments JSONB DEFAULT '[]',
  
  -- Audit
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_schedule_tasks_org ON schedule_tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_schedule_tasks_production ON schedule_tasks(production_id);
CREATE INDEX IF NOT EXISTS idx_schedule_tasks_project ON schedule_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_schedule_tasks_event ON schedule_tasks(event_id);
CREATE INDEX IF NOT EXISTS idx_schedule_tasks_status ON schedule_tasks(status);
CREATE INDEX IF NOT EXISTS idx_schedule_tasks_priority ON schedule_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_schedule_tasks_assigned ON schedule_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_schedule_tasks_due ON schedule_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_schedule_tasks_type ON schedule_tasks(task_type);
CREATE INDEX IF NOT EXISTS idx_schedule_tasks_status_priority ON schedule_tasks(status, priority);

-- Task comments/updates
CREATE TABLE IF NOT EXISTS schedule_task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES schedule_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id),
  content TEXT NOT NULL,
  is_status_change BOOLEAN DEFAULT false,
  old_status TEXT,
  new_status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schedule_task_comments_task ON schedule_task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_schedule_task_comments_user ON schedule_task_comments(user_id);

-- Task time entries
CREATE TABLE IF NOT EXISTS schedule_task_time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES schedule_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id),
  hours NUMERIC(6,2) NOT NULL,
  description TEXT,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schedule_task_time_task ON schedule_task_time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_schedule_task_time_user ON schedule_task_time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_schedule_task_time_date ON schedule_task_time_entries(entry_date);

-- Enable RLS
ALTER TABLE schedule_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_task_time_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for schedule_tasks
CREATE POLICY "schedule_tasks_select_policy" ON schedule_tasks
  FOR SELECT USING (true);

CREATE POLICY "schedule_tasks_insert_policy" ON schedule_tasks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "schedule_tasks_update_policy" ON schedule_tasks
  FOR UPDATE USING (true);

CREATE POLICY "schedule_tasks_delete_policy" ON schedule_tasks
  FOR DELETE USING (true);

-- RLS Policies for schedule_task_comments
CREATE POLICY "schedule_task_comments_select_policy" ON schedule_task_comments
  FOR SELECT USING (true);

CREATE POLICY "schedule_task_comments_insert_policy" ON schedule_task_comments
  FOR INSERT WITH CHECK (true);

-- RLS Policies for schedule_task_time_entries
CREATE POLICY "schedule_task_time_entries_select_policy" ON schedule_task_time_entries
  FOR SELECT USING (true);

CREATE POLICY "schedule_task_time_entries_insert_policy" ON schedule_task_time_entries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "schedule_task_time_entries_update_policy" ON schedule_task_time_entries
  FOR UPDATE USING (true);

CREATE POLICY "schedule_task_time_entries_delete_policy" ON schedule_task_time_entries
  FOR DELETE USING (true);

-- Updated_at trigger
CREATE TRIGGER set_schedule_tasks_updated_at
  BEFORE UPDATE ON schedule_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to get action items for dashboard
CREATE OR REPLACE FUNCTION get_dashboard_action_items(
  p_user_id UUID DEFAULT NULL,
  p_limit INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  source TEXT,
  title TEXT,
  description TEXT,
  priority TEXT,
  status TEXT,
  due_date TIMESTAMPTZ,
  assigned_to UUID,
  production_id UUID,
  project_id UUID,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    st.id,
    'task'::TEXT as source,
    st.title,
    st.description,
    st.priority,
    st.status,
    st.due_date,
    st.assigned_to,
    st.production_id,
    st.project_id,
    st.created_at
  FROM schedule_tasks st
  WHERE st.status IN ('pending', 'in_progress')
    AND (p_user_id IS NULL OR st.assigned_to = p_user_id)
  ORDER BY 
    CASE st.priority 
      WHEN 'critical' THEN 1 
      WHEN 'high' THEN 2 
      WHEN 'medium' THEN 3 
      WHEN 'low' THEN 4 
    END,
    st.due_date ASC NULLS LAST
  LIMIT p_limit;
END;
$$;

-- Function to update task progress
CREATE OR REPLACE FUNCTION update_task_progress(
  p_task_id UUID,
  p_progress INT,
  p_user_id UUID
)
RETURNS schedule_tasks
LANGUAGE plpgsql
AS $$
DECLARE
  v_task schedule_tasks;
  v_old_status TEXT;
  v_new_status TEXT;
BEGIN
  SELECT status INTO v_old_status FROM schedule_tasks WHERE id = p_task_id;
  
  -- Auto-update status based on progress
  IF p_progress = 100 THEN
    v_new_status := 'completed';
  ELSIF p_progress > 0 THEN
    v_new_status := 'in_progress';
  ELSE
    v_new_status := 'pending';
  END IF;
  
  UPDATE schedule_tasks
  SET 
    progress_percent = p_progress,
    status = v_new_status,
    completed_at = CASE WHEN p_progress = 100 THEN NOW() ELSE NULL END,
    updated_at = NOW()
  WHERE id = p_task_id
  RETURNING * INTO v_task;
  
  -- Log status change if changed
  IF v_old_status != v_new_status THEN
    INSERT INTO schedule_task_comments (task_id, user_id, content, is_status_change, old_status, new_status)
    VALUES (p_task_id, p_user_id, 'Status changed from ' || v_old_status || ' to ' || v_new_status, true, v_old_status, v_new_status);
  END IF;
  
  RETURN v_task;
END;
$$;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON schedule_tasks TO authenticated;
GRANT SELECT, INSERT ON schedule_task_comments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON schedule_task_time_entries TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_action_items(UUID, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_task_progress(UUID, INT, UUID) TO authenticated;

-- Seed some sample tasks for demo
INSERT INTO schedule_tasks (title, description, priority, status, due_date, task_type) VALUES
  ('Review Q4 Budget Proposal', 'Review and approve the Q4 budget allocation for marketing campaigns', 'high', 'pending', NOW() + INTERVAL '2 days', 'approval'),
  ('Complete Vendor Contracts', 'Finalize contracts with audio/visual vendors for Summer Festival', 'critical', 'in_progress', NOW() + INTERVAL '1 day', 'deadline'),
  ('Schedule Production Meeting', 'Coordinate with all department heads for pre-production kickoff', 'medium', 'pending', NOW() + INTERVAL '5 days', 'meeting'),
  ('Update Asset Inventory', 'Complete quarterly inventory audit of all production equipment', 'low', 'pending', NOW() + INTERVAL '14 days', 'general'),
  ('Submit Insurance Documentation', 'Provide updated COI for upcoming venue bookings', 'high', 'pending', NOW() + INTERVAL '3 days', 'delivery')
ON CONFLICT DO NOTHING;
