-- Migration: Opportunities & Job Board System
-- Description: Tables for job postings, gigs, RFPs, and applications

-- Opportunities table
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('rfp', 'job', 'gig', 'contract', 'freelance', 'internship')),
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  location_type TEXT CHECK (location_type IN ('onsite', 'remote', 'hybrid')),
  department TEXT,
  client_name TEXT,
  project_id UUID REFERENCES projects(id),
  event_id UUID REFERENCES events(id),
  compensation_type TEXT CHECK (compensation_type IN ('salary', 'hourly', 'daily', 'project', 'negotiable')),
  compensation_min NUMERIC(15,2),
  compensation_max NUMERIC(15,2),
  compensation_currency TEXT DEFAULT 'USD',
  start_date DATE,
  end_date DATE,
  deadline TIMESTAMPTZ,
  requirements TEXT[],
  skills_required TEXT[],
  experience_level TEXT CHECK (experience_level IN ('entry', 'mid', 'senior', 'lead', 'executive')),
  education_required TEXT,
  certifications_required TEXT[],
  benefits TEXT[],
  application_url TEXT,
  contact_email TEXT,
  is_urgent BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('draft', 'open', 'reviewing', 'filled', 'closed', 'cancelled')),
  views_count INT DEFAULT 0,
  applications_count INT DEFAULT 0,
  filled_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_opportunities_org ON opportunities(organization_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_type ON opportunities(type);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_location ON opportunities(location);
CREATE INDEX IF NOT EXISTS idx_opportunities_deadline ON opportunities(deadline);
CREATE INDEX IF NOT EXISTS idx_opportunities_skills ON opportunities USING gin(skills_required);
CREATE INDEX IF NOT EXISTS idx_opportunities_search ON opportunities USING gin(to_tsvector('english', title || ' ' || description));

-- Opportunity applications table
CREATE TABLE IF NOT EXISTS opportunity_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES platform_users(id),
  cover_letter TEXT,
  resume_url TEXT,
  portfolio_url TEXT,
  linkedin_url TEXT,
  expected_compensation NUMERIC(15,2),
  availability_date DATE,
  answers JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'shortlisted', 'interviewed', 'offered', 'hired', 'rejected', 'withdrawn')),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  reviewed_by UUID REFERENCES platform_users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(opportunity_id, applicant_id)
);

CREATE INDEX IF NOT EXISTS idx_opportunity_applications_opportunity ON opportunity_applications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_applications_applicant ON opportunity_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_applications_status ON opportunity_applications(status);

-- Opportunity questions table
CREATE TABLE IF NOT EXISTS opportunity_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('text', 'textarea', 'select', 'multiselect', 'boolean', 'file')),
  options TEXT[],
  is_required BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_opportunity_questions_opportunity ON opportunity_questions(opportunity_id);

-- Saved opportunities table
CREATE TABLE IF NOT EXISTS saved_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  UNIQUE(user_id, opportunity_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_opportunities_user ON saved_opportunities(user_id);

-- Opportunity alerts table
CREATE TABLE IF NOT EXISTS opportunity_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  name TEXT NOT NULL,
  criteria JSONB NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('instant', 'daily', 'weekly')),
  is_active BOOLEAN DEFAULT true,
  last_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_opportunity_alerts_user ON opportunity_alerts(user_id);

-- Function to update application count
CREATE OR REPLACE FUNCTION update_opportunity_application_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE opportunities SET
      applications_count = applications_count + 1,
      updated_at = NOW()
    WHERE id = NEW.opportunity_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE opportunities SET
      applications_count = GREATEST(applications_count - 1, 0),
      updated_at = NOW()
    WHERE id = OLD.opportunity_id;
    RETURN OLD;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS opportunity_application_count_trigger ON opportunity_applications;
CREATE TRIGGER opportunity_application_count_trigger
  AFTER INSERT OR DELETE ON opportunity_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_opportunity_application_count();

-- Function to increment opportunity views
CREATE OR REPLACE FUNCTION increment_opportunity_views(p_opportunity_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE opportunities SET
    views_count = views_count + 1
  WHERE id = p_opportunity_id;
END;
$$;

-- Function to find matching opportunities for alerts
CREATE OR REPLACE FUNCTION find_matching_opportunities(p_criteria JSONB, p_since TIMESTAMPTZ)
RETURNS TABLE (opportunity_id UUID)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT o.id
  FROM opportunities o
  WHERE o.is_active = TRUE
    AND o.status = 'open'
    AND o.created_at >= p_since
    AND (p_criteria->>'type' IS NULL OR o.type = p_criteria->>'type')
    AND (p_criteria->>'location' IS NULL OR o.location ILIKE '%' || (p_criteria->>'location') || '%')
    AND (p_criteria->>'experience_level' IS NULL OR o.experience_level = p_criteria->>'experience_level')
    AND (p_criteria->'skills' IS NULL OR o.skills_required && ARRAY(SELECT jsonb_array_elements_text(p_criteria->'skills')));
END;
$$;

-- RLS policies
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_alerts ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON opportunities TO authenticated;
GRANT SELECT, INSERT, UPDATE ON opportunity_applications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON opportunity_questions TO authenticated;
GRANT SELECT, INSERT, DELETE ON saved_opportunities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON opportunity_alerts TO authenticated;
GRANT EXECUTE ON FUNCTION increment_opportunity_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION find_matching_opportunities(JSONB, TIMESTAMPTZ) TO authenticated;
