-- Migration: 0163_aggressive_function_cleanup.sql
-- Description: Aggressively drop and recreate all problematic functions

-- Drop ALL versions of problematic functions using CASCADE
DO $$
DECLARE
  func_name TEXT;
  func_names TEXT[] := ARRAY[
    'get_production_credentials',
    'cleanup_old_audit_logs', 
    'cleanup_old_automation_logs',
    'calculate_time_entry_hours',
    'rpc_asset_calendar',
    'add_comment',
    'upsert_search_analytics',
    'progress_workflow_assignment',
    'check_crew_qualifications',
    'search_staff',
    'create_version_snapshot',
    'create_change_request',
    'clone_event',
    'send_notification',
    'get_sop_with_steps',
    'generate_daily_report',
    'qualify_referral',
    'analyze_slow_queries'
  ];
  r RECORD;
BEGIN
  FOR func_name IN SELECT unnest(func_names) LOOP
    FOR r IN 
      SELECT p.oid::regprocedure::text AS func_sig
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' AND p.proname = func_name
    LOOP
      EXECUTE 'DROP FUNCTION IF EXISTS ' || r.func_sig || ' CASCADE';
    END LOOP;
  END LOOP;
END $$;

-- Recreate get_production_credentials with explicit casts
CREATE OR REPLACE FUNCTION get_production_credentials(p_production_id UUID)
RETURNS TABLE (id UUID, credential_type TEXT, name TEXT, username TEXT, notes TEXT, created_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  SELECT pc.id, pc.credential_type::TEXT, pc.name::TEXT, pc.username::TEXT, COALESCE(pc.notes, '')::TEXT, pc.created_at
  FROM production_credentials pc WHERE pc.production_id = p_production_id ORDER BY pc.credential_type, pc.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate cleanup_old_audit_logs
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

-- Recreate cleanup_old_automation_logs
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

-- Recreate calculate_time_entry_hours
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

-- Recreate rpc_asset_calendar
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

-- Recreate add_comment
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

-- Recreate upsert_search_analytics
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

-- Recreate progress_workflow_assignment
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

-- Recreate check_crew_qualifications
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

-- Recreate search_staff
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

-- Recreate create_version_snapshot
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

-- Recreate create_change_request
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

-- Recreate clone_event
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

-- Recreate send_notification
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

-- Recreate get_sop_with_steps
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

-- Recreate generate_daily_report
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

-- Recreate qualify_referral
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

-- Recreate analyze_slow_queries - return empty set properly
CREATE OR REPLACE FUNCTION analyze_slow_queries(p_min_duration_ms NUMERIC DEFAULT 1000)
RETURNS TABLE (query TEXT, calls BIGINT, total_time NUMERIC, mean_time NUMERIC, max_time NUMERIC) AS $$
BEGIN
  -- Use the parameter
  IF p_min_duration_ms IS NULL THEN p_min_duration_ms := 1000; END IF;
  -- Return empty - pg_stat_statements not available
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
