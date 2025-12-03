-- Migration: Sponsorship Management System
-- Description: Complete sponsorship lifecycle from ExperienceGeneratorSchema

-- Add sponsor status enum
DO $$ BEGIN
  CREATE TYPE sponsor_status_enum AS ENUM (
    'prospect', 'pitched', 'negotiating', 'confirmed', 'active', 'completed', 'declined'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Sponsor Tiers table
CREATE TABLE IF NOT EXISTS sponsor_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  production_id UUID REFERENCES productions(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 10),
  investment_min NUMERIC(10,2),
  investment_max NUMERIC(10,2),
  is_exclusive BOOLEAN DEFAULT false,
  max_sponsors INTEGER,
  description TEXT,
  benefits_summary TEXT,
  benefits JSONB DEFAULT '[]',
  color VARCHAR(7),
  logo_placement TEXT,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(production_id, name)
);

-- Sponsors table
CREATE TABLE IF NOT EXISTS sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_id UUID NOT NULL REFERENCES productions(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  tier_id UUID REFERENCES sponsor_tiers(id),
  status sponsor_status_enum DEFAULT 'prospect',
  
  -- Company info (if not linked to organization)
  company_name TEXT,
  company_logo_url TEXT,
  company_website TEXT,
  industry TEXT,
  
  -- Financial
  cash_value NUMERIC(10,2) DEFAULT 0,
  vik_value NUMERIC(10,2) DEFAULT 0,
  total_value NUMERIC(10,2) GENERATED ALWAYS AS (COALESCE(cash_value, 0) + COALESCE(vik_value, 0)) STORED,
  payment_received NUMERIC(10,2) DEFAULT 0,
  payment_schedule JSONB,
  
  -- Contacts
  primary_contact_id UUID REFERENCES contacts(id),
  activation_contact_id UUID REFERENCES contacts(id),
  day_of_contact_id UUID REFERENCES contacts(id),
  billing_contact_id UUID REFERENCES contacts(id),
  
  -- Terms
  contract_id UUID REFERENCES contracts(id),
  category_exclusivity TEXT,
  exclusivity_terms TEXT,
  territory TEXT,
  
  -- Deliverables
  benefits JSONB DEFAULT '[]',
  activations JSONB DEFAULT '[]',
  hospitality_tickets INTEGER DEFAULT 0,
  vip_passes INTEGER DEFAULT 0,
  parking_passes INTEGER DEFAULT 0,
  
  -- Assets
  logo_files JSONB DEFAULT '{}',
  brand_guidelines_url TEXT,
  approved_messaging TEXT,
  
  -- Reporting
  deliverables_status JSONB DEFAULT '{}',
  recap_due_date DATE,
  recap_submitted BOOLEAN DEFAULT false,
  recap_url TEXT,
  
  -- Dates
  pitched_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  activated_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Meta
  notes TEXT,
  internal_notes TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sponsor Deliverables table
CREATE TABLE IF NOT EXISTS sponsor_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  deliverable_type TEXT NOT NULL CHECK (deliverable_type IN (
    'logo_placement', 'signage', 'digital', 'social_media', 'email', 
    'print', 'activation', 'hospitality', 'sampling', 'speaking', 
    'naming_rights', 'custom'
  )),
  title TEXT NOT NULL,
  description TEXT,
  quantity INTEGER DEFAULT 1,
  location TEXT,
  dimensions TEXT,
  due_date DATE,
  delivery_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'delivered', 'approved', 'rejected')),
  proof_url TEXT,
  proof_approved_at TIMESTAMPTZ,
  proof_approved_by UUID REFERENCES platform_users(id),
  actual_impressions INTEGER,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sponsor Activations table
CREATE TABLE IF NOT EXISTS sponsor_activations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  activation_type TEXT NOT NULL CHECK (activation_type IN (
    'booth', 'sampling', 'experience', 'photo_op', 'contest', 
    'giveaway', 'demonstration', 'vip_lounge', 'custom'
  )),
  description TEXT,
  zone_id UUID REFERENCES zones(id),
  location_description TEXT,
  footprint_sqft INTEGER,
  setup_requirements TEXT,
  power_requirements TEXT,
  staffing_count INTEGER,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'approved', 'setup', 'active', 'completed', 'cancelled')),
  estimated_interactions INTEGER,
  actual_interactions INTEGER,
  photos TEXT[],
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sponsor Payments table
CREATE TABLE IF NOT EXISTS sponsor_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('cash', 'vik', 'credit', 'refund')),
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  due_date DATE,
  paid_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'invoiced', 'paid', 'overdue', 'cancelled')),
  invoice_number TEXT,
  invoice_url TEXT,
  payment_method TEXT,
  reference_number TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sponsor_tiers_org ON sponsor_tiers(organization_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_tiers_production ON sponsor_tiers(production_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_tiers_level ON sponsor_tiers(level);

CREATE INDEX IF NOT EXISTS idx_sponsors_production ON sponsors(production_id);
CREATE INDEX IF NOT EXISTS idx_sponsors_org ON sponsors(organization_id);
CREATE INDEX IF NOT EXISTS idx_sponsors_tier ON sponsors(tier_id);
CREATE INDEX IF NOT EXISTS idx_sponsors_status ON sponsors(status);
CREATE INDEX IF NOT EXISTS idx_sponsors_primary_contact ON sponsors(primary_contact_id);

CREATE INDEX IF NOT EXISTS idx_sponsor_deliverables_sponsor ON sponsor_deliverables(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_deliverables_status ON sponsor_deliverables(status);
CREATE INDEX IF NOT EXISTS idx_sponsor_deliverables_due ON sponsor_deliverables(due_date);

CREATE INDEX IF NOT EXISTS idx_sponsor_activations_sponsor ON sponsor_activations(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_activations_zone ON sponsor_activations(zone_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_activations_status ON sponsor_activations(status);

CREATE INDEX IF NOT EXISTS idx_sponsor_payments_sponsor ON sponsor_payments(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_payments_status ON sponsor_payments(status);
CREATE INDEX IF NOT EXISTS idx_sponsor_payments_due ON sponsor_payments(due_date);

-- Comments
COMMENT ON TABLE sponsor_tiers IS 'Sponsorship tier definitions with benefits';
COMMENT ON TABLE sponsors IS 'Sponsors for productions with financial and deliverable tracking';
COMMENT ON TABLE sponsor_deliverables IS 'Individual deliverables owed to sponsors';
COMMENT ON TABLE sponsor_activations IS 'On-site sponsor activations and experiences';
COMMENT ON TABLE sponsor_payments IS 'Payment tracking for sponsor agreements';

-- Function to get sponsorship summary for a production
CREATE OR REPLACE FUNCTION get_sponsorship_summary(p_production_id UUID)
RETURNS TABLE (
  production_id UUID,
  total_sponsors INTEGER,
  confirmed_sponsors INTEGER,
  total_cash_value NUMERIC,
  total_vik_value NUMERIC,
  total_value NUMERIC,
  total_received NUMERIC,
  outstanding_amount NUMERIC,
  deliverables_pending INTEGER,
  deliverables_completed INTEGER,
  completion_percentage NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p_production_id,
    COUNT(s.id)::INTEGER AS total_sponsors,
    COUNT(s.id) FILTER (WHERE s.status IN ('confirmed', 'active', 'completed'))::INTEGER AS confirmed_sponsors,
    COALESCE(SUM(s.cash_value), 0) AS total_cash_value,
    COALESCE(SUM(s.vik_value), 0) AS total_vik_value,
    COALESCE(SUM(s.total_value), 0) AS total_value,
    COALESCE(SUM(s.payment_received), 0) AS total_received,
    COALESCE(SUM(s.cash_value) - SUM(s.payment_received), 0) AS outstanding_amount,
    (SELECT COUNT(*) FROM sponsor_deliverables sd 
     JOIN sponsors sp ON sd.sponsor_id = sp.id 
     WHERE sp.production_id = p_production_id AND sd.status IN ('pending', 'in_progress'))::INTEGER AS deliverables_pending,
    (SELECT COUNT(*) FROM sponsor_deliverables sd 
     JOIN sponsors sp ON sd.sponsor_id = sp.id 
     WHERE sp.production_id = p_production_id AND sd.status IN ('delivered', 'approved'))::INTEGER AS deliverables_completed,
    CASE 
      WHEN (SELECT COUNT(*) FROM sponsor_deliverables sd JOIN sponsors sp ON sd.sponsor_id = sp.id WHERE sp.production_id = p_production_id) > 0
      THEN ROUND(
        (SELECT COUNT(*) FROM sponsor_deliverables sd JOIN sponsors sp ON sd.sponsor_id = sp.id WHERE sp.production_id = p_production_id AND sd.status IN ('delivered', 'approved'))::NUMERIC /
        (SELECT COUNT(*) FROM sponsor_deliverables sd JOIN sponsors sp ON sd.sponsor_id = sp.id WHERE sp.production_id = p_production_id)::NUMERIC * 100, 2
      )
      ELSE 0
    END AS completion_percentage
  FROM sponsors s
  WHERE s.production_id = p_production_id
    AND s.status NOT IN ('declined');
END;
$$;

-- Function to get sponsor dashboard
CREATE OR REPLACE FUNCTION get_sponsor_dashboard(p_sponsor_id UUID)
RETURNS TABLE (
  sponsor_id UUID,
  company_name TEXT,
  tier_name TEXT,
  status sponsor_status_enum,
  total_value NUMERIC,
  payment_received NUMERIC,
  payment_percentage NUMERIC,
  deliverables_total INTEGER,
  deliverables_completed INTEGER,
  activations_total INTEGER,
  activations_active INTEGER,
  upcoming_payments JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    COALESCE(s.company_name, o.name) AS company_name,
    st.name AS tier_name,
    s.status,
    s.total_value,
    s.payment_received,
    CASE WHEN s.cash_value > 0 THEN ROUND((s.payment_received / s.cash_value) * 100, 2) ELSE 100 END AS payment_percentage,
    (SELECT COUNT(*)::INTEGER FROM sponsor_deliverables WHERE sponsor_id = s.id) AS deliverables_total,
    (SELECT COUNT(*)::INTEGER FROM sponsor_deliverables WHERE sponsor_id = s.id AND status IN ('delivered', 'approved')) AS deliverables_completed,
    (SELECT COUNT(*)::INTEGER FROM sponsor_activations WHERE sponsor_id = s.id) AS activations_total,
    (SELECT COUNT(*)::INTEGER FROM sponsor_activations WHERE sponsor_id = s.id AND status = 'active') AS activations_active,
    (SELECT jsonb_agg(jsonb_build_object(
      'id', sp.id,
      'amount', sp.amount,
      'due_date', sp.due_date,
      'status', sp.status
    ) ORDER BY sp.due_date)
    FROM sponsor_payments sp 
    WHERE sp.sponsor_id = s.id AND sp.status IN ('pending', 'invoiced', 'overdue')
    ) AS upcoming_payments
  FROM sponsors s
  LEFT JOIN organizations o ON s.organization_id = o.id
  LEFT JOIN sponsor_tiers st ON s.tier_id = st.id
  WHERE s.id = p_sponsor_id;
END;
$$;

-- Function to update sponsor payment status
CREATE OR REPLACE FUNCTION record_sponsor_payment(
  p_sponsor_id UUID,
  p_amount NUMERIC,
  p_payment_type TEXT DEFAULT 'cash',
  p_payment_method TEXT DEFAULT NULL,
  p_reference_number TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_payment_id UUID;
BEGIN
  -- Insert payment record
  INSERT INTO sponsor_payments (
    sponsor_id, payment_type, amount, paid_date, status,
    payment_method, reference_number, notes
  ) VALUES (
    p_sponsor_id, p_payment_type, p_amount, CURRENT_DATE, 'paid',
    p_payment_method, p_reference_number, p_notes
  ) RETURNING id INTO v_payment_id;
  
  -- Update sponsor payment_received
  UPDATE sponsors
  SET payment_received = payment_received + p_amount,
      updated_at = NOW()
  WHERE id = p_sponsor_id;
  
  RETURN v_payment_id;
END;
$$;

-- Function to get deliverables due soon
CREATE OR REPLACE FUNCTION get_upcoming_sponsor_deliverables(
  p_production_id UUID,
  p_days_ahead INTEGER DEFAULT 14
)
RETURNS TABLE (
  deliverable_id UUID,
  sponsor_name TEXT,
  deliverable_title TEXT,
  deliverable_type TEXT,
  due_date DATE,
  days_until_due INTEGER,
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sd.id,
    COALESCE(s.company_name, o.name) AS sponsor_name,
    sd.title,
    sd.deliverable_type,
    sd.due_date,
    (sd.due_date - CURRENT_DATE)::INTEGER AS days_until_due,
    sd.status
  FROM sponsor_deliverables sd
  JOIN sponsors s ON sd.sponsor_id = s.id
  LEFT JOIN organizations o ON s.organization_id = o.id
  WHERE s.production_id = p_production_id
    AND sd.status IN ('pending', 'in_progress')
    AND sd.due_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + p_days_ahead)
  ORDER BY sd.due_date;
END;
$$;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_sponsor_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sponsor_tiers_updated_at ON sponsor_tiers;
CREATE TRIGGER sponsor_tiers_updated_at
  BEFORE UPDATE ON sponsor_tiers
  FOR EACH ROW EXECUTE FUNCTION update_sponsor_timestamp();

DROP TRIGGER IF EXISTS sponsors_updated_at ON sponsors;
CREATE TRIGGER sponsors_updated_at
  BEFORE UPDATE ON sponsors
  FOR EACH ROW EXECUTE FUNCTION update_sponsor_timestamp();

DROP TRIGGER IF EXISTS sponsor_deliverables_updated_at ON sponsor_deliverables;
CREATE TRIGGER sponsor_deliverables_updated_at
  BEFORE UPDATE ON sponsor_deliverables
  FOR EACH ROW EXECUTE FUNCTION update_sponsor_timestamp();

DROP TRIGGER IF EXISTS sponsor_activations_updated_at ON sponsor_activations;
CREATE TRIGGER sponsor_activations_updated_at
  BEFORE UPDATE ON sponsor_activations
  FOR EACH ROW EXECUTE FUNCTION update_sponsor_timestamp();

DROP TRIGGER IF EXISTS sponsor_payments_updated_at ON sponsor_payments;
CREATE TRIGGER sponsor_payments_updated_at
  BEFORE UPDATE ON sponsor_payments
  FOR EACH ROW EXECUTE FUNCTION update_sponsor_timestamp();

-- RLS Policies
ALTER TABLE sponsor_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_activations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY sponsor_tiers_select ON sponsor_tiers
  FOR SELECT TO authenticated
  USING (
    organization_id IS NULL 
    OR org_matches(organization_id)
    OR production_id IN (SELECT id FROM productions WHERE org_matches(organization_id))
  );

CREATE POLICY sponsor_tiers_manage ON sponsor_tiers
  FOR ALL TO authenticated
  USING (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'))
  WITH CHECK (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

CREATE POLICY sponsors_select ON sponsors
  FOR SELECT TO authenticated
  USING (production_id IN (SELECT id FROM productions WHERE org_matches(organization_id)));

CREATE POLICY sponsors_manage ON sponsors
  FOR ALL TO authenticated
  USING (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'))
  WITH CHECK (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

CREATE POLICY sponsor_deliverables_select ON sponsor_deliverables
  FOR SELECT TO authenticated
  USING (sponsor_id IN (SELECT id FROM sponsors WHERE production_id IN (SELECT id FROM productions WHERE org_matches(organization_id))));

CREATE POLICY sponsor_deliverables_manage ON sponsor_deliverables
  FOR ALL TO authenticated
  USING (role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'))
  WITH CHECK (role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

CREATE POLICY sponsor_activations_select ON sponsor_activations
  FOR SELECT TO authenticated
  USING (sponsor_id IN (SELECT id FROM sponsors WHERE production_id IN (SELECT id FROM productions WHERE org_matches(organization_id))));

CREATE POLICY sponsor_activations_manage ON sponsor_activations
  FOR ALL TO authenticated
  USING (role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN'))
  WITH CHECK (role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN'));

CREATE POLICY sponsor_payments_select ON sponsor_payments
  FOR SELECT TO authenticated
  USING (sponsor_id IN (SELECT id FROM sponsors WHERE production_id IN (SELECT id FROM productions WHERE org_matches(organization_id))));

CREATE POLICY sponsor_payments_manage ON sponsor_payments
  FOR ALL TO authenticated
  USING (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'))
  WITH CHECK (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON sponsor_tiers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON sponsors TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON sponsor_deliverables TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON sponsor_activations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON sponsor_payments TO authenticated;

GRANT EXECUTE ON FUNCTION get_sponsorship_summary(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_sponsor_dashboard(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION record_sponsor_payment(UUID, NUMERIC, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_upcoming_sponsor_deliverables(UUID, INTEGER) TO authenticated;

-- Seed default sponsor tiers
INSERT INTO sponsor_tiers (organization_id, production_id, name, level, investment_min, investment_max, is_exclusive, max_sponsors, description, color, sort_order) VALUES
  (NULL, NULL, 'Title', 10, 100000, NULL, true, 1, 'Exclusive title sponsorship with naming rights', '#c0392b', 1),
  (NULL, NULL, 'Presenting', 9, 50000, 99999, true, 1, 'Presenting sponsor with premium placement', '#9b59b6', 2),
  (NULL, NULL, 'Platinum', 8, 25000, 49999, false, 3, 'Platinum tier with extensive benefits', '#95a5a6', 3),
  (NULL, NULL, 'Gold', 7, 10000, 24999, false, 5, 'Gold tier with prominent visibility', '#f39c12', 4),
  (NULL, NULL, 'Silver', 6, 5000, 9999, false, 10, 'Silver tier with standard benefits', '#bdc3c7', 5),
  (NULL, NULL, 'Bronze', 5, 2500, 4999, false, NULL, 'Bronze tier entry-level sponsorship', '#cd7f32', 6),
  (NULL, NULL, 'Community', 4, 1000, 2499, false, NULL, 'Community partner level', '#27ae60', 7),
  (NULL, NULL, 'In-Kind', 3, 0, NULL, false, NULL, 'Value-in-kind sponsorship', '#3498db', 8)
ON CONFLICT DO NOTHING;
