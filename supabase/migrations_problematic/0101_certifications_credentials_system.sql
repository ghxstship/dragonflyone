-- Migration: Certifications & Credentials System
-- Description: Tables for crew certifications, credentials, and compliance tracking

-- Certification types table
CREATE TABLE IF NOT EXISTS certification_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  code TEXT,
  category TEXT NOT NULL CHECK (category IN ('safety', 'technical', 'equipment', 'rigging', 'electrical', 'audio', 'video', 'lighting', 'pyrotechnics', 'first_aid', 'security', 'driving', 'forklift', 'other')),
  description TEXT,
  issuing_organization TEXT,
  validity_period_months INT,
  renewal_required BOOLEAN DEFAULT true,
  renewal_grace_period_days INT DEFAULT 30,
  prerequisites TEXT[],
  training_required BOOLEAN DEFAULT false,
  training_module_id UUID,
  exam_required BOOLEAN DEFAULT false,
  practical_assessment_required BOOLEAN DEFAULT false,
  is_mandatory BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certification_types_org ON certification_types(organization_id);
CREATE INDEX IF NOT EXISTS idx_certification_types_category ON certification_types(category);
CREATE INDEX IF NOT EXISTS idx_certification_types_code ON certification_types(code);

-- Crew certifications table
CREATE TABLE IF NOT EXISTS crew_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID NOT NULL REFERENCES crew_members(id),
  certification_type_id UUID NOT NULL REFERENCES certification_types(id),
  certificate_number TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended', 'pending_verification', 'revoked', 'pending_renewal')),
  issued_date DATE NOT NULL,
  expiration_date DATE,
  issued_by TEXT,
  issuing_organization TEXT,
  certificate_url TEXT,
  certificate_file_id UUID,
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES platform_users(id),
  verified_date DATE,
  verification_method TEXT CHECK (verification_method IN ('manual', 'api', 'document', 'third_party')),
  verification_notes TEXT,
  reminder_days_before INT DEFAULT 30,
  reminder_sent_at TIMESTAMPTZ,
  renewal_in_progress BOOLEAN DEFAULT false,
  notes TEXT,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(crew_member_id, certification_type_id, issued_date)
);

CREATE INDEX IF NOT EXISTS idx_crew_certifications_crew ON crew_certifications(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_crew_certifications_type ON crew_certifications(certification_type_id);
CREATE INDEX IF NOT EXISTS idx_crew_certifications_status ON crew_certifications(status);
CREATE INDEX IF NOT EXISTS idx_crew_certifications_expiration ON crew_certifications(expiration_date);
CREATE INDEX IF NOT EXISTS idx_crew_certifications_verified ON crew_certifications(verified);

-- Certification requirements table (for events/projects)
CREATE TABLE IF NOT EXISTS certification_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  event_id UUID REFERENCES events(id),
  project_id UUID REFERENCES projects(id),
  role TEXT,
  certification_type_id UUID NOT NULL REFERENCES certification_types(id),
  is_mandatory BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certification_requirements_org ON certification_requirements(organization_id);
CREATE INDEX IF NOT EXISTS idx_certification_requirements_event ON certification_requirements(event_id);
CREATE INDEX IF NOT EXISTS idx_certification_requirements_project ON certification_requirements(project_id);

-- Certification renewal history table
CREATE TABLE IF NOT EXISTS certification_renewals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certification_id UUID NOT NULL REFERENCES crew_certifications(id),
  previous_expiration_date DATE,
  new_expiration_date DATE NOT NULL,
  renewal_date DATE NOT NULL,
  renewal_method TEXT CHECK (renewal_method IN ('exam', 'training', 'continuing_education', 'automatic', 'manual')),
  renewal_cost NUMERIC(10,2),
  paid_by TEXT CHECK (paid_by IN ('employee', 'company', 'split')),
  training_completed BOOLEAN DEFAULT false,
  exam_passed BOOLEAN,
  exam_score NUMERIC(5,2),
  processed_by UUID REFERENCES platform_users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certification_renewals_cert ON certification_renewals(certification_id);

-- Credential verification log table
CREATE TABLE IF NOT EXISTS credential_verification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certification_id UUID NOT NULL REFERENCES crew_certifications(id),
  verification_type TEXT NOT NULL CHECK (verification_type IN ('initial', 'periodic', 'renewal', 'audit')),
  verification_method TEXT NOT NULL,
  verified_by UUID REFERENCES platform_users(id),
  verification_result TEXT NOT NULL CHECK (verification_result IN ('valid', 'invalid', 'expired', 'suspended', 'not_found', 'pending')),
  external_verification_id TEXT,
  response_data JSONB,
  notes TEXT,
  verified_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credential_verification_log_cert ON credential_verification_log(certification_id);

-- Function to check certification expiration
CREATE OR REPLACE FUNCTION check_certification_expiration()
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  v_count INT := 0;
BEGIN
  -- Update expired certifications
  UPDATE crew_certifications SET
    status = 'expired',
    updated_at = NOW()
  WHERE status = 'active'
    AND expiration_date < CURRENT_DATE;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  RETURN v_count;
END;
$$;

-- Function to get expiring certifications
CREATE OR REPLACE FUNCTION get_expiring_certifications(p_days INT DEFAULT 90)
RETURNS TABLE (
  certification_id UUID,
  crew_member_id UUID,
  crew_member_name TEXT,
  certification_name TEXT,
  expiration_date DATE,
  days_until_expiration INT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cc.id AS certification_id,
    cc.crew_member_id,
    cm.full_name AS crew_member_name,
    ct.name AS certification_name,
    cc.expiration_date,
    (cc.expiration_date - CURRENT_DATE)::INT AS days_until_expiration
  FROM crew_certifications cc
  JOIN crew_members cm ON cc.crew_member_id = cm.id
  JOIN certification_types ct ON cc.certification_type_id = ct.id
  WHERE cc.status = 'active'
    AND cc.expiration_date IS NOT NULL
    AND cc.expiration_date BETWEEN CURRENT_DATE AND CURRENT_DATE + p_days
  ORDER BY cc.expiration_date ASC;
END;
$$;

-- Function to check crew member certification compliance
CREATE OR REPLACE FUNCTION check_crew_certification_compliance(
  p_crew_member_id UUID,
  p_event_id UUID DEFAULT NULL,
  p_project_id UUID DEFAULT NULL,
  p_role TEXT DEFAULT NULL
)
RETURNS TABLE (
  certification_type_id UUID,
  certification_name TEXT,
  is_mandatory BOOLEAN,
  has_valid_cert BOOLEAN,
  expiration_date DATE,
  status TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cr.certification_type_id,
    ct.name AS certification_name,
    cr.is_mandatory,
    CASE WHEN cc.id IS NOT NULL AND cc.status = 'active' AND (cc.expiration_date IS NULL OR cc.expiration_date >= CURRENT_DATE) THEN TRUE ELSE FALSE END AS has_valid_cert,
    cc.expiration_date,
    COALESCE(cc.status, 'missing') AS status
  FROM certification_requirements cr
  JOIN certification_types ct ON cr.certification_type_id = ct.id
  LEFT JOIN crew_certifications cc ON cc.crew_member_id = p_crew_member_id 
    AND cc.certification_type_id = cr.certification_type_id
    AND cc.status = 'active'
  WHERE (cr.event_id = p_event_id OR cr.project_id = p_project_id OR (cr.event_id IS NULL AND cr.project_id IS NULL))
    AND (cr.role IS NULL OR cr.role = p_role);
END;
$$;

-- Trigger to send expiration reminders
CREATE OR REPLACE FUNCTION send_certification_expiration_reminder()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.expiration_date IS NOT NULL 
     AND NEW.status = 'active' 
     AND NEW.reminder_sent_at IS NULL
     AND NEW.expiration_date - NEW.reminder_days_before <= CURRENT_DATE THEN
    
    -- Create notification
    INSERT INTO notifications (user_id, type, title, message, data, priority)
    SELECT 
      cm.user_id,
      'certification_expiring',
      'Certification Expiring Soon',
      ct.name || ' certification expires on ' || NEW.expiration_date,
      jsonb_build_object('certification_id', NEW.id, 'expiration_date', NEW.expiration_date),
      CASE WHEN NEW.expiration_date - CURRENT_DATE <= 7 THEN 'high' ELSE 'medium' END
    FROM crew_members cm
    JOIN certification_types ct ON ct.id = NEW.certification_type_id
    WHERE cm.id = NEW.crew_member_id
      AND cm.user_id IS NOT NULL;
    
    -- Update reminder sent timestamp
    NEW.reminder_sent_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS certification_expiration_reminder ON crew_certifications;
CREATE TRIGGER certification_expiration_reminder
  BEFORE UPDATE ON crew_certifications
  FOR EACH ROW
  EXECUTE FUNCTION send_certification_expiration_reminder();

-- RLS policies
ALTER TABLE certification_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE certification_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE certification_renewals ENABLE ROW LEVEL SECURITY;
ALTER TABLE credential_verification_log ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON certification_types TO authenticated;
GRANT SELECT, INSERT, UPDATE ON crew_certifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON certification_requirements TO authenticated;
GRANT SELECT, INSERT ON certification_renewals TO authenticated;
GRANT SELECT, INSERT ON credential_verification_log TO authenticated;
GRANT EXECUTE ON FUNCTION check_certification_expiration() TO authenticated;
GRANT EXECUTE ON FUNCTION get_expiring_certifications(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_crew_certification_compliance(UUID, UUID, UUID, TEXT) TO authenticated;
