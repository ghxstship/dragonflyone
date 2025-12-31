-- ============================================================================
-- 0047_fix_function_errors.sql
-- Fix Database Function Errors
-- GHXSTSHIP Platform - Production Build Validation
-- ============================================================================

-- ============================================================================
-- FIX: rpc_project_timeline - column reference error
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
  
  IF v_project IS NULL THEN
    RAISE EXCEPTION 'Project not found';
  END IF;
  
  IF NOT org_matches(v_project.organization_id) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  SELECT jsonb_build_object(
    'project', jsonb_build_object(
      'id', v_project.id,
      'name', v_project.name,
      'start_date', v_project.start_date,
      'end_date', v_project.end_date,
      'phase', v_project.phase
    ),
    'milestones', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', m.id,
        'name', m.name,
        'due_date', m.due_date,
        'status', m.status
      ) ORDER BY m.due_date)
      FROM project_milestones m
      WHERE m.project_id = p_project_id
    ), '[]'::jsonb),
    'tasks', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', t.id,
        'title', t.title,
        'due_date', t.due_date,
        'status', t.status
      ) ORDER BY t.due_date)
      FROM tasks t
      WHERE t.project_id = p_project_id
    ), '[]'::jsonb)
  ) INTO v_timeline;

  RETURN v_timeline;
END;
$$;

-- ============================================================================
-- FIX: assign_workflow_to_user - column reference error
-- ============================================================================

CREATE OR REPLACE FUNCTION assign_workflow_to_user(
  p_workflow_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
BEGIN
  SELECT organization_id INTO v_org_id
  FROM workflows
  WHERE id = p_workflow_id;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Workflow not found';
  END IF;

  IF NOT org_matches(v_org_id) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  UPDATE workflows
  SET assigned_user_id = p_user_id,
      updated_at = NOW()
  WHERE id = p_workflow_id;

  RETURN TRUE;
END;
$$;

-- ============================================================================
-- FIX: get_user_workflows - column reference error
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_workflows(p_user_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID;
  v_workflows JSONB;
BEGIN
  v_user := COALESCE(p_user_id, current_platform_user_id());

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', w.id,
    'name', w.name,
    'status', w.status,
    'created_at', w.created_at
  ) ORDER BY w.created_at DESC), '[]'::jsonb)
  INTO v_workflows
  FROM workflows w
  WHERE w.assigned_user_id = v_user
    AND org_matches(w.organization_id);

  RETURN v_workflows;
END;
$$;

-- ============================================================================
-- FIX: rpc_deal_pipeline_analysis - aggregate function error
-- ============================================================================

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
    'total_deals', COUNT(*),
    'total_value', COALESCE(SUM(value), 0),
    'by_stage', (
      SELECT COALESCE(jsonb_object_agg(stage, stage_data), '{}'::jsonb)
      FROM (
        SELECT 
          stage,
          jsonb_build_object(
            'count', COUNT(*),
            'value', COALESCE(SUM(value), 0)
          ) as stage_data
        FROM deals
        WHERE organization_id = p_org_id
        GROUP BY stage
      ) stage_summary
    ),
    'by_status', (
      SELECT COALESCE(jsonb_object_agg(status, status_data), '{}'::jsonb)
      FROM (
        SELECT 
          status,
          jsonb_build_object(
            'count', COUNT(*),
            'value', COALESCE(SUM(value), 0)
          ) as status_data
        FROM deals
        WHERE organization_id = p_org_id
        GROUP BY status
      ) status_summary
    )
  ) INTO v_result
  FROM deals
  WHERE organization_id = p_org_id;

  RETURN v_result;
END;
$$;

-- ============================================================================
-- FIX: rpc_organization_dashboard_summary - GROUP BY error
-- ============================================================================

CREATE OR REPLACE FUNCTION rpc_organization_dashboard_summary(p_organization_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  IF NOT org_matches(p_organization_id) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  SELECT jsonb_build_object(
    'deals', (
      SELECT jsonb_build_object(
        'total_open', COUNT(*) FILTER (WHERE status NOT IN ('won', 'lost')),
        'total_value', COALESCE(SUM(value) FILTER (WHERE status NOT IN ('won', 'lost')), 0),
        'won_this_month', COUNT(*) FILTER (WHERE status = 'won' AND actual_close_date >= date_trunc('month', CURRENT_DATE)),
        'won_value_this_month', COALESCE(SUM(value) FILTER (WHERE status = 'won' AND actual_close_date >= date_trunc('month', CURRENT_DATE)), 0)
      )
      FROM deals WHERE organization_id = p_organization_id
    ),
    'projects', (
      SELECT jsonb_build_object(
        'active', COUNT(*) FILTER (WHERE phase NOT IN ('completed', 'cancelled')),
        'in_production', COUNT(*) FILTER (WHERE phase = 'in_production'),
        'total_budget', COALESCE(SUM(budget) FILTER (WHERE phase NOT IN ('completed', 'cancelled')), 0)
      )
      FROM projects WHERE organization_id = p_organization_id
    ),
    'assets', (
      SELECT jsonb_build_object(
        'total', COUNT(*),
        'available', COUNT(*) FILTER (WHERE state = 'available'),
        'deployed', COUNT(*) FILTER (WHERE state = 'deployed'),
        'maintenance_due', COUNT(*) FILTER (WHERE next_maintenance_at <= CURRENT_DATE + INTERVAL '7 days')
      )
      FROM assets WHERE organization_id = p_organization_id
    ),
    'workforce', (
      SELECT jsonb_build_object(
        'active_employees', COUNT(*) FILTER (WHERE status = 'active'),
        'pending_time_entries', (
          SELECT COUNT(*) FROM workforce_time_entries 
          WHERE organization_id = p_organization_id AND status = 'pending'
        ),
        'shifts_today', (
          SELECT COUNT(*) FROM workforce_shifts 
          WHERE organization_id = p_organization_id AND shift_date = CURRENT_DATE
        )
      )
      FROM workforce_employees WHERE organization_id = p_organization_id
    ),
    'pending_approvals', jsonb_build_object(
      'expenses', (SELECT COUNT(*) FROM finance_expenses WHERE organization_id = p_organization_id AND status = 'submitted'),
      'procurement', (SELECT COUNT(*) FROM procurement_requests WHERE organization_id = p_organization_id AND status = 'submitted'),
      'time_entries', (SELECT COUNT(*) FROM workforce_time_entries WHERE organization_id = p_organization_id AND status = 'pending'),
      'advances', (SELECT COUNT(*) FROM production_advances WHERE organization_id = p_organization_id AND status IN ('submitted', 'under_review'))
    ),
    'alerts', (
      SELECT jsonb_build_object(
        'critical', COUNT(*) FILTER (WHERE severity = 'critical' AND status IN ('triggered', 'acknowledged')),
        'warning', COUNT(*) FILTER (WHERE severity = 'warning' AND status IN ('triggered', 'acknowledged')),
        'total_unresolved', COUNT(*) FILTER (WHERE status IN ('triggered', 'acknowledged'))
      )
      FROM alert_history WHERE organization_id = p_organization_id
    ),
    'upcoming_events', (
      SELECT COALESCE(jsonb_agg(event_data ORDER BY start_date), '[]'::jsonb)
      FROM (
        SELECT jsonb_build_object(
          'id', id,
          'name', name,
          'start_date', start_datetime,
          'days_until', start_datetime::DATE - CURRENT_DATE
        ) as event_data,
        start_datetime as start_date
        FROM legend_events 
        WHERE organization_id = p_organization_id 
          AND status = 'active' 
          AND start_datetime >= CURRENT_DATE
        ORDER BY start_datetime
        LIMIT 5
      ) upcoming
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- ============================================================================
-- FIX: generate_deal_number - column does not exist
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_deal_number(p_organization_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_next_num INTEGER;
  v_deal_number TEXT;
BEGIN
  SELECT COALESCE(MAX(
    CASE 
      WHEN reference ~ '^DEAL-[0-9]+$' 
      THEN substring(reference from 'DEAL-([0-9]+)')::INTEGER 
      ELSE 0 
    END
  ), 0) + 1
  INTO v_next_num
  FROM deals
  WHERE organization_id = p_organization_id;

  v_deal_number := 'DEAL-' || LPAD(v_next_num::TEXT, 6, '0');
  
  RETURN v_deal_number;
END;
$$;

-- ============================================================================
-- FIX: can_access_entity - column does not exist
-- ============================================================================

CREATE OR REPLACE FUNCTION can_access_entity(
  p_entity_type TEXT,
  p_entity_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_user_id UUID;
BEGIN
  v_user_id := current_platform_user_id();
  
  CASE p_entity_type
    WHEN 'project' THEN
      SELECT organization_id INTO v_org_id
      FROM projects WHERE id = p_entity_id;
    WHEN 'deal' THEN
      SELECT organization_id INTO v_org_id
      FROM deals WHERE id = p_entity_id;
    WHEN 'contact' THEN
      SELECT organization_id INTO v_org_id
      FROM contacts WHERE id = p_entity_id;
    WHEN 'event' THEN
      SELECT organization_id INTO v_org_id
      FROM legend_events WHERE id = p_entity_id;
    WHEN 'asset' THEN
      SELECT organization_id INTO v_org_id
      FROM assets WHERE id = p_entity_id;
    ELSE
      RETURN FALSE;
  END CASE;

  IF v_org_id IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN org_matches(v_org_id);
END;
$$;

-- ============================================================================
-- FIX: rpc_ingest_pos_transaction - ON CONFLICT error
-- ============================================================================

CREATE OR REPLACE FUNCTION rpc_ingest_pos_transaction(
  p_org_id UUID,
  p_external_id TEXT,
  p_transaction_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transaction_id UUID;
  v_existing_id UUID;
BEGIN
  IF NOT org_matches(p_org_id) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  -- Check for existing transaction
  SELECT id INTO v_existing_id
  FROM integration_pos_transactions
  WHERE organization_id = p_org_id AND external_id = p_external_id;

  IF v_existing_id IS NOT NULL THEN
    -- Update existing
    UPDATE integration_pos_transactions
    SET 
      transaction_data = p_transaction_data,
      updated_at = NOW()
    WHERE id = v_existing_id
    RETURNING id INTO v_transaction_id;
  ELSE
    -- Insert new
    INSERT INTO integration_pos_transactions (
      organization_id,
      external_id,
      transaction_data,
      transaction_type,
      transaction_date,
      total_amount
    ) VALUES (
      p_org_id,
      p_external_id,
      p_transaction_data,
      COALESCE(p_transaction_data->>'type', 'sale'),
      COALESCE((p_transaction_data->>'date')::TIMESTAMPTZ, NOW()),
      COALESCE((p_transaction_data->>'total')::NUMERIC, 0)
    )
    RETURNING id INTO v_transaction_id;
  END IF;

  RETURN jsonb_build_object(
    'transaction_id', v_transaction_id,
    'success', true
  );
END;
$$;

-- ============================================================================
-- FIX: rpc_get_pos_sales_summary - nested aggregate error
-- ============================================================================

CREATE OR REPLACE FUNCTION rpc_get_pos_sales_summary(
  p_org_id UUID,
  p_event_id UUID DEFAULT NULL,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  total_sales NUMERIC,
  total_transactions INTEGER,
  total_tax NUMERIC,
  total_tips NUMERIC,
  total_discounts NUMERIC,
  avg_transaction NUMERIC,
  sales_by_type JSONB
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
  WITH base_data AS (
    SELECT 
      pt.total_amount,
      pt.tax_amount,
      pt.tip_amount,
      pt.discount_amount,
      COALESCE(pt.order_type, 'other') as order_type
    FROM integration_pos_transactions pt
    WHERE pt.organization_id = p_org_id
      AND pt.transaction_type = 'sale'
      AND (p_event_id IS NULL OR pt.event_id = p_event_id)
      AND (p_start_date IS NULL OR pt.transaction_date >= p_start_date)
      AND (p_end_date IS NULL OR pt.transaction_date <= p_end_date)
  ),
  summary AS (
    SELECT 
      COALESCE(SUM(total_amount), 0)::NUMERIC as total_sales,
      COUNT(*)::INTEGER as total_transactions,
      COALESCE(SUM(tax_amount), 0)::NUMERIC as total_tax,
      COALESCE(SUM(tip_amount), 0)::NUMERIC as total_tips,
      COALESCE(SUM(discount_amount), 0)::NUMERIC as total_discounts,
      COALESCE(AVG(total_amount), 0)::NUMERIC as avg_transaction
    FROM base_data
  ),
  by_type AS (
    SELECT jsonb_object_agg(
      order_type,
      jsonb_build_object('count', type_count, 'total', type_total)
    ) as sales_by_type
    FROM (
      SELECT 
        order_type,
        COUNT(*) as type_count,
        SUM(total_amount) as type_total
      FROM base_data
      GROUP BY order_type
    ) type_summary
  )
  SELECT 
    s.total_sales,
    s.total_transactions,
    s.total_tax,
    s.total_tips,
    s.total_discounts,
    s.avg_transaction,
    COALESCE(bt.sales_by_type, '{}'::jsonb)
  FROM summary s
  CROSS JOIN by_type bt;
END;
$$;

-- ============================================================================
-- FIX: promote_ad_hoc_vendor - column does not exist
-- ============================================================================

CREATE OR REPLACE FUNCTION promote_ad_hoc_vendor(p_ad_hoc_vendor_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ad_hoc RECORD;
  v_new_org_id UUID;
BEGIN
  SELECT * INTO v_ad_hoc
  FROM ad_hoc_vendors
  WHERE id = p_ad_hoc_vendor_id;

  IF v_ad_hoc IS NULL THEN
    RAISE EXCEPTION 'Ad-hoc vendor not found';
  END IF;

  IF NOT org_matches(v_ad_hoc.organization_id) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  INSERT INTO legend_organizations (
    organization_id,
    name,
    org_type,
    status,
    primary_email,
    primary_phone,
    metadata
  ) VALUES (
    v_ad_hoc.organization_id,
    v_ad_hoc.name,
    'vendor',
    'active',
    v_ad_hoc.contact_email,
    v_ad_hoc.contact_phone,
    jsonb_build_object(
      'promoted_from_ad_hoc', p_ad_hoc_vendor_id,
      'original_notes', v_ad_hoc.notes
    )
  )
  RETURNING id INTO v_new_org_id;

  -- Mark ad-hoc vendor as promoted
  UPDATE ad_hoc_vendors
  SET 
    promoted_to_org_id = v_new_org_id,
    promoted_at = NOW()
  WHERE id = p_ad_hoc_vendor_id;

  RETURN v_new_org_id;
END;
$$;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION rpc_project_timeline TO authenticated;
GRANT EXECUTE ON FUNCTION assign_workflow_to_user TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_workflows TO authenticated;
GRANT EXECUTE ON FUNCTION rpc_deal_pipeline_analysis TO authenticated;
GRANT EXECUTE ON FUNCTION rpc_organization_dashboard_summary TO authenticated;
GRANT EXECUTE ON FUNCTION generate_deal_number TO authenticated;
GRANT EXECUTE ON FUNCTION can_access_entity TO authenticated;
GRANT EXECUTE ON FUNCTION rpc_ingest_pos_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION rpc_get_pos_sales_summary TO authenticated;
GRANT EXECUTE ON FUNCTION promote_ad_hoc_vendor TO authenticated;
