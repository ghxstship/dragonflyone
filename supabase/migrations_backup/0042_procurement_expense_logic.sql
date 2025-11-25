-- Migration: Procurement & Expense Business Logic Functions
-- Description: RPC functions for purchase orders, expenses, approval workflows

-- Generate PO number function
CREATE OR REPLACE FUNCTION generate_po_number(org_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  prefix TEXT;
  year_suffix TEXT;
  sequence_num INT;
  new_number TEXT;
BEGIN
  SELECT COALESCE(settings->>'po_prefix', 'PO') INTO prefix
  FROM organizations WHERE id = org_id;
  
  IF prefix IS NULL THEN prefix := 'PO'; END IF;
  year_suffix := TO_CHAR(CURRENT_DATE, 'YY');
  
  SELECT COALESCE(MAX(
    CASE WHEN po_number ~ ('^' || prefix || year_suffix || '-[0-9]+$')
    THEN CAST(SUBSTRING(po_number FROM '[0-9]+$') AS INT) ELSE 0 END
  ), 0) + 1 INTO sequence_num
  FROM purchase_orders WHERE organization_id = org_id AND po_number LIKE prefix || year_suffix || '-%';
  
  RETURN prefix || year_suffix || '-' || LPAD(sequence_num::TEXT, 4, '0');
END;
$$;

-- Generate expense number function
CREATE OR REPLACE FUNCTION generate_expense_number(org_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  prefix TEXT;
  year_suffix TEXT;
  sequence_num INT;
BEGIN
  SELECT COALESCE(settings->>'expense_prefix', 'EXP') INTO prefix FROM organizations WHERE id = org_id;
  IF prefix IS NULL THEN prefix := 'EXP'; END IF;
  year_suffix := TO_CHAR(CURRENT_DATE, 'YY');
  
  SELECT COALESCE(MAX(
    CASE WHEN expense_number ~ ('^' || prefix || year_suffix || '-[0-9]+$')
    THEN CAST(SUBSTRING(expense_number FROM '[0-9]+$') AS INT) ELSE 0 END
  ), 0) + 1 INTO sequence_num
  FROM expenses WHERE organization_id = org_id AND expense_number LIKE prefix || year_suffix || '-%';
  
  RETURN prefix || year_suffix || '-' || LPAD(sequence_num::TEXT, 4, '0');
END;
$$;

-- Purchase order activity log table
CREATE TABLE IF NOT EXISTS purchase_order_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  user_id UUID REFERENCES platform_users(id),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_po_activity_log_po_id ON purchase_order_activity_log(purchase_order_id);

-- Purchase order approvals table
CREATE TABLE IF NOT EXISTS purchase_order_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES platform_users(id),
  action TEXT NOT NULL CHECK (action IN ('approved', 'rejected')),
  notes TEXT,
  conditions TEXT[],
  amount_at_approval NUMERIC(15,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expense activity log table
CREATE TABLE IF NOT EXISTS expense_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  user_id UUID REFERENCES platform_users(id),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expense approvals table
CREATE TABLE IF NOT EXISTS expense_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES platform_users(id),
  action TEXT NOT NULL CHECK (action IN ('approved', 'rejected')),
  notes TEXT,
  amount_at_approval NUMERIC(15,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE purchase_order_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_approvals ENABLE ROW LEVEL SECURITY;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION generate_po_number(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_expense_number(UUID) TO authenticated;
