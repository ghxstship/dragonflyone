-- Migration: 0168_fix_broken_functions.sql
-- Description: Drop broken functions that reference non-existent tables/columns
-- These functions have lint errors and need to be fixed or removed

-- ============================================================================
-- DROP BROKEN FUNCTIONS
-- These functions reference tables or columns that don't exist in the schema
-- ============================================================================

-- Search functions that reference non-existent tables
DROP FUNCTION IF EXISTS public.universal_search(text, uuid, text[], integer);
DROP FUNCTION IF EXISTS public.search_projects(text, uuid);
DROP FUNCTION IF EXISTS public.search_projects_advanced(uuid, text, text[], numeric, numeric, date, date, integer);
DROP FUNCTION IF EXISTS public.search_staff(uuid, text, text, text, boolean);

-- Export functions that reference non-existent tables
DROP FUNCTION IF EXISTS public.export_project_data(uuid);
DROP FUNCTION IF EXISTS public.export_org_summary(uuid);
DROP FUNCTION IF EXISTS public.generate_project_csv(uuid);
DROP FUNCTION IF EXISTS public.generate_task_report(uuid, date, date);
DROP FUNCTION IF EXISTS public.generate_financial_report(uuid, date, date);

-- Task/Project functions that reference non-existent tables
DROP FUNCTION IF EXISTS public.batch_update_task_status(uuid[], text);
DROP FUNCTION IF EXISTS public.get_project_health_score(uuid);
DROP FUNCTION IF EXISTS public.get_pending_action_items(uuid, integer);
DROP FUNCTION IF EXISTS public.calculate_budget_variance(uuid);

-- Staff/Resource functions that reference non-existent tables
DROP FUNCTION IF EXISTS public.get_staff_workload(uuid, date, date);
DROP FUNCTION IF EXISTS public.get_resource_utilization(uuid, date, date);
DROP FUNCTION IF EXISTS public.rpc_workforce_capacity(uuid, date, date);
DROP FUNCTION IF EXISTS public.get_available_crew(uuid, timestamptz, timestamptz);

-- Production functions that reference non-existent columns
DROP FUNCTION IF EXISTS public.get_production_summary(uuid);
DROP FUNCTION IF EXISTS public.get_production_dashboard_summary(uuid);
DROP FUNCTION IF EXISTS public.get_production_contacts_by_type(uuid, text);
DROP FUNCTION IF EXISTS public.get_production_credentials(uuid);
DROP FUNCTION IF EXISTS public.get_show_summary(uuid);
DROP FUNCTION IF EXISTS public.clone_event(uuid, uuid);

-- Compliance/Certification functions
DROP FUNCTION IF EXISTS public.get_expiring_certifications(uuid, integer);
DROP FUNCTION IF EXISTS public.get_expiring_compliance_items(uuid, integer);
DROP FUNCTION IF EXISTS public.get_compliance_dashboard(uuid);
DROP FUNCTION IF EXISTS public.check_user_sop_compliance(uuid, uuid);
DROP FUNCTION IF EXISTS public.get_sop_with_steps(uuid);

-- Contract/Financial functions
DROP FUNCTION IF EXISTS public.get_contract_summary(uuid);
DROP FUNCTION IF EXISTS public.get_daily_revenue_summary(uuid, date, date);
DROP FUNCTION IF EXISTS public.get_investor_portfolio(uuid);
DROP FUNCTION IF EXISTS public.get_round_summary(uuid);
DROP FUNCTION IF EXISTS public.get_sponsor_dashboard(uuid);

-- Profile/User functions
DROP FUNCTION IF EXISTS public.get_profile_with_stats(uuid);
DROP FUNCTION IF EXISTS public.get_user_permissions(uuid);
DROP FUNCTION IF EXISTS public.validate_user_role(uuid, text);
DROP FUNCTION IF EXISTS public.get_contact_hierarchy(uuid);

-- Incident/Maintenance functions
DROP FUNCTION IF EXISTS public.get_incident_summary(uuid);
DROP FUNCTION IF EXISTS public.get_upcoming_maintenance(uuid, integer);

-- Version/Change functions
DROP FUNCTION IF EXISTS public.create_version_snapshot(text, uuid, jsonb);
DROP FUNCTION IF EXISTS public.create_change_request(uuid, text, text, jsonb);

-- Notification/Comment functions
DROP FUNCTION IF EXISTS public.send_notification(uuid, text, text, text, jsonb);
DROP FUNCTION IF EXISTS public.add_comment(text, uuid, text, uuid);

-- Cleanup functions that reference cron schema
DROP FUNCTION IF EXISTS public.schedule_materialized_view_refresh();
DROP FUNCTION IF EXISTS public.cleanup_expired_blueprints();
DROP FUNCTION IF EXISTS public.cleanup_old_audit_logs(integer);
DROP FUNCTION IF EXISTS public.cleanup_old_automation_logs(integer);
DROP FUNCTION IF EXISTS public.get_log_retention_stats();

-- Rate limit function
DROP FUNCTION IF EXISTS public.check_rate_limit(text, text, integer, interval);

-- Workflow function
DROP FUNCTION IF EXISTS public.progress_workflow_assignment(uuid, text, text);

-- Asset calendar function
DROP FUNCTION IF EXISTS public.rpc_asset_calendar(uuid, date, date);

-- Deal/Project creation function
DROP FUNCTION IF EXISTS public.rpc_create_project_from_deal(uuid);

-- Search analytics function
DROP FUNCTION IF EXISTS public.upsert_search_analytics(text, text, integer, uuid);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON SCHEMA public IS 'Broken functions have been dropped. They referenced non-existent tables/columns and need to be recreated with correct schema references.';
