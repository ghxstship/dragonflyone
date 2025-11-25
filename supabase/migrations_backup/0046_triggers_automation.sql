-- 0046_triggers_automation.sql
-- Database triggers for automation and data integrity

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all major tables
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-complete parent task when all subtasks are complete
CREATE OR REPLACE FUNCTION auto_complete_parent_task()
RETURNS TRIGGER AS $$
DECLARE
  v_parent_id uuid;
  v_incomplete_count integer;
BEGIN
  -- Only check if a task was just completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Check if this task has a parent
    SELECT parent_task_id INTO v_parent_id FROM tasks WHERE id = NEW.id;
    
    IF v_parent_id IS NOT NULL THEN
      -- Count incomplete child tasks
      SELECT COUNT(*) INTO v_incomplete_count
      FROM tasks
      WHERE parent_task_id = v_parent_id
        AND status != 'completed';
      
      -- If no incomplete tasks, complete the parent
      IF v_incomplete_count = 0 THEN
        UPDATE tasks
        SET status = 'completed', completed_at = now()
        WHERE id = v_parent_id AND status != 'completed';
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_complete_parent_task_trigger
  AFTER UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION auto_complete_parent_task();

-- Auto-update project status based on tasks
CREATE OR REPLACE FUNCTION update_project_status()
RETURNS TRIGGER AS $$
DECLARE
  v_project_id uuid;
  v_total_tasks integer;
  v_completed_tasks integer;
BEGIN
  v_project_id := COALESCE(NEW.project_id, OLD.project_id);
  
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'completed')
  INTO v_total_tasks, v_completed_tasks
  FROM tasks
  WHERE project_id = v_project_id;
  
  -- Update project status based on task completion
  IF v_total_tasks > 0 THEN
    IF v_completed_tasks = v_total_tasks THEN
      UPDATE projects SET status = 'completed' WHERE id = v_project_id AND status != 'completed';
    ELSIF v_completed_tasks > 0 THEN
      UPDATE projects SET status = 'in_progress' WHERE id = v_project_id AND status = 'planning';
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_project_status_on_task_change
  AFTER INSERT OR UPDATE OR DELETE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_project_status();

-- Validate budget line items don't exceed project budget
CREATE OR REPLACE FUNCTION validate_budget_allocation()
RETURNS TRIGGER AS $$
DECLARE
  v_project_budget numeric;
  v_total_allocated numeric;
BEGIN
  SELECT budget INTO v_project_budget
  FROM projects WHERE id = NEW.project_id;
  
  SELECT COALESCE(SUM(amount), 0) INTO v_total_allocated
  FROM budget_line_items
  WHERE project_id = NEW.project_id
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
  
  IF (v_total_allocated + NEW.amount) > (v_project_budget * 1.1) THEN
    RAISE EXCEPTION 'Budget allocation exceeds project budget by more than 10%%';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_budget_before_insert
  BEFORE INSERT OR UPDATE ON budget_line_items
  FOR EACH ROW
  EXECUTE FUNCTION validate_budget_allocation();

-- Auto-create audit entries for sensitive operations
CREATE OR REPLACE FUNCTION auto_audit_sensitive_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid;
  v_action text;
BEGIN
  v_user_id := auth.uid();
  
  IF TG_OP = 'DELETE' THEN
    v_action := 'DELETE';
    INSERT INTO audit_log (user_id, action, resource_type, resource_id, metadata)
    VALUES (v_user_id, v_action, TG_TABLE_NAME, OLD.id, row_to_json(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'UPDATE';
    INSERT INTO audit_log (user_id, action, resource_type, resource_id, metadata)
    VALUES (v_user_id, v_action, TG_TABLE_NAME, NEW.id, 
      jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW)));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    v_action := 'CREATE';
    INSERT INTO audit_log (user_id, action, resource_type, resource_id, metadata)
    VALUES (v_user_id, v_action, TG_TABLE_NAME, NEW.id, row_to_json(NEW));
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER audit_projects_changes
  AFTER INSERT OR UPDATE OR DELETE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION auto_audit_sensitive_changes();

CREATE TRIGGER audit_budget_changes
  AFTER INSERT OR UPDATE OR DELETE ON budget_line_items
  FOR EACH ROW
  EXECUTE FUNCTION auto_audit_sensitive_changes();

-- Prevent deletion of projects with active tasks
CREATE OR REPLACE FUNCTION prevent_project_deletion_with_tasks()
RETURNS TRIGGER AS $$
DECLARE
  v_task_count integer;
BEGIN
  SELECT COUNT(*) INTO v_task_count
  FROM tasks
  WHERE project_id = OLD.id AND status != 'completed';
  
  IF v_task_count > 0 THEN
    RAISE EXCEPTION 'Cannot delete project with % active tasks. Complete or remove tasks first.', v_task_count;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_project_deletion
  BEFORE DELETE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION prevent_project_deletion_with_tasks();

-- Auto-assign task to project owner if not specified
CREATE OR REPLACE FUNCTION auto_assign_task()
RETURNS TRIGGER AS $$
DECLARE
  v_project_owner uuid;
BEGIN
  IF NEW.assigned_to IS NULL THEN
    SELECT created_by INTO v_project_owner
    FROM projects WHERE id = NEW.project_id;
    
    IF v_project_owner IS NOT NULL THEN
      NEW.assigned_to := v_project_owner;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_assign_task_trigger
  BEFORE INSERT ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_task();

-- Update task completed_at when status changes to completed
CREATE OR REPLACE FUNCTION update_task_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    NEW.completed_at := now();
  ELSIF NEW.status != 'completed' THEN
    NEW.completed_at := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_task_completed_at_trigger
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_task_completed_at();

-- Validate KPI data point values are within reasonable ranges
CREATE OR REPLACE FUNCTION validate_kpi_value()
RETURNS TRIGGER AS $$
BEGIN
  -- Percentage values should be 0-100
  IF NEW.unit = 'PERCENTAGE' AND (NEW.value < 0 OR NEW.value > 100) THEN
    RAISE EXCEPTION 'Percentage KPI values must be between 0 and 100';
  END IF;
  
  -- Score values should be positive
  IF NEW.unit = 'SCORE' AND NEW.value < 0 THEN
    RAISE EXCEPTION 'Score KPI values must be positive';
  END IF;
  
  -- Currency values should be positive
  IF NEW.unit = 'CURRENCY' AND NEW.value < 0 THEN
    RAISE EXCEPTION 'Currency KPI values must be positive';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_kpi_value_trigger
  BEFORE INSERT OR UPDATE ON kpi_data_points
  FOR EACH ROW
  EXECUTE FUNCTION validate_kpi_value();

COMMENT ON FUNCTION update_updated_at_column IS 'Automatically updates the updated_at timestamp';
COMMENT ON FUNCTION auto_complete_parent_task IS 'Automatically completes parent task when all subtasks are done';
COMMENT ON FUNCTION update_project_status IS 'Updates project status based on task completion';
COMMENT ON FUNCTION validate_budget_allocation IS 'Prevents budget allocations from exceeding project budget by >10%';
COMMENT ON FUNCTION auto_audit_sensitive_changes IS 'Automatically creates audit log entries for sensitive operations';
COMMENT ON FUNCTION prevent_project_deletion_with_tasks IS 'Prevents deletion of projects with active tasks';
COMMENT ON FUNCTION auto_assign_task IS 'Auto-assigns tasks to project owner if not specified';
COMMENT ON FUNCTION validate_kpi_value IS 'Validates KPI values are within reasonable ranges';
