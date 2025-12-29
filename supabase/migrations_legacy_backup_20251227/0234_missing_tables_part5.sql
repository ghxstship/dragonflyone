-- Migration: 0234_missing_tables_part5.sql
-- Purpose: Create remaining missing tables (Part 5 - Final)
-- Date: December 15, 2025

-- BILL & CATERING
CREATE TABLE IF NOT EXISTS bill_activity_log (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), bill_id UUID NOT NULL, action TEXT NOT NULL, performed_by UUID, details JSONB DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS bill_payments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), bill_id UUID NOT NULL, amount DECIMAL NOT NULL, payment_method TEXT, payment_date DATE, reference TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS catering_vendors (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, cuisine_type TEXT, contact_name TEXT, email TEXT, phone TEXT, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());

-- CHANNEL & CHAT
CREATE TABLE IF NOT EXISTS channel_members (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), channel_id UUID NOT NULL, user_id UUID NOT NULL, role TEXT DEFAULT 'member', joined_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS channel_messages (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), channel_id UUID NOT NULL, sender_id UUID NOT NULL, content TEXT, message_type TEXT DEFAULT 'text', attachments JSONB DEFAULT '[]', sent_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS chat_room_members (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), chat_room_id UUID NOT NULL, user_id UUID NOT NULL, role TEXT DEFAULT 'member', joined_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS chat_rooms (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT, room_type TEXT DEFAULT 'direct', created_by UUID, metadata JSONB DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now());

-- CHECKOUT & CLIENT
CREATE TABLE IF NOT EXISTS checkout_configuration (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, event_id UUID, payment_methods JSONB DEFAULT '[]', fees JSONB DEFAULT '{}', is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS client_churn_records (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), client_id UUID NOT NULL, churned_at TIMESTAMPTZ DEFAULT now(), reason TEXT, feedback TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS client_invoices (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, client_id UUID NOT NULL, invoice_number TEXT, issue_date DATE, due_date DATE, total_amount DECIMAL DEFAULT 0, status TEXT DEFAULT 'draft', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS client_onboarding (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), client_id UUID NOT NULL, status TEXT DEFAULT 'pending', steps_completed JSONB DEFAULT '[]', assigned_to UUID, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS client_payments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), client_id UUID NOT NULL, invoice_id UUID, amount DECIMAL NOT NULL, payment_method TEXT, payment_date DATE, status TEXT DEFAULT 'completed', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS client_requirements (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), client_id UUID NOT NULL, project_id UUID, requirement_type TEXT, description TEXT, priority TEXT DEFAULT 'medium', status TEXT DEFAULT 'open', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS client_walkthroughs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), client_id UUID NOT NULL, venue_id UUID, scheduled_date TIMESTAMPTZ, status TEXT DEFAULT 'scheduled', notes TEXT, created_at TIMESTAMPTZ DEFAULT now());

-- CLOCK & CODE
CREATE TABLE IF NOT EXISTS clock_events (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, event_type TEXT NOT NULL, timestamp TIMESTAMPTZ DEFAULT now(), location TEXT, notes TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS code_regulations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, code_type TEXT NOT NULL, title TEXT NOT NULL, description TEXT, jurisdiction TEXT, effective_date DATE, created_at TIMESTAMPTZ DEFAULT now());

-- COI & COLLABORATOR
CREATE TABLE IF NOT EXISTS coi_renewal_requests (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), coi_id UUID NOT NULL, requested_by UUID, requested_at TIMESTAMPTZ DEFAULT now(), status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS coi_requirements (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, requirement_type TEXT, min_coverage DECIMAL, description TEXT, is_required BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS coi_verifications (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), coi_id UUID NOT NULL, verified_by UUID, verified_at TIMESTAMPTZ DEFAULT now(), status TEXT DEFAULT 'verified', notes TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS collaborator_permissions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), document_id UUID NOT NULL, user_id UUID NOT NULL, permission_level TEXT DEFAULT 'view', granted_by UUID, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS collection_activities (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), invoice_id UUID NOT NULL, activity_type TEXT NOT NULL, notes TEXT, performed_by UUID, created_at TIMESTAMPTZ DEFAULT now());

-- COMMISSION & COMMUNICATION
CREATE TABLE IF NOT EXISTS commissions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, salesperson_id UUID NOT NULL, deal_id UUID, amount DECIMAL NOT NULL, percentage DECIMAL, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS communication_acknowledgments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), communication_id UUID NOT NULL, user_id UUID NOT NULL, acknowledged_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());

-- COMPANY & COMPENSATION
CREATE TABLE IF NOT EXISTS company_policies (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, title TEXT NOT NULL, category TEXT, content TEXT, version TEXT, effective_date DATE, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS compensation_adjustments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), employee_id UUID NOT NULL, adjustment_type TEXT NOT NULL, previous_amount DECIMAL, new_amount DECIMAL, effective_date DATE, reason TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS compensation_plan_entries (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), plan_id UUID NOT NULL, tier TEXT, base_rate DECIMAL, commission_rate DECIMAL, bonus_structure JSONB DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS compensation_plans (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, description TEXT, plan_type TEXT, effective_date DATE, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS compensation_records (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), employee_id UUID NOT NULL, record_type TEXT NOT NULL, amount DECIMAL NOT NULL, period_start DATE, period_end DATE, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());

-- COMPETITOR & COMPLIANCE
CREATE TABLE IF NOT EXISTS competitor_analyses (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, competitor_name TEXT NOT NULL, analysis_type TEXT, findings JSONB DEFAULT '{}', analyzed_by UUID, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS compliance_courses (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, title TEXT NOT NULL, description TEXT, content_url TEXT, duration_minutes INTEGER, is_required BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS compliance_document_requests (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, vendor_id UUID, document_type TEXT NOT NULL, requested_by UUID, due_date DATE, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());

-- COMPONENT
CREATE TABLE IF NOT EXISTS component_service_history (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), component_id UUID NOT NULL, service_type TEXT NOT NULL, description TEXT, performed_by TEXT, performed_at TIMESTAMPTZ, cost DECIMAL, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS component_transfers (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), component_id UUID NOT NULL, from_asset_id UUID, to_asset_id UUID, transferred_by UUID, transferred_at TIMESTAMPTZ DEFAULT now(), reason TEXT, created_at TIMESTAMPTZ DEFAULT now());

-- CONTINGENCY & CONTINUITY
CREATE TABLE IF NOT EXISTS contingencies (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID, project_id UUID, contingency_type TEXT NOT NULL, description TEXT, trigger_conditions TEXT, response_plan TEXT, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS contingency_triggers (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), contingency_id UUID NOT NULL, triggered_by UUID, triggered_at TIMESTAMPTZ DEFAULT now(), reason TEXT, actions_taken TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS continuity_incidents (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, incident_type TEXT NOT NULL, severity TEXT DEFAULT 'medium', description TEXT, occurred_at TIMESTAMPTZ, resolved_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS continuity_plans (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, description TEXT, plan_type TEXT, procedures JSONB DEFAULT '[]', status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());

-- CONTRACT
CREATE TABLE IF NOT EXISTS contract_line_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), contract_id UUID NOT NULL, description TEXT NOT NULL, quantity DECIMAL DEFAULT 1, unit_price DECIMAL, total DECIMAL, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS contract_negotiations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), contract_id UUID NOT NULL, round_number INTEGER DEFAULT 1, proposed_terms JSONB DEFAULT '{}', status TEXT DEFAULT 'pending', negotiated_by UUID, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS contract_renewals (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), contract_id UUID NOT NULL, renewal_date DATE, new_end_date DATE, new_terms JSONB DEFAULT '{}', status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS contract_versions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), contract_id UUID NOT NULL, version_number INTEGER NOT NULL, document_url TEXT, changes_summary TEXT, created_by UUID, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS contractor_payments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), contractor_id UUID NOT NULL, project_id UUID, amount DECIMAL NOT NULL, payment_type TEXT, payment_date DATE, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());

-- CONTRIBUTION & COST
CREATE TABLE IF NOT EXISTS contribution_votes (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), contribution_id UUID NOT NULL, user_id UUID NOT NULL, vote_type TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS cost_allocations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, cost_id UUID NOT NULL, department_id UUID, project_id UUID, percentage DECIMAL, amount DECIMAL, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS cost_codes (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, code TEXT NOT NULL, name TEXT NOT NULL, description TEXT, category TEXT, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS cost_pools (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, description TEXT, total_amount DECIMAL DEFAULT 0, allocation_method TEXT, created_at TIMESTAMPTZ DEFAULT now());

-- CREDENTIAL & CREDIT
CREATE TABLE IF NOT EXISTS credential_reminders (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), credential_id UUID NOT NULL, reminder_date DATE, sent BOOLEAN DEFAULT false, sent_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS credential_renewals (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), credential_id UUID NOT NULL, renewal_date DATE, new_expiry_date DATE, renewal_cost DECIMAL, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS credit_card_accounts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, card_name TEXT NOT NULL, last_four TEXT, card_type TEXT, credit_limit DECIMAL, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS credit_card_transactions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), card_id UUID NOT NULL, transaction_date DATE, merchant TEXT, amount DECIMAL NOT NULL, category TEXT, receipt_url TEXT, created_at TIMESTAMPTZ DEFAULT now());

-- CREW EXTENDED
CREATE TABLE IF NOT EXISTS crew_activity_feed (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), crew_member_id UUID NOT NULL, activity_type TEXT NOT NULL, description TEXT, metadata JSONB DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS crew_badges (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), crew_member_id UUID NOT NULL, badge_type TEXT NOT NULL, badge_name TEXT, awarded_at TIMESTAMPTZ DEFAULT now(), awarded_by UUID, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS crew_blackout_dates (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), crew_member_id UUID NOT NULL, start_date DATE NOT NULL, end_date DATE NOT NULL, reason TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS crew_feedback (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), crew_member_id UUID NOT NULL, project_id UUID, feedback_type TEXT, content TEXT, rating INTEGER, given_by UUID, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS crew_kudos (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), from_user_id UUID NOT NULL, to_crew_member_id UUID NOT NULL, message TEXT, category TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS crew_performance_goals (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), crew_member_id UUID NOT NULL, goal_type TEXT, description TEXT, target_date DATE, status TEXT DEFAULT 'active', progress INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS crew_performance_summary (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), crew_member_id UUID NOT NULL, period_start DATE, period_end DATE, total_projects INTEGER DEFAULT 0, avg_rating DECIMAL, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS crew_photos (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), crew_member_id UUID NOT NULL, photo_type TEXT DEFAULT 'profile', file_url TEXT NOT NULL, is_primary BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS crew_posts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), crew_member_id UUID NOT NULL, content TEXT, post_type TEXT DEFAULT 'update', attachments JSONB DEFAULT '[]', likes_count INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS crew_roster_entries (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), roster_id UUID NOT NULL, crew_member_id UUID NOT NULL, role TEXT, shift_start TIMESTAMPTZ, shift_end TIMESTAMPTZ, status TEXT DEFAULT 'scheduled', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS crew_rosters (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID, project_id UUID, name TEXT NOT NULL, date DATE, status TEXT DEFAULT 'draft', created_by UUID, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS crew_skill_endorsements (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), crew_member_id UUID NOT NULL, skill TEXT NOT NULL, endorsed_by UUID NOT NULL, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS crew_workspaces (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, description TEXT, owner_id UUID, members JSONB DEFAULT '[]', settings JSONB DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now());

-- CURFEW & CUSTOM
CREATE TABLE IF NOT EXISTS curfew_alerts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID, venue_id UUID, curfew_time TIME, alert_time TIMESTAMPTZ, acknowledged BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS custom_dashboards (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, name TEXT NOT NULL, layout JSONB DEFAULT '{}', widgets JSONB DEFAULT '[]', is_default BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS customization_templates (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, template_type TEXT NOT NULL, name TEXT NOT NULL, configuration JSONB DEFAULT '{}', is_default BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now());

-- DAMAGE
CREATE TABLE IF NOT EXISTS damage_assessments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), asset_id UUID, equipment_id UUID, assessed_by UUID, assessment_date DATE, damage_type TEXT, severity TEXT DEFAULT 'minor', repair_estimate DECIMAL, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS damage_photos (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), damage_report_id UUID NOT NULL, file_url TEXT NOT NULL, caption TEXT, taken_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS damage_reports (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), asset_id UUID, equipment_id UUID, event_id UUID, reported_by UUID, damage_type TEXT NOT NULL, description TEXT, severity TEXT DEFAULT 'minor', repair_status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());

-- DATA & DEAL
CREATE TABLE IF NOT EXISTS data_export_jobs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, export_type TEXT NOT NULL, filters JSONB DEFAULT '{}', format TEXT DEFAULT 'csv', status TEXT DEFAULT 'pending', file_url TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS data_exports (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, export_type TEXT NOT NULL, file_url TEXT, file_size INTEGER, record_count INTEGER, created_by UUID, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS deal_stage_history (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), deal_id UUID NOT NULL, from_stage TEXT, to_stage TEXT, changed_by UUID, changed_at TIMESTAMPTZ DEFAULT now(), notes TEXT, created_at TIMESTAMPTZ DEFAULT now());

-- DEBRIEF & DEFERRED
CREATE TABLE IF NOT EXISTS debrief_attendees (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), debrief_id UUID NOT NULL, user_id UUID NOT NULL, attended BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS debrief_notes (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), debrief_id UUID NOT NULL, topic TEXT, content TEXT, action_items JSONB DEFAULT '[]', recorded_by UUID, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS debriefs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID, project_id UUID, scheduled_at TIMESTAMPTZ, status TEXT DEFAULT 'scheduled', summary TEXT, lessons_learned JSONB DEFAULT '[]', created_by UUID, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS deferred_revenue_milestones (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), deferred_revenue_id UUID NOT NULL, milestone_date DATE, amount DECIMAL NOT NULL, description TEXT, recognized BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now());

-- DELIVERY & DEPARTMENT
CREATE TABLE IF NOT EXISTS deliveries (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), order_id UUID, purchase_order_id UUID, delivery_date DATE, carrier TEXT, tracking_number TEXT, status TEXT DEFAULT 'pending', received_by UUID, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS delivery_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), delivery_id UUID NOT NULL, item_description TEXT, quantity_expected INTEGER, quantity_received INTEGER, condition TEXT DEFAULT 'good', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS department_groups (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, description TEXT, departments JSONB DEFAULT '[]', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS departments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, code TEXT, description TEXT, parent_id UUID, manager_id UUID, budget DECIMAL, created_at TIMESTAMPTZ DEFAULT now());

-- DEPRECIATION & DEVELOPMENT
CREATE TABLE IF NOT EXISTS depreciation_entries (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), asset_id UUID NOT NULL, entry_date DATE, amount DECIMAL NOT NULL, accumulated_depreciation DECIMAL, book_value DECIMAL, method TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS development_plans (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), employee_id UUID NOT NULL, plan_type TEXT, goals JSONB DEFAULT '[]', milestones JSONB DEFAULT '[]', mentor_id UUID, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());

-- DIRECTORY & DOCUMENT EXTENDED
CREATE TABLE IF NOT EXISTS directory_entries (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, entry_type TEXT NOT NULL, name TEXT NOT NULL, email TEXT, phone TEXT, department TEXT, is_public BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS document_acknowledgments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), document_id UUID NOT NULL, user_id UUID NOT NULL, acknowledged_at TIMESTAMPTZ DEFAULT now(), ip_address TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS document_audit_trail (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), document_id UUID NOT NULL, action TEXT NOT NULL, performed_by UUID, details JSONB DEFAULT '{}', ip_address TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS document_fields (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), document_id UUID NOT NULL, field_name TEXT NOT NULL, field_type TEXT, field_value TEXT, required BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS document_signers (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), document_id UUID NOT NULL, signer_email TEXT NOT NULL, signer_name TEXT, sign_order INTEGER DEFAULT 1, status TEXT DEFAULT 'pending', signed_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS document_subscriptions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), document_id UUID NOT NULL, user_id UUID NOT NULL, notification_type TEXT DEFAULT 'all', created_at TIMESTAMPTZ DEFAULT now());

-- DRONE
CREATE TABLE IF NOT EXISTS drone_captures (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), drone_id UUID, flight_id UUID, capture_type TEXT, file_url TEXT, thumbnail_url TEXT, location JSONB, captured_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS drone_documentation (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), drone_id UUID NOT NULL, document_type TEXT NOT NULL, title TEXT, file_url TEXT, expiry_date DATE, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS drone_flight_paths (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), flight_id UUID NOT NULL, waypoints JSONB DEFAULT '[]', altitude_profile JSONB DEFAULT '[]', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS drone_flight_zones (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, zone_name TEXT NOT NULL, zone_type TEXT, boundaries JSONB DEFAULT '{}', restrictions JSONB DEFAULT '{}', is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS drone_flights (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), drone_id UUID NOT NULL, pilot_id UUID NOT NULL, event_id UUID, flight_start TIMESTAMPTZ, flight_end TIMESTAMPTZ, duration_minutes INTEGER, purpose TEXT, status TEXT DEFAULT 'planned', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS drone_pilots (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID, license_number TEXT, license_type TEXT, license_expiry DATE, certifications JSONB DEFAULT '[]', flight_hours INTEGER DEFAULT 0, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS drones (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, model TEXT, serial_number TEXT, registration_number TEXT, status TEXT DEFAULT 'available', total_flight_time INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now());

-- DYNAMIC & EARLY BIRD
CREATE TABLE IF NOT EXISTS dynamic_pricing_rules (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, event_id UUID, rule_name TEXT NOT NULL, rule_type TEXT, conditions JSONB DEFAULT '{}', price_adjustment JSONB DEFAULT '{}', is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS early_bird_campaigns (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID NOT NULL, name TEXT NOT NULL, discount_type TEXT, discount_value DECIMAL, start_date TIMESTAMPTZ, end_date TIMESTAMPTZ, max_uses INTEGER, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());

-- ELIMINATION & EMAIL
CREATE TABLE IF NOT EXISTS elimination_details (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), elimination_id UUID NOT NULL, entry_id UUID, entry_type TEXT, amount DECIMAL, description TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS email_list_subscribers (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), list_id UUID NOT NULL, email TEXT NOT NULL, first_name TEXT, last_name TEXT, status TEXT DEFAULT 'subscribed', subscribed_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS email_lists (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, description TEXT, subscriber_count INTEGER DEFAULT 0, is_public BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS email_queue (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), to_email TEXT NOT NULL, from_email TEXT, subject TEXT, body TEXT, template_id UUID, variables JSONB DEFAULT '{}', status TEXT DEFAULT 'pending', sent_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());

-- EMERGENCY & EMPLOYEE EXTENDED
CREATE TABLE IF NOT EXISTS emergency_notifications (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, event_id UUID, notification_type TEXT NOT NULL, message TEXT NOT NULL, recipients JSONB DEFAULT '[]', sent_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS emergency_procedures (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, venue_id UUID, procedure_type TEXT NOT NULL, title TEXT NOT NULL, steps JSONB DEFAULT '[]', contacts JSONB DEFAULT '[]', status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS employee_acknowledgments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), employee_id UUID NOT NULL, document_id UUID, policy_id UUID, acknowledged_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS employee_payroll_settings (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), employee_id UUID UNIQUE NOT NULL, pay_frequency TEXT DEFAULT 'bi_weekly', pay_method TEXT DEFAULT 'direct_deposit', tax_withholdings JSONB DEFAULT '{}', deductions JSONB DEFAULT '[]', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS employee_referrals (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), referrer_id UUID NOT NULL, referred_name TEXT NOT NULL, referred_email TEXT, position TEXT, status TEXT DEFAULT 'pending', hired_at TIMESTAMPTZ, bonus_paid BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS employee_skills (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), employee_id UUID NOT NULL, skill_name TEXT NOT NULL, proficiency_level TEXT DEFAULT 'intermediate', years_experience INTEGER, verified BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS employee_workflows (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), employee_id UUID NOT NULL, workflow_type TEXT NOT NULL, status TEXT DEFAULT 'pending', steps_completed JSONB DEFAULT '[]', started_at TIMESTAMPTZ DEFAULT now(), completed_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());

-- ENCORES & EQUIPMENT EXTENDED
CREATE TABLE IF NOT EXISTS encores (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID NOT NULL, artist_id UUID, scheduled_time TIMESTAMPTZ, actual_time TIMESTAMPTZ, duration_minutes INTEGER, setlist JSONB DEFAULT '[]', performed BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS equipment_assignments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), equipment_id UUID NOT NULL, event_id UUID, project_id UUID, assigned_to UUID, assigned_at TIMESTAMPTZ DEFAULT now(), return_date TIMESTAMPTZ, status TEXT DEFAULT 'assigned', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS equipment_certifications (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), equipment_id UUID NOT NULL, certification_type TEXT NOT NULL, certification_date DATE, expiry_date DATE, certificate_url TEXT, certified_by TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS equipment_favorites (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, equipment_id UUID NOT NULL, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS equipment_manuals (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), equipment_id UUID NOT NULL, manual_type TEXT, title TEXT, file_url TEXT, language TEXT DEFAULT 'en', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS equipment_returns (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), equipment_id UUID NOT NULL, assignment_id UUID, returned_by UUID, returned_at TIMESTAMPTZ DEFAULT now(), condition TEXT, notes TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS equipment_spec_corrections (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), spec_id UUID NOT NULL, old_value TEXT, new_value TEXT, corrected_by UUID, reason TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS equipment_spec_requests (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID, project_id UUID, equipment_type TEXT NOT NULL, specifications JSONB DEFAULT '{}', quantity INTEGER DEFAULT 1, requested_by UUID, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());

-- EQUITY & ETL
CREATE TABLE IF NOT EXISTS equity_grants (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, employee_id UUID NOT NULL, grant_type TEXT NOT NULL, shares INTEGER, strike_price DECIMAL, grant_date DATE, vesting_start DATE, vesting_schedule JSONB DEFAULT '{}', status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS etl_pipelines (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, source_type TEXT, destination_type TEXT, configuration JSONB DEFAULT '{}', schedule TEXT, last_run TIMESTAMPTZ, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());

-- EVENT EXTENDED
CREATE TABLE IF NOT EXISTS event_age_requirements (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID NOT NULL, min_age INTEGER, max_age INTEGER, verification_required BOOLEAN DEFAULT false, notes TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS event_age_restrictions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID NOT NULL, restriction_type TEXT NOT NULL, min_age INTEGER, requires_id BOOLEAN DEFAULT true, description TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS event_currency_prices (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID NOT NULL, ticket_type_id UUID, currency TEXT NOT NULL, price DECIMAL NOT NULL, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS event_landing_pages (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID NOT NULL, slug TEXT UNIQUE, title TEXT, content JSONB DEFAULT '{}', seo_metadata JSONB DEFAULT '{}', is_published BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS event_listings (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID NOT NULL, platform TEXT NOT NULL, external_id TEXT, listing_url TEXT, status TEXT DEFAULT 'pending', listed_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS event_performers (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID NOT NULL, artist_id UUID, performer_name TEXT, performance_type TEXT, set_order INTEGER, set_time TIMESTAMPTZ, stage TEXT, status TEXT DEFAULT 'confirmed', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS event_playlists (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID NOT NULL, name TEXT NOT NULL, platform TEXT, playlist_url TEXT, tracks JSONB DEFAULT '[]', is_public BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS event_seating (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID NOT NULL, venue_id UUID, seating_type TEXT, sections JSONB DEFAULT '[]', total_capacity INTEGER, reserved_capacity INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS event_settlements (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID NOT NULL, settlement_type TEXT, gross_revenue DECIMAL DEFAULT 0, deductions JSONB DEFAULT '[]', net_amount DECIMAL DEFAULT 0, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS event_videos (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID NOT NULL, video_type TEXT, title TEXT, video_url TEXT, thumbnail_url TEXT, duration_seconds INTEGER, is_public BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now());

-- EXCHANGE & EXPENSE EXTENDED
CREATE TABLE IF NOT EXISTS exchange_rates (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), from_currency TEXT NOT NULL, to_currency TEXT NOT NULL, rate DECIMAL NOT NULL, effective_date DATE NOT NULL, source TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS expense_activity_log (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), expense_id UUID NOT NULL, action TEXT NOT NULL, performed_by UUID, details JSONB DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS expense_approvals (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), expense_id UUID NOT NULL, approver_id UUID NOT NULL, status TEXT DEFAULT 'pending', comments TEXT, approved_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());

-- EXPERIENCE
CREATE TABLE IF NOT EXISTS experience_blueprints (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, description TEXT, blueprint_type TEXT, configuration JSONB DEFAULT '{}', is_template BOOLEAN DEFAULT false, created_by UUID, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS experience_listings (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, title TEXT NOT NULL, description TEXT, experience_type TEXT, duration_minutes INTEGER, price DECIMAL, max_participants INTEGER, status TEXT DEFAULT 'draft', created_at TIMESTAMPTZ DEFAULT now());

-- FAQ & FINAL
CREATE TABLE IF NOT EXISTS faqs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, event_id UUID, category TEXT, question TEXT NOT NULL, answer TEXT NOT NULL, sort_order INTEGER DEFAULT 0, is_published BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS final_inspections (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID, project_id UUID, inspection_type TEXT, inspector_id UUID, inspection_date TIMESTAMPTZ, checklist JSONB DEFAULT '[]', findings JSONB DEFAULT '[]', status TEXT DEFAULT 'pending', approved BOOLEAN, created_at TIMESTAMPTZ DEFAULT now());

-- FINANCE
CREATE TABLE IF NOT EXISTS finance_expense_categories (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, code TEXT, parent_id UUID, gl_account TEXT, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS finance_purchase_orders (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, po_number TEXT, vendor_id UUID, department_id UUID, total_amount DECIMAL DEFAULT 0, status TEXT DEFAULT 'draft', approved_by UUID, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS financial_accounts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, account_number TEXT NOT NULL, account_name TEXT NOT NULL, account_type TEXT NOT NULL, currency TEXT DEFAULT 'USD', balance DECIMAL DEFAULT 0, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now());

-- FORUM & FREELANCER EXTENDED
CREATE TABLE IF NOT EXISTS forum_members (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), forum_id UUID NOT NULL, user_id UUID NOT NULL, role TEXT DEFAULT 'member', joined_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS forums (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, description TEXT, category TEXT, is_public BOOLEAN DEFAULT true, member_count INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS freelancer_bookings (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), freelancer_id UUID NOT NULL, project_id UUID, event_id UUID, start_date DATE, end_date DATE, daily_rate DECIMAL, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS freelancer_ratings (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), freelancer_id UUID NOT NULL, project_id UUID, rated_by UUID, rating INTEGER, review TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS freelancer_skills (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), freelancer_id UUID NOT NULL, skill_name TEXT NOT NULL, proficiency_level TEXT DEFAULT 'intermediate', years_experience INTEGER, created_at TIMESTAMPTZ DEFAULT now());

-- FUNDING & GENERATED
CREATE TABLE IF NOT EXISTS funding_sources (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, source_type TEXT, amount DECIMAL, terms JSONB DEFAULT '{}', status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS ga_floor_configs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), venue_id UUID, event_id UUID, config_name TEXT, capacity INTEGER, sections JSONB DEFAULT '[]', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS generated_blueprints (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, blueprint_type TEXT, configuration JSONB DEFAULT '{}', file_url TEXT, created_by UUID, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS generated_manifests (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID, project_id UUID, manifest_type TEXT, content JSONB DEFAULT '{}', file_url TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS generated_pdfs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), source_type TEXT, source_id UUID, template TEXT, file_url TEXT, generated_by UUID, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS generated_reports (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, report_type TEXT NOT NULL, parameters JSONB DEFAULT '{}', file_url TEXT, generated_by UUID, created_at TIMESTAMPTZ DEFAULT now());

-- GL & GLOSSARY
CREATE TABLE IF NOT EXISTS gl_entries (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, account_id UUID NOT NULL, entry_date DATE NOT NULL, debit DECIMAL DEFAULT 0, credit DECIMAL DEFAULT 0, description TEXT, reference TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS glossary_terms (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, term TEXT NOT NULL, definition TEXT NOT NULL, category TEXT, created_at TIMESTAMPTZ DEFAULT now());

-- GOVERNANCE & GRANT
CREATE TABLE IF NOT EXISTS governance_documents (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, document_type TEXT NOT NULL, title TEXT NOT NULL, content TEXT, version TEXT, effective_date DATE, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS grant_expenditures (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), grant_id UUID NOT NULL, expense_id UUID, amount DECIMAL NOT NULL, category TEXT, description TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS grant_receipts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), grant_id UUID NOT NULL, amount DECIMAL NOT NULL, received_date DATE, source TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS grant_reports (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), grant_id UUID NOT NULL, report_type TEXT, report_period TEXT, content JSONB DEFAULT '{}', submitted_at TIMESTAMPTZ, status TEXT DEFAULT 'draft', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS grants (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, grant_name TEXT NOT NULL, grantor TEXT, amount DECIMAL, start_date DATE, end_date DATE, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());

-- GROUND & GROUP
CREATE TABLE IF NOT EXISTS ground_plans (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), venue_id UUID, event_id UUID, plan_type TEXT, file_url TEXT, scale TEXT, created_at TIMESTAMPTZ DEFAULT now());

-- GUEST
CREATE TABLE IF NOT EXISTS guest_artists (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID NOT NULL, artist_name TEXT NOT NULL, performance_type TEXT, scheduled_time TIMESTAMPTZ, status TEXT DEFAULT 'confirmed', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS guest_profiles (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID, full_name TEXT, email TEXT, phone TEXT, preferences JSONB DEFAULT '{}', vip_status BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now());

-- GVTEWAY & HANDBOOK
CREATE TABLE IF NOT EXISTS gvteway_stripe_events (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), stripe_event_id TEXT UNIQUE NOT NULL, event_type TEXT NOT NULL, data JSONB DEFAULT '{}', processed BOOLEAN DEFAULT false, processed_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS gvteway_ticket_types (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID NOT NULL, name TEXT NOT NULL, description TEXT, price DECIMAL NOT NULL, quantity_available INTEGER, sales_start TIMESTAMPTZ, sales_end TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS handbook_versions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, version TEXT NOT NULL, content TEXT, effective_date DATE, created_by UUID, created_at TIMESTAMPTZ DEFAULT now());

-- HOSPITALITY & HR
CREATE TABLE IF NOT EXISTS hospitality_requests (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID, requester_id UUID, request_type TEXT, details JSONB DEFAULT '{}', status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS hr_connections (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, provider TEXT NOT NULL, credentials JSONB DEFAULT '{}', status TEXT DEFAULT 'active', last_sync TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS hr_sync_logs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), connection_id UUID NOT NULL, sync_type TEXT, records_processed INTEGER DEFAULT 0, status TEXT DEFAULT 'completed', error TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS hr_synced_employees (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), connection_id UUID NOT NULL, external_id TEXT, employee_data JSONB DEFAULT '{}', last_synced TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS hr_time_off_requests (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), employee_id UUID NOT NULL, request_type TEXT, start_date DATE, end_date DATE, status TEXT DEFAULT 'pending', approved_by UUID, created_at TIMESTAMPTZ DEFAULT now());

-- ICE & INDUSTRY
CREATE TABLE IF NOT EXISTS ice_activations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID, activation_type TEXT, location TEXT, scheduled_time TIMESTAMPTZ, status TEXT DEFAULT 'planned', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS industry_associations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, association_name TEXT NOT NULL, membership_level TEXT, joined_date DATE, renewal_date DATE, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS influencer_campaigns (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, campaign_name TEXT NOT NULL, budget DECIMAL, start_date DATE, end_date DATE, status TEXT DEFAULT 'draft', created_at TIMESTAMPTZ DEFAULT now());

-- INSPECTION & INTEGRATION EXTENDED
CREATE TABLE IF NOT EXISTS inspection_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), inspection_id UUID NOT NULL, item_name TEXT NOT NULL, status TEXT DEFAULT 'pending', notes TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS inspection_signatures (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), inspection_id UUID NOT NULL, signer_id UUID NOT NULL, signature_data TEXT, signed_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS integration_analytics_daily (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), integration_id UUID NOT NULL, date DATE NOT NULL, requests INTEGER DEFAULT 0, errors INTEGER DEFAULT 0, avg_response_ms INTEGER, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS integration_events (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), integration_id UUID NOT NULL, event_type TEXT NOT NULL, payload JSONB DEFAULT '{}', processed BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS integration_usage_logs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), integration_id UUID NOT NULL, endpoint TEXT, method TEXT, status_code INTEGER, response_time_ms INTEGER, created_at TIMESTAMPTZ DEFAULT now());

-- INTELLECTUAL & INTERCOMPANY
CREATE TABLE IF NOT EXISTS intellectual_property (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, ip_type TEXT NOT NULL, title TEXT NOT NULL, registration_number TEXT, filing_date DATE, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS intercompany_eliminations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, elimination_type TEXT, amount DECIMAL NOT NULL, period_start DATE, period_end DATE, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());

-- INTERNSHIP & INTERVIEW
CREATE TABLE IF NOT EXISTS internship_programs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, program_name TEXT NOT NULL, description TEXT, duration_weeks INTEGER, positions_available INTEGER, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS interview_participants (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), interview_id UUID NOT NULL, user_id UUID NOT NULL, role TEXT DEFAULT 'interviewer', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS interview_questions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, question_text TEXT NOT NULL, category TEXT, difficulty TEXT DEFAULT 'medium', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS interview_responses (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), interview_id UUID NOT NULL, question_id UUID NOT NULL, response TEXT, rating INTEGER, created_at TIMESTAMPTZ DEFAULT now());

-- INVESTOR & KEY
CREATE TABLE IF NOT EXISTS investor_documents (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, document_type TEXT NOT NULL, title TEXT, file_url TEXT, access_level TEXT DEFAULT 'restricted', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS key_positions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, position_title TEXT NOT NULL, department TEXT, criticality TEXT DEFAULT 'high', succession_plan_id UUID, created_at TIMESTAMPTZ DEFAULT now());

-- LABOR & LANGUAGE
CREATE TABLE IF NOT EXISTS labor_violations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, violation_type TEXT NOT NULL, description TEXT, occurred_at TIMESTAMPTZ, reported_by UUID, status TEXT DEFAULT 'open', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS language_settings (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, default_language TEXT DEFAULT 'en', supported_languages JSONB DEFAULT '["en"]', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS languages (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code TEXT UNIQUE NOT NULL, name TEXT NOT NULL, native_name TEXT, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now());

-- LIGHTING & LIMITED
CREATE TABLE IF NOT EXISTS lighting_focus (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID, fixture_id UUID, position TEXT, target TEXT, color TEXT, intensity INTEGER, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS limited_release_purchases (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), release_id UUID NOT NULL, user_id UUID NOT NULL, quantity INTEGER DEFAULT 1, purchased_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS limited_releases (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), product_id UUID NOT NULL, release_name TEXT, quantity_available INTEGER, release_date TIMESTAMPTZ, status TEXT DEFAULT 'upcoming', created_at TIMESTAMPTZ DEFAULT now());

-- LISTING & LOAD
CREATE TABLE IF NOT EXISTS listing_aggregators (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, aggregator_name TEXT NOT NULL, api_credentials JSONB DEFAULT '{}', status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS load_out_schedules (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID NOT NULL, start_time TIMESTAMPTZ, end_time TIMESTAMPTZ, status TEXT DEFAULT 'scheduled', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS load_out_tasks (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), schedule_id UUID NOT NULL, task_name TEXT NOT NULL, assigned_to UUID, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS load_out_trucks (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), schedule_id UUID NOT NULL, truck_id UUID, arrival_time TIMESTAMPTZ, departure_time TIMESTAMPTZ, status TEXT DEFAULT 'scheduled', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS load_schedule_tasks (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), schedule_id UUID NOT NULL, task_name TEXT NOT NULL, start_time TIMESTAMPTZ, duration_minutes INTEGER, assigned_to UUID, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS load_schedules (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID NOT NULL, schedule_type TEXT, start_time TIMESTAMPTZ, end_time TIMESTAMPTZ, status TEXT DEFAULT 'draft', created_at TIMESTAMPTZ DEFAULT now());

-- LOGIN & LOST FOUND
CREATE TABLE IF NOT EXISTS login_attempts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID, email TEXT, ip_address TEXT, user_agent TEXT, success BOOLEAN, attempted_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS lost_found_matches (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), lost_item_id UUID NOT NULL, found_item_id UUID NOT NULL, match_confidence DECIMAL, verified BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now());

-- MANUAL & MEDICAL
CREATE TABLE IF NOT EXISTS manual_videos (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), equipment_id UUID, title TEXT NOT NULL, video_url TEXT, duration_seconds INTEGER, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS medical_incidents (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID, incident_type TEXT NOT NULL, description TEXT, severity TEXT DEFAULT 'minor', patient_name TEXT, treated_by UUID, occurred_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS medical_staff (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID, user_id UUID, certification_type TEXT, certification_expiry DATE, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS medical_stations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), venue_id UUID, event_id UUID, station_name TEXT NOT NULL, location TEXT, equipment JSONB DEFAULT '[]', created_at TIMESTAMPTZ DEFAULT now());

-- MEMORY & MENTORSHIP
CREATE TABLE IF NOT EXISTS memory_books (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID, title TEXT, description TEXT, photos JSONB DEFAULT '[]', is_public BOOLEAN DEFAULT false, created_by UUID, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS mentorship_requests (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), program_id UUID, mentee_id UUID NOT NULL, mentor_id UUID, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());

-- MERCH
CREATE TABLE IF NOT EXISTS merch_booths (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID NOT NULL, booth_number TEXT, location TEXT, vendor_id UUID, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS merch_inventory (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), item_id UUID NOT NULL, location_id UUID, quantity INTEGER DEFAULT 0, reserved INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS merch_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, description TEXT, category TEXT, price DECIMAL, sku TEXT, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS merch_sales (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID, booth_id UUID, item_id UUID NOT NULL, quantity INTEGER DEFAULT 1, unit_price DECIMAL, total DECIMAL, sold_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());

-- MESSAGING & MODULE
CREATE TABLE IF NOT EXISTS messaging_channels (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, channel_type TEXT, members JSONB DEFAULT '[]', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS module_completions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, module_id UUID NOT NULL, completed_at TIMESTAMPTZ DEFAULT now(), score DECIMAL, created_at TIMESTAMPTZ DEFAULT now());

-- MUSIC & N8N
CREATE TABLE IF NOT EXISTS music_connections (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, platform TEXT NOT NULL, external_id TEXT, access_token TEXT, refresh_token TEXT, expires_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS n8n_credentials (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, credential_name TEXT NOT NULL, credential_type TEXT, encrypted_data TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS n8n_execution_logs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), workflow_id UUID NOT NULL, execution_id TEXT, status TEXT, started_at TIMESTAMPTZ, finished_at TIMESTAMPTZ, error TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS n8n_workflows (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, workflow_data JSONB DEFAULT '{}', is_active BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now());

-- NDA & NEGOTIATION
CREATE TABLE IF NOT EXISTS nda_signatures (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), nda_id UUID NOT NULL, signer_id UUID NOT NULL, signed_at TIMESTAMPTZ DEFAULT now(), ip_address TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS ndas (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, title TEXT NOT NULL, content TEXT, version TEXT, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS negotiation_history (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), contract_id UUID, deal_id UUID, action TEXT, details JSONB DEFAULT '{}', performed_by UUID, created_at TIMESTAMPTZ DEFAULT now());

-- NOTIFICATION EXTENDED
CREATE TABLE IF NOT EXISTS notification_delivery_queue (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), notification_id UUID NOT NULL, channel TEXT NOT NULL, recipient TEXT, status TEXT DEFAULT 'pending', sent_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS notification_reads (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), notification_id UUID NOT NULL, user_id UUID NOT NULL, read_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS notification_routing_rules (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, rule_name TEXT NOT NULL, conditions JSONB DEFAULT '{}', channels JSONB DEFAULT '[]', is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now());

-- ORDER ROUND UPS
CREATE TABLE IF NOT EXISTS order_round_ups (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), order_id UUID NOT NULL, round_up_amount DECIMAL NOT NULL, charity_id UUID, created_at TIMESTAMPTZ DEFAULT now());

-- INDEXES FOR PART 5
CREATE INDEX IF NOT EXISTS idx_bill_payments_bill ON bill_payments(bill_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_channel ON channel_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_client_invoices_client ON client_invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_crew_roster_entries_roster ON crew_roster_entries(roster_id);
CREATE INDEX IF NOT EXISTS idx_drone_flights_drone ON drone_flights(drone_id);
CREATE INDEX IF NOT EXISTS idx_event_performers_event ON event_performers(event_id);
CREATE INDEX IF NOT EXISTS idx_gl_entries_account ON gl_entries(account_id);
CREATE INDEX IF NOT EXISTS idx_merch_sales_event ON merch_sales(event_id);
