-- V3 Banquet Event Orders (BEOs) Migration
-- DG-003: BEO Generation for COMPVSS production teams

-- BEO status enum
DO $$ BEGIN
  CREATE TYPE beo_status AS ENUM (
    'draft',
    'pending_review',
    'approved',
    'distributed',
    'executed',
    'archived'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- BEO templates
CREATE TABLE IF NOT EXISTS beo_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  event_type TEXT,
  default_sections JSONB DEFAULT '{
    "event_info": true,
    "timeline": true,
    "room_setup": true,
    "food_beverage": true,
    "av_tech": true,
    "dietary": true,
    "staff": true,
    "vendor_contacts": true
  }'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BEOs (Banquet Event Orders)
CREATE TABLE IF NOT EXISTS beos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  template_id UUID REFERENCES beo_templates(id) ON DELETE SET NULL,
  beo_number TEXT NOT NULL,
  name TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  status beo_status DEFAULT 'draft',
  event_date DATE NOT NULL,
  event_start_time TIME,
  event_end_time TIME,
  venue_name TEXT,
  room_name TEXT,
  guest_count INTEGER,
  sections JSONB DEFAULT '{
    "event_info": {},
    "timeline": [],
    "room_setup": {},
    "food_beverage": {},
    "av_tech": {},
    "dietary": [],
    "staff": [],
    "vendor_contacts": []
  }'::jsonb,
  notes TEXT,
  internal_notes TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  distributed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BEO versions for history
CREATE TABLE IF NOT EXISTS beo_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beo_id UUID NOT NULL REFERENCES beos(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content JSONB NOT NULL,
  changes JSONB DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BEO distributions
CREATE TABLE IF NOT EXISTS beo_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beo_id UUID NOT NULL REFERENCES beos(id) ON DELETE CASCADE,
  recipient_type TEXT NOT NULL,
  recipient_id UUID,
  recipient_email TEXT,
  recipient_name TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  viewed_at TIMESTAMPTZ,
  downloaded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-generate BEO number
CREATE OR REPLACE FUNCTION generate_beo_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.beo_number IS NULL OR NEW.beo_number = '' THEN
    NEW.beo_number := 'BEO-' || TO_CHAR(NEW.event_date, 'YYYYMMDD') || '-' || 
      LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_beo_number ON beos;
CREATE TRIGGER trigger_generate_beo_number
  BEFORE INSERT ON beos
  FOR EACH ROW
  EXECUTE FUNCTION generate_beo_number();

-- Create version on BEO update
CREATE OR REPLACE FUNCTION create_beo_version()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.sections IS DISTINCT FROM NEW.sections THEN
    INSERT INTO beo_versions (beo_id, version_number, content, changes, created_by)
    VALUES (
      NEW.id,
      NEW.version,
      OLD.sections,
      jsonb_build_object(
        'from_version', OLD.version,
        'to_version', NEW.version,
        'updated_at', NOW()
      ),
      NEW.created_by
    );
    NEW.version := OLD.version + 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_beo_version ON beos;
CREATE TRIGGER trigger_create_beo_version
  BEFORE UPDATE ON beos
  FOR EACH ROW
  EXECUTE FUNCTION create_beo_version();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_beos_org ON beos(organization_id);
CREATE INDEX IF NOT EXISTS idx_beos_booking ON beos(booking_id);
CREATE INDEX IF NOT EXISTS idx_beos_event ON beos(event_id);
CREATE INDEX IF NOT EXISTS idx_beos_status ON beos(status);
CREATE INDEX IF NOT EXISTS idx_beos_event_date ON beos(event_date);
CREATE INDEX IF NOT EXISTS idx_beo_versions_beo ON beo_versions(beo_id);
CREATE INDEX IF NOT EXISTS idx_beo_distributions_beo ON beo_distributions(beo_id);
CREATE INDEX IF NOT EXISTS idx_beo_templates_org ON beo_templates(organization_id);

-- RLS Policies
ALTER TABLE beos ENABLE ROW LEVEL SECURITY;
ALTER TABLE beo_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE beo_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE beo_templates ENABLE ROW LEVEL SECURITY;

-- BEOs policies
DROP POLICY IF EXISTS beos_org_access ON beos;
CREATE POLICY beos_org_access ON beos
  FOR ALL USING (org_matches(organization_id));

-- BEO versions policies
DROP POLICY IF EXISTS beo_versions_beo_access ON beo_versions;
CREATE POLICY beo_versions_beo_access ON beo_versions
  FOR SELECT USING (
    beo_id IN (
      SELECT id FROM beos WHERE org_matches(organization_id)
    )
  );

-- BEO distributions policies
DROP POLICY IF EXISTS beo_distributions_access ON beo_distributions;
CREATE POLICY beo_distributions_access ON beo_distributions
  FOR ALL USING (
    beo_id IN (
      SELECT id FROM beos WHERE org_matches(organization_id)
    )
  );

-- BEO templates policies
DROP POLICY IF EXISTS beo_templates_org_access ON beo_templates;
CREATE POLICY beo_templates_org_access ON beo_templates
  FOR ALL USING (org_matches(organization_id));

-- Grants
GRANT ALL ON beos TO authenticated;
GRANT ALL ON beo_versions TO authenticated;
GRANT ALL ON beo_distributions TO authenticated;
GRANT ALL ON beo_templates TO authenticated;

COMMENT ON TABLE beos IS 'DG-003: Banquet Event Orders for production teams';
COMMENT ON TABLE beo_versions IS 'Version history for BEO changes';
COMMENT ON TABLE beo_distributions IS 'Track BEO distribution to departments';
COMMENT ON TABLE beo_templates IS 'Reusable BEO templates by event type';
