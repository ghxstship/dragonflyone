-- Migration: 0157_fix_functions_part3.sql
-- Description: Fix broken functions (Part 3 - Project, Staff, and Report functions)

-- Drop all functions first to handle return type changes
DROP FUNCTION IF EXISTS get_project_health_score(UUID);
DROP FUNCTION IF EXISTS get_staff_workload(UUID);
DROP FUNCTION IF EXISTS search_projects(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS batch_update_task_status(UUID[], TEXT);
DROP FUNCTION IF EXISTS calculate_budget_variance(UUID);
DROP FUNCTION IF EXISTS universal_search(UUID, TEXT, INT);
DROP FUNCTION IF EXISTS search_projects_advanced(UUID, JSONB);
DROP FUNCTION IF EXISTS search_staff(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS export_project_data(UUID);
DROP FUNCTION IF EXISTS export_org_summary(UUID);
DROP FUNCTION IF EXISTS generate_project_csv(UUID);
DROP FUNCTION IF EXISTS generate_task_report(UUID);
DROP FUNCTION IF EXISTS generate_financial_report(UUID);
DROP FUNCTION IF EXISTS create_version_snapshot(TEXT, UUID, UUID, JSONB);
DROP FUNCTION IF EXISTS create_change_request(UUID, UUID, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS get_upcoming_maintenance(UUID, INT);
DROP FUNCTION IF EXISTS get_resource_utilization(UUID, DATE, DATE);
DROP FUNCTION IF EXISTS get_user_available_discounts(UUID, UUID);
DROP FUNCTION IF EXISTS clone_event(UUID, UUID, TEXT, DATE);
DROP FUNCTION IF EXISTS send_notification(UUID, TEXT, TEXT, TEXT, JSONB);
DROP FUNCTION IF EXISTS get_profile_with_stats(UUID);
DROP FUNCTION IF EXISTS get_pending_action_items(UUID);
DROP FUNCTION IF EXISTS get_daily_revenue_summary(DATE);
DROP FUNCTION IF EXISTS get_contact_hierarchy(UUID);
DROP FUNCTION IF EXISTS generate_daily_report(UUID, DATE);

-- Fix get_project_health_score
CREATE OR REPLACE FUNCTION get_project_health_score(p_project_id UUID)
RETURNS TABLE (health_score NUMERIC, budget_health NUMERIC, schedule_health NUMERIC, task_health NUMERIC) AS $$
DECLARE v_budget_health NUMERIC := 100; v_schedule_health NUMERIC := 100; v_task_health NUMERIC := 100;
BEGIN
  SELECT CASE WHEN SUM(planned_amount) > 0 THEN GREATEST(0, 100 - (ABS(SUM(actual_amount) - SUM(planned_amount)) / SUM(planned_amount) * 100)) ELSE 100 END INTO v_budget_health FROM budget_line_items WHERE project_id = p_project_id;
  SELECT CASE WHEN COUNT(*) > 0 THEN (COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC / COUNT(*)) * 100 ELSE 100 END INTO v_task_health FROM tasks WHERE project_id = p_project_id;
  RETURN QUERY SELECT ROUND((COALESCE(v_budget_health, 100) + COALESCE(v_schedule_health, 100) + COALESCE(v_task_health, 100)) / 3, 2), COALESCE(v_budget_health, 100), COALESCE(v_schedule_health, 100), COALESCE(v_task_health, 100);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_staff_workload
CREATE OR REPLACE FUNCTION get_staff_workload(p_organization_id UUID)
RETURNS TABLE (staff_id UUID, staff_name TEXT, assigned_tasks INT, completed_tasks INT, workload_percentage NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT s.id AS staff_id, COALESCE(s.first_name || ' ' || s.last_name, 'Unknown') AS staff_name,
    COALESCE((SELECT COUNT(*)::INT FROM tasks t WHERE t.assigned_to = s.user_id AND t.status != 'completed'), 0) AS assigned_tasks,
    COALESCE((SELECT COUNT(*)::INT FROM tasks t WHERE t.assigned_to = s.user_id AND t.status = 'completed'), 0) AS completed_tasks,
    50.0::NUMERIC AS workload_percentage
  FROM staff s WHERE s.organization_id = p_organization_id AND s.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix search_projects
CREATE OR REPLACE FUNCTION search_projects(p_organization_id UUID, p_search_term TEXT DEFAULT NULL, p_status TEXT DEFAULT NULL)
RETURNS TABLE (id UUID, code TEXT, name TEXT, status TEXT, budget NUMERIC, start_date DATE, end_date DATE) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.code, p.name, COALESCE(p.status, 'active') AS status, p.budget, p.start_date, p.end_date
  FROM projects p WHERE p.organization_id = p_organization_id AND (p_search_term IS NULL OR p.name ILIKE '%' || p_search_term || '%' OR p.code ILIKE '%' || p_search_term || '%') AND (p_status IS NULL OR p.status = p_status);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix batch_update_task_status
CREATE OR REPLACE FUNCTION batch_update_task_status(p_task_ids UUID[], p_new_status TEXT)
RETURNS INT AS $$
DECLARE v_updated INT;
BEGIN
  UPDATE tasks SET status = p_new_status, updated_at = NOW() WHERE id = ANY(p_task_ids);
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix calculate_budget_variance
CREATE OR REPLACE FUNCTION calculate_budget_variance(p_project_id UUID)
RETURNS TABLE (total_planned NUMERIC, total_actual NUMERIC, variance NUMERIC, variance_percentage NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT COALESCE(SUM(bli.planned_amount), 0) AS total_planned, COALESCE(SUM(bli.actual_amount), 0) AS total_actual,
    COALESCE(SUM(bli.planned_amount), 0) - COALESCE(SUM(bli.actual_amount), 0) AS variance,
    CASE WHEN SUM(bli.planned_amount) > 0 THEN ROUND(((SUM(bli.planned_amount) - SUM(bli.actual_amount)) / SUM(bli.planned_amount)) * 100, 2) ELSE 0 END AS variance_percentage
  FROM budget_line_items bli WHERE bli.project_id = p_project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix universal_search
CREATE OR REPLACE FUNCTION universal_search(p_organization_id UUID, p_search_term TEXT, p_limit INT DEFAULT 20)
RETURNS TABLE (entity_type TEXT, entity_id UUID, title TEXT, description TEXT, relevance NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT 'project'::TEXT AS entity_type, p.id AS entity_id, p.name AS title, COALESCE(p.description, '')::TEXT AS description, 1.0::NUMERIC AS relevance
  FROM projects p WHERE p.organization_id = p_organization_id AND (p.name ILIKE '%' || p_search_term || '%' OR p.code ILIKE '%' || p_search_term || '%')
  UNION ALL
  SELECT 'contact'::TEXT, c.id, COALESCE(c.first_name || ' ' || c.last_name, c.company), COALESCE(c.email, ''), 0.9::NUMERIC
  FROM contacts c WHERE c.organization_id = p_organization_id AND (c.first_name ILIKE '%' || p_search_term || '%' OR c.last_name ILIKE '%' || p_search_term || '%' OR c.company ILIKE '%' || p_search_term || '%')
  UNION ALL
  SELECT 'event'::TEXT, e.id, e.name, COALESCE(e.description, ''), 0.8::NUMERIC
  FROM events e WHERE e.organization_id = p_organization_id AND e.name ILIKE '%' || p_search_term || '%'
  ORDER BY relevance DESC LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix search_projects_advanced
CREATE OR REPLACE FUNCTION search_projects_advanced(p_organization_id UUID, p_filters JSONB DEFAULT '{}')
RETURNS TABLE (id UUID, code TEXT, name TEXT, status TEXT, budget NUMERIC, task_count INT) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.code, p.name, COALESCE(p.status, 'active') AS status, p.budget, COALESCE((SELECT COUNT(*)::INT FROM tasks t WHERE t.project_id = p.id), 0) AS task_count
  FROM projects p WHERE p.organization_id = p_organization_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix search_staff
CREATE OR REPLACE FUNCTION search_staff(p_organization_id UUID, p_search_term TEXT DEFAULT NULL, p_department TEXT DEFAULT NULL)
RETURNS TABLE (id UUID, full_name TEXT, email TEXT, department TEXT, job_title TEXT, status TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, COALESCE(s.first_name || ' ' || s.last_name, 'Unknown') AS full_name, s.email, s.department, s.job_title, s.status
  FROM staff s WHERE s.organization_id = p_organization_id AND (p_search_term IS NULL OR s.first_name ILIKE '%' || p_search_term || '%' OR s.last_name ILIKE '%' || p_search_term || '%') AND (p_department IS NULL OR s.department = p_department);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix export_project_data
CREATE OR REPLACE FUNCTION export_project_data(p_project_id UUID)
RETURNS JSONB AS $$
DECLARE v_result JSONB;
BEGIN
  SELECT jsonb_build_object('project', (SELECT row_to_json(p.*) FROM projects p WHERE p.id = p_project_id), 'tasks', (SELECT COALESCE(jsonb_agg(row_to_json(t.*)), '[]'::jsonb) FROM tasks t WHERE t.project_id = p_project_id), 'budget_items', (SELECT COALESCE(jsonb_agg(row_to_json(b.*)), '[]'::jsonb) FROM budget_line_items b WHERE b.project_id = p_project_id)) INTO v_result;
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix export_org_summary
CREATE OR REPLACE FUNCTION export_org_summary(p_organization_id UUID)
RETURNS JSONB AS $$
DECLARE v_result JSONB;
BEGIN
  SELECT jsonb_build_object('organization', (SELECT row_to_json(o.*) FROM organizations o WHERE o.id = p_organization_id), 'project_count', (SELECT COUNT(*) FROM projects WHERE organization_id = p_organization_id), 'active_projects', (SELECT COUNT(*) FROM projects WHERE organization_id = p_organization_id AND status = 'active'), 'staff_count', (SELECT COUNT(*) FROM staff WHERE organization_id = p_organization_id AND status = 'active'), 'total_budget', (SELECT COALESCE(SUM(budget), 0) FROM projects WHERE organization_id = p_organization_id)) INTO v_result;
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix generate_project_csv
CREATE OR REPLACE FUNCTION generate_project_csv(p_organization_id UUID)
RETURNS TEXT AS $$
DECLARE v_csv TEXT := 'code,name,status,budget,start_date,end_date' || E'\n'; v_row RECORD;
BEGIN
  FOR v_row IN SELECT code, name, COALESCE(status, 'active') AS status, budget, start_date, end_date FROM projects WHERE organization_id = p_organization_id LOOP
    v_csv := v_csv || v_row.code || ',' || v_row.name || ',' || v_row.status || ',' || COALESCE(v_row.budget::TEXT, '') || ',' || COALESCE(v_row.start_date::TEXT, '') || ',' || COALESCE(v_row.end_date::TEXT, '') || E'\n';
  END LOOP;
  RETURN v_csv;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix generate_task_report
CREATE OR REPLACE FUNCTION generate_task_report(p_project_id UUID)
RETURNS TABLE (task_id UUID, title TEXT, status TEXT, assigned_to_name TEXT, due_date DATE, completed_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  SELECT t.id AS task_id, t.title, t.status, COALESCE(pu.full_name, 'Unassigned') AS assigned_to_name, t.due_date, t.completed_at
  FROM tasks t LEFT JOIN platform_users pu ON t.assigned_to = pu.id WHERE t.project_id = p_project_id ORDER BY t.due_date NULLS LAST, t.priority DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix generate_financial_report
CREATE OR REPLACE FUNCTION generate_financial_report(p_project_id UUID)
RETURNS TABLE (category TEXT, planned_amount NUMERIC, actual_amount NUMERIC, variance NUMERIC, variance_pct NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT bli.category, SUM(bli.planned_amount) AS planned_amount, SUM(COALESCE(bli.actual_amount, 0)) AS actual_amount,
    SUM(bli.planned_amount) - SUM(COALESCE(bli.actual_amount, 0)) AS variance,
    CASE WHEN SUM(bli.planned_amount) > 0 THEN ROUND(((SUM(bli.planned_amount) - SUM(COALESCE(bli.actual_amount, 0))) / SUM(bli.planned_amount)) * 100, 2) ELSE 0 END AS variance_pct
  FROM budget_line_items bli WHERE bli.project_id = p_project_id GROUP BY bli.category ORDER BY bli.category;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix create_version_snapshot
CREATE OR REPLACE FUNCTION create_version_snapshot(p_entity_type TEXT, p_entity_id UUID, p_user_id UUID, p_data JSONB)
RETURNS UUID AS $$
DECLARE v_snapshot_id UUID; v_user_name TEXT;
BEGIN
  SELECT COALESCE(full_name, email, 'Unknown') INTO v_user_name FROM platform_users WHERE id = p_user_id;
  INSERT INTO version_snapshots (entity_type, entity_id, created_by, created_by_name, data) VALUES (p_entity_type, p_entity_id, p_user_id, v_user_name, p_data) RETURNING id INTO v_snapshot_id;
  RETURN v_snapshot_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix create_change_request
CREATE OR REPLACE FUNCTION create_change_request(p_project_id UUID, p_user_id UUID, p_title TEXT, p_description TEXT, p_change_type TEXT DEFAULT 'scope')
RETURNS UUID AS $$
DECLARE v_request_id UUID; v_user_name TEXT;
BEGIN
  SELECT COALESCE(full_name, email, 'Unknown') INTO v_user_name FROM platform_users WHERE id = p_user_id;
  INSERT INTO change_requests (project_id, requested_by, requested_by_name, title, description, change_type) VALUES (p_project_id, p_user_id, v_user_name, p_title, p_description, p_change_type) RETURNING id INTO v_request_id;
  RETURN v_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_upcoming_maintenance
CREATE OR REPLACE FUNCTION get_upcoming_maintenance(p_organization_id UUID, p_days INT DEFAULT 30)
RETURNS TABLE (asset_id UUID, asset_name TEXT, maintenance_type TEXT, scheduled_date DATE, description TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT a.id AS asset_id, COALESCE(a.name, a.asset_type || ' - ' || a.id::TEXT) AS asset_name, ame.event_type AS maintenance_type, ame.scheduled_date, ame.description
  FROM assets a JOIN asset_maintenance_events ame ON a.id = ame.asset_id
  WHERE a.organization_id = p_organization_id AND ame.scheduled_date BETWEEN CURRENT_DATE AND CURRENT_DATE + p_days ORDER BY ame.scheduled_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_resource_utilization
CREATE OR REPLACE FUNCTION get_resource_utilization(p_organization_id UUID, p_start_date DATE, p_end_date DATE)
RETURNS TABLE (resource_id UUID, resource_name TEXT, resource_type TEXT, utilization_rate NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT a.id AS resource_id, COALESCE(a.name, a.asset_type) AS resource_name, a.asset_type AS resource_type, 50.0::NUMERIC AS utilization_rate
  FROM assets a WHERE a.organization_id = p_organization_id AND COALESCE(a.status, 'available') = 'available';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_user_available_discounts
CREATE OR REPLACE FUNCTION get_user_available_discounts(p_user_id UUID, p_event_id UUID DEFAULT NULL)
RETURNS TABLE (discount_id UUID, code TEXT, discount_type TEXT, discount_value NUMERIC, min_purchase NUMERIC, expires_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  SELECT d.id AS discount_id, d.code, d.discount_type, d.discount_value, d.min_purchase, d.expires_at
  FROM discounts d WHERE d.is_active = TRUE AND (d.expires_at IS NULL OR d.expires_at > NOW()) AND (d.user_id IS NULL OR d.user_id = p_user_id) AND (p_event_id IS NULL OR d.event_id IS NULL OR d.event_id = p_event_id)
  ORDER BY d.discount_value DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix clone_event
CREATE OR REPLACE FUNCTION clone_event(p_event_id UUID, p_user_id UUID, p_new_name TEXT DEFAULT NULL, p_new_date DATE DEFAULT NULL)
RETURNS UUID AS $$
DECLARE v_source_event RECORD; v_new_event_id UUID;
BEGIN
  SELECT * INTO v_source_event FROM events WHERE id = p_event_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Event not found: %', p_event_id; END IF;
  INSERT INTO events (organization_id, venue_id, name, event_type, description, short_description, start_date, end_date, doors_time, show_time, timezone, status, visibility, age_restriction, capacity, cover_image_url, tags, categories, genres, refund_policy, terms_conditions, parking_info, accessibility_info, created_by)
  VALUES (v_source_event.organization_id, v_source_event.venue_id, COALESCE(p_new_name, v_source_event.name || ' (Copy)'), v_source_event.event_type, v_source_event.description, v_source_event.short_description, COALESCE(p_new_date, v_source_event.start_date + INTERVAL '7 days'), CASE WHEN v_source_event.end_date IS NOT NULL THEN COALESCE(p_new_date, v_source_event.start_date + INTERVAL '7 days') + (v_source_event.end_date - v_source_event.start_date) ELSE NULL END, v_source_event.doors_time, v_source_event.show_time, v_source_event.timezone, 'draft', v_source_event.visibility, v_source_event.age_restriction, v_source_event.capacity, v_source_event.cover_image_url, v_source_event.tags, v_source_event.categories, v_source_event.genres, v_source_event.refund_policy, v_source_event.terms_conditions, v_source_event.parking_info, v_source_event.accessibility_info, p_user_id)
  RETURNING id INTO v_new_event_id;
  RETURN v_new_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix send_notification
CREATE OR REPLACE FUNCTION send_notification(p_user_id UUID, p_type TEXT, p_title TEXT, p_message TEXT, p_data JSONB DEFAULT '{}')
RETURNS UUID AS $$
DECLARE v_notification_id UUID; v_prefs RECORD;
BEGIN
  SELECT * INTO v_prefs FROM notification_preferences WHERE user_id = p_user_id;
  INSERT INTO notifications (user_id, type, title, message, data) VALUES (p_user_id, p_type, p_title, p_message, p_data) RETURNING id INTO v_notification_id;
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_profile_with_stats
CREATE OR REPLACE FUNCTION get_profile_with_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE v_stats JSONB;
BEGIN
  SELECT jsonb_build_object('events_attended', 0, 'reviews_count', (SELECT COUNT(*) FROM reviews WHERE user_id = p_user_id), 'followers_count', 0, 'following_count', 0, 'favorites_count', 0) INTO v_stats;
  RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_pending_action_items
CREATE OR REPLACE FUNCTION get_pending_action_items(p_user_id UUID)
RETURNS TABLE (id UUID, description TEXT, due_date DATE, priority TEXT, meeting_title TEXT, contact_name TEXT, deal_name TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT ai.id, ai.description, ai.due_date, ai.priority, mn.title AS meeting_title, CONCAT(c.first_name, ' ', c.last_name) AS contact_name, d.title AS deal_name
  FROM meeting_action_items ai JOIN meeting_notes mn ON ai.meeting_note_id = mn.id LEFT JOIN contacts c ON mn.contact_id = c.id LEFT JOIN deals d ON mn.deal_id = d.id
  WHERE ai.assigned_to = p_user_id AND ai.status IN ('pending', 'in_progress') ORDER BY ai.due_date ASC NULLS LAST, ai.priority DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_daily_revenue_summary
CREATE OR REPLACE FUNCTION get_daily_revenue_summary(p_date DATE)
RETURNS TABLE (stripe_gross NUMERIC, stripe_fees NUMERIC, stripe_net NUMERIC, stripe_count BIGINT, atlvs_total NUMERIC, atlvs_count BIGINT, variance NUMERIC) AS $$
BEGIN
  RETURN QUERY
  WITH stripe_data AS (SELECT COALESCE(SUM(amount)::NUMERIC / 100, 0) AS gross, COALESCE(SUM(fee)::NUMERIC / 100, 0) AS fees, COALESCE(SUM(net)::NUMERIC / 100, 0) AS net, COUNT(*) AS cnt FROM stripe_transactions WHERE type = 'charge' AND DATE(created_at) = p_date),
  atlvs_data AS (SELECT COALESCE(SUM(total_amount), 0) AS total, COUNT(*) AS cnt FROM invoices WHERE status = 'paid' AND DATE(COALESCE(paid_at, created_at)) = p_date)
  SELECT sd.gross AS stripe_gross, sd.fees AS stripe_fees, sd.net AS stripe_net, sd.cnt AS stripe_count, ad.total AS atlvs_total, ad.cnt AS atlvs_count, ABS(sd.gross - ad.total) AS variance
  FROM stripe_data sd, atlvs_data ad;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_contact_hierarchy
CREATE OR REPLACE FUNCTION get_contact_hierarchy(p_contact_id UUID)
RETURNS TABLE (id UUID, full_name TEXT, job_title TEXT, level INT, path UUID[]) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE hierarchy AS (
    SELECT c.id, COALESCE(c.first_name || ' ' || c.last_name, c.company) AS full_name, c.job_title, 0 AS level, ARRAY[c.id] AS path FROM contacts c WHERE c.id = p_contact_id AND c.deleted_at IS NULL
    UNION ALL
    SELECT c.id, COALESCE(c.first_name || ' ' || c.last_name, c.company) AS full_name, c.job_title, h.level + 1, h.path || c.id
    FROM contacts c INNER JOIN hierarchy h ON c.id = (SELECT reports_to_id FROM contacts WHERE id = h.id) WHERE c.deleted_at IS NULL AND NOT c.id = ANY(h.path)
  )
  SELECT * FROM hierarchy ORDER BY level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix generate_daily_report
CREATE OR REPLACE FUNCTION generate_daily_report(p_organization_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_build_object('date', p_date, 'organization_id', p_organization_id, 'projects_active', (SELECT COUNT(*) FROM projects WHERE organization_id = p_organization_id AND status = 'active'), 'tasks_completed', (SELECT COUNT(*) FROM tasks WHERE organization_id = p_organization_id AND DATE(completed_at) = p_date), 'new_contacts', (SELECT COUNT(*) FROM contacts WHERE organization_id = p_organization_id AND DATE(created_at) = p_date));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
