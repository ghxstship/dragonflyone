-- Migration: Surveys and Accessibility
-- Adds post-event surveys and accessibility request tracking

-- Surveys Table
CREATE TABLE IF NOT EXISTS surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Survey Questions Table
CREATE TABLE IF NOT EXISTS survey_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('rating', 'text', 'multiple_choice', 'checkbox', 'scale')),
  question TEXT NOT NULL,
  required BOOLEAN DEFAULT FALSE,
  options JSONB,
  min_label VARCHAR(50),
  max_label VARCHAR(50),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Survey Responses Table
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(survey_id, user_id)
);

-- Survey Answers Table
CREATE TABLE IF NOT EXISTS survey_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID NOT NULL REFERENCES survey_responses(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES survey_questions(id) ON DELETE CASCADE,
  answer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Accessibility Requests Table
CREATE TABLE IF NOT EXISTS accessibility_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  services TEXT[] NOT NULL,
  notes TEXT,
  contact_phone VARCHAR(20),
  emergency_contact VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'completed')),
  assigned_to UUID REFERENCES profiles(id),
  response_notes TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Accessibility Preferences Table
CREATE TABLE IF NOT EXISTS user_accessibility_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  default_services TEXT[],
  contact_phone VARCHAR(20),
  emergency_contact VARCHAR(255),
  additional_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_surveys_event ON surveys(event_id);
CREATE INDEX IF NOT EXISTS idx_surveys_active ON surveys(is_active, expires_at);

CREATE INDEX IF NOT EXISTS idx_survey_questions_survey ON survey_questions(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey ON survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_user ON survey_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_survey_answers_response ON survey_answers(response_id);

CREATE INDEX IF NOT EXISTS idx_accessibility_requests_user ON accessibility_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_accessibility_requests_event ON accessibility_requests(event_id);
CREATE INDEX IF NOT EXISTS idx_accessibility_requests_status ON accessibility_requests(status);

-- RLS Policies
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE accessibility_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_accessibility_preferences ENABLE ROW LEVEL SECURITY;

-- Anyone can view active surveys
CREATE POLICY "Anyone can view active surveys" ON surveys
  FOR SELECT USING (is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW()));

CREATE POLICY "Anyone can view survey questions" ON survey_questions
  FOR SELECT USING (TRUE);

-- Users can submit responses
CREATE POLICY "Users can view their responses" ON survey_responses
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create responses" ON survey_responses
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their answers" ON survey_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM survey_responses
      WHERE survey_responses.id = survey_answers.response_id
      AND survey_responses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create answers" ON survey_answers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM survey_responses
      WHERE survey_responses.id = survey_answers.response_id
      AND survey_responses.user_id = auth.uid()
    )
  );

-- Accessibility policies
CREATE POLICY "Users can view their accessibility requests" ON accessibility_requests
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create accessibility requests" ON accessibility_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can manage their accessibility preferences" ON user_accessibility_preferences
  FOR ALL USING (user_id = auth.uid());

-- Admins can manage surveys and accessibility
CREATE POLICY "Admins can manage surveys" ON surveys
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage accessibility requests" ON accessibility_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin', 'support_agent')
    )
  );

-- Updated at triggers
CREATE TRIGGER surveys_updated_at
  BEFORE UPDATE ON surveys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER accessibility_requests_updated_at
  BEFORE UPDATE ON accessibility_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER accessibility_preferences_updated_at
  BEFORE UPDATE ON user_accessibility_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
