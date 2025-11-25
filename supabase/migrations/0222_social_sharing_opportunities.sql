-- Migration: Social Sharing for Opportunities
-- Description: Enable social sharing of job opportunities with tracking

-- Opportunity shares tracking
CREATE TABLE IF NOT EXISTS opportunity_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('linkedin', 'twitter', 'facebook', 'email', 'copy_link', 'whatsapp', 'telegram', 'sms', 'other')),
  share_url TEXT,
  tracking_code VARCHAR(50) UNIQUE,
  click_count INTEGER DEFAULT 0,
  application_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Share click tracking
CREATE TABLE IF NOT EXISTS opportunity_share_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID NOT NULL REFERENCES opportunity_shares(id) ON DELETE CASCADE,
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  country VARCHAR(2),
  city VARCHAR(100),
  device_type VARCHAR(50),
  converted_to_application BOOLEAN DEFAULT FALSE,
  application_id UUID
);

-- Social share templates
CREATE TABLE IF NOT EXISTS share_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  template_type VARCHAR(50) DEFAULT 'opportunity' CHECK (template_type IN ('opportunity', 'event', 'content', 'referral')),
  title_template TEXT,
  description_template TEXT,
  hashtags JSONB DEFAULT '[]',
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social media accounts for sharing
CREATE TABLE IF NOT EXISTS social_share_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('linkedin', 'twitter', 'facebook')),
  account_id VARCHAR(255),
  account_name VARCHAR(255),
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_opportunity_shares_opportunity ON opportunity_shares(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_shares_user ON opportunity_shares(shared_by);
CREATE INDEX IF NOT EXISTS idx_opportunity_shares_platform ON opportunity_shares(platform);
CREATE INDEX IF NOT EXISTS idx_opportunity_shares_tracking ON opportunity_shares(tracking_code);
CREATE INDEX IF NOT EXISTS idx_share_clicks_share ON opportunity_share_clicks(share_id);
CREATE INDEX IF NOT EXISTS idx_share_clicks_time ON opportunity_share_clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_share_templates_platform ON share_templates(platform);
CREATE INDEX IF NOT EXISTS idx_social_accounts_user ON social_share_accounts(user_id);

-- RLS Policies
ALTER TABLE opportunity_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_share_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_share_accounts ENABLE ROW LEVEL SECURITY;

-- Opportunity shares policies
CREATE POLICY "opportunity_shares_select" ON opportunity_shares
  FOR SELECT USING (
    shared_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

CREATE POLICY "opportunity_shares_insert" ON opportunity_shares
  FOR INSERT WITH CHECK (true);

-- Share clicks - public insert for tracking
CREATE POLICY "share_clicks_insert" ON opportunity_share_clicks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "share_clicks_select" ON opportunity_share_clicks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM opportunity_shares os
      WHERE os.id = share_id AND os.shared_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

-- Share templates policies
CREATE POLICY "share_templates_select" ON share_templates FOR SELECT USING (true);
CREATE POLICY "share_templates_manage" ON share_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

-- Social accounts policies
CREATE POLICY "social_accounts_select" ON social_share_accounts
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "social_accounts_insert" ON social_share_accounts
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "social_accounts_update" ON social_share_accounts
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "social_accounts_delete" ON social_share_accounts
  FOR DELETE USING (user_id = auth.uid());

-- Function to generate tracking code
CREATE OR REPLACE FUNCTION generate_share_tracking_code()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ghx_' || encode(gen_random_bytes(8), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate tracking code
CREATE OR REPLACE FUNCTION set_share_tracking_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tracking_code IS NULL THEN
    NEW.tracking_code := generate_share_tracking_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER opportunity_shares_tracking_code
  BEFORE INSERT ON opportunity_shares
  FOR EACH ROW
  EXECUTE FUNCTION set_share_tracking_code();

-- Function to increment click count
CREATE OR REPLACE FUNCTION increment_share_click_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE opportunity_shares 
  SET click_count = click_count + 1 
  WHERE id = NEW.share_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER share_click_count_trigger
  AFTER INSERT ON opportunity_share_clicks
  FOR EACH ROW
  EXECUTE FUNCTION increment_share_click_count();

-- Seed share templates
INSERT INTO share_templates (name, platform, template_type, title_template, description_template, hashtags) VALUES
  ('LinkedIn Job Post', 'linkedin', 'opportunity', '🚀 We''re hiring: {{title}}', 'Join our team! {{company}} is looking for a {{title}}. {{description}}', '["hiring", "jobs", "career"]'),
  ('Twitter Job Post', 'twitter', 'opportunity', '🚀 We''re hiring: {{title}} at {{company}}! Apply now 👉 {{url}} #hiring #jobs', NULL, '["hiring", "jobs"]'),
  ('Facebook Job Post', 'facebook', 'opportunity', '{{company}} is hiring!', 'We''re looking for a {{title}}. {{description}} Apply now!', '[]'),
  ('Email Share', 'email', 'opportunity', 'Job Opportunity: {{title}} at {{company}}', 'I thought you might be interested in this opportunity...', '[]'),
  ('WhatsApp Share', 'whatsapp', 'opportunity', 'Check out this job: {{title}} at {{company}} - {{url}}', NULL, '[]')
ON CONFLICT DO NOTHING;

-- View for share analytics
CREATE OR REPLACE VIEW opportunity_share_analytics AS
SELECT 
  os.opportunity_id,
  o.title as opportunity_title,
  os.platform,
  COUNT(DISTINCT os.id) as share_count,
  SUM(os.click_count) as total_clicks,
  SUM(os.application_count) as total_applications,
  CASE WHEN SUM(os.click_count) > 0 
    THEN ROUND((SUM(os.application_count)::numeric / SUM(os.click_count)::numeric) * 100, 2)
    ELSE 0 
  END as conversion_rate
FROM opportunity_shares os
JOIN opportunities o ON o.id = os.opportunity_id
GROUP BY os.opportunity_id, o.title, os.platform
ORDER BY total_clicks DESC;
