-- Migration: Fix Remaining Trigger Functions with Mutable Search Path
-- Description: Ensures ALL trigger functions have SET search_path = public
-- Date: 2025-12-11

-- This migration uses ALTER FUNCTION to set search_path on any trigger functions
-- that might still be missing it. Using IF EXISTS pattern to avoid errors.

DO $$
DECLARE
  func_name TEXT;
  func_names TEXT[] := ARRAY[
    'audit_sensitive_access',
    'auto_expire_credentials',
    'calculate_crew_hours',
    'calculate_cue_variance',
    'calculate_cue_variance_enhanced',
    'calculate_expense_report_total',
    'calculate_timesheet_hours',
    'check_max_quick_link_favorites',
    'check_weather_thresholds',
    'ensure_single_default_payment_method',
    'log_certification_renewal',
    'log_compliance_status_change',
    'log_incident_status_change',
    'set_addon_redemption_code',
    'sync_event_to_production',
    'sync_impersonation_session_aliases',
    'sync_production_dates',
    'trigger_cross_platform_sync',
    'trigger_deal_webhook',
    'trigger_marketing_automation',
    'trigger_update_period_summary',
    'trigger_update_review_statistics',
    'update_addon_sold_quantity',
    'update_api_key_timestamp',
    'update_artist_follower_count',
    'update_asset_maintenance_status',
    'update_checklist_completion',
    'update_communications_timestamp',
    'update_compliance_tables_timestamp',
    'update_contract_lifecycle',
    'update_crew_member_rating',
    'update_document_timestamp',
    'update_event_attendees_count',
    'update_event_series_stats',
    'update_group_members_count',
    'update_incidents_timestamp',
    'update_investment_timestamp',
    'update_misc_timestamp',
    'update_opportunity_application_count',
    'update_payroll_totals_trigger',
    'update_production_lifecycle',
    'update_project_on_change_order',
    'update_pto_on_approval',
    'update_reports_timestamp',
    'update_review_helpful_count',
    'update_review_helpful_counts',
    'update_review_reaction_counts',
    'update_review_report_count',
    'update_review_statistics',
    'update_risk_from_assessment',
    'update_round_totals',
    'update_search_index_timestamp',
    'update_share_engagement_metrics',
    'update_shows_timestamp',
    'update_sop_timestamp',
    'update_spare_parts_inventory',
    'update_sponsor_timestamp',
    'update_stream_analytics',
    'update_stream_chat_count',
    'update_user_profile_stats',
    'update_venue_follower_count',
    'update_webhook_timestamp',
    'update_zones_timestamp',
    'validate_production_id',
    'handle_auth_user_insert'
  ];
BEGIN
  FOREACH func_name IN ARRAY func_names
  LOOP
    BEGIN
      EXECUTE format('ALTER FUNCTION public.%I() SET search_path = public', func_name);
      RAISE NOTICE 'Set search_path for function: %', func_name;
    EXCEPTION WHEN undefined_function THEN
      RAISE NOTICE 'Function % does not exist, skipping', func_name;
    END;
  END LOOP;
END $$;

-- Also fix any functions in analytics schema
DO $$
BEGIN
  BEGIN
    ALTER FUNCTION analytics.refresh_kpi_views() SET search_path = analytics, public;
    RAISE NOTICE 'Set search_path for analytics.refresh_kpi_views';
  EXCEPTION WHEN undefined_function THEN
    RAISE NOTICE 'Function analytics.refresh_kpi_views does not exist, skipping';
  END;
END $$;

-- Verify the changes
DO $$
DECLARE
  func_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO func_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.proconfig IS NOT NULL
    AND 'search_path=public' = ANY(p.proconfig);
  
  RAISE NOTICE 'Total functions with search_path=public: %', func_count;
END $$;
