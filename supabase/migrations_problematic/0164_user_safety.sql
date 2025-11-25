-- Migration: User Safety (Blocking and Reporting)
-- Adds user blocking and reporting functionality

-- Blocked Users Table
CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, blocked_user_id)
);

-- User Reports Table
CREATE TABLE IF NOT EXISTS user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason VARCHAR(50) NOT NULL,
  details TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Privacy Settings Table
CREATE TABLE IF NOT EXISTS user_privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  profile_visibility VARCHAR(20) DEFAULT 'public' CHECK (profile_visibility IN ('public', 'fans', 'private')),
  show_activity BOOLEAN DEFAULT TRUE,
  allow_messages VARCHAR(20) DEFAULT 'everyone' CHECK (allow_messages IN ('everyone', 'verified', 'none')),
  show_events_attended BOOLEAN DEFAULT TRUE,
  show_reviews BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_blocked_users_user ON blocked_users(user_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked ON blocked_users(blocked_user_id);

CREATE INDEX IF NOT EXISTS idx_user_reports_reporter ON user_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reported ON user_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_status ON user_reports(status);

CREATE INDEX IF NOT EXISTS idx_user_privacy_settings_user ON user_privacy_settings(user_id);

-- RLS Policies
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_privacy_settings ENABLE ROW LEVEL SECURITY;

-- Blocked users policies
CREATE POLICY "Users can view their blocked list" ON blocked_users
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can block others" ON blocked_users
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can unblock others" ON blocked_users
  FOR DELETE USING (user_id = auth.uid());

-- Reports policies
CREATE POLICY "Users can view their reports" ON user_reports
  FOR SELECT USING (reporter_id = auth.uid());

CREATE POLICY "Users can create reports" ON user_reports
  FOR INSERT WITH CHECK (reporter_id = auth.uid());

-- Privacy settings policies
CREATE POLICY "Users can view their privacy settings" ON user_privacy_settings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their privacy settings" ON user_privacy_settings
  FOR ALL USING (user_id = auth.uid());

-- Admins can manage reports
CREATE POLICY "Admins can manage reports" ON user_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- Function to check if user is blocked
CREATE OR REPLACE FUNCTION is_user_blocked(p_user_id UUID, p_blocked_by UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM blocked_users
    WHERE user_id = p_blocked_by AND blocked_user_id = p_user_id
  );
$$ LANGUAGE SQL STABLE;

-- Updated at trigger
CREATE TRIGGER user_reports_updated_at
  BEFORE UPDATE ON user_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER user_privacy_settings_updated_at
  BEFORE UPDATE ON user_privacy_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
