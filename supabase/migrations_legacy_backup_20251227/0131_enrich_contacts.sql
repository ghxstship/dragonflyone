-- Migration: Enrich Contacts Table
-- Description: Add contact types, hierarchy, and emergency contact fields from ExperienceGeneratorSchema

-- Add contact type enum
DO $$ BEGIN
  CREATE TYPE contact_type_enum AS ENUM (
    'internal', 'vendor', 'contractor', 'sponsor', 'investor', 
    'media', 'artist', 'guest', 'emergency', 'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add contact status enum
DO $$ BEGIN
  CREATE TYPE contact_status_enum AS ENUM ('active', 'inactive', 'pending', 'archived');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Enrich contacts table
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS contact_type contact_type_enum DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS contact_status contact_status_enum DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS prefix VARCHAR(20),
  ADD COLUMN IF NOT EXISTS nickname VARCHAR(50),
  ADD COLUMN IF NOT EXISTS email_secondary TEXT,
  ADD COLUMN IF NOT EXISTS phone_secondary TEXT,
  ADD COLUMN IF NOT EXISTS job_title TEXT,
  ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id),
  ADD COLUMN IF NOT EXISTS reports_to_id UUID REFERENCES contacts(id),
  ADD COLUMN IF NOT EXISTS address_line_1 TEXT,
  ADD COLUMN IF NOT EXISTS address_line_2 TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS country VARCHAR(2) DEFAULT 'US',
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York',
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_relation TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_contacts_contact_type ON contacts(contact_type);
CREATE INDEX IF NOT EXISTS idx_contacts_contact_status ON contacts(contact_status);
CREATE INDEX IF NOT EXISTS idx_contacts_department ON contacts(department_id);
CREATE INDEX IF NOT EXISTS idx_contacts_reports_to ON contacts(reports_to_id);
CREATE INDEX IF NOT EXISTS idx_contacts_tags ON contacts USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_contacts_deleted ON contacts(deleted_at) WHERE deleted_at IS NULL;

-- Add comments
COMMENT ON COLUMN contacts.contact_type IS 'Type of contact: internal, vendor, contractor, sponsor, etc.';
COMMENT ON COLUMN contacts.reports_to_id IS 'Hierarchical reporting structure';
COMMENT ON COLUMN contacts.emergency_contact_name IS 'Emergency contact for crew/staff';
COMMENT ON COLUMN contacts.social_links IS 'Social media links: linkedin, twitter, instagram, etc.';
COMMENT ON COLUMN contacts.preferences IS 'Contact preferences: communication method, availability, etc.';

-- Function to get contact hierarchy
CREATE OR REPLACE FUNCTION get_contact_hierarchy(p_contact_id UUID)
RETURNS TABLE (
  contact_id UUID,
  full_name TEXT,
  job_title TEXT,
  level INTEGER,
  path UUID[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE hierarchy AS (
    -- Base case: the starting contact
    SELECT 
      c.id,
      COALESCE(c.first_name || ' ' || c.last_name, c.company) AS full_name,
      c.job_title,
      0 AS level,
      ARRAY[c.id] AS path
    FROM contacts c
    WHERE c.id = p_contact_id
      AND c.deleted_at IS NULL
    
    UNION ALL
    
    -- Recursive case: managers up the chain
    SELECT 
      c.id,
      COALESCE(c.first_name || ' ' || c.last_name, c.company) AS full_name,
      c.job_title,
      h.level + 1,
      h.path || c.id
    FROM contacts c
    INNER JOIN hierarchy h ON c.id = (
      SELECT reports_to_id FROM contacts WHERE id = h.contact_id
    )
    WHERE c.deleted_at IS NULL
      AND NOT c.id = ANY(h.path) -- Prevent cycles
  )
  SELECT * FROM hierarchy ORDER BY level;
END;
$$;

-- Function to get direct reports
CREATE OR REPLACE FUNCTION get_direct_reports(p_contact_id UUID)
RETURNS TABLE (
  contact_id UUID,
  full_name TEXT,
  email TEXT,
  job_title TEXT,
  department_name TEXT,
  contact_type contact_type_enum
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    COALESCE(c.first_name || ' ' || c.last_name, c.company) AS full_name,
    c.email,
    c.job_title,
    d.name AS department_name,
    c.contact_type
  FROM contacts c
  LEFT JOIN departments d ON c.department_id = d.id
  WHERE c.reports_to_id = p_contact_id
    AND c.deleted_at IS NULL
    AND c.contact_status = 'active'
  ORDER BY c.last_name, c.first_name;
END;
$$;

-- Function to search contacts with filters
CREATE OR REPLACE FUNCTION search_contacts(
  p_org_id UUID,
  p_search_term TEXT DEFAULT NULL,
  p_contact_type contact_type_enum DEFAULT NULL,
  p_department_id UUID DEFAULT NULL,
  p_tags TEXT[] DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  contact_id UUID,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  job_title TEXT,
  contact_type contact_type_enum,
  department_name TEXT,
  tags TEXT[],
  avatar_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    COALESCE(c.first_name || ' ' || c.last_name, c.company) AS full_name,
    c.email,
    c.phone,
    c.company,
    c.job_title,
    c.contact_type,
    d.name AS department_name,
    c.tags,
    c.avatar_url
  FROM contacts c
  LEFT JOIN departments d ON c.department_id = d.id
  WHERE c.organization_id = p_org_id
    AND c.deleted_at IS NULL
    AND c.contact_status = 'active'
    AND (
      p_search_term IS NULL 
      OR c.first_name ILIKE '%' || p_search_term || '%'
      OR c.last_name ILIKE '%' || p_search_term || '%'
      OR c.email ILIKE '%' || p_search_term || '%'
      OR c.company ILIKE '%' || p_search_term || '%'
    )
    AND (p_contact_type IS NULL OR c.contact_type = p_contact_type)
    AND (p_department_id IS NULL OR c.department_id = p_department_id)
    AND (p_tags IS NULL OR c.tags && p_tags)
  ORDER BY c.last_name, c.first_name
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Function to get contacts by type for a production
CREATE OR REPLACE FUNCTION get_production_contacts_by_type(
  p_production_id UUID,
  p_contact_type contact_type_enum DEFAULT NULL
)
RETURNS TABLE (
  contact_id UUID,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  job_title TEXT,
  contact_type contact_type_enum,
  role_in_production TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    COALESCE(c.first_name || ' ' || c.last_name, c.company) AS full_name,
    c.email,
    c.phone,
    c.job_title,
    c.contact_type,
    pc.role AS role_in_production
  FROM production_contacts pc
  JOIN contacts c ON pc.contact_id = c.id
  WHERE pc.production_id = p_production_id
    AND c.deleted_at IS NULL
    AND (p_contact_type IS NULL OR c.contact_type = p_contact_type)
  ORDER BY c.contact_type, c.last_name;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_contact_hierarchy(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_direct_reports(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION search_contacts(UUID, TEXT, contact_type_enum, UUID, TEXT[], INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_production_contacts_by_type(UUID, contact_type_enum) TO authenticated;
