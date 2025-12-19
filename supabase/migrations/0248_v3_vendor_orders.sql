-- =============================================================================
-- V3 EXPANSION: VENDOR ORDER SYSTEM (VO-001, VO-002, VO-003)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- VENDOR ORDERS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vendor_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    production_id UUID REFERENCES productions(id) ON DELETE SET NULL,
    
    order_number TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'sent', 'confirmed', 'in_progress', 'delivered', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    subtotal DECIMAL(12,2) DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    
    delivery_date DATE,
    delivery_address JSONB,
    delivery_instructions TEXT,
    
    payment_terms TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'overdue', 'refunded')),
    
    approval_required BOOLEAN DEFAULT true,
    approval_threshold DECIMAL(12,2),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    
    sent_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    notes TEXT,
    internal_notes TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- VENDOR ORDER ITEMS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vendor_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES vendor_orders(id) ON DELETE CASCADE,
    catalog_item_id UUID REFERENCES catalog_items(id),
    
    line_number INTEGER NOT NULL,
    sku TEXT,
    name TEXT NOT NULL,
    description TEXT,
    
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit TEXT DEFAULT 'each',
    unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(order_id, line_number)
);

-- -----------------------------------------------------------------------------
-- VENDOR ORDER APPROVALS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vendor_order_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES vendor_orders(id) ON DELETE CASCADE,
    approver_id UUID NOT NULL REFERENCES auth.users(id),
    
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'delegated')),
    level INTEGER DEFAULT 1,
    
    notes TEXT,
    decision_at TIMESTAMPTZ,
    delegated_to UUID REFERENCES auth.users(id),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- RFP (REQUEST FOR PROPOSAL) TABLES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rfps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    production_id UUID REFERENCES productions(id) ON DELETE SET NULL,
    
    rfp_number TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    
    category TEXT,
    requirements JSONB DEFAULT '[]',
    specifications JSONB DEFAULT '{}',
    
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'closed', 'evaluating', 'awarded', 'cancelled')),
    
    submission_deadline TIMESTAMPTZ NOT NULL,
    questions_deadline TIMESTAMPTZ,
    decision_date DATE,
    
    budget_min DECIMAL(12,2),
    budget_max DECIMAL(12,2),
    currency TEXT DEFAULT 'USD',
    
    evaluation_criteria JSONB DEFAULT '[]',
    terms_and_conditions TEXT,
    
    published_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    awarded_at TIMESTAMPTZ,
    
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- RFP VENDORS (INVITED VENDORS)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rfp_vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfp_id UUID NOT NULL REFERENCES rfps(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
    
    status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'viewed', 'declined', 'submitted', 'withdrawn')),
    
    invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    viewed_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    declined_at TIMESTAMPTZ,
    decline_reason TEXT,
    
    notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(rfp_id, vendor_id)
);

-- -----------------------------------------------------------------------------
-- RFP QUOTES (VENDOR SUBMISSIONS)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rfp_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfp_id UUID NOT NULL REFERENCES rfps(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
    rfp_vendor_id UUID NOT NULL REFERENCES rfp_vendors(id) ON DELETE CASCADE,
    
    quote_number TEXT NOT NULL,
    
    line_items JSONB NOT NULL DEFAULT '[]',
    subtotal DECIMAL(12,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    
    delivery_timeline TEXT,
    valid_until DATE,
    
    proposal_text TEXT,
    attachments JSONB DEFAULT '[]',
    
    evaluation_scores JSONB DEFAULT '{}',
    total_score DECIMAL(5,2),
    ranking INTEGER,
    
    notes TEXT,
    internal_notes TEXT,
    
    submitted_at TIMESTAMPTZ,
    evaluated_at TIMESTAMPTZ,
    evaluated_by UUID REFERENCES auth.users(id),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- RFP AWARDS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rfp_awards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfp_id UUID NOT NULL REFERENCES rfps(id) ON DELETE CASCADE,
    quote_id UUID NOT NULL REFERENCES rfp_quotes(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
    
    award_reason TEXT,
    award_notes TEXT,
    
    final_amount DECIMAL(12,2),
    negotiated_terms TEXT,
    
    awarded_by UUID NOT NULL REFERENCES auth.users(id),
    awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    notification_sent_at TIMESTAMPTZ,
    vendor_accepted_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- PURCHASE ORDERS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
    vendor_order_id UUID REFERENCES vendor_orders(id) ON DELETE SET NULL,
    rfp_award_id UUID REFERENCES rfp_awards(id) ON DELETE SET NULL,
    
    po_number TEXT NOT NULL,
    revision_number INTEGER DEFAULT 1,
    
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'sent', 'acknowledged', 'in_progress', 'partial_received', 'received', 'completed', 'cancelled', 'disputed')),
    
    line_items JSONB NOT NULL DEFAULT '[]',
    subtotal DECIMAL(12,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    shipping_amount DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    
    ship_to_address JSONB,
    bill_to_address JSONB,
    
    payment_terms TEXT,
    delivery_terms TEXT,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    
    special_instructions TEXT,
    terms_and_conditions TEXT,
    
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    
    sent_at TIMESTAMPTZ,
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by TEXT,
    
    invoice_number TEXT,
    invoice_date DATE,
    invoice_amount DECIMAL(12,2),
    
    goods_received_note TEXT,
    
    notes TEXT,
    internal_notes TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(organization_id, po_number, revision_number)
);

-- -----------------------------------------------------------------------------
-- PURCHASE ORDER RECEIPTS (THREE-WAY MATCHING)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS po_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    
    receipt_number TEXT NOT NULL,
    receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    received_items JSONB NOT NULL DEFAULT '[]',
    total_value DECIMAL(12,2) DEFAULT 0,
    
    received_by UUID NOT NULL REFERENCES auth.users(id),
    
    condition_notes TEXT,
    discrepancies TEXT,
    photos JSONB DEFAULT '[]',
    
    quality_approved BOOLEAN DEFAULT false,
    quality_approved_by UUID REFERENCES auth.users(id),
    quality_approved_at TIMESTAMPTZ,
    
    notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- ADD MISSING COLUMNS TO EXISTING TABLES
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_orders' AND column_name = 'vendor_id') THEN
    ALTER TABLE vendor_orders ADD COLUMN vendor_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_orders' AND column_name = 'production_id') THEN
    ALTER TABLE vendor_orders ADD COLUMN production_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_orders' AND column_name = 'order_number') THEN
    ALTER TABLE vendor_orders ADD COLUMN order_number TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rfps' AND column_name = 'submission_deadline') THEN
    ALTER TABLE rfps ADD COLUMN submission_deadline TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rfp_vendors' AND column_name = 'vendor_id') THEN
    ALTER TABLE rfp_vendors ADD COLUMN vendor_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rfp_quotes' AND column_name = 'vendor_id') THEN
    ALTER TABLE rfp_quotes ADD COLUMN vendor_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rfp_quotes' AND column_name = 'ranking') THEN
    ALTER TABLE rfp_quotes ADD COLUMN ranking INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_orders' AND column_name = 'vendor_id') THEN
    ALTER TABLE purchase_orders ADD COLUMN vendor_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_orders' AND column_name = 'po_number') THEN
    ALTER TABLE purchase_orders ADD COLUMN po_number TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_order_items' AND column_name = 'catalog_item_id') THEN
    ALTER TABLE vendor_order_items ADD COLUMN catalog_item_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_order_approvals' AND column_name = 'approver_id') THEN
    ALTER TABLE vendor_order_approvals ADD COLUMN approver_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_order_approvals' AND column_name = 'status') THEN
    ALTER TABLE vendor_order_approvals ADD COLUMN status TEXT DEFAULT 'pending';
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- INDEXES
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_vendor_orders_org ON vendor_orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_vendor_orders_vendor ON vendor_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_orders_status ON vendor_orders(status);
CREATE INDEX IF NOT EXISTS idx_vendor_orders_booking ON vendor_orders(booking_id);
CREATE INDEX IF NOT EXISTS idx_vendor_orders_production ON vendor_orders(production_id);
CREATE INDEX IF NOT EXISTS idx_vendor_orders_order_number ON vendor_orders(order_number);

CREATE INDEX IF NOT EXISTS idx_vendor_order_items_order ON vendor_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_vendor_order_items_catalog ON vendor_order_items(catalog_item_id);

CREATE INDEX IF NOT EXISTS idx_vendor_order_approvals_order ON vendor_order_approvals(order_id);
CREATE INDEX IF NOT EXISTS idx_vendor_order_approvals_approver ON vendor_order_approvals(approver_id);
CREATE INDEX IF NOT EXISTS idx_vendor_order_approvals_status ON vendor_order_approvals(status);

CREATE INDEX IF NOT EXISTS idx_rfps_org ON rfps(organization_id);
CREATE INDEX IF NOT EXISTS idx_rfps_status ON rfps(status);
CREATE INDEX IF NOT EXISTS idx_rfps_deadline ON rfps(submission_deadline);

CREATE INDEX IF NOT EXISTS idx_rfp_vendors_rfp ON rfp_vendors(rfp_id);
CREATE INDEX IF NOT EXISTS idx_rfp_vendors_vendor ON rfp_vendors(vendor_id);
CREATE INDEX IF NOT EXISTS idx_rfp_vendors_status ON rfp_vendors(status);

CREATE INDEX IF NOT EXISTS idx_rfp_quotes_rfp ON rfp_quotes(rfp_id);
CREATE INDEX IF NOT EXISTS idx_rfp_quotes_vendor ON rfp_quotes(vendor_id);
CREATE INDEX IF NOT EXISTS idx_rfp_quotes_ranking ON rfp_quotes(rfp_id, ranking);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_org ON purchase_orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_vendor ON purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_po_number ON purchase_orders(po_number);

CREATE INDEX IF NOT EXISTS idx_po_receipts_po ON po_receipts(purchase_order_id);

-- -----------------------------------------------------------------------------
-- RLS POLICIES
-- -----------------------------------------------------------------------------
ALTER TABLE vendor_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_order_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfps ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfp_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfp_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfp_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE po_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY vendor_orders_org_access ON vendor_orders
    FOR ALL USING (org_matches(organization_id));

CREATE POLICY vendor_order_items_access ON vendor_order_items
    FOR ALL USING (order_id IN (
        SELECT id FROM vendor_orders WHERE org_matches(organization_id)
    ));

CREATE POLICY vendor_order_approvals_access ON vendor_order_approvals
    FOR ALL USING (order_id IN (
        SELECT id FROM vendor_orders WHERE org_matches(organization_id)
    ));

CREATE POLICY rfps_org_access ON rfps
    FOR ALL USING (org_matches(organization_id));

CREATE POLICY rfp_vendors_access ON rfp_vendors
    FOR ALL USING (rfp_id IN (
        SELECT id FROM rfps WHERE org_matches(organization_id)
    ));

CREATE POLICY rfp_quotes_access ON rfp_quotes
    FOR ALL USING (rfp_id IN (
        SELECT id FROM rfps WHERE org_matches(organization_id)
    ));

CREATE POLICY rfp_awards_access ON rfp_awards
    FOR ALL USING (rfp_id IN (
        SELECT id FROM rfps WHERE org_matches(organization_id)
    ));

CREATE POLICY purchase_orders_org_access ON purchase_orders
    FOR ALL USING (org_matches(organization_id));

CREATE POLICY po_receipts_access ON po_receipts
    FOR ALL USING (purchase_order_id IN (
        SELECT id FROM purchase_orders WHERE org_matches(organization_id)
    ));

-- -----------------------------------------------------------------------------
-- GRANTS
-- -----------------------------------------------------------------------------
GRANT ALL ON vendor_orders TO authenticated;
GRANT ALL ON vendor_order_items TO authenticated;
GRANT ALL ON vendor_order_approvals TO authenticated;
GRANT ALL ON rfps TO authenticated;
GRANT ALL ON rfp_vendors TO authenticated;
GRANT ALL ON rfp_quotes TO authenticated;
GRANT ALL ON rfp_awards TO authenticated;
GRANT ALL ON purchase_orders TO authenticated;
GRANT ALL ON po_receipts TO authenticated;

-- -----------------------------------------------------------------------------
-- TRIGGERS FOR UPDATED_AT
-- -----------------------------------------------------------------------------
CREATE TRIGGER set_vendor_orders_updated_at
    BEFORE UPDATE ON vendor_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_vendor_order_items_updated_at
    BEFORE UPDATE ON vendor_order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_vendor_order_approvals_updated_at
    BEFORE UPDATE ON vendor_order_approvals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_rfps_updated_at
    BEFORE UPDATE ON rfps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_rfp_vendors_updated_at
    BEFORE UPDATE ON rfp_vendors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_rfp_quotes_updated_at
    BEFORE UPDATE ON rfp_quotes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_purchase_orders_updated_at
    BEFORE UPDATE ON purchase_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_po_receipts_updated_at
    BEFORE UPDATE ON po_receipts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- ORDER NUMBER SEQUENCE FUNCTION
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_order_number(org_id UUID, prefix TEXT DEFAULT 'VO')
RETURNS TEXT AS $$
DECLARE
    next_num INTEGER;
    year_suffix TEXT;
BEGIN
    year_suffix := TO_CHAR(CURRENT_DATE, 'YY');
    
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(order_number FROM LENGTH(prefix) + 3) AS INTEGER)
    ), 0) + 1
    INTO next_num
    FROM vendor_orders
    WHERE organization_id = org_id
    AND order_number LIKE prefix || year_suffix || '%';
    
    RETURN prefix || year_suffix || LPAD(next_num::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_po_number(org_id UUID)
RETURNS TEXT AS $$
DECLARE
    next_num INTEGER;
    year_suffix TEXT;
BEGIN
    year_suffix := TO_CHAR(CURRENT_DATE, 'YY');
    
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(po_number FROM 4) AS INTEGER)
    ), 0) + 1
    INTO next_num
    FROM purchase_orders
    WHERE organization_id = org_id
    AND po_number LIKE 'PO' || year_suffix || '%';
    
    RETURN 'PO' || year_suffix || LPAD(next_num::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_rfp_number(org_id UUID)
RETURNS TEXT AS $$
DECLARE
    next_num INTEGER;
    year_suffix TEXT;
BEGIN
    year_suffix := TO_CHAR(CURRENT_DATE, 'YY');
    
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(rfp_number FROM 5) AS INTEGER)
    ), 0) + 1
    INTO next_num
    FROM rfps
    WHERE organization_id = org_id
    AND rfp_number LIKE 'RFP' || year_suffix || '%';
    
    RETURN 'RFP' || year_suffix || LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;
