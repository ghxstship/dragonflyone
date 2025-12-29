-- ============================================================================
-- 0013_operational_procurement.sql
-- Operational Procurement Tables: Vendors, Requests, Approvals
-- GHXSTSHIP Platform - 3NF Gap Remediation
-- ============================================================================

-- ============================================================================
-- ENUM TYPES FOR PROCUREMENT
-- ============================================================================

CREATE TYPE procurement_status AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'ordered', 'received', 'closed', 'cancelled');
CREATE TYPE vendor_status AS ENUM ('pending', 'approved', 'suspended', 'inactive');

-- ============================================================================
-- PROCUREMENT VENDORS (Operational Vendor Records)
-- ============================================================================

CREATE TABLE procurement_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  legend_org_id UUID REFERENCES legend_organizations(id) ON DELETE SET NULL,
  vendor_code TEXT NOT NULL,
  name TEXT NOT NULL,
  legal_name TEXT,
  category TEXT,
  subcategory TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'USA',
  status vendor_status NOT NULL DEFAULT 'pending',
  payment_terms TEXT DEFAULT 'net_30',
  currency TEXT DEFAULT 'USD',
  tax_id TEXT,
  w9_on_file BOOLEAN DEFAULT false,
  insurance_on_file BOOLEAN DEFAULT false,
  insurance_expiry DATE,
  credit_limit NUMERIC(12,2),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  primary_contact_name TEXT,
  primary_contact_email TEXT,
  primary_contact_phone TEXT,
  notes TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES platform_users(id),
  approved_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, vendor_code)
);

CREATE INDEX idx_procurement_vendors_org ON procurement_vendors(organization_id);
CREATE INDEX idx_procurement_vendors_status ON procurement_vendors(organization_id, status);
CREATE INDEX idx_procurement_vendors_category ON procurement_vendors(organization_id, category);
CREATE INDEX idx_procurement_vendors_legend ON procurement_vendors(legend_org_id);

-- ============================================================================
-- PROCUREMENT REQUESTS
-- ============================================================================

CREATE TABLE procurement_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  request_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  department_id UUID REFERENCES legend_departments(id),
  cost_center_id UUID REFERENCES legend_cost_centers(id),
  vendor_id UUID REFERENCES procurement_vendors(id),
  preferred_vendor_name TEXT,
  status procurement_status NOT NULL DEFAULT 'draft',
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  requested_by UUID NOT NULL REFERENCES platform_users(id),
  requested_date DATE NOT NULL DEFAULT CURRENT_DATE,
  needed_by_date DATE,
  estimated_total NUMERIC(14,2),
  approved_total NUMERIC(14,2),
  currency TEXT DEFAULT 'USD',
  justification TEXT,
  budget_code TEXT,
  gl_account_id UUID REFERENCES ledger_accounts(id),
  approved_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  purchase_order_id UUID REFERENCES finance_purchase_orders(id),
  notes TEXT,
  attachments TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, request_number)
);

CREATE INDEX idx_procurement_requests_org ON procurement_requests(organization_id, requested_date DESC);
CREATE INDEX idx_procurement_requests_status ON procurement_requests(organization_id, status);
CREATE INDEX idx_procurement_requests_requester ON procurement_requests(requested_by);
CREATE INDEX idx_procurement_requests_project ON procurement_requests(project_id);
CREATE INDEX idx_procurement_requests_vendor ON procurement_requests(vendor_id);

-- ============================================================================
-- PROCUREMENT REQUEST ITEMS
-- ============================================================================

CREATE TABLE procurement_request_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES procurement_requests(id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL,
  product_id UUID REFERENCES legend_products(id),
  description TEXT NOT NULL,
  specifications TEXT,
  quantity NUMERIC(10,2) NOT NULL CHECK (quantity > 0),
  unit TEXT DEFAULT 'each',
  estimated_unit_cost NUMERIC(12,2),
  estimated_total NUMERIC(14,2) GENERATED ALWAYS AS (quantity * estimated_unit_cost) STORED,
  approved_unit_cost NUMERIC(12,2),
  approved_total NUMERIC(14,2),
  vendor_id UUID REFERENCES procurement_vendors(id),
  vendor_part_number TEXT,
  gl_account_id UUID REFERENCES ledger_accounts(id),
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(request_id, line_number)
);

CREATE INDEX idx_procurement_items_request ON procurement_request_items(request_id);
CREATE INDEX idx_procurement_items_product ON procurement_request_items(product_id);

-- ============================================================================
-- VENDOR CONTRACTS
-- ============================================================================

CREATE TABLE vendor_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES procurement_vendors(id) ON DELETE CASCADE,
  contract_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  contract_type TEXT DEFAULT 'standard' CHECK (contract_type IN ('standard', 'master', 'blanket', 'framework', 'nda', 'sla')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_signature', 'active', 'expired', 'terminated', 'renewed')),
  effective_date DATE,
  expiration_date DATE,
  auto_renew BOOLEAN DEFAULT false,
  renewal_notice_days INTEGER DEFAULT 30,
  total_value NUMERIC(14,2),
  currency TEXT DEFAULT 'USD',
  payment_terms TEXT,
  document_id UUID REFERENCES legend_documents(id),
  signed_by_us UUID REFERENCES platform_users(id),
  signed_by_us_at TIMESTAMPTZ,
  signed_by_vendor TEXT,
  signed_by_vendor_at TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, contract_number)
);

CREATE INDEX idx_vendor_contracts_org ON vendor_contracts(organization_id);
CREATE INDEX idx_vendor_contracts_vendor ON vendor_contracts(vendor_id);
CREATE INDEX idx_vendor_contracts_status ON vendor_contracts(status);
CREATE INDEX idx_vendor_contracts_expiry ON vendor_contracts(expiration_date) WHERE status = 'active';

-- ============================================================================
-- VENDOR CATALOG ITEMS (Vendor-specific pricing)
-- ============================================================================

CREATE TABLE vendor_catalog_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES procurement_vendors(id) ON DELETE CASCADE,
  product_id UUID REFERENCES legend_products(id),
  vendor_sku TEXT,
  vendor_product_name TEXT NOT NULL,
  description TEXT,
  unit TEXT DEFAULT 'each',
  unit_price NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  minimum_order_qty NUMERIC(10,2) DEFAULT 1,
  lead_time_days INTEGER,
  is_preferred BOOLEAN DEFAULT false,
  contract_id UUID REFERENCES vendor_contracts(id),
  effective_from DATE DEFAULT CURRENT_DATE,
  effective_to DATE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vendor_catalog_org ON vendor_catalog_items(organization_id);
CREATE INDEX idx_vendor_catalog_vendor ON vendor_catalog_items(vendor_id);
CREATE INDEX idx_vendor_catalog_product ON vendor_catalog_items(product_id);
CREATE INDEX idx_vendor_catalog_sku ON vendor_catalog_items(vendor_id, vendor_sku);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE procurement_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE procurement_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE procurement_request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_catalog_items ENABLE ROW LEVEL SECURITY;

-- Procurement Vendors policies
CREATE POLICY procurement_vendors_select ON procurement_vendors FOR SELECT USING (org_matches(organization_id));
CREATE POLICY procurement_vendors_insert ON procurement_vendors FOR INSERT WITH CHECK (org_matches(organization_id) AND role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'PROCUREMENT_MANAGER', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY procurement_vendors_update ON procurement_vendors FOR UPDATE USING (org_matches(organization_id) AND role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'PROCUREMENT_MANAGER', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY procurement_vendors_delete ON procurement_vendors FOR DELETE USING (org_matches(organization_id) AND role_in('ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Procurement Requests policies
CREATE POLICY procurement_requests_select ON procurement_requests FOR SELECT USING (
  org_matches(organization_id) AND (
    requested_by = current_platform_user_id()
    OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'PROCUREMENT_MANAGER', 'FINANCE_ADMIN', 'LEGEND_SUPER_ADMIN')
  )
);
CREATE POLICY procurement_requests_insert ON procurement_requests FOR INSERT WITH CHECK (org_matches(organization_id));
CREATE POLICY procurement_requests_update ON procurement_requests FOR UPDATE USING (
  org_matches(organization_id) AND (
    (status IN ('draft', 'rejected') AND requested_by = current_platform_user_id())
    OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'PROCUREMENT_MANAGER', 'LEGEND_SUPER_ADMIN')
  )
);
CREATE POLICY procurement_requests_delete ON procurement_requests FOR DELETE USING (
  org_matches(organization_id) AND status = 'draft' AND (
    requested_by = current_platform_user_id()
    OR role_in('ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  )
);

-- Procurement Request Items policies
CREATE POLICY procurement_items_select ON procurement_request_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM procurement_requests r WHERE r.id = request_id AND org_matches(r.organization_id))
);
CREATE POLICY procurement_items_manage ON procurement_request_items FOR ALL USING (
  EXISTS (SELECT 1 FROM procurement_requests r WHERE r.id = request_id AND org_matches(r.organization_id) AND (
    r.requested_by = current_platform_user_id()
    OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'PROCUREMENT_MANAGER', 'LEGEND_SUPER_ADMIN')
  ))
);

-- Vendor Contracts policies
CREATE POLICY vendor_contracts_select ON vendor_contracts FOR SELECT USING (org_matches(organization_id) AND role_in('ATLVS_VIEWER', 'ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'PROCUREMENT_MANAGER', 'FINANCE_ADMIN', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY vendor_contracts_manage ON vendor_contracts FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'PROCUREMENT_MANAGER', 'LEGEND_SUPER_ADMIN'));

-- Vendor Catalog policies
CREATE POLICY vendor_catalog_select ON vendor_catalog_items FOR SELECT USING (org_matches(organization_id));
CREATE POLICY vendor_catalog_manage ON vendor_catalog_items FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'PROCUREMENT_MANAGER', 'LEGEND_SUPER_ADMIN'));

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON procurement_vendors TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON procurement_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON procurement_request_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON vendor_contracts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON vendor_catalog_items TO authenticated;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER procurement_vendors_updated_at BEFORE UPDATE ON procurement_vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER procurement_requests_updated_at BEFORE UPDATE ON procurement_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER vendor_contracts_updated_at BEFORE UPDATE ON vendor_contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER vendor_catalog_updated_at BEFORE UPDATE ON vendor_catalog_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
