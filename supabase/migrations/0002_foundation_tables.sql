-- 0000_foundation_tables.sql
-- Foundation tables that must exist before other migrations
-- These are core entities referenced by many other tables

-- Vendors table (core entity referenced by contracts, purchase orders, etc.)
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  vendor_code TEXT NOT NULL,
  name TEXT NOT NULL,
  legal_name TEXT,
  category TEXT DEFAULT 'other',
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'USA',
  status TEXT NOT NULL DEFAULT 'pending',
  payment_terms TEXT DEFAULT 'net_30',
  currency TEXT DEFAULT 'USD',
  tax_id TEXT,
  notes TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, vendor_code)
);

CREATE INDEX IF NOT EXISTS idx_vendors_org ON vendors(organization_id);
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);

-- Crew members table (for production crew)
CREATE TABLE IF NOT EXISTS crew_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES platform_users(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL,
  department TEXT,
  skills TEXT[],
  certifications TEXT[],
  hourly_rate NUMERIC(10,2),
  day_rate NUMERIC(10,2),
  availability_status TEXT DEFAULT 'available',
  rating NUMERIC(3,2) DEFAULT 0,
  status TEXT DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, email)
);

CREATE INDEX IF NOT EXISTS idx_crew_members_org ON crew_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_crew_members_status ON crew_members(status);

-- Employees table (core entity referenced by many tables)
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES platform_users(id),
  department_id UUID REFERENCES departments(id),
  employee_number TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
  termination_date DATE,
  employment_type employment_type NOT NULL DEFAULT 'full_time',
  status employee_status NOT NULL DEFAULT 'active',
  job_title TEXT,
  manager_id UUID,
  hourly_rate NUMERIC(10,2),
  salary NUMERIC(15,2),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, employee_number),
  UNIQUE(organization_id, email)
);

CREATE INDEX IF NOT EXISTS idx_employees_org ON employees(organization_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);

-- Events table (core entity for GVTEWAY)
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  event_type TEXT DEFAULT 'concert',
  category TEXT,
  venue_name TEXT,
  venue_address TEXT,
  venue_city TEXT,
  venue_state TEXT,
  venue_country TEXT DEFAULT 'USA',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  start_time TIME,
  end_time TIME,
  timezone TEXT DEFAULT 'America/New_York',
  status TEXT DEFAULT 'draft',
  visibility TEXT DEFAULT 'public',
  capacity INT,
  tickets_sold INT DEFAULT 0,
  min_price NUMERIC(10,2),
  max_price NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  tags TEXT[],
  genres TEXT[],
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_org ON events(organization_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);

-- Venues table
CREATE TABLE IF NOT EXISTS venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  venue_type TEXT DEFAULT 'indoor',
  address TEXT,
  city TEXT NOT NULL,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'USA',
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  capacity INT,
  phone TEXT,
  email TEXT,
  website TEXT,
  status TEXT DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venues_org ON venues(organization_id);
CREATE INDEX IF NOT EXISTS idx_venues_city ON venues(city);

-- Artists/Performers table
CREATE TABLE IF NOT EXISTS artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT,
  bio TEXT,
  artist_type TEXT DEFAULT 'band',
  genres TEXT[],
  hometown TEXT,
  country TEXT,
  website TEXT,
  email TEXT,
  phone TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'active',
  verified BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_artists_org ON artists(organization_id);
CREATE INDEX IF NOT EXISTS idx_artists_name ON artists(name);

-- Tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  ticket_type TEXT NOT NULL DEFAULT 'general',
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  quantity_available INT,
  quantity_sold INT DEFAULT 0,
  max_per_order INT DEFAULT 10,
  sale_start TIMESTAMPTZ,
  sale_end TIMESTAMPTZ,
  status TEXT DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_event ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES platform_users(id),
  event_id UUID REFERENCES events(id),
  order_number TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  subtotal NUMERIC(10,2) DEFAULT 0,
  tax NUMERIC(10,2) DEFAULT 0,
  fees NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  billing_name TEXT,
  billing_email TEXT,
  billing_phone TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, order_number)
);

CREATE INDEX IF NOT EXISTS idx_orders_org ON orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_event ON orders(event_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  contact_id UUID REFERENCES contacts(id),
  project_id UUID REFERENCES projects(id),
  status TEXT DEFAULT 'draft',
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal NUMERIC(15,2) DEFAULT 0,
  tax NUMERIC(15,2) DEFAULT 0,
  total_amount NUMERIC(15,2) DEFAULT 0,
  amount_paid NUMERIC(15,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  notes TEXT,
  terms TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, invoice_number)
);

CREATE INDEX IF NOT EXISTS idx_invoices_org ON invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- Bills table
CREATE TABLE IF NOT EXISTS bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  bill_number TEXT NOT NULL,
  vendor_id UUID REFERENCES vendors(id),
  status TEXT DEFAULT 'pending',
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  amount NUMERIC(15,2) DEFAULT 0,
  amount_paid NUMERIC(15,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, bill_number)
);

CREATE INDEX IF NOT EXISTS idx_bills_org ON bills(organization_id);
CREATE INDEX IF NOT EXISTS idx_bills_vendor ON bills(vendor_id);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);

-- Budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  planned_amount NUMERIC(15,2) DEFAULT 0,
  actual_amount NUMERIC(15,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'active',
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_budgets_org ON budgets(organization_id);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id),
  employee_id UUID REFERENCES employees(id),
  category TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(15,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  expense_date DATE DEFAULT CURRENT_DATE,
  status expense_status DEFAULT 'draft',
  receipt_url TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_org ON expenses(organization_id);
CREATE INDEX IF NOT EXISTS idx_expenses_project ON expenses(project_id);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);

-- COMPVSS Projects table
CREATE TABLE IF NOT EXISTS compvss_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planning',
  start_date DATE,
  end_date DATE,
  venue_id UUID REFERENCES venues(id),
  budget NUMERIC(15,2),
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compvss_projects_org ON compvss_projects(organization_id);

-- Merchandise products table
CREATE TABLE IF NOT EXISTS merchandise_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  cost NUMERIC(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  category TEXT,
  images TEXT[],
  stock_quantity INT DEFAULT 0,
  reorder_point INT DEFAULT 10,
  status TEXT DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_merchandise_products_org ON merchandise_products(organization_id);
CREATE INDEX IF NOT EXISTS idx_merchandise_products_status ON merchandise_products(status);

-- Enable RLS on foundation tables
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE compvss_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchandise_products ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON vendors TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON crew_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON employees TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON venues TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON artists TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tickets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON invoices TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON bills TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON budgets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON expenses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON compvss_projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON merchandise_products TO authenticated;

-- Basic RLS policies for foundation tables
CREATE POLICY vendors_org_policy ON vendors FOR ALL USING (org_matches(organization_id));
CREATE POLICY crew_members_org_policy ON crew_members FOR ALL USING (org_matches(organization_id));
CREATE POLICY employees_org_policy ON employees FOR ALL USING (org_matches(organization_id));
CREATE POLICY events_org_policy ON events FOR ALL USING (org_matches(organization_id));
CREATE POLICY venues_org_policy ON venues FOR ALL USING (organization_id IS NULL OR org_matches(organization_id));
CREATE POLICY artists_org_policy ON artists FOR ALL USING (organization_id IS NULL OR org_matches(organization_id));
CREATE POLICY tickets_org_policy ON tickets FOR ALL USING (org_matches(organization_id));
CREATE POLICY orders_org_policy ON orders FOR ALL USING (org_matches(organization_id));
CREATE POLICY invoices_org_policy ON invoices FOR ALL USING (org_matches(organization_id));
CREATE POLICY bills_org_policy ON bills FOR ALL USING (org_matches(organization_id));
CREATE POLICY budgets_org_policy ON budgets FOR ALL USING (org_matches(organization_id));
CREATE POLICY expenses_org_policy ON expenses FOR ALL USING (org_matches(organization_id));
CREATE POLICY compvss_projects_org_policy ON compvss_projects FOR ALL USING (org_matches(organization_id));
CREATE POLICY merchandise_products_org_policy ON merchandise_products FOR ALL USING (org_matches(organization_id));
