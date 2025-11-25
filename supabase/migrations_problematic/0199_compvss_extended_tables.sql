-- Migration: Extended COMPVSS Tables
-- Description: Tables for rehire notes, credential badges, and crew management

-- Rehire notes table
CREATE TABLE IF NOT EXISTS rehire_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID NOT NULL REFERENCES platform_users(id),
  recommendation VARCHAR(30) NOT NULL CHECK (recommendation IN ('highly_recommended', 'recommended', 'conditional', 'not_recommended')),
  notes TEXT,
  strengths TEXT[],
  areas_for_improvement TEXT[],
  project_id UUID REFERENCES projects(id),
  event_id UUID REFERENCES events(id),
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credential badges table
CREATE TABLE IF NOT EXISTS credential_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID NOT NULL REFERENCES platform_users(id),
  event_id UUID NOT NULL REFERENCES events(id),
  badge_number VARCHAR(50) UNIQUE,
  badge_type VARCHAR(30) NOT NULL CHECK (badge_type IN ('crew', 'artist', 'vip', 'media', 'vendor', 'security', 'production')),
  access_level VARCHAR(30) NOT NULL CHECK (access_level IN ('all_access', 'backstage', 'stage', 'foh', 'limited')),
  valid_from TIMESTAMPTZ NOT NULL,
  valid_to TIMESTAMPTZ NOT NULL,
  photo_url TEXT,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
  checked_in_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Photo documentation table
CREATE TABLE IF NOT EXISTS photo_documentation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  event_id UUID REFERENCES events(id),
  phase VARCHAR(50) NOT NULL,
  category VARCHAR(50),
  photo_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  location TEXT,
  taken_at TIMESTAMPTZ NOT NULL,
  taken_by UUID REFERENCES platform_users(id),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Technical rehearsal notes table
CREATE TABLE IF NOT EXISTS technical_rehearsals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  type VARCHAR(30) CHECK (type IN ('tech_rehearsal', 'soundcheck', 'focus', 'dress_rehearsal', 'run_through')),
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  issues JSONB,
  attendees UUID[],
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site restoration checklist table
CREATE TABLE IF NOT EXISTS site_restoration_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  item_name VARCHAR(200) NOT NULL,
  category VARCHAR(50),
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'not_applicable')),
  assigned_to UUID REFERENCES platform_users(id),
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES platform_users(id),
  photo_before TEXT,
  photo_after TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crew settlement table
CREATE TABLE IF NOT EXISTS crew_settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID NOT NULL REFERENCES platform_users(id),
  event_id UUID NOT NULL REFERENCES events(id),
  total_hours DECIMAL(10, 2) NOT NULL,
  regular_hours DECIMAL(10, 2),
  overtime_hours DECIMAL(10, 2),
  double_time_hours DECIMAL(10, 2),
  hourly_rate DECIMAL(10, 2) NOT NULL,
  overtime_rate DECIMAL(10, 2),
  gross_pay DECIMAL(12, 2) NOT NULL,
  per_diem DECIMAL(10, 2) DEFAULT 0,
  expenses DECIMAL(10, 2) DEFAULT 0,
  deductions DECIMAL(10, 2) DEFAULT 0,
  net_pay DECIMAL(12, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
  approved_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add waived and waiver_reason to timesheet_breaks if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'timesheet_breaks' AND column_name = 'waived') THEN
    ALTER TABLE timesheet_breaks ADD COLUMN waived BOOLEAN DEFAULT FALSE;
    ALTER TABLE timesheet_breaks ADD COLUMN waiver_reason TEXT;
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rehire_notes_crew ON rehire_notes(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_rehire_notes_recommendation ON rehire_notes(recommendation);
CREATE INDEX IF NOT EXISTS idx_credential_badges_event ON credential_badges(event_id);
CREATE INDEX IF NOT EXISTS idx_credential_badges_crew ON credential_badges(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_credential_badges_type ON credential_badges(badge_type);
CREATE INDEX IF NOT EXISTS idx_photo_documentation_project ON photo_documentation(project_id);
CREATE INDEX IF NOT EXISTS idx_photo_documentation_event ON photo_documentation(event_id);
CREATE INDEX IF NOT EXISTS idx_photo_documentation_phase ON photo_documentation(phase);
CREATE INDEX IF NOT EXISTS idx_technical_rehearsals_event ON technical_rehearsals(event_id);
CREATE INDEX IF NOT EXISTS idx_site_restoration_event ON site_restoration_items(event_id);
CREATE INDEX IF NOT EXISTS idx_crew_settlements_crew ON crew_settlements(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_crew_settlements_event ON crew_settlements(event_id);

-- RLS Policies
ALTER TABLE rehire_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE credential_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_documentation ENABLE ROW LEVEL SECURITY;
ALTER TABLE technical_rehearsals ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_restoration_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_settlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY rehire_notes_view ON rehire_notes FOR SELECT USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND ('COMPVSS_TEAM_MEMBER' = ANY(platform_roles) OR 'COMPVSS_ADMIN' = ANY(platform_roles)))
);

CREATE POLICY credential_badges_view ON credential_badges FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY photo_documentation_view ON photo_documentation FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY technical_rehearsals_view ON technical_rehearsals FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY site_restoration_view ON site_restoration_items FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY crew_settlements_view ON crew_settlements FOR SELECT USING (
  crew_member_id = auth.uid() OR
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND ('COMPVSS_TEAM_MEMBER' = ANY(platform_roles) OR 'COMPVSS_ADMIN' = ANY(platform_roles)))
);

CREATE POLICY rehire_notes_manage ON rehire_notes FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND ('COMPVSS_TEAM_MEMBER' = ANY(platform_roles) OR 'COMPVSS_ADMIN' = ANY(platform_roles)))
);

CREATE POLICY credential_badges_manage ON credential_badges FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND ('COMPVSS_TEAM_MEMBER' = ANY(platform_roles) OR 'COMPVSS_ADMIN' = ANY(platform_roles)))
);

CREATE POLICY crew_settlements_manage ON crew_settlements FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND 'COMPVSS_ADMIN' = ANY(platform_roles))
);
