-- ============================================================================
-- 0038_3nf_remediation.sql
-- 3NF Schema Remediation: Address normalization and FK improvements
-- GHXSTSHIP Platform - Database Normalization Compliance
-- ============================================================================

-- ============================================================================
-- SECTION 1: CONTACTS TABLE - ADD ADDRESS FK REFERENCE
-- The contacts table has inline address fields (address, city, state, 
-- postal_code, country) which violates 3NF. We add an address_id FK
-- to properly reference the normalized addresses table while keeping
-- the inline fields for backwards compatibility during migration.
-- ============================================================================

-- Add address_id foreign key to contacts table
ALTER TABLE contacts 
  ADD COLUMN IF NOT EXISTS address_id UUID REFERENCES addresses(id) ON DELETE SET NULL;

-- Create index for the new FK
CREATE INDEX IF NOT EXISTS idx_contacts_address ON contacts(address_id);

-- ============================================================================
-- SECTION 2: ENTITY ADDRESS JUNCTION TABLE
-- Create a proper many-to-many relationship between entities and addresses
-- This allows any Legend entity to have multiple addresses properly normalized
-- ============================================================================

CREATE TABLE IF NOT EXISTS entity_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('person', 'organization', 'place', 'event', 'contact')),
  entity_id UUID NOT NULL,
  address_id UUID NOT NULL REFERENCES addresses(id) ON DELETE CASCADE,
  address_role TEXT NOT NULL DEFAULT 'primary' CHECK (address_role IN ('primary', 'billing', 'shipping', 'mailing', 'home', 'work', 'venue', 'other')),
  is_primary BOOLEAN DEFAULT false,
  effective_from DATE,
  effective_to DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(entity_type, entity_id, address_id, address_role)
);

CREATE INDEX IF NOT EXISTS idx_entity_addresses_org ON entity_addresses(organization_id);
CREATE INDEX IF NOT EXISTS idx_entity_addresses_entity ON entity_addresses(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_addresses_address ON entity_addresses(address_id);
CREATE INDEX IF NOT EXISTS idx_entity_addresses_primary ON entity_addresses(entity_type, entity_id, is_primary) WHERE is_primary = true;

-- ============================================================================
-- SECTION 3: EMERGENCY CONTACTS NORMALIZATION
-- Create a proper emergency_contacts table to normalize emergency contact
-- data that is currently duplicated across multiple profile tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS person_emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_relationship TEXT,
  contact_email TEXT,
  is_primary BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_person_emergency_contacts_org ON person_emergency_contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_person_emergency_contacts_person ON person_emergency_contacts(person_id);
CREATE INDEX IF NOT EXISTS idx_person_emergency_contacts_primary ON person_emergency_contacts(person_id, is_primary) WHERE is_primary = true;

-- ============================================================================
-- SECTION 4: RLS POLICIES
-- ============================================================================

ALTER TABLE entity_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE person_emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Entity Addresses policies
CREATE POLICY entity_addresses_select ON entity_addresses 
  FOR SELECT USING (org_matches(organization_id));
CREATE POLICY entity_addresses_insert ON entity_addresses 
  FOR INSERT WITH CHECK (org_matches(organization_id));
CREATE POLICY entity_addresses_update ON entity_addresses 
  FOR UPDATE USING (org_matches(organization_id));
CREATE POLICY entity_addresses_delete ON entity_addresses 
  FOR DELETE USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Person Emergency Contacts policies
CREATE POLICY person_emergency_contacts_select ON person_emergency_contacts 
  FOR SELECT USING (org_matches(organization_id));
CREATE POLICY person_emergency_contacts_insert ON person_emergency_contacts 
  FOR INSERT WITH CHECK (org_matches(organization_id));
CREATE POLICY person_emergency_contacts_update ON person_emergency_contacts 
  FOR UPDATE USING (org_matches(organization_id));
CREATE POLICY person_emergency_contacts_delete ON person_emergency_contacts 
  FOR DELETE USING (org_matches(organization_id));

-- ============================================================================
-- SECTION 5: GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON entity_addresses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON person_emergency_contacts TO authenticated;

-- ============================================================================
-- SECTION 6: TRIGGERS
-- ============================================================================

CREATE TRIGGER entity_addresses_updated_at 
  BEFORE UPDATE ON entity_addresses 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER person_emergency_contacts_updated_at 
  BEFORE UPDATE ON person_emergency_contacts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SECTION 7: DATA MIGRATION FUNCTION
-- Function to migrate inline address data to normalized addresses table
-- This can be called to migrate existing data
-- ============================================================================

CREATE OR REPLACE FUNCTION migrate_contact_addresses()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_contact RECORD;
  v_address_id UUID;
BEGIN
  FOR v_contact IN 
    SELECT c.id, c.organization_id, c.address, c.city, c.state, c.postal_code, c.country
    FROM contacts c
    WHERE c.address_id IS NULL 
      AND (c.address IS NOT NULL OR c.city IS NOT NULL OR c.state IS NOT NULL OR c.postal_code IS NOT NULL)
  LOOP
    -- Create address record
    INSERT INTO addresses (
      organization_id, address_type, street_address, city, state_province, postal_code, country
    ) VALUES (
      v_contact.organization_id, 'other', v_contact.address, v_contact.city, 
      v_contact.state, v_contact.postal_code, COALESCE(v_contact.country, 'USA')
    )
    RETURNING id INTO v_address_id;
    
    -- Update contact with address_id
    UPDATE contacts SET address_id = v_address_id WHERE id = v_contact.id;
    
    -- Create entity_addresses junction record
    INSERT INTO entity_addresses (
      organization_id, entity_type, entity_id, address_id, address_role, is_primary
    ) VALUES (
      v_contact.organization_id, 'contact', v_contact.id, v_address_id, 'primary', true
    );
    
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECTION 8: HELPER VIEWS FOR 3NF COMPLIANCE
-- Views that join normalized data for easy querying
-- ============================================================================

CREATE OR REPLACE VIEW v_contacts_with_address AS
SELECT 
  c.id,
  c.organization_id,
  c.person_id,
  c.company,
  c.first_name,
  c.last_name,
  c.email,
  c.phone,
  c.title,
  c.department,
  c.source,
  c.lead_status,
  c.tags,
  c.metadata,
  c.created_at,
  c.updated_at,
  -- Normalized address (preferred)
  a.id AS address_id,
  a.street_address,
  a.street_address_2,
  a.city AS normalized_city,
  a.state_province AS normalized_state,
  a.postal_code AS normalized_postal_code,
  a.country AS normalized_country,
  -- Legacy inline address (for backwards compatibility)
  c.address AS legacy_address,
  c.city AS legacy_city,
  c.state AS legacy_state,
  c.postal_code AS legacy_postal_code,
  c.country AS legacy_country,
  -- Computed full address
  COALESCE(a.street_address, c.address) AS full_street_address,
  COALESCE(a.city, c.city) AS full_city,
  COALESCE(a.state_province, c.state) AS full_state,
  COALESCE(a.postal_code, c.postal_code) AS full_postal_code,
  COALESCE(a.country, c.country, 'USA') AS full_country
FROM contacts c
LEFT JOIN addresses a ON c.address_id = a.id;

CREATE OR REPLACE VIEW v_people_with_emergency_contacts AS
SELECT 
  lp.id,
  lp.organization_id,
  lp.first_name,
  lp.last_name,
  lp.display_name,
  lp.email,
  lp.phone,
  lp.status,
  pec.id AS emergency_contact_id,
  pec.contact_name AS emergency_contact_name,
  pec.contact_phone AS emergency_contact_phone,
  pec.contact_relationship AS emergency_contact_relationship,
  pec.contact_email AS emergency_contact_email
FROM legend_people lp
LEFT JOIN person_emergency_contacts pec ON lp.id = pec.person_id AND pec.is_primary = true;

-- ============================================================================
-- SECTION 9: DOCUMENTATION COMMENT
-- ============================================================================

COMMENT ON TABLE entity_addresses IS '3NF junction table linking any entity to normalized addresses. Replaces inline address fields in various tables.';
COMMENT ON TABLE person_emergency_contacts IS '3NF normalized emergency contact data. Replaces inline emergency_contact_* fields in profile tables.';
COMMENT ON FUNCTION migrate_contact_addresses IS 'Migrates inline address data from contacts table to normalized addresses table. Run once after deployment.';
COMMENT ON VIEW v_contacts_with_address IS 'View providing contacts with both normalized and legacy address data for backwards compatibility.';
COMMENT ON VIEW v_people_with_emergency_contacts IS 'View providing people with their primary emergency contact information.';

