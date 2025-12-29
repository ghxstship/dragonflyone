-- Migration: 0233_missing_tables_part4.sql
-- Purpose: Create remaining missing tables (Part 4 of 4)
-- Date: December 15, 2025

-- REWARDS CATALOG
CREATE TABLE IF NOT EXISTS rewards_catalog (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, description TEXT, points_required INTEGER, quantity_available INTEGER, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());

-- RFID & RFP/RFQ
CREATE TABLE IF NOT EXISTS rfid_scans (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), rfid_tag TEXT NOT NULL, location TEXT, scanned_at TIMESTAMPTZ DEFAULT now(), device_id UUID, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS rfp_evaluations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), rfp_id UUID NOT NULL, evaluator_id UUID, scores JSONB DEFAULT '{}', comments TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS rfp_responses (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), rfp_id UUID NOT NULL, vendor_id UUID NOT NULL, response_content JSONB DEFAULT '{}', submitted_at TIMESTAMPTZ, status TEXT DEFAULT 'draft', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS rfq_quotes (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), rfq_id UUID NOT NULL, vendor_id UUID NOT NULL, quoted_amount DECIMAL, valid_until DATE, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS rfqs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, title TEXT NOT NULL, description TEXT, items JSONB DEFAULT '[]', deadline TIMESTAMPTZ, status TEXT DEFAULT 'open', created_at TIMESTAMPTZ DEFAULT now());

-- RIDER & RIGGING
CREATE TABLE IF NOT EXISTS rider_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), rider_id UUID NOT NULL, category TEXT, item_name TEXT NOT NULL, quantity INTEGER DEFAULT 1, notes TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS rider_notes (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), rider_id UUID NOT NULL, note_type TEXT, content TEXT, created_by UUID, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS rigging_calculations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID, calculation_type TEXT, load_weight DECIMAL, safety_factor DECIMAL, results JSONB DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS rigging_plans (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID NOT NULL, venue_id UUID, points JSONB DEFAULT '[]', total_load DECIMAL, status TEXT DEFAULT 'draft', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS rigging_points (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), plan_id UUID NOT NULL, point_id TEXT, location JSONB DEFAULT '{}', capacity DECIMAL, assigned_load DECIMAL, created_at TIMESTAMPTZ DEFAULT now());

-- RISK
CREATE TABLE IF NOT EXISTS risk_alerts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), risk_id UUID NOT NULL, alert_type TEXT, message TEXT, triggered_at TIMESTAMPTZ DEFAULT now(), acknowledged BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS risk_assessment_schedules (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, assessment_type TEXT, frequency_days INTEGER, last_assessment DATE, next_assessment DATE, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS risk_mitigations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), risk_id UUID NOT NULL, mitigation_type TEXT, description TEXT, status TEXT DEFAULT 'planned', implemented_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());

-- ROLE & RUN OF SHOW
CREATE TABLE IF NOT EXISTS role_definitions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, role_name TEXT NOT NULL, permissions JSONB DEFAULT '[]', description TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS roles (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, permissions JSONB DEFAULT '[]', is_system BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS run_of_show (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID NOT NULL, entries JSONB DEFAULT '[]', status TEXT DEFAULT 'draft', created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now());

-- SAFETY
CREATE TABLE IF NOT EXISTS safety_briefing_attendees (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), briefing_id UUID NOT NULL, user_id UUID NOT NULL, attended BOOLEAN DEFAULT false, signed_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS safety_briefings (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID, project_id UUID, briefing_type TEXT, scheduled_at TIMESTAMPTZ, content TEXT, status TEXT DEFAULT 'scheduled', created_at TIMESTAMPTZ DEFAULT now());

-- SALARY & SALES
CREATE TABLE IF NOT EXISTS salary_data (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, position TEXT NOT NULL, min_salary DECIMAL, max_salary DECIMAL, median_salary DECIMAL, location TEXT, updated_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS sales_forecasts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, period_start DATE, period_end DATE, forecasted_amount DECIMAL, actual_amount DECIMAL, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS saved_jobs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, job_id UUID NOT NULL, saved_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());

-- SCENARIOS & SCHEDULE
CREATE TABLE IF NOT EXISTS scenarios (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, scenario_type TEXT, parameters JSONB DEFAULT '{}', results JSONB DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS schedule_phases (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), schedule_id UUID NOT NULL, phase_name TEXT NOT NULL, start_date DATE, end_date DATE, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS scheduled_maintenance (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), asset_id UUID, equipment_id UUID, maintenance_type TEXT, scheduled_date DATE, status TEXT DEFAULT 'scheduled', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS scheduled_notifications (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID, notification_type TEXT, scheduled_for TIMESTAMPTZ, content JSONB DEFAULT '{}', status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());

-- SEAT & SECRET
CREATE TABLE IF NOT EXISTS seat_holds (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID NOT NULL, seat_id UUID NOT NULL, held_by UUID, held_until TIMESTAMPTZ, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS seat_upgrade_bids (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID NOT NULL, user_id UUID NOT NULL, current_seat_id UUID, bid_amount DECIMAL, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS seat_upgrade_offers (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID NOT NULL, from_section TEXT, to_section TEXT, upgrade_price DECIMAL, available_count INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS seating_seats (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), venue_id UUID NOT NULL, section TEXT, row_name TEXT, seat_number TEXT, seat_type TEXT DEFAULT 'standard', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS secret_rotation_history (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), secret_id UUID NOT NULL, rotated_at TIMESTAMPTZ DEFAULT now(), rotated_by UUID, reason TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS selection_approvals (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), selection_id UUID NOT NULL, approver_id UUID NOT NULL, status TEXT DEFAULT 'pending', approved_at TIMESTAMPTZ, comments TEXT, created_at TIMESTAMPTZ DEFAULT now());

-- SERVICE & SET
CREATE TABLE IF NOT EXISTS service_records (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), asset_id UUID, equipment_id UUID, service_type TEXT NOT NULL, description TEXT, performed_by TEXT, service_date DATE, cost DECIMAL, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS set_change_tasks (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), change_id UUID NOT NULL, task_description TEXT, assigned_to UUID, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS set_changes (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID NOT NULL, from_set TEXT, to_set TEXT, scheduled_time TIMESTAMPTZ, duration_minutes INTEGER, status TEXT DEFAULT 'scheduled', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS set_times (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID NOT NULL, artist_id UUID, stage TEXT, start_time TIMESTAMPTZ, end_time TIMESTAMPTZ, status TEXT DEFAULT 'scheduled', created_at TIMESTAMPTZ DEFAULT now());

-- SETTLEMENT & SHARE
CREATE TABLE IF NOT EXISTS settlement_line_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), settlement_id UUID NOT NULL, description TEXT NOT NULL, amount DECIMAL NOT NULL, line_type TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS share_templates (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, template_type TEXT, content JSONB DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now());

-- SHIPMENT & SHOPPABLE
CREATE TABLE IF NOT EXISTS shipments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), order_id UUID, carrier TEXT, tracking_number TEXT, shipped_at TIMESTAMPTZ, delivered_at TIMESTAMPTZ, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS shoppable_post_tags (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), post_id UUID NOT NULL, product_id UUID NOT NULL, position_x DECIMAL, position_y DECIMAL, created_at TIMESTAMPTZ DEFAULT now());

-- SHOW
CREATE TABLE IF NOT EXISTS show_call_attendance (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), show_call_id UUID NOT NULL, user_id UUID NOT NULL, status TEXT DEFAULT 'expected', checked_in_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS show_cues (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID NOT NULL, cue_number TEXT, cue_type TEXT, description TEXT, trigger_time TIMESTAMPTZ, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS show_timings (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID NOT NULL, timing_type TEXT, scheduled_time TIMESTAMPTZ, actual_time TIMESTAMPTZ, notes TEXT, created_at TIMESTAMPTZ DEFAULT now());

-- SITE SURVEY
CREATE TABLE IF NOT EXISTS site_restorations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID, venue_id UUID, scheduled_date DATE, status TEXT DEFAULT 'pending', checklist JSONB DEFAULT '[]', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS site_survey_issues (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), survey_id UUID NOT NULL, issue_type TEXT, description TEXT, severity TEXT DEFAULT 'medium', status TEXT DEFAULT 'open', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS site_survey_measurements (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), survey_id UUID NOT NULL, measurement_type TEXT, value DECIMAL, unit TEXT, location TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS site_survey_photos (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), survey_id UUID NOT NULL, photo_type TEXT, file_url TEXT, caption TEXT, taken_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS site_surveys (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), venue_id UUID, event_id UUID, surveyed_by UUID, survey_date DATE, findings JSONB DEFAULT '{}', status TEXT DEFAULT 'completed', created_at TIMESTAMPTZ DEFAULT now());

-- SMART LINKS & SMS
CREATE TABLE IF NOT EXISTS smart_links (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, destination_url TEXT, routing_rules JSONB DEFAULT '{}', click_count INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS sms_campaigns (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, message TEXT, recipient_count INTEGER DEFAULT 0, sent_at TIMESTAMPTZ, status TEXT DEFAULT 'draft', created_at TIMESTAMPTZ DEFAULT now());

-- SOUND
CREATE TABLE IF NOT EXISTS sound_limits (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), venue_id UUID, event_id UUID, max_db DECIMAL, measurement_location TEXT, time_restrictions JSONB DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS sound_readings (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID, venue_id UUID, db_level DECIMAL, location TEXT, recorded_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS sound_violations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID NOT NULL, reading_id UUID, violation_type TEXT, db_level DECIMAL, occurred_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS soundcheck_notes (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), soundcheck_id UUID NOT NULL, note_type TEXT, content TEXT, created_by UUID, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS soundcheck_schedule (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID NOT NULL, entries JSONB DEFAULT '[]', status TEXT DEFAULT 'draft', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS soundcheck_slots (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), schedule_id UUID NOT NULL, artist_id UUID, start_time TIMESTAMPTZ, duration_minutes INTEGER, status TEXT DEFAULT 'scheduled', created_at TIMESTAMPTZ DEFAULT now());

-- SPEC & SPECIALTY
CREATE TABLE IF NOT EXISTS spec_sheets (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), equipment_id UUID, product_id UUID, specifications JSONB DEFAULT '{}', file_url TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS specialties (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, category_id UUID, description TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS specialty_categories (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, description TEXT, parent_id UUID, created_at TIMESTAMPTZ DEFAULT now());

-- SSO
CREATE TABLE IF NOT EXISTS sso_auth_requests (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), provider_id UUID NOT NULL, request_id TEXT UNIQUE, state TEXT, redirect_uri TEXT, expires_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS sso_domain_verifications (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID NOT NULL, domain TEXT NOT NULL, verification_token TEXT, verified BOOLEAN DEFAULT false, verified_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS sso_providers (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, provider_type TEXT NOT NULL, name TEXT, config JSONB DEFAULT '{}', is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now());

-- STAFF & STAGE
CREATE TABLE IF NOT EXISTS staff_notifications (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, notification_type TEXT, title TEXT, message TEXT, read BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS stage_areas (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), venue_id UUID, stage_id UUID, area_name TEXT NOT NULL, dimensions JSONB DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS stages (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), venue_id UUID, name TEXT NOT NULL, stage_type TEXT, dimensions JSONB DEFAULT '{}', capacity INTEGER, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS staging_areas (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), venue_id UUID, event_id UUID, name TEXT NOT NULL, location TEXT, purpose TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS staging_assignments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), staging_area_id UUID NOT NULL, item_type TEXT, item_id UUID, assigned_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());

-- STAKEHOLDER
CREATE TABLE IF NOT EXISTS stakeholder_activity (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), stakeholder_id UUID NOT NULL, activity_type TEXT, description TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS stakeholder_approvals (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), stakeholder_id UUID NOT NULL, approval_type TEXT, item_id UUID, status TEXT DEFAULT 'pending', approved_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS stakeholder_communications (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), stakeholder_id UUID NOT NULL, communication_type TEXT, subject TEXT, content TEXT, sent_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS stakeholder_notifications (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), stakeholder_id UUID NOT NULL, notification_type TEXT, message TEXT, sent_at TIMESTAMPTZ, read BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS stakeholder_projects (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), stakeholder_id UUID NOT NULL, project_id UUID NOT NULL, role TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS stakeholder_updates (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), stakeholder_id UUID NOT NULL, update_type TEXT, content TEXT, created_by UUID, created_at TIMESTAMPTZ DEFAULT now());

-- STRATEGIC & SUBCONTRACTOR
CREATE TABLE IF NOT EXISTS strategic_objectives (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, title TEXT NOT NULL, description TEXT, target_date DATE, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS subcontractor_applications (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, applicant_name TEXT, company TEXT, specialty TEXT, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS subcontractor_opportunities (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, title TEXT NOT NULL, description TEXT, requirements JSONB DEFAULT '{}', deadline TIMESTAMPTZ, status TEXT DEFAULT 'open', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS subcontractor_ratings (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), subcontractor_id UUID NOT NULL, project_id UUID, rated_by UUID, rating INTEGER, review TEXT, created_at TIMESTAMPTZ DEFAULT now());

-- SUBSCRIPTION BOX & SUCCESSION
CREATE TABLE IF NOT EXISTS subscription_box_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), box_id UUID NOT NULL, product_id UUID NOT NULL, quantity INTEGER DEFAULT 1, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS subscription_boxes (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), subscription_id UUID NOT NULL, box_number INTEGER, ship_date DATE, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS succession_candidates (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), plan_id UUID NOT NULL, employee_id UUID NOT NULL, readiness_level TEXT, development_needs JSONB DEFAULT '[]', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS succession_plans (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, position TEXT NOT NULL, current_holder_id UUID, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());

-- SUPPORT & SYNC
CREATE TABLE IF NOT EXISTS support_conversations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID, subject TEXT, status TEXT DEFAULT 'open', priority TEXT DEFAULT 'normal', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS support_messages (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), conversation_id UUID NOT NULL, sender_type TEXT, content TEXT, sent_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS supported_languages (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), language_code TEXT UNIQUE NOT NULL, language_name TEXT NOT NULL, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS supported_locales (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), locale_code TEXT UNIQUE NOT NULL, locale_name TEXT NOT NULL, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS sync_jobs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), job_type TEXT NOT NULL, source TEXT, destination TEXT, status TEXT DEFAULT 'pending', started_at TIMESTAMPTZ, completed_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS system_incidents (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), incident_type TEXT NOT NULL, severity TEXT DEFAULT 'medium', description TEXT, started_at TIMESTAMPTZ, resolved_at TIMESTAMPTZ, status TEXT DEFAULT 'open', created_at TIMESTAMPTZ DEFAULT now());

-- TALENT & TAX
CREATE TABLE IF NOT EXISTS talent_pool_members (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), pool_id UUID NOT NULL, user_id UUID NOT NULL, status TEXT DEFAULT 'active', added_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS talent_pools (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, description TEXT, criteria JSONB DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS tax_exemptions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, exemption_type TEXT, certificate_number TEXT, valid_until DATE, document_url TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS tax_filings (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, filing_type TEXT NOT NULL, period_start DATE, period_end DATE, amount DECIMAL, status TEXT DEFAULT 'pending', filed_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());

-- TECH & TECHNICAL
CREATE TABLE IF NOT EXISTS tech_rehearsal_sessions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), rehearsal_id UUID NOT NULL, session_type TEXT, start_time TIMESTAMPTZ, end_time TIMESTAMPTZ, notes TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS technical_issues (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID, project_id UUID, issue_type TEXT NOT NULL, description TEXT, severity TEXT DEFAULT 'medium', status TEXT DEFAULT 'open', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS technical_riders (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), artist_id UUID NOT NULL, event_id UUID, rider_type TEXT DEFAULT 'technical', content JSONB DEFAULT '{}', status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS template_usage (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), template_id UUID NOT NULL, used_by UUID, used_at TIMESTAMPTZ DEFAULT now(), context TEXT, created_at TIMESTAMPTZ DEFAULT now());

-- TERRITORIES & THREE WAY
CREATE TABLE IF NOT EXISTS territories (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, boundaries JSONB DEFAULT '{}', assigned_to UUID, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS three_way_matches (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), purchase_order_id UUID NOT NULL, receipt_id UUID, invoice_id UUID, status TEXT DEFAULT 'pending', matched_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());

-- TICKET SALES & TIMESHEET
CREATE TABLE IF NOT EXISTS ticket_sales (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID NOT NULL, ticket_type_id UUID, quantity INTEGER, total_amount DECIMAL, sale_date DATE, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS timesheet_breaks (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), timesheet_id UUID NOT NULL, break_type TEXT, start_time TIMESTAMPTZ, end_time TIMESTAMPTZ, duration_minutes INTEGER, created_at TIMESTAMPTZ DEFAULT now());

-- TIPS & TRAINING
CREATE TABLE IF NOT EXISTS tips (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, event_id UUID, amount DECIMAL NOT NULL, source TEXT, received_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS training_categories (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, description TEXT, parent_id UUID, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS training_completions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, training_id UUID NOT NULL, completed_at TIMESTAMPTZ DEFAULT now(), score DECIMAL, certificate_url TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS training_programs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, description TEXT, modules JSONB DEFAULT '[]', duration_hours INTEGER, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS training_quiz_results (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, quiz_id UUID NOT NULL, score DECIMAL, passed BOOLEAN, completed_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS training_quizzes (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), training_id UUID NOT NULL, title TEXT NOT NULL, questions JSONB DEFAULT '[]', passing_score DECIMAL DEFAULT 70, created_at TIMESTAMPTZ DEFAULT now());

-- TRANSACTIONS & TRANSLATIONS
CREATE TABLE IF NOT EXISTS transactions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, transaction_type TEXT NOT NULL, amount DECIMAL NOT NULL, currency TEXT DEFAULT 'USD', reference TEXT, status TEXT DEFAULT 'completed', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS translated_content (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), content_type TEXT NOT NULL, content_id UUID NOT NULL, language_code TEXT NOT NULL, field_name TEXT NOT NULL, translated_value TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS translations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), key TEXT NOT NULL, language_code TEXT NOT NULL, value TEXT NOT NULL, context TEXT, created_at TIMESTAMPTZ DEFAULT now());

-- TRANSPORTATION & TROUBLESHOOTING
CREATE TABLE IF NOT EXISTS transportation_providers (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, provider_type TEXT, contact_email TEXT, contact_phone TEXT, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS troubleshooting_guides (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, title TEXT NOT NULL, category TEXT, content TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS troubleshooting_steps (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), guide_id UUID NOT NULL, step_number INTEGER, title TEXT, description TEXT, created_at TIMESTAMPTZ DEFAULT now());

-- TRUCK & TYPING
CREATE TABLE IF NOT EXISTS truck_assignments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), truck_id UUID NOT NULL, event_id UUID, project_id UUID, driver_id UUID, assigned_date DATE, status TEXT DEFAULT 'assigned', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS typing_indicators (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), conversation_id UUID NOT NULL, user_id UUID NOT NULL, is_typing BOOLEAN DEFAULT false, updated_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());

-- UI TRANSLATIONS & UNION
CREATE TABLE IF NOT EXISTS ui_translations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), key TEXT NOT NULL, language_code TEXT NOT NULL, value TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS union_compliance (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, union_id UUID, compliance_type TEXT, status TEXT DEFAULT 'compliant', last_verified DATE, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS union_contacts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), union_id UUID NOT NULL, contact_name TEXT, contact_role TEXT, email TEXT, phone TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS union_crew_assignments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), crew_member_id UUID NOT NULL, union_id UUID NOT NULL, local_number TEXT, membership_status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS union_locals (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), union_id UUID NOT NULL, local_number TEXT NOT NULL, name TEXT, jurisdiction TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS union_rules (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), union_id UUID NOT NULL, rule_type TEXT, description TEXT, effective_date DATE, created_at TIMESTAMPTZ DEFAULT now());

-- USER EXTENDED
CREATE TABLE IF NOT EXISTS user_bookmarks (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, entity_type TEXT NOT NULL, entity_id UUID NOT NULL, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS user_contributions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, contribution_type TEXT, content TEXT, entity_type TEXT, entity_id UUID, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS user_devices (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, device_type TEXT, device_token TEXT, platform TEXT, last_active TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS user_invitations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, email TEXT NOT NULL, role TEXT, invited_by UUID, token TEXT UNIQUE, expires_at TIMESTAMPTZ, accepted_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS user_languages (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, language_code TEXT NOT NULL, proficiency_level TEXT DEFAULT 'native', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS user_locations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, latitude DECIMAL, longitude DECIMAL, accuracy DECIMAL, recorded_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS user_organizations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, organization_id UUID NOT NULL, role TEXT DEFAULT 'member', joined_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS user_presence (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID UNIQUE NOT NULL, status TEXT DEFAULT 'offline', last_seen TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS user_rewards (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, reward_id UUID NOT NULL, redeemed_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS user_roles (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, role_id UUID NOT NULL, assigned_at TIMESTAMPTZ DEFAULT now(), assigned_by UUID, created_at TIMESTAMPTZ DEFAULT now());

-- VARIANT & VEHICLE
CREATE TABLE IF NOT EXISTS variant_inventory (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), variant_id UUID NOT NULL, location_id UUID, quantity INTEGER DEFAULT 0, reserved INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS vehicle_passes (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID, vehicle_type TEXT, license_plate TEXT, driver_name TEXT, access_level TEXT, valid_from TIMESTAMPTZ, valid_until TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());

-- VENDOR EXTENDED
CREATE TABLE IF NOT EXISTS vendor_activity_log (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), vendor_id UUID NOT NULL, action TEXT NOT NULL, performed_by UUID, details JSONB DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS vendor_bids (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), vendor_id UUID NOT NULL, opportunity_id UUID NOT NULL, bid_amount DECIMAL, status TEXT DEFAULT 'submitted', submitted_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS vendor_booth_sales (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), booth_id UUID NOT NULL, sale_date DATE, gross_sales DECIMAL, net_sales DECIMAL, items_sold INTEGER, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS vendor_booths (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID NOT NULL, vendor_id UUID, booth_number TEXT, location TEXT, size TEXT, rental_fee DECIMAL, status TEXT DEFAULT 'available', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS vendor_communications (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), vendor_id UUID NOT NULL, communication_type TEXT, subject TEXT, content TEXT, sent_by UUID, sent_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS vendor_comparisons (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, comparison_name TEXT, vendors JSONB DEFAULT '[]', criteria JSONB DEFAULT '[]', created_by UUID, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS vendor_compliance_documents (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), vendor_id UUID NOT NULL, document_type TEXT, file_url TEXT, expiry_date DATE, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS vendor_deliveries (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), vendor_id UUID NOT NULL, purchase_order_id UUID, delivery_date DATE, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS vendor_documentation (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), vendor_id UUID NOT NULL, document_type TEXT, title TEXT, file_url TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS vendor_onboarding_checklist (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), vendor_id UUID NOT NULL, checklist_items JSONB DEFAULT '[]', completed_items INTEGER DEFAULT 0, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS vendor_onboarding_requests (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, vendor_name TEXT, contact_email TEXT, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS vendor_payment_terms (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), vendor_id UUID UNIQUE NOT NULL, payment_terms TEXT, net_days INTEGER DEFAULT 30, discount_percentage DECIMAL, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS vendor_payments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), vendor_id UUID NOT NULL, invoice_id UUID, amount DECIMAL NOT NULL, payment_date DATE, payment_method TEXT, reference TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS vendor_profiles (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), vendor_id UUID UNIQUE NOT NULL, description TEXT, capabilities JSONB DEFAULT '[]', certifications JSONB DEFAULT '[]', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS vendor_qualification_criteria (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, criterion_name TEXT NOT NULL, weight DECIMAL DEFAULT 1, description TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS vendor_qualification_evaluations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), vendor_id UUID NOT NULL, evaluator_id UUID, scores JSONB DEFAULT '{}', overall_score DECIMAL, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS vendor_rate_cards (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), vendor_id UUID NOT NULL, service_type TEXT, rates JSONB DEFAULT '{}', effective_date DATE, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS vendor_scores (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), vendor_id UUID NOT NULL, score_type TEXT, score DECIMAL, period_start DATE, period_end DATE, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS vendor_selections (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), opportunity_id UUID NOT NULL, vendor_id UUID NOT NULL, selected_by UUID, selection_reason TEXT, selected_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());

-- VENUE EXTENDED & VERIFICATION
CREATE TABLE IF NOT EXISTS venue_holds (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), venue_id UUID NOT NULL, held_by UUID, hold_start DATE, hold_end DATE, purpose TEXT, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS verification_badges (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, badge_type TEXT NOT NULL, verified_at TIMESTAMPTZ DEFAULT now(), expires_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS verification_requests (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, verification_type TEXT, status TEXT DEFAULT 'pending', submitted_at TIMESTAMPTZ DEFAULT now(), reviewed_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());

-- VIDEO & VIP
CREATE TABLE IF NOT EXISTS video_interviews (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), candidate_id UUID NOT NULL, position TEXT, video_url TEXT, duration_seconds INTEGER, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS video_io (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID, io_type TEXT, source TEXT, destination TEXT, signal_type TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS vip_guests (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID NOT NULL, guest_name TEXT NOT NULL, company TEXT, access_level TEXT, notes TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS virtual_queues (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID, queue_name TEXT NOT NULL, max_capacity INTEGER, current_count INTEGER DEFAULT 0, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());

-- WALKTHROUGH & WAREHOUSE
CREATE TABLE IF NOT EXISTS walkthrough_approvals (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), walkthrough_id UUID NOT NULL, approver_id UUID NOT NULL, status TEXT DEFAULT 'pending', approved_at TIMESTAMPTZ, comments TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS walkthrough_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), walkthrough_id UUID NOT NULL, item_type TEXT, description TEXT, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS warehouse_connections (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, warehouse_name TEXT NOT NULL, provider TEXT, api_credentials JSONB DEFAULT '{}', status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS warehouse_zones (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), warehouse_id UUID NOT NULL, zone_name TEXT NOT NULL, zone_type TEXT, capacity INTEGER, created_at TIMESTAMPTZ DEFAULT now());

-- WASTE & WORKERS COMP
CREATE TABLE IF NOT EXISTS waste_disposal (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID, disposal_type TEXT, quantity DECIMAL, unit TEXT, disposal_date DATE, vendor_id UUID, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS workers_comp_claims (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), employee_id UUID NOT NULL, incident_date DATE, injury_type TEXT, description TEXT, status TEXT DEFAULT 'open', claim_amount DECIMAL, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS workers_comp_payments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), claim_id UUID NOT NULL, payment_type TEXT, amount DECIMAL NOT NULL, payment_date DATE, created_at TIMESTAMPTZ DEFAULT now());

-- WORKFLOW EXTENDED
CREATE TABLE IF NOT EXISTS workflow_actions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), workflow_id UUID NOT NULL, action_type TEXT NOT NULL, action_config JSONB DEFAULT '{}', execution_order INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS workflow_execution_steps (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), execution_id UUID NOT NULL, step_number INTEGER, action_type TEXT, status TEXT DEFAULT 'pending', started_at TIMESTAMPTZ, completed_at TIMESTAMPTZ, result JSONB DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS workflow_tasks (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), workflow_id UUID NOT NULL, task_name TEXT NOT NULL, assigned_to UUID, due_date TIMESTAMPTZ, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS workflow_triggers (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), workflow_id UUID NOT NULL, trigger_type TEXT NOT NULL, trigger_config JSONB DEFAULT '{}', is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now());

-- WORKFORCE & ZONE
CREATE TABLE IF NOT EXISTS workforce_employees (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, employee_id TEXT, full_name TEXT NOT NULL, department TEXT, status TEXT DEFAULT 'active', synced_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS zone_counts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), zone_id UUID NOT NULL, event_id UUID, count INTEGER DEFAULT 0, max_capacity INTEGER, recorded_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_contacts_org ON contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_deals_org ON deals(organization_id);
CREATE INDEX IF NOT EXISTS idx_employee_credentials_emp ON employee_credentials(employee_id);
CREATE INDEX IF NOT EXISTS idx_event_attendance_event ON event_attendance(event_id);
CREATE INDEX IF NOT EXISTS idx_expenses_org ON expenses(organization_id);
CREATE INDEX IF NOT EXISTS idx_issues_org ON issues(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_user ON user_organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_vendor_booths_event ON vendor_booths(event_id);
