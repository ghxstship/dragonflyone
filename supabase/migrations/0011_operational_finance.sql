-- ============================================================================
-- 0011_operational_finance.sql
-- Operational Finance Tables: Ledger, Expenses, Budgets
-- GHXSTSHIP Platform - 3NF Gap Remediation
-- ============================================================================

-- ============================================================================
-- ENUM TYPES FOR FINANCE
-- ============================================================================

CREATE TYPE ledger_side AS ENUM ('debit', 'credit');
CREATE TYPE expense_status AS ENUM ('draft', 'submitted', 'approved', 'rejected', 'paid');
CREATE TYPE purchase_order_status AS ENUM ('draft', 'pending_approval', 'approved', 'ordered', 'received', 'closed', 'cancelled');
CREATE TYPE deal_status AS ENUM ('lead', 'qualified', 'proposal', 'won', 'lost');
CREATE TYPE project_phase AS ENUM ('intake', 'preproduction', 'in_production', 'post', 'completed', 'cancelled');
CREATE TYPE asset_state AS ENUM ('available', 'reserved', 'deployed', 'maintenance', 'retired');

-- ============================================================================
-- LEDGER ACCOUNTS (Chart of Accounts)
-- ============================================================================

CREATE TABLE ledger_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  account_code TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('Asset', 'Liability', 'Equity', 'Revenue', 'Expense')),
  parent_account_id UUID REFERENCES ledger_accounts(id),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, account_code)
);

CREATE INDEX idx_ledger_accounts_org ON ledger_accounts(organization_id);
CREATE INDEX idx_ledger_accounts_type ON ledger_accounts(organization_id, account_type);
CREATE INDEX idx_ledger_accounts_parent ON ledger_accounts(parent_account_id);

-- ============================================================================
-- LEDGER ENTRIES (Double-entry bookkeeping)
-- ============================================================================

CREATE TABLE ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES ledger_accounts(id) ON DELETE RESTRICT,
  entry_date DATE NOT NULL,
  side ledger_side NOT NULL,
  amount NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
  currency TEXT DEFAULT 'USD',
  description TEXT,
  reference_type TEXT,
  reference_id UUID,
  project_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  journal_entry_id UUID,
  posted_by UUID REFERENCES platform_users(id),
  posted_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ledger_entries_org ON ledger_entries(organization_id, entry_date DESC);
CREATE INDEX idx_ledger_entries_account ON ledger_entries(account_id, entry_date DESC);
CREATE INDEX idx_ledger_entries_project ON ledger_entries(project_id);
CREATE INDEX idx_ledger_entries_journal ON ledger_entries(journal_entry_id);
CREATE INDEX idx_ledger_entries_reference ON ledger_entries(reference_type, reference_id);

-- ============================================================================
-- FINANCE EXPENSE CATEGORIES
-- ============================================================================

CREATE TABLE finance_expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  parent_category_id UUID REFERENCES finance_expense_categories(id),
  gl_account_id UUID REFERENCES ledger_accounts(id),
  requires_receipt_above NUMERIC(10,2) DEFAULT 25.00,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, code)
);

CREATE INDEX idx_expense_categories_org ON finance_expense_categories(organization_id);

-- ============================================================================
-- FINANCE EXPENSES
-- ============================================================================

CREATE TABLE finance_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  expense_number TEXT NOT NULL,
  category_id UUID REFERENCES finance_expense_categories(id),
  project_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  department_id UUID REFERENCES legend_departments(id),
  submitter_id UUID NOT NULL REFERENCES platform_users(id),
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'USD',
  expense_date DATE NOT NULL,
  vendor_name TEXT,
  vendor_id UUID REFERENCES legend_organizations(id),
  description TEXT NOT NULL,
  receipt_url TEXT,
  receipt_required BOOLEAN DEFAULT false,
  status expense_status NOT NULL DEFAULT 'draft',
  approved_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  rejection_reason TEXT,
  ledger_entry_id UUID REFERENCES ledger_entries(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, expense_number)
);

CREATE INDEX idx_expenses_org ON finance_expenses(organization_id, expense_date DESC);
CREATE INDEX idx_expenses_status ON finance_expenses(organization_id, status);
CREATE INDEX idx_expenses_submitter ON finance_expenses(submitter_id);
CREATE INDEX idx_expenses_project ON finance_expenses(project_id);
CREATE INDEX idx_expenses_category ON finance_expenses(category_id);

-- ============================================================================
-- FINANCE PURCHASE ORDERS
-- ============================================================================

CREATE TABLE finance_purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  po_number TEXT NOT NULL,
  vendor_id UUID REFERENCES legend_organizations(id),
  vendor_name TEXT,
  project_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  department_id UUID REFERENCES legend_departments(id),
  requested_by UUID NOT NULL REFERENCES platform_users(id),
  status purchase_order_status NOT NULL DEFAULT 'draft',
  order_date DATE,
  expected_delivery_date DATE,
  shipping_address TEXT,
  billing_address TEXT,
  subtotal NUMERIC(14,2) DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  shipping_amount NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(14,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  payment_terms TEXT DEFAULT 'net_30',
  notes TEXT,
  approved_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  received_by UUID REFERENCES platform_users(id),
  received_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, po_number)
);

CREATE INDEX idx_po_org ON finance_purchase_orders(organization_id, order_date DESC);
CREATE INDEX idx_po_status ON finance_purchase_orders(organization_id, status);
CREATE INDEX idx_po_vendor ON finance_purchase_orders(vendor_id);
CREATE INDEX idx_po_project ON finance_purchase_orders(project_id);

-- ============================================================================
-- FINANCE PURCHASE ORDER ITEMS
-- ============================================================================

CREATE TABLE finance_purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES finance_purchase_orders(id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL,
  product_id UUID REFERENCES legend_products(id),
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL CHECK (quantity > 0),
  unit TEXT DEFAULT 'each',
  unit_cost NUMERIC(12,2) NOT NULL CHECK (unit_cost >= 0),
  total_cost NUMERIC(14,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
  received_quantity NUMERIC(10,2) DEFAULT 0,
  gl_account_id UUID REFERENCES ledger_accounts(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(purchase_order_id, line_number)
);

CREATE INDEX idx_po_items_po ON finance_purchase_order_items(purchase_order_id);
CREATE INDEX idx_po_items_product ON finance_purchase_order_items(product_id);

-- ============================================================================
-- DEALS (CRM Pipeline) - Links to Legend People/Organizations
-- ============================================================================

CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  deal_code TEXT,
  title TEXT NOT NULL,
  contact_id UUID REFERENCES legend_people(id) ON DELETE SET NULL,
  company_id UUID REFERENCES legend_organizations(id) ON DELETE SET NULL,
  status deal_status NOT NULL DEFAULT 'lead',
  value NUMERIC(14,2),
  currency TEXT DEFAULT 'USD',
  probability NUMERIC(5,2) CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  actual_close_date DATE,
  source TEXT,
  owner_id UUID REFERENCES platform_users(id),
  notes TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_deals_org ON deals(organization_id, created_at DESC);
CREATE INDEX idx_deals_status ON deals(organization_id, status);
CREATE INDEX idx_deals_contact ON deals(contact_id);
CREATE INDEX idx_deals_company ON deals(company_id);
CREATE INDEX idx_deals_owner ON deals(owner_id);

-- ============================================================================
-- PROJECTS (Production Projects) - Links to Legend Events
-- ============================================================================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  client_id UUID REFERENCES legend_organizations(id) ON DELETE SET NULL,
  phase project_phase NOT NULL DEFAULT 'intake',
  start_date DATE,
  end_date DATE,
  budget NUMERIC(14,2),
  currency TEXT DEFAULT 'USD',
  project_manager_id UUID REFERENCES platform_users(id),
  department_id UUID REFERENCES legend_departments(id),
  cost_center_id UUID REFERENCES legend_cost_centers(id),
  notes TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, code)
);

CREATE INDEX idx_projects_org ON projects(organization_id, created_at DESC);
CREATE INDEX idx_projects_phase ON projects(organization_id, phase);
CREATE INDEX idx_projects_deal ON projects(deal_id);
CREATE INDEX idx_projects_event ON projects(event_id);
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_pm ON projects(project_manager_id);

-- ============================================================================
-- ASSETS (Equipment/Inventory) - Links to Legend Products
-- ============================================================================

CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  product_id UUID REFERENCES legend_products(id) ON DELETE SET NULL,
  state asset_state NOT NULL DEFAULT 'available',
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  location_id UUID REFERENCES legend_places(id) ON DELETE SET NULL,
  serial_number TEXT,
  barcode TEXT,
  purchase_price NUMERIC(12,2),
  current_value NUMERIC(12,2),
  acquired_at DATE,
  warranty_expires_at DATE,
  last_maintenance_at DATE,
  next_maintenance_at DATE,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, tag)
);

CREATE INDEX idx_assets_org ON assets(organization_id);
CREATE INDEX idx_assets_state ON assets(organization_id, state);
CREATE INDEX idx_assets_category ON assets(organization_id, category);
CREATE INDEX idx_assets_project ON assets(project_id);
CREATE INDEX idx_assets_location ON assets(location_id);
CREATE INDEX idx_assets_product ON assets(product_id);

-- ============================================================================
-- ASSET MAINTENANCE EVENTS
-- ============================================================================

CREATE TABLE asset_maintenance_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('inspection', 'repair', 'calibration', 'cleaning', 'upgrade', 'other')),
  event_date DATE NOT NULL,
  performed_by UUID REFERENCES platform_users(id),
  vendor_id UUID REFERENCES legend_organizations(id),
  cost NUMERIC(10,2),
  description TEXT,
  next_scheduled DATE,
  attachments TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_maintenance_asset ON asset_maintenance_events(asset_id, event_date DESC);
CREATE INDEX idx_maintenance_type ON asset_maintenance_events(event_type);
CREATE INDEX idx_maintenance_next ON asset_maintenance_events(next_scheduled) WHERE next_scheduled IS NOT NULL;

-- ============================================================================
-- CONTACTS (CRM Contacts) - View over Legend People
-- ============================================================================

CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  person_id UUID REFERENCES legend_people(id) ON DELETE SET NULL,
  company TEXT,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  title TEXT,
  department TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'USA',
  source TEXT,
  lead_status TEXT DEFAULT 'new',
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_contacts_org ON contacts(organization_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_company ON contacts(company);
CREATE INDEX idx_contacts_person ON contacts(person_id);

-- ============================================================================
-- BUDGETS
-- ============================================================================

CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  department_id UUID REFERENCES legend_departments(id),
  fiscal_year INTEGER,
  start_date DATE,
  end_date DATE,
  total_amount NUMERIC(14,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')),
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_budgets_org ON budgets(organization_id);
CREATE INDEX idx_budgets_project ON budgets(project_id);
CREATE INDEX idx_budgets_department ON budgets(department_id);
CREATE INDEX idx_budgets_fiscal ON budgets(organization_id, fiscal_year);

-- ============================================================================
-- BUDGET LINE ITEMS
-- ============================================================================

CREATE TABLE budget_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  category_id UUID REFERENCES finance_expense_categories(id),
  gl_account_id UUID REFERENCES ledger_accounts(id),
  description TEXT NOT NULL,
  planned_amount NUMERIC(12,2) NOT NULL,
  actual_amount NUMERIC(12,2) DEFAULT 0,
  variance NUMERIC(12,2) GENERATED ALWAYS AS (planned_amount - actual_amount) STORED,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_budget_items_budget ON budget_line_items(budget_id);

-- ============================================================================
-- ORDERS (Sales Orders)
-- ============================================================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  customer_id UUID REFERENCES legend_people(id),
  company_id UUID REFERENCES legend_organizations(id),
  event_id UUID REFERENCES legend_events(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  order_date TIMESTAMPTZ DEFAULT now(),
  subtotal NUMERIC(12,2) DEFAULT 0,
  tax_amount NUMERIC(10,2) DEFAULT 0,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'refunded')),
  shipping_address JSONB,
  billing_address JSONB,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, order_number)
);

CREATE INDEX idx_orders_org ON orders(organization_id, order_date DESC);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_company ON orders(company_id);
CREATE INDEX idx_orders_event ON orders(event_id);
CREATE INDEX idx_orders_status ON orders(organization_id, status);

-- ============================================================================
-- ORDER ITEMS
-- ============================================================================

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES legend_products(id),
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL,
  discount_percent NUMERIC(5,2) DEFAULT 0,
  total_price NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price * (1 - discount_percent / 100)) STORED,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ============================================================================
-- BILLS (Vendor Bills/Invoices Received)
-- ============================================================================

CREATE TABLE bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  bill_number TEXT NOT NULL,
  vendor_id UUID REFERENCES legend_organizations(id),
  vendor_name TEXT,
  purchase_order_id UUID REFERENCES finance_purchase_orders(id),
  project_id UUID REFERENCES projects(id),
  bill_date DATE NOT NULL,
  due_date DATE,
  subtotal NUMERIC(12,2) DEFAULT 0,
  tax_amount NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'partial', 'overdue', 'cancelled')),
  paid_amount NUMERIC(12,2) DEFAULT 0,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  attachments TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, bill_number)
);

CREATE INDEX idx_bills_org ON bills(organization_id, bill_date DESC);
CREATE INDEX idx_bills_vendor ON bills(vendor_id);
CREATE INDEX idx_bills_po ON bills(purchase_order_id);
CREATE INDEX idx_bills_status ON bills(organization_id, status);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE ledger_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_maintenance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

-- Ledger Accounts policies
CREATE POLICY ledger_accounts_select ON ledger_accounts FOR SELECT USING (org_matches(organization_id));
CREATE POLICY ledger_accounts_insert ON ledger_accounts FOR INSERT WITH CHECK (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'FINANCE_ADMIN', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY ledger_accounts_update ON ledger_accounts FOR UPDATE USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'FINANCE_ADMIN', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY ledger_accounts_delete ON ledger_accounts FOR DELETE USING (org_matches(organization_id) AND role_in('ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Ledger Entries policies
CREATE POLICY ledger_entries_select ON ledger_entries FOR SELECT USING (org_matches(organization_id) AND role_in('ATLVS_VIEWER', 'ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'FINANCE_ADMIN', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY ledger_entries_insert ON ledger_entries FOR INSERT WITH CHECK (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'FINANCE_ADMIN', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY ledger_entries_update ON ledger_entries FOR UPDATE USING (org_matches(organization_id) AND role_in('ATLVS_SUPER_ADMIN', 'FINANCE_ADMIN', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY ledger_entries_delete ON ledger_entries FOR DELETE USING (org_matches(organization_id) AND role_in('LEGEND_SUPER_ADMIN'));

-- Expense Categories policies
CREATE POLICY expense_categories_select ON finance_expense_categories FOR SELECT USING (org_matches(organization_id));
CREATE POLICY expense_categories_manage ON finance_expense_categories FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'FINANCE_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Expenses policies
CREATE POLICY expenses_select ON finance_expenses FOR SELECT USING (org_matches(organization_id) AND (submitter_id = current_platform_user_id() OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'FINANCE_ADMIN', 'LEGEND_SUPER_ADMIN')));
CREATE POLICY expenses_insert ON finance_expenses FOR INSERT WITH CHECK (org_matches(organization_id));
CREATE POLICY expenses_update ON finance_expenses FOR UPDATE USING (org_matches(organization_id) AND (submitter_id = current_platform_user_id() OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'FINANCE_ADMIN', 'LEGEND_SUPER_ADMIN')));
CREATE POLICY expenses_delete ON finance_expenses FOR DELETE USING (org_matches(organization_id) AND role_in('ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Purchase Orders policies
CREATE POLICY po_select ON finance_purchase_orders FOR SELECT USING (org_matches(organization_id));
CREATE POLICY po_insert ON finance_purchase_orders FOR INSERT WITH CHECK (org_matches(organization_id) AND role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'PROCUREMENT_MANAGER', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY po_update ON finance_purchase_orders FOR UPDATE USING (org_matches(organization_id) AND role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'PROCUREMENT_MANAGER', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY po_delete ON finance_purchase_orders FOR DELETE USING (org_matches(organization_id) AND role_in('ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- PO Items policies
CREATE POLICY po_items_select ON finance_purchase_order_items FOR SELECT USING (EXISTS (SELECT 1 FROM finance_purchase_orders po WHERE po.id = purchase_order_id AND org_matches(po.organization_id)));
CREATE POLICY po_items_manage ON finance_purchase_order_items FOR ALL USING (EXISTS (SELECT 1 FROM finance_purchase_orders po WHERE po.id = purchase_order_id AND org_matches(po.organization_id) AND role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'PROCUREMENT_MANAGER', 'LEGEND_SUPER_ADMIN')));

-- Deals policies
CREATE POLICY deals_select ON deals FOR SELECT USING (org_matches(organization_id));
CREATE POLICY deals_insert ON deals FOR INSERT WITH CHECK (org_matches(organization_id) AND role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY deals_update ON deals FOR UPDATE USING (org_matches(organization_id) AND role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY deals_delete ON deals FOR DELETE USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Projects policies
CREATE POLICY projects_select ON projects FOR SELECT USING (org_matches(organization_id));
CREATE POLICY projects_insert ON projects FOR INSERT WITH CHECK (org_matches(organization_id) AND role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY projects_update ON projects FOR UPDATE USING (org_matches(organization_id) AND role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY projects_delete ON projects FOR DELETE USING (org_matches(organization_id) AND role_in('ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Assets policies
CREATE POLICY assets_select ON assets FOR SELECT USING (org_matches(organization_id));
CREATE POLICY assets_insert ON assets FOR INSERT WITH CHECK (org_matches(organization_id) AND role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_TEAM_MEMBER', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY assets_update ON assets FOR UPDATE USING (org_matches(organization_id) AND role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_TEAM_MEMBER', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY assets_delete ON assets FOR DELETE USING (org_matches(organization_id) AND role_in('ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Asset Maintenance policies
CREATE POLICY maintenance_select ON asset_maintenance_events FOR SELECT USING (EXISTS (SELECT 1 FROM assets a WHERE a.id = asset_id AND org_matches(a.organization_id)));
CREATE POLICY maintenance_manage ON asset_maintenance_events FOR ALL USING (EXISTS (SELECT 1 FROM assets a WHERE a.id = asset_id AND org_matches(a.organization_id) AND role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_TEAM_MEMBER', 'LEGEND_SUPER_ADMIN')));

-- Contacts policies
CREATE POLICY contacts_select ON contacts FOR SELECT USING (org_matches(organization_id));
CREATE POLICY contacts_insert ON contacts FOR INSERT WITH CHECK (org_matches(organization_id));
CREATE POLICY contacts_update ON contacts FOR UPDATE USING (org_matches(organization_id));
CREATE POLICY contacts_delete ON contacts FOR DELETE USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Budgets policies
CREATE POLICY budgets_select ON budgets FOR SELECT USING (org_matches(organization_id) AND role_in('ATLVS_VIEWER', 'ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'FINANCE_ADMIN', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY budgets_manage ON budgets FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'FINANCE_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Budget Line Items policies
CREATE POLICY budget_items_select ON budget_line_items FOR SELECT USING (EXISTS (SELECT 1 FROM budgets b WHERE b.id = budget_id AND org_matches(b.organization_id)));
CREATE POLICY budget_items_manage ON budget_line_items FOR ALL USING (EXISTS (SELECT 1 FROM budgets b WHERE b.id = budget_id AND org_matches(b.organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'FINANCE_ADMIN', 'LEGEND_SUPER_ADMIN')));

-- Orders policies
CREATE POLICY orders_select ON orders FOR SELECT USING (org_matches(organization_id));
CREATE POLICY orders_insert ON orders FOR INSERT WITH CHECK (org_matches(organization_id));
CREATE POLICY orders_update ON orders FOR UPDATE USING (org_matches(organization_id) AND role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'GVTEWAY_ADMIN', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY orders_delete ON orders FOR DELETE USING (org_matches(organization_id) AND role_in('ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Order Items policies
CREATE POLICY order_items_select ON order_items FOR SELECT USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND org_matches(o.organization_id)));
CREATE POLICY order_items_manage ON order_items FOR ALL USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND org_matches(o.organization_id)));

-- Bills policies
CREATE POLICY bills_select ON bills FOR SELECT USING (org_matches(organization_id) AND role_in('ATLVS_VIEWER', 'ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'FINANCE_ADMIN', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY bills_manage ON bills FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'FINANCE_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON ledger_accounts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ledger_entries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON finance_expense_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON finance_expenses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON finance_purchase_orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON finance_purchase_order_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON deals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON assets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON asset_maintenance_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON contacts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON budgets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON budget_line_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON order_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON bills TO authenticated;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER ledger_accounts_updated_at BEFORE UPDATE ON ledger_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER finance_expenses_updated_at BEFORE UPDATE ON finance_expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER finance_purchase_orders_updated_at BEFORE UPDATE ON finance_purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER deals_updated_at BEFORE UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER bills_updated_at BEFORE UPDATE ON bills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
