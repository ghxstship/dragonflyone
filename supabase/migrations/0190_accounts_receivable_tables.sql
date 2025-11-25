-- Migration: Accounts Receivable Tables
-- Description: Tables for AR and automated collections

-- Client invoices table
CREATE TABLE IF NOT EXISTS client_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES contacts(id),
  organization_id UUID REFERENCES organizations(id),
  project_id UUID REFERENCES projects(id),
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  invoice_date TIMESTAMPTZ NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  sent_date TIMESTAMPTZ,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  description TEXT,
  line_items JSONB,
  payment_terms VARCHAR(100),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'partial', 'paid', 'overdue', 'voided', 'collections')),
  paid_date TIMESTAMPTZ,
  void_reason TEXT,
  voided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client payments table
CREATE TABLE IF NOT EXISTS client_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES client_invoices(id),
  amount DECIMAL(12, 2) NOT NULL,
  payment_method VARCHAR(30) NOT NULL CHECK (payment_method IN ('ach', 'wire', 'check', 'credit_card', 'cash', 'other')),
  payment_date TIMESTAMPTZ NOT NULL,
  reference_number VARCHAR(100),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'reversed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collection activities table
CREATE TABLE IF NOT EXISTS collection_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES client_invoices(id),
  action_type VARCHAR(30) NOT NULL CHECK (action_type IN ('reminder_sent', 'phone_call', 'email_sent', 'payment_plan', 'escalated', 'sent_to_collections')),
  notes TEXT,
  next_action_date TIMESTAMPTZ,
  performed_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_client_invoices_client ON client_invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_client_invoices_status ON client_invoices(status);
CREATE INDEX IF NOT EXISTS idx_client_invoices_due_date ON client_invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_client_invoices_project ON client_invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_client_payments_invoice ON client_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_client_payments_date ON client_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_collection_activities_invoice ON collection_activities(invoice_id);

-- RLS Policies
ALTER TABLE client_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_activities ENABLE ROW LEVEL SECURITY;

-- View policies
CREATE POLICY client_invoices_view ON client_invoices FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY client_payments_view ON client_payments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY collection_activities_view ON collection_activities FOR SELECT USING (auth.uid() IS NOT NULL);

-- Manage policies
CREATE POLICY client_invoices_manage ON client_invoices FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND ('ATLVS_TEAM_MEMBER' = ANY(platform_roles) OR 'ATLVS_ADMIN' = ANY(platform_roles)))
);

CREATE POLICY client_payments_manage ON client_payments FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND ('ATLVS_TEAM_MEMBER' = ANY(platform_roles) OR 'ATLVS_ADMIN' = ANY(platform_roles)))
);

CREATE POLICY collection_activities_manage ON collection_activities FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND ('ATLVS_TEAM_MEMBER' = ANY(platform_roles) OR 'ATLVS_ADMIN' = ANY(platform_roles)))
);

-- Function to get AR aging summary
CREATE OR REPLACE FUNCTION get_ar_aging_summary()
RETURNS TABLE (
  bucket VARCHAR,
  invoice_count BIGINT,
  total_amount DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH invoice_balances AS (
    SELECT 
      ci.id,
      ci.amount,
      ci.due_date,
      COALESCE(SUM(cp.amount) FILTER (WHERE cp.status = 'completed'), 0) as paid_amount
    FROM client_invoices ci
    LEFT JOIN client_payments cp ON ci.id = cp.invoice_id
    WHERE ci.status IN ('sent', 'partial', 'overdue')
    GROUP BY ci.id
  )
  SELECT 
    CASE 
      WHEN due_date >= CURRENT_DATE THEN 'current'
      WHEN due_date >= CURRENT_DATE - INTERVAL '30 days' THEN '1-30 days'
      WHEN due_date >= CURRENT_DATE - INTERVAL '60 days' THEN '31-60 days'
      WHEN due_date >= CURRENT_DATE - INTERVAL '90 days' THEN '61-90 days'
      ELSE 'over 90 days'
    END::VARCHAR AS bucket,
    COUNT(*),
    SUM(amount - paid_amount)
  FROM invoice_balances
  WHERE amount > paid_amount
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

-- Function to update overdue invoices
CREATE OR REPLACE FUNCTION update_overdue_invoices()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE client_invoices
  SET status = 'overdue', updated_at = NOW()
  WHERE status = 'sent'
    AND due_date < CURRENT_DATE;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update invoice status when payment received
CREATE OR REPLACE FUNCTION update_invoice_on_payment()
RETURNS TRIGGER AS $$
DECLARE
  v_invoice_amount DECIMAL;
  v_total_paid DECIMAL;
BEGIN
  IF NEW.status = 'completed' THEN
    SELECT amount INTO v_invoice_amount FROM client_invoices WHERE id = NEW.invoice_id;
    
    SELECT COALESCE(SUM(amount), 0) INTO v_total_paid 
    FROM client_payments 
    WHERE invoice_id = NEW.invoice_id AND status = 'completed';
    
    IF v_total_paid >= v_invoice_amount THEN
      UPDATE client_invoices 
      SET status = 'paid', paid_date = NOW(), updated_at = NOW()
      WHERE id = NEW.invoice_id;
    ELSIF v_total_paid > 0 THEN
      UPDATE client_invoices 
      SET status = 'partial', updated_at = NOW()
      WHERE id = NEW.invoice_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_invoice_on_payment
AFTER INSERT ON client_payments
FOR EACH ROW EXECUTE FUNCTION update_invoice_on_payment();
