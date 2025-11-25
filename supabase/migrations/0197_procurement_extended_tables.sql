-- Migration: Extended Procurement Tables
-- Description: Tables for PO receiving, three-way match, and vendor management

-- PO receipts table
CREATE TABLE IF NOT EXISTS po_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id),
  received_date TIMESTAMPTZ NOT NULL,
  received_by UUID NOT NULL REFERENCES platform_users(id),
  delivery_notes TEXT,
  carrier VARCHAR(100),
  tracking_number VARCHAR(100),
  packing_slip_number VARCHAR(100),
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'partial', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PO receipt items table
CREATE TABLE IF NOT EXISTS po_receipt_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID NOT NULL REFERENCES po_receipts(id) ON DELETE CASCADE,
  po_line_id UUID NOT NULL,
  quantity_received DECIMAL(10, 2) NOT NULL,
  condition VARCHAR(20) NOT NULL CHECK (condition IN ('good', 'damaged', 'partial', 'rejected')),
  notes TEXT,
  photos TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendor invoices table
CREATE TABLE IF NOT EXISTS vendor_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  purchase_order_id UUID REFERENCES purchase_orders(id),
  invoice_number VARCHAR(100) NOT NULL,
  invoice_date TIMESTAMPTZ NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  subtotal DECIMAL(14, 2) NOT NULL,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(14, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_terms VARCHAR(50),
  notes TEXT,
  document_url TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'disputed', 'paid', 'voided')),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES platform_users(id),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendor invoice items table
CREATE TABLE IF NOT EXISTS vendor_invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES vendor_invoices(id) ON DELETE CASCADE,
  po_line_id UUID,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Three-way matches table
CREATE TABLE IF NOT EXISTS three_way_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id),
  receipt_id UUID NOT NULL REFERENCES po_receipts(id),
  invoice_id UUID NOT NULL REFERENCES vendor_invoices(id),
  po_amount DECIMAL(14, 2) NOT NULL,
  invoice_amount DECIMAL(14, 2) NOT NULL,
  variance DECIMAL(12, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'variance', 'approved', 'rejected')),
  matched_at TIMESTAMPTZ,
  approved_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendor payment terms table
CREATE TABLE IF NOT EXISTS vendor_payment_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  term_name VARCHAR(50) NOT NULL,
  days_due INTEGER NOT NULL,
  discount_percent DECIMAL(5, 2),
  discount_days INTEGER,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Preferred vendors table
CREATE TABLE IF NOT EXISTS preferred_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  category VARCHAR(100) NOT NULL,
  priority INTEGER DEFAULT 1,
  negotiated_discount DECIMAL(5, 2),
  contract_id UUID REFERENCES contracts(id),
  valid_from TIMESTAMPTZ,
  valid_to TIMESTAMPTZ,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns to purchase_orders if not exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_orders' AND column_name = 'acknowledged_at') THEN
    ALTER TABLE purchase_orders ADD COLUMN acknowledged_at TIMESTAMPTZ;
    ALTER TABLE purchase_orders ADD COLUMN acknowledged_by VARCHAR(200);
    ALTER TABLE purchase_orders ADD COLUMN expected_delivery TIMESTAMPTZ;
    ALTER TABLE purchase_orders ADD COLUMN acknowledgment_notes TEXT;
  END IF;
END $$;

-- Add quantity_received to po_line_items if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'po_line_items' AND column_name = 'quantity_received') THEN
    ALTER TABLE po_line_items ADD COLUMN quantity_received DECIMAL(10, 2) DEFAULT 0;
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_po_receipts_po ON po_receipts(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_po_receipts_date ON po_receipts(received_date);
CREATE INDEX IF NOT EXISTS idx_po_receipt_items_receipt ON po_receipt_items(receipt_id);
CREATE INDEX IF NOT EXISTS idx_po_receipt_items_line ON po_receipt_items(po_line_id);
CREATE INDEX IF NOT EXISTS idx_vendor_invoices_vendor ON vendor_invoices(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_invoices_po ON vendor_invoices(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_vendor_invoices_status ON vendor_invoices(status);
CREATE INDEX IF NOT EXISTS idx_vendor_invoice_items_invoice ON vendor_invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_three_way_matches_po ON three_way_matches(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_three_way_matches_status ON three_way_matches(status);
CREATE INDEX IF NOT EXISTS idx_vendor_payment_terms_vendor ON vendor_payment_terms(vendor_id);
CREATE INDEX IF NOT EXISTS idx_preferred_vendors_vendor ON preferred_vendors(vendor_id);
CREATE INDEX IF NOT EXISTS idx_preferred_vendors_category ON preferred_vendors(category);

-- RLS Policies
ALTER TABLE po_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE po_receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE three_way_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_payment_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE preferred_vendors ENABLE ROW LEVEL SECURITY;

-- View policies
CREATE POLICY po_receipts_view ON po_receipts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY po_receipt_items_view ON po_receipt_items FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY vendor_invoices_view ON vendor_invoices FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY vendor_invoice_items_view ON vendor_invoice_items FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY three_way_matches_view ON three_way_matches FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY vendor_payment_terms_view ON vendor_payment_terms FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY preferred_vendors_view ON preferred_vendors FOR SELECT USING (auth.uid() IS NOT NULL);

-- Manage policies
CREATE POLICY po_receipts_manage ON po_receipts FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND ('ATLVS_TEAM_MEMBER' = ANY(platform_roles) OR 'ATLVS_ADMIN' = ANY(platform_roles)))
);

CREATE POLICY vendor_invoices_manage ON vendor_invoices FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND ('ATLVS_TEAM_MEMBER' = ANY(platform_roles) OR 'ATLVS_ADMIN' = ANY(platform_roles)))
);

CREATE POLICY three_way_matches_manage ON three_way_matches FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND ('ATLVS_TEAM_MEMBER' = ANY(platform_roles) OR 'ATLVS_ADMIN' = ANY(platform_roles)))
);

-- Function to validate three-way match
CREATE OR REPLACE FUNCTION validate_three_way_match(
  p_po_id UUID,
  p_receipt_id UUID,
  p_invoice_id UUID
)
RETURNS TABLE (
  is_valid BOOLEAN,
  po_total DECIMAL,
  receipt_total DECIMAL,
  invoice_total DECIMAL,
  variance DECIMAL
) AS $$
DECLARE
  v_po_total DECIMAL;
  v_receipt_total DECIMAL;
  v_invoice_total DECIMAL;
BEGIN
  -- Get PO total
  SELECT total_amount INTO v_po_total
  FROM purchase_orders WHERE id = p_po_id;

  -- Get receipt total (based on received quantities * PO unit prices)
  SELECT COALESCE(SUM(ri.quantity_received * pli.unit_price), 0) INTO v_receipt_total
  FROM po_receipt_items ri
  JOIN po_line_items pli ON ri.po_line_id = pli.id
  WHERE ri.receipt_id = p_receipt_id;

  -- Get invoice total
  SELECT total_amount INTO v_invoice_total
  FROM vendor_invoices WHERE id = p_invoice_id;

  RETURN QUERY SELECT 
    ABS(v_po_total - v_invoice_total) < 0.01 AND ABS(v_receipt_total - v_invoice_total) < 0.01,
    v_po_total,
    v_receipt_total,
    v_invoice_total,
    ABS(v_po_total - v_invoice_total);
END;
$$ LANGUAGE plpgsql;
