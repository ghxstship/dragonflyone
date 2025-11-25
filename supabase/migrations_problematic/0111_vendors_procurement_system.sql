-- Migration: Vendors & Procurement System
-- Description: Tables for vendor management, purchase orders, and procurement

-- Vendors table (enhanced)
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  vendor_code TEXT NOT NULL,
  name TEXT NOT NULL,
  legal_name TEXT,
  dba_name TEXT,
  category TEXT NOT NULL CHECK (category IN ('equipment', 'av', 'staging', 'lighting', 'catering', 'transportation', 'security', 'staffing', 'venue', 'production', 'marketing', 'other')),
  subcategory TEXT,
  contact_name TEXT,
  contact_title TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  fax TEXT,
  website TEXT,
  address TEXT,
  address_2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'USA',
  billing_address TEXT,
  billing_city TEXT,
  billing_state TEXT,
  billing_postal_code TEXT,
  billing_country TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'inactive', 'suspended', 'blacklisted')),
  vendor_type TEXT DEFAULT 'supplier' CHECK (vendor_type IN ('supplier', 'contractor', 'service_provider', 'rental', 'manufacturer', 'distributor')),
  payment_terms TEXT DEFAULT 'net_30' CHECK (payment_terms IN ('due_on_receipt', 'net_15', 'net_30', 'net_45', 'net_60', 'net_90', 'custom')),
  payment_method TEXT CHECK (payment_method IN ('check', 'ach', 'wire', 'credit_card', 'paypal', 'other')),
  currency TEXT DEFAULT 'USD',
  tax_id TEXT,
  tax_exempt BOOLEAN DEFAULT false,
  tax_exempt_number TEXT,
  w9_on_file BOOLEAN DEFAULT false,
  w9_received_date DATE,
  insurance_on_file BOOLEAN DEFAULT false,
  insurance_expiry DATE,
  insurance_amount NUMERIC(15,2),
  coi_on_file BOOLEAN DEFAULT false,
  coi_expiry DATE,
  credit_limit NUMERIC(15,2),
  account_number TEXT,
  bank_name TEXT,
  bank_routing TEXT,
  bank_account TEXT,
  preferred BOOLEAN DEFAULT false,
  approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  rating NUMERIC(3,2) DEFAULT 0,
  total_orders INT DEFAULT 0,
  total_spend NUMERIC(15,2) DEFAULT 0,
  average_lead_time_days INT,
  on_time_delivery_rate NUMERIC(5,2),
  quality_rating NUMERIC(3,2),
  notes TEXT,
  internal_notes TEXT,
  tags TEXT[],
  custom_fields JSONB,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, vendor_code),
  UNIQUE(organization_id, email)
);

CREATE INDEX IF NOT EXISTS idx_vendors_org ON vendors(organization_id);
CREATE INDEX IF NOT EXISTS idx_vendors_code ON vendors(vendor_code);
CREATE INDEX IF NOT EXISTS idx_vendors_category ON vendors(category);
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);
CREATE INDEX IF NOT EXISTS idx_vendors_name ON vendors(name);
CREATE INDEX IF NOT EXISTS idx_vendors_preferred ON vendors(preferred);

-- Vendor contacts table
CREATE TABLE IF NOT EXISTS vendor_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  title TEXT,
  department TEXT,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  is_primary BOOLEAN DEFAULT false,
  is_billing_contact BOOLEAN DEFAULT false,
  is_technical_contact BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_contacts_vendor ON vendor_contacts(vendor_id);

-- Vendor documents table
CREATE TABLE IF NOT EXISTS vendor_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('w9', 'coi', 'insurance', 'contract', 'nda', 'sla', 'price_list', 'catalog', 'license', 'certification', 'other')),
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INT,
  expiration_date DATE,
  is_current BOOLEAN DEFAULT true,
  notes TEXT,
  uploaded_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_documents_vendor ON vendor_documents(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_documents_type ON vendor_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_vendor_documents_expiration ON vendor_documents(expiration_date);

-- Vendor activity log table
CREATE TABLE IF NOT EXISTS vendor_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('created', 'updated', 'status_changed', 'order_placed', 'payment_made', 'document_uploaded', 'rating_updated', 'note_added', 'contact_added')),
  description TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  metadata JSONB,
  user_id UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_activity_log_vendor ON vendor_activity_log(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_activity_log_type ON vendor_activity_log(activity_type);

-- Purchase orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  po_number TEXT NOT NULL,
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  project_id UUID REFERENCES projects(id),
  event_id UUID REFERENCES events(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'sent', 'acknowledged', 'partially_received', 'received', 'completed', 'cancelled', 'on_hold')),
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  required_date DATE,
  ship_date DATE,
  received_date DATE,
  ship_to_address TEXT,
  ship_to_city TEXT,
  ship_to_state TEXT,
  ship_to_postal_code TEXT,
  ship_to_country TEXT,
  shipping_method TEXT,
  shipping_cost NUMERIC(10,2) DEFAULT 0,
  subtotal NUMERIC(15,2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5,4) DEFAULT 0,
  tax_amount NUMERIC(15,2) DEFAULT 0,
  discount_amount NUMERIC(15,2) DEFAULT 0,
  total_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  payment_terms TEXT,
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'refunded')),
  amount_paid NUMERIC(15,2) DEFAULT 0,
  notes TEXT,
  internal_notes TEXT,
  terms_and_conditions TEXT,
  requested_by UUID REFERENCES platform_users(id),
  approved_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, po_number)
);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_org ON purchase_orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_number ON purchase_orders(po_number);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_vendor ON purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_project ON purchase_orders(project_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_date ON purchase_orders(order_date);

-- Purchase order line items table
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  line_number INT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('product', 'service', 'rental', 'labor', 'other')),
  description TEXT NOT NULL,
  sku TEXT,
  quantity NUMERIC(10,2) NOT NULL,
  unit TEXT DEFAULT 'each',
  unit_price NUMERIC(15,2) NOT NULL,
  discount_percent NUMERIC(5,2) DEFAULT 0,
  tax_rate NUMERIC(5,4) DEFAULT 0,
  line_total NUMERIC(15,2) NOT NULL,
  quantity_received NUMERIC(10,2) DEFAULT 0,
  asset_id UUID REFERENCES assets(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(purchase_order_id, line_number)
);

CREATE INDEX IF NOT EXISTS idx_purchase_order_items_po ON purchase_order_items(purchase_order_id);

-- Vendor ratings table
CREATE TABLE IF NOT EXISTS vendor_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  purchase_order_id UUID REFERENCES purchase_orders(id),
  project_id UUID REFERENCES projects(id),
  overall_rating INT NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  quality_rating INT CHECK (quality_rating BETWEEN 1 AND 5),
  delivery_rating INT CHECK (delivery_rating BETWEEN 1 AND 5),
  communication_rating INT CHECK (communication_rating BETWEEN 1 AND 5),
  price_rating INT CHECK (price_rating BETWEEN 1 AND 5),
  comments TEXT,
  would_recommend BOOLEAN,
  rated_by UUID NOT NULL REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_ratings_vendor ON vendor_ratings(vendor_id);

-- Function to generate vendor code
CREATE OR REPLACE FUNCTION generate_vendor_code(org_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_sequence INT;
  v_code TEXT;
BEGIN
  SELECT COALESCE(MAX(
    CASE WHEN vendor_code ~ '^VND-[0-9]+$'
    THEN CAST(SUBSTRING(vendor_code FROM 5) AS INT) ELSE 0 END
  ), 0) + 1 INTO v_sequence
  FROM vendors WHERE organization_id = org_id;
  
  v_code := 'VND-' || LPAD(v_sequence::TEXT, 5, '0');
  
  RETURN v_code;
END;
$$;

-- Function to update vendor stats
CREATE OR REPLACE FUNCTION update_vendor_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE vendors SET
      total_orders = (SELECT COUNT(*) FROM purchase_orders WHERE vendor_id = NEW.vendor_id AND status NOT IN ('draft', 'cancelled')),
      total_spend = (SELECT COALESCE(SUM(total_amount), 0) FROM purchase_orders WHERE vendor_id = NEW.vendor_id AND status = 'completed'),
      updated_at = NOW()
    WHERE id = NEW.vendor_id;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS vendor_stats_trigger ON purchase_orders;
CREATE TRIGGER vendor_stats_trigger
  AFTER INSERT OR UPDATE ON purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_vendor_stats();

-- Function to update vendor rating
CREATE OR REPLACE FUNCTION update_vendor_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_avg_rating NUMERIC;
  v_avg_quality NUMERIC;
BEGIN
  SELECT 
    AVG(overall_rating),
    AVG(quality_rating)
  INTO v_avg_rating, v_avg_quality
  FROM vendor_ratings
  WHERE vendor_id = NEW.vendor_id;
  
  UPDATE vendors SET
    rating = ROUND(v_avg_rating, 2),
    quality_rating = ROUND(v_avg_quality, 2),
    updated_at = NOW()
  WHERE id = NEW.vendor_id;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS vendor_rating_trigger ON vendor_ratings;
CREATE TRIGGER vendor_rating_trigger
  AFTER INSERT OR UPDATE ON vendor_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_vendor_rating();

-- Function to calculate PO totals
CREATE OR REPLACE FUNCTION calculate_po_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_subtotal NUMERIC;
  v_tax NUMERIC;
  v_total NUMERIC;
BEGIN
  SELECT 
    COALESCE(SUM(line_total), 0)
  INTO v_subtotal
  FROM purchase_order_items
  WHERE purchase_order_id = NEW.purchase_order_id;
  
  UPDATE purchase_orders SET
    subtotal = v_subtotal,
    tax_amount = v_subtotal * tax_rate,
    total_amount = v_subtotal + (v_subtotal * tax_rate) + shipping_cost - discount_amount,
    updated_at = NOW()
  WHERE id = NEW.purchase_order_id;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS po_totals_trigger ON purchase_order_items;
CREATE TRIGGER po_totals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON purchase_order_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_po_totals();

-- RLS policies
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_ratings ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON vendors TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON vendor_contacts TO authenticated;
GRANT SELECT, INSERT, DELETE ON vendor_documents TO authenticated;
GRANT SELECT, INSERT ON vendor_activity_log TO authenticated;
GRANT SELECT, INSERT, UPDATE ON purchase_orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON purchase_order_items TO authenticated;
GRANT SELECT, INSERT ON vendor_ratings TO authenticated;
GRANT EXECUTE ON FUNCTION generate_vendor_code(UUID) TO authenticated;
