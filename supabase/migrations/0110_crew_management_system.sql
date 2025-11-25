-- Migration: Crew Management System
-- Description: Tables for crew members, skills, availability, and performance

-- Crew members table (enhanced)
CREATE TABLE IF NOT EXISTS crew_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID REFERENCES platform_users(id),
  employee_id TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  email TEXT NOT NULL,
  phone TEXT,
  mobile TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  country TEXT DEFAULT 'USA',
  date_of_birth DATE,
  hire_date DATE,
  termination_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave', 'terminated', 'pending')),
  employment_type TEXT DEFAULT 'contractor' CHECK (employment_type IN ('full_time', 'part_time', 'contractor', 'freelance', 'intern')),
  department TEXT,
  role TEXT NOT NULL,
  title TEXT,
  supervisor_id UUID REFERENCES crew_members(id),
  skills TEXT[],
  certifications TEXT[],
  languages TEXT[],
  hourly_rate NUMERIC(10,2),
  daily_rate NUMERIC(10,2),
  overtime_rate NUMERIC(10,2),
  travel_rate NUMERIC(10,2),
  per_diem NUMERIC(10,2),
  payment_method TEXT CHECK (payment_method IN ('direct_deposit', 'check', 'paypal', 'venmo', 'other')),
  tax_id TEXT,
  w9_on_file BOOLEAN DEFAULT false,
  i9_on_file BOOLEAN DEFAULT false,
  background_check_date DATE,
  background_check_status TEXT CHECK (background_check_status IN ('pending', 'passed', 'failed', 'expired')),
  drug_test_date DATE,
  drug_test_status TEXT CHECK (drug_test_status IN ('pending', 'passed', 'failed', 'expired')),
  shirt_size TEXT,
  notes TEXT,
  internal_notes TEXT,
  profile_photo_url TEXT,
  resume_url TEXT,
  portfolio_url TEXT,
  rating NUMERIC(3,2),
  total_hours_worked NUMERIC(10,2) DEFAULT 0,
  total_projects INT DEFAULT 0,
  last_worked_date DATE,
  preferred_venues UUID[],
  blacklisted_venues UUID[],
  travel_willing BOOLEAN DEFAULT true,
  travel_radius_miles INT,
  union_member BOOLEAN DEFAULT false,
  union_name TEXT,
  union_local TEXT,
  custom_fields JSONB,
  metadata JSONB,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, email)
);

CREATE INDEX IF NOT EXISTS idx_crew_members_org ON crew_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_crew_members_user ON crew_members(user_id);
CREATE INDEX IF NOT EXISTS idx_crew_members_email ON crew_members(email);
CREATE INDEX IF NOT EXISTS idx_crew_members_status ON crew_members(status);
CREATE INDEX IF NOT EXISTS idx_crew_members_role ON crew_members(role);
CREATE INDEX IF NOT EXISTS idx_crew_members_department ON crew_members(department);
CREATE INDEX IF NOT EXISTS idx_crew_members_skills ON crew_members USING gin(skills);
CREATE INDEX IF NOT EXISTS idx_crew_members_name ON crew_members(last_name, first_name);

-- Crew skills table
CREATE TABLE IF NOT EXISTS crew_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  proficiency_levels TEXT[] DEFAULT ARRAY['beginner', 'intermediate', 'advanced', 'expert'],
  is_certifiable BOOLEAN DEFAULT false,
  certification_required BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, name)
);

CREATE INDEX IF NOT EXISTS idx_crew_skills_org ON crew_skills(organization_id);
CREATE INDEX IF NOT EXISTS idx_crew_skills_category ON crew_skills(category);

-- Crew member skills junction table
CREATE TABLE IF NOT EXISTS crew_member_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID NOT NULL REFERENCES crew_members(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES crew_skills(id),
  proficiency_level TEXT DEFAULT 'intermediate',
  years_experience INT,
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES platform_users(id),
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(crew_member_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_crew_member_skills_crew ON crew_member_skills(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_crew_member_skills_skill ON crew_member_skills(skill_id);

-- Crew availability table
CREATE TABLE IF NOT EXISTS crew_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID NOT NULL REFERENCES crew_members(id) ON DELETE CASCADE,
  availability_type TEXT NOT NULL CHECK (availability_type IN ('available', 'unavailable', 'tentative', 'vacation', 'sick', 'personal', 'training', 'other_job')),
  start_date DATE NOT NULL,
  end_date DATE,
  start_time TIME,
  end_time TIME,
  recurrence_rule TEXT,
  all_day BOOLEAN DEFAULT true,
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crew_availability_crew ON crew_availability(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_crew_availability_dates ON crew_availability(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_crew_availability_type ON crew_availability(availability_type);

-- Crew performance reviews table
CREATE TABLE IF NOT EXISTS crew_performance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID NOT NULL REFERENCES crew_members(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id),
  event_id UUID REFERENCES events(id),
  reviewer_id UUID NOT NULL REFERENCES platform_users(id),
  review_date DATE NOT NULL DEFAULT CURRENT_DATE,
  overall_rating INT NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  punctuality_rating INT CHECK (punctuality_rating BETWEEN 1 AND 5),
  professionalism_rating INT CHECK (professionalism_rating BETWEEN 1 AND 5),
  skill_rating INT CHECK (skill_rating BETWEEN 1 AND 5),
  teamwork_rating INT CHECK (teamwork_rating BETWEEN 1 AND 5),
  communication_rating INT CHECK (communication_rating BETWEEN 1 AND 5),
  strengths TEXT,
  areas_for_improvement TEXT,
  comments TEXT,
  would_hire_again BOOLEAN,
  is_visible_to_crew BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crew_performance_reviews_crew ON crew_performance_reviews(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_crew_performance_reviews_project ON crew_performance_reviews(project_id);
CREATE INDEX IF NOT EXISTS idx_crew_performance_reviews_reviewer ON crew_performance_reviews(reviewer_id);

-- Crew notes/incidents table
CREATE TABLE IF NOT EXISTS crew_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID NOT NULL REFERENCES crew_members(id) ON DELETE CASCADE,
  note_type TEXT NOT NULL CHECK (note_type IN ('general', 'positive', 'warning', 'incident', 'performance', 'training', 'administrative')),
  title TEXT,
  content TEXT NOT NULL,
  project_id UUID REFERENCES projects(id),
  event_id UUID REFERENCES events(id),
  is_confidential BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crew_notes_crew ON crew_notes(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_crew_notes_type ON crew_notes(note_type);

-- Crew documents table
CREATE TABLE IF NOT EXISTS crew_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID NOT NULL REFERENCES crew_members(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('resume', 'w9', 'i9', 'id', 'certification', 'contract', 'nda', 'background_check', 'drug_test', 'insurance', 'other')),
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INT,
  expiration_date DATE,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES platform_users(id),
  verified_at TIMESTAMPTZ,
  notes TEXT,
  uploaded_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crew_documents_crew ON crew_documents(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_crew_documents_type ON crew_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_crew_documents_expiration ON crew_documents(expiration_date);

-- Function to update crew member rating
CREATE OR REPLACE FUNCTION update_crew_member_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_avg_rating NUMERIC;
BEGIN
  SELECT AVG(overall_rating) INTO v_avg_rating
  FROM crew_performance_reviews
  WHERE crew_member_id = NEW.crew_member_id;
  
  UPDATE crew_members SET
    rating = ROUND(v_avg_rating, 2),
    updated_at = NOW()
  WHERE id = NEW.crew_member_id;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS crew_rating_update_trigger ON crew_performance_reviews;
CREATE TRIGGER crew_rating_update_trigger
  AFTER INSERT OR UPDATE ON crew_performance_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_crew_member_rating();

-- Function to check crew availability
CREATE OR REPLACE FUNCTION check_crew_availability(
  p_crew_member_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if crew member is active
  IF NOT EXISTS (SELECT 1 FROM crew_members WHERE id = p_crew_member_id AND status = 'active') THEN
    RETURN FALSE;
  END IF;
  
  -- Check for unavailability blocks
  IF EXISTS (
    SELECT 1 FROM crew_availability
    WHERE crew_member_id = p_crew_member_id
      AND availability_type IN ('unavailable', 'vacation', 'sick', 'personal', 'other_job')
      AND (start_date, COALESCE(end_date, '9999-12-31'::DATE)) OVERLAPS (p_start_date, p_end_date)
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Check for existing assignments
  IF EXISTS (
    SELECT 1 FROM crew_assignments
    WHERE crew_id = p_crew_member_id
      AND status NOT IN ('cancelled', 'completed')
      AND (start_date::DATE, end_date::DATE) OVERLAPS (p_start_date, p_end_date)
  ) THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Function to get available crew for a date range
CREATE OR REPLACE FUNCTION get_available_crew(
  p_org_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_role TEXT DEFAULT NULL,
  p_skills TEXT[] DEFAULT NULL
)
RETURNS TABLE (
  crew_member_id UUID,
  full_name TEXT,
  role TEXT,
  rating NUMERIC,
  hourly_rate NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cm.id,
    cm.full_name,
    cm.role,
    cm.rating,
    cm.hourly_rate
  FROM crew_members cm
  WHERE cm.organization_id = p_org_id
    AND cm.status = 'active'
    AND (p_role IS NULL OR cm.role = p_role)
    AND (p_skills IS NULL OR cm.skills && p_skills)
    AND check_crew_availability(cm.id, p_start_date, p_end_date)
  ORDER BY cm.rating DESC NULLS LAST, cm.total_projects DESC;
END;
$$;

-- RLS policies
ALTER TABLE crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_member_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_documents ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON crew_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON crew_skills TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON crew_member_skills TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON crew_availability TO authenticated;
GRANT SELECT, INSERT ON crew_performance_reviews TO authenticated;
GRANT SELECT, INSERT ON crew_notes TO authenticated;
GRANT SELECT, INSERT, DELETE ON crew_documents TO authenticated;
GRANT EXECUTE ON FUNCTION check_crew_availability(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_crew(UUID, DATE, DATE, TEXT, TEXT[]) TO authenticated;
