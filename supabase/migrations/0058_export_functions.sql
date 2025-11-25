-- 0054_export_functions.sql
-- Data export and reporting functions

-- Export project data to JSON
CREATE OR REPLACE FUNCTION export_project_data(p_project_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'project', (
      SELECT row_to_json(p.*)
      FROM projects p
      WHERE p.id = p_project_id
    ),
    'tasks', (
      SELECT jsonb_agg(row_to_json(t.*))
      FROM tasks t
      WHERE t.project_id = p_project_id
    ),
    'budget', (
      SELECT jsonb_agg(row_to_json(bli.*))
      FROM budget_line_items bli
      WHERE bli.project_id = p_project_id
    ),
    'staff', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'staff_id', s.id,
          'name', s.first_name || ' ' || s.last_name,
          'role', sa.role,
          'allocation', sa.allocation_percentage
        )
      )
      FROM staff_assignments sa
      JOIN staff s ON s.id = sa.staff_id
      WHERE sa.project_id = p_project_id
    ),
    'time_entries', (
      SELECT jsonb_agg(row_to_json(te.*))
      FROM time_entries te
      WHERE te.project_id = p_project_id
    ),
    'exported_at', now()
  ) INTO v_result;
  
  RETURN v_result;
END;
$$;

-- Export organization summary
CREATE OR REPLACE FUNCTION export_org_summary(p_org_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'organization', (
      SELECT row_to_json(o.*)
      FROM organizations o
      WHERE o.id = p_org_id
    ),
    'projects', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', p.id,
          'name', p.name,
          'status', p.status,
          'budget', p.budget,
          'task_count', (SELECT COUNT(*) FROM tasks WHERE project_id = p.id),
          'staff_count', (SELECT COUNT(DISTINCT staff_id) FROM staff_assignments WHERE project_id = p.id)
        )
      )
      FROM projects p
      WHERE p.organization_id = p_org_id
    ),
    'staff', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', s.id,
          'name', s.first_name || ' ' || s.last_name,
          'role', s.role,
          'department', s.department
        )
      )
      FROM staff s
      WHERE s.organization_id = p_org_id
    ),
    'vendors', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', v.id,
          'name', v.name,
          'type', v.vendor_type,
          'rating', v.rating
        )
      )
      FROM vendors v
      WHERE v.organization_id = p_org_id
    ),
    'summary', (
      SELECT jsonb_build_object(
        'total_projects', COUNT(DISTINCT p.id),
        'active_projects', COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'in_progress'),
        'total_staff', COUNT(DISTINCT s.id),
        'total_budget', COALESCE(SUM(p.budget), 0),
        'total_spent', COALESCE(SUM(bli.actual_cost), 0)
      )
      FROM projects p
      LEFT JOIN staff s ON s.organization_id = p.organization_id
      LEFT JOIN budget_line_items bli ON bli.project_id = p.id
      WHERE p.organization_id = p_org_id
    ),
    'exported_at', now()
  ) INTO v_result;
  
  RETURN v_result;
END;
$$;

-- Generate CSV export for projects
CREATE OR REPLACE FUNCTION generate_project_csv(p_org_id uuid)
RETURNS TABLE (
  csv_line text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Header row
  RETURN QUERY SELECT 'Project ID,Name,Code,Status,Budget,Start Date,End Date,Task Count,Completed Tasks,Budget Spent'::text;
  
  -- Data rows
  RETURN QUERY
  SELECT
    p.id::text || ',' ||
    '"' || COALESCE(p.name, '') || '",' ||
    '"' || COALESCE(p.code, '') || '",' ||
    p.status || ',' ||
    COALESCE(p.budget::text, '0') || ',' ||
    COALESCE(p.start_date::text, '') || ',' ||
    COALESCE(p.end_date::text, '') || ',' ||
    COUNT(DISTINCT t.id)::text || ',' ||
    COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed')::text || ',' ||
    COALESCE(SUM(bli.actual_cost)::text, '0')
  FROM projects p
  LEFT JOIN tasks t ON t.project_id = p.id
  LEFT JOIN budget_line_items bli ON bli.project_id = p.id
  WHERE p.organization_id = p_org_id
  GROUP BY p.id, p.name, p.code, p.status, p.budget, p.start_date, p.end_date;
END;
$$;

-- Generate task report for date range
CREATE OR REPLACE FUNCTION generate_task_report(
  p_org_id uuid,
  p_start_date date,
  p_end_date date
)
RETURNS TABLE (
  project_name text,
  task_title text,
  status text,
  priority text,
  assigned_to_name text,
  due_date date,
  completed_at timestamptz,
  estimated_hours numeric,
  actual_hours numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.name,
    t.title,
    t.status,
    t.priority,
    s.first_name || ' ' || s.last_name,
    t.due_date,
    t.completed_at,
    t.estimated_hours,
    COALESCE(SUM(te.hours), 0)
  FROM tasks t
  JOIN projects p ON p.id = t.project_id
  LEFT JOIN staff s ON s.id = t.assigned_to
  LEFT JOIN time_entries te ON te.task_id = t.id
  WHERE p.organization_id = p_org_id
    AND t.created_at BETWEEN p_start_date AND p_end_date
  GROUP BY p.name, t.title, t.status, t.priority, s.first_name, s.last_name, t.due_date, t.completed_at, t.estimated_hours
  ORDER BY t.due_date;
END;
$$;

-- Generate financial report
CREATE OR REPLACE FUNCTION generate_financial_report(
  p_org_id uuid,
  p_start_date date DEFAULT NULL,
  p_end_date date DEFAULT NULL
)
RETURNS TABLE (
  project_name text,
  project_code text,
  total_budget numeric,
  allocated_budget numeric,
  actual_cost numeric,
  remaining_budget numeric,
  variance_amount numeric,
  variance_percentage numeric,
  status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.name,
    p.code,
    p.budget,
    COALESCE(SUM(bli.amount), 0) as allocated,
    COALESCE(SUM(bli.actual_cost), 0) as actual,
    p.budget - COALESCE(SUM(bli.actual_cost), 0) as remaining,
    COALESCE(SUM(bli.actual_cost), 0) - COALESCE(SUM(bli.amount), 0) as variance,
    ROUND(
      ((COALESCE(SUM(bli.actual_cost), 0) - COALESCE(SUM(bli.amount), 0)) / 
       NULLIF(COALESCE(SUM(bli.amount), 0), 0)) * 100,
      2
    ) as variance_pct,
    p.status
  FROM projects p
  LEFT JOIN budget_line_items bli ON bli.project_id = p.id
  WHERE p.organization_id = p_org_id
    AND (p_start_date IS NULL OR p.start_date >= p_start_date)
    AND (p_end_date IS NULL OR p.start_date <= p_end_date)
  GROUP BY p.id, p.name, p.code, p.budget, p.status
  ORDER BY p.name;
END;
$$;

GRANT EXECUTE ON FUNCTION export_project_data TO authenticated;
GRANT EXECUTE ON FUNCTION export_org_summary TO authenticated;
GRANT EXECUTE ON FUNCTION generate_project_csv TO authenticated;
GRANT EXECUTE ON FUNCTION generate_task_report TO authenticated;
GRANT EXECUTE ON FUNCTION generate_financial_report TO authenticated;

COMMENT ON FUNCTION export_project_data IS 'Exports complete project data as JSON';
COMMENT ON FUNCTION export_org_summary IS 'Exports organization summary with all entities';
COMMENT ON FUNCTION generate_project_csv IS 'Generates CSV export of projects';
COMMENT ON FUNCTION generate_task_report IS 'Generates task report for date range';
COMMENT ON FUNCTION generate_financial_report IS 'Generates financial report with budget analysis';
