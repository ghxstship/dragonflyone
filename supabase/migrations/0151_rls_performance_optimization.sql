-- Migration: 0151_rls_performance_optimization.sql
-- Description: Fix RLS performance warnings by wrapping auth.*() in (SELECT ...)
-- and consolidating multiple permissive policies

-- ============================================================================
-- PART 0: CREATE MISSING TABLES AND COLUMNS
-- ============================================================================

-- Ensure documents has organization_id
ALTER TABLE documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_documents_org ON documents(organization_id);

-- finance_accounts: Chart of accounts for financial tracking
CREATE TABLE IF NOT EXISTS finance_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  account_number TEXT NOT NULL,
  name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  parent_account_id UUID REFERENCES finance_accounts(id) ON DELETE SET NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  balance NUMERIC(14,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, account_number)
);

CREATE INDEX IF NOT EXISTS idx_finance_accounts_org ON finance_accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_finance_accounts_type ON finance_accounts(account_type);

-- finance_invoices: Invoice management
CREATE TABLE IF NOT EXISTS finance_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled', 'refunded')),
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal NUMERIC(14,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(14,2) DEFAULT 0,
  discount_amount NUMERIC(14,2) DEFAULT 0,
  total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  amount_paid NUMERIC(14,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  notes TEXT,
  terms TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_by UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, invoice_number)
);

CREATE INDEX IF NOT EXISTS idx_finance_invoices_org ON finance_invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_finance_invoices_status ON finance_invoices(status);

-- finance_payments: Payment records
CREATE TABLE IF NOT EXISTS finance_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES finance_invoices(id) ON DELETE SET NULL,
  payment_number TEXT,
  amount NUMERIC(14,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'check', 'credit_card', 'debit_card', 'bank_transfer', 'wire', 'ach', 'paypal', 'stripe', 'other')),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reference_number TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
  notes TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_by UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_finance_payments_org ON finance_payments(organization_id);
CREATE INDEX IF NOT EXISTS idx_finance_payments_invoice ON finance_payments(invoice_id);

-- finance_transactions: General ledger transactions
CREATE TABLE IF NOT EXISTS finance_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  transaction_number TEXT,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('journal', 'invoice', 'payment', 'expense', 'transfer', 'adjustment')),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  reference_type TEXT,
  reference_id UUID,
  total_amount NUMERIC(14,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'posted' CHECK (status IN ('draft', 'pending', 'posted', 'voided')),
  metadata JSONB DEFAULT '{}'::JSONB,
  created_by UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_finance_transactions_org ON finance_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_type ON finance_transactions(transaction_type);

-- Enable RLS on new finance tables
ALTER TABLE finance_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_transactions ENABLE ROW LEVEL SECURITY;

-- Grants for finance tables
GRANT SELECT, INSERT, UPDATE, DELETE ON finance_accounts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON finance_invoices TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON finance_payments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON finance_transactions TO authenticated;

-- Add organization_id to webhook_event_logs for org-scoped access
ALTER TABLE webhook_event_logs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_webhook_event_logs_org ON webhook_event_logs(organization_id);

-- ============================================================================
-- PART 1: FIX auth_rls_initplan WARNINGS
-- Wrap auth.uid() calls in (SELECT ...) to prevent per-row re-evaluation
-- ============================================================================

-- api_rate_limits
DROP POLICY IF EXISTS "api_rate_limits_select" ON public.api_rate_limits;
DROP POLICY IF EXISTS "api_rate_limits_insert" ON public.api_rate_limits;
CREATE POLICY "api_rate_limits_select" ON public.api_rate_limits FOR SELECT USING (user_id = (SELECT auth.uid()));
CREATE POLICY "api_rate_limits_insert" ON public.api_rate_limits FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

-- production_advancing_catalog
DROP POLICY IF EXISTS "catalog_global_read" ON public.production_advancing_catalog;
CREATE POLICY "catalog_global_read" ON public.production_advancing_catalog FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

-- document_locks
DROP POLICY IF EXISTS "Users can create their own locks" ON public.document_locks;
DROP POLICY IF EXISTS "Users can delete their own locks" ON public.document_locks;
DROP POLICY IF EXISTS "Users can update their own locks" ON public.document_locks;
CREATE POLICY "Users can create their own locks" ON public.document_locks FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can delete their own locks" ON public.document_locks FOR DELETE USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can update their own locks" ON public.document_locks FOR UPDATE USING (user_id = (SELECT auth.uid()));

-- status_updates
DROP POLICY IF EXISTS "Authenticated users can create status updates" ON public.status_updates;
DROP POLICY IF EXISTS "Users can update their own status updates" ON public.status_updates;
CREATE POLICY "Authenticated users can create status updates" ON public.status_updates FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "Users can update their own status updates" ON public.status_updates FOR UPDATE USING (updated_by = (SELECT auth.uid()));

-- contracts
DROP POLICY IF EXISTS "Users can view contracts in their organization" ON public.contracts;
CREATE POLICY "Users can view contracts in their organization" ON public.contracts FOR SELECT USING (org_matches(organization_id));

-- contract_milestones
DROP POLICY IF EXISTS "Users can view milestones in their organization" ON public.contract_milestones;
CREATE POLICY "Users can view milestones in their organization" ON public.contract_milestones FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.contracts c WHERE c.id = contract_milestones.contract_id AND org_matches(c.organization_id))
);

-- contract_amendments
DROP POLICY IF EXISTS "Users can view amendments in their organization" ON public.contract_amendments;
CREATE POLICY "Users can view amendments in their organization" ON public.contract_amendments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.contracts c WHERE c.id = contract_amendments.contract_id AND org_matches(c.organization_id))
);

-- search_index
DROP POLICY IF EXISTS "Service role can manage search index" ON public.search_index;
CREATE POLICY "Service role can manage search index" ON public.search_index FOR ALL USING ((SELECT auth.role()) = 'service_role');

-- saved_searches
DROP POLICY IF EXISTS "Users can view their own and public saved searches" ON public.saved_searches;
DROP POLICY IF EXISTS "Users can create their own saved searches" ON public.saved_searches;
DROP POLICY IF EXISTS "Users can update their own saved searches" ON public.saved_searches;
DROP POLICY IF EXISTS "Users can delete their own saved searches" ON public.saved_searches;
CREATE POLICY "Users can view their own and public saved searches" ON public.saved_searches FOR SELECT USING (user_id = (SELECT auth.uid()) OR is_public = true);
CREATE POLICY "Users can create their own saved searches" ON public.saved_searches FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can update their own saved searches" ON public.saved_searches FOR UPDATE USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can delete their own saved searches" ON public.saved_searches FOR DELETE USING (user_id = (SELECT auth.uid()));

-- search_history
DROP POLICY IF EXISTS "Users can view their own search history" ON public.search_history;
DROP POLICY IF EXISTS "Users can create their own search history" ON public.search_history;
CREATE POLICY "Users can view their own search history" ON public.search_history FOR SELECT USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can create their own search history" ON public.search_history FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

-- export_jobs
DROP POLICY IF EXISTS "Users can view their own export jobs" ON public.export_jobs;
DROP POLICY IF EXISTS "Users can create their own export jobs" ON public.export_jobs;
DROP POLICY IF EXISTS "Users can update their own export jobs" ON public.export_jobs;
CREATE POLICY "Users can view their own export jobs" ON public.export_jobs FOR SELECT USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can create their own export jobs" ON public.export_jobs FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can update their own export jobs" ON public.export_jobs FOR UPDATE USING (user_id = (SELECT auth.uid()));

-- export_templates
DROP POLICY IF EXISTS "Users can view their own and public templates" ON public.export_templates;
DROP POLICY IF EXISTS "Users can create their own templates" ON public.export_templates;
DROP POLICY IF EXISTS "Users can update their own templates" ON public.export_templates;
DROP POLICY IF EXISTS "Users can delete their own templates" ON public.export_templates;
CREATE POLICY "Users can view their own and public templates" ON public.export_templates FOR SELECT USING (user_id = (SELECT auth.uid()) OR is_public = true);
CREATE POLICY "Users can create their own templates" ON public.export_templates FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can update their own templates" ON public.export_templates FOR UPDATE USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can delete their own templates" ON public.export_templates FOR DELETE USING (user_id = (SELECT auth.uid()));

-- batch_operations
DROP POLICY IF EXISTS "Users can view their own batch operations" ON public.batch_operations;
DROP POLICY IF EXISTS "Users can create their own batch operations" ON public.batch_operations;
DROP POLICY IF EXISTS "Users can update their own batch operations" ON public.batch_operations;
CREATE POLICY "Users can view their own batch operations" ON public.batch_operations FOR SELECT USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can create their own batch operations" ON public.batch_operations FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can update their own batch operations" ON public.batch_operations FOR UPDATE USING (user_id = (SELECT auth.uid()));

-- audit_trail
DROP POLICY IF EXISTS "Users can view audit trail for their actions" ON public.audit_trail;
DROP POLICY IF EXISTS "Service role can create audit trail entries" ON public.audit_trail;
CREATE POLICY "Users can view audit trail for their actions" ON public.audit_trail FOR SELECT USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Service role can create audit trail entries" ON public.audit_trail FOR INSERT WITH CHECK ((SELECT auth.role()) = 'service_role' OR user_id = (SELECT auth.uid()));

-- dashboard_widgets
DROP POLICY IF EXISTS "Users can view their own dashboard widgets" ON public.dashboard_widgets;
DROP POLICY IF EXISTS "Users can create their own dashboard widgets" ON public.dashboard_widgets;
DROP POLICY IF EXISTS "Users can update their own dashboard widgets" ON public.dashboard_widgets;
DROP POLICY IF EXISTS "Users can delete their own dashboard widgets" ON public.dashboard_widgets;
CREATE POLICY "Users can view their own dashboard widgets" ON public.dashboard_widgets FOR SELECT USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can create their own dashboard widgets" ON public.dashboard_widgets FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can update their own dashboard widgets" ON public.dashboard_widgets FOR UPDATE USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can delete their own dashboard widgets" ON public.dashboard_widgets FOR DELETE USING (user_id = (SELECT auth.uid()));

-- compliance_items
DROP POLICY IF EXISTS "Users can view compliance items in their organization" ON public.compliance_items;
DROP POLICY IF EXISTS "Admins can manage compliance items" ON public.compliance_items;
CREATE POLICY "Users can view compliance items in their organization" ON public.compliance_items FOR SELECT USING (org_matches(organization_id));
CREATE POLICY "Admins can manage compliance items" ON public.compliance_items FOR ALL USING (
  org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- compliance_requirements
DROP POLICY IF EXISTS "Users can view requirements in their organization" ON public.compliance_requirements;
DROP POLICY IF EXISTS "Admins can manage requirements" ON public.compliance_requirements;
CREATE POLICY "Users can view requirements in their organization" ON public.compliance_requirements FOR SELECT USING (org_matches(organization_id));
CREATE POLICY "Admins can manage requirements" ON public.compliance_requirements FOR ALL USING (
  org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- ============================================================================
-- PART 2: FIX multiple_permissive_policies WARNINGS
-- Consolidate duplicate SELECT policies into single unified policies
-- ============================================================================

-- activity_logs: Consolidate policies (now has organization_id from enrichment)
DROP POLICY IF EXISTS "activity_logs_manage" ON public.activity_logs;
DROP POLICY IF EXISTS "activity_logs_select" ON public.activity_logs;
CREATE POLICY "activity_logs_unified_select" ON public.activity_logs FOR SELECT USING (
  user_id = (SELECT auth.uid()) OR org_matches(organization_id) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- api_keys: Consolidate api_keys_manage + api_keys_select
DROP POLICY IF EXISTS "api_keys_manage" ON public.api_keys;
DROP POLICY IF EXISTS "api_keys_select" ON public.api_keys;
CREATE POLICY "api_keys_unified_select" ON public.api_keys FOR SELECT USING (
  user_id = (SELECT auth.uid()) OR (organization_id IS NOT NULL AND org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'))
);

-- artist_followers: Consolidate policies
DROP POLICY IF EXISTS "Users can manage their artist follows" ON public.artist_followers;
DROP POLICY IF EXISTS "Users can view their artist follows" ON public.artist_followers;
CREATE POLICY "artist_followers_unified_select" ON public.artist_followers FOR SELECT USING (
  user_id = (SELECT auth.uid()) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- artists: Consolidate artists_manage + artists_select
DROP POLICY IF EXISTS "artists_manage" ON public.artists;
DROP POLICY IF EXISTS "artists_select" ON public.artists;
CREATE POLICY "artists_unified_select" ON public.artists FOR SELECT USING (
  org_matches(organization_id) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- assets: Consolidate assets_manage + assets_select
DROP POLICY IF EXISTS "assets_manage" ON public.assets;
DROP POLICY IF EXISTS "assets_select" ON public.assets;
CREATE POLICY "assets_unified_select" ON public.assets FOR SELECT USING (
  org_matches(organization_id) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- budgets: Consolidate budgets_manage + budgets_select
DROP POLICY IF EXISTS "budgets_manage" ON public.budgets;
DROP POLICY IF EXISTS "budgets_select" ON public.budgets;
CREATE POLICY "budgets_unified_select" ON public.budgets FOR SELECT USING (
  org_matches(organization_id) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'FINANCE_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- crew_members: Consolidate crew_members_manage + crew_members_select
DROP POLICY IF EXISTS "crew_members_manage" ON public.crew_members;
DROP POLICY IF EXISTS "crew_members_select" ON public.crew_members;
CREATE POLICY "crew_members_unified_select" ON public.crew_members FOR SELECT USING (
  org_matches(organization_id) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- deals: Consolidate deals_manage + deals_select
DROP POLICY IF EXISTS "deals_manage" ON public.deals;
DROP POLICY IF EXISTS "deals_select" ON public.deals;
CREATE POLICY "deals_unified_select" ON public.deals FOR SELECT USING (
  org_matches(organization_id) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- documents: Consolidate documents_manage + documents_select
DROP POLICY IF EXISTS "documents_manage" ON public.documents;
DROP POLICY IF EXISTS "documents_select" ON public.documents;
CREATE POLICY "documents_unified_select" ON public.documents FOR SELECT USING (
  org_matches(organization_id) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- email_templates: Consolidate policies (now has organization_id from enrichment)
DROP POLICY IF EXISTS "email_templates_manage" ON public.email_templates;
DROP POLICY IF EXISTS "email_templates_select" ON public.email_templates;
CREATE POLICY "email_templates_unified_select" ON public.email_templates FOR SELECT USING (
  org_matches(organization_id) OR is_global = TRUE OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- events: Consolidate events_manage + events_select
DROP POLICY IF EXISTS "events_manage" ON public.events;
DROP POLICY IF EXISTS "events_select" ON public.events;
CREATE POLICY "events_unified_select" ON public.events FOR SELECT USING (
  org_matches(organization_id) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'GVTEWAY_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- finance_accounts: Consolidate finance_accounts_manage + finance_accounts_select
DROP POLICY IF EXISTS "finance_accounts_manage" ON public.finance_accounts;
DROP POLICY IF EXISTS "finance_accounts_select" ON public.finance_accounts;
CREATE POLICY "finance_accounts_unified_select" ON public.finance_accounts FOR SELECT USING (
  org_matches(organization_id) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'FINANCE_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- finance_invoices: Consolidate policies
DROP POLICY IF EXISTS "finance_invoices_manage" ON public.finance_invoices;
DROP POLICY IF EXISTS "finance_invoices_select" ON public.finance_invoices;
CREATE POLICY "finance_invoices_unified_select" ON public.finance_invoices FOR SELECT USING (
  org_matches(organization_id) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'FINANCE_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- finance_payments: Consolidate policies
DROP POLICY IF EXISTS "finance_payments_manage" ON public.finance_payments;
DROP POLICY IF EXISTS "finance_payments_select" ON public.finance_payments;
CREATE POLICY "finance_payments_unified_select" ON public.finance_payments FOR SELECT USING (
  org_matches(organization_id) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'FINANCE_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- finance_transactions: Consolidate policies
DROP POLICY IF EXISTS "finance_transactions_manage" ON public.finance_transactions;
DROP POLICY IF EXISTS "finance_transactions_select" ON public.finance_transactions;
CREATE POLICY "finance_transactions_unified_select" ON public.finance_transactions FOR SELECT USING (
  org_matches(organization_id) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'FINANCE_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- impersonation_permissions: Consolidate policies
DROP POLICY IF EXISTS "impersonation_permissions_manage" ON public.impersonation_permissions;
DROP POLICY IF EXISTS "impersonation_permissions_read" ON public.impersonation_permissions;
CREATE POLICY "impersonation_permissions_unified_select" ON public.impersonation_permissions FOR SELECT USING (
  role_in('LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN', 'LEGEND_SUPPORT', 'ATLVS_SUPER_ADMIN')
);

-- impersonation_sessions: Consolidate policies (now has alias columns from enrichment)
DROP POLICY IF EXISTS "impersonation_sessions_manage" ON public.impersonation_sessions;
DROP POLICY IF EXISTS "impersonation_sessions_read" ON public.impersonation_sessions;
CREATE POLICY "impersonation_sessions_unified_select" ON public.impersonation_sessions FOR SELECT USING (
  impersonator_id = (SELECT auth.uid()) OR impersonated_id = (SELECT auth.uid())
  OR role_in('LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN', 'LEGEND_SUPPORT', 'ATLVS_SUPER_ADMIN')
);

-- import_templates: Consolidate policies (now has organization_id from enrichment)
DROP POLICY IF EXISTS "Admins can manage import templates" ON public.import_templates;
DROP POLICY IF EXISTS "Users can view import templates" ON public.import_templates;
CREATE POLICY "import_templates_unified_select" ON public.import_templates FOR SELECT USING (
  org_matches(organization_id) OR is_global = TRUE OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- integration_asset_links: Consolidate policies
DROP POLICY IF EXISTS "integration_asset_links_manage" ON public.integration_asset_links;
DROP POLICY IF EXISTS "integration_asset_links_read" ON public.integration_asset_links;
CREATE POLICY "integration_asset_links_unified_select" ON public.integration_asset_links FOR SELECT USING (
  org_matches(organization_id) AND role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN', 'COMPVSS_TEAM_MEMBER')
);

-- integration_deal_links: Consolidate policies
DROP POLICY IF EXISTS "integration_deal_links_manage" ON public.integration_deal_links;
DROP POLICY IF EXISTS "integration_deal_links_read" ON public.integration_deal_links;
CREATE POLICY "integration_deal_links_unified_select" ON public.integration_deal_links FOR SELECT USING (
  org_matches(organization_id) AND role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN', 'COMPVSS_ADMIN')
);

-- integration_event_links: Consolidate policies
DROP POLICY IF EXISTS "integration_event_links_manage" ON public.integration_event_links;
DROP POLICY IF EXISTS "integration_event_links_read" ON public.integration_event_links;
CREATE POLICY "integration_event_links_unified_select" ON public.integration_event_links FOR SELECT USING (
  org_matches(organization_id) AND role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN', 'GVTEWAY_ADMIN')
);

-- integration_project_links: Consolidate policies
DROP POLICY IF EXISTS "integration_project_links_manage" ON public.integration_project_links;
DROP POLICY IF EXISTS "integration_project_links_read" ON public.integration_project_links;
CREATE POLICY "integration_project_links_unified_select" ON public.integration_project_links FOR SELECT USING (
  org_matches(organization_id) AND role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN', 'COMPVSS_ADMIN')
);

-- kpi_data_points: Consolidate policies
DROP POLICY IF EXISTS "kpi_data_points_manage" ON public.kpi_data_points;
DROP POLICY IF EXISTS "kpi_data_points_select" ON public.kpi_data_points;
CREATE POLICY "kpi_data_points_unified_select" ON public.kpi_data_points FOR SELECT USING (
  org_matches(organization_id) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- kpi_reports: Consolidate policies
DROP POLICY IF EXISTS "kpi_reports_manage" ON public.kpi_reports;
DROP POLICY IF EXISTS "kpi_reports_select" ON public.kpi_reports;
CREATE POLICY "kpi_reports_unified_select" ON public.kpi_reports FOR SELECT USING (
  org_matches(organization_id) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- kpi_targets: Consolidate policies
DROP POLICY IF EXISTS "kpi_targets_manage" ON public.kpi_targets;
DROP POLICY IF EXISTS "kpi_targets_select" ON public.kpi_targets;
CREATE POLICY "kpi_targets_unified_select" ON public.kpi_targets FOR SELECT USING (
  org_matches(organization_id) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- organizations: Consolidate policies
DROP POLICY IF EXISTS "organizations_manage" ON public.organizations;
DROP POLICY IF EXISTS "organizations_select" ON public.organizations;
CREATE POLICY "organizations_unified_select" ON public.organizations FOR SELECT USING (
  org_matches(id) OR role_in('ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- production_advances: Consolidate policies
DROP POLICY IF EXISTS "advances_atlvs_select" ON public.production_advances;
DROP POLICY IF EXISTS "advances_compvss_select" ON public.production_advances;
CREATE POLICY "production_advances_unified_select" ON public.production_advances FOR SELECT USING (
  org_matches(organization_id) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- production_advances UPDATE: Consolidate policies
DROP POLICY IF EXISTS "advances_atlvs_update" ON public.production_advances;
DROP POLICY IF EXISTS "advances_compvss_update" ON public.production_advances;
CREATE POLICY "production_advances_unified_update" ON public.production_advances FOR UPDATE USING (
  org_matches(organization_id) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- production_advancing_catalog: Drop duplicate policy
DROP POLICY IF EXISTS "catalog_admin_manage" ON public.production_advancing_catalog;

-- risk_levels: Consolidate policies
DROP POLICY IF EXISTS "risk_levels_manage" ON public.risk_levels;
DROP POLICY IF EXISTS "risk_levels_select" ON public.risk_levels;
CREATE POLICY "risk_levels_unified_select" ON public.risk_levels FOR SELECT USING (
  org_matches(organization_id) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- role_definitions: Consolidate policies (now has organization_id and is_public from enrichment)
DROP POLICY IF EXISTS "role_definitions_manage" ON public.role_definitions;
DROP POLICY IF EXISTS "role_definitions_public_select" ON public.role_definitions;
CREATE POLICY "role_definitions_unified_select" ON public.role_definitions FOR SELECT USING (
  is_public = TRUE OR org_matches(organization_id) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- search_index: Drop duplicate policy
DROP POLICY IF EXISTS "Users can view all search index entries" ON public.search_index;

-- status_registry: Consolidate policies
DROP POLICY IF EXISTS "generic_select" ON public.status_registry;
DROP POLICY IF EXISTS "status_registry_manage" ON public.status_registry;
CREATE POLICY "status_registry_unified_select" ON public.status_registry FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

-- team_members: Consolidate policies
DROP POLICY IF EXISTS "team_members_manage" ON public.team_members;
DROP POLICY IF EXISTS "team_members_select" ON public.team_members;
CREATE POLICY "team_members_unified_select" ON public.team_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_members.team_id AND org_matches(t.organization_id))
  OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- teams: Consolidate policies
DROP POLICY IF EXISTS "teams_manage" ON public.teams;
DROP POLICY IF EXISTS "teams_select" ON public.teams;
CREATE POLICY "teams_unified_select" ON public.teams FOR SELECT USING (
  org_matches(organization_id) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- ticket_revenue_ingestions: Consolidate policies
DROP POLICY IF EXISTS "ticket_revenue_manage" ON public.ticket_revenue_ingestions;
DROP POLICY IF EXISTS "ticket_revenue_read" ON public.ticket_revenue_ingestions;
CREATE POLICY "ticket_revenue_ingestions_unified_select" ON public.ticket_revenue_ingestions FOR SELECT USING (
  org_matches(organization_id) AND role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'FINANCE_ADMIN', 'LEGEND_SUPER_ADMIN', 'COMPVSS_ADMIN', 'GVTEWAY_ADMIN')
);

-- venue_followers: Consolidate policies
DROP POLICY IF EXISTS "Users can manage their venue follows" ON public.venue_followers;
DROP POLICY IF EXISTS "Users can view their venue follows" ON public.venue_followers;
CREATE POLICY "venue_followers_unified_select" ON public.venue_followers FOR SELECT USING (
  user_id = (SELECT auth.uid()) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- webhook_event_logs: Consolidate policies
DROP POLICY IF EXISTS "webhook_logs_read" ON public.webhook_event_logs;
DROP POLICY IF EXISTS "webhook_logs_write" ON public.webhook_event_logs;
CREATE POLICY "webhook_event_logs_unified_select" ON public.webhook_event_logs FOR SELECT USING (
  org_matches(organization_id) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- workflow_assignments: Consolidate policies
DROP POLICY IF EXISTS "workflow_assignments_manage" ON public.workflow_assignments;
DROP POLICY IF EXISTS "workflow_assignments_read" ON public.workflow_assignments;
CREATE POLICY "workflow_assignments_unified_select" ON public.workflow_assignments FOR SELECT USING (
  org_matches(organization_id) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- workflow_templates: Consolidate policies (now has is_global from enrichment)
DROP POLICY IF EXISTS "workflow_templates_manage" ON public.workflow_templates;
DROP POLICY IF EXISTS "workflow_templates_select" ON public.workflow_templates;
CREATE POLICY "workflow_templates_unified_select" ON public.workflow_templates FOR SELECT USING (
  org_matches(organization_id) OR is_global = TRUE OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- workspaces: Consolidate policies
DROP POLICY IF EXISTS "workspaces_manage" ON public.workspaces;
DROP POLICY IF EXISTS "workspaces_select" ON public.workspaces;
CREATE POLICY "workspaces_unified_select" ON public.workspaces FOR SELECT USING (
  org_matches(organization_id) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
);
