-- ============================================================================
-- 0021_materialized_views.sql
-- Materialized Views for Dashboards and Analytics
-- GHXSTSHIP Platform - 3NF Gap Remediation
-- ============================================================================

-- ============================================================================
-- EXECUTIVE DASHBOARD VIEW
-- ============================================================================

CREATE MATERIALIZED VIEW mv_executive_dashboard AS
SELECT
  o.id AS organization_id,
  o.name AS organization_name,
  
  -- Deal metrics
  (SELECT COUNT(*) FROM deals d WHERE d.organization_id = o.id) AS total_deals,
  (SELECT COUNT(*) FROM deals d WHERE d.organization_id = o.id AND d.status IN ('lead', 'qualified', 'proposal')) AS active_deals,
  (SELECT COALESCE(SUM(d.value), 0) FROM deals d WHERE d.organization_id = o.id AND d.status IN ('lead', 'qualified', 'proposal')) AS pipeline_value,
  (SELECT COUNT(*) FROM deals d WHERE d.organization_id = o.id AND d.status = 'won' AND d.actual_close_date >= date_trunc('month', CURRENT_DATE)) AS deals_won_this_month,
  (SELECT COALESCE(SUM(d.value), 0) FROM deals d WHERE d.organization_id = o.id AND d.status = 'won' AND d.actual_close_date >= date_trunc('month', CURRENT_DATE)) AS revenue_won_this_month,
  
  -- Project metrics
  (SELECT COUNT(*) FROM projects p WHERE p.organization_id = o.id AND p.phase NOT IN ('completed', 'cancelled')) AS active_projects,
  (SELECT COALESCE(SUM(p.budget), 0) FROM projects p WHERE p.organization_id = o.id AND p.phase NOT IN ('completed', 'cancelled')) AS active_project_budget,
  
  -- Asset metrics
  (SELECT COUNT(*) FROM assets a WHERE a.organization_id = o.id) AS total_assets,
  (SELECT COUNT(*) FROM assets a WHERE a.organization_id = o.id AND a.state = 'available') AS available_assets,
  (SELECT COALESCE(SUM(a.current_value), 0) FROM assets a WHERE a.organization_id = o.id) AS total_asset_value,
  
  -- Workforce metrics
  (SELECT COUNT(*) FROM workforce_employees we WHERE we.organization_id = o.id AND we.status = 'active') AS active_employees,
  
  -- Financial metrics
  (SELECT COALESCE(SUM(fe.amount), 0) FROM finance_expenses fe WHERE fe.organization_id = o.id AND fe.status = 'approved' AND fe.expense_date >= date_trunc('month', CURRENT_DATE)) AS expenses_this_month,
  (SELECT COUNT(*) FROM finance_expenses fe WHERE fe.organization_id = o.id AND fe.status = 'submitted') AS pending_expense_approvals,
  
  -- Alert metrics
  (SELECT COUNT(*) FROM alert_history ah WHERE ah.organization_id = o.id AND ah.status = 'triggered' AND ah.severity = 'critical') AS critical_alerts,
  (SELECT COUNT(*) FROM alert_history ah WHERE ah.organization_id = o.id AND ah.status = 'triggered' AND ah.severity = 'warning') AS warning_alerts,
  
  now() AS refreshed_at
FROM organizations o
WHERE o.is_active = true;

CREATE UNIQUE INDEX idx_mv_exec_dashboard_org ON mv_executive_dashboard(organization_id);

-- ============================================================================
-- PROJECT FINANCIALS VIEW
-- ============================================================================

CREATE MATERIALIZED VIEW mv_project_financials AS
SELECT
  p.id AS project_id,
  p.organization_id,
  p.code AS project_code,
  p.name AS project_name,
  p.phase,
  p.budget,
  p.currency,
  p.start_date,
  p.end_date,
  
  -- Expenses
  COALESCE((SELECT SUM(fe.amount) FROM finance_expenses fe WHERE fe.project_id = p.id AND fe.status = 'approved'), 0) AS approved_expenses,
  COALESCE((SELECT SUM(fe.amount) FROM finance_expenses fe WHERE fe.project_id = p.id AND fe.status = 'submitted'), 0) AS pending_expenses,
  
  -- Purchase Orders
  COALESCE((SELECT SUM(po.total_amount) FROM finance_purchase_orders po WHERE po.project_id = p.id AND po.status NOT IN ('cancelled', 'draft')), 0) AS po_total,
  
  -- Bills
  COALESCE((SELECT SUM(b.total_amount) FROM bills b WHERE b.project_id = p.id AND b.status != 'cancelled'), 0) AS bills_total,
  COALESCE((SELECT SUM(b.paid_amount) FROM bills b WHERE b.project_id = p.id), 0) AS bills_paid,
  
  -- Labor
  COALESCE((SELECT SUM(wte.total_pay) FROM workforce_time_entries wte WHERE wte.project_id = p.id AND wte.status = 'approved'), 0) AS labor_cost,
  COALESCE((SELECT SUM(wte.hours) FROM workforce_time_entries wte WHERE wte.project_id = p.id AND wte.status = 'approved'), 0) AS labor_hours,
  
  -- Calculated fields
  p.budget - COALESCE((SELECT SUM(fe.amount) FROM finance_expenses fe WHERE fe.project_id = p.id AND fe.status = 'approved'), 0)
           - COALESCE((SELECT SUM(b.total_amount) FROM bills b WHERE b.project_id = p.id AND b.status != 'cancelled'), 0)
           - COALESCE((SELECT SUM(wte.total_pay) FROM workforce_time_entries wte WHERE wte.project_id = p.id AND wte.status = 'approved'), 0) AS budget_remaining,
  
  now() AS refreshed_at
FROM projects p;

CREATE UNIQUE INDEX idx_mv_project_fin_id ON mv_project_financials(project_id);
CREATE INDEX idx_mv_project_fin_org ON mv_project_financials(organization_id);

-- ============================================================================
-- ASSET UTILIZATION VIEW
-- ============================================================================

CREATE MATERIALIZED VIEW mv_asset_utilization AS
SELECT
  a.id AS asset_id,
  a.organization_id,
  a.tag,
  a.name,
  a.category,
  a.state,
  a.current_value,
  a.purchase_price,
  
  -- Utilization metrics
  (SELECT COUNT(DISTINCT p.id) FROM projects p WHERE p.id = a.project_id) AS current_project_count,
  
  -- Maintenance metrics
  a.last_maintenance_at,
  a.next_maintenance_at,
  CASE 
    WHEN a.next_maintenance_at IS NOT NULL AND a.next_maintenance_at < CURRENT_DATE THEN true
    ELSE false
  END AS maintenance_overdue,
  
  -- Depreciation (simple straight-line over 5 years)
  CASE 
    WHEN a.acquired_at IS NOT NULL AND a.purchase_price IS NOT NULL THEN
      GREATEST(0, a.purchase_price - (a.purchase_price / 5 * EXTRACT(YEAR FROM age(CURRENT_DATE, a.acquired_at))))
    ELSE a.current_value
  END AS calculated_book_value,
  
  now() AS refreshed_at
FROM assets a;

CREATE UNIQUE INDEX idx_mv_asset_util_id ON mv_asset_utilization(asset_id);
CREATE INDEX idx_mv_asset_util_org ON mv_asset_utilization(organization_id);
CREATE INDEX idx_mv_asset_util_category ON mv_asset_utilization(organization_id, category);

-- ============================================================================
-- NPS SUMMARY VIEW
-- ============================================================================

CREATE MATERIALIZED VIEW mv_nps_summary AS
SELECT
  cf.organization_id,
  cf.platform,
  date_trunc('month', cf.submitted_at)::DATE AS month,
  COUNT(*) AS total_responses,
  COUNT(*) FILTER (WHERE cf.nps_score >= 9) AS promoters,
  COUNT(*) FILTER (WHERE cf.nps_score >= 7 AND cf.nps_score <= 8) AS passives,
  COUNT(*) FILTER (WHERE cf.nps_score <= 6) AS detractors,
  ROUND(
    (COUNT(*) FILTER (WHERE cf.nps_score >= 9)::NUMERIC / NULLIF(COUNT(*), 0) * 100) -
    (COUNT(*) FILTER (WHERE cf.nps_score <= 6)::NUMERIC / NULLIF(COUNT(*), 0) * 100),
    2
  ) AS nps_score,
  ROUND(AVG(cf.satisfaction_score), 2) AS avg_satisfaction,
  ROUND(AVG(cf.effort_score), 2) AS avg_effort,
  now() AS refreshed_at
FROM client_feedback cf
WHERE cf.nps_score IS NOT NULL
GROUP BY cf.organization_id, cf.platform, date_trunc('month', cf.submitted_at);

CREATE UNIQUE INDEX idx_mv_nps_org_platform_month ON mv_nps_summary(organization_id, platform, month);

-- ============================================================================
-- DEAL PIPELINE ANALYSIS VIEW
-- ============================================================================

CREATE MATERIALIZED VIEW mv_deal_pipeline AS
SELECT
  d.organization_id,
  d.status,
  date_trunc('month', d.created_at)::DATE AS created_month,
  COUNT(*) AS deal_count,
  COALESCE(SUM(d.value), 0) AS total_value,
  ROUND(AVG(d.value), 2) AS avg_deal_value,
  ROUND(AVG(d.probability), 2) AS avg_probability,
  COALESCE(SUM(d.value * d.probability / 100), 0) AS weighted_value,
  COUNT(*) FILTER (WHERE d.expected_close_date < CURRENT_DATE AND d.status NOT IN ('won', 'lost')) AS overdue_count,
  now() AS refreshed_at
FROM deals d
GROUP BY d.organization_id, d.status, date_trunc('month', d.created_at);

CREATE UNIQUE INDEX idx_mv_deal_pipeline_key ON mv_deal_pipeline(organization_id, status, created_month);
CREATE INDEX idx_mv_deal_pipeline_org ON mv_deal_pipeline(organization_id);

-- ============================================================================
-- WORKFORCE SUMMARY VIEW
-- ============================================================================

CREATE MATERIALIZED VIEW mv_workforce_summary AS
SELECT
  we.organization_id,
  ld.id AS department_id,
  ld.name AS department_name,
  COUNT(*) AS employee_count,
  COUNT(*) FILTER (WHERE we.status = 'active') AS active_count,
  COUNT(*) FILTER (WHERE we.status = 'on_leave') AS on_leave_count,
  COUNT(*) FILTER (WHERE we.employment_type = 'full_time') AS full_time_count,
  COUNT(*) FILTER (WHERE we.employment_type = 'part_time') AS part_time_count,
  COUNT(*) FILTER (WHERE we.employment_type = 'contractor') AS contractor_count,
  ROUND(AVG(we.hourly_rate), 2) AS avg_hourly_rate,
  COALESCE((
    SELECT SUM(wte.hours) 
    FROM workforce_time_entries wte 
    JOIN workforce_employees we2 ON we2.id = wte.employee_id
    WHERE we2.organization_id = we.organization_id
      AND we2.department_id = ld.id
      AND wte.work_date >= date_trunc('month', CURRENT_DATE)
      AND wte.status = 'approved'
  ), 0) AS hours_this_month,
  now() AS refreshed_at
FROM workforce_employees we
LEFT JOIN legend_departments ld ON ld.id = we.department_id
GROUP BY we.organization_id, ld.id, ld.name;

CREATE UNIQUE INDEX idx_mv_workforce_org_dept ON mv_workforce_summary(organization_id, department_id);

-- ============================================================================
-- REVENUE BY MONTH VIEW
-- ============================================================================

CREATE MATERIALIZED VIEW mv_revenue_by_month AS
SELECT
  o.id AS organization_id,
  date_trunc('month', d.actual_close_date)::DATE AS month,
  COUNT(*) AS deals_closed,
  COALESCE(SUM(d.value), 0) AS revenue,
  ROUND(AVG(d.value), 2) AS avg_deal_size,
  now() AS refreshed_at
FROM organizations o
LEFT JOIN deals d ON d.organization_id = o.id AND d.status = 'won' AND d.actual_close_date IS NOT NULL
WHERE d.actual_close_date >= CURRENT_DATE - INTERVAL '24 months'
GROUP BY o.id, date_trunc('month', d.actual_close_date);

CREATE UNIQUE INDEX idx_mv_revenue_org_month ON mv_revenue_by_month(organization_id, month);

-- ============================================================================
-- REFRESH FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION refresh_executive_dashboard()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_executive_dashboard;
END;
$$;

CREATE OR REPLACE FUNCTION refresh_project_financials()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_project_financials;
END;
$$;

CREATE OR REPLACE FUNCTION refresh_asset_utilization()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_asset_utilization;
END;
$$;

CREATE OR REPLACE FUNCTION refresh_nps_summary()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_nps_summary;
END;
$$;

CREATE OR REPLACE FUNCTION refresh_deal_pipeline()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_deal_pipeline;
END;
$$;

CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_executive_dashboard;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_project_financials;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_asset_utilization;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_nps_summary;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_deal_pipeline;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_revenue_by_month;
END;
$$;

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT ON mv_executive_dashboard TO authenticated;
GRANT SELECT ON mv_project_financials TO authenticated;
GRANT SELECT ON mv_asset_utilization TO authenticated;
GRANT SELECT ON mv_nps_summary TO authenticated;
GRANT SELECT ON mv_deal_pipeline TO authenticated;
GRANT SELECT ON mv_workforce_summary TO authenticated;
GRANT SELECT ON mv_revenue_by_month TO authenticated;

GRANT EXECUTE ON FUNCTION refresh_executive_dashboard() TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_project_financials() TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_asset_utilization() TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_nps_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_deal_pipeline() TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_all_materialized_views() TO authenticated;

-- ============================================================================
-- ANALYTICS RPC FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION rpc_revenue_by_month(
  p_org_id UUID,
  p_months INTEGER DEFAULT 12
)
RETURNS TABLE (
  month DATE,
  deals_closed BIGINT,
  revenue NUMERIC,
  avg_deal_size NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT org_matches(p_org_id) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  RETURN QUERY
  SELECT
    rm.month,
    rm.deals_closed,
    rm.revenue,
    rm.avg_deal_size
  FROM mv_revenue_by_month rm
  WHERE rm.organization_id = p_org_id
    AND rm.month >= CURRENT_DATE - (p_months || ' months')::INTERVAL
  ORDER BY rm.month DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_revenue_by_month TO authenticated;

CREATE OR REPLACE FUNCTION rpc_top_clients_by_revenue(
  p_org_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  client_id UUID,
  client_name TEXT,
  total_revenue NUMERIC,
  deal_count BIGINT,
  avg_deal_value NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT org_matches(p_org_id) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  RETURN QUERY
  SELECT
    lo.id AS client_id,
    lo.name AS client_name,
    COALESCE(SUM(d.value), 0) AS total_revenue,
    COUNT(d.id) AS deal_count,
    ROUND(AVG(d.value), 2) AS avg_deal_value
  FROM legend_organizations lo
  JOIN deals d ON d.company_id = lo.id AND d.status = 'won'
  WHERE lo.organization_id = p_org_id
  GROUP BY lo.id, lo.name
  ORDER BY total_revenue DESC
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_top_clients_by_revenue TO authenticated;

CREATE OR REPLACE FUNCTION rpc_employee_productivity(
  p_org_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  employee_id UUID,
  employee_name TEXT,
  department TEXT,
  total_hours NUMERIC,
  billable_hours NUMERIC,
  billable_revenue NUMERIC,
  utilization_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT org_matches(p_org_id) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  RETURN QUERY
  SELECT
    we.id AS employee_id,
    (we.first_name || ' ' || we.last_name) AS employee_name,
    ld.name AS department,
    COALESCE(SUM(wte.hours), 0) AS total_hours,
    COALESCE(SUM(CASE WHEN wte.project_id IS NOT NULL THEN wte.hours ELSE 0 END), 0) AS billable_hours,
    COALESCE(SUM(wte.total_pay), 0) AS billable_revenue,
    CASE 
      WHEN SUM(wte.hours) > 0 THEN 
        ROUND((SUM(CASE WHEN wte.project_id IS NOT NULL THEN wte.hours ELSE 0 END) / SUM(wte.hours) * 100)::NUMERIC, 2)
      ELSE 0
    END AS utilization_rate
  FROM workforce_employees we
  LEFT JOIN legend_departments ld ON ld.id = we.department_id
  LEFT JOIN workforce_time_entries wte ON wte.employee_id = we.id
    AND wte.status = 'approved'
    AND (p_start_date IS NULL OR wte.work_date >= p_start_date)
    AND (p_end_date IS NULL OR wte.work_date <= p_end_date)
  WHERE we.organization_id = p_org_id
    AND we.status = 'active'
  GROUP BY we.id, we.first_name, we.last_name, ld.name
  ORDER BY billable_revenue DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_employee_productivity TO authenticated;

CREATE OR REPLACE FUNCTION rpc_deal_pipeline_analysis(p_org_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  IF NOT org_matches(p_org_id) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  SELECT jsonb_build_object(
    'by_status', (
      SELECT jsonb_agg(jsonb_build_object(
        'status', status,
        'count', SUM(deal_count),
        'value', SUM(total_value),
        'weighted_value', SUM(weighted_value)
      ))
      FROM mv_deal_pipeline
      WHERE organization_id = p_org_id
      GROUP BY status
    ),
    'by_month', (
      SELECT jsonb_agg(jsonb_build_object(
        'month', created_month,
        'count', SUM(deal_count),
        'value', SUM(total_value)
      ) ORDER BY created_month DESC)
      FROM mv_deal_pipeline
      WHERE organization_id = p_org_id
      GROUP BY created_month
      LIMIT 12
    ),
    'conversion_rates', (
      SELECT jsonb_build_object(
        'lead_to_qualified', ROUND(
          (SELECT COUNT(*)::NUMERIC FROM deals WHERE organization_id = p_org_id AND status IN ('qualified', 'proposal', 'won')) /
          NULLIF((SELECT COUNT(*)::NUMERIC FROM deals WHERE organization_id = p_org_id), 0) * 100, 2
        ),
        'qualified_to_proposal', ROUND(
          (SELECT COUNT(*)::NUMERIC FROM deals WHERE organization_id = p_org_id AND status IN ('proposal', 'won')) /
          NULLIF((SELECT COUNT(*)::NUMERIC FROM deals WHERE organization_id = p_org_id AND status IN ('qualified', 'proposal', 'won')), 0) * 100, 2
        ),
        'proposal_to_won', ROUND(
          (SELECT COUNT(*)::NUMERIC FROM deals WHERE organization_id = p_org_id AND status = 'won') /
          NULLIF((SELECT COUNT(*)::NUMERIC FROM deals WHERE organization_id = p_org_id AND status IN ('proposal', 'won', 'lost')), 0) * 100, 2
        )
      )
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_deal_pipeline_analysis TO authenticated;

CREATE OR REPLACE FUNCTION rpc_asset_roi_analysis(p_org_id UUID)
RETURNS TABLE (
  category TEXT,
  asset_count BIGINT,
  total_purchase_value NUMERIC,
  total_current_value NUMERIC,
  depreciation NUMERIC,
  utilization_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT org_matches(p_org_id) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  RETURN QUERY
  SELECT
    a.category,
    COUNT(*) AS asset_count,
    COALESCE(SUM(a.purchase_price), 0) AS total_purchase_value,
    COALESCE(SUM(a.current_value), 0) AS total_current_value,
    COALESCE(SUM(a.purchase_price), 0) - COALESCE(SUM(a.current_value), 0) AS depreciation,
    ROUND(
      (COUNT(*) FILTER (WHERE a.state IN ('reserved', 'deployed'))::NUMERIC / NULLIF(COUNT(*), 0) * 100),
      2
    ) AS utilization_rate
  FROM assets a
  WHERE a.organization_id = p_org_id
  GROUP BY a.category
  ORDER BY total_current_value DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_asset_roi_analysis TO authenticated;
