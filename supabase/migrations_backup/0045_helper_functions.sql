-- 0045_helper_functions.sql
-- Utility functions for common operations

-- Get project health score
CREATE OR REPLACE FUNCTION get_project_health_score(p_project_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
  v_budget_health numeric;
  v_schedule_health numeric;
  v_task_health numeric;
  v_overall_health numeric;
BEGIN
  -- Calculate budget health (0-100)
  SELECT 
    CASE 
      WHEN p.budget = 0 THEN 100
      WHEN SUM(bli.actual_cost) / p.budget <= 0.8 THEN 100
      WHEN SUM(bli.actual_cost) / p.budget <= 0.95 THEN 75
      WHEN SUM(bli.actual_cost) / p.budget <= 1.0 THEN 50
      ELSE 25
    END
  INTO v_budget_health
  FROM projects p
  LEFT JOIN budget_line_items bli ON bli.project_id = p.id
  WHERE p.id = p_project_id
  GROUP BY p.id, p.budget;

  -- Calculate schedule health (0-100)
  SELECT
    CASE
      WHEN p.end_date IS NULL THEN 100
      WHEN now() < p.start_date THEN 100
      WHEN now() > p.end_date THEN 25
      ELSE 100 - (EXTRACT(EPOCH FROM (now() - p.start_date)) / 
           NULLIF(EXTRACT(EPOCH FROM (p.end_date - p.start_date)), 0) * 100)::numeric
    END
  INTO v_schedule_health
  FROM projects p
  WHERE p.id = p_project_id;

  -- Calculate task completion health (0-100)
  SELECT
    COALESCE(
      (COUNT(*) FILTER (WHERE status = 'completed')::numeric / NULLIF(COUNT(*), 0) * 100),
      0
    )
  INTO v_task_health
  FROM tasks
  WHERE project_id = p_project_id;

  -- Calculate overall health
  v_overall_health := (
    COALESCE(v_budget_health, 0) * 0.4 +
    COALESCE(v_schedule_health, 0) * 0.3 +
    COALESCE(v_task_health, 0) * 0.3
  );

  v_result := jsonb_build_object(
    'project_id', p_project_id,
    'overall_health', ROUND(v_overall_health, 2),
    'budget_health', ROUND(COALESCE(v_budget_health, 0), 2),
    'schedule_health', ROUND(COALESCE(v_schedule_health, 0), 2),
    'task_health', ROUND(COALESCE(v_task_health, 0), 2),
    'health_status', CASE
      WHEN v_overall_health >= 80 THEN 'excellent'
      WHEN v_overall_health >= 60 THEN 'good'
      WHEN v_overall_health >= 40 THEN 'fair'
      ELSE 'poor'
    END,
    'calculated_at', now()
  );

  RETURN v_result;
END;
$$;

-- Get staff workload
CREATE OR REPLACE FUNCTION get_staff_workload(p_staff_id uuid, p_days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'staff_id', p_staff_id,
    'total_active_tasks', COUNT(DISTINCT t.id),
    'overdue_tasks', COUNT(DISTINCT t.id) FILTER (WHERE t.due_date < now() AND t.status != 'completed'),
    'hours_logged_period', COALESCE(SUM(te.hours), 0),
    'avg_hours_per_day', ROUND(COALESCE(SUM(te.hours) / NULLIF(p_days, 0), 0), 2),
    'active_projects', COUNT(DISTINCT t.project_id),
    'completion_rate', ROUND(
      COALESCE(
        COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed')::numeric / 
        NULLIF(COUNT(DISTINCT t.id), 0) * 100,
        0
      ),
      2
    ),
    'workload_status', CASE
      WHEN COALESCE(SUM(te.hours) / NULLIF(p_days, 0), 0) > 10 THEN 'overloaded'
      WHEN COALESCE(SUM(te.hours) / NULLIF(p_days, 0), 0) > 8 THEN 'full'
      WHEN COALESCE(SUM(te.hours) / NULLIF(p_days, 0), 0) > 5 THEN 'moderate'
      ELSE 'light'
    END
  ) INTO v_result
  FROM staff s
  LEFT JOIN tasks t ON t.assigned_to = s.id AND t.status != 'completed'
  LEFT JOIN time_entries te ON te.staff_id = s.id AND te.date >= (now() - (p_days || ' days')::interval)
  WHERE s.id = p_staff_id
  GROUP BY s.id;

  RETURN v_result;
END;
$$;

-- Search function for projects
CREATE OR REPLACE FUNCTION search_projects(
  p_org_id uuid,
  p_search_term text DEFAULT NULL,
  p_status text DEFAULT NULL,
  p_limit integer DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  name text,
  code text,
  status text,
  budget numeric,
  start_date date,
  end_date date,
  task_count bigint,
  completed_tasks bigint,
  relevance real
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.code,
    p.status,
    p.budget,
    p.start_date,
    p.end_date,
    COUNT(DISTINCT t.id) as task_count,
    COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed') as completed_tasks,
    CASE 
      WHEN p_search_term IS NULL THEN 1.0
      ELSE ts_rank(
        to_tsvector('english', COALESCE(p.name, '') || ' ' || COALESCE(p.code, '') || ' ' || COALESCE(p.description, '')),
        plainto_tsquery('english', p_search_term)
      )
    END as relevance
  FROM projects p
  LEFT JOIN tasks t ON t.project_id = p.id
  WHERE p.organization_id = p_org_id
    AND (p_status IS NULL OR p.status = p_status)
    AND (
      p_search_term IS NULL OR
      to_tsvector('english', COALESCE(p.name, '') || ' ' || COALESCE(p.code, '') || ' ' || COALESCE(p.description, '')) @@ plainto_tsquery('english', p_search_term)
    )
  GROUP BY p.id, p.name, p.code, p.status, p.budget, p.start_date, p.end_date, p.description
  ORDER BY relevance DESC, p.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Batch update task status
CREATE OR REPLACE FUNCTION batch_update_task_status(
  p_task_ids uuid[],
  p_new_status text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated_count integer;
BEGIN
  UPDATE tasks
  SET 
    status = p_new_status,
    updated_at = now()
  WHERE id = ANY(p_task_ids)
    AND EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = tasks.project_id
      AND org_matches(p.organization_id)
      AND role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
    );
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  RETURN v_updated_count;
END;
$$;

-- Calculate budget variance
CREATE OR REPLACE FUNCTION calculate_budget_variance(p_project_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'project_id', p.id,
    'total_budget', p.budget,
    'allocated_budget', COALESCE(SUM(bli.amount), 0),
    'actual_cost', COALESCE(SUM(bli.actual_cost), 0),
    'remaining_budget', p.budget - COALESCE(SUM(bli.actual_cost), 0),
    'budget_variance', p.budget - COALESCE(SUM(bli.actual_cost), 0),
    'variance_percentage', ROUND(
      ((p.budget - COALESCE(SUM(bli.actual_cost), 0)) / NULLIF(p.budget, 0)) * 100,
      2
    ),
    'utilization_percentage', ROUND(
      (COALESCE(SUM(bli.actual_cost), 0) / NULLIF(p.budget, 0)) * 100,
      2
    ),
    'status', CASE
      WHEN COALESCE(SUM(bli.actual_cost), 0) > p.budget THEN 'over_budget'
      WHEN COALESCE(SUM(bli.actual_cost), 0) / NULLIF(p.budget, 0) > 0.95 THEN 'at_risk'
      WHEN COALESCE(SUM(bli.actual_cost), 0) / NULLIF(p.budget, 0) > 0.80 THEN 'on_track'
      ELSE 'under_budget'
    END
  ) INTO v_result
  FROM projects p
  LEFT JOIN budget_line_items bli ON bli.project_id = p.id
  WHERE p.id = p_project_id
  GROUP BY p.id, p.budget;

  RETURN v_result;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_project_health_score TO authenticated;
GRANT EXECUTE ON FUNCTION get_staff_workload TO authenticated;
GRANT EXECUTE ON FUNCTION search_projects TO authenticated;
GRANT EXECUTE ON FUNCTION batch_update_task_status TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_budget_variance TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION get_project_health_score IS 'Calculates comprehensive project health score based on budget, schedule, and tasks';
COMMENT ON FUNCTION get_staff_workload IS 'Returns workload analysis for a staff member';
COMMENT ON FUNCTION search_projects IS 'Full-text search for projects with relevance ranking';
COMMENT ON FUNCTION batch_update_task_status IS 'Update status for multiple tasks at once';
COMMENT ON FUNCTION calculate_budget_variance IS 'Calculates detailed budget variance and utilization metrics';
