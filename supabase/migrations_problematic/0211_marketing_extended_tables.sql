-- Migration: Extended Marketing Tables
-- Description: Tables for A/B testing and fan club access windows

-- A/B tests table
CREATE TABLE IF NOT EXISTS ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  test_type VARCHAR(30) CHECK (test_type IN ('landing_page', 'pricing', 'checkout', 'email', 'cta')),
  event_id UUID REFERENCES events(id),
  variants JSONB NOT NULL,
  goal VARCHAR(30) CHECK (goal IN ('conversion', 'revenue', 'engagement', 'clicks')),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- A/B test assignments table
CREATE TABLE IF NOT EXISTS ab_test_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES ab_tests(id),
  user_id UUID REFERENCES platform_users(id),
  session_id VARCHAR(100),
  variant_id VARCHAR(50) NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW()
);

-- A/B test impressions table
CREATE TABLE IF NOT EXISTS ab_test_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES ab_tests(id),
  variant_id VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES platform_users(id),
  session_id VARCHAR(100),
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- A/B test conversions table
CREATE TABLE IF NOT EXISTS ab_test_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES ab_tests(id),
  variant_id VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES platform_users(id),
  revenue DECIMAL(10, 2),
  converted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fan club access windows table
CREATE TABLE IF NOT EXISTS fan_club_access_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  fan_club_id UUID NOT NULL REFERENCES fan_clubs(id),
  name VARCHAR(200) NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  ticket_allocation INTEGER,
  tickets_sold INTEGER DEFAULT 0,
  discount_percent DECIMAL(5, 2),
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'ended')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fan club access usage table
CREATE TABLE IF NOT EXISTS fan_club_access_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  window_id UUID NOT NULL REFERENCES fan_club_access_windows(id),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  ticket_count INTEGER DEFAULT 1,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ab_tests_event ON ab_tests(event_id);
CREATE INDEX IF NOT EXISTS idx_ab_tests_status ON ab_tests(status);
CREATE INDEX IF NOT EXISTS idx_ab_test_assignments_test ON ab_test_assignments(test_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_assignments_user ON ab_test_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_impressions_test ON ab_test_impressions(test_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_conversions_test ON ab_test_conversions(test_id);
CREATE INDEX IF NOT EXISTS idx_fan_club_access_windows_event ON fan_club_access_windows(event_id);
CREATE INDEX IF NOT EXISTS idx_fan_club_access_windows_club ON fan_club_access_windows(fan_club_id);
CREATE INDEX IF NOT EXISTS idx_fan_club_access_usage_window ON fan_club_access_usage(window_id);

-- RLS Policies
ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_club_access_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_club_access_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY ab_tests_view ON ab_tests FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY ab_test_assignments_view ON ab_test_assignments FOR SELECT USING (user_id = auth.uid() OR auth.uid() IS NOT NULL);
CREATE POLICY fan_club_access_windows_view ON fan_club_access_windows FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY fan_club_access_usage_view ON fan_club_access_usage FOR SELECT USING (user_id = auth.uid() OR auth.uid() IS NOT NULL);
