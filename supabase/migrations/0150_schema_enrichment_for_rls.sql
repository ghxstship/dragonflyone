-- Migration: 0150_schema_enrichment_for_rls.sql
-- Description: Enrich schema to support comprehensive RLS policies
-- This adds missing columns and tables needed for proper RLS policy implementation

-- ============================================================================
-- PART 1: ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================================================

-- activity_logs: Add organization_id for org-scoped access
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_activity_logs_org ON activity_logs(organization_id);

-- import_templates: Add organization_id and is_global for scoped access
ALTER TABLE import_templates ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE import_templates ADD COLUMN IF NOT EXISTS is_global BOOLEAN DEFAULT FALSE;
ALTER TABLE import_templates ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES platform_users(id) ON DELETE SET NULL;
ALTER TABLE import_templates ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
CREATE INDEX IF NOT EXISTS idx_import_templates_org ON import_templates(organization_id);

-- email_templates: Add organization_id and is_global for scoped access
ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS is_global BOOLEAN DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_email_templates_org ON email_templates(organization_id);

-- documents: Add organization_id for scoped access
ALTER TABLE documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_documents_org ON documents(organization_id);

-- role_definitions: Add organization_id and is_public for scoped access
ALTER TABLE role_definitions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_definitions ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;
CREATE INDEX IF NOT EXISTS idx_role_definitions_org ON role_definitions(organization_id);

-- workflow_templates: Add is_global for global templates
ALTER TABLE workflow_templates ADD COLUMN IF NOT EXISTS is_global BOOLEAN DEFAULT FALSE;

-- impersonation_sessions: Add alias columns for cleaner policy references
ALTER TABLE impersonation_sessions ADD COLUMN IF NOT EXISTS impersonator_id UUID;
ALTER TABLE impersonation_sessions ADD COLUMN IF NOT EXISTS impersonated_id UUID;

-- Update the alias columns to match the existing columns
UPDATE impersonation_sessions 
SET impersonator_id = impersonator_platform_user_id,
    impersonated_id = acting_platform_user_id
WHERE impersonator_id IS NULL;

-- Create trigger to keep alias columns in sync
CREATE OR REPLACE FUNCTION sync_impersonation_session_aliases()
RETURNS TRIGGER AS $$
BEGIN
  NEW.impersonator_id := NEW.impersonator_platform_user_id;
  NEW.impersonated_id := NEW.acting_platform_user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_impersonation_aliases ON impersonation_sessions;
CREATE TRIGGER trg_sync_impersonation_aliases
  BEFORE INSERT OR UPDATE ON impersonation_sessions
  FOR EACH ROW
  EXECUTE FUNCTION sync_impersonation_session_aliases();

-- ============================================================================
-- PART 2: CREATE MISSING FINANCE TABLES
-- ============================================================================

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
CREATE INDEX IF NOT EXISTS idx_finance_accounts_parent ON finance_accounts(parent_account_id);

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
CREATE INDEX IF NOT EXISTS idx_finance_invoices_contact ON finance_invoices(contact_id);
CREATE INDEX IF NOT EXISTS idx_finance_invoices_status ON finance_invoices(status);
CREATE INDEX IF NOT EXISTS idx_finance_invoices_due ON finance_invoices(due_date);

-- finance_invoice_items: Line items for invoices
CREATE TABLE IF NOT EXISTS finance_invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES finance_invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(14,2) NOT NULL,
  tax_rate NUMERIC(5,2) DEFAULT 0,
  discount_percent NUMERIC(5,2) DEFAULT 0,
  total NUMERIC(14,2) NOT NULL,
  account_id UUID REFERENCES finance_accounts(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_finance_invoice_items_invoice ON finance_invoice_items(invoice_id);

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
CREATE INDEX IF NOT EXISTS idx_finance_payments_date ON finance_payments(payment_date);

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
CREATE INDEX IF NOT EXISTS idx_finance_transactions_date ON finance_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_type ON finance_transactions(transaction_type);

-- finance_transaction_lines: Double-entry bookkeeping lines
CREATE TABLE IF NOT EXISTS finance_transaction_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES finance_transactions(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES finance_accounts(id) ON DELETE RESTRICT,
  debit_amount NUMERIC(14,2) DEFAULT 0,
  credit_amount NUMERIC(14,2) DEFAULT 0,
  description TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_finance_transaction_lines_tx ON finance_transaction_lines(transaction_id);
CREATE INDEX IF NOT EXISTS idx_finance_transaction_lines_account ON finance_transaction_lines(account_id);

-- ============================================================================
-- PART 3: CREATE MISSING TABLES FOR PRODUCTION ADVANCING WORKFLOW
-- ============================================================================

-- advance_approvals: Track approval workflow for production advances
CREATE TABLE IF NOT EXISTS advance_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advance_id UUID NOT NULL REFERENCES production_advances(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  approval_level INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'skipped')),
  decision_at TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_advance_approvals_advance ON advance_approvals(advance_id);
CREATE INDEX IF NOT EXISTS idx_advance_approvals_approver ON advance_approvals(approver_id);
CREATE INDEX IF NOT EXISTS idx_advance_approvals_status ON advance_approvals(status);

-- advance_comments: Comments/discussion on production advances
CREATE TABLE IF NOT EXISTS advance_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advance_id UUID NOT NULL REFERENCES production_advances(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  parent_comment_id UUID REFERENCES advance_comments(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_advance_comments_advance ON advance_comments(advance_id);
CREATE INDEX IF NOT EXISTS idx_advance_comments_author ON advance_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_advance_comments_parent ON advance_comments(parent_comment_id);

-- advance_history: Audit trail for production advance changes
CREATE TABLE IF NOT EXISTS advance_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advance_id UUID NOT NULL REFERENCES production_advances(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_advance_history_advance ON advance_history(advance_id);
CREATE INDEX IF NOT EXISTS idx_advance_history_actor ON advance_history(actor_id);
CREATE INDEX IF NOT EXISTS idx_advance_history_created ON advance_history(created_at);

-- advance_templates: Reusable templates for production advances
CREATE TABLE IF NOT EXISTS advance_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  default_items JSONB DEFAULT '[]'::JSONB,
  is_global BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_advance_templates_org ON advance_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_advance_templates_global ON advance_templates(is_global) WHERE is_global = TRUE;

-- approval_workflows: Configurable approval workflows
CREATE TABLE IF NOT EXISTS approval_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  entity_type TEXT NOT NULL,
  trigger_conditions JSONB DEFAULT '{}'::JSONB,
  approval_steps JSONB DEFAULT '[]'::JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_approval_workflows_org ON approval_workflows(organization_id);
CREATE INDEX IF NOT EXISTS idx_approval_workflows_entity ON approval_workflows(entity_type);

-- document_templates: Reusable document templates
CREATE TABLE IF NOT EXISTS document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL,
  content TEXT,
  variables JSONB DEFAULT '[]'::JSONB,
  is_global BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_templates_org ON document_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_document_templates_type ON document_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_document_templates_global ON document_templates(is_global) WHERE is_global = TRUE;

-- event_followers: Track users following events
CREATE TABLE IF NOT EXISTS event_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  notify_updates BOOLEAN DEFAULT TRUE,
  notify_announcements BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_followers_event ON event_followers(event_id);
CREATE INDEX IF NOT EXISTS idx_event_followers_user ON event_followers(user_id);

-- ============================================================================
-- PART 4: ENABLE RLS ON NEW TABLES
-- ============================================================================

-- Finance tables
ALTER TABLE finance_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_transaction_lines ENABLE ROW LEVEL SECURITY;

-- Advancing workflow tables
ALTER TABLE advance_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE advance_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE advance_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE advance_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_followers ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 4: CREATE RLS POLICIES FOR NEW TABLES
-- ============================================================================

-- advance_approvals policies
CREATE POLICY "advance_approvals_select" ON advance_approvals
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM production_advances pa WHERE pa.id = advance_approvals.advance_id AND org_matches(pa.organization_id))
    OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

CREATE POLICY "advance_approvals_insert" ON advance_approvals
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM production_advances pa WHERE pa.id = advance_approvals.advance_id AND org_matches(pa.organization_id))
    AND role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

CREATE POLICY "advance_approvals_update" ON advance_approvals
  FOR UPDATE USING (
    approver_id = (SELECT auth.uid()) 
    OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

-- advance_comments policies
CREATE POLICY "advance_comments_select" ON advance_comments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM production_advances pa WHERE pa.id = advance_comments.advance_id AND org_matches(pa.organization_id))
    OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

CREATE POLICY "advance_comments_insert" ON advance_comments
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM production_advances pa WHERE pa.id = advance_comments.advance_id AND org_matches(pa.organization_id))
    AND (SELECT auth.uid()) IS NOT NULL
  );

CREATE POLICY "advance_comments_update" ON advance_comments
  FOR UPDATE USING (
    author_id = (SELECT auth.uid()) 
    OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

CREATE POLICY "advance_comments_delete" ON advance_comments
  FOR DELETE USING (
    author_id = (SELECT auth.uid()) 
    OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

-- advance_history policies
CREATE POLICY "advance_history_select" ON advance_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM production_advances pa WHERE pa.id = advance_history.advance_id AND org_matches(pa.organization_id))
    OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

CREATE POLICY "advance_history_insert" ON advance_history
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM production_advances pa WHERE pa.id = advance_history.advance_id AND org_matches(pa.organization_id))
  );

-- advance_templates policies
CREATE POLICY "advance_templates_select" ON advance_templates
  FOR SELECT USING (
    org_matches(organization_id) OR is_global = TRUE
    OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

CREATE POLICY "advance_templates_manage" ON advance_templates
  FOR ALL USING (
    org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  ) WITH CHECK (
    org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

-- approval_workflows policies
CREATE POLICY "approval_workflows_select" ON approval_workflows
  FOR SELECT USING (
    org_matches(organization_id)
    OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

CREATE POLICY "approval_workflows_manage" ON approval_workflows
  FOR ALL USING (
    org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  ) WITH CHECK (
    org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

-- document_templates policies
CREATE POLICY "document_templates_select" ON document_templates
  FOR SELECT USING (
    org_matches(organization_id) OR is_global = TRUE
    OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

CREATE POLICY "document_templates_manage" ON document_templates
  FOR ALL USING (
    org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  ) WITH CHECK (
    org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

-- event_followers policies
CREATE POLICY "event_followers_select" ON event_followers
  FOR SELECT USING (
    user_id = (SELECT auth.uid())
    OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'GVTEWAY_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

CREATE POLICY "event_followers_insert" ON event_followers
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "event_followers_delete" ON event_followers
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- ============================================================================
-- PART 6: GRANTS
-- ============================================================================

-- Finance tables
GRANT SELECT, INSERT, UPDATE, DELETE ON finance_accounts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON finance_invoices TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON finance_invoice_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON finance_payments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON finance_transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON finance_transaction_lines TO authenticated;

-- Advancing workflow tables
GRANT SELECT, INSERT, UPDATE, DELETE ON advance_approvals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON advance_comments TO authenticated;
GRANT SELECT, INSERT ON advance_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON advance_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON approval_workflows TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON document_templates TO authenticated;
GRANT SELECT, INSERT, DELETE ON event_followers TO authenticated;
