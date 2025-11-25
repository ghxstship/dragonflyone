-- 0050_reporting_views.sql
-- Advanced reporting views and dashboards

-- Financial summary view
CREATE OR REPLACE VIEW financial_summary AS
SELECT
  p.organization_id,
  p.id as project_id,
  p.name as project_name,
  p.status as project_status,
  p.budget as total_budget,
  COALESCE(SUM(bli.amount), 0) as allocated_budget,
  COALESCE(SUM(bli.actual_cost), 0) as actual_cost,
  p.budget - COALESCE(SUM(bli.actual_cost), 0) as remaining_budget,
  ROUND((COALESCE(SUM(bli.actual_cost), 0) / NULLIF(p.budget, 0)) * 100, 2) as budget_utilization_pct,
  COUNT(DISTINCT bli.id) as line_item_count,
  p.start_date,
  p.end_date
FROM projects p
LEFT JOIN budget_line_items bli ON bli.project_id = p.id
GROUP BY p.id, p.organization_id, p.name, p.status, p.budget, p.start_date, p.end_date;

-- Task productivity view
CREATE OR REPLACE VIEW task_productivity AS
SELECT
  t.project_id,
  p.organization_id,
  p.name as project_name,
  t.assigned_to as staff_id,
  s.first_name || ' ' || s.last_name as staff_name,
  COUNT(DISTINCT t.id) as total_tasks,
  COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed') as completed_tasks,
  COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'in_progress') as in_progress_tasks,
  COUNT(DISTINCT t.id) FILTER (WHERE t.due_date < now() AND t.status != 'completed') as overdue_tasks,
  COALESCE(SUM(t.estimated_hours), 0) as estimated_hours,
  COALESCE(SUM(te.hours), 0) as actual_hours,
  ROUND(
    COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed')::numeric / 
    NULLIF(COUNT(DISTINCT t.id), 0) * 100, 
    2
  ) as completion_rate
FROM tasks t
LEFT JOIN projects p ON p.id = t.project_id
LEFT JOIN staff s ON s.id = t.assigned_to
LEFT JOIN time_entries te ON te.task_id = t.id AND te.date >= now() - interval '30 days'
GROUP BY t.project_id, p.organization_id, p.name, t.assigned_to, s.first_name, s.last_name;

-- Vendor performance view
CREATE OR REPLACE VIEW vendor_performance AS
SELECT
  v.id as vendor_id,
  v.organization_id,
  v.name as vendor_name,
  v.vendor_type,
  v.rating,
  COUNT(DISTINCT p.id) as total_projects,
  COALESCE(SUM(bli.actual_cost), 0) as total_spent,
  ROUND(AVG(v.rating), 2) as avg_rating,
  MAX(p.end_date) as last_project_date
FROM vendors v
LEFT JOIN budget_line_items bli ON bli.vendor_id = v.id
LEFT JOIN projects p ON p.id = bli.project_id
GROUP BY v.id, v.organization_id, v.name, v.vendor_type, v.rating;

-- Project timeline view
CREATE OR REPLACE VIEW project_timeline AS
SELECT
  p.id as project_id,
  p.organization_id,
  p.name as project_name,
  p.status,
  p.start_date,
  p.end_date,
  CASE
    WHEN p.start_date IS NULL OR p.end_date IS NULL THEN NULL
    WHEN now() < p.start_date THEN 0
    WHEN now() > p.end_date THEN 100
    ELSE ROUND(
      (EXTRACT(EPOCH FROM (now() - p.start_date)) / 
       EXTRACT(EPOCH FROM (p.end_date - p.start_date))) * 100,
      2
    )
  END as timeline_progress_pct,
  CASE
    WHEN p.end_date IS NULL THEN NULL
    WHEN now() > p.end_date THEN EXTRACT(DAY FROM (now() - p.end_date))::integer
    ELSE NULL
  END as days_overdue,
  CASE
    WHEN p.start_date IS NULL THEN NULL
    WHEN now() < p.start_date THEN EXTRACT(DAY FROM (p.start_date - now()))::integer
    ELSE NULL
  END as days_until_start,
  COUNT(DISTINCT pm.milestone_id) as total_milestones,
  COUNT(DISTINCT pm.milestone_id) FILTER (WHERE pm.status = 'completed') as completed_milestones
FROM projects p
LEFT JOIN project_milestones pm ON pm.project_id = p.id
GROUP BY p.id, p.organization_id, p.name, p.status, p.start_date, p.end_date;

-- Resource allocation view
CREATE OR REPLACE VIEW resource_allocation AS
SELECT
  sa.organization_id,
  sa.project_id,
  p.name as project_name,
  sa.staff_id,
  s.first_name || ' ' || s.last_name as staff_name,
  s.role as staff_role,
  sa.role as project_role,
  sa.allocation_percentage,
  sa.start_date,
  sa.end_date,
  COUNT(DISTINCT t.id) as assigned_tasks,
  COALESCE(SUM(te.hours), 0) as hours_logged
FROM staff_assignments sa
JOIN projects p ON p.id = sa.project_id
JOIN staff s ON s.id = sa.staff_id
LEFT JOIN tasks t ON t.assigned_to = sa.staff_id AND t.project_id = sa.project_id
LEFT JOIN time_entries te ON te.staff_id = sa.staff_id AND te.project_id = sa.project_id
GROUP BY sa.organization_id, sa.project_id, p.name, sa.staff_id, s.first_name, s.last_name, 
         s.role, sa.role, sa.allocation_percentage, sa.start_date, sa.end_date;

-- KPI dashboard view
CREATE OR REPLACE VIEW kpi_dashboard AS
SELECT
  kdp.organization_id,
  kdp.kpi_code,
  kdp.kpi_name,
  kdp.unit,
  kr.category,
  (SELECT value FROM kpi_data_points kdp2 
   WHERE kdp2.kpi_code = kdp.kpi_code 
   AND kdp2.organization_id = kdp.organization_id
   ORDER BY calculated_at DESC LIMIT 1) as current_value,
  (SELECT value FROM kpi_data_points kdp2 
   WHERE kdp2.kpi_code = kdp.kpi_code 
   AND kdp2.organization_id = kdp.organization_id
   ORDER BY calculated_at DESC LIMIT 1 OFFSET 1) as previous_value,
  AVG(kdp.value) as avg_value_30d,
  MAX(kdp.value) as max_value_30d,
  MIN(kdp.value) as min_value_30d,
  COUNT(*) as data_points_30d,
  kt.target_value,
  CASE
    WHEN kt.target_value IS NULL THEN NULL
    ELSE ROUND(
      ((SELECT value FROM kpi_data_points kdp2 
        WHERE kdp2.kpi_code = kdp.kpi_code 
        AND kdp2.organization_id = kdp.organization_id
        ORDER BY calculated_at DESC LIMIT 1) / NULLIF(kt.target_value, 0)) * 100,
      2
    )
  END as target_achievement_pct
FROM kpi_data_points kdp
LEFT JOIN kpi_reports kr ON kdp.kpi_code = ANY(kr.kpi_codes) AND kr.is_global = true
LEFT JOIN kpi_targets kt ON kt.kpi_code = kdp.kpi_code AND kt.organization_id = kdp.organization_id
WHERE kdp.calculated_at >= now() - interval '30 days'
GROUP BY kdp.organization_id, kdp.kpi_code, kdp.kpi_name, kdp.unit, kr.category, kt.target_value;

-- Grant access to views
GRANT SELECT ON financial_summary TO authenticated;
GRANT SELECT ON task_productivity TO authenticated;
GRANT SELECT ON vendor_performance TO authenticated;
GRANT SELECT ON project_timeline TO authenticated;
GRANT SELECT ON resource_allocation TO authenticated;
GRANT SELECT ON kpi_dashboard TO authenticated;

-- Add comments
COMMENT ON VIEW financial_summary IS 'Financial overview with budget tracking';
COMMENT ON VIEW task_productivity IS 'Task completion and productivity metrics by staff';
COMMENT ON VIEW vendor_performance IS 'Vendor spending and performance ratings';
COMMENT ON VIEW project_timeline IS 'Project timeline progress and milestone tracking';
COMMENT ON VIEW resource_allocation IS 'Staff allocation and utilization by project';
COMMENT ON VIEW kpi_dashboard IS 'Real-time KPI dashboard with trends and targets';
