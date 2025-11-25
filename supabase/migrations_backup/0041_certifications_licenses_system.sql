-- =====================================================
-- CERTIFICATIONS & LICENSES SYSTEM
-- =====================================================
-- Track crew member certifications, licenses, and professional credentials for COMPVSS
-- Critical for crew assignment, compliance, and safety

-- =====================================================
-- CERTIFICATION TYPES TABLE (Master Catalog)
-- =====================================================

CREATE TABLE IF NOT EXISTS certification_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Type details
  name TEXT NOT NULL UNIQUE,
  code TEXT UNIQUE, -- OSHA30, CDL-A, ETCP-R, etc.
  category TEXT NOT NULL CHECK (category IN (
    'safety', 'technical', 'professional', 'equipment', 'regulatory', 'trade_specific'
  )),
  
  -- Description
  description TEXT,
  issuing_organization TEXT NOT NULL,
  
  -- Requirements
  prerequisites TEXT[],
  required_for_roles TEXT[], -- Which crew roles require this
  
  -- Validity
  requires_renewal BOOLEAN DEFAULT true,
  renewal_period_months INTEGER, -- 12, 24, 36, etc.
  renewal_requirements TEXT,
  
  -- Training
  training_duration_hours INTEGER,
  training_providers TEXT[],
  
  -- Cost
  typical_cost NUMERIC(8, 2),
  renewal_cost NUMERIC(8, 2),
  currency TEXT DEFAULT 'USD',
  
  -- Verification
  verification_url TEXT, -- Website to verify certificate
  
  -- Tracking
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CREW CERTIFICATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS crew_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Crew member
  crew_member_id UUID NOT NULL REFERENCES crew_members(id) ON DELETE CASCADE,
  
  -- Certification
  certification_type_id UUID NOT NULL REFERENCES certification_types(id),
  certificate_number TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
    'active', 'expired', 'suspended', 'pending_verification', 'revoked'
  )),
  
  -- Dates
  issued_date DATE NOT NULL,
  expiration_date DATE,
  verified_date DATE,
  last_verification_date DATE,
  
  -- Issuer
  issued_by TEXT,
  issuing_organization TEXT,
  
  -- Documents
  certificate_url TEXT,
  documentation_url TEXT,
  
  -- Verification
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES platform_users(id),
  verification_method TEXT, -- manual, api, third_party
  
  -- Reminders
  reminder_days_before INTEGER DEFAULT 30,
  reminder_sent BOOLEAN DEFAULT false,
  
  -- Renewal tracking
  renewal_in_progress BOOLEAN DEFAULT false,
  renewal_started_date DATE,
  
  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id),
  
  notes TEXT,
  
  CONSTRAINT unique_crew_cert UNIQUE (crew_member_id, certification_type_id, certificate_number)
);

-- =====================================================
-- CERTIFICATION REQUIREMENTS TABLE (Project/Role based)
-- =====================================================

CREATE TABLE IF NOT EXISTS certification_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Requirement scope
  requirement_type TEXT NOT NULL CHECK (requirement_type IN (
    'role', 'project', 'venue', 'client', 'regulatory'
  )),
  target_id UUID, -- ID of role, project, venue, etc.
  target_name TEXT, -- Human readable name
  
  -- Certification required
  certification_type_id UUID NOT NULL REFERENCES certification_types(id),
  is_mandatory BOOLEAN DEFAULT true,
  alternative_certifications UUID[], -- IDs of alternative acceptable certs
  
  -- Effective dates
  effective_from DATE DEFAULT CURRENT_DATE,
  effective_until DATE,
  
  -- Details
  reason TEXT,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id)
);

-- =====================================================
-- CERTIFICATION RENEWALS TABLE (History)
-- =====================================================

CREATE TABLE IF NOT EXISTS certification_renewals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_certification_id UUID NOT NULL REFERENCES crew_certifications(id) ON DELETE CASCADE,
  
  -- Renewal details
  previous_expiration_date DATE NOT NULL,
  new_expiration_date DATE NOT NULL,
  renewed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Provider
  renewal_provider TEXT,
  renewal_cost NUMERIC(8, 2),
  
  -- Documentation
  certificate_url TEXT,
  receipt_url TEXT,
  
  -- Tracking
  processed_by UUID REFERENCES platform_users(id),
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TRAINING RECORDS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS training_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID NOT NULL REFERENCES crew_members(id) ON DELETE CASCADE,
  
  -- Training details
  training_type TEXT NOT NULL CHECK (training_type IN (
    'initial', 'refresher', 'advanced', 'specialized', 'continuing_education'
  )),
  certification_type_id UUID REFERENCES certification_types(id), -- If training is for cert
  
  title TEXT NOT NULL,
  provider TEXT,
  instructor TEXT,
  
  -- Schedule
  training_date DATE NOT NULL,
  duration_hours NUMERIC(4, 1),
  location TEXT,
  
  -- Completion
  completed BOOLEAN DEFAULT false,
  completion_date DATE,
  score NUMERIC(5, 2), -- Test score if applicable
  passed BOOLEAN,
  
  -- Cost
  cost NUMERIC(8, 2),
  paid_by TEXT CHECK (paid_by IN ('company', 'crew_member', 'grant', 'other')),
  
  -- Documents
  certificate_url TEXT,
  materials_url TEXT,
  
  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id),
  
  notes TEXT
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_certification_types_category ON certification_types(category);
CREATE INDEX idx_certification_types_code ON certification_types(code);
CREATE INDEX idx_certification_types_active ON certification_types(is_active) WHERE is_active = true;

CREATE INDEX idx_crew_certifications_member ON crew_certifications(crew_member_id);
CREATE INDEX idx_crew_certifications_type ON crew_certifications(certification_type_id);
CREATE INDEX idx_crew_certifications_status ON crew_certifications(status);
CREATE INDEX idx_crew_certifications_expiration ON crew_certifications(expiration_date);
CREATE INDEX idx_crew_certifications_expired ON crew_certifications(expiration_date) WHERE expiration_date < CURRENT_DATE;
CREATE INDEX idx_crew_certifications_expiring ON crew_certifications(expiration_date) WHERE expiration_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '90 days');

CREATE INDEX idx_certification_requirements_type ON certification_requirements(requirement_type, target_id);
CREATE INDEX idx_certification_requirements_cert ON certification_requirements(certification_type_id);

CREATE INDEX idx_certification_renewals_cert ON certification_renewals(crew_certification_id);
CREATE INDEX idx_certification_renewals_date ON certification_renewals(renewed_date);

CREATE INDEX idx_training_records_member ON training_records(crew_member_id);
CREATE INDEX idx_training_records_cert ON training_records(certification_type_id);
CREATE INDEX idx_training_records_date ON training_records(training_date);

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE certification_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE certification_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE certification_renewals ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_records ENABLE ROW LEVEL SECURITY;

-- Certification types (public read for active types)
CREATE POLICY "Anyone can view active certification types"
  ON certification_types FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage certification types"
  ON certification_types FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM platform_users
      WHERE id = auth.uid()
      AND role IN ('COMPVSS_ADMIN', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN')
    )
  );

-- Crew certifications
CREATE POLICY "Crew members can view their own certifications"
  ON crew_certifications FOR SELECT
  TO authenticated
  USING (
    crew_member_id IN (
      SELECT id FROM crew_members WHERE user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM platform_users
      WHERE id = auth.uid()
      AND role IN ('COMPVSS_ADMIN', 'COMPVSS_TEAM_MEMBER', 'ATLVS_ADMIN')
    )
  );

CREATE POLICY "Crew members can update their own certifications"
  ON crew_certifications FOR UPDATE
  TO authenticated
  USING (
    crew_member_id IN (
      SELECT id FROM crew_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all certifications"
  ON crew_certifications FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM platform_users
      WHERE id = auth.uid()
      AND role IN ('COMPVSS_ADMIN', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN')
    )
  );

-- Certification requirements (public read)
CREATE POLICY "Anyone can view certification requirements"
  ON certification_requirements FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage requirements"
  ON certification_requirements FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM platform_users
      WHERE id = auth.uid()
      AND role IN ('COMPVSS_ADMIN', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN')
    )
  );

-- Certification renewals
CREATE POLICY "Users can view related renewals"
  ON certification_renewals FOR SELECT
  TO authenticated
  USING (
    crew_certification_id IN (
      SELECT id FROM crew_certifications
      WHERE crew_member_id IN (
        SELECT id FROM crew_members WHERE user_id = auth.uid()
      )
    )
    OR EXISTS (
      SELECT 1 FROM platform_users
      WHERE id = auth.uid()
      AND role IN ('COMPVSS_ADMIN', 'ATLVS_ADMIN')
    )
  );

CREATE POLICY "Admins can create renewals"
  ON certification_renewals FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM platform_users
      WHERE id = auth.uid()
      AND role IN ('COMPVSS_ADMIN', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN')
    )
  );

-- Training records (similar to certifications)
CREATE POLICY "Crew members can view their own training"
  ON training_records FOR SELECT
  TO authenticated
  USING (
    crew_member_id IN (
      SELECT id FROM crew_members WHERE user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM platform_users
      WHERE id = auth.uid()
      AND role IN ('COMPVSS_ADMIN', 'COMPVSS_TEAM_MEMBER', 'ATLVS_ADMIN')
    )
  );

CREATE POLICY "Admins can manage training records"
  ON training_records FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM platform_users
      WHERE id = auth.uid()
      AND role IN ('COMPVSS_ADMIN', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN')
    )
  );

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to get expiring certifications
CREATE OR REPLACE FUNCTION get_expiring_certifications(days_ahead INTEGER DEFAULT 30)
RETURNS TABLE (
  cert_id UUID,
  crew_member_name TEXT,
  certification_name TEXT,
  expiration_date DATE,
  days_until_expiry INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cc.id,
    cm.full_name,
    ct.name,
    cc.expiration_date,
    (cc.expiration_date - CURRENT_DATE)::INTEGER as days_until_expiry
  FROM crew_certifications cc
  JOIN crew_members cm ON cc.crew_member_id = cm.id
  JOIN certification_types ct ON cc.certification_type_id = ct.id
  WHERE cc.status = 'active'
    AND cc.expiration_date IS NOT NULL
    AND cc.expiration_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + days_ahead)
  ORDER BY cc.expiration_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-expire certifications
CREATE OR REPLACE FUNCTION auto_expire_certifications()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE crew_certifications
  SET status = 'expired',
      updated_at = NOW()
  WHERE status = 'active'
    AND expiration_date < CURRENT_DATE;
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check crew member qualification for role
CREATE OR REPLACE FUNCTION check_crew_qualifications(
  member_id UUID,
  role_name TEXT
)
RETURNS TABLE (
  is_qualified BOOLEAN,
  missing_certifications TEXT[],
  expired_certifications TEXT[]
) AS $$
DECLARE
  required_certs UUID[];
  member_active_certs UUID[];
  member_expired_certs UUID[];
BEGIN
  -- Get required certifications for role
  SELECT ARRAY_AGG(certification_type_id)
  INTO required_certs
  FROM certification_requirements
  WHERE requirement_type = 'role'
    AND target_name = role_name
    AND is_mandatory = true;
  
  -- Get crew member's active certifications
  SELECT ARRAY_AGG(certification_type_id)
  INTO member_active_certs
  FROM crew_certifications
  WHERE crew_member_id = member_id
    AND status = 'active'
    AND (expiration_date IS NULL OR expiration_date >= CURRENT_DATE);
  
  -- Get crew member's expired certifications
  SELECT ARRAY_AGG(ct.name)
  INTO member_expired_certs
  FROM crew_certifications cc
  JOIN certification_types ct ON cc.certification_type_id = ct.id
  WHERE cc.crew_member_id = member_id
    AND cc.status = 'expired';
  
  -- Check if qualified
  is_qualified := required_certs <@ COALESCE(member_active_certs, ARRAY[]::UUID[]);
  
  -- Get missing certifications
  SELECT ARRAY_AGG(ct.name)
  INTO missing_certifications
  FROM certification_types ct
  WHERE ct.id = ANY(required_certs)
    AND ct.id != ALL(COALESCE(member_active_certs, ARRAY[]::UUID[]));
  
  expired_certifications := member_expired_certs;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update timestamps
CREATE TRIGGER update_certification_types_timestamp
  BEFORE UPDATE ON certification_types
  FOR EACH ROW
  EXECUTE FUNCTION update_contracts_timestamp();

CREATE TRIGGER update_crew_certifications_timestamp
  BEFORE UPDATE ON crew_certifications
  FOR EACH ROW
  EXECUTE FUNCTION update_contracts_timestamp();

-- Create renewal record when certification is renewed
CREATE OR REPLACE FUNCTION log_certification_renewal()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.expiration_date IS DISTINCT FROM NEW.expiration_date 
     AND NEW.expiration_date > OLD.expiration_date THEN
    INSERT INTO certification_renewals (
      crew_certification_id,
      previous_expiration_date,
      new_expiration_date,
      renewed_date
    ) VALUES (
      NEW.id,
      OLD.expiration_date,
      NEW.expiration_date,
      CURRENT_DATE
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_cert_renewal
  AFTER UPDATE OF expiration_date ON crew_certifications
  FOR EACH ROW
  EXECUTE FUNCTION log_certification_renewal();

COMMENT ON TABLE certification_types IS 'Master catalog of all available certifications and licenses';
COMMENT ON TABLE crew_certifications IS 'Crew member certifications with expiration tracking';
COMMENT ON TABLE certification_requirements IS 'Defines which certifications are required for roles, projects, or venues';
COMMENT ON TABLE certification_renewals IS 'Historical record of certification renewals';
COMMENT ON TABLE training_records IS 'Training and continuing education records for crew members';
