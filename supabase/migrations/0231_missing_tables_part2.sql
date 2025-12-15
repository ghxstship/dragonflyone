-- Migration: 0231_missing_tables_part2.sql
-- Purpose: Create remaining missing tables (Part 2 of 4)
-- Date: December 15, 2025

-- CONTACTS & COMMUNICATIONS
CREATE TABLE IF NOT EXISTS contacts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, first_name TEXT, last_name TEXT, email TEXT, phone TEXT, company TEXT, title TEXT, contact_type TEXT, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS conversations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), participant_ids JSONB DEFAULT '[]', conversation_type TEXT DEFAULT 'direct', last_message_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS communication_channels (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, channel_type TEXT, config JSONB DEFAULT '{}', is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS communication_templates (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, template_type TEXT, subject TEXT, body TEXT, created_at TIMESTAMPTZ DEFAULT now());

-- CREW EXTENDED
CREATE TABLE IF NOT EXISTS crew (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, user_id UUID, full_name TEXT NOT NULL, email TEXT, phone TEXT, department TEXT, role TEXT, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS crew_profiles (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), crew_member_id UUID UNIQUE NOT NULL, bio TEXT, skills JSONB DEFAULT '[]', portfolio_url TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS crew_ratings (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), crew_member_id UUID NOT NULL, project_id UUID, rated_by UUID, rating INTEGER, comments TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS crew_schedules (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), crew_member_id UUID NOT NULL, event_id UUID, scheduled_start TIMESTAMPTZ, scheduled_end TIMESTAMPTZ, role TEXT, status TEXT DEFAULT 'scheduled', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS cron_logs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), job_name TEXT NOT NULL, started_at TIMESTAMPTZ DEFAULT now(), completed_at TIMESTAMPTZ, status TEXT DEFAULT 'running', result JSONB DEFAULT '{}', error TEXT, created_at TIMESTAMPTZ DEFAULT now());

-- DEALS & DEFERRED REVENUE
CREATE TABLE IF NOT EXISTS deals (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, value DECIMAL, stage TEXT DEFAULT 'prospecting', probability INTEGER DEFAULT 50, contact_id UUID, expected_close DATE, owner_id UUID, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS deferred_revenue (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, invoice_id UUID, total_amount DECIMAL NOT NULL, recognized_amount DECIMAL DEFAULT 0, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());

-- EMPLOYEE CREDENTIALS & PAYROLL
CREATE TABLE IF NOT EXISTS employee_credentials (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), employee_id UUID NOT NULL, credential_type TEXT NOT NULL, credential_name TEXT, issue_date DATE, expiry_date DATE, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS employees (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, user_id UUID, full_name TEXT NOT NULL, email TEXT, department TEXT, title TEXT, hire_date DATE, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());

-- EVENT EXTENDED
CREATE TABLE IF NOT EXISTS event_attendance (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID NOT NULL, user_id UUID, ticket_id UUID, checked_in_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS event_categories (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE, description TEXT, parent_id UUID, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS event_expenses (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID NOT NULL, expense_type TEXT NOT NULL, description TEXT, amount DECIMAL NOT NULL, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());

-- EXPENSES
CREATE TABLE IF NOT EXISTS expenses (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, user_id UUID, expense_type TEXT, description TEXT, amount DECIMAL NOT NULL, currency TEXT DEFAULT 'USD', receipt_url TEXT, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS expense_categories (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, code TEXT, gl_account TEXT, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now());

-- FIXED ASSETS & FOLDERS
CREATE TABLE IF NOT EXISTS fixed_assets (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, asset_number TEXT, purchase_date DATE, purchase_price DECIMAL, depreciation_method TEXT DEFAULT 'straight_line', status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS folders (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, parent_id UUID, created_by UUID, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS freelancers (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID, full_name TEXT NOT NULL, email TEXT, specialty TEXT, hourly_rate DECIMAL, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());

-- GROUP MEMBERSHIPS
CREATE TABLE IF NOT EXISTS group_memberships (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), group_id UUID NOT NULL, user_id UUID NOT NULL, role TEXT DEFAULT 'member', joined_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());

-- INTEGRATION & IOT
CREATE TABLE IF NOT EXISTS integration_logs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), integration_id UUID, action TEXT, status TEXT, request JSONB, response JSONB, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS integration_secrets (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), integration_id UUID NOT NULL, secret_name TEXT NOT NULL, encrypted_value TEXT, created_at TIMESTAMPTZ DEFAULT now());

-- INVOICE EXTENDED
CREATE TABLE IF NOT EXISTS invoice_penalties (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), invoice_id UUID NOT NULL, penalty_type TEXT, amount DECIMAL NOT NULL, applied_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS issues (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, title TEXT NOT NULL, description TEXT, priority TEXT DEFAULT 'medium', status TEXT DEFAULT 'open', assigned_to UUID, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS issue_comments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), issue_id UUID NOT NULL, user_id UUID, content TEXT, created_at TIMESTAMPTZ DEFAULT now());

-- KNOWLEDGE & KPI
CREATE TABLE IF NOT EXISTS knowledge_documents (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, title TEXT NOT NULL, content TEXT, category TEXT, tags JSONB DEFAULT '[]', created_by UUID, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS kpi_reports (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, report_name TEXT NOT NULL, report_type TEXT, data JSONB DEFAULT '{}', period_start DATE, period_end DATE, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS kpi_data_points (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), kpi_id UUID NOT NULL, value DECIMAL, recorded_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());

-- LEADS & LEARNING
CREATE TABLE IF NOT EXISTS learning_modules (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, title TEXT NOT NULL, description TEXT, content_url TEXT, duration_minutes INTEGER, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS learning_paths (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, description TEXT, modules JSONB DEFAULT '[]', created_at TIMESTAMPTZ DEFAULT now());

-- MAINTENANCE & MEETINGS
CREATE TABLE IF NOT EXISTS maintenance_windows (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT, start_time TIMESTAMPTZ, end_time TIMESTAMPTZ, systems_affected JSONB DEFAULT '[]', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS member_benefits (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), membership_id UUID NOT NULL, benefit_type TEXT, description TEXT, value DECIMAL, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS mentors (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, specialty TEXT, availability TEXT, bio TEXT, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS mentorship_programs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, description TEXT, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());

-- METRICS & NOTIFICATIONS
CREATE TABLE IF NOT EXISTS metrics (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, metric_name TEXT NOT NULL, metric_value DECIMAL, recorded_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS notification_channels (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, channel_type TEXT NOT NULL, config JSONB DEFAULT '{}', is_enabled BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS notification_recipients (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), notification_id UUID NOT NULL, user_id UUID NOT NULL, status TEXT DEFAULT 'pending', sent_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());

-- NPS & OAUTH
CREATE TABLE IF NOT EXISTS nps_surveys (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, status TEXT DEFAULT 'draft', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS nps_responses (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), survey_id UUID NOT NULL, user_id UUID, score INTEGER, feedback TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS oauth_clients (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), client_id TEXT UNIQUE NOT NULL, client_secret TEXT, name TEXT, redirect_uris JSONB DEFAULT '[]', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS oauth_access_tokens (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), client_id UUID NOT NULL, user_id UUID, token TEXT UNIQUE NOT NULL, scopes JSONB DEFAULT '[]', expires_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS oauth_refresh_tokens (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), access_token_id UUID NOT NULL, token TEXT UNIQUE NOT NULL, expires_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS oauth_authorization_codes (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), client_id UUID NOT NULL, user_id UUID NOT NULL, code TEXT UNIQUE NOT NULL, redirect_uri TEXT, expires_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());

-- OFFLINE & ONBOARDING
CREATE TABLE IF NOT EXISTS offline_content (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), content_type TEXT, content_id UUID, file_url TEXT, expires_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS offline_documents (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), document_id UUID NOT NULL, user_id UUID NOT NULL, downloaded_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS offline_packages (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, package_type TEXT, content JSONB DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS offline_preferences (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID UNIQUE NOT NULL, auto_download BOOLEAN DEFAULT false, max_storage_mb INTEGER DEFAULT 500, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS okrs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, title TEXT NOT NULL, objective TEXT, key_results JSONB DEFAULT '[]', owner_id UUID, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS onboarding_documents (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, document_type TEXT, title TEXT NOT NULL, file_url TEXT, required BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS onboarding_templates (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID, name TEXT NOT NULL, steps JSONB DEFAULT '[]', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS onboarding_workflows (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), employee_id UUID NOT NULL, template_id UUID, status TEXT DEFAULT 'pending', started_at TIMESTAMPTZ, completed_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());

-- OPPORTUNITY EXTENDED
CREATE TABLE IF NOT EXISTS opportunity_share_clicks (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), share_id UUID NOT NULL, clicked_at TIMESTAMPTZ DEFAULT now(), ip_address TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS opportunity_views (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), opportunity_id UUID NOT NULL, user_id UUID, viewed_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now());

-- Continue in part 3...
