-- 0053_caching_optimization.sql
-- Materialized views for performance optimization

-- Materialized view for project summary (refreshed periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_project_summary AS
SELECT
  p.id as project_id,
  p.organization_id,
  p.name,
  p.code,
  p.status,
  p.budget,
  COUNT(DISTINCT t.id) as task_count,
  COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed') as completed_tasks,
  COUNT(DISTINCT sa.staff_id) as staff_count,
  COALESCE(SUM(bli.actual_cost), 0) as total_spent,
  MAX(t.due_date) as next_deadline,
  p.start_date,
  p.end_date,
  p.created_at,
  p.updated_at
FROM projects p
LEFT JOIN tasks t ON t.project_id = p.id
LEFT JOIN staff_assignments sa ON sa.project_id = p.id
LEFT JOIN budget_line_items bli ON bli.project_id = p.id
GROUP BY p.id, p.organization_id, p.name, p.code, p.status, p.budget, p.start_date, p.end_date, p.created_at, p.updated_at;

CREATE UNIQUE INDEX idx_mv_project_summary_id ON mv_project_summary(project_id);
CREATE INDEX idx_mv_project_summary_org ON mv_project_summary(organization_id);
CREATE INDEX idx_mv_project_summary_status ON mv_project_summary(status);

-- Materialized view for staff workload
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_staff_workload AS
SELECT
  s.id as staff_id,
  s.organization_id,
  s.first_name || ' ' || s.last_name as name,
  s.role,
  s.department,
  COUNT(DISTINCT sa.project_id) as active_projects,
  COUNT(DISTINCT t.id) as active_tasks,
  COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed') as completed_tasks,
  COALESCE(SUM(sa.allocation_percentage), 0) as total_allocation,
  COALESCE(SUM(te.hours), 0) as hours_this_month,
  MAX(te.date) as last_time_entry
FROM staff s
LEFT JOIN staff_assignments sa ON sa.staff_id = s.id
LEFT JOIN tasks t ON t.assigned_to = s.id AND t.status != 'completed'
LEFT JOIN time_entries te ON te.staff_id = s.id AND te.date >= date_trunc('month', CURRENT_DATE)
GROUP BY s.id, s.organization_id, s.first_name, s.last_name, s.role, s.department;

CREATE UNIQUE INDEX idx_mv_staff_workload_id ON mv_staff_workload(staff_id);
CREATE INDEX idx_mv_staff_workload_org ON mv_staff_workload(organization_id);

-- Materialized view for KPI trends (last 90 days)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_kpi_trends AS
SELECT
  kdp.organization_id,
  kdp.kpi_code,
  kdp.kpi_name,
  kdp.unit,
  kr.category,
  COUNT(*) as data_points,
  AVG(kdp.value) as avg_value,
  MIN(kdp.value) as min_value,
  MAX(kdp.value) as max_value,
  STDDEV(kdp.value) as stddev_value,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY kdp.value) as median_value,
  MAX(kdp.calculated_at) as last_updated,
  ARRAY_AGG(kdp.value ORDER BY kdp.calculated_at DESC) FILTER (WHERE kdp.calculated_at >= now() - interval '7 days') as last_7_days,
  ARRAY_AGG(kdp.value ORDER BY kdp.calculated_at DESC) FILTER (WHERE kdp.calculated_at >= now() - interval '30 days') as last_30_days
FROM kpi_data_points kdp
LEFT JOIN kpi_reports kr ON kdp.kpi_code = ANY(kr.kpi_codes) AND kr.is_global = true
WHERE kdp.calculated_at >= now() - interval '90 days'
GROUP BY kdp.organization_id, kdp.kpi_code, kdp.kpi_name, kdp.unit, kr.category;

CREATE INDEX idx_mv_kpi_trends_org ON mv_kpi_trends(organization_id);
CREATE INDEX idx_mv_kpi_trends_code ON mv_kpi_trends(kpi_code);
CREATE INDEX idx_mv_kpi_trends_category ON mv_kpi_trends(category);

-- Function to refresh all materialized views
CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_project_summary;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_staff_workload;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_trends;
  
  RAISE NOTICE 'All materialized views refreshed successfully';
END;
$$;

-- Function to refresh specific materialized view
CREATE OR REPLACE FUNCTION refresh_materialized_view(p_view_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CASE p_view_name
    WHEN 'project_summary' THEN
      REFRESH MATERIALIZED VIEW CONCURRENTLY mv_project_summary;
    WHEN 'staff_workload' THEN
      REFRESH MATERIALIZED VIEW CONCURRENTLY mv_staff_workload;
    WHEN 'kpi_trends' THEN
      REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_trends;
    ELSE
      RAISE EXCEPTION 'Unknown materialized view: %', p_view_name;
  END CASE;
  
  RAISE NOTICE 'Materialized view % refreshed', p_view_name;
END;
$$;

GRANT SELECT ON mv_project_summary TO authenticated;
GRANT SELECT ON mv_staff_workload TO authenticated;
GRANT SELECT ON mv_kpi_trends TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_all_materialized_views TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_materialized_view TO authenticated;

COMMENT ON MATERIALIZED VIEW mv_project_summary IS 'Cached project summary data for performance';
COMMENT ON MATERIALIZED VIEW mv_staff_workload IS 'Cached staff workload metrics';
COMMENT ON MATERIALIZED VIEW mv_kpi_trends IS 'Cached KPI trend analysis for 90 days';
COMMENT ON FUNCTION refresh_all_materialized_views IS 'Refreshes all materialized views';
COMMENT ON FUNCTION refresh_materialized_view IS 'Refreshes a specific materialized view';
