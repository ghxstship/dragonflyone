-- Migration: Procurement Extended System
-- Description: Tables for P-cards, venue booking, and insurance COI tracking

-- P-cards (Procurement Cards)
CREATE TABLE IF NOT EXISTS pcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  cardholder_id UUID NOT NULL REFERENCES platform_users(id),
  card_number_last_four TEXT NOT NULL,
  card_type TEXT NOT NULL CHECK (card_type IN ('visa', 'mastercard', 'amex')),
  credit_limit NUMERIC(12,2) NOT NULL,
  single_transaction_limit NUMERIC(12,2),
  monthly_limit NUMERIC(12,2),
  department_id UUID REFERENCES departments(id),
  cost_center TEXT,
  allowed_merchant_categories TEXT[],
  blocked_merchant_categories TEXT[],
  expiration_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  activated_at TIMESTAMPTZ,
  deactivated_at TIMESTAMPTZ,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pcards_cardholder ON pcards(cardholder_id);
CREATE INDEX IF NOT EXISTS idx_pcards_department ON pcards(department_id);
CREATE INDEX IF NOT EXISTS idx_pcards_active ON pcards(is_active);

-- P-card transactions
CREATE TABLE IF NOT EXISTS pcard_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pcard_id UUID NOT NULL REFERENCES pcards(id),
  transaction_date DATE NOT NULL,
  post_date DATE,
  merchant_name TEXT NOT NULL,
  merchant_category_code TEXT,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  receipt_url TEXT,
  expense_category_id UUID REFERENCES expense_categories(id),
  project_id UUID REFERENCES projects(id),
  gl_account_id UUID,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'reconciled', 'disputed')),
  approved_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  reconciled_at TIMESTAMPTZ,
  reconciled_by UUID REFERENCES platform_users(id),
  imported_at TIMESTAMPTZ,
  imported_by UUID REFERENCES platform_users(id),
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pcard_transactions_pcard ON pcard_transactions(pcard_id);
CREATE INDEX IF NOT EXISTS idx_pcard_transactions_date ON pcard_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_pcard_transactions_status ON pcard_transactions(status);
CREATE INDEX IF NOT EXISTS idx_pcard_transactions_project ON pcard_transactions(project_id);

-- Venues
CREATE TABLE IF NOT EXISTS venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('arena', 'theater', 'stadium', 'convention_center', 'outdoor', 'club', 'ballroom', 'other')),
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT DEFAULT 'USA',
  postal_code TEXT NOT NULL,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  capacity INT NOT NULL,
  seating_configurations JSONB,
  amenities TEXT[],
  technical_specs JSONB,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  base_rental_rate NUMERIC(12,2),
  rate_type TEXT DEFAULT 'flat' CHECK (rate_type IN ('flat', 'hourly', 'daily', 'percentage')),
  minimum_rental_hours INT,
  insurance_requirements TEXT,
  load_in_restrictions TEXT,
  curfew_time TIME,
  parking_capacity INT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venues_city ON venues(city);
CREATE INDEX IF NOT EXISTS idx_venues_type ON venues(type);
CREATE INDEX IF NOT EXISTS idx_venues_capacity ON venues(capacity);

-- Venue bookings
CREATE TABLE IF NOT EXISTS venue_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  venue_id UUID NOT NULL REFERENCES venues(id),
  project_id UUID REFERENCES projects(id),
  event_name TEXT NOT NULL,
  event_type TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  load_in_date DATE,
  load_out_date DATE,
  expected_attendance INT,
  seating_configuration TEXT,
  rental_rate NUMERIC(12,2) NOT NULL,
  additional_fees JSONB,
  total_cost NUMERIC(12,2),
  deposit_amount NUMERIC(12,2),
  deposit_due_date DATE,
  deposit_paid BOOLEAN DEFAULT false,
  payment_schedule JSONB,
  special_requirements TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'contracted', 'completed', 'cancelled')),
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES platform_users(id),
  cancellation_reason TEXT,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venue_bookings_venue ON venue_bookings(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_bookings_project ON venue_bookings(project_id);
CREATE INDEX IF NOT EXISTS idx_venue_bookings_dates ON venue_bookings(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_venue_bookings_status ON venue_bookings(status);

-- Venue holds
CREATE TABLE IF NOT EXISTS venue_holds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  hold_until TIMESTAMPTZ NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'converted', 'expired', 'released')),
  converted_to_booking_id UUID REFERENCES venue_bookings(id),
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venue_holds_venue ON venue_holds(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_holds_dates ON venue_holds(start_date, end_date);

-- Insurance certificates (COI)
CREATE TABLE IF NOT EXISTS insurance_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  vendor_id UUID REFERENCES vendors(id),
  contractor_id UUID,
  policy_holder_name TEXT NOT NULL,
  policy_holder_type TEXT NOT NULL CHECK (policy_holder_type IN ('vendor', 'contractor', 'subcontractor', 'venue', 'other')),
  insurance_company TEXT NOT NULL,
  policy_number TEXT NOT NULL,
  policy_type TEXT NOT NULL CHECK (policy_type IN ('general_liability', 'workers_comp', 'auto', 'professional', 'umbrella', 'property', 'other')),
  coverage_amount NUMERIC(14,2) NOT NULL,
  deductible NUMERIC(12,2),
  effective_date DATE NOT NULL,
  expiration_date DATE NOT NULL,
  additional_insured BOOLEAN DEFAULT false,
  waiver_of_subrogation BOOLEAN DEFAULT false,
  certificate_url TEXT,
  agent_name TEXT,
  agent_phone TEXT,
  agent_email TEXT,
  notes TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'expired')),
  last_verified_at TIMESTAMPTZ,
  last_verified_by UUID REFERENCES platform_users(id),
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_insurance_certificates_vendor ON insurance_certificates(vendor_id);
CREATE INDEX IF NOT EXISTS idx_insurance_certificates_type ON insurance_certificates(policy_type);
CREATE INDEX IF NOT EXISTS idx_insurance_certificates_expiration ON insurance_certificates(expiration_date);
CREATE INDEX IF NOT EXISTS idx_insurance_certificates_status ON insurance_certificates(verification_status);

-- COI requirements
CREATE TABLE IF NOT EXISTS coi_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  policy_type TEXT NOT NULL CHECK (policy_type IN ('general_liability', 'workers_comp', 'auto', 'professional', 'umbrella', 'property', 'other')),
  minimum_coverage NUMERIC(14,2) NOT NULL,
  additional_insured_required BOOLEAN DEFAULT false,
  waiver_of_subrogation_required BOOLEAN DEFAULT false,
  applies_to TEXT[] NOT NULL,
  project_types TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coi_requirements_type ON coi_requirements(policy_type);

-- COI verifications
CREATE TABLE IF NOT EXISTS coi_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coi_id UUID NOT NULL REFERENCES insurance_certificates(id) ON DELETE CASCADE,
  verification_result TEXT NOT NULL CHECK (verification_result IN ('verified', 'rejected', 'pending_info')),
  notes TEXT,
  verified_coverage NUMERIC(14,2),
  verified_dates BOOLEAN,
  verified_by UUID REFERENCES platform_users(id),
  verified_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coi_verifications_coi ON coi_verifications(coi_id);

-- COI renewal requests
CREATE TABLE IF NOT EXISTS coi_renewal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coi_id UUID NOT NULL REFERENCES insurance_certificates(id),
  requested_by UUID REFERENCES platform_users(id),
  contact_email TEXT,
  message TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'received', 'completed', 'expired')),
  response_received_at TIMESTAMPTZ,
  new_coi_id UUID REFERENCES insurance_certificates(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coi_renewal_requests_coi ON coi_renewal_requests(coi_id);

-- Function to check venue availability
CREATE OR REPLACE FUNCTION check_venue_availability(
  p_venue_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  is_available BOOLEAN,
  conflicting_bookings INT,
  active_holds INT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_bookings INT;
  v_holds INT;
BEGIN
  SELECT COUNT(*) INTO v_bookings
  FROM venue_bookings
  WHERE venue_id = p_venue_id
    AND status NOT IN ('cancelled')
    AND start_date <= p_end_date
    AND end_date >= p_start_date;
  
  SELECT COUNT(*) INTO v_holds
  FROM venue_holds
  WHERE venue_id = p_venue_id
    AND status = 'active'
    AND hold_until > NOW()
    AND start_date <= p_end_date
    AND end_date >= p_start_date;
  
  RETURN QUERY SELECT 
    (v_bookings = 0 AND v_holds = 0),
    v_bookings,
    v_holds;
END;
$$;

-- Function to get expiring COIs
CREATE OR REPLACE FUNCTION get_expiring_cois(p_days INT DEFAULT 30)
RETURNS TABLE (
  id UUID,
  policy_holder_name TEXT,
  policy_type TEXT,
  expiration_date DATE,
  days_until_expiry INT,
  vendor_name TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ic.id,
    ic.policy_holder_name,
    ic.policy_type,
    ic.expiration_date,
    (ic.expiration_date - CURRENT_DATE)::INT as days_until_expiry,
    v.name as vendor_name
  FROM insurance_certificates ic
  LEFT JOIN vendors v ON ic.vendor_id = v.id
  WHERE ic.expiration_date <= CURRENT_DATE + p_days
    AND ic.expiration_date >= CURRENT_DATE
  ORDER BY ic.expiration_date ASC;
END;
$$;

-- RLS policies
ALTER TABLE pcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE pcard_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_holds ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE coi_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE coi_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE coi_renewal_requests ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON pcards TO authenticated;
GRANT SELECT, INSERT, UPDATE ON pcard_transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON venues TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON venue_bookings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON venue_holds TO authenticated;
GRANT SELECT, INSERT, UPDATE ON insurance_certificates TO authenticated;
GRANT SELECT, INSERT, UPDATE ON coi_requirements TO authenticated;
GRANT SELECT, INSERT ON coi_verifications TO authenticated;
GRANT SELECT, INSERT, UPDATE ON coi_renewal_requests TO authenticated;
GRANT EXECUTE ON FUNCTION check_venue_availability(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_expiring_cois(INT) TO authenticated;
