-- ============================================================================
-- 0020_business_logic_rpcs.sql
-- Business Logic RPC Functions
-- GHXSTSHIP Platform - 3NF Gap Remediation
-- ============================================================================

-- ============================================================================
-- DEAL & CONTACT MANAGEMENT
-- ============================================================================

CREATE OR REPLACE FUNCTION rpc_create_deal_with_contact(
  p_org_id UUID,
  p_title TEXT,
  p_contact_first_name TEXT,
  p_contact_last_name TEXT,
  p_contact_email TEXT,
  p_contact_phone TEXT DEFAULT NULL,
  p_contact_company TEXT DEFAULT NULL,
  p_deal_value NUMERIC DEFAULT NULL,
  p_expected_close_date DATE DEFAULT NULL,
  p_source TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_contact_id UUID;
  v_deal_id UUID;
BEGIN
  IF NOT org_matches(p_org_id) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  SELECT id INTO v_contact_id
  FROM contacts
  WHERE organization_id = p_org_id AND email = p_contact_email
  LIMIT 1;

  IF v_contact_id IS NULL THEN
    INSERT INTO contacts (
      organization_id,
      first_name,
      last_name,
      email,
      phone,
      company,
      source
    ) VALUES (
      p_org_id,
      p_contact_first_name,
      p_contact_last_name,
      p_contact_email,
      p_contact_phone,
      p_contact_company,
      p_source
    ) RETURNING id INTO v_contact_id;
  END IF;

  INSERT INTO deals (
    organization_id,
    title,
    contact_id,
    value,
    expected_close_date,
    source,
    owner_id
  ) VALUES (
    p_org_id,
    p_title,
    v_contact_id,
    p_deal_value,
    p_expected_close_date,
    p_source,
    current_platform_user_id()
  ) RETURNING id INTO v_deal_id;

  RETURN jsonb_build_object(
    'deal_id', v_deal_id,
    'contact_id', v_contact_id,
    'success', true
  );
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_create_deal_with_contact TO authenticated;

-- ============================================================================
-- PROJECT CREATION FROM DEAL
-- ============================================================================

CREATE OR REPLACE FUNCTION rpc_create_project_from_deal(
  p_deal_id UUID,
  p_project_code TEXT,
  p_project_name TEXT DEFAULT NULL,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deal RECORD;
  v_project_id UUID;
BEGIN
  SELECT * INTO v_deal FROM deals WHERE id = p_deal_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Deal not found';
  END IF;
  
  IF NOT org_matches(v_deal.organization_id) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  INSERT INTO projects (
    organization_id,
    code,
    name,
    deal_id,
    client_id,
    start_date,
    end_date,
    budget,
    currency,
    project_manager_id
  ) VALUES (
    v_deal.organization_id,
    p_project_code,
    COALESCE(p_project_name, v_deal.title),
    p_deal_id,
    v_deal.company_id,
    p_start_date,
    p_end_date,
    v_deal.value,
    v_deal.currency,
    current_platform_user_id()
  ) RETURNING id INTO v_project_id;

  UPDATE deals
  SET status = 'won',
      actual_close_date = CURRENT_DATE
  WHERE id = p_deal_id;

  RETURN jsonb_build_object(
    'project_id', v_project_id,
    'deal_id', p_deal_id,
    'success', true
  );
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_create_project_from_deal TO authenticated;

-- ============================================================================
-- ASSET AVAILABILITY CHECK
-- ============================================================================

CREATE OR REPLACE FUNCTION rpc_check_asset_availability(
  p_asset_ids UUID[],
  p_start_date DATE,
  p_end_date DATE,
  p_exclude_project_id UUID DEFAULT NULL
)
RETURNS TABLE (
  asset_id UUID,
  asset_tag TEXT,
  asset_name TEXT,
  current_state asset_state,
  is_available BOOLEAN,
  conflict_project_id UUID,
  conflict_project_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id AS asset_id,
    a.tag AS asset_tag,
    a.name AS asset_name,
    a.state AS current_state,
    CASE 
      WHEN a.state IN ('maintenance', 'retired') THEN false
      WHEN a.project_id IS NOT NULL AND a.project_id != COALESCE(p_exclude_project_id, '00000000-0000-0000-0000-000000000000'::UUID) THEN false
      ELSE true
    END AS is_available,
    CASE 
      WHEN a.project_id IS NOT NULL AND a.project_id != COALESCE(p_exclude_project_id, '00000000-0000-0000-0000-000000000000'::UUID) THEN a.project_id
      ELSE NULL
    END AS conflict_project_id,
    CASE 
      WHEN a.project_id IS NOT NULL AND a.project_id != COALESCE(p_exclude_project_id, '00000000-0000-0000-0000-000000000000'::UUID) THEN p.name
      ELSE NULL
    END AS conflict_project_name
  FROM assets a
  LEFT JOIN projects p ON p.id = a.project_id
  WHERE a.id = ANY(p_asset_ids);
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_check_asset_availability TO authenticated;

-- ============================================================================
-- ASSIGN ASSETS TO PROJECT
-- ============================================================================

CREATE OR REPLACE FUNCTION rpc_assign_assets_to_project(
  p_project_id UUID,
  p_asset_ids UUID[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_project RECORD;
  v_assigned INTEGER := 0;
  v_failed INTEGER := 0;
  v_asset_id UUID;
BEGIN
  SELECT * INTO v_project FROM projects WHERE id = p_project_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Project not found';
  END IF;
  
  IF NOT org_matches(v_project.organization_id) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  FOREACH v_asset_id IN ARRAY p_asset_ids
  LOOP
    UPDATE assets
    SET project_id = p_project_id,
        state = 'reserved'
    WHERE id = v_asset_id
      AND organization_id = v_project.organization_id
      AND state = 'available';
    
    IF FOUND THEN
      v_assigned := v_assigned + 1;
    ELSE
      v_failed := v_failed + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'project_id', p_project_id,
    'assigned', v_assigned,
    'failed', v_failed,
    'success', v_failed = 0
  );
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_assign_assets_to_project TO authenticated;

-- ============================================================================
-- PROJECT FINANCIAL SUMMARY
-- ============================================================================

CREATE OR REPLACE FUNCTION rpc_project_financial_summary(p_project_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_project RECORD;
  v_budget NUMERIC;
  v_expenses NUMERIC;
  v_po_total NUMERIC;
  v_bills_total NUMERIC;
  v_labor_cost NUMERIC;
  v_revenue NUMERIC;
BEGIN
  SELECT * INTO v_project FROM projects WHERE id = p_project_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Project not found';
  END IF;
  
  IF NOT org_matches(v_project.organization_id) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  v_budget := COALESCE(v_project.budget, 0);

  SELECT COALESCE(SUM(amount), 0) INTO v_expenses
  FROM finance_expenses
  WHERE project_id = p_project_id AND status = 'approved';

  SELECT COALESCE(SUM(total_amount), 0) INTO v_po_total
  FROM finance_purchase_orders
  WHERE project_id = p_project_id AND status NOT IN ('cancelled', 'draft');

  SELECT COALESCE(SUM(total_amount), 0) INTO v_bills_total
  FROM bills
  WHERE project_id = p_project_id AND status != 'cancelled';

  SELECT COALESCE(SUM(total_pay), 0) INTO v_labor_cost
  FROM workforce_time_entries
  WHERE project_id = p_project_id AND status = 'approved';

  SELECT COALESCE(SUM(le.amount), 0) INTO v_revenue
  FROM ledger_entries le
  JOIN ledger_accounts la ON la.id = le.account_id
  WHERE le.project_id = p_project_id
    AND la.account_type = 'Revenue'
    AND le.side = 'credit';

  RETURN jsonb_build_object(
    'project_id', p_project_id,
    'project_name', v_project.name,
    'budget', v_budget,
    'expenses', v_expenses,
    'purchase_orders', v_po_total,
    'bills', v_bills_total,
    'labor_cost', v_labor_cost,
    'total_cost', v_expenses + v_bills_total + v_labor_cost,
    'revenue', v_revenue,
    'budget_remaining', v_budget - (v_expenses + v_bills_total + v_labor_cost),
    'profit_margin', CASE WHEN v_revenue > 0 THEN ((v_revenue - (v_expenses + v_bills_total + v_labor_cost)) / v_revenue * 100) ELSE 0 END,
    'currency', v_project.currency
  );
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_project_financial_summary TO authenticated;

-- ============================================================================
-- WORKFORCE UTILIZATION
-- ============================================================================

CREATE OR REPLACE FUNCTION rpc_workforce_utilization(
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
  utilization_rate NUMERIC,
  projects_worked INTEGER
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
    CASE 
      WHEN SUM(wte.hours) > 0 THEN 
        ROUND((SUM(CASE WHEN wte.project_id IS NOT NULL THEN wte.hours ELSE 0 END) / SUM(wte.hours) * 100)::NUMERIC, 2)
      ELSE 0
    END AS utilization_rate,
    COUNT(DISTINCT wte.project_id)::INTEGER AS projects_worked
  FROM workforce_employees we
  LEFT JOIN legend_departments ld ON ld.id = we.department_id
  LEFT JOIN workforce_time_entries wte ON wte.employee_id = we.id
    AND wte.status = 'approved'
    AND (p_start_date IS NULL OR wte.work_date >= p_start_date)
    AND (p_end_date IS NULL OR wte.work_date <= p_end_date)
  WHERE we.organization_id = p_org_id
    AND we.status = 'active'
  GROUP BY we.id, we.first_name, we.last_name, ld.name
  ORDER BY utilization_rate DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_workforce_utilization TO authenticated;

-- ============================================================================
-- DASHBOARD METRICS
-- ============================================================================

CREATE OR REPLACE FUNCTION rpc_dashboard_metrics(p_org_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_metrics JSONB;
BEGIN
  IF NOT org_matches(p_org_id) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  SELECT jsonb_build_object(
    'deals', (
      SELECT jsonb_build_object(
        'total', COUNT(*),
        'lead', COUNT(*) FILTER (WHERE status = 'lead'),
        'qualified', COUNT(*) FILTER (WHERE status = 'qualified'),
        'proposal', COUNT(*) FILTER (WHERE status = 'proposal'),
        'won', COUNT(*) FILTER (WHERE status = 'won'),
        'lost', COUNT(*) FILTER (WHERE status = 'lost'),
        'total_value', COALESCE(SUM(value), 0),
        'pipeline_value', COALESCE(SUM(value) FILTER (WHERE status IN ('lead', 'qualified', 'proposal')), 0)
      )
      FROM deals WHERE organization_id = p_org_id
    ),
    'projects', (
      SELECT jsonb_build_object(
        'total', COUNT(*),
        'active', COUNT(*) FILTER (WHERE phase IN ('intake', 'preproduction', 'in_production', 'post')),
        'completed', COUNT(*) FILTER (WHERE phase = 'completed'),
        'total_budget', COALESCE(SUM(budget), 0)
      )
      FROM projects WHERE organization_id = p_org_id
    ),
    'assets', (
      SELECT jsonb_build_object(
        'total', COUNT(*),
        'available', COUNT(*) FILTER (WHERE state = 'available'),
        'reserved', COUNT(*) FILTER (WHERE state = 'reserved'),
        'deployed', COUNT(*) FILTER (WHERE state = 'deployed'),
        'maintenance', COUNT(*) FILTER (WHERE state = 'maintenance'),
        'total_value', COALESCE(SUM(current_value), 0)
      )
      FROM assets WHERE organization_id = p_org_id
    ),
    'workforce', (
      SELECT jsonb_build_object(
        'total_employees', COUNT(*),
        'active', COUNT(*) FILTER (WHERE status = 'active'),
        'on_leave', COUNT(*) FILTER (WHERE status = 'on_leave')
      )
      FROM workforce_employees WHERE organization_id = p_org_id
    ),
    'expenses', (
      SELECT jsonb_build_object(
        'pending_approval', COUNT(*) FILTER (WHERE status = 'submitted'),
        'approved_this_month', COALESCE(SUM(amount) FILTER (WHERE status = 'approved' AND expense_date >= date_trunc('month', CURRENT_DATE)), 0)
      )
      FROM finance_expenses WHERE organization_id = p_org_id
    ),
    'alerts', (
      SELECT jsonb_build_object(
        'critical', COUNT(*) FILTER (WHERE severity = 'critical' AND status = 'triggered'),
        'warning', COUNT(*) FILTER (WHERE severity = 'warning' AND status = 'triggered')
      )
      FROM alert_history WHERE organization_id = p_org_id
    )
  ) INTO v_metrics;

  RETURN v_metrics;
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_dashboard_metrics TO authenticated;

-- ============================================================================
-- SEARCH CONTACTS
-- ============================================================================

CREATE OR REPLACE FUNCTION rpc_search_contacts(
  p_org_id UUID,
  p_query TEXT,
  p_limit INTEGER DEFAULT 20
)
RETURNS SETOF contacts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT org_matches(p_org_id) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  RETURN QUERY
  SELECT *
  FROM contacts
  WHERE organization_id = p_org_id
    AND (
      first_name ILIKE '%' || p_query || '%' OR
      last_name ILIKE '%' || p_query || '%' OR
      email ILIKE '%' || p_query || '%' OR
      company ILIKE '%' || p_query || '%' OR
      phone ILIKE '%' || p_query || '%'
    )
  ORDER BY 
    CASE WHEN email ILIKE p_query || '%' THEN 0 ELSE 1 END,
    last_name, first_name
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_search_contacts TO authenticated;

-- ============================================================================
-- BATCH UPDATE DEAL STATUS
-- ============================================================================

CREATE OR REPLACE FUNCTION rpc_batch_update_deal_status(
  p_deal_ids UUID[],
  p_new_status deal_status
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  UPDATE deals
  SET status = p_new_status,
      actual_close_date = CASE WHEN p_new_status IN ('won', 'lost') THEN CURRENT_DATE ELSE actual_close_date END
  WHERE id = ANY(p_deal_ids)
    AND org_matches(organization_id);
  
  GET DIAGNOSTICS v_updated = ROW_COUNT;

  RETURN jsonb_build_object(
    'updated', v_updated,
    'new_status', p_new_status,
    'success', true
  );
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_batch_update_deal_status TO authenticated;

-- ============================================================================
-- ASSET CALENDAR
-- ============================================================================

CREATE OR REPLACE FUNCTION rpc_asset_calendar(
  p_org_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  asset_id UUID,
  asset_tag TEXT,
  asset_name TEXT,
  category TEXT,
  state asset_state,
  project_id UUID,
  project_name TEXT,
  project_start DATE,
  project_end DATE
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
    a.id AS asset_id,
    a.tag AS asset_tag,
    a.name AS asset_name,
    a.category,
    a.state,
    p.id AS project_id,
    p.name AS project_name,
    p.start_date AS project_start,
    p.end_date AS project_end
  FROM assets a
  LEFT JOIN projects p ON p.id = a.project_id
  WHERE a.organization_id = p_org_id
    AND (p_category IS NULL OR a.category = p_category)
    AND (
      a.project_id IS NULL OR
      (p.start_date <= p_end_date AND p.end_date >= p_start_date)
    )
  ORDER BY a.category, a.tag;
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_asset_calendar TO authenticated;

-- ============================================================================
-- WORKFORCE CAPACITY
-- ============================================================================

CREATE OR REPLACE FUNCTION rpc_workforce_capacity(
  p_org_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_role_id UUID DEFAULT NULL
)
RETURNS TABLE (
  date DATE,
  total_capacity_hours NUMERIC,
  scheduled_hours NUMERIC,
  available_hours NUMERIC,
  utilization_percent NUMERIC
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
  WITH date_series AS (
    SELECT generate_series(p_start_date, p_end_date, '1 day'::INTERVAL)::DATE AS date
  ),
  employee_count AS (
    SELECT COUNT(*) AS cnt
    FROM workforce_employees we
    WHERE we.organization_id = p_org_id
      AND we.status = 'active'
      AND (p_role_id IS NULL OR EXISTS (
        SELECT 1 FROM workforce_employee_roles wer
        WHERE wer.employee_id = we.id AND wer.role_id = p_role_id
      ))
  ),
  scheduled AS (
    SELECT
      ws.shift_date,
      SUM(EXTRACT(EPOCH FROM (ws.end_time - ws.start_time)) / 3600) AS hours
    FROM workforce_shifts ws
    WHERE ws.organization_id = p_org_id
      AND ws.shift_date BETWEEN p_start_date AND p_end_date
      AND (p_role_id IS NULL OR ws.role_id = p_role_id)
    GROUP BY ws.shift_date
  )
  SELECT
    ds.date,
    (ec.cnt * 8)::NUMERIC AS total_capacity_hours,
    COALESCE(s.hours, 0)::NUMERIC AS scheduled_hours,
    ((ec.cnt * 8) - COALESCE(s.hours, 0))::NUMERIC AS available_hours,
    CASE WHEN ec.cnt > 0 THEN ROUND((COALESCE(s.hours, 0) / (ec.cnt * 8) * 100)::NUMERIC, 2) ELSE 0 END AS utilization_percent
  FROM date_series ds
  CROSS JOIN employee_count ec
  LEFT JOIN scheduled s ON s.shift_date = ds.date
  ORDER BY ds.date;
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_workforce_capacity TO authenticated;

-- ============================================================================
-- PROJECT TIMELINE
-- ============================================================================

CREATE OR REPLACE FUNCTION rpc_project_timeline(p_project_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_project RECORD;
  v_timeline JSONB;
BEGIN
  SELECT * INTO v_project FROM projects WHERE id = p_project_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Project not found';
  END IF;
  
  IF NOT org_matches(v_project.organization_id) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  SELECT jsonb_build_object(
    'project', jsonb_build_object(
      'id', v_project.id,
      'name', v_project.name,
      'phase', v_project.phase,
      'start_date', v_project.start_date,
      'end_date', v_project.end_date
    ),
    'milestones', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', si.id,
        'name', si.title,
        'state', si.current_state,
        'due_date', si.due_at
      ) ORDER BY si.due_at)
      FROM saga_instances si
      WHERE si.related_entity_id = p_project_id
        AND si.related_entity_type = 'project'
    ), '[]'::jsonb),
    'expenses', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', fe.id,
        'amount', fe.amount,
        'date', fe.expense_date,
        'status', fe.status
      ) ORDER BY fe.expense_date)
      FROM finance_expenses fe
      WHERE fe.project_id = p_project_id
    ), '[]'::jsonb),
    'time_entries', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'date', wte.work_date,
        'hours', SUM(wte.hours)
      ) ORDER BY wte.work_date)
      FROM workforce_time_entries wte
      WHERE wte.project_id = p_project_id
      GROUP BY wte.work_date
    ), '[]'::jsonb)
  ) INTO v_timeline;

  RETURN v_timeline;
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_project_timeline TO authenticated;

-- ============================================================================
-- WORKFLOW ASSIGNMENT FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION assign_workflow_to_user(
  p_saga_id UUID,
  p_user_id UUID,
  p_role TEXT DEFAULT 'assignee'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_participant_id UUID;
BEGIN
  INSERT INTO saga_participants (
    saga_id,
    participant_type,
    platform_user_id,
    role,
    assigned_by
  ) VALUES (
    p_saga_id,
    'user',
    p_user_id,
    p_role,
    current_platform_user_id()
  ) RETURNING id INTO v_participant_id;

  RETURN v_participant_id;
END;
$$;

GRANT EXECUTE ON FUNCTION assign_workflow_to_user TO authenticated;

CREATE OR REPLACE FUNCTION get_user_workflows(
  p_user_id UUID DEFAULT NULL,
  p_status saga_state[] DEFAULT NULL
)
RETURNS TABLE (
  saga_id UUID,
  saga_type saga_type,
  title TEXT,
  current_state saga_state,
  priority saga_priority,
  due_at TIMESTAMPTZ,
  role TEXT,
  assigned_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    si.id AS saga_id,
    si.saga_type,
    si.title,
    si.current_state,
    si.priority,
    si.due_at,
    sp.role,
    sp.assigned_at
  FROM saga_instances si
  JOIN saga_participants sp ON sp.saga_id = si.id
  WHERE sp.platform_user_id = COALESCE(p_user_id, current_platform_user_id())
    AND (p_status IS NULL OR si.current_state = ANY(p_status))
    AND sp.is_active = true
  ORDER BY 
    CASE si.priority WHEN 'critical' THEN 1 WHEN 'urgent' THEN 2 WHEN 'high' THEN 3 WHEN 'normal' THEN 4 ELSE 5 END,
    si.due_at NULLS LAST;
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_workflows TO authenticated;
