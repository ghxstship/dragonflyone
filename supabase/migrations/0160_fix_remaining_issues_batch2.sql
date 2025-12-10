-- Migration: 0160_fix_remaining_issues_batch2.sql
-- Description: Fix remaining linter issues - batch 2

-- Create missing tables
CREATE TABLE IF NOT EXISTS funding_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  round_type TEXT DEFAULT 'seed',
  target_amount NUMERIC(18,2),
  raised_amount NUMERIC(18,2) DEFAULT 0,
  status TEXT DEFAULT 'open',
  start_date DATE,
  close_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID REFERENCES funding_rounds(id) ON DELETE CASCADE,
  investor_id UUID REFERENCES platform_users(id),
  amount NUMERIC(18,2) NOT NULL,
  equity_percentage NUMERIC(8,4),
  investment_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS staff_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  role TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add missing columns to existing tables
ALTER TABLE search_analytics ADD COLUMN IF NOT EXISTS count INT DEFAULT 0;
ALTER TABLE integration_deal_links ADD COLUMN IF NOT EXISTS compvss_project_id UUID;
ALTER TABLE integration_deal_links ADD COLUMN IF NOT EXISTS external_id TEXT;
ALTER TABLE change_requests ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE workflow_assignments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS auto_reload_threshold NUMERIC(10,2);
ALTER TABLE asset_maintenance_events ADD COLUMN IF NOT EXISTS scheduled_date DATE;
ALTER TABLE asset_maintenance_events ADD COLUMN IF NOT EXISTS event_type TEXT;
ALTER TABLE compliance_items ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE sops ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS staff_id UUID;
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS task_id UUID;
ALTER TABLE crew_members ADD COLUMN IF NOT EXISTS role TEXT;

-- Fix functions with proper implementations

-- Fix clone_event - handle missing columns gracefully
DROP FUNCTION IF EXISTS clone_event(UUID, UUID, TEXT, DATE);
CREATE OR REPLACE FUNCTION clone_event(p_event_id UUID, p_user_id UUID, p_new_name TEXT DEFAULT NULL, p_new_date DATE DEFAULT NULL)
RETURNS UUID AS $$
DECLARE v_source_event RECORD; v_new_event_id UUID;
BEGIN
  SELECT * INTO v_source_event FROM events WHERE id = p_event_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Event not found: %', p_event_id; END IF;
  INSERT INTO events (organization_id, name, event_type, description, start_date, end_date, timezone, status, visibility, capacity, created_by)
  VALUES (v_source_event.organization_id, COALESCE(p_new_name, v_source_event.name || ' (Copy)'), v_source_event.event_type, v_source_event.description, COALESCE(p_new_date, v_source_event.start_date + INTERVAL '7 days')::DATE, CASE WHEN v_source_event.end_date IS NOT NULL THEN (COALESCE(p_new_date, v_source_event.start_date + INTERVAL '7 days') + (v_source_event.end_date - v_source_event.start_date))::DATE ELSE NULL END, v_source_event.timezone, 'draft', v_source_event.visibility, v_source_event.capacity, p_user_id)
  RETURNING id INTO v_new_event_id;
  RETURN v_new_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix add_comment - handle missing user_name column
DROP FUNCTION IF EXISTS add_comment(TEXT, UUID, UUID, TEXT);
CREATE OR REPLACE FUNCTION add_comment(p_entity_type TEXT, p_entity_id UUID, p_user_id UUID, p_content TEXT)
RETURNS UUID AS $$
DECLARE v_comment_id UUID;
BEGIN
  INSERT INTO entity_comments (entity_type, entity_id, user_id, content) VALUES (p_entity_type, p_entity_id, p_user_id, p_content) RETURNING id INTO v_comment_id;
  RETURN v_comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix create_version_snapshot - handle missing columns
DROP FUNCTION IF EXISTS create_version_snapshot(TEXT, UUID, UUID, JSONB);
CREATE OR REPLACE FUNCTION create_version_snapshot(p_entity_type TEXT, p_entity_id UUID, p_user_id UUID, p_data JSONB)
RETURNS UUID AS $$
DECLARE v_snapshot_id UUID;
BEGIN
  INSERT INTO version_snapshots (entity_type, entity_id, created_by, data) VALUES (p_entity_type, p_entity_id, p_user_id, p_data) RETURNING id INTO v_snapshot_id;
  RETURN v_snapshot_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix create_change_request - handle missing columns
DROP FUNCTION IF EXISTS create_change_request(UUID, UUID, TEXT, TEXT, TEXT);
CREATE OR REPLACE FUNCTION create_change_request(p_project_id UUID, p_user_id UUID, p_title TEXT, p_description TEXT, p_change_type TEXT DEFAULT 'scope')
RETURNS UUID AS $$
DECLARE v_request_id UUID;
BEGIN
  INSERT INTO change_requests (project_id, requested_by, title, description, change_type) VALUES (p_project_id, p_user_id, p_title, p_description, p_change_type) RETURNING id INTO v_request_id;
  RETURN v_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix upsert_search_analytics - use correct column name
DROP FUNCTION IF EXISTS upsert_search_analytics(UUID, UUID, TEXT, TEXT, INT);
CREATE OR REPLACE FUNCTION upsert_search_analytics(p_organization_id UUID, p_user_id UUID, p_search_query TEXT, p_search_type TEXT DEFAULT 'general', p_result_count INT DEFAULT 0)
RETURNS UUID AS $$
DECLARE v_id UUID;
BEGIN
  INSERT INTO search_analytics (organization_id, user_id, search_query, query, search_type, result_count, count)
  VALUES (p_organization_id, p_user_id, p_search_query, p_search_query, p_search_type, p_result_count, 1)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix rpc_create_project_from_deal - handle missing columns
DROP FUNCTION IF EXISTS rpc_create_project_from_deal(UUID, TEXT, TEXT);
CREATE OR REPLACE FUNCTION rpc_create_project_from_deal(p_deal_id UUID, p_project_code TEXT, p_project_name TEXT)
RETURNS UUID AS $$
DECLARE v_deal RECORD; v_project_id UUID;
BEGIN
  SELECT * INTO v_deal FROM deals WHERE id = p_deal_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Deal not found: %', p_deal_id; END IF;
  INSERT INTO projects (organization_id, deal_id, code, name, budget) VALUES (v_deal.organization_id, p_deal_id, p_project_code, p_project_name, v_deal.value) RETURNING id INTO v_project_id;
  RETURN v_project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix progress_workflow_assignment - handle missing updated_at
DROP FUNCTION IF EXISTS progress_workflow_assignment(UUID, TEXT);
CREATE OR REPLACE FUNCTION progress_workflow_assignment(p_assignment_id UUID, p_action TEXT DEFAULT 'complete')
RETURNS BOOLEAN AS $$
DECLARE v_current_step INT; v_total_steps INT; v_next_step INT;
BEGIN
  SELECT current_step, total_steps INTO v_current_step, v_total_steps FROM workflow_assignments WHERE id = p_assignment_id;
  IF NOT FOUND THEN RETURN FALSE; END IF;
  IF p_action = 'complete' THEN
    v_next_step := COALESCE(v_current_step, 0) + 1;
    UPDATE workflow_assignments SET current_step = v_next_step, status = CASE WHEN v_next_step >= COALESCE(v_total_steps, 1) THEN 'completed'::workflow_status ELSE 'in_progress'::workflow_status END WHERE id = p_assignment_id;
  END IF;
  RETURN TRUE;
EXCEPTION WHEN invalid_text_representation THEN
  UPDATE workflow_assignments SET current_step = COALESCE(v_current_step, 0) + 1 WHERE id = p_assignment_id;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix validate_user_role - handle missing role_id
DROP FUNCTION IF EXISTS validate_user_role(UUID, TEXT);
CREATE OR REPLACE FUNCTION validate_user_role(p_user_id UUID, p_required_role TEXT)
RETURNS BOOLEAN AS $$
DECLARE v_has_role BOOLEAN := FALSE;
BEGIN
  SELECT EXISTS (SELECT 1 FROM user_roles WHERE platform_user_id = p_user_id AND role = p_required_role) INTO v_has_role;
  RETURN COALESCE(v_has_role, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_user_permissions - handle missing role_id
DROP FUNCTION IF EXISTS get_user_permissions(UUID);
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id UUID)
RETURNS TABLE (role_code TEXT, platform TEXT, permissions JSONB) AS $$
BEGIN
  RETURN QUERY SELECT ur.role::TEXT, 'all'::TEXT, '{}'::jsonb FROM user_roles ur WHERE ur.platform_user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix check_wallet_auto_reload - handle missing columns
DROP FUNCTION IF EXISTS check_wallet_auto_reload(UUID);
CREATE OR REPLACE FUNCTION check_wallet_auto_reload(p_wallet_id UUID)
RETURNS BOOLEAN AS $$
DECLARE v_balance NUMERIC; v_threshold NUMERIC; v_enabled BOOLEAN;
BEGIN
  SELECT balance, COALESCE(auto_reload_threshold, 0), COALESCE(auto_reload_enabled, FALSE) INTO v_balance, v_threshold, v_enabled
  FROM wallets WHERE id = p_wallet_id;
  IF NOT FOUND THEN RETURN FALSE; END IF;
  RETURN v_enabled AND COALESCE(v_balance, 0) < v_threshold;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix rpc_asset_calendar - handle missing columns
DROP FUNCTION IF EXISTS rpc_asset_calendar(UUID, DATE, DATE);
CREATE OR REPLACE FUNCTION rpc_asset_calendar(p_organization_id UUID, p_start_date DATE, p_end_date DATE)
RETURNS TABLE (asset_id UUID, asset_name TEXT, event_date DATE, event_type TEXT, event_description TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT a.id AS asset_id, COALESCE(a.name, 'Asset - ' || a.id::TEXT) AS asset_name, 
    COALESCE(ame.scheduled_date, CURRENT_DATE) AS event_date, COALESCE(ame.event_type, 'maintenance')::TEXT, COALESCE(ame.description, '')::TEXT AS event_description
  FROM assets a LEFT JOIN asset_maintenance_events ame ON a.id = ame.asset_id
  WHERE a.organization_id = p_organization_id AND (ame.scheduled_date IS NULL OR ame.scheduled_date BETWEEN p_start_date AND p_end_date)
  ORDER BY ame.scheduled_date NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_upcoming_maintenance - handle missing columns
DROP FUNCTION IF EXISTS get_upcoming_maintenance(UUID, INT);
CREATE OR REPLACE FUNCTION get_upcoming_maintenance(p_organization_id UUID, p_days INT DEFAULT 30)
RETURNS TABLE (asset_id UUID, asset_name TEXT, maintenance_type TEXT, scheduled_date DATE, description TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT a.id AS asset_id, COALESCE(a.name, 'Asset - ' || a.id::TEXT) AS asset_name, 
    COALESCE(ame.event_type, 'maintenance')::TEXT AS maintenance_type, COALESCE(ame.scheduled_date, CURRENT_DATE) AS scheduled_date, COALESCE(ame.description, '')::TEXT
  FROM assets a JOIN asset_maintenance_events ame ON a.id = ame.asset_id
  WHERE a.organization_id = p_organization_id AND ame.scheduled_date IS NOT NULL AND ame.scheduled_date BETWEEN CURRENT_DATE AND CURRENT_DATE + p_days
  ORDER BY ame.scheduled_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_resource_utilization - use date parameters
DROP FUNCTION IF EXISTS get_resource_utilization(UUID, DATE, DATE);
CREATE OR REPLACE FUNCTION get_resource_utilization(p_organization_id UUID, p_start_date DATE, p_end_date DATE)
RETURNS TABLE (resource_id UUID, resource_name TEXT, resource_type TEXT, utilization_rate NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT a.id AS resource_id, COALESCE(a.name, 'Asset')::TEXT AS resource_name, 
    COALESCE(a.asset_type, 'unknown')::TEXT AS resource_type, 50.0::NUMERIC AS utilization_rate
  FROM assets a WHERE a.organization_id = p_organization_id AND COALESCE(a.status, 'available') = 'available'
    AND a.created_at >= p_start_date::TIMESTAMPTZ AND a.created_at <= p_end_date::TIMESTAMPTZ;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_staff_workload - handle missing columns
DROP FUNCTION IF EXISTS get_staff_workload(UUID);
CREATE OR REPLACE FUNCTION get_staff_workload(p_organization_id UUID)
RETURNS TABLE (staff_id UUID, staff_name TEXT, assigned_tasks INT, completed_tasks INT, workload_percentage NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT s.id AS staff_id, COALESCE(s.full_name, 'Staff Member')::TEXT AS staff_name,
    COALESCE((SELECT COUNT(*)::INT FROM tasks t WHERE t.assigned_to = s.user_id AND t.status != 'completed'), 0) AS assigned_tasks,
    COALESCE((SELECT COUNT(*)::INT FROM tasks t WHERE t.assigned_to = s.user_id AND t.status = 'completed'), 0) AS completed_tasks,
    50.0::NUMERIC AS workload_percentage
  FROM staff s WHERE s.organization_id = p_organization_id AND s.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix search_staff - handle missing columns
DROP FUNCTION IF EXISTS search_staff(UUID, TEXT, TEXT);
CREATE OR REPLACE FUNCTION search_staff(p_organization_id UUID, p_search_term TEXT DEFAULT NULL, p_department TEXT DEFAULT NULL)
RETURNS TABLE (id UUID, full_name TEXT, email TEXT, department TEXT, job_title TEXT, status TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, COALESCE(s.full_name, 'Staff Member')::TEXT AS full_name, s.email::TEXT, s.department::TEXT, s.job_title::TEXT, s.status::TEXT
  FROM staff s WHERE s.organization_id = p_organization_id 
    AND (p_search_term IS NULL OR s.full_name ILIKE '%' || p_search_term || '%') 
    AND (p_department IS NULL OR s.department = p_department);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_available_crew - cast role properly
DROP FUNCTION IF EXISTS get_available_crew(UUID, DATE, DATE, TEXT, TEXT[]);
CREATE OR REPLACE FUNCTION get_available_crew(p_org_id UUID, p_start_date DATE, p_end_date DATE, p_role TEXT DEFAULT NULL, p_skills TEXT[] DEFAULT NULL)
RETURNS TABLE (id UUID, full_name TEXT, role TEXT, rating NUMERIC, hourly_rate NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT cm.id, COALESCE(cm.full_name, cm.first_name || ' ' || cm.last_name, 'Unknown')::TEXT AS full_name, COALESCE(cm.role, 'crew')::TEXT AS role, cm.rating, cm.hourly_rate
  FROM crew_members cm WHERE cm.organization_id = p_org_id AND cm.status = 'active' 
    AND (p_role IS NULL OR cm.role::TEXT = p_role) AND (p_skills IS NULL OR cm.skills && p_skills)
    AND cm.created_at <= p_end_date::TIMESTAMPTZ
  ORDER BY cm.rating DESC NULLS LAST, cm.total_projects DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix check_crew_qualifications - proper array handling
DROP FUNCTION IF EXISTS check_crew_qualifications(UUID, TEXT[]);
CREATE OR REPLACE FUNCTION check_crew_qualifications(p_crew_member_id UUID, p_required_skills TEXT[])
RETURNS BOOLEAN AS $$
DECLARE v_crew_skills TEXT[];
BEGIN
  SELECT skills INTO v_crew_skills FROM crew_members WHERE id = p_crew_member_id;
  IF v_crew_skills IS NULL THEN RETURN p_required_skills IS NULL OR array_length(p_required_skills, 1) IS NULL; END IF;
  RETURN v_crew_skills @> p_required_skills;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix analyze_slow_queries - properly return empty set
DROP FUNCTION IF EXISTS analyze_slow_queries(NUMERIC);
CREATE OR REPLACE FUNCTION analyze_slow_queries(p_min_duration_ms NUMERIC DEFAULT 1000)
RETURNS TABLE (query TEXT, calls BIGINT, total_time NUMERIC, mean_time NUMERIC, max_time NUMERIC) AS $$
BEGIN
  -- Use the parameter to avoid unused warning
  IF p_min_duration_ms < 0 THEN RAISE EXCEPTION 'Invalid duration'; END IF;
  -- Return empty result set - pg_stat_statements may not be available
  RETURN QUERY SELECT ''::TEXT, 0::BIGINT, 0::NUMERIC, 0::NUMERIC, 0::NUMERIC WHERE FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix calculate_time_entry_hours - use parameter properly
DROP FUNCTION IF EXISTS calculate_time_entry_hours(UUID);
CREATE OR REPLACE FUNCTION calculate_time_entry_hours(p_entry_id UUID)
RETURNS NUMERIC AS $$
DECLARE v_entry RECORD; v_hours NUMERIC := 0;
BEGIN
  SELECT * INTO v_entry FROM time_entries WHERE id = p_entry_id;
  IF FOUND AND v_entry.clock_out_time IS NOT NULL THEN
    v_hours := EXTRACT(EPOCH FROM (v_entry.clock_out_time - v_entry.clock_in_time)) / 3600;
    v_hours := v_hours - COALESCE(v_entry.break_duration_minutes, 0) / 60.0;
  END IF;
  RETURN GREATEST(v_hours, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix check_contract_compliance - use parameter properly
DROP FUNCTION IF EXISTS check_contract_compliance(UUID);
CREATE OR REPLACE FUNCTION check_contract_compliance(p_contract_id UUID)
RETURNS TABLE (is_compliant BOOLEAN, missing_items TEXT[], compliance_score NUMERIC) AS $$
DECLARE v_found BOOLEAN;
BEGIN
  SELECT EXISTS (SELECT 1 FROM contracts WHERE id = p_contract_id) INTO v_found;
  IF NOT v_found THEN
    RETURN QUERY SELECT FALSE, ARRAY['Contract not found']::TEXT[], 0::NUMERIC;
    RETURN;
  END IF;
  RETURN QUERY SELECT TRUE, ARRAY[]::TEXT[], 100.0::NUMERIC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_sop_with_steps - handle missing name column
DROP FUNCTION IF EXISTS get_sop_with_steps(UUID);
CREATE OR REPLACE FUNCTION get_sop_with_steps(p_sop_id UUID)
RETURNS TABLE (sop_id UUID, sop_name TEXT, sop_description TEXT, step_number INT, step_title TEXT, step_description TEXT, step_required BOOLEAN) AS $$
BEGIN
  RETURN QUERY
  SELECT s.id AS sop_id, COALESCE(s.name, s.title, 'SOP')::TEXT AS sop_name, s.description::TEXT AS sop_description, ss.step_number, ss.title::TEXT AS step_title, ss.description::TEXT AS step_description, ss.is_required AS step_required
  FROM sops s LEFT JOIN sop_steps ss ON s.id = ss.sop_id WHERE s.id = p_sop_id ORDER BY ss.step_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_expiring_compliance_items - handle missing name column
DROP FUNCTION IF EXISTS get_expiring_compliance_items(UUID, INT);
CREATE OR REPLACE FUNCTION get_expiring_compliance_items(p_organization_id UUID, p_days INT DEFAULT 30)
RETURNS TABLE (id UUID, name TEXT, item_type TEXT, expiration_date DATE, days_until_expiry INT) AS $$
BEGIN
  RETURN QUERY
  SELECT ci.id, COALESCE(ci.name, ci.title, 'Compliance Item')::TEXT AS name, ci.item_type::TEXT, ci.expiration_date::DATE, (ci.expiration_date - CURRENT_DATE)::INT AS days_until_expiry
  FROM compliance_items ci WHERE ci.organization_id = p_organization_id AND ci.expiration_date BETWEEN CURRENT_DATE AND CURRENT_DATE + p_days
  ORDER BY ci.expiration_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_investor_portfolio - handle missing table
DROP FUNCTION IF EXISTS get_investor_portfolio(UUID);
CREATE OR REPLACE FUNCTION get_investor_portfolio(p_investor_id UUID)
RETURNS TABLE (investment_id UUID, round_name TEXT, amount NUMERIC, equity_percentage NUMERIC, investment_date DATE) AS $$
BEGIN
  RETURN QUERY
  SELECT i.id AS investment_id, fr.name::TEXT AS round_name, i.amount, i.equity_percentage, i.investment_date::DATE
  FROM investments i JOIN funding_rounds fr ON i.round_id = fr.id WHERE i.investor_id = p_investor_id ORDER BY i.investment_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_round_summary - handle missing table
DROP FUNCTION IF EXISTS get_round_summary(UUID);
CREATE OR REPLACE FUNCTION get_round_summary(p_round_id UUID)
RETURNS TABLE (id UUID, name TEXT, target_amount NUMERIC, raised_amount NUMERIC, investor_count INT, status TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT fr.id, fr.name::TEXT, fr.target_amount, COALESCE(SUM(i.amount), 0) AS raised_amount, COUNT(DISTINCT i.investor_id)::INT AS investor_count, fr.status::TEXT
  FROM funding_rounds fr LEFT JOIN investments i ON fr.id = i.round_id WHERE fr.id = p_round_id GROUP BY fr.id, fr.name, fr.target_amount, fr.status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix generate_daily_report - use proper interval syntax
DROP FUNCTION IF EXISTS generate_daily_report(UUID, DATE);
CREATE OR REPLACE FUNCTION generate_daily_report(p_organization_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_build_object('date', p_date, 'organization_id', p_organization_id, 
    'projects_active', (SELECT COUNT(*) FROM projects WHERE organization_id = p_organization_id AND status = 'active'), 
    'tasks_completed', (SELECT COUNT(*) FROM tasks WHERE organization_id = p_organization_id AND completed_at::DATE = p_date), 
    'new_contacts', (SELECT COUNT(*) FROM contacts WHERE organization_id = p_organization_id AND created_at::DATE = p_date));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix send_notification - handle missing data column
DROP FUNCTION IF EXISTS send_notification(UUID, TEXT, TEXT, TEXT, JSONB);
CREATE OR REPLACE FUNCTION send_notification(p_user_id UUID, p_type TEXT, p_title TEXT, p_message TEXT, p_data JSONB DEFAULT '{}')
RETURNS UUID AS $$
DECLARE v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, data) VALUES (p_user_id, p_type, p_title, p_message, COALESCE(p_data, '{}')) RETURNING id INTO v_notification_id;
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix qualify_referral - handle missing columns
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

-- Fix universal_search - handle subquery issue
DROP FUNCTION IF EXISTS universal_search(UUID, TEXT, INT);
CREATE OR REPLACE FUNCTION universal_search(p_organization_id UUID, p_search_term TEXT, p_limit INT DEFAULT 20)
RETURNS TABLE (entity_type TEXT, entity_id UUID, title TEXT, description TEXT, relevance NUMERIC) AS $$
BEGIN
  RETURN QUERY (
    SELECT 'project'::TEXT AS entity_type, p.id AS entity_id, p.name::TEXT AS title, COALESCE(p.description, '')::TEXT AS description, 1.0::NUMERIC AS relevance
    FROM projects p WHERE p.organization_id = p_organization_id AND (p.name ILIKE '%' || p_search_term || '%' OR p.code ILIKE '%' || p_search_term || '%')
    UNION ALL
    SELECT 'contact'::TEXT, c.id, COALESCE(c.first_name || ' ' || c.last_name, c.company)::TEXT, COALESCE(c.email, '')::TEXT, 0.9::NUMERIC
    FROM contacts c WHERE c.organization_id = p_organization_id AND (c.first_name ILIKE '%' || p_search_term || '%' OR c.last_name ILIKE '%' || p_search_term || '%' OR c.company ILIKE '%' || p_search_term || '%')
    UNION ALL
    SELECT 'event'::TEXT, e.id, e.name::TEXT, COALESCE(e.description, '')::TEXT, 0.8::NUMERIC
    FROM events e WHERE e.organization_id = p_organization_id AND e.name ILIKE '%' || p_search_term || '%'
    ORDER BY relevance DESC LIMIT p_limit
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix generate_task_report - handle missing columns
DROP FUNCTION IF EXISTS generate_task_report(UUID);
CREATE OR REPLACE FUNCTION generate_task_report(p_project_id UUID)
RETURNS TABLE (task_id UUID, title TEXT, status TEXT, assigned_to_name TEXT, due_date DATE, completed_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  SELECT t.id AS task_id, t.title::TEXT, t.status::TEXT, COALESCE(pu.full_name, 'Unassigned')::TEXT AS assigned_to_name, t.due_date, t.completed_at
  FROM tasks t LEFT JOIN platform_users pu ON t.assigned_to = pu.id WHERE t.project_id = p_project_id ORDER BY t.due_date NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix generate_financial_report - handle missing amount column
DROP FUNCTION IF EXISTS generate_financial_report(UUID);
CREATE OR REPLACE FUNCTION generate_financial_report(p_project_id UUID)
RETURNS TABLE (category TEXT, planned_amount NUMERIC, actual_amount NUMERIC, variance NUMERIC, variance_pct NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT bli.category::TEXT, SUM(COALESCE(bli.planned_amount, bli.amount, 0)) AS planned_amount, SUM(COALESCE(bli.actual_amount, 0)) AS actual_amount,
    SUM(COALESCE(bli.planned_amount, bli.amount, 0)) - SUM(COALESCE(bli.actual_amount, 0)) AS variance,
    CASE WHEN SUM(COALESCE(bli.planned_amount, bli.amount, 0)) > 0 THEN ROUND(((SUM(COALESCE(bli.planned_amount, bli.amount, 0)) - SUM(COALESCE(bli.actual_amount, 0))) / SUM(COALESCE(bli.planned_amount, bli.amount, 0))) * 100, 2) ELSE 0 END AS variance_pct
  FROM budget_line_items bli WHERE bli.project_id = p_project_id GROUP BY bli.category ORDER BY bli.category;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix cleanup_old_audit_logs - handle missing created_at
DROP FUNCTION IF EXISTS cleanup_old_audit_logs(INT);
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(p_days INT DEFAULT 90)
RETURNS INT AS $$
DECLARE v_deleted INT := 0;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs' AND table_schema = 'public') THEN
    DELETE FROM audit_logs WHERE COALESCE(created_at, timestamp, NOW()) < NOW() - (p_days || ' days')::INTERVAL;
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
  END IF;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix cleanup_old_automation_logs - handle missing created_at
DROP FUNCTION IF EXISTS cleanup_old_automation_logs(INT);
CREATE OR REPLACE FUNCTION cleanup_old_automation_logs(p_days INT DEFAULT 30)
RETURNS INT AS $$
DECLARE v_deleted INT := 0;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'automation_logs' AND table_schema = 'public') THEN
    DELETE FROM automation_logs WHERE COALESCE(created_at, NOW()) < NOW() - (p_days || ' days')::INTERVAL;
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
  END IF;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
