-- ============================================================================
-- 0052_compvss_3nf_extensions.sql
-- COMPVSS 3NF Extensions - Safety, Crew Manifest, Credentials, Subcontractor Opportunities
-- GHXSTSHIP Platform - 3NF Compliant Schema
-- ============================================================================

-- ============================================================================
-- SECTION 1: SAFETY RECORDS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.safety_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  
  -- Record details
  record_type TEXT NOT NULL CHECK (record_type IN ('briefing', 'inspection', 'checklist', 'certification', 'training', 'incident', 'hazard')),
  title TEXT NOT NULL,
  description TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  
  -- Scheduling
  scheduled_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  
  -- Assignment
  assigned_to UUID REFERENCES platform_users(id),
  completed_by UUID REFERENCES platform_users(id),
  
  -- Checklist items (for checklists)
  checklist_items JSONB DEFAULT '[]'::jsonb,
  items_total INTEGER DEFAULT 0,
  items_completed INTEGER DEFAULT 0,
  
  -- Location
  location TEXT,
  area TEXT,
  
  -- Compliance
  regulatory_reference TEXT,
  compliance_standard TEXT,
  
  -- Documentation
  attachments JSONB DEFAULT '[]'::jsonb,
  photos JSONB DEFAULT '[]'::jsonb,
  signature_url TEXT,
  
  -- Notes
  notes TEXT,
  findings TEXT,
  corrective_actions TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_safety_records_org ON safety_records(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_safety_records_event ON safety_records(event_id);
CREATE INDEX IF NOT EXISTS idx_safety_records_type ON safety_records(record_type);
CREATE INDEX IF NOT EXISTS idx_safety_records_assigned ON safety_records(assigned_to);

-- ============================================================================
-- SECTION 2: CREW MANIFEST
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.crew_manifest (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  
  -- Person reference (3NF - references legend_people)
  person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  
  -- Role/Position
  role TEXT NOT NULL,
  department TEXT,
  position_title TEXT,
  
  -- Scheduling
  call_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  break_start TIMESTAMPTZ,
  break_end TIMESTAMPTZ,
  
  -- Status
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'checked_in', 'on_break', 'checked_out', 'no_show', 'cancelled')),
  checked_in_at TIMESTAMPTZ,
  checked_out_at TIMESTAMPTZ,
  
  -- Location
  work_area TEXT,
  reporting_to UUID REFERENCES legend_people(id),
  
  -- Rates
  rate_type TEXT DEFAULT 'hourly' CHECK (rate_type IN ('hourly', 'daily', 'flat', 'overtime')),
  rate_amount NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',
  
  -- Equipment
  equipment_assigned JSONB DEFAULT '[]'::jsonb,
  radio_channel TEXT,
  
  -- Notes
  notes TEXT,
  special_requirements TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(event_id, person_id, role)
);

CREATE INDEX IF NOT EXISTS idx_crew_manifest_org ON crew_manifest(organization_id);
CREATE INDEX IF NOT EXISTS idx_crew_manifest_event ON crew_manifest(event_id);
CREATE INDEX IF NOT EXISTS idx_crew_manifest_person ON crew_manifest(person_id);
CREATE INDEX IF NOT EXISTS idx_crew_manifest_status ON crew_manifest(status);

-- ============================================================================
-- SECTION 3: CREDENTIALS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.credential_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  access_level TEXT NOT NULL CHECK (access_level IN ('all_access', 'backstage', 'stage', 'vip', 'general', 'restricted')),
  color TEXT,
  icon TEXT,
  valid_areas JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, code)
);

CREATE TABLE IF NOT EXISTS public.credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  credential_type_id UUID NOT NULL REFERENCES credential_types(id),
  
  -- Holder (3NF - references legend_people)
  holder_id UUID REFERENCES legend_people(id) ON DELETE SET NULL,
  holder_name TEXT NOT NULL,
  holder_company TEXT,
  holder_role TEXT,
  holder_photo_url TEXT,
  
  -- Credential details
  credential_number TEXT NOT NULL,
  barcode TEXT,
  qr_code_url TEXT,
  
  -- Validity
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  valid_days JSONB DEFAULT '[]'::jsonb,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended', 'revoked', 'expired', 'lost')),
  issued_at TIMESTAMPTZ,
  issued_by UUID REFERENCES platform_users(id),
  
  -- Access tracking
  last_scan_at TIMESTAMPTZ,
  last_scan_location TEXT,
  scan_count INTEGER DEFAULT 0,
  
  -- Notes
  notes TEXT,
  restrictions TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(organization_id, credential_number)
);

CREATE INDEX IF NOT EXISTS idx_credentials_org ON credentials(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_credentials_event ON credentials(event_id);
CREATE INDEX IF NOT EXISTS idx_credentials_holder ON credentials(holder_id);
CREATE INDEX IF NOT EXISTS idx_credentials_type ON credentials(credential_type_id);
CREATE INDEX IF NOT EXISTS idx_credentials_barcode ON credentials(barcode) WHERE barcode IS NOT NULL;

-- ============================================================================
-- SECTION 4: SUBCONTRACTOR OPPORTUNITIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.subcontractor_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  
  -- Opportunity details
  title TEXT NOT NULL,
  description TEXT,
  opportunity_type TEXT NOT NULL CHECK (opportunity_type IN ('labor', 'equipment', 'services', 'transport', 'catering', 'security', 'other')),
  
  -- Requirements
  required_skills JSONB DEFAULT '[]'::jsonb,
  certifications_required JSONB DEFAULT '[]'::jsonb,
  experience_level TEXT CHECK (experience_level IN ('entry', 'intermediate', 'senior', 'expert')),
  
  -- Dates
  start_date DATE,
  end_date DATE,
  application_deadline DATE,
  
  -- Compensation
  budget_min NUMERIC(12,2),
  budget_max NUMERIC(12,2),
  rate_type TEXT CHECK (rate_type IN ('hourly', 'daily', 'fixed', 'negotiable')),
  currency TEXT DEFAULT 'USD',
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'reviewing', 'awarded', 'closed', 'cancelled')),
  positions_available INTEGER DEFAULT 1,
  positions_filled INTEGER DEFAULT 0,
  
  -- Location
  location TEXT,
  is_remote BOOLEAN DEFAULT false,
  
  -- Contact
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  
  -- Notes
  notes TEXT,
  terms_conditions TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES platform_users(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subcontractor_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES subcontractor_opportunities(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  company_id UUID REFERENCES legend_organizations(id),
  
  -- Application details
  cover_letter TEXT,
  proposed_rate NUMERIC(12,2),
  availability_notes TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'shortlisted', 'accepted', 'rejected', 'withdrawn')),
  
  -- Review
  reviewed_by UUID REFERENCES platform_users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  
  -- Documents
  resume_url TEXT,
  portfolio_url TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(opportunity_id, applicant_id)
);

CREATE INDEX IF NOT EXISTS idx_subcontractor_opportunities_org ON subcontractor_opportunities(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_subcontractor_opportunities_event ON subcontractor_opportunities(event_id);
CREATE INDEX IF NOT EXISTS idx_subcontractor_applications_opportunity ON subcontractor_applications(opportunity_id, status);
CREATE INDEX IF NOT EXISTS idx_subcontractor_applications_applicant ON subcontractor_applications(applicant_id);

-- ============================================================================
-- SECTION 5: RLS POLICIES
-- ============================================================================

ALTER TABLE safety_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_manifest ENABLE ROW LEVEL SECURITY;
ALTER TABLE credential_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcontractor_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcontractor_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY safety_records_org_access ON safety_records FOR ALL USING (org_matches(organization_id));
CREATE POLICY crew_manifest_org_access ON crew_manifest FOR ALL USING (org_matches(organization_id));
CREATE POLICY credential_types_org_access ON credential_types FOR ALL USING (org_matches(organization_id));
CREATE POLICY credentials_org_access ON credentials FOR ALL USING (org_matches(organization_id));
CREATE POLICY subcontractor_opportunities_org_access ON subcontractor_opportunities FOR ALL USING (org_matches(organization_id));
CREATE POLICY subcontractor_applications_access ON subcontractor_applications FOR ALL USING (
  EXISTS (SELECT 1 FROM subcontractor_opportunities so WHERE so.id = opportunity_id AND org_matches(so.organization_id))
  OR applicant_id = current_platform_user_id()
);

-- ============================================================================
-- SECTION 6: GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON safety_records TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON crew_manifest TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON credential_types TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON credentials TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON subcontractor_opportunities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON subcontractor_applications TO authenticated;

-- ============================================================================
-- SECTION 7: TRIGGERS
-- ============================================================================

CREATE TRIGGER safety_records_updated_at BEFORE UPDATE ON safety_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER crew_manifest_updated_at BEFORE UPDATE ON crew_manifest FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER credential_types_updated_at BEFORE UPDATE ON credential_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER credentials_updated_at BEFORE UPDATE ON credentials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER subcontractor_opportunities_updated_at BEFORE UPDATE ON subcontractor_opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER subcontractor_applications_updated_at BEFORE UPDATE ON subcontractor_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
