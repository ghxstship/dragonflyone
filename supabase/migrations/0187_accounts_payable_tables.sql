-- Migration: Accounts Payable Tables
-- Description: Tables for AP automation with 3-way matching

-- Vendor invoices table
CREATE TABLE IF NOT EXISTS vendor_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  invoice_number VARCHAR(100) NOT NULL,
  invoice_date TIMESTAMPTZ NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  description TEXT,
  line_items JSONB,
  purchase_order_id UUID REFERENCES purchase_orders(id),
  receipt_id UUID,
  attachments JSONB,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'partial', 'paid', 'rejected', 'voided', 'pending_review')),
  match_status VARCHAR(20) DEFAULT 'pending' CHECK (match_status IN ('pending', 'ready_for_match', 'matched', 'exception')),
  match_result JSONB,
  matched_at TIMESTAMPTZ,
  approved_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  rejected_by UUID REFERENCES platform_users(id),
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  paid_date TIMESTAMPTZ,
  void_reason TEXT,
  voided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vendor_id, invoice_number)
);

-- Goods receipts table
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id),
  received_by UUID NOT NULL REFERENCES platform_users(id),
  received_date TIMESTAMPTZ NOT NULL,
  line_items JSONB NOT NULL,
  delivery_note_number VARCHAR(100),
  carrier VARCHAR(200),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('partial', 'completed', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice payments table
CREATE TABLE IF NOT EXISTS invoice_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES vendor_invoices(id),
  amount DECIMAL(12, 2) NOT NULL,
  payment_method VARCHAR(30) NOT NULL CHECK (payment_method IN ('ach', 'wire', 'check', 'credit_card', 'other')),
  payment_date TIMESTAMPTZ NOT NULL,
  reference_number VARCHAR(100),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'reversed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reconciliation logs table
CREATE TABLE IF NOT EXISTS reconciliation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  discrepancies JSONB,
  stripe_revenue DECIMAL(12, 2),
  db_revenue DECIMAL(12, 2),
  status VARCHAR(20) DEFAULT 'needs_review' CHECK (status IN ('needs_review', 'resolved', 'ignored')),
  resolved_by UUID REFERENCES platform_users(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add receipt_status to purchase_orders if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_orders' AND column_name = 'receipt_status') THEN
    ALTER TABLE purchase_orders ADD COLUMN receipt_status VARCHAR(20) DEFAULT 'pending' CHECK (receipt_status IN ('pending', 'partial', 'received'));
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vendor_invoices_vendor ON vendor_invoices(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_invoices_status ON vendor_invoices(status);
CREATE INDEX IF NOT EXISTS idx_vendor_invoices_due_date ON vendor_invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_vendor_invoices_match_status ON vendor_invoices(match_status);
CREATE INDEX IF NOT EXISTS idx_vendor_invoices_po ON vendor_invoices(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_receipts_po ON receipts(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice ON invoice_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_date ON invoice_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_reconciliation_logs_period ON reconciliation_logs(period_start, period_end);

-- RLS Policies
ALTER TABLE vendor_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliation_logs ENABLE ROW LEVEL SECURITY;

-- View policies
CREATE POLICY vendor_invoices_view ON vendor_invoices FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY receipts_view ON receipts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY invoice_payments_view ON invoice_payments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY reconciliation_logs_view ON reconciliation_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND 'ATLVS_ADMIN' = ANY(platform_roles))
);

-- Manage policies
CREATE POLICY vendor_invoices_manage ON vendor_invoices FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND ('ATLVS_TEAM_MEMBER' = ANY(platform_roles) OR 'ATLVS_ADMIN' = ANY(platform_roles)))
);

CREATE POLICY receipts_manage ON receipts FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND ('ATLVS_TEAM_MEMBER' = ANY(platform_roles) OR 'ATLVS_ADMIN' = ANY(platform_roles)))
);

CREATE POLICY invoice_payments_manage ON invoice_payments FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND 'ATLVS_ADMIN' = ANY(platform_roles))
);

-- Function to perform 3-way match
CREATE OR REPLACE FUNCTION perform_3way_match(p_invoice_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_invoice RECORD;
  v_po RECORD;
  v_receipt RECORD;
  v_result JSONB;
  v_po_match BOOLEAN := FALSE;
  v_receipt_match BOOLEAN := FALSE;
  v_auto_approve BOOLEAN := FALSE;
  v_discrepancies TEXT[] := '{}';
  v_tolerance DECIMAL;
BEGIN
  -- Get invoice
  SELECT * INTO v_invoice FROM vendor_invoices WHERE id = p_invoice_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Invoice not found');
  END IF;

  -- Get PO
  IF v_invoice.purchase_order_id IS NOT NULL THEN
    SELECT * INTO v_po FROM purchase_orders WHERE id = v_invoice.purchase_order_id;
    IF FOUND THEN
      v_tolerance := v_po.total_amount * 0.02;
      v_po_match := ABS(v_invoice.amount - v_po.total_amount) <= v_tolerance;
      IF NOT v_po_match THEN
        v_discrepancies := array_append(v_discrepancies, 
          format('Amount variance: Invoice %s vs PO %s', v_invoice.amount, v_po.total_amount));
      END IF;
    ELSE
      v_discrepancies := array_append(v_discrepancies, 'Purchase order not found');
    END IF;
  ELSE
    v_discrepancies := array_append(v_discrepancies, 'No purchase order linked');
  END IF;

  -- Get receipt
  IF v_invoice.receipt_id IS NOT NULL THEN
    SELECT * INTO v_receipt FROM receipts WHERE id = v_invoice.receipt_id;
    v_receipt_match := FOUND;
    IF NOT v_receipt_match THEN
      v_discrepancies := array_append(v_discrepancies, 'Receipt not found');
    END IF;
  ELSE
    v_discrepancies := array_append(v_discrepancies, 'No receipt recorded');
  END IF;

  -- Determine auto-approve
  v_auto_approve := v_po_match AND v_receipt_match;

  -- Build result
  v_result := jsonb_build_object(
    'po_match', v_po_match,
    'receipt_match', v_receipt_match,
    'auto_approve', v_auto_approve,
    'discrepancies', v_discrepancies
  );

  -- Update invoice
  UPDATE vendor_invoices SET
    match_status = CASE WHEN v_auto_approve THEN 'matched' ELSE 'exception' END,
    status = CASE WHEN v_auto_approve THEN 'approved' ELSE 'pending_review' END,
    match_result = v_result,
    matched_at = NOW(),
    updated_at = NOW()
  WHERE id = p_invoice_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Function to get AP aging summary
CREATE OR REPLACE FUNCTION get_ap_aging_summary()
RETURNS TABLE (
  bucket VARCHAR,
  invoice_count BIGINT,
  total_amount DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN due_date >= CURRENT_DATE THEN 'current'
      WHEN due_date >= CURRENT_DATE - INTERVAL '30 days' THEN '1-30 days'
      WHEN due_date >= CURRENT_DATE - INTERVAL '60 days' THEN '31-60 days'
      WHEN due_date >= CURRENT_DATE - INTERVAL '90 days' THEN '61-90 days'
      ELSE 'over 90 days'
    END::VARCHAR AS bucket,
    COUNT(*),
    SUM(amount)
  FROM vendor_invoices
  WHERE status IN ('pending', 'approved', 'partial')
  GROUP BY 1
  ORDER BY 
    CASE 
      WHEN bucket = 'current' THEN 1
      WHEN bucket = '1-30 days' THEN 2
      WHEN bucket = '31-60 days' THEN 3
      WHEN bucket = '61-90 days' THEN 4
      ELSE 5
    END;
END;
$$ LANGUAGE plpgsql;
