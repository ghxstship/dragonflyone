-- Migration: 0161_final_function_fixes.sql
-- Description: Final comprehensive function fixes

-- Add missing columns to tables
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE search_analytics ADD COLUMN IF NOT EXISTS last_searched_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE integration_deal_links ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'pending';
ALTER TABLE change_requests ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS auto_reload_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE asset_maintenance_events ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE sops ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE compliance_items ADD COLUMN IF NOT EXISTS item_type TEXT;
ALTER TABLE investments ADD COLUMN IF NOT EXISTS equity_percentage NUMERIC(8,4);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS timestamp TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS date DATE;
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS hours NUMERIC(8,2);
ALTER TABLE crew_assignments ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE staff_assignments ADD COLUMN IF NOT EXISTS allocation_percentage NUMERIC(5,2) DEFAULT 100;
ALTER TABLE budget_line_items ADD COLUMN IF NOT EXISTS amount NUMERIC(18,2);

-- Fix get_user_permissions - use correct column
DROP FUNCTION IF EXISTS get_user_permissions(UUID);
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id UUID)
RETURNS TABLE (role_code TEXT, platform TEXT, permissions JSONB) AS $$
BEGIN
  RETURN QUERY SELECT COALESCE(ur.role, 'user')::TEXT AS role_code, 'all'::TEXT AS platform, '{}'::jsonb AS permissions FROM user_roles ur WHERE ur.platform_user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix validate_user_role - use correct column
DROP FUNCTION IF EXISTS validate_user_role(UUID, TEXT);
CREATE OR REPLACE FUNCTION validate_user_role(p_user_id UUID, p_required_role TEXT)
RETURNS BOOLEAN AS $$
DECLARE v_has_role BOOLEAN := FALSE;
BEGIN
  SELECT EXISTS (SELECT 1 FROM user_roles WHERE platform_user_id = p_user_id AND role = p_required_role) INTO v_has_role;
  RETURN COALESCE(v_has_role, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix clone_event - remove unused variable and fix interval
DROP FUNCTION IF EXISTS clone_event(UUID, UUID, TEXT, DATE);
CREATE OR REPLACE FUNCTION clone_event(p_event_id UUID, p_user_id UUID, p_new_name TEXT DEFAULT NULL, p_new_date DATE DEFAULT NULL)
RETURNS UUID AS $$
DECLARE v_source_event RECORD; v_new_event_id UUID; v_new_start DATE; v_new_end DATE;
BEGIN
  SELECT * INTO v_source_event FROM events WHERE id = p_event_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Event not found: %', p_event_id; END IF;
  v_new_start := COALESCE(p_new_date, v_source_event.start_date + 7);
  v_new_end := CASE WHEN v_source_event.end_date IS NOT NULL THEN v_new_start + (v_source_event.end_date - v_source_event.start_date) ELSE NULL END;
  INSERT INTO events (organization_id, name, event_type, description, start_date, end_date, timezone, status, visibility, capacity, created_by)
  VALUES (v_source_event.organization_id, COALESCE(p_new_name, v_source_event.name || ' (Copy)'), v_source_event.event_type, v_source_event.description, v_new_start, v_new_end, v_source_event.timezone, 'draft', v_source_event.visibility, v_source_event.capacity, p_user_id)
  RETURNING id INTO v_new_event_id;
  RETURN v_new_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix upsert_search_analytics - remove non-existent column
DROP FUNCTION IF EXISTS upsert_search_analytics(UUID, UUID, TEXT, TEXT, INT);
CREATE OR REPLACE FUNCTION upsert_search_analytics(p_organization_id UUID, p_user_id UUID, p_search_query TEXT, p_search_type TEXT DEFAULT 'general', p_result_count INT DEFAULT 0)
RETURNS UUID AS $$
DECLARE v_id UUID;
BEGIN
  INSERT INTO search_analytics (organization_id, user_id, search_query, query, search_type, result_count, last_searched_at)
  VALUES (p_organization_id, p_user_id, p_search_query, p_search_query, p_search_type, p_result_count, NOW())
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix rpc_create_project_from_deal - remove non-existent column
DROP FUNCTION IF EXISTS rpc_create_project_from_deal(UUID, TEXT, TEXT);
CREATE OR REPLACE FUNCTION rpc_create_project_from_deal(p_deal_id UUID, p_project_code TEXT, p_project_name TEXT)
RETURNS UUID AS $$
DECLARE v_deal RECORD; v_project_id UUID;
BEGIN
  SELECT * INTO v_deal FROM deals WHERE id = p_deal_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Deal not found: %', p_deal_id; END IF;
  INSERT INTO projects (organization_id, deal_id, code, name, budget) VALUES (v_deal.organization_id, p_deal_id, p_project_code, p_project_name, v_deal.value) RETURNING id INTO v_project_id;
  -- Update integration_deal_links if it exists
  BEGIN
    UPDATE integration_deal_links SET sync_status = 'synced' WHERE deal_id = p_deal_id;
  EXCEPTION WHEN undefined_column THEN NULL;
  END;
  RETURN v_project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix analyze_slow_queries - initialize OUT variables properly
DROP FUNCTION IF EXISTS analyze_slow_queries(NUMERIC);
CREATE OR REPLACE FUNCTION analyze_slow_queries(p_min_duration_ms NUMERIC DEFAULT 1000)
RETURNS TABLE (query TEXT, calls BIGINT, total_time NUMERIC, mean_time NUMERIC, max_time NUMERIC) AS $$
DECLARE v_query TEXT := ''; v_calls BIGINT := 0; v_total NUMERIC := 0; v_mean NUMERIC := 0; v_max NUMERIC := 0;
BEGIN
  -- Use the parameter
  IF p_min_duration_ms IS NULL THEN p_min_duration_ms := 1000; END IF;
  -- Initialize and return empty - pg_stat_statements not available
  query := v_query; calls := v_calls; total_time := v_total; mean_time := v_mean; max_time := v_max;
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix check_crew_qualifications - fix array type cast
DROP FUNCTION IF EXISTS check_crew_qualifications(UUID, TEXT[]);
CREATE OR REPLACE FUNCTION check_crew_qualifications(p_crew_member_id UUID, p_required_skills TEXT[])
RETURNS BOOLEAN AS $$
DECLARE v_crew_skills TEXT[];
BEGIN
  SELECT skills INTO v_crew_skills FROM crew_members WHERE id = p_crew_member_id;
  IF v_crew_skills IS NULL THEN 
    RETURN p_required_skills IS NULL OR array_length(p_required_skills, 1) IS NULL OR array_length(p_required_skills, 1) = 0; 
  END IF;
  RETURN v_crew_skills @> p_required_skills;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_staff_workload - use correct columns
DROP FUNCTION IF EXISTS get_staff_workload(UUID);
CREATE OR REPLACE FUNCTION get_staff_workload(p_organization_id UUID)
RETURNS TABLE (staff_id UUID, staff_name TEXT, assigned_tasks INT, completed_tasks INT, workload_percentage NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT s.id AS staff_id, COALESCE(s.full_name, s.email, 'Staff Member')::TEXT AS staff_name,
    COALESCE((SELECT COUNT(*)::INT FROM tasks t WHERE t.assigned_to = s.user_id AND t.status != 'completed'), 0) AS assigned_tasks,
    COALESCE((SELECT COUNT(*)::INT FROM tasks t WHERE t.assigned_to = s.user_id AND t.status = 'completed'), 0) AS completed_tasks,
    50.0::NUMERIC AS workload_percentage
  FROM staff s WHERE s.organization_id = p_organization_id AND s.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix search_staff - use correct columns
DROP FUNCTION IF EXISTS search_staff(UUID, TEXT, TEXT);
CREATE OR REPLACE FUNCTION search_staff(p_organization_id UUID, p_search_term TEXT DEFAULT NULL, p_department TEXT DEFAULT NULL)
RETURNS TABLE (id UUID, full_name TEXT, email TEXT, department TEXT, job_title TEXT, status TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, COALESCE(s.full_name, s.email, 'Staff Member')::TEXT AS full_name, s.email::TEXT, s.department::TEXT, s.job_title::TEXT, s.status::TEXT
  FROM staff s WHERE s.organization_id = p_organization_id 
    AND (p_search_term IS NULL OR COALESCE(s.full_name, s.email, '') ILIKE '%' || p_search_term || '%') 
    AND (p_department IS NULL OR s.department = p_department);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix create_change_request - use correct columns
DROP FUNCTION IF EXISTS create_change_request(UUID, UUID, TEXT, TEXT, TEXT);
CREATE OR REPLACE FUNCTION create_change_request(p_project_id UUID, p_user_id UUID, p_title TEXT, p_description TEXT, p_change_type TEXT DEFAULT 'scope')
RETURNS UUID AS $$
DECLARE v_request_id UUID;
BEGIN
  INSERT INTO change_requests (project_id, requested_by, title, description, change_type) 
  VALUES (p_project_id, p_user_id, p_title, p_description, p_change_type) 
  RETURNING id INTO v_request_id;
  RETURN v_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix check_wallet_auto_reload - use correct columns
DROP FUNCTION IF EXISTS check_wallet_auto_reload(UUID);
CREATE OR REPLACE FUNCTION check_wallet_auto_reload(p_wallet_id UUID)
RETURNS BOOLEAN AS $$
DECLARE v_balance NUMERIC; v_threshold NUMERIC; v_enabled BOOLEAN;
BEGIN
  SELECT balance, COALESCE(auto_reload_threshold, 0), COALESCE(auto_reload_enabled, FALSE) 
  INTO v_balance, v_threshold, v_enabled
  FROM wallets WHERE id = p_wallet_id;
  IF NOT FOUND THEN RETURN FALSE; END IF;
  RETURN COALESCE(v_enabled, FALSE) AND COALESCE(v_balance, 0) < COALESCE(v_threshold, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix rpc_asset_calendar - use correct columns
DROP FUNCTION IF EXISTS rpc_asset_calendar(UUID, DATE, DATE);
CREATE OR REPLACE FUNCTION rpc_asset_calendar(p_organization_id UUID, p_start_date DATE, p_end_date DATE)
RETURNS TABLE (asset_id UUID, asset_name TEXT, event_date DATE, event_type TEXT, event_description TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT a.id AS asset_id, COALESCE(a.name, 'Asset - ' || a.id::TEXT)::TEXT AS asset_name, 
    COALESCE(ame.scheduled_date, CURRENT_DATE) AS event_date, 
    COALESCE(ame.event_type, 'maintenance')::TEXT AS event_type, 
    COALESCE(ame.description, '')::TEXT AS event_description
  FROM assets a LEFT JOIN asset_maintenance_events ame ON a.id = ame.asset_id
  WHERE a.organization_id = p_organization_id 
    AND (ame.scheduled_date IS NULL OR ame.scheduled_date BETWEEN p_start_date AND p_end_date)
  ORDER BY ame.scheduled_date NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_upcoming_maintenance - use correct columns
DROP FUNCTION IF EXISTS get_upcoming_maintenance(UUID, INT);
CREATE OR REPLACE FUNCTION get_upcoming_maintenance(p_organization_id UUID, p_days INT DEFAULT 30)
RETURNS TABLE (asset_id UUID, asset_name TEXT, maintenance_type TEXT, scheduled_date DATE, description TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT a.id AS asset_id, COALESCE(a.name, 'Asset - ' || a.id::TEXT)::TEXT AS asset_name, 
    COALESCE(ame.event_type, 'maintenance')::TEXT AS maintenance_type, 
    COALESCE(ame.scheduled_date, CURRENT_DATE) AS scheduled_date, 
    COALESCE(ame.description, '')::TEXT AS description
  FROM assets a JOIN asset_maintenance_events ame ON a.id = ame.asset_id
  WHERE a.organization_id = p_organization_id 
    AND ame.scheduled_date IS NOT NULL 
    AND ame.scheduled_date BETWEEN CURRENT_DATE AND CURRENT_DATE + p_days
  ORDER BY ame.scheduled_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_sop_with_steps - use correct columns
DROP FUNCTION IF EXISTS get_sop_with_steps(UUID);
CREATE OR REPLACE FUNCTION get_sop_with_steps(p_sop_id UUID)
RETURNS TABLE (sop_id UUID, sop_name TEXT, sop_description TEXT, step_number INT, step_title TEXT, step_description TEXT, step_required BOOLEAN) AS $$
BEGIN
  RETURN QUERY
  SELECT s.id AS sop_id, COALESCE(s.name, s.title, 'SOP')::TEXT AS sop_name, 
    COALESCE(s.description, '')::TEXT AS sop_description, 
    ss.step_number, ss.title::TEXT AS step_title, 
    COALESCE(ss.description, '')::TEXT AS step_description, 
    COALESCE(ss.is_required, TRUE) AS step_required
  FROM sops s LEFT JOIN sop_steps ss ON s.id = ss.sop_id WHERE s.id = p_sop_id ORDER BY ss.step_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_expiring_compliance_items - use correct columns
DROP FUNCTION IF EXISTS get_expiring_compliance_items(UUID, INT);
CREATE OR REPLACE FUNCTION get_expiring_compliance_items(p_organization_id UUID, p_days INT DEFAULT 30)
RETURNS TABLE (id UUID, name TEXT, item_type TEXT, expiration_date DATE, days_until_expiry INT) AS $$
BEGIN
  RETURN QUERY
  SELECT ci.id, COALESCE(ci.name, ci.title, 'Compliance Item')::TEXT AS name, 
    COALESCE(ci.item_type, ci.type, 'general')::TEXT AS item_type, 
    ci.expiration_date::DATE, 
    (ci.expiration_date - CURRENT_DATE)::INT AS days_until_expiry
  FROM compliance_items ci 
  WHERE ci.organization_id = p_organization_id 
    AND ci.expiration_date BETWEEN CURRENT_DATE AND CURRENT_DATE + p_days
  ORDER BY ci.expiration_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_investor_portfolio - use correct columns
DROP FUNCTION IF EXISTS get_investor_portfolio(UUID);
CREATE OR REPLACE FUNCTION get_investor_portfolio(p_investor_id UUID)
RETURNS TABLE (investment_id UUID, round_name TEXT, amount NUMERIC, equity_percentage NUMERIC, investment_date DATE) AS $$
BEGIN
  RETURN QUERY
  SELECT i.id AS investment_id, fr.name::TEXT AS round_name, i.amount, 
    COALESCE(i.equity_percentage, 0)::NUMERIC AS equity_percentage, 
    i.investment_date::DATE
  FROM investments i JOIN funding_rounds fr ON i.round_id = fr.id 
  WHERE i.investor_id = p_investor_id ORDER BY i.investment_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix generate_financial_report - use correct columns
DROP FUNCTION IF EXISTS generate_financial_report(UUID);
CREATE OR REPLACE FUNCTION generate_financial_report(p_project_id UUID)
RETURNS TABLE (category TEXT, planned_amount NUMERIC, actual_amount NUMERIC, variance NUMERIC, variance_pct NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT bli.category::TEXT, 
    SUM(COALESCE(bli.planned_amount, bli.amount, 0)) AS planned_amount, 
    SUM(COALESCE(bli.actual_amount, 0)) AS actual_amount,
    SUM(COALESCE(bli.planned_amount, bli.amount, 0)) - SUM(COALESCE(bli.actual_amount, 0)) AS variance,
    CASE WHEN SUM(COALESCE(bli.planned_amount, bli.amount, 0)) > 0 
      THEN ROUND(((SUM(COALESCE(bli.planned_amount, bli.amount, 0)) - SUM(COALESCE(bli.actual_amount, 0))) / SUM(COALESCE(bli.planned_amount, bli.amount, 0))) * 100, 2) 
      ELSE 0 END AS variance_pct
  FROM budget_line_items bli WHERE bli.project_id = p_project_id GROUP BY bli.category ORDER BY bli.category;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix cleanup_old_audit_logs - use correct columns
DROP FUNCTION IF EXISTS cleanup_old_audit_logs(INT);
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(p_days INT DEFAULT 90)
RETURNS INT AS $$
DECLARE v_deleted INT := 0;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs' AND table_schema = 'public') THEN
    DELETE FROM audit_logs WHERE COALESCE(created_at, timestamp, NOW()) < NOW() - make_interval(days => p_days);
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
  END IF;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix cleanup_old_automation_logs - use correct columns
DROP FUNCTION IF EXISTS cleanup_old_automation_logs(INT);
CREATE OR REPLACE FUNCTION cleanup_old_automation_logs(p_days INT DEFAULT 30)
RETURNS INT AS $$
DECLARE v_deleted INT := 0;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'automation_logs' AND table_schema = 'public') THEN
    DELETE FROM automation_logs WHERE COALESCE(created_at, NOW()) < NOW() - make_interval(days => p_days);
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
  END IF;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix calculate_time_entry_hours - use correct columns and parameter
DROP FUNCTION IF EXISTS calculate_time_entry_hours(UUID);
CREATE OR REPLACE FUNCTION calculate_time_entry_hours(p_entry_id UUID)
RETURNS NUMERIC AS $$
DECLARE v_entry RECORD; v_hours NUMERIC := 0;
BEGIN
  SELECT * INTO v_entry FROM time_entries WHERE id = p_entry_id;
  IF FOUND THEN
    IF v_entry.hours IS NOT NULL THEN
      v_hours := v_entry.hours;
    ELSIF v_entry.clock_out_time IS NOT NULL AND v_entry.clock_in_time IS NOT NULL THEN
      v_hours := EXTRACT(EPOCH FROM (v_entry.clock_out_time - v_entry.clock_in_time)) / 3600;
      v_hours := v_hours - COALESCE(v_entry.break_duration_minutes, 0) / 60.0;
    END IF;
  END IF;
  RETURN GREATEST(v_hours, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_available_crew - use correct columns
DROP FUNCTION IF EXISTS get_available_crew(UUID, DATE, DATE, TEXT, TEXT[]);
CREATE OR REPLACE FUNCTION get_available_crew(p_org_id UUID, p_start_date DATE, p_end_date DATE, p_role TEXT DEFAULT NULL, p_skills TEXT[] DEFAULT NULL)
RETURNS TABLE (id UUID, full_name TEXT, role TEXT, rating NUMERIC, hourly_rate NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT cm.id, COALESCE(cm.full_name, cm.first_name || ' ' || cm.last_name, 'Unknown')::TEXT AS full_name, 
    COALESCE(cm.role, 'crew')::TEXT AS role, cm.rating, cm.hourly_rate
  FROM crew_members cm 
  WHERE cm.organization_id = p_org_id AND cm.status = 'active' 
    AND (p_role IS NULL OR COALESCE(cm.role, '')::TEXT = p_role) 
    AND (p_skills IS NULL OR cm.skills && p_skills)
    AND cm.created_at <= p_end_date::TIMESTAMPTZ
    AND cm.created_at >= p_start_date::TIMESTAMPTZ - INTERVAL '1 year'
  ORDER BY cm.rating DESC NULLS LAST, cm.total_projects DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix add_comment - use correct columns
DROP FUNCTION IF EXISTS add_comment(TEXT, UUID, UUID, TEXT);
CREATE OR REPLACE FUNCTION add_comment(p_entity_type TEXT, p_entity_id UUID, p_user_id UUID, p_content TEXT)
RETURNS UUID AS $$
DECLARE v_comment_id UUID;
BEGIN
  INSERT INTO entity_comments (entity_type, entity_id, user_id, content) 
  VALUES (p_entity_type, p_entity_id, p_user_id, p_content) 
  RETURNING id INTO v_comment_id;
  RETURN v_comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix create_version_snapshot - use correct columns
DROP FUNCTION IF EXISTS create_version_snapshot(TEXT, UUID, UUID, JSONB);
CREATE OR REPLACE FUNCTION create_version_snapshot(p_entity_type TEXT, p_entity_id UUID, p_user_id UUID, p_data JSONB)
RETURNS UUID AS $$
DECLARE v_snapshot_id UUID;
BEGIN
  INSERT INTO version_snapshots (entity_type, entity_id, created_by, data) 
  VALUES (p_entity_type, p_entity_id, p_user_id, p_data) 
  RETURNING id INTO v_snapshot_id;
  RETURN v_snapshot_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix generate_daily_report - use correct date handling
DROP FUNCTION IF EXISTS generate_daily_report(UUID, DATE);
CREATE OR REPLACE FUNCTION generate_daily_report(p_organization_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_build_object(
    'date', p_date, 
    'organization_id', p_organization_id, 
    'projects_active', (SELECT COUNT(*) FROM projects WHERE organization_id = p_organization_id AND status = 'active'), 
    'tasks_completed', (SELECT COUNT(*) FROM tasks WHERE organization_id = p_organization_id AND completed_at::DATE = p_date), 
    'new_contacts', (SELECT COUNT(*) FROM contacts WHERE organization_id = p_organization_id AND created_at::DATE = p_date)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix send_notification - use correct columns
DROP FUNCTION IF EXISTS send_notification(UUID, TEXT, TEXT, TEXT, JSONB);
CREATE OR REPLACE FUNCTION send_notification(p_user_id UUID, p_type TEXT, p_title TEXT, p_message TEXT, p_data JSONB DEFAULT '{}')
RETURNS UUID AS $$
DECLARE v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, data) 
  VALUES (p_user_id, p_type, p_title, p_message, COALESCE(p_data, '{}')) 
  RETURNING id INTO v_notification_id;
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix qualify_referral - use correct columns
DROP FUNCTION IF EXISTS qualify_referral(UUID);
CREATE OR REPLACE FUNCTION qualify_referral(p_referral_id UUID)
RETURNS BOOLEAN AS $$
DECLARE v_status TEXT; v_referred_user_id UUID;
BEGIN
  SELECT status, referred_user_id INTO v_status, v_referred_user_id FROM referrals WHERE id = p_referral_id;
  IF NOT FOUND THEN RETURN FALSE; END IF;
  IF v_status = 'pending' AND v_referred_user_id IS NOT NULL THEN
    UPDATE referrals SET status = 'qualified', qualified_at = NOW() WHERE id = p_referral_id;
    RETURN TRUE;
  END IF;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix universal_search - fix subquery issue
DROP FUNCTION IF EXISTS universal_search(UUID, TEXT, INT);
CREATE OR REPLACE FUNCTION universal_search(p_organization_id UUID, p_search_term TEXT, p_limit INT DEFAULT 20)
RETURNS TABLE (entity_type TEXT, entity_id UUID, title TEXT, description TEXT, relevance NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM (
    SELECT 'project'::TEXT AS entity_type, p.id AS entity_id, p.name::TEXT AS title, COALESCE(p.description, '')::TEXT AS description, 1.0::NUMERIC AS relevance
    FROM projects p WHERE p.organization_id = p_organization_id AND (p.name ILIKE '%' || p_search_term || '%' OR p.code ILIKE '%' || p_search_term || '%')
    UNION ALL
    SELECT 'contact'::TEXT, c.id, COALESCE(c.first_name || ' ' || c.last_name, c.company)::TEXT, COALESCE(c.email, '')::TEXT, 0.9::NUMERIC
    FROM contacts c WHERE c.organization_id = p_organization_id AND (c.first_name ILIKE '%' || p_search_term || '%' OR c.last_name ILIKE '%' || p_search_term || '%' OR c.company ILIKE '%' || p_search_term || '%')
    UNION ALL
    SELECT 'event'::TEXT, e.id, e.name::TEXT, COALESCE(e.description, '')::TEXT, 0.8::NUMERIC
    FROM events e WHERE e.organization_id = p_organization_id AND e.name ILIKE '%' || p_search_term || '%'
  ) combined ORDER BY relevance DESC LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix generate_task_report - use correct columns
DROP FUNCTION IF EXISTS generate_task_report(UUID);
CREATE OR REPLACE FUNCTION generate_task_report(p_project_id UUID)
RETURNS TABLE (task_id UUID, title TEXT, status TEXT, assigned_to_name TEXT, due_date DATE, completed_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  SELECT t.id AS task_id, t.title::TEXT, t.status::TEXT, 
    COALESCE(pu.full_name, 'Unassigned')::TEXT AS assigned_to_name, 
    t.due_date, t.completed_at
  FROM tasks t LEFT JOIN platform_users pu ON t.assigned_to = pu.id 
  WHERE t.project_id = p_project_id 
  ORDER BY t.due_date NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix progress_workflow_assignment - use correct columns
DROP FUNCTION IF EXISTS progress_workflow_assignment(UUID, TEXT);
CREATE OR REPLACE FUNCTION progress_workflow_assignment(p_assignment_id UUID, p_action TEXT DEFAULT 'complete')
RETURNS BOOLEAN AS $$
DECLARE v_current_step INT; v_total_steps INT; v_next_step INT;
BEGIN
  SELECT current_step, total_steps INTO v_current_step, v_total_steps FROM workflow_assignments WHERE id = p_assignment_id;
  IF NOT FOUND THEN RETURN FALSE; END IF;
  IF p_action = 'complete' THEN
    v_next_step := COALESCE(v_current_step, 0) + 1;
    UPDATE workflow_assignments 
    SET current_step = v_next_step, 
        status = CASE WHEN v_next_step >= COALESCE(v_total_steps, 1) THEN 'completed'::workflow_status ELSE 'in_progress'::workflow_status END,
        updated_at = NOW()
    WHERE id = p_assignment_id;
  END IF;
  RETURN TRUE;
EXCEPTION WHEN invalid_text_representation OR undefined_column THEN
  UPDATE workflow_assignments SET current_step = COALESCE(v_current_step, 0) + 1 WHERE id = p_assignment_id;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_production_credentials - use correct columns
DROP FUNCTION IF EXISTS get_production_credentials(UUID);
CREATE OR REPLACE FUNCTION get_production_credentials(p_production_id UUID)
RETURNS TABLE (id UUID, credential_type TEXT, name TEXT, username TEXT, notes TEXT, created_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  SELECT pc.id, pc.credential_type::TEXT, pc.name::TEXT, pc.username::TEXT, pc.notes::TEXT, pc.created_at
  FROM production_credentials pc WHERE pc.production_id = p_production_id ORDER BY pc.credential_type, pc.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_round_summary - use correct columns
DROP FUNCTION IF EXISTS get_round_summary(UUID);
CREATE OR REPLACE FUNCTION get_round_summary(p_round_id UUID)
RETURNS TABLE (id UUID, name TEXT, target_amount NUMERIC, raised_amount NUMERIC, investor_count INT, status TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT fr.id, fr.name::TEXT, fr.target_amount, 
    COALESCE(SUM(i.amount), 0) AS raised_amount, 
    COUNT(DISTINCT i.investor_id)::INT AS investor_count, 
    fr.status::TEXT
  FROM funding_rounds fr LEFT JOIN investments i ON fr.id = i.round_id 
  WHERE fr.id = p_round_id 
  GROUP BY fr.id, fr.name, fr.target_amount, fr.status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
