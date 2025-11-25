-- Migration: Training & Certification System
-- Description: Tables for training modules, enrollments, progress, and certifications

-- Training modules table
CREATE TABLE IF NOT EXISTS training_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('safety', 'technical', 'equipment', 'soft_skills', 'compliance', 'leadership', 'onboarding')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration_minutes INT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'document', 'interactive', 'quiz', 'mixed', 'live')),
  content_url TEXT,
  content_data JSONB,
  prerequisites UUID[],
  certification_required BOOLEAN DEFAULT false,
  certification_name TEXT,
  passing_score INT CHECK (passing_score >= 0 AND passing_score <= 100),
  max_attempts INT,
  validity_months INT,
  tags TEXT[],
  thumbnail_url TEXT,
  active BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_training_modules_org ON training_modules(organization_id);
CREATE INDEX IF NOT EXISTS idx_training_modules_category ON training_modules(category);
CREATE INDEX IF NOT EXISTS idx_training_modules_active ON training_modules(active);

-- Training enrollments table
CREATE TABLE IF NOT EXISTS training_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES training_modules(id),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  assigned_by UUID REFERENCES platform_users(id),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  mandatory BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in_progress', 'completed', 'failed', 'expired', 'cancelled')),
  attempts INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(module_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_training_enrollments_module ON training_enrollments(module_id);
CREATE INDEX IF NOT EXISTS idx_training_enrollments_user ON training_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_training_enrollments_status ON training_enrollments(status);

-- Training progress table
CREATE TABLE IF NOT EXISTS training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES training_enrollments(id) ON DELETE CASCADE,
  progress_percentage INT DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  time_spent_minutes INT DEFAULT 0,
  last_position TEXT,
  quiz_score INT CHECK (quiz_score >= 0 AND quiz_score <= 100),
  quiz_answers JSONB,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_training_progress_enrollment ON training_progress(enrollment_id);

-- Training quiz questions table
CREATE TABLE IF NOT EXISTS training_quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES training_modules(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'multi_select', 'short_answer')),
  options JSONB,
  correct_answer JSONB NOT NULL,
  explanation TEXT,
  points INT DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_training_quiz_questions_module ON training_quiz_questions(module_id);

-- Certifications table
CREATE TABLE IF NOT EXISTS certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  training_module_id UUID REFERENCES training_modules(id),
  certification_type TEXT NOT NULL CHECK (certification_type IN ('internal', 'external', 'industry', 'government')),
  name TEXT NOT NULL,
  issuing_authority TEXT,
  credential_id TEXT,
  issued_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ,
  renewal_required BOOLEAN DEFAULT false,
  renewal_reminder_days INT DEFAULT 30,
  document_url TEXT,
  verification_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked', 'pending_renewal')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certifications_user ON certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_certifications_module ON certifications(training_module_id);
CREATE INDEX IF NOT EXISTS idx_certifications_status ON certifications(status);
CREATE INDEX IF NOT EXISTS idx_certifications_expires ON certifications(expires_at);

-- Training paths table (learning paths)
CREATE TABLE IF NOT EXISTS training_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  target_role TEXT,
  estimated_duration_hours INT,
  is_mandatory BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Training path modules table
CREATE TABLE IF NOT EXISTS training_path_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id UUID NOT NULL REFERENCES training_paths(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES training_modules(id),
  sort_order INT DEFAULT 0,
  is_required BOOLEAN DEFAULT true,
  UNIQUE(path_id, module_id)
);

-- Training path enrollments table
CREATE TABLE IF NOT EXISTS training_path_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id UUID NOT NULL REFERENCES training_paths(id),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  UNIQUE(path_id, user_id)
);

-- Function to check certification expiration
CREATE OR REPLACE FUNCTION check_certification_expirations()
RETURNS TABLE (
  certification_id UUID,
  user_id UUID,
  name TEXT,
  expires_at TIMESTAMPTZ,
  days_until_expiration INT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.user_id,
    c.name,
    c.expires_at,
    EXTRACT(DAY FROM (c.expires_at - NOW()))::INT AS days_until_expiration
  FROM certifications c
  WHERE c.status = 'active'
    AND c.expires_at IS NOT NULL
    AND c.expires_at <= NOW() + (c.renewal_reminder_days || ' days')::INTERVAL
  ORDER BY c.expires_at ASC;
END;
$$;

-- Function to update expired certifications
CREATE OR REPLACE FUNCTION update_expired_certifications()
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  v_count INT;
BEGIN
  UPDATE certifications SET
    status = 'expired',
    updated_at = NOW()
  WHERE status = 'active'
    AND expires_at < NOW();
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- RLS policies
ALTER TABLE training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_path_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_path_enrollments ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON training_modules TO authenticated;
GRANT SELECT, INSERT, UPDATE ON training_enrollments TO authenticated;
GRANT SELECT, INSERT, UPDATE ON training_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON training_quiz_questions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON certifications TO authenticated;
GRANT SELECT, INSERT, UPDATE ON training_paths TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON training_path_modules TO authenticated;
GRANT SELECT, INSERT, UPDATE ON training_path_enrollments TO authenticated;
GRANT EXECUTE ON FUNCTION check_certification_expirations() TO authenticated;
GRANT EXECUTE ON FUNCTION update_expired_certifications() TO authenticated;
