-- Migration: Enrich Organizations Table
-- Description: Add fields from ExperienceGeneratorSchema for immersive experience production management

-- Add organization type enum
DO $$ BEGIN
  CREATE TYPE org_type_enum AS ENUM ('company', 'agency', 'venue', 'vendor', 'sponsor', 'investor');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add new columns to organizations table
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS legal_name TEXT,
  ADD COLUMN IF NOT EXISTS org_type org_type_enum DEFAULT 'company',
  ADD COLUMN IF NOT EXISTS tax_id TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS primary_color VARCHAR(7),
  ADD COLUMN IF NOT EXISTS secondary_color VARCHAR(7),
  ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_organizations_org_type ON organizations(org_type);
CREATE INDEX IF NOT EXISTS idx_organizations_deleted ON organizations(deleted_at) WHERE deleted_at IS NULL;

-- Add comments
COMMENT ON COLUMN organizations.legal_name IS 'Official legal name for contracts and compliance';
COMMENT ON COLUMN organizations.org_type IS 'Type of organization: company, agency, venue, vendor, sponsor, investor';
COMMENT ON COLUMN organizations.tax_id IS 'Tax identification number (EIN, etc.)';
COMMENT ON COLUMN organizations.primary_color IS 'Brand primary color in hex format';
COMMENT ON COLUMN organizations.secondary_color IS 'Brand secondary color in hex format';
COMMENT ON COLUMN organizations.settings IS 'Organization-specific settings and preferences';
COMMENT ON COLUMN organizations.metadata IS 'Additional metadata for extensibility';
COMMENT ON COLUMN organizations.deleted_at IS 'Soft delete timestamp';

-- Function to get organization with branding
CREATE OR REPLACE FUNCTION get_organization_branding(p_org_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  legal_name TEXT,
  org_type org_type_enum,
  logo_url TEXT,
  primary_color VARCHAR(7),
  secondary_color VARCHAR(7),
  settings JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.name,
    o.slug,
    o.legal_name,
    o.org_type,
    o.logo_url,
    o.primary_color,
    o.secondary_color,
    o.settings
  FROM organizations o
  WHERE o.id = p_org_id
    AND o.deleted_at IS NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION get_organization_branding(UUID) TO authenticated;
