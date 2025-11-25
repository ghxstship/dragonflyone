-- 0043_analytics_enhancements.sql
-- Enhanced analytics views and functions

-- Create comprehensive project analytics view
CREATE OR REPLACE VIEW analytics_project_overview AS
SELECT
  p.id as project_id,
  p.organization_id,
  p.name as project_name,
  p.code as project_code,
  p.status,
  p.budget as total_budget,
  
  -- Task metrics
  COUNT(DISTINCT t.id) as total_tasks,
  COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed') as completed_tasks,
  COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'in_progress') as in_progress_tasks,
  COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'pending') as pending_tasks,
  ROUND(
    COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed')::numeric / 
    NULLIF(COUNT(DISTINCT t.id), 0) * 100, 
    2
  ) as task_completion_percentage,
  
  -- Budget metrics
  COALESCE(SUM(bli.amount), 0) as total_allocated_budget,
  COALESCE(SUM(bli.actual_cost), 0) as total_actual_cost,
  p.budget - COALESCE(SUM(bli.actual_cost), 0) as budget_remaining,
  ROUND(
    (COALESCE(SUM(bli.actual_cost), 0) / NULLIF(p.budget, 0)) * 100,
    2
  ) as budget_utilization_percentage,
  
  -- Team metrics
  COUNT(DISTINCT sa.staff_id) as total_staff_assigned,
  
  -- Time metrics
  p.start_date,
  p.end_date,
  CASE 
    WHEN p.end_date IS NOT NULL THEN
      ROUND(
        EXTRACT(EPOCH FROM (now() - p.start_date)) / 
        NULLIF(EXTRACT(EPOCH FROM (p.end_date - p.start_date)), 0) * 100,
        2
      )
    ELSE NULL
  END as timeline_progress_percentage,
  
  p.created_at,
  p.updated_at

FROM projects p
LEFT JOIN tasks t ON t.project_id = p.id
LEFT JOIN budget_line_items bli ON bli.project_id = p.id
LEFT JOIN staff_assignments sa ON sa.project_id = p.id
WHERE p.organization_id IS NOT NULL
GROUP BY p.id, p.organization_id, p.name, p.code, p.status, p.budget, 
         p.start_date, p.end_date, p.created_at, p.updated_at;

GRANT SELECT ON analytics_project_overview TO authenticated;

-- Create KPI performance view
CREATE OR REPLACE VIEW analytics_kpi_performance AS
SELECT
  kdp.organization_id,
  kdp.kpi_code,
  kdp.kpi_name,
  kdp.unit,
  kdp.project_id,
  
  -- Latest value
  (SELECT value FROM kpi_data_points kdp2 
   WHERE kdp2.kpi_code = kdp.kpi_code 
   AND kdp2.organization_id = kdp.organization_id
   AND (kdp.project_id IS NULL OR kdp2.project_id = kdp.project_id)
   ORDER BY calculated_at DESC LIMIT 1) as latest_value,
  
  -- Previous value (for trend)
  (SELECT value FROM kpi_data_points kdp2 
   WHERE kdp2.kpi_code = kdp.kpi_code 
   AND kdp2.organization_id = kdp.organization_id
   AND (kdp.project_id IS NULL OR kdp2.project_id = kdp.project_id)
   ORDER BY calculated_at DESC LIMIT 1 OFFSET 1) as previous_value,
  
  -- Statistics
  AVG(kdp.value) as avg_value,
  MIN(kdp.value) as min_value,
  MAX(kdp.value) as max_value,
  STDDEV(kdp.value) as stddev_value,
  COUNT(*) as data_point_count,
  
  -- Target comparison
  kt.target_value,
  kt.warning_threshold,
  kt.critical_threshold,
  
  CASE
    WHEN kt.target_value IS NOT NULL THEN
      ((SELECT value FROM kpi_data_points kdp2 
        WHERE kdp2.kpi_code = kdp.kpi_code 
        AND kdp2.organization_id = kdp.organization_id
        AND (kdp.project_id IS NULL OR kdp2.project_id = kdp.project_id)
        ORDER BY calculated_at DESC LIMIT 1) / NULLIF(kt.target_value, 0)) * 100
    ELSE NULL
  END as target_achievement_percentage,
  
  MAX(kdp.calculated_at) as last_updated

FROM kpi_data_points kdp
LEFT JOIN kpi_targets kt ON 
  kt.organization_id = kdp.organization_id 
  AND kt.kpi_code = kdp.kpi_code
  AND (kt.project_id IS NULL OR kt.project_id = kdp.project_id)
  AND now() BETWEEN kt.valid_from AND COALESCE(kt.valid_to, 'infinity'::timestamptz)
WHERE kdp.calculated_at >= now() - interval '90 days'
GROUP BY kdp.organization_id, kdp.kpi_code, kdp.kpi_name, kdp.unit, kdp.project_id,
         kt.target_value, kt.warning_threshold, kt.critical_threshold;

GRANT SELECT ON analytics_kpi_performance TO authenticated;

-- Create staff utilization view
CREATE OR REPLACE VIEW analytics_staff_utilization AS
SELECT
  s.id as staff_id,
  s.organization_id,
  s.first_name || ' ' || s.last_name as staff_name,
  s.role as staff_role,
  
  COUNT(DISTINCT sa.project_id) as active_projects,
  COUNT(DISTINCT t.id) as assigned_tasks,
  COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed') as completed_tasks,
  
  COALESCE(SUM(te.hours), 0) as total_hours_logged,
  
  ROUND(
    COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed')::numeric / 
    NULLIF(COUNT(DISTINCT t.id), 0) * 100,
    2
  ) as task_completion_rate,
  
  MAX(te.date) as last_time_entry_date

FROM staff s
LEFT JOIN staff_assignments sa ON sa.staff_id = s.id
LEFT JOIN tasks t ON t.assigned_to = s.id
LEFT JOIN time_entries te ON te.staff_id = s.id AND te.date >= now() - interval '30 days'
WHERE s.organization_id IS NOT NULL
GROUP BY s.id, s.organization_id, s.first_name, s.last_name, s.role;

GRANT SELECT ON analytics_staff_utilization TO authenticated;

-- Function to get executive dashboard
CREATE OR REPLACE FUNCTION get_executive_dashboard(p_org_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_projects', COUNT(DISTINCT p.id),
    'active_projects', COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'in_progress'),
    'completed_projects', COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'completed'),
    'total_budget', COALESCE(SUM(p.budget), 0),
    'total_staff', COUNT(DISTINCT s.id),
    'total_tasks', COUNT(DISTINCT t.id),
    'completed_tasks', COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed'),
    'total_vendors', COUNT(DISTINCT v.id),
    'active_kpis', COUNT(DISTINCT kdp.kpi_code),
    'org_created_at', o.created_at
  ) INTO v_result
  FROM organizations o
  LEFT JOIN projects p ON p.organization_id = o.id
  LEFT JOIN staff s ON s.organization_id = o.id
  LEFT JOIN tasks t ON t.project_id = p.id
  LEFT JOIN vendors v ON v.organization_id = o.id
  LEFT JOIN kpi_data_points kdp ON kdp.organization_id = o.id AND kdp.calculated_at >= now() - interval '30 days'
  WHERE o.id = p_org_id
  GROUP BY o.id, o.created_at;
  
  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_executive_dashboard TO authenticated;

COMMENT ON VIEW analytics_project_overview IS 'Comprehensive project analytics with task, budget, and timeline metrics';
COMMENT ON VIEW analytics_kpi_performance IS 'KPI performance tracking with targets and trends';
COMMENT ON VIEW analytics_staff_utilization IS 'Staff productivity and utilization metrics';
COMMENT ON FUNCTION get_executive_dashboard IS 'Returns executive-level dashboard metrics for an organization';
