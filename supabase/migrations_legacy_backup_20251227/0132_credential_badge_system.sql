-- Migration: Credential/Badge System
-- Description: Complete credential and access control system from ExperienceGeneratorSchema

-- Add credential status enum
DO $$ BEGIN
  CREATE TYPE credential_status_enum AS ENUM ('pending', 'active', 'suspended', 'revoked', 'expired');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Credential Types table
CREATE TABLE IF NOT EXISTS credential_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL,
  description TEXT,
  color VARCHAR(7),
  access_level INTEGER DEFAULT 1 CHECK (access_level BETWEEN 1 AND 10),
  requires_photo BOOLEAN DEFAULT false,
  requires_background_check BOOLEAN DEFAULT false,
  requires_nda BOOLEAN DEFAULT false,
  max_per_production INTEGER,
  valid_days INTEGER DEFAULT 365,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, code)
);

-- Credentials table
CREATE TABLE IF NOT EXISTS credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_id UUID REFERENCES productions(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  credential_type_id UUID NOT NULL REFERENCES credential_types(id),
  credential_number VARCHAR(50) UNIQUE,
  status credential_status_enum DEFAULT 'pending',
  valid_from DATE NOT NULL,
  valid_until DATE NOT NULL,
  photo_url TEXT,
  qr_code TEXT,
  barcode TEXT,
  issued_by_id UUID REFERENCES platform_users(id),
  issued_at TIMESTAMPTZ,
  activated_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revoked_by_id UUID REFERENCES platform_users(id),
  revocation_reason TEXT,
  last_scanned_at TIMESTAMPTZ,
  last_scanned_zone_id UUID,
  scan_count INTEGER DEFAULT 0,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (valid_until >= valid_from)
);

-- Credential Zone Access (junction table)
CREATE TABLE IF NOT EXISTS credential_zone_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_type_id UUID NOT NULL REFERENCES credential_types(id) ON DELETE CASCADE,
  zone_id UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  access_allowed BOOLEAN DEFAULT true,
  time_restrictions JSONB,
  max_entries_per_day INTEGER,
  requires_escort BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(credential_type_id, zone_id)
);

-- Credential Scan Log
CREATE TABLE IF NOT EXISTS credential_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id UUID NOT NULL REFERENCES credentials(id) ON DELETE CASCADE,
  zone_id UUID REFERENCES zones(id),
  scan_type VARCHAR(20) NOT NULL CHECK (scan_type IN ('entry', 'exit', 'checkpoint', 'verification')),
  scan_result VARCHAR(20) NOT NULL CHECK (scan_result IN ('granted', 'denied', 'expired', 'revoked', 'invalid', 'time_restricted')),
  scanned_by_id UUID REFERENCES platform_users(id),
  device_id TEXT,
  location TEXT,
  latitude NUMERIC(10,8),
  longitude NUMERIC(11,8),
  notes TEXT,
  scanned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_credential_types_org ON credential_types(organization_id);
CREATE INDEX IF NOT EXISTS idx_credential_types_code ON credential_types(code);
CREATE INDEX IF NOT EXISTS idx_credential_types_access_level ON credential_types(access_level);

CREATE INDEX IF NOT EXISTS idx_credentials_production ON credentials(production_id);
CREATE INDEX IF NOT EXISTS idx_credentials_contact ON credentials(contact_id);
CREATE INDEX IF NOT EXISTS idx_credentials_type ON credentials(credential_type_id);
CREATE INDEX IF NOT EXISTS idx_credentials_status ON credentials(status);
CREATE INDEX IF NOT EXISTS idx_credentials_dates ON credentials(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_credentials_number ON credentials(credential_number);

CREATE INDEX IF NOT EXISTS idx_credential_zone_access_type ON credential_zone_access(credential_type_id);
CREATE INDEX IF NOT EXISTS idx_credential_zone_access_zone ON credential_zone_access(zone_id);

CREATE INDEX IF NOT EXISTS idx_credential_scans_credential ON credential_scans(credential_id);
CREATE INDEX IF NOT EXISTS idx_credential_scans_zone ON credential_scans(zone_id);
CREATE INDEX IF NOT EXISTS idx_credential_scans_time ON credential_scans(scanned_at);

-- Comments
COMMENT ON TABLE credential_types IS 'Defines types of credentials/badges with access levels';
COMMENT ON TABLE credentials IS 'Issued credentials/badges for contacts';
COMMENT ON TABLE credential_zone_access IS 'Maps credential types to zone access permissions';
COMMENT ON TABLE credential_scans IS 'Audit log of credential scans';

-- Function to generate credential number
CREATE OR REPLACE FUNCTION generate_credential_number(p_production_id UUID, p_type_code VARCHAR(20))
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_year TEXT;
  v_sequence INTEGER;
  v_prefix TEXT;
BEGIN
  v_year := TO_CHAR(CURRENT_DATE, 'YY');
  v_prefix := UPPER(p_type_code);
  
  SELECT COALESCE(MAX(
    CASE WHEN credential_number ~ ('^' || v_prefix || '-' || v_year || '-[0-9]+$')
    THEN CAST(SUBSTRING(credential_number FROM '[0-9]+$') AS INTEGER) ELSE 0 END
  ), 0) + 1 INTO v_sequence
  FROM credentials 
  WHERE production_id = p_production_id 
    AND credential_number LIKE v_prefix || '-' || v_year || '-%';
  
  RETURN v_prefix || '-' || v_year || '-' || LPAD(v_sequence::TEXT, 4, '0');
END;
$$;

-- Function to issue a credential
CREATE OR REPLACE FUNCTION issue_credential(
  p_production_id UUID,
  p_contact_id UUID,
  p_credential_type_id UUID,
  p_valid_from DATE DEFAULT CURRENT_DATE,
  p_valid_days INTEGER DEFAULT NULL,
  p_issued_by_id UUID DEFAULT NULL,
  p_photo_url TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_credential_id UUID;
  v_type_code VARCHAR(20);
  v_valid_days INTEGER;
  v_credential_number TEXT;
BEGIN
  -- Get credential type info
  SELECT code, valid_days INTO v_type_code, v_valid_days
  FROM credential_types WHERE id = p_credential_type_id;
  
  IF v_type_code IS NULL THEN
    RAISE EXCEPTION 'Invalid credential type';
  END IF;
  
  -- Use provided valid_days or default from type
  v_valid_days := COALESCE(p_valid_days, v_valid_days, 365);
  
  -- Generate credential number
  v_credential_number := generate_credential_number(p_production_id, v_type_code);
  
  -- Insert credential
  INSERT INTO credentials (
    production_id, contact_id, credential_type_id, credential_number,
    status, valid_from, valid_until, photo_url, issued_by_id, issued_at, notes
  ) VALUES (
    p_production_id, p_contact_id, p_credential_type_id, v_credential_number,
    'active', p_valid_from, p_valid_from + v_valid_days, p_photo_url, 
    p_issued_by_id, NOW(), p_notes
  ) RETURNING id INTO v_credential_id;
  
  RETURN v_credential_id;
END;
$$;

-- Function to revoke a credential
CREATE OR REPLACE FUNCTION revoke_credential(
  p_credential_id UUID,
  p_revoked_by_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE credentials
  SET 
    status = 'revoked',
    revoked_at = NOW(),
    revoked_by_id = p_revoked_by_id,
    revocation_reason = p_reason,
    updated_at = NOW()
  WHERE id = p_credential_id
    AND status = 'active';
  
  RETURN FOUND;
END;
$$;

-- Function to check zone access
CREATE OR REPLACE FUNCTION check_zone_access(
  p_credential_id UUID,
  p_zone_id UUID
)
RETURNS TABLE (
  access_granted BOOLEAN,
  denial_reason TEXT,
  credential_status credential_status_enum,
  access_level INTEGER,
  zone_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_credential RECORD;
  v_zone RECORD;
  v_access RECORD;
BEGIN
  -- Get credential info
  SELECT c.*, ct.access_level, ct.code AS type_code
  INTO v_credential
  FROM credentials c
  JOIN credential_types ct ON c.credential_type_id = ct.id
  WHERE c.id = p_credential_id;
  
  IF v_credential IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Invalid credential'::TEXT, NULL::credential_status_enum, 0, NULL::TEXT;
    RETURN;
  END IF;
  
  -- Check credential status
  IF v_credential.status != 'active' THEN
    RETURN QUERY SELECT FALSE, 'Credential is ' || v_credential.status::TEXT, v_credential.status, v_credential.access_level, NULL::TEXT;
    RETURN;
  END IF;
  
  -- Check validity dates
  IF CURRENT_DATE < v_credential.valid_from THEN
    RETURN QUERY SELECT FALSE, 'Credential not yet valid'::TEXT, v_credential.status, v_credential.access_level, NULL::TEXT;
    RETURN;
  END IF;
  
  IF CURRENT_DATE > v_credential.valid_until THEN
    RETURN QUERY SELECT FALSE, 'Credential expired'::TEXT, v_credential.status, v_credential.access_level, NULL::TEXT;
    RETURN;
  END IF;
  
  -- Get zone info
  SELECT * INTO v_zone FROM zones WHERE id = p_zone_id;
  
  IF v_zone IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Invalid zone'::TEXT, v_credential.status, v_credential.access_level, NULL::TEXT;
    RETURN;
  END IF;
  
  -- Check explicit zone access
  SELECT * INTO v_access
  FROM credential_zone_access
  WHERE credential_type_id = v_credential.credential_type_id
    AND zone_id = p_zone_id;
  
  -- If explicit access defined, use it
  IF v_access IS NOT NULL THEN
    IF v_access.access_allowed THEN
      RETURN QUERY SELECT TRUE, NULL::TEXT, v_credential.status, v_credential.access_level, v_zone.name;
    ELSE
      RETURN QUERY SELECT FALSE, 'Access denied for this credential type'::TEXT, v_credential.status, v_credential.access_level, v_zone.name;
    END IF;
    RETURN;
  END IF;
  
  -- Fall back to access level comparison
  IF v_credential.access_level >= v_zone.access_level THEN
    RETURN QUERY SELECT TRUE, NULL::TEXT, v_credential.status, v_credential.access_level, v_zone.name;
  ELSE
    RETURN QUERY SELECT FALSE, 'Insufficient access level'::TEXT, v_credential.status, v_credential.access_level, v_zone.name;
  END IF;
END;
$$;

-- Function to log a credential scan
CREATE OR REPLACE FUNCTION log_credential_scan(
  p_credential_id UUID,
  p_zone_id UUID,
  p_scan_type VARCHAR(20),
  p_scanned_by_id UUID DEFAULT NULL,
  p_device_id TEXT DEFAULT NULL,
  p_location TEXT DEFAULT NULL
)
RETURNS TABLE (
  scan_id UUID,
  access_granted BOOLEAN,
  denial_reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_access RECORD;
  v_scan_id UUID;
  v_result VARCHAR(20);
BEGIN
  -- Check access
  SELECT * INTO v_access FROM check_zone_access(p_credential_id, p_zone_id);
  
  -- Determine result
  IF v_access.access_granted THEN
    v_result := 'granted';
  ELSIF v_access.denial_reason LIKE '%expired%' THEN
    v_result := 'expired';
  ELSIF v_access.denial_reason LIKE '%revoked%' THEN
    v_result := 'revoked';
  ELSE
    v_result := 'denied';
  END IF;
  
  -- Log the scan
  INSERT INTO credential_scans (
    credential_id, zone_id, scan_type, scan_result, 
    scanned_by_id, device_id, location
  ) VALUES (
    p_credential_id, p_zone_id, p_scan_type, v_result,
    p_scanned_by_id, p_device_id, p_location
  ) RETURNING id INTO v_scan_id;
  
  -- Update credential last scan info
  UPDATE credentials
  SET 
    last_scanned_at = NOW(),
    last_scanned_zone_id = p_zone_id,
    scan_count = scan_count + 1
  WHERE id = p_credential_id;
  
  RETURN QUERY SELECT v_scan_id, v_access.access_granted, v_access.denial_reason;
END;
$$;

-- Function to get active credentials for a production
CREATE OR REPLACE FUNCTION get_production_credentials(
  p_production_id UUID,
  p_status credential_status_enum DEFAULT 'active'
)
RETURNS TABLE (
  credential_id UUID,
  credential_number VARCHAR(50),
  contact_name TEXT,
  contact_email TEXT,
  credential_type TEXT,
  access_level INTEGER,
  status credential_status_enum,
  valid_from DATE,
  valid_until DATE,
  days_remaining INTEGER,
  scan_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cr.id,
    cr.credential_number,
    COALESCE(c.first_name || ' ' || c.last_name, c.company) AS contact_name,
    c.email,
    ct.name AS credential_type,
    ct.access_level,
    cr.status,
    cr.valid_from,
    cr.valid_until,
    (cr.valid_until - CURRENT_DATE)::INTEGER AS days_remaining,
    cr.scan_count
  FROM credentials cr
  JOIN contacts c ON cr.contact_id = c.id
  JOIN credential_types ct ON cr.credential_type_id = ct.id
  WHERE cr.production_id = p_production_id
    AND (p_status IS NULL OR cr.status = p_status)
  ORDER BY ct.access_level DESC, c.last_name;
END;
$$;

-- Trigger to auto-expire credentials
CREATE OR REPLACE FUNCTION auto_expire_credentials()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'active' AND NEW.valid_until < CURRENT_DATE THEN
    NEW.status := 'expired';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS credential_auto_expire_trigger ON credentials;
CREATE TRIGGER credential_auto_expire_trigger
  BEFORE INSERT OR UPDATE ON credentials
  FOR EACH ROW
  EXECUTE FUNCTION auto_expire_credentials();

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_credentials_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS credentials_updated_at_trigger ON credentials;
CREATE TRIGGER credentials_updated_at_trigger
  BEFORE UPDATE ON credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_credentials_timestamp();

DROP TRIGGER IF EXISTS credential_types_updated_at_trigger ON credential_types;
CREATE TRIGGER credential_types_updated_at_trigger
  BEFORE UPDATE ON credential_types
  FOR EACH ROW
  EXECUTE FUNCTION update_credentials_timestamp();

-- RLS Policies
ALTER TABLE credential_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE credential_zone_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE credential_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY credential_types_select ON credential_types
  FOR SELECT TO authenticated
  USING (organization_id IS NULL OR org_matches(organization_id));

CREATE POLICY credential_types_manage ON credential_types
  FOR ALL TO authenticated
  USING (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN'))
  WITH CHECK (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN'));

CREATE POLICY credentials_select ON credentials
  FOR SELECT TO authenticated
  USING (
    production_id IN (SELECT id FROM productions WHERE org_matches(organization_id))
    OR contact_id IN (SELECT id FROM contacts WHERE org_matches(organization_id))
  );

CREATE POLICY credentials_manage ON credentials
  FOR ALL TO authenticated
  USING (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN'))
  WITH CHECK (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN'));

CREATE POLICY credential_zone_access_select ON credential_zone_access
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY credential_zone_access_manage ON credential_zone_access
  FOR ALL TO authenticated
  USING (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN'))
  WITH CHECK (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN'));

CREATE POLICY credential_scans_select ON credential_scans
  FOR SELECT TO authenticated
  USING (
    credential_id IN (
      SELECT id FROM credentials WHERE production_id IN (
        SELECT id FROM productions WHERE org_matches(organization_id)
      )
    )
  );

CREATE POLICY credential_scans_insert ON credential_scans
  FOR INSERT TO authenticated WITH CHECK (TRUE);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON credential_types TO authenticated;
GRANT SELECT, INSERT, UPDATE ON credentials TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON credential_zone_access TO authenticated;
GRANT SELECT, INSERT ON credential_scans TO authenticated;

GRANT EXECUTE ON FUNCTION generate_credential_number(UUID, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION issue_credential(UUID, UUID, UUID, DATE, INTEGER, UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION revoke_credential(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_zone_access(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION log_credential_scan(UUID, UUID, VARCHAR, UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_production_credentials(UUID, credential_status_enum) TO authenticated;

-- Seed default credential types
INSERT INTO credential_types (organization_id, name, code, description, access_level, color, requires_photo, sort_order) VALUES
  (NULL, 'All Access', 'AA', 'Executive team, key production leadership', 10, '#c0392b', true, 1),
  (NULL, 'Production', 'PROD', 'Production staff, technical crew, stagehands', 8, '#9b59b6', true, 2),
  (NULL, 'Artist/Talent', 'ART', 'Performers, talent entourage, management', 7, '#f39c12', true, 3),
  (NULL, 'Operations', 'OPS', 'FOH staff, guest services, security', 5, '#3498db', true, 4),
  (NULL, 'Food & Beverage', 'FB', 'Food and beverage staff', 4, '#27ae60', false, 5),
  (NULL, 'Vendor', 'VND', 'External vendors, suppliers', 3, '#95a5a6', false, 6),
  (NULL, 'Sponsor', 'SPNR', 'Sponsor representatives', 4, '#e67e22', false, 7),
  (NULL, 'Media', 'MED', 'Press, photographers, videographers', 5, '#1abc9c', true, 8),
  (NULL, 'VIP', 'VIP', 'VIP guests', 3, '#8e44ad', false, 9),
  (NULL, 'General', 'GA', 'Standard guest admission', 1, '#bdc3c7', false, 10)
ON CONFLICT DO NOTHING;
