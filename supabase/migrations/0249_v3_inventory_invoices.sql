-- V3 Expansion: Inventory Management and Vendor Invoices
-- Migration: 0050_v3_inventory_invoices.sql
-- Features: IM-001 Equipment Inventory, VF-001 Vendor Invoice Management

-- ============================================================================
-- INVENTORY MANAGEMENT (IM-001)
-- ============================================================================

-- Inventory Items Table
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    catalog_item_id UUID REFERENCES public.catalog_items(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    serial_number TEXT,
    barcode TEXT,
    asset_tag TEXT,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'reserved', 'maintenance', 'retired', 'lost')),
    condition TEXT DEFAULT 'good' CHECK (condition IN ('new', 'excellent', 'good', 'fair', 'poor', 'damaged')),
    location TEXT,
    storage_location TEXT,
    purchase_date DATE,
    purchase_price NUMERIC(12,2),
    purchase_vendor_id UUID REFERENCES public.vendor_profiles(id) ON DELETE SET NULL,
    warranty_expiry DATE,
    depreciation_rate NUMERIC(5,2),
    current_value NUMERIC(12,2),
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inventory Transactions Table
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('check_out', 'check_in', 'transfer', 'maintenance', 'adjustment', 'retire', 'purchase')),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    from_location TEXT,
    to_location TEXT,
    quantity INTEGER DEFAULT 1,
    performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    expected_return_date DATE,
    actual_return_date DATE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inventory Maintenance Table
CREATE TABLE IF NOT EXISTS public.inventory_maintenance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    maintenance_type TEXT NOT NULL CHECK (maintenance_type IN ('preventive', 'corrective', 'calibration', 'inspection', 'repair', 'upgrade')),
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'deferred')),
    scheduled_date DATE NOT NULL,
    completed_date DATE,
    performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    vendor_id UUID REFERENCES public.vendor_profiles(id) ON DELETE SET NULL,
    cost NUMERIC(12,2),
    parts_used JSONB DEFAULT '[]',
    notes TEXT,
    next_scheduled DATE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- VENDOR INVOICE MANAGEMENT (VF-001)
-- ============================================================================

-- Vendor Invoices Table (Accounts Payable)
CREATE TABLE IF NOT EXISTS public.vendor_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    vendor_profile_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE RESTRICT,
    purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE SET NULL,
    vendor_order_id UUID REFERENCES public.vendor_orders(id) ON DELETE SET NULL,
    invoice_number TEXT NOT NULL,
    vendor_invoice_number TEXT,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    payment_terms TEXT,
    line_items JSONB NOT NULL DEFAULT '[]',
    subtotal NUMERIC(12,2) NOT NULL,
    tax_amount NUMERIC(12,2) DEFAULT 0,
    discount_amount NUMERIC(12,2) DEFAULT 0,
    shipping_amount NUMERIC(12,2) DEFAULT 0,
    total NUMERIC(12,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'approved', 'disputed', 'paid', 'partial', 'cancelled', 'void')),
    payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'overpaid')),
    amount_paid NUMERIC(12,2) DEFAULT 0,
    amount_due NUMERIC(12,2) GENERATED ALWAYS AS (total - COALESCE(amount_paid, 0)) STORED,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    dispute_reason TEXT,
    notes TEXT,
    internal_notes TEXT,
    attachments JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(organization_id, invoice_number)
);

-- Vendor Payments Table
CREATE TABLE IF NOT EXISTS public.vendor_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    vendor_invoice_id UUID NOT NULL REFERENCES public.vendor_invoices(id) ON DELETE RESTRICT,
    amount NUMERIC(12,2) NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('check', 'ach', 'wire', 'credit_card', 'cash', 'other')),
    reference_number TEXT,
    check_number TEXT,
    payment_date DATE NOT NULL,
    bank_account TEXT,
    notes TEXT,
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'reversed')),
    processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Project Costs Table
CREATE TABLE IF NOT EXISTS public.project_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    subcategory TEXT,
    vendor_profile_id UUID REFERENCES public.vendor_profiles(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    budgeted_amount NUMERIC(12,2) DEFAULT 0,
    estimated_amount NUMERIC(12,2) DEFAULT 0,
    actual_amount NUMERIC(12,2) DEFAULT 0,
    committed_amount NUMERIC(12,2) DEFAULT 0,
    variance NUMERIC(12,2) GENERATED ALWAYS AS (COALESCE(budgeted_amount, 0) - COALESCE(actual_amount, 0)) STORED,
    status TEXT DEFAULT 'budgeted' CHECK (status IN ('budgeted', 'committed', 'invoiced', 'paid')),
    notes TEXT,
    invoice_id UUID REFERENCES public.vendor_invoices(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================================================
DO $$
BEGIN
  -- Vendor Invoices columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_invoices' AND column_name = 'organization_id') THEN
    ALTER TABLE vendor_invoices ADD COLUMN organization_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_invoices' AND column_name = 'vendor_profile_id') THEN
    ALTER TABLE vendor_invoices ADD COLUMN vendor_profile_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_invoices' AND column_name = 'status') THEN
    ALTER TABLE vendor_invoices ADD COLUMN status TEXT DEFAULT 'pending';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_invoices' AND column_name = 'payment_status') THEN
    ALTER TABLE vendor_invoices ADD COLUMN payment_status TEXT DEFAULT 'unpaid';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_invoices' AND column_name = 'due_date') THEN
    ALTER TABLE vendor_invoices ADD COLUMN due_date DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_invoices' AND column_name = 'purchase_order_id') THEN
    ALTER TABLE vendor_invoices ADD COLUMN purchase_order_id UUID;
  END IF;
  -- Vendor Payments columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_payments' AND column_name = 'organization_id') THEN
    ALTER TABLE vendor_payments ADD COLUMN organization_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_payments' AND column_name = 'vendor_invoice_id') THEN
    ALTER TABLE vendor_payments ADD COLUMN vendor_invoice_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_payments' AND column_name = 'payment_date') THEN
    ALTER TABLE vendor_payments ADD COLUMN payment_date DATE;
  END IF;
END $$;

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Inventory Items
CREATE INDEX IF NOT EXISTS idx_inventory_items_org ON public.inventory_items(organization_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_status ON public.inventory_items(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_inventory_items_barcode ON public.inventory_items(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inventory_items_serial ON public.inventory_items(serial_number) WHERE serial_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inventory_items_catalog ON public.inventory_items(catalog_item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_maintenance ON public.inventory_items(next_maintenance_date) WHERE next_maintenance_date IS NOT NULL;

-- Inventory Transactions
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_item ON public.inventory_transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_booking ON public.inventory_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type ON public.inventory_transactions(organization_id, transaction_type);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_date ON public.inventory_transactions(created_at);

-- Inventory Maintenance
CREATE INDEX IF NOT EXISTS idx_inventory_maintenance_item ON public.inventory_maintenance(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_maintenance_status ON public.inventory_maintenance(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_inventory_maintenance_scheduled ON public.inventory_maintenance(scheduled_date);

-- Vendor Invoices
CREATE INDEX IF NOT EXISTS idx_vendor_invoices_org ON public.vendor_invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_vendor_invoices_vendor ON public.vendor_invoices(vendor_profile_id);
CREATE INDEX IF NOT EXISTS idx_vendor_invoices_status ON public.vendor_invoices(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_vendor_invoices_payment_status ON public.vendor_invoices(organization_id, payment_status);
CREATE INDEX IF NOT EXISTS idx_vendor_invoices_due_date ON public.vendor_invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_vendor_invoices_po ON public.vendor_invoices(purchase_order_id);

-- Vendor Payments
CREATE INDEX IF NOT EXISTS idx_vendor_payments_invoice ON public.vendor_payments(vendor_invoice_id);
CREATE INDEX IF NOT EXISTS idx_vendor_payments_date ON public.vendor_payments(payment_date);

-- Project Costs
CREATE INDEX IF NOT EXISTS idx_project_costs_booking ON public.project_costs(booking_id);
CREATE INDEX IF NOT EXISTS idx_project_costs_event ON public.project_costs(event_id);
CREATE INDEX IF NOT EXISTS idx_project_costs_category ON public.project_costs(organization_id, category);
CREATE INDEX IF NOT EXISTS idx_project_costs_vendor ON public.project_costs(vendor_profile_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_costs ENABLE ROW LEVEL SECURITY;

-- Inventory Items Policies
CREATE POLICY "Users can view inventory in their organization" ON public.inventory_items
    FOR SELECT USING (org_matches(organization_id));

CREATE POLICY "Users can manage inventory in their organization" ON public.inventory_items
    FOR ALL USING (org_matches(organization_id));

-- Inventory Transactions Policies
CREATE POLICY "Users can view transactions in their organization" ON public.inventory_transactions
    FOR SELECT USING (org_matches(organization_id));

CREATE POLICY "Users can create transactions in their organization" ON public.inventory_transactions
    FOR INSERT WITH CHECK (org_matches(organization_id));

-- Inventory Maintenance Policies
CREATE POLICY "Users can view maintenance in their organization" ON public.inventory_maintenance
    FOR SELECT USING (org_matches(organization_id));

CREATE POLICY "Users can manage maintenance in their organization" ON public.inventory_maintenance
    FOR ALL USING (org_matches(organization_id));

-- Vendor Invoices Policies
CREATE POLICY "Users can view invoices in their organization" ON public.vendor_invoices
    FOR SELECT USING (org_matches(organization_id));

CREATE POLICY "Users can manage invoices in their organization" ON public.vendor_invoices
    FOR ALL USING (org_matches(organization_id));

-- Vendor Payments Policies
CREATE POLICY "Users can view payments in their organization" ON public.vendor_payments
    FOR SELECT USING (org_matches(organization_id));

CREATE POLICY "Users can manage payments in their organization" ON public.vendor_payments
    FOR ALL USING (org_matches(organization_id));

-- Project Costs Policies
CREATE POLICY "Users can view costs in their organization" ON public.project_costs
    FOR SELECT USING (org_matches(organization_id));

CREATE POLICY "Users can manage costs in their organization" ON public.project_costs
    FOR ALL USING (org_matches(organization_id));

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT ALL ON public.inventory_items TO authenticated;
GRANT ALL ON public.inventory_transactions TO authenticated;
GRANT ALL ON public.inventory_maintenance TO authenticated;
GRANT ALL ON public.vendor_invoices TO authenticated;
GRANT ALL ON public.vendor_payments TO authenticated;
GRANT ALL ON public.project_costs TO authenticated;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Create set_updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_inventory_items_updated_at ON public.inventory_items;
CREATE TRIGGER set_inventory_items_updated_at
    BEFORE UPDATE ON public.inventory_items
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_inventory_maintenance_updated_at ON public.inventory_maintenance;
CREATE TRIGGER set_inventory_maintenance_updated_at
    BEFORE UPDATE ON public.inventory_maintenance
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_vendor_invoices_updated_at ON public.vendor_invoices;
CREATE TRIGGER set_vendor_invoices_updated_at
    BEFORE UPDATE ON public.vendor_invoices
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_vendor_payments_updated_at ON public.vendor_payments;
CREATE TRIGGER set_vendor_payments_updated_at
    BEFORE UPDATE ON public.vendor_payments
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_project_costs_updated_at ON public.project_costs;
CREATE TRIGGER set_project_costs_updated_at
    BEFORE UPDATE ON public.project_costs
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Generate unique inventory invoice number
CREATE OR REPLACE FUNCTION generate_vendor_invoice_number(org_id UUID)
RETURNS TEXT AS $$
DECLARE
    next_num INTEGER;
    year_suffix TEXT;
BEGIN
    SELECT COUNT(*) + 1 INTO next_num
    FROM public.vendor_invoices
    WHERE organization_id = org_id
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);
    
    year_suffix := TO_CHAR(CURRENT_DATE, 'YY');
    RETURN 'VINV' || year_suffix || LPAD(next_num::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Update invoice payment status when payment is added
CREATE OR REPLACE FUNCTION update_invoice_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.vendor_invoices
    SET 
        amount_paid = (
            SELECT COALESCE(SUM(amount), 0)
            FROM public.vendor_payments
            WHERE vendor_invoice_id = NEW.vendor_invoice_id
            AND status = 'completed'
        ),
        payment_status = CASE
            WHEN (SELECT COALESCE(SUM(amount), 0) FROM public.vendor_payments WHERE vendor_invoice_id = NEW.vendor_invoice_id AND status = 'completed') >= total THEN 'paid'
            WHEN (SELECT COALESCE(SUM(amount), 0) FROM public.vendor_payments WHERE vendor_invoice_id = NEW.vendor_invoice_id AND status = 'completed') > 0 THEN 'partial'
            ELSE 'unpaid'
        END,
        updated_at = now()
    WHERE id = NEW.vendor_invoice_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invoice_on_payment
    AFTER INSERT OR UPDATE ON public.vendor_payments
    FOR EACH ROW EXECUTE FUNCTION update_invoice_payment_status();

-- Update inventory item status on transaction
CREATE OR REPLACE FUNCTION update_inventory_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.transaction_type = 'check_out' THEN
        UPDATE public.inventory_items
        SET status = 'in_use', location = NEW.to_location, updated_at = now()
        WHERE id = NEW.item_id;
    ELSIF NEW.transaction_type = 'check_in' THEN
        UPDATE public.inventory_items
        SET status = 'available', location = NEW.to_location, updated_at = now()
        WHERE id = NEW.item_id;
    ELSIF NEW.transaction_type = 'maintenance' THEN
        UPDATE public.inventory_items
        SET status = 'maintenance', last_maintenance_date = CURRENT_DATE, updated_at = now()
        WHERE id = NEW.item_id;
    ELSIF NEW.transaction_type = 'retire' THEN
        UPDATE public.inventory_items
        SET status = 'retired', updated_at = now()
        WHERE id = NEW.item_id;
    ELSIF NEW.transaction_type = 'transfer' THEN
        UPDATE public.inventory_items
        SET location = NEW.to_location, updated_at = now()
        WHERE id = NEW.item_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_inventory_on_transaction_trigger
    AFTER INSERT ON public.inventory_transactions
    FOR EACH ROW EXECUTE FUNCTION update_inventory_on_transaction();

COMMENT ON TABLE public.inventory_items IS 'Equipment and asset inventory with tracking and maintenance';
COMMENT ON TABLE public.inventory_transactions IS 'Check-out, check-in, and transfer history for inventory items';
COMMENT ON TABLE public.inventory_maintenance IS 'Scheduled and completed maintenance records for inventory items';
COMMENT ON TABLE public.vendor_invoices IS 'Accounts payable - invoices received from vendors';
COMMENT ON TABLE public.vendor_payments IS 'Payments made against vendor invoices';
COMMENT ON TABLE public.project_costs IS 'Budget vs actual cost tracking per booking/event';
