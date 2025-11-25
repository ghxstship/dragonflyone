-- Migration: Extended Asset & Finance System
-- Description: Tables for asset specifications, rental equipment, and credit card reconciliation

-- Asset specifications library
CREATE TABLE IF NOT EXISTS asset_specifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  asset_id UUID REFERENCES assets(id),
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  manufacturer TEXT,
  model TEXT,
  specifications JSONB NOT NULL DEFAULT '{}',
  power_requirements JSONB,
  dimensions JSONB,
  weight_kg NUMERIC(10,2),
  tags TEXT[],
  is_template BOOLEAN DEFAULT false,
  created_by UUID REFERENCES platform_users(id),
  updated_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_asset_specifications_org ON asset_specifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_asset_specifications_category ON asset_specifications(category);
CREATE INDEX IF NOT EXISTS idx_asset_specifications_asset ON asset_specifications(asset_id);

-- Asset technical documents
CREATE TABLE IF NOT EXISTS asset_technical_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  specification_id UUID NOT NULL REFERENCES asset_specifications(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('manual', 'datasheet', 'diagram', 'video', 'certification', 'warranty', 'other')),
  url TEXT NOT NULL,
  file_size INT,
  mime_type TEXT,
  version TEXT,
  uploaded_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_asset_technical_documents_spec ON asset_technical_documents(specification_id);

-- Asset utilization logs
CREATE TABLE IF NOT EXISTS asset_utilization_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hours_used NUMERIC(6,2),
  utilization_rate NUMERIC(5,2),
  project_id UUID REFERENCES projects(id),
  operator_id UUID REFERENCES platform_users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_asset_utilization_logs_asset ON asset_utilization_logs(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_utilization_logs_date ON asset_utilization_logs(date);

-- Asset incidents/failures
CREATE TABLE IF NOT EXISTS asset_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  incident_date TIMESTAMPTZ NOT NULL,
  incident_type TEXT NOT NULL CHECK (incident_type IN ('failure', 'damage', 'malfunction', 'safety', 'other')),
  severity TEXT NOT NULL CHECK (severity IN ('minor', 'moderate', 'major', 'critical')),
  description TEXT NOT NULL,
  root_cause TEXT,
  corrective_action TEXT,
  downtime_hours NUMERIC(6,2),
  repair_cost NUMERIC(12,2),
  reported_by UUID REFERENCES platform_users(id),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_asset_incidents_asset ON asset_incidents(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_incidents_date ON asset_incidents(incident_date);

-- Rental equipment catalog
CREATE TABLE IF NOT EXISTS rental_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  daily_rate NUMERIC(12,2) NOT NULL,
  weekly_rate NUMERIC(12,2),
  monthly_rate NUMERIC(12,2),
  deposit_amount NUMERIC(12,2),
  specifications JSONB,
  availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'rented', 'maintenance', 'reserved', 'retired')),
  quantity_available INT DEFAULT 1,
  minimum_rental_days INT DEFAULT 1,
  insurance_required BOOLEAN DEFAULT false,
  delivery_available BOOLEAN DEFAULT false,
  delivery_fee NUMERIC(10,2),
  images TEXT[],
  created_by UUID REFERENCES platform_users(id),
  updated_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rental_equipment_vendor ON rental_equipment(vendor_id);
CREATE INDEX IF NOT EXISTS idx_rental_equipment_category ON rental_equipment(category);
CREATE INDEX IF NOT EXISTS idx_rental_equipment_status ON rental_equipment(availability_status);

-- Rental bookings
CREATE TABLE IF NOT EXISTS rental_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  equipment_id UUID NOT NULL REFERENCES rental_equipment(id),
  project_id UUID REFERENCES projects(id),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  daily_rate NUMERIC(12,2) NOT NULL,
  total_days INT NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL,
  insurance_option TEXT DEFAULT 'none' CHECK (insurance_option IN ('none', 'basic', 'premium')),
  insurance_cost NUMERIC(10,2) DEFAULT 0,
  delivery_address TEXT,
  delivery_fee NUMERIC(10,2) DEFAULT 0,
  deposit_amount NUMERIC(12,2) DEFAULT 0,
  deposit_paid BOOLEAN DEFAULT false,
  total_cost NUMERIC(12,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled', 'disputed')),
  pickup_date TIMESTAMPTZ,
  return_date TIMESTAMPTZ,
  condition_on_pickup TEXT,
  condition_on_return TEXT,
  damage_charges NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rental_bookings_equipment ON rental_bookings(equipment_id);
CREATE INDEX IF NOT EXISTS idx_rental_bookings_project ON rental_bookings(project_id);
CREATE INDEX IF NOT EXISTS idx_rental_bookings_dates ON rental_bookings(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_rental_bookings_status ON rental_bookings(status);

-- Credit card accounts
CREATE TABLE IF NOT EXISTS credit_card_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  card_type TEXT NOT NULL CHECK (card_type IN ('visa', 'mastercard', 'amex', 'discover', 'other')),
  last_four TEXT NOT NULL,
  credit_limit NUMERIC(12,2) NOT NULL,
  current_balance NUMERIC(12,2) DEFAULT 0,
  available_credit NUMERIC(12,2),
  billing_cycle_day INT NOT NULL,
  payment_due_day INT NOT NULL,
  interest_rate NUMERIC(5,2),
  annual_fee NUMERIC(10,2),
  rewards_program TEXT,
  assigned_to UUID REFERENCES platform_users(id),
  department_id UUID REFERENCES departments(id),
  spending_limit NUMERIC(12,2),
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_card_accounts_org ON credit_card_accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_credit_card_accounts_assigned ON credit_card_accounts(assigned_to);

-- Credit card transactions
CREATE TABLE IF NOT EXISTS credit_card_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES credit_card_accounts(id),
  transaction_date DATE NOT NULL,
  post_date DATE,
  merchant_name TEXT NOT NULL,
  merchant_category TEXT,
  merchant_category_code TEXT,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  expense_category_id UUID REFERENCES expense_categories(id),
  project_id UUID REFERENCES projects(id),
  receipt_url TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'posted', 'disputed', 'reconciled', 'rejected')),
  reconciled_at TIMESTAMPTZ,
  reconciled_by UUID REFERENCES platform_users(id),
  imported_at TIMESTAMPTZ,
  imported_by UUID REFERENCES platform_users(id),
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_card_transactions_card ON credit_card_transactions(card_id);
CREATE INDEX IF NOT EXISTS idx_credit_card_transactions_date ON credit_card_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_credit_card_transactions_status ON credit_card_transactions(status);
CREATE INDEX IF NOT EXISTS idx_credit_card_transactions_project ON credit_card_transactions(project_id);

-- Credit card statements
CREATE TABLE IF NOT EXISTS credit_card_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES credit_card_accounts(id),
  statement_date DATE NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  opening_balance NUMERIC(12,2) NOT NULL,
  closing_balance NUMERIC(12,2) NOT NULL,
  total_charges NUMERIC(12,2) NOT NULL,
  total_credits NUMERIC(12,2) DEFAULT 0,
  total_payments NUMERIC(12,2) DEFAULT 0,
  minimum_payment NUMERIC(12,2),
  payment_due_date DATE,
  interest_charged NUMERIC(10,2) DEFAULT 0,
  fees_charged NUMERIC(10,2) DEFAULT 0,
  rewards_earned NUMERIC(10,2) DEFAULT 0,
  statement_url TEXT,
  is_reconciled BOOLEAN DEFAULT false,
  reconciled_at TIMESTAMPTZ,
  reconciled_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_card_statements_card ON credit_card_statements(card_id);
CREATE INDEX IF NOT EXISTS idx_credit_card_statements_date ON credit_card_statements(statement_date);

-- Function to calculate asset health score
CREATE OR REPLACE FUNCTION calculate_asset_health_score(p_asset_id UUID)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  v_score INT := 100;
  v_recent_failures INT;
  v_days_since_maintenance INT;
  v_avg_utilization NUMERIC;
BEGIN
  -- Count recent failures (last 90 days)
  SELECT COUNT(*) INTO v_recent_failures
  FROM asset_incidents
  WHERE asset_id = p_asset_id
    AND incident_date > NOW() - INTERVAL '90 days';
  
  v_score := v_score - (v_recent_failures * 10);
  
  -- Check maintenance status
  SELECT EXTRACT(DAY FROM NOW() - MAX(maintenance_date))::INT INTO v_days_since_maintenance
  FROM asset_maintenance_logs
  WHERE asset_id = p_asset_id;
  
  IF v_days_since_maintenance IS NULL THEN
    v_score := v_score - 15;
  ELSIF v_days_since_maintenance > 90 THEN
    v_score := v_score - 20;
  ELSIF v_days_since_maintenance > 60 THEN
    v_score := v_score - 10;
  ELSIF v_days_since_maintenance > 30 THEN
    v_score := v_score - 5;
  END IF;
  
  -- Check utilization
  SELECT AVG(utilization_rate) INTO v_avg_utilization
  FROM asset_utilization_logs
  WHERE asset_id = p_asset_id
    AND date > NOW() - INTERVAL '30 days';
  
  IF v_avg_utilization > 70 THEN
    v_score := v_score + 5;
  END IF;
  
  RETURN GREATEST(0, LEAST(100, v_score));
END;
$$;

-- Function to check rental availability
CREATE OR REPLACE FUNCTION check_rental_availability(
  p_equipment_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_quantity INT DEFAULT 1
)
RETURNS TABLE (
  is_available BOOLEAN,
  available_quantity INT,
  conflicting_bookings INT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_quantity INT;
  v_booked_quantity INT;
BEGIN
  -- Get total quantity
  SELECT quantity_available INTO v_total_quantity
  FROM rental_equipment
  WHERE id = p_equipment_id;
  
  -- Get booked quantity for date range
  SELECT COALESCE(SUM(quantity), 0) INTO v_booked_quantity
  FROM rental_bookings
  WHERE equipment_id = p_equipment_id
    AND status IN ('confirmed', 'active')
    AND start_date <= p_end_date
    AND end_date >= p_start_date;
  
  RETURN QUERY SELECT 
    (v_total_quantity - v_booked_quantity) >= p_quantity,
    v_total_quantity - v_booked_quantity,
    (SELECT COUNT(*)::INT FROM rental_bookings 
     WHERE equipment_id = p_equipment_id 
       AND status IN ('confirmed', 'active')
       AND start_date <= p_end_date 
       AND end_date >= p_start_date);
END;
$$;

-- RLS policies
ALTER TABLE asset_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_technical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_utilization_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_card_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_card_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_card_statements ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON asset_specifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON asset_technical_documents TO authenticated;
GRANT SELECT, INSERT ON asset_utilization_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON asset_incidents TO authenticated;
GRANT SELECT, INSERT, UPDATE ON rental_equipment TO authenticated;
GRANT SELECT, INSERT, UPDATE ON rental_bookings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON credit_card_accounts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON credit_card_transactions TO authenticated;
GRANT SELECT, INSERT ON credit_card_statements TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_asset_health_score(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_rental_availability(UUID, DATE, DATE, INT) TO authenticated;
