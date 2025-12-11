-- Migration: Create missing GVTEWAY tables (Part 1 - A/B Testing, Ads, Affiliates, Ambassadors)
-- These tables are referenced by API routes but don't exist in the schema

-- ============================================
-- A/B TESTING TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  traffic_percentage INTEGER DEFAULT 100 CHECK (traffic_percentage BETWEEN 1 AND 100),
  variants JSONB DEFAULT '[]'::jsonb,
  winning_variant_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS ab_test_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  variant_id UUID NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ab_test_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  page_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ab_test_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  conversion_type TEXT NOT NULL,
  conversion_value DECIMAL(12,2),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- AD CAMPAIGNS TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'google', 'tiktok', 'twitter', 'linkedin', 'youtube')),
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('awareness', 'traffic', 'conversions', 'engagement')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'active', 'paused', 'completed', 'cancelled')),
  budget DECIMAL(12,2) NOT NULL,
  daily_budget DECIMAL(12,2),
  spent DECIMAL(12,2) DEFAULT 0,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  targeting JSONB DEFAULT '{}'::jsonb,
  creative_assets JSONB DEFAULT '[]'::jsonb,
  external_campaign_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS ad_campaign_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  spend DECIMAL(12,2) DEFAULT 0,
  ctr DECIMAL(8,4),
  cpc DECIMAL(8,4),
  cpm DECIMAL(8,4),
  roas DECIMAL(8,4),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(campaign_id, date)
);

CREATE TABLE IF NOT EXISTS ad_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  ad_set_id TEXT,
  ad_id TEXT,
  metric_type TEXT NOT NULL,
  value DECIMAL(12,4) NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- AFFILIATE TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS affiliate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  url TEXT NOT NULL,
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue DECIMAL(12,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- AMBASSADOR TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS ambassador_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  commission_structure JSONB DEFAULT '{}'::jsonb,
  benefits JSONB DEFAULT '[]'::jsonb,
  requirements JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ambassadors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES ambassador_programs(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'terminated')),
  tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  referral_code TEXT UNIQUE NOT NULL,
  total_referrals INTEGER DEFAULT 0,
  total_earnings DECIMAL(12,2) DEFAULT 0,
  bio TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, program_id)
);

CREATE TABLE IF NOT EXISTS ambassador_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES ambassador_programs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  application_data JSONB DEFAULT '{}'::jsonb,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ambassador_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID NOT NULL REFERENCES ambassadors(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  short_code TEXT UNIQUE NOT NULL,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ambassador_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID NOT NULL REFERENCES ambassadors(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES auth.users(id),
  order_id UUID REFERENCES orders(id),
  commission_amount DECIMAL(12,2),
  commission_paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ANNOUNCEMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'urgent', 'update')),
  priority INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  publish_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  target_audience JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- AR EXPERIENCES
-- ============================================

CREATE TABLE IF NOT EXISTS ar_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('filter', 'game', 'scavenger_hunt', 'photo_booth', 'interactive')),
  ar_assets JSONB DEFAULT '{}'::jsonb,
  trigger_type TEXT CHECK (trigger_type IN ('location', 'marker', 'surface', 'face')),
  trigger_data JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  rewards JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ar_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID NOT NULL REFERENCES ar_experiences(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  interaction_type TEXT NOT NULL,
  duration_seconds INTEGER,
  completed BOOLEAN DEFAULT false,
  score INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_campaign_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassador_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassadors ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassador_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassador_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassador_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE ar_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE ar_interactions ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (read access for authenticated users)
CREATE POLICY "Authenticated users can read ab_tests" ON ab_tests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read ab_test_assignments" ON ab_test_assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read ab_test_impressions" ON ab_test_impressions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read ab_test_conversions" ON ab_test_conversions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read ad_campaigns" ON ad_campaigns FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read ad_campaign_metrics" ON ad_campaign_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read ad_performance" ON ad_performance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read affiliate_links" ON affiliate_links FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read ambassador_programs" ON ambassador_programs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read ambassadors" ON ambassadors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read ambassador_applications" ON ambassador_applications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read ambassador_links" ON ambassador_links FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read ambassador_referrals" ON ambassador_referrals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read announcements" ON announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read ar_experiences" ON ar_experiences FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read ar_interactions" ON ar_interactions FOR SELECT TO authenticated USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ab_tests_event_id ON ab_tests(event_id);
CREATE INDEX IF NOT EXISTS idx_ab_tests_status ON ab_tests(status);
CREATE INDEX IF NOT EXISTS idx_ab_test_assignments_test_id ON ab_test_assignments(test_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_assignments_user_id ON ab_test_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_event_id ON ad_campaigns(event_id);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_status ON ad_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_ad_campaign_metrics_campaign_id ON ad_campaign_metrics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ambassadors_user_id ON ambassadors(user_id);
CREATE INDEX IF NOT EXISTS idx_ambassadors_program_id ON ambassadors(program_id);
CREATE INDEX IF NOT EXISTS idx_announcements_event_id ON announcements(event_id);
CREATE INDEX IF NOT EXISTS idx_ar_experiences_event_id ON ar_experiences(event_id);
