-- 0047_notifications_system.sql
-- User notifications and alerts system

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  type text NOT NULL, -- task_assigned, task_due, budget_alert, project_update, etc.
  title text NOT NULL,
  message text NOT NULL,
  severity text DEFAULT 'info', -- info, warning, error, success
  read boolean DEFAULT false,
  read_at timestamptz,
  action_url text,
  action_label text,
  resource_type text,
  resource_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, read, created_at DESC);
CREATE INDEX idx_notifications_org ON notifications(organization_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_expires ON notifications(expires_at) WHERE expires_at IS NOT NULL;

-- RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_select ON notifications
  FOR SELECT USING (
    auth.uid() = user_id OR
    (organization_id IS NOT NULL AND org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'))
  );

CREATE POLICY notifications_update ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY notifications_delete ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_org_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_severity text DEFAULT 'info',
  p_action_url text DEFAULT NULL,
  p_action_label text DEFAULT NULL,
  p_resource_type text DEFAULT NULL,
  p_resource_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb,
  p_expires_at timestamptz DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id uuid;
BEGIN
  INSERT INTO notifications (
    user_id, organization_id, type, title, message, severity,
    action_url, action_label, resource_type, resource_id, metadata, expires_at
  ) VALUES (
    p_user_id, p_org_id, p_type, p_title, p_message, p_severity,
    p_action_url, p_action_label, p_resource_type, p_resource_id, p_metadata, p_expires_at
  ) RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE notifications
  SET read = true, read_at = now()
  WHERE id = p_notification_id AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id uuid DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE notifications
  SET read = true, read_at = now()
  WHERE user_id = COALESCE(p_user_id, auth.uid())
    AND read = false;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id uuid DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM notifications
  WHERE user_id = COALESCE(p_user_id, auth.uid())
    AND read = false
    AND (expires_at IS NULL OR expires_at > now());
  
  RETURN v_count;
END;
$$;

-- Trigger to create notification when task is assigned
CREATE OR REPLACE FUNCTION notify_task_assignment()
RETURNS TRIGGER AS $$
DECLARE
  v_project_name text;
  v_org_id uuid;
BEGIN
  IF NEW.assigned_to IS NOT NULL AND (OLD.assigned_to IS NULL OR OLD.assigned_to != NEW.assigned_to) THEN
    SELECT p.name, p.organization_id INTO v_project_name, v_org_id
    FROM projects p WHERE p.id = NEW.project_id;
    
    PERFORM create_notification(
      NEW.assigned_to,
      v_org_id,
      'task_assigned',
      'New Task Assigned',
      'You have been assigned to: ' || NEW.title || ' in ' || v_project_name,
      'info',
      '/projects/' || NEW.project_id || '/tasks/' || NEW.id,
      'View Task',
      'task',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_on_task_assignment
  AFTER INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION notify_task_assignment();

-- Trigger to notify when task is due soon
CREATE OR REPLACE FUNCTION check_task_due_dates()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_task record;
BEGIN
  FOR v_task IN
    SELECT t.id, t.title, t.assigned_to, t.due_date, t.project_id, p.name as project_name, p.organization_id
    FROM tasks t
    JOIN projects p ON p.id = t.project_id
    WHERE t.status != 'completed'
      AND t.due_date IS NOT NULL
      AND t.due_date BETWEEN now() AND now() + interval '24 hours'
      AND NOT EXISTS (
        SELECT 1 FROM notifications n
        WHERE n.resource_id = t.id
          AND n.type = 'task_due_soon'
          AND n.created_at > now() - interval '24 hours'
      )
  LOOP
    PERFORM create_notification(
      v_task.assigned_to,
      v_task.organization_id,
      'task_due_soon',
      'Task Due Soon',
      'Task "' || v_task.title || '" is due within 24 hours',
      'warning',
      '/projects/' || v_task.project_id || '/tasks/' || v_task.id,
      'View Task',
      'task',
      v_task.id
    );
  END LOOP;
END;
$$;

-- Trigger to notify on budget threshold breach
CREATE OR REPLACE FUNCTION notify_budget_threshold()
RETURNS TRIGGER AS $$
DECLARE
  v_project record;
  v_total_cost numeric;
  v_threshold numeric;
BEGIN
  SELECT p.*, COALESCE(SUM(bli.actual_cost), 0) as total_cost
  INTO v_project
  FROM projects p
  LEFT JOIN budget_line_items bli ON bli.project_id = p.id
  WHERE p.id = NEW.project_id
  GROUP BY p.id;
  
  v_threshold := v_project.budget * 0.90; -- 90% threshold
  
  IF v_project.total_cost >= v_threshold AND v_project.total_cost < v_project.budget THEN
    -- Notify project owner
    PERFORM create_notification(
      v_project.created_by,
      v_project.organization_id,
      'budget_warning',
      'Budget Threshold Reached',
      'Project "' || v_project.name || '" has used ' || 
        ROUND((v_project.total_cost / v_project.budget * 100)::numeric, 1) || '% of budget',
      'warning',
      '/projects/' || v_project.id || '/budget',
      'View Budget',
      'project',
      v_project.id
    );
  ELSIF v_project.total_cost > v_project.budget THEN
    -- Notify on over-budget
    PERFORM create_notification(
      v_project.created_by,
      v_project.organization_id,
      'budget_exceeded',
      'Budget Exceeded',
      'Project "' || v_project.name || '" has exceeded budget by ' || 
        TO_CHAR(v_project.total_cost - v_project.budget, 'FM$999,999,999.00'),
      'error',
      '/projects/' || v_project.id || '/budget',
      'View Budget',
      'project',
      v_project.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_on_budget_change
  AFTER INSERT OR UPDATE ON budget_line_items
  FOR EACH ROW
  EXECUTE FUNCTION notify_budget_threshold();

-- Clean up expired notifications (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted_count integer;
BEGIN
  DELETE FROM notifications
  WHERE expires_at IS NOT NULL AND expires_at < now();
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$;

GRANT SELECT ON notifications TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notification_read TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_read TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_notification_count TO authenticated;
GRANT EXECUTE ON FUNCTION check_task_due_dates TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_notifications TO authenticated;

COMMENT ON TABLE notifications IS 'User notifications and alerts system';
COMMENT ON FUNCTION create_notification IS 'Creates a new notification for a user';
COMMENT ON FUNCTION mark_notification_read IS 'Marks a single notification as read';
COMMENT ON FUNCTION mark_all_notifications_read IS 'Marks all notifications as read for a user';
COMMENT ON FUNCTION get_unread_notification_count IS 'Returns count of unread notifications';
COMMENT ON FUNCTION check_task_due_dates IS 'Checks for tasks due soon and creates notifications';
COMMENT ON FUNCTION cleanup_expired_notifications IS 'Removes expired notifications';
