-- Migration: Talent Acquisition System
-- Description: Tables for job postings, candidates, interviews, and hiring workflows

-- Job postings table
CREATE TABLE IF NOT EXISTS job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  title TEXT NOT NULL,
  department TEXT,
  department_id UUID REFERENCES departments(id),
  location TEXT,
  employment_type TEXT NOT NULL CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'freelance', 'intern')),
  experience_level TEXT NOT NULL CHECK (experience_level IN ('entry', 'mid', 'senior', 'lead', 'executive')),
  description TEXT NOT NULL,
  responsibilities TEXT[],
  requirements TEXT[],
  preferred_qualifications TEXT[],
  salary_range_min NUMERIC(15,2),
  salary_range_max NUMERIC(15,2),
  salary_currency TEXT DEFAULT 'USD',
  benefits TEXT[],
  remote_policy TEXT CHECK (remote_policy IN ('onsite', 'hybrid', 'remote')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'closed', 'filled')),
  posted_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  filled_at TIMESTAMPTZ,
  application_deadline DATE,
  hiring_manager_id UUID REFERENCES platform_users(id),
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_postings_org ON job_postings(organization_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings(status);
CREATE INDEX IF NOT EXISTS idx_job_postings_department ON job_postings(department_id);

-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_posting_id UUID NOT NULL REFERENCES job_postings(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  resume_url TEXT,
  portfolio_url TEXT,
  linkedin_url TEXT,
  cover_letter TEXT,
  years_experience INT,
  current_company TEXT,
  current_title TEXT,
  expected_salary NUMERIC(15,2),
  available_start_date DATE,
  source TEXT CHECK (source IN ('direct', 'referral', 'agency', 'linkedin', 'indeed', 'glassdoor', 'other')),
  referrer_id UUID REFERENCES platform_users(id),
  stage TEXT NOT NULL DEFAULT 'applied' CHECK (stage IN ('applied', 'screening', 'phone_screen', 'interviewing', 'assessment', 'offer', 'hired', 'rejected', 'withdrawn')),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  hired_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_candidates_job ON candidates(job_posting_id);
CREATE INDEX IF NOT EXISTS idx_candidates_stage ON candidates(stage);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);

-- Interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  interview_date TIMESTAMPTZ NOT NULL,
  duration_minutes INT DEFAULT 60,
  interview_type TEXT NOT NULL CHECK (interview_type IN ('phone_screen', 'video', 'onsite', 'technical', 'panel', 'final')),
  interviewer_ids UUID[],
  location TEXT,
  meeting_link TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  feedback TEXT,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  recommendation TEXT CHECK (recommendation IN ('strong_hire', 'hire', 'no_hire', 'strong_no_hire', 'undecided')),
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interviews_candidate ON interviews(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interviews_date ON interviews(interview_date);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);

-- Interview feedback table
CREATE TABLE IF NOT EXISTS interview_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  interviewer_id UUID NOT NULL REFERENCES platform_users(id),
  overall_rating INT CHECK (overall_rating >= 1 AND overall_rating <= 5),
  technical_rating INT CHECK (technical_rating >= 1 AND technical_rating <= 5),
  communication_rating INT CHECK (communication_rating >= 1 AND communication_rating <= 5),
  culture_fit_rating INT CHECK (culture_fit_rating >= 1 AND culture_fit_rating <= 5),
  strengths TEXT,
  concerns TEXT,
  recommendation TEXT CHECK (recommendation IN ('strong_hire', 'hire', 'no_hire', 'strong_no_hire', 'undecided')),
  notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(interview_id, interviewer_id)
);

CREATE INDEX IF NOT EXISTS idx_interview_feedback_interview ON interview_feedback(interview_id);

-- Candidate activity log table
CREATE TABLE IF NOT EXISTS candidate_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('stage_change', 'note_added', 'email_sent', 'interview_scheduled', 'feedback_received', 'offer_sent', 'offer_accepted', 'offer_declined')),
  old_value TEXT,
  new_value TEXT,
  notes TEXT,
  performed_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_candidate_activity_candidate ON candidate_activity(candidate_id);

-- Job offers table
CREATE TABLE IF NOT EXISTS job_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id),
  job_posting_id UUID NOT NULL REFERENCES job_postings(id),
  offer_date DATE NOT NULL,
  expiration_date DATE,
  salary NUMERIC(15,2) NOT NULL,
  salary_currency TEXT DEFAULT 'USD',
  bonus NUMERIC(15,2),
  equity TEXT,
  start_date DATE,
  benefits_summary TEXT,
  offer_letter_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'sent', 'accepted', 'declined', 'expired', 'withdrawn')),
  sent_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  decline_reason TEXT,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_offers_candidate ON job_offers(candidate_id);
CREATE INDEX IF NOT EXISTS idx_job_offers_status ON job_offers(status);

-- Talent referrals table
CREATE TABLE IF NOT EXISTS talent_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES platform_users(id),
  candidate_id UUID REFERENCES candidates(id),
  job_posting_id UUID REFERENCES job_postings(id),
  referee_name TEXT NOT NULL,
  referee_email TEXT NOT NULL,
  referee_phone TEXT,
  relationship TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'hired', 'rejected', 'rewarded')),
  reward_amount NUMERIC(10,2),
  reward_paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_talent_referrals_referrer ON talent_referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_talent_referrals_status ON talent_referrals(status);

-- RLS policies
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_referrals ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON job_postings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON candidates TO authenticated;
GRANT SELECT, INSERT, UPDATE ON interviews TO authenticated;
GRANT SELECT, INSERT, UPDATE ON interview_feedback TO authenticated;
GRANT SELECT, INSERT ON candidate_activity TO authenticated;
GRANT SELECT, INSERT, UPDATE ON job_offers TO authenticated;
GRANT SELECT, INSERT, UPDATE ON talent_referrals TO authenticated;
