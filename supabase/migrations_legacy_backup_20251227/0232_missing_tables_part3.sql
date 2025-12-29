-- Migration: 0232_missing_tables_part3.sql
-- Purpose: Create remaining missing tables (Part 3 of 4)
-- Date: December 15, 2025

-- PARTNER & PAYMENT
CREATE TABLE IF NOT EXISTS partner_event_associations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), partner_id UUID NOT NULL, event_id UUID NOT NULL, association_type TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS partner_offers (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), partner_id UUID NOT NULL, offer_type TEXT, description TEXT, discount_value DECIMAL, valid_until DATE, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS partnership_applications (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, applicant_name TEXT, company TEXT, email TEXT, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS partnership_opportunities (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, title TEXT NOT NULL, description TEXT, requirements JSONB DEFAULT '{}', status TEXT DEFAULT 'open', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS partnership_redemptions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), partnership_id UUID NOT NULL, user_id UUID, redeemed_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS path_enrollments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, path_id UUID NOT NULL, progress INTEGER DEFAULT 0, enrolled_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS payment_reminders (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), invoice_id UUID NOT NULL, reminder_date DATE, sent BOOLEAN DEFAULT false, sent_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());

-- PAYROLL
CREATE TABLE IF NOT EXISTS payroll_connections (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, provider TEXT NOT NULL, credentials JSONB DEFAULT '{}', status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS payroll_periods (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, period_start DATE NOT NULL, period_end DATE NOT NULL, pay_date DATE, status TEXT DEFAULT 'open', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS payroll_providers (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, provider_type TEXT, api_endpoint TEXT, created_at TIMESTAMPTZ DEFAULT now());

-- PCARD & PER DIEM
CREATE TABLE IF NOT EXISTS pcards (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, card_name TEXT, last_four TEXT, holder_id UUID, credit_limit DECIMAL, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS pcard_transactions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), pcard_id UUID NOT NULL, transaction_date DATE, merchant TEXT, amount DECIMAL NOT NULL, category TEXT, receipt_url TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS per_diem_expenses (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, project_id UUID, date DATE NOT NULL, meal_type TEXT, amount DECIMAL NOT NULL, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());

-- PERFORMANCE & PERMIT
CREATE TABLE IF NOT EXISTS performance_captures (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID, artist_id UUID, capture_type TEXT, file_url TEXT, captured_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS performance_goals (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), employee_id UUID NOT NULL, goal_type TEXT, description TEXT, target_date DATE, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS performance_reviews (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), employee_id UUID NOT NULL, reviewer_id UUID, review_period TEXT, ratings JSONB DEFAULT '{}', comments TEXT, status TEXT DEFAULT 'draft', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS permission_audit_log (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID, action TEXT NOT NULL, resource_type TEXT, resource_id UUID, details JSONB DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS permit_authorities (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, jurisdiction TEXT, contact_email TEXT, contact_phone TEXT, created_at TIMESTAMPTZ DEFAULT now());

-- PHOTO & PLAN
CREATE TABLE IF NOT EXISTS photo_sets (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID, name TEXT NOT NULL, photographer_id UUID, photo_count INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS plan_annotations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), plan_id UUID NOT NULL, user_id UUID, content TEXT, position JSONB DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS plan_contacts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), plan_id UUID NOT NULL, contact_name TEXT, contact_role TEXT, phone TEXT, email TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS plan_procedures (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), plan_id UUID NOT NULL, procedure_type TEXT, title TEXT, steps JSONB DEFAULT '[]', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS plan_tests (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), plan_id UUID NOT NULL, test_type TEXT, scheduled_date DATE, status TEXT DEFAULT 'pending', results JSONB DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now());

-- PO & POINT
CREATE TABLE IF NOT EXISTS po_line_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), purchase_order_id UUID NOT NULL, description TEXT NOT NULL, quantity DECIMAL DEFAULT 1, unit_price DECIMAL NOT NULL, total DECIMAL, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS po_receipt_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), receipt_id UUID NOT NULL, line_item_id UUID, quantity_received INTEGER, condition TEXT DEFAULT 'good', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS po_receipts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), purchase_order_id UUID NOT NULL, received_by UUID, received_at TIMESTAMPTZ DEFAULT now(), notes TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS point_transactions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, points INTEGER NOT NULL, transaction_type TEXT, description TEXT, created_at TIMESTAMPTZ DEFAULT now());

-- PORTFOLIO & POST SHOW
CREATE TABLE IF NOT EXISTS portfolio_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), portfolio_id UUID NOT NULL, item_type TEXT, title TEXT, description TEXT, media_url TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS portfolios (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, name TEXT NOT NULL, description TEXT, is_public BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS post_show_plans (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID NOT NULL, plan_type TEXT, tasks JSONB DEFAULT '[]', status TEXT DEFAULT 'draft', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS post_show_tasks (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), plan_id UUID NOT NULL, title TEXT NOT NULL, assigned_to UUID, due_date TIMESTAMPTZ, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());

-- POWER & PRE-SAVE
CREATE TABLE IF NOT EXISTS power_circuits (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), venue_id UUID, event_id UUID, circuit_name TEXT NOT NULL, amperage INTEGER, voltage INTEGER, location TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS power_plans (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID NOT NULL, total_power_kw DECIMAL, circuits JSONB DEFAULT '[]', status TEXT DEFAULT 'draft', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS pre_save_campaigns (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), artist_id UUID, release_name TEXT NOT NULL, release_date DATE, platforms JSONB DEFAULT '[]', status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS pre_save_records (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), campaign_id UUID NOT NULL, user_id UUID, platform TEXT, saved_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());

-- PREDICTIONS & PREFERRED
CREATE TABLE IF NOT EXISTS predictions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), model_id UUID, prediction_type TEXT, input_data JSONB DEFAULT '{}', output_data JSONB DEFAULT '{}', confidence DECIMAL, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS predictive_models (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, model_type TEXT, configuration JSONB DEFAULT '{}', accuracy DECIMAL, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS preferred_vendors (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, vendor_id UUID NOT NULL, category TEXT, tier TEXT DEFAULT 'standard', created_at TIMESTAMPTZ DEFAULT now());

-- PREORDER & PRESS
CREATE TABLE IF NOT EXISTS preorder_products (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), product_id UUID NOT NULL, available_date DATE, deposit_required DECIMAL, max_quantity INTEGER, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS preorders (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, product_id UUID NOT NULL, quantity INTEGER DEFAULT 1, deposit_paid DECIMAL, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS press_release_distributions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), release_id UUID NOT NULL, channel TEXT, distributed_at TIMESTAMPTZ, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS press_releases (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, title TEXT NOT NULL, content TEXT, embargo_date TIMESTAMPTZ, status TEXT DEFAULT 'draft', created_at TIMESTAMPTZ DEFAULT now());

-- PROCEDURE & PROCUREMENT
CREATE TABLE IF NOT EXISTS procedure_steps (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), procedure_id UUID NOT NULL, step_number INTEGER, title TEXT, description TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS procurement_automation_rules (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, rule_name TEXT NOT NULL, conditions JSONB DEFAULT '{}', actions JSONB DEFAULT '{}', is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now());

-- PRODUCT
CREATE TABLE IF NOT EXISTS product_bundles (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, description TEXT, products JSONB DEFAULT '[]', bundle_price DECIMAL, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS product_customization_options (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), product_id UUID NOT NULL, option_name TEXT NOT NULL, option_values JSONB DEFAULT '[]', price_modifier DECIMAL DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS product_datasheets (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), product_id UUID NOT NULL, file_url TEXT, version TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS product_variants (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), product_id UUID NOT NULL, variant_name TEXT, sku TEXT, price DECIMAL, inventory INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS products (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, description TEXT, category TEXT, price DECIMAL, sku TEXT, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());

-- PRODUCTION EXTENDED
CREATE TABLE IF NOT EXISTS production_advance_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), advance_id UUID NOT NULL, item_type TEXT, description TEXT, quantity INTEGER DEFAULT 1, unit_cost DECIMAL, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS production_advancing_catalog (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, item_name TEXT NOT NULL, category TEXT, default_specs JSONB DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS production_books (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID, project_id UUID, name TEXT NOT NULL, sections JSONB DEFAULT '[]', status TEXT DEFAULT 'draft', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS production_checklist_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), checklist_id UUID NOT NULL, title TEXT NOT NULL, description TEXT, completed BOOLEAN DEFAULT false, completed_by UUID, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS production_issues (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), production_id UUID, issue_type TEXT NOT NULL, description TEXT, severity TEXT DEFAULT 'medium', status TEXT DEFAULT 'open', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS production_meetings (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), production_id UUID, meeting_type TEXT, scheduled_at TIMESTAMPTZ, location TEXT, attendees JSONB DEFAULT '[]', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS production_milestones (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), production_id UUID NOT NULL, title TEXT NOT NULL, due_date DATE, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS production_notes (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), production_id UUID NOT NULL, note_type TEXT, content TEXT, created_by UUID, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS production_photos (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), production_id UUID NOT NULL, photo_type TEXT, file_url TEXT, caption TEXT, taken_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS production_templates (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, template_type TEXT, content JSONB DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS production_timeline_entries (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), production_id UUID NOT NULL, title TEXT NOT NULL, start_time TIMESTAMPTZ, end_time TIMESTAMPTZ, category TEXT, created_at TIMESTAMPTZ DEFAULT now());

-- PROFIT SHARING
CREATE TABLE IF NOT EXISTS profit_sharing_allocations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), plan_id UUID NOT NULL, employee_id UUID NOT NULL, allocation_percentage DECIMAL, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS profit_sharing_distributions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), plan_id UUID NOT NULL, period_end DATE, total_distributed DECIMAL, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS profit_sharing_plans (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, description TEXT, eligibility_rules JSONB DEFAULT '{}', status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());

-- PROGRAM & PROJECT EXTENDED
CREATE TABLE IF NOT EXISTS program_applications (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), program_id UUID NOT NULL, applicant_id UUID, status TEXT DEFAULT 'pending', submitted_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS program_positions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), program_id UUID NOT NULL, position_title TEXT NOT NULL, requirements JSONB DEFAULT '[]', spots_available INTEGER DEFAULT 1, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS project_alignment_scores (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), project_id UUID NOT NULL, objective_id UUID, score DECIMAL, notes TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS project_assignments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), project_id UUID NOT NULL, user_id UUID NOT NULL, role TEXT, assigned_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS project_budget_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), budget_id UUID NOT NULL, category TEXT, description TEXT, amount DECIMAL NOT NULL, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS project_budgets (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), project_id UUID NOT NULL, total_budget DECIMAL, spent DECIMAL DEFAULT 0, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS project_contacts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), project_id UUID NOT NULL, contact_name TEXT, contact_role TEXT, email TEXT, phone TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS project_dependencies (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), project_id UUID NOT NULL, depends_on_id UUID NOT NULL, dependency_type TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS project_goal_alignments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), project_id UUID NOT NULL, goal_id UUID NOT NULL, alignment_score DECIMAL, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS project_issues (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), project_id UUID NOT NULL, title TEXT NOT NULL, description TEXT, severity TEXT DEFAULT 'medium', status TEXT DEFAULT 'open', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS project_milestones (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), project_id UUID NOT NULL, title TEXT NOT NULL, due_date DATE, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS project_settlements (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), project_id UUID NOT NULL, settlement_type TEXT, gross_amount DECIMAL, net_amount DECIMAL, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS project_shifts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), project_id UUID NOT NULL, shift_type TEXT, start_time TIMESTAMPTZ, end_time TIMESTAMPTZ, positions_needed INTEGER DEFAULT 1, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS project_subcontractors (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), project_id UUID NOT NULL, subcontractor_id UUID NOT NULL, contract_value DECIMAL, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS project_tasks (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), project_id UUID NOT NULL, title TEXT NOT NULL, description TEXT, assigned_to UUID, due_date DATE, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS project_team_members (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), project_id UUID NOT NULL, user_id UUID NOT NULL, role TEXT, joined_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS project_vendors (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), project_id UUID NOT NULL, vendor_id UUID NOT NULL, service_type TEXT, contract_value DECIMAL, created_at TIMESTAMPTZ DEFAULT now());

-- PROPOSAL
CREATE TABLE IF NOT EXISTS proposal_collaborators (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), proposal_id UUID NOT NULL, user_id UUID NOT NULL, role TEXT DEFAULT 'contributor', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS proposal_templates (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, content JSONB DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS proposal_versions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), proposal_id UUID NOT NULL, version_number INTEGER, content JSONB DEFAULT '{}', created_by UUID, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS proposals (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, title TEXT NOT NULL, client_id UUID, status TEXT DEFAULT 'draft', total_value DECIMAL, created_at TIMESTAMPTZ DEFAULT now());

-- PUNCH LIST & PURCHASE ORDER EXTENDED
CREATE TABLE IF NOT EXISTS punch_list_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), project_id UUID, event_id UUID, title TEXT NOT NULL, description TEXT, assigned_to UUID, status TEXT DEFAULT 'open', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS purchase_order_activity_log (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), purchase_order_id UUID NOT NULL, action TEXT NOT NULL, performed_by UUID, details JSONB DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS purchase_order_approvals (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), purchase_order_id UUID NOT NULL, approver_id UUID NOT NULL, status TEXT DEFAULT 'pending', approved_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS purchase_order_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), purchase_order_id UUID NOT NULL, description TEXT NOT NULL, quantity DECIMAL DEFAULT 1, unit_price DECIMAL NOT NULL, created_at TIMESTAMPTZ DEFAULT now());

-- QA & QUOTE EXTENDED
CREATE TABLE IF NOT EXISTS qa_checkpoints (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), project_id UUID, checkpoint_name TEXT NOT NULL, criteria JSONB DEFAULT '[]', status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS quote_activity_log (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), quote_id UUID NOT NULL, action TEXT NOT NULL, performed_by UUID, details JSONB DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now());

-- RADIO & RATE
CREATE TABLE IF NOT EXISTS radio_channels (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID, channel_number INTEGER, channel_name TEXT, assigned_to TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS radio_messages (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), channel_id UUID NOT NULL, sender_id UUID, message TEXT, sent_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS rate_cards (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, service_type TEXT, rates JSONB DEFAULT '{}', effective_date DATE, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS rating_aggregates (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), entity_type TEXT NOT NULL, entity_id UUID NOT NULL, avg_rating DECIMAL, rating_count INTEGER DEFAULT 0, updated_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());

-- RECEIPT & RECONCILIATION
CREATE TABLE IF NOT EXISTS receipt_deliveries (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), receipt_id UUID NOT NULL, delivery_method TEXT, delivered_to TEXT, delivered_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS receipts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, receipt_number TEXT, amount DECIMAL NOT NULL, receipt_date DATE, vendor TEXT, category TEXT, file_url TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS reconciliation_logs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), reconciliation_id UUID NOT NULL, action TEXT, details JSONB DEFAULT '{}', performed_by UUID, created_at TIMESTAMPTZ DEFAULT now());

-- REFERRAL & REFUND
CREATE TABLE IF NOT EXISTS referral_program_settings (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID UNIQUE, reward_type TEXT, reward_value DECIMAL, terms TEXT, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS refunds (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), order_id UUID, payment_id UUID, amount DECIMAL NOT NULL, reason TEXT, status TEXT DEFAULT 'pending', processed_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());

-- REGULATIONS & RELATED
CREATE TABLE IF NOT EXISTS regulations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, regulation_type TEXT, title TEXT NOT NULL, description TEXT, jurisdiction TEXT, effective_date DATE, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS related_events (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID NOT NULL, related_event_id UUID NOT NULL, relationship_type TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS release_notifications (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), release_id UUID NOT NULL, user_id UUID NOT NULL, notified_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());

-- RENTAL & REPORT
CREATE TABLE IF NOT EXISTS rental_bookings (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), equipment_id UUID NOT NULL, renter_id UUID, start_date DATE, end_date DATE, daily_rate DECIMAL, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS rental_equipment (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, category TEXT, daily_rate DECIMAL, weekly_rate DECIMAL, status TEXT DEFAULT 'available', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS report_executions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), report_id UUID NOT NULL, executed_by UUID, parameters JSONB DEFAULT '{}', status TEXT DEFAULT 'pending', result_url TEXT, created_at TIMESTAMPTZ DEFAULT now());

-- REQUIREMENT & RESOURCE
CREATE TABLE IF NOT EXISTS requirement_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), requirement_id UUID NOT NULL, item_type TEXT, description TEXT, quantity INTEGER DEFAULT 1, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS resource_allocations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), resource_id UUID NOT NULL, project_id UUID, event_id UUID, allocated_from TIMESTAMPTZ, allocated_to TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());

-- RESTORATION & RESUME
CREATE TABLE IF NOT EXISTS restoration_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), restoration_id UUID NOT NULL, item_description TEXT, status TEXT DEFAULT 'pending', completed_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS resumes (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, file_url TEXT, parsed_data JSONB DEFAULT '{}', uploaded_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());

-- RETAINER & RETROSPECTIVE
CREATE TABLE IF NOT EXISTS retainer_transactions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), retainer_id UUID NOT NULL, transaction_type TEXT, amount DECIMAL NOT NULL, description TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS retainers (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, client_id UUID NOT NULL, monthly_amount DECIMAL, hours_included INTEGER, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS retrospectives (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), project_id UUID, event_id UUID, scheduled_at TIMESTAMPTZ, what_went_well JSONB DEFAULT '[]', what_to_improve JSONB DEFAULT '[]', action_items JSONB DEFAULT '[]', created_at TIMESTAMPTZ DEFAULT now());

-- REVENUE RECOGNITION
CREATE TABLE IF NOT EXISTS revenue_recognition_rules (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, rule_name TEXT NOT NULL, conditions JSONB DEFAULT '{}', recognition_method TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS revenue_recognition_schedule (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), revenue_id UUID NOT NULL, recognition_date DATE, amount DECIMAL NOT NULL, recognized BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS revenue_recognitions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, invoice_id UUID, total_amount DECIMAL, recognized_amount DECIMAL DEFAULT 0, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());

-- Continue in part 4...
