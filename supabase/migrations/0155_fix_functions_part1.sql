-- Migration: 0155_fix_functions_part1.sql
-- Description: Fix broken functions (Part 1 - Production and Dashboard functions)

-- Drop all functions first to handle return type changes
DROP FUNCTION IF EXISTS get_production_summary(UUID);
DROP FUNCTION IF EXISTS get_production_dashboard_summary(UUID);
DROP FUNCTION IF EXISTS get_production_ecosystem(UUID);
DROP FUNCTION IF EXISTS calculate_production_financials(UUID);
DROP FUNCTION IF EXISTS get_production_contacts_by_type(UUID, TEXT);
DROP FUNCTION IF EXISTS get_production_credentials(UUID);
DROP FUNCTION IF EXISTS trigger_production_sync(UUID);
DROP FUNCTION IF EXISTS get_compliance_dashboard(UUID);
DROP FUNCTION IF EXISTS get_expiring_compliance_items(UUID, INT);
DROP FUNCTION IF EXISTS get_incident_summary(UUID);
DROP FUNCTION IF EXISTS get_investor_portfolio(UUID);
DROP FUNCTION IF EXISTS get_round_summary(UUID);
DROP FUNCTION IF EXISTS get_sponsor_dashboard(UUID);
DROP FUNCTION IF EXISTS get_show_summary(UUID);
DROP FUNCTION IF EXISTS get_contract_summary(UUID);

-- Fix get_production_summary (ambiguous column reference)
CREATE OR REPLACE FUNCTION get_production_summary(p_production_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  status TEXT,
  days_until_event INT,
  crew_assigned INT,
  budget_remaining NUMERIC,
  checklist_completion NUMERIC,
  open_issues INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.lifecycle_status AS status,
    (p.opening_date - CURRENT_DATE)::INT AS days_until_event,
    (SELECT COUNT(DISTINCT crew_id)::INT FROM crew_assignments WHERE project_id = p.project_id) AS crew_assigned,
    COALESCE(p.production_budget - p.actual_cost, p.production_budget) AS budget_remaining,
    COALESCE((SELECT AVG(completion_percentage) FROM production_checklists pc WHERE pc.production_id = p.id), 0) AS checklist_completion,
    (SELECT COUNT(*)::INT FROM production_logs pl WHERE pl.production_id = p.id AND pl.log_type = 'issue' AND pl.priority IN ('high', 'urgent')) AS open_issues
  FROM productions p
  WHERE p.id = p_production_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_production_dashboard_summary
CREATE OR REPLACE FUNCTION get_production_dashboard_summary(p_production_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  format TEXT,
  lifecycle_status TEXT,
  days_until_opening INT,
  days_until_closing INT,
  total_shows_scheduled INT,
  crew_count INT,
  open_tasks INT,
  budget_utilization NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.format,
    p.lifecycle_status,
    (p.opening_date - CURRENT_DATE)::INTEGER AS days_until_opening,
    (p.closing_date - CURRENT_DATE)::INTEGER AS days_until_closing,
    COALESCE((SELECT COUNT(*)::INTEGER FROM run_of_shows WHERE project_id = p.project_id), 0) AS total_shows_scheduled,
    COALESCE((SELECT COUNT(DISTINCT crew_id)::INTEGER FROM crew_assignments WHERE project_id = p.project_id), 0) AS crew_count,
    COALESCE((SELECT COUNT(*)::INTEGER FROM tasks t WHERE t.project_id = p.project_id AND t.status NOT IN ('completed', 'cancelled')), 0) AS open_tasks,
    CASE WHEN p.production_budget > 0 THEN ROUND((COALESCE(p.actual_cost, 0) / p.production_budget) * 100, 2) ELSE 0 END AS budget_utilization
  FROM productions p
  WHERE p.id = p_production_id AND p.deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_production_ecosystem
CREATE OR REPLACE FUNCTION get_production_ecosystem(p_production_id UUID)
RETURNS TABLE (production JSONB, events JSONB, sync_history JSONB) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT row_to_json(p.*) FROM productions p WHERE p.id = p_production_id)::jsonb AS production,
    (SELECT COALESCE(jsonb_agg(row_to_json(e.*)), '[]'::jsonb) FROM events e WHERE e.production_id = p_production_id) AS events,
    (SELECT COALESCE(jsonb_agg(row_to_json(sl.*) ORDER BY sl.created_at DESC), '[]'::jsonb) 
     FROM (SELECT * FROM sync_logs WHERE source_id = p_production_id::text ORDER BY created_at DESC LIMIT 50) sl) AS sync_history;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix calculate_production_financials
CREATE OR REPLACE FUNCTION calculate_production_financials(p_production_id UUID)
RETURNS TABLE (total_budget NUMERIC, total_spent NUMERIC, total_committed NUMERIC, remaining_budget NUMERIC, budget_utilization NUMERIC) AS $$
DECLARE
  v_budget NUMERIC := 0;
  v_spent NUMERIC := 0;
  v_committed NUMERIC := 0;
BEGIN
  SELECT COALESCE(production_budget, 0) INTO v_budget FROM productions WHERE id = p_production_id;
  SELECT COALESCE(SUM(actual_amount), 0) INTO v_spent FROM budget_line_items WHERE project_id IN (SELECT project_id FROM productions WHERE id = p_production_id);
  SELECT COALESCE(SUM(planned_amount - COALESCE(actual_amount, 0)), 0) INTO v_committed FROM budget_line_items WHERE project_id IN (SELECT project_id FROM productions WHERE id = p_production_id) AND status = 'committed';
  RETURN QUERY SELECT v_budget, v_spent, v_committed, v_budget - v_spent - v_committed, CASE WHEN v_budget > 0 THEN ROUND((v_spent / v_budget) * 100, 2) ELSE 0 END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_production_contacts_by_type
CREATE OR REPLACE FUNCTION get_production_contacts_by_type(p_production_id UUID, p_contact_type TEXT DEFAULT NULL)
RETURNS TABLE (id UUID, full_name TEXT, email TEXT, phone TEXT, job_title TEXT, contact_type TEXT, role_in_production TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, COALESCE(c.first_name || ' ' || c.last_name, c.company) AS full_name, c.email, c.phone, c.job_title, c.contact_type, pc.role AS role_in_production
  FROM production_contacts pc
  JOIN contacts c ON pc.contact_id = c.id
  WHERE pc.production_id = p_production_id AND c.deleted_at IS NULL AND (p_contact_type IS NULL OR c.contact_type = p_contact_type)
  ORDER BY c.contact_type, c.last_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_production_credentials
CREATE OR REPLACE FUNCTION get_production_credentials(p_production_id UUID)
RETURNS TABLE (id UUID, credential_type TEXT, name TEXT, username TEXT, notes TEXT, created_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  SELECT pc.id, pc.credential_type, pc.name, pc.username, pc.notes::TEXT, pc.created_at
  FROM production_credentials pc WHERE pc.production_id = p_production_id ORDER BY pc.credential_type, pc.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix trigger_production_sync
CREATE OR REPLACE FUNCTION trigger_production_sync(p_production_id UUID)
RETURNS VOID AS $$
DECLARE v_production RECORD;
BEGIN
  SELECT * INTO v_production FROM productions WHERE id = p_production_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Production not found: %', p_production_id; END IF;
  UPDATE events SET status = CASE WHEN v_production.lifecycle_status = 'active' THEN 'published' WHEN v_production.lifecycle_status = 'completed' THEN 'completed' WHEN v_production.lifecycle_status = 'cancelled' THEN 'cancelled' ELSE status END, start_date = COALESCE(v_production.opening_date, start_date), end_date = COALESCE(v_production.closing_date, end_date), updated_at = NOW() WHERE production_id = p_production_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_compliance_dashboard (ambiguous column reference)
CREATE OR REPLACE FUNCTION get_compliance_dashboard(p_organization_id UUID)
RETURNS TABLE (total_items INT, compliant_items INT, expiring_soon INT, expired INT, compliance_rate NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INT AS total_items,
    COUNT(*) FILTER (WHERE ci.status = 'compliant')::INT AS compliant_items,
    COUNT(*) FILTER (WHERE ci.expiration_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 30)::INT AS expiring_soon,
    COUNT(*) FILTER (WHERE ci.expiration_date < CURRENT_DATE)::INT AS expired,
    CASE WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE ci.status = 'compliant')::NUMERIC / COUNT(*)) * 100, 2) ELSE 100 END AS compliance_rate
  FROM compliance_items ci WHERE ci.organization_id = p_organization_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_expiring_compliance_items
CREATE OR REPLACE FUNCTION get_expiring_compliance_items(p_organization_id UUID, p_days INT DEFAULT 30)
RETURNS TABLE (id UUID, name TEXT, item_type TEXT, expiration_date DATE, days_until_expiry INT) AS $$
BEGIN
  RETURN QUERY
  SELECT ci.id, ci.name, ci.item_type, ci.expiration_date, (ci.expiration_date - CURRENT_DATE)::INT AS days_until_expiry
  FROM compliance_items ci WHERE ci.organization_id = p_organization_id AND ci.expiration_date BETWEEN CURRENT_DATE AND CURRENT_DATE + p_days
  ORDER BY ci.expiration_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_incident_summary
CREATE OR REPLACE FUNCTION get_incident_summary(p_incident_id UUID)
RETURNS TABLE (id UUID, title TEXT, severity TEXT, status TEXT, reported_at TIMESTAMPTZ, resolved_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  SELECT i.id, i.title, i.severity, i.status, i.reported_at, i.resolved_at FROM incidents i WHERE i.id = p_incident_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_investor_portfolio
CREATE OR REPLACE FUNCTION get_investor_portfolio(p_investor_id UUID)
RETURNS TABLE (investment_id UUID, round_name TEXT, amount NUMERIC, equity_percentage NUMERIC, investment_date DATE) AS $$
BEGIN
  RETURN QUERY
  SELECT i.id AS investment_id, fr.name AS round_name, i.amount, i.equity_percentage, i.investment_date
  FROM investments i JOIN funding_rounds fr ON i.round_id = fr.id WHERE i.investor_id = p_investor_id ORDER BY i.investment_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_round_summary
CREATE OR REPLACE FUNCTION get_round_summary(p_round_id UUID)
RETURNS TABLE (id UUID, name TEXT, target_amount NUMERIC, raised_amount NUMERIC, investor_count INT, status TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT fr.id, fr.name, fr.target_amount, COALESCE(SUM(i.amount), 0) AS raised_amount, COUNT(DISTINCT i.investor_id)::INT AS investor_count, fr.status
  FROM funding_rounds fr LEFT JOIN investments i ON fr.id = i.round_id WHERE fr.id = p_round_id GROUP BY fr.id, fr.name, fr.target_amount, fr.status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_sponsor_dashboard (ambiguous column reference)
CREATE OR REPLACE FUNCTION get_sponsor_dashboard(p_sponsor_id UUID)
RETURNS TABLE (id UUID, company_name TEXT, tier_name TEXT, status TEXT, total_value NUMERIC, payment_received NUMERIC, payment_percentage NUMERIC, deliverables_total INT, deliverables_completed INT, activations_total INT, activations_active INT, upcoming_payments JSONB) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id, COALESCE(s.company_name, o.name) AS company_name, st.name AS tier_name, s.status, s.total_value, s.payment_received,
    CASE WHEN s.cash_value > 0 THEN ROUND((s.payment_received / s.cash_value) * 100, 2) ELSE 100 END AS payment_percentage,
    (SELECT COUNT(*)::INTEGER FROM sponsor_deliverables sd WHERE sd.sponsor_id = s.id) AS deliverables_total,
    (SELECT COUNT(*)::INTEGER FROM sponsor_deliverables sd WHERE sd.sponsor_id = s.id AND sd.status IN ('delivered', 'approved')) AS deliverables_completed,
    (SELECT COUNT(*)::INTEGER FROM sponsor_activations sa WHERE sa.sponsor_id = s.id) AS activations_total,
    (SELECT COUNT(*)::INTEGER FROM sponsor_activations sa WHERE sa.sponsor_id = s.id AND sa.status = 'active') AS activations_active,
    (SELECT jsonb_agg(jsonb_build_object('id', sp.id, 'amount', sp.amount, 'due_date', sp.due_date, 'status', sp.status) ORDER BY sp.due_date) FROM sponsor_payments sp WHERE sp.sponsor_id = s.id AND sp.status IN ('pending', 'invoiced', 'overdue')) AS upcoming_payments
  FROM sponsors s LEFT JOIN organizations o ON s.organization_id = o.id LEFT JOIN sponsor_tiers st ON s.tier_id = st.id WHERE s.id = p_sponsor_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_show_summary (ambiguous column reference)
CREATE OR REPLACE FUNCTION get_show_summary(p_show_id UUID)
RETURNS TABLE (id UUID, show_number INT, date DATE, show_type TEXT, status TEXT, capacity INT, tickets_sold INT, attendance INT, fill_rate NUMERIC, cue_count INT, cues_completed INT, crew_count INT, crew_checked_in INT, stage_manager TEXT, venue_name TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id, s.show_number, s.date, s.show_type, s.status, s.capacity, s.tickets_sold, s.attendance,
    CASE WHEN s.capacity > 0 THEN ROUND((COALESCE(s.attendance, s.tickets_sold)::NUMERIC / s.capacity) * 100, 2) ELSE 0 END AS fill_rate,
    (SELECT COUNT(*)::INTEGER FROM cues c WHERE c.show_id = s.id OR c.run_of_show_id = s.run_of_show_id) AS cue_count,
    (SELECT COUNT(*)::INTEGER FROM cues c WHERE (c.show_id = s.id OR c.run_of_show_id = s.run_of_show_id) AND c.status = 'completed') AS cues_completed,
    (SELECT COUNT(*)::INTEGER FROM show_crew sc WHERE sc.show_id = s.id) AS crew_count,
    (SELECT COUNT(*)::INTEGER FROM show_crew sc WHERE sc.show_id = s.id AND sc.status IN ('checked_in', 'working', 'wrapped')) AS crew_checked_in,
    pu.full_name AS stage_manager, v.name AS venue_name
  FROM shows s LEFT JOIN platform_users pu ON s.stage_manager_id = pu.id LEFT JOIN venues v ON s.venue_id = v.id WHERE s.id = p_show_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_contract_summary (ambiguous column reference)
CREATE OR REPLACE FUNCTION get_contract_summary(p_contract_id UUID)
RETURNS TABLE (id UUID, title TEXT, contract_number TEXT, category TEXT, lifecycle_status TEXT, value NUMERIC, party_a_name TEXT, party_b_name TEXT, start_date DATE, end_date DATE, days_remaining INT, is_fully_signed BOOLEAN, deliverables_total INT, deliverables_completed INT, milestones_total INT, milestones_completed INT, compliance_score NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id, c.title, c.contract_number, c.category, c.lifecycle_status, c.value,
    COALESCE(oa.name, ca.first_name || ' ' || ca.last_name) AS party_a_name,
    COALESCE(ob.name, cb.first_name || ' ' || cb.last_name) AS party_b_name,
    c.start_date, c.end_date, (c.end_date - CURRENT_DATE)::INTEGER AS days_remaining,
    c.party_a_signed_at IS NOT NULL AND c.party_b_signed_at IS NOT NULL AS is_fully_signed,
    (SELECT COUNT(*)::INTEGER FROM contract_deliverables cd WHERE cd.contract_id = c.id) AS deliverables_total,
    (SELECT COUNT(*)::INTEGER FROM contract_deliverables cd WHERE cd.contract_id = c.id AND cd.status IN ('delivered', 'accepted')) AS deliverables_completed,
    (SELECT COUNT(*)::INTEGER FROM contract_milestones cm WHERE cm.contract_id = c.id) AS milestones_total,
    (SELECT COUNT(*)::INTEGER FROM contract_milestones cm WHERE cm.contract_id = c.id AND cm.status = 'completed') AS milestones_completed,
    100.0::NUMERIC AS compliance_score
  FROM contracts c LEFT JOIN organizations oa ON c.party_a_org_id = oa.id LEFT JOIN contacts ca ON c.party_a_contact_id = ca.id LEFT JOIN organizations ob ON c.party_b_org_id = ob.id LEFT JOIN contacts cb ON c.party_b_contact_id = cb.id WHERE c.id = p_contract_id AND c.deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
