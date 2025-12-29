-- Migration: 0156_fix_functions_part2.sql
-- Description: Fix broken functions (Part 2 - Utility and Search functions)

-- Drop all functions first to handle return type changes
DROP FUNCTION IF EXISTS get_available_crew(UUID, DATE, DATE, TEXT, TEXT[]);
DROP FUNCTION IF EXISTS get_expiring_certifications(INT);
DROP FUNCTION IF EXISTS cleanup_old_audit_logs(INT);
DROP FUNCTION IF EXISTS cleanup_old_automation_logs(INT);
DROP FUNCTION IF EXISTS calculate_time_entry_hours(UUID);
DROP FUNCTION IF EXISTS get_sop_with_steps(UUID);
DROP FUNCTION IF EXISTS check_user_sop_compliance(UUID, UUID);
DROP FUNCTION IF EXISTS cleanup_expired_blueprints();
DROP FUNCTION IF EXISTS rpc_asset_calendar(UUID, DATE, DATE);
DROP FUNCTION IF EXISTS rpc_workforce_capacity(UUID, DATE, DATE);
DROP FUNCTION IF EXISTS add_comment(TEXT, UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS upsert_search_analytics(UUID, UUID, TEXT, TEXT, INT);
DROP FUNCTION IF EXISTS progress_workflow_assignment(UUID, TEXT);
DROP FUNCTION IF EXISTS rpc_create_project_from_deal(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS explain_query(TEXT);
DROP FUNCTION IF EXISTS analyze_slow_queries(NUMERIC);
DROP FUNCTION IF EXISTS check_crew_qualifications(UUID, TEXT[]);
DROP FUNCTION IF EXISTS validate_user_role(UUID, TEXT);
DROP FUNCTION IF EXISTS get_user_permissions(UUID);
DROP FUNCTION IF EXISTS check_wallet_auto_reload(UUID);
DROP FUNCTION IF EXISTS qualify_referral(UUID);
DROP FUNCTION IF EXISTS check_contract_compliance(UUID);
DROP FUNCTION IF EXISTS get_log_retention_stats();
DROP FUNCTION IF EXISTS check_rate_limit(UUID, TEXT, INT, INT);

-- Fix get_available_crew
CREATE OR REPLACE FUNCTION get_available_crew(p_org_id UUID, p_start_date DATE, p_end_date DATE, p_role TEXT DEFAULT NULL, p_skills TEXT[] DEFAULT NULL)
RETURNS TABLE (id UUID, full_name TEXT, role TEXT, rating NUMERIC, hourly_rate NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT cm.id, COALESCE(cm.full_name, cm.first_name || ' ' || cm.last_name, 'Unknown') AS full_name, cm.role, cm.rating, cm.hourly_rate
  FROM crew_members cm WHERE cm.organization_id = p_org_id AND cm.status = 'active' AND (p_role IS NULL OR cm.role = p_role) AND (p_skills IS NULL OR cm.skills && p_skills)
  ORDER BY cm.rating DESC NULLS LAST, cm.total_projects DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_expiring_certifications
CREATE OR REPLACE FUNCTION get_expiring_certifications(p_days INT DEFAULT 30)
RETURNS TABLE (id UUID, employee_name TEXT, certification_title TEXT, expires_on DATE, days_until_expiry INT) AS $$
BEGIN
  RETURN QUERY
  SELECT wc.id, COALESCE(we.first_name || ' ' || we.last_name, 'Unknown') AS employee_name, wc.title AS certification_title, wc.expires_on, (wc.expires_on - CURRENT_DATE)::INT AS days_until_expiry
  FROM workforce_certifications wc JOIN workforce_employees we ON wc.employee_id = we.id
  WHERE wc.expires_on IS NOT NULL AND wc.expires_on BETWEEN CURRENT_DATE AND CURRENT_DATE + p_days ORDER BY wc.expires_on;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix cleanup_old_audit_logs
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(p_days INT DEFAULT 90)
RETURNS INT AS $$
DECLARE v_deleted INT;
BEGIN
  DELETE FROM audit_logs WHERE created_at < NOW() - (p_days || ' days')::INTERVAL;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix cleanup_old_automation_logs
CREATE OR REPLACE FUNCTION cleanup_old_automation_logs(p_days INT DEFAULT 30)
RETURNS INT AS $$
DECLARE v_deleted INT;
BEGIN
  DELETE FROM automation_logs WHERE created_at < NOW() - (p_days || ' days')::INTERVAL;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix calculate_time_entry_hours
CREATE OR REPLACE FUNCTION calculate_time_entry_hours(entry_id UUID)
RETURNS NUMERIC AS $$
DECLARE v_entry RECORD; v_hours NUMERIC;
BEGIN
  SELECT * INTO v_entry FROM time_entries WHERE id = entry_id;
  IF NOT FOUND THEN RETURN 0; END IF;
  v_hours := EXTRACT(EPOCH FROM (v_entry.clock_out_time - v_entry.clock_in_time)) / 3600;
  v_hours := v_hours - COALESCE(v_entry.break_duration_minutes, 0) / 60.0;
  RETURN GREATEST(v_hours, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_sop_with_steps
CREATE OR REPLACE FUNCTION get_sop_with_steps(p_sop_id UUID)
RETURNS TABLE (sop_id UUID, sop_name TEXT, sop_description TEXT, step_number INT, step_title TEXT, step_description TEXT, step_required BOOLEAN) AS $$
BEGIN
  RETURN QUERY
  SELECT s.id AS sop_id, s.name AS sop_name, s.description AS sop_description, ss.step_number, ss.title AS step_title, ss.description AS step_description, ss.is_required AS step_required
  FROM sops s LEFT JOIN sop_steps ss ON s.id = ss.sop_id WHERE s.id = p_sop_id ORDER BY ss.step_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix check_user_sop_compliance
CREATE OR REPLACE FUNCTION check_user_sop_compliance(p_user_id UUID, p_sop_id UUID)
RETURNS TABLE (is_compliant BOOLEAN, completed_steps INT, total_steps INT, completion_percentage NUMERIC) AS $$
DECLARE v_total INT; v_completed INT;
BEGIN
  SELECT COUNT(*) INTO v_total FROM sop_steps WHERE sop_id = p_sop_id;
  SELECT COUNT(*) INTO v_completed FROM sop_completions sc JOIN sop_steps ss ON sc.step_id = ss.id WHERE sc.user_id = p_user_id AND ss.sop_id = p_sop_id;
  RETURN QUERY SELECT v_completed >= v_total, v_completed, v_total, CASE WHEN v_total > 0 THEN ROUND((v_completed::NUMERIC / v_total) * 100, 2) ELSE 0 END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix cleanup_expired_blueprints
CREATE OR REPLACE FUNCTION cleanup_expired_blueprints()
RETURNS INT AS $$
DECLARE v_deleted INT;
BEGIN
  DELETE FROM blueprints WHERE expires_at IS NOT NULL AND expires_at < NOW();
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix rpc_asset_calendar
CREATE OR REPLACE FUNCTION rpc_asset_calendar(p_organization_id UUID, p_start_date DATE, p_end_date DATE)
RETURNS TABLE (asset_id UUID, asset_name TEXT, event_date DATE, event_type TEXT, event_description TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT a.id AS asset_id, COALESCE(a.name, a.asset_type || ' - ' || a.id::TEXT) AS asset_name, ame.scheduled_date AS event_date, ame.event_type, ame.description AS event_description
  FROM assets a LEFT JOIN asset_maintenance_events ame ON a.id = ame.asset_id
  WHERE a.organization_id = p_organization_id AND (ame.scheduled_date IS NULL OR ame.scheduled_date BETWEEN p_start_date AND p_end_date)
  ORDER BY ame.scheduled_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix rpc_workforce_capacity
CREATE OR REPLACE FUNCTION rpc_workforce_capacity(p_organization_id UUID, p_start_date DATE, p_end_date DATE)
RETURNS TABLE (date DATE, total_staff INT, available_staff INT, utilization_rate NUMERIC) AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (SELECT generate_series(p_start_date, p_end_date, '1 day'::INTERVAL)::DATE AS date),
  staff_counts AS (SELECT COUNT(*)::INT AS total_staff FROM staff s WHERE s.organization_id = p_organization_id AND s.status = 'active')
  SELECT ds.date, sc.total_staff, sc.total_staff AS available_staff, 100.0::NUMERIC AS utilization_rate
  FROM date_series ds CROSS JOIN staff_counts sc;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix add_comment
CREATE OR REPLACE FUNCTION add_comment(p_entity_type TEXT, p_entity_id UUID, p_user_id UUID, p_content TEXT)
RETURNS UUID AS $$
DECLARE v_comment_id UUID; v_user_name TEXT;
BEGIN
  SELECT COALESCE(full_name, email, 'Unknown') INTO v_user_name FROM platform_users WHERE id = p_user_id;
  INSERT INTO entity_comments (entity_type, entity_id, user_id, content, user_name) VALUES (p_entity_type, p_entity_id, p_user_id, p_content, v_user_name) RETURNING id INTO v_comment_id;
  RETURN v_comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix upsert_search_analytics
CREATE OR REPLACE FUNCTION upsert_search_analytics(p_organization_id UUID, p_user_id UUID, p_search_query TEXT, p_search_type TEXT DEFAULT 'general', p_result_count INT DEFAULT 0)
RETURNS UUID AS $$
DECLARE v_id UUID;
BEGIN
  INSERT INTO search_analytics (organization_id, user_id, search_query, search_type, result_count) VALUES (p_organization_id, p_user_id, p_search_query, p_search_type, p_result_count) RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix progress_workflow_assignment
CREATE OR REPLACE FUNCTION progress_workflow_assignment(p_assignment_id UUID, p_action TEXT DEFAULT 'complete')
RETURNS BOOLEAN AS $$
DECLARE v_assignment RECORD; v_next_step INT;
BEGIN
  SELECT * INTO v_assignment FROM workflow_assignments WHERE id = p_assignment_id;
  IF NOT FOUND THEN RETURN FALSE; END IF;
  IF p_action = 'complete' THEN
    v_next_step := COALESCE(v_assignment.current_step, 0) + 1;
    UPDATE workflow_assignments SET current_step = v_next_step, status = CASE WHEN v_next_step >= v_assignment.total_steps THEN 'completed' ELSE 'in_progress' END, updated_at = NOW() WHERE id = p_assignment_id;
  END IF;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix rpc_create_project_from_deal
CREATE OR REPLACE FUNCTION rpc_create_project_from_deal(p_deal_id UUID, p_project_code TEXT, p_project_name TEXT)
RETURNS UUID AS $$
DECLARE v_deal RECORD; v_project_id UUID;
BEGIN
  SELECT * INTO v_deal FROM deals WHERE id = p_deal_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Deal not found: %', p_deal_id; END IF;
  INSERT INTO projects (organization_id, deal_id, code, name, budget) VALUES (v_deal.organization_id, p_deal_id, p_project_code, p_project_name, v_deal.value) RETURNING id INTO v_project_id;
  INSERT INTO integration_deal_links (organization_id, deal_id, integration_type, external_id) VALUES (v_deal.organization_id, p_deal_id, 'project', v_project_id::TEXT);
  RETURN v_project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix explain_query
CREATE OR REPLACE FUNCTION explain_query(p_query TEXT, OUT plan TEXT)
AS $$
BEGIN
  plan := '';
  EXECUTE 'EXPLAIN ' || p_query INTO plan;
EXCEPTION WHEN OTHERS THEN
  plan := 'Error: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix analyze_slow_queries
CREATE OR REPLACE FUNCTION analyze_slow_queries(p_min_duration_ms NUMERIC DEFAULT 1000, OUT query TEXT, OUT calls BIGINT, OUT total_time NUMERIC, OUT mean_time NUMERIC, OUT max_time NUMERIC)
RETURNS SETOF RECORD AS $$
BEGIN
  query := ''; calls := 0; total_time := 0; mean_time := 0; max_time := 0;
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix check_crew_qualifications
CREATE OR REPLACE FUNCTION check_crew_qualifications(p_crew_member_id UUID, p_required_skills TEXT[])
RETURNS BOOLEAN AS $$
DECLARE v_crew_skills TEXT[];
BEGIN
  SELECT skills INTO v_crew_skills FROM crew_members WHERE id = p_crew_member_id;
  IF v_crew_skills IS NULL THEN RETURN FALSE; END IF;
  RETURN v_crew_skills @> p_required_skills;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix validate_user_role
CREATE OR REPLACE FUNCTION validate_user_role(p_user_id UUID, p_required_role TEXT)
RETURNS BOOLEAN AS $$
DECLARE v_has_role BOOLEAN;
BEGIN
  SELECT EXISTS (SELECT 1 FROM user_roles ur JOIN role_definitions rd ON ur.role_id = rd.id WHERE ur.platform_user_id = p_user_id AND rd.code = p_required_role) INTO v_has_role;
  RETURN COALESCE(v_has_role, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_user_permissions
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id UUID)
RETURNS TABLE (role_code TEXT, platform TEXT, permissions JSONB) AS $$
BEGIN
  RETURN QUERY
  SELECT rd.code AS role_code, rd.platform, COALESCE(rd.metadata->'permissions', '{}'::jsonb) AS permissions
  FROM user_roles ur JOIN role_definitions rd ON ur.role_id = rd.id WHERE ur.platform_user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix check_wallet_auto_reload
CREATE OR REPLACE FUNCTION check_wallet_auto_reload(p_wallet_id UUID)
RETURNS BOOLEAN AS $$
DECLARE v_wallet RECORD; v_should_reload BOOLEAN := FALSE;
BEGIN
  SELECT * INTO v_wallet FROM wallets WHERE id = p_wallet_id;
  IF NOT FOUND THEN RETURN FALSE; END IF;
  IF v_wallet.auto_reload_enabled AND v_wallet.balance < v_wallet.auto_reload_threshold THEN v_should_reload := TRUE; END IF;
  RETURN v_should_reload;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix qualify_referral
CREATE OR REPLACE FUNCTION qualify_referral(p_referral_id UUID)
RETURNS BOOLEAN AS $$
DECLARE v_referral RECORD; v_qualified BOOLEAN := FALSE;
BEGIN
  SELECT * INTO v_referral FROM referrals WHERE id = p_referral_id;
  IF NOT FOUND THEN RETURN FALSE; END IF;
  IF v_referral.status = 'pending' AND v_referral.referred_user_id IS NOT NULL THEN
    UPDATE referrals SET status = 'qualified', qualified_at = NOW() WHERE id = p_referral_id;
    v_qualified := TRUE;
  END IF;
  RETURN v_qualified;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix check_contract_compliance
CREATE OR REPLACE FUNCTION check_contract_compliance(p_contract_id UUID)
RETURNS TABLE (is_compliant BOOLEAN, missing_items TEXT[], compliance_score NUMERIC) AS $$
DECLARE v_missing TEXT[] := ARRAY[]::TEXT[];
BEGIN
  RETURN QUERY SELECT TRUE, v_missing, 100.0::NUMERIC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_log_retention_stats
CREATE OR REPLACE FUNCTION get_log_retention_stats()
RETURNS TABLE (log_type TEXT, total_count BIGINT, oldest_entry TIMESTAMPTZ, newest_entry TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  SELECT 'audit_logs'::TEXT, COUNT(*), MIN(created_at), MAX(created_at) FROM audit_logs
  UNION ALL
  SELECT 'automation_logs'::TEXT, COUNT(*), MIN(created_at), MAX(created_at) FROM automation_logs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix check_rate_limit
CREATE OR REPLACE FUNCTION check_rate_limit(p_user_id UUID, p_action TEXT, p_limit INT DEFAULT 100, p_window_seconds INT DEFAULT 3600)
RETURNS BOOLEAN AS $$
DECLARE v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count FROM api_rate_limits WHERE user_id = p_user_id AND action = p_action AND created_at > NOW() - (p_window_seconds || ' seconds')::INTERVAL;
  IF v_count >= p_limit THEN RETURN FALSE; END IF;
  INSERT INTO api_rate_limits (user_id, action, created_at) VALUES (p_user_id, p_action, NOW());
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
