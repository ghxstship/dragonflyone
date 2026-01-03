-- ============================================================================
-- 0051_gvteway_3nf_extensions.sql
-- GVTEWAY 3NF Extensions - Event-People Relationships, UGC, Photo Booth, Affiliates
-- GHXSTSHIP Platform - 3NF Compliant Schema
-- ============================================================================

-- ============================================================================
-- SECTION 1: EVENT-PEOPLE RELATIONSHIPS (Junction Table - 3NF)
-- Replaces: event_artists, event_crew, event_vendors
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.legend_event_people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES legend_events(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  
  -- Position in the event (references SSOT: legend_positions for job function)
  position_id UUID NOT NULL REFERENCES legend_positions(id) ON DELETE RESTRICT,
  -- Access role for the event (references SSOT: event_role_definitions for permissions)
  role_code TEXT REFERENCES event_role_definitions(code) ON DELETE SET NULL,
  -- Optional custom display title override
  display_title TEXT,
  
  -- Scheduling
  call_time TIMESTAMPTZ,
  set_time TIMESTAMPTZ,
  set_duration_minutes INTEGER,
  end_time TIMESTAMPTZ,
  
  -- Stage/Location
  stage_id UUID REFERENCES legend_places(id),
  
  -- Status
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  
  -- Billing/Display
  billing_order INTEGER DEFAULT 0,
  is_headliner BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  display_name TEXT,
  
  -- Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(event_id, person_id, position_id)
);

CREATE INDEX IF NOT EXISTS idx_legend_event_people_org ON legend_event_people(organization_id);
CREATE INDEX IF NOT EXISTS idx_legend_event_people_event ON legend_event_people(event_id);
CREATE INDEX IF NOT EXISTS idx_legend_event_people_person ON legend_event_people(person_id);
CREATE INDEX IF NOT EXISTS idx_legend_event_people_position ON legend_event_people(position_id);
CREATE INDEX IF NOT EXISTS idx_legend_event_people_role ON legend_event_people(role_code);
CREATE INDEX IF NOT EXISTS idx_legend_event_people_status ON legend_event_people(status);

-- NOTE: Functional positions (Artist, Sound Engineer, etc.) are managed in legend_positions (SSOT)
-- See 0003_legend_schema.sql for table definition and 0010_seed_data.sql for seed positions
-- Additional event-specific positions should be added to legend_positions, not here
-- The role_code column references event_role_definitions for ACCESS CONTROL only (CREW, VIP, etc.)

-- ============================================================================
-- SECTION 2: PERSON FOLLOWERS (3NF - Following relationships)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.person_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  follower_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  followed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notifications_enabled BOOLEAN DEFAULT true,
  UNIQUE(person_id, follower_id),
  CHECK (person_id != follower_id)
);

CREATE INDEX IF NOT EXISTS idx_person_followers_person ON person_followers(person_id);
CREATE INDEX IF NOT EXISTS idx_person_followers_follower ON person_followers(follower_id);

-- ============================================================================
-- SECTION 3: UGC HASHTAGS (3NF)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ugc_hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  usage_count INTEGER DEFAULT 0,
  is_trending BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_ugc_hashtags_org ON ugc_hashtags(organization_id);
CREATE INDEX IF NOT EXISTS idx_ugc_hashtags_slug ON ugc_hashtags(slug);
CREATE INDEX IF NOT EXISTS idx_ugc_hashtags_trending ON ugc_hashtags(is_trending) WHERE is_trending = true;
CREATE INDEX IF NOT EXISTS idx_ugc_hashtags_usage ON ugc_hashtags(usage_count DESC);

-- Junction table for content-hashtag relationships
CREATE TABLE IF NOT EXISTS public.ugc_content_hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES user_content(id) ON DELETE CASCADE,
  hashtag_id UUID NOT NULL REFERENCES ugc_hashtags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(content_id, hashtag_id)
);

CREATE INDEX IF NOT EXISTS idx_ugc_content_hashtags_content ON ugc_content_hashtags(content_id);
CREATE INDEX IF NOT EXISTS idx_ugc_content_hashtags_hashtag ON ugc_content_hashtags(hashtag_id);

-- ============================================================================
-- SECTION 4: PHOTO BOOTH (3NF)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.photo_booth_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL CHECK (template_type IN ('frame', 'overlay', 'filter', 'background', 'sticker')),
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  is_premium BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_photo_booth_templates_org ON photo_booth_templates(organization_id, is_active);
CREATE INDEX IF NOT EXISTS idx_photo_booth_templates_type ON photo_booth_templates(template_type);

CREATE TABLE IF NOT EXISTS public.photo_booth_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  venue_id UUID REFERENCES legend_places(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  location_name TEXT,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}'::jsonb,
  branding JSONB DEFAULT '{}'::jsonb,
  sharing_options JSONB DEFAULT '{"email": true, "sms": true, "social": true}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_photo_booth_configs_org ON photo_booth_configs(organization_id, is_active);
CREATE INDEX IF NOT EXISTS idx_photo_booth_configs_event ON photo_booth_configs(event_id);
CREATE INDEX IF NOT EXISTS idx_photo_booth_configs_venue ON photo_booth_configs(venue_id);

CREATE TABLE IF NOT EXISTS public.photo_booth_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  booth_id UUID NOT NULL REFERENCES photo_booth_configs(id) ON DELETE CASCADE,
  template_id UUID REFERENCES photo_booth_templates(id) ON DELETE SET NULL,
  creator_id UUID REFERENCES legend_people(id) ON DELETE SET NULL,
  
  -- Photo details
  original_url TEXT NOT NULL,
  processed_url TEXT,
  thumbnail_url TEXT,
  
  -- Sharing
  share_code TEXT UNIQUE,
  is_public BOOLEAN DEFAULT false,
  share_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  
  -- Moderation
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  moderated_by UUID REFERENCES platform_users(id),
  moderated_at TIMESTAMPTZ,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_photo_booth_photos_org ON photo_booth_photos(organization_id);
CREATE INDEX IF NOT EXISTS idx_photo_booth_photos_booth ON photo_booth_photos(booth_id);
CREATE INDEX IF NOT EXISTS idx_photo_booth_photos_creator ON photo_booth_photos(creator_id);
CREATE INDEX IF NOT EXISTS idx_photo_booth_photos_share ON photo_booth_photos(share_code) WHERE share_code IS NOT NULL;

-- ============================================================================
-- SECTION 5: INFLUENCER AFFILIATES (3NF)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.influencer_affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  
  -- Affiliate details
  affiliate_code TEXT NOT NULL,
  affiliate_type TEXT DEFAULT 'influencer' CHECK (affiliate_type IN ('influencer', 'ambassador', 'partner', 'affiliate')),
  tier TEXT DEFAULT 'standard' CHECK (tier IN ('standard', 'silver', 'gold', 'platinum')),
  
  -- Commission structure
  commission_rate NUMERIC(5,2) DEFAULT 10.00,
  commission_type TEXT DEFAULT 'percentage' CHECK (commission_type IN ('percentage', 'fixed')),
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused', 'terminated')),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES platform_users(id),
  
  -- Social/Reach
  social_links JSONB DEFAULT '{}'::jsonb,
  follower_count INTEGER,
  reach_estimate INTEGER,
  
  -- Performance
  total_clicks INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  total_revenue NUMERIC(12,2) DEFAULT 0,
  total_commission NUMERIC(12,2) DEFAULT 0,
  
  -- Payout
  payout_method TEXT,
  payout_details JSONB,
  last_payout_at TIMESTAMPTZ,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(organization_id, affiliate_code)
);

CREATE INDEX IF NOT EXISTS idx_influencer_affiliates_org ON influencer_affiliates(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_influencer_affiliates_person ON influencer_affiliates(person_id);
CREATE INDEX IF NOT EXISTS idx_influencer_affiliates_code ON influencer_affiliates(affiliate_code);

CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES influencer_affiliates(id) ON DELETE CASCADE,
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  source_url TEXT,
  landing_url TEXT,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_affiliate ON affiliate_clicks(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_event ON affiliate_clicks(event_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_date ON affiliate_clicks(created_at);

CREATE TABLE IF NOT EXISTS public.affiliate_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES influencer_affiliates(id) ON DELETE CASCADE,
  click_id UUID REFERENCES affiliate_clicks(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  
  -- Conversion details
  conversion_type TEXT NOT NULL CHECK (conversion_type IN ('sale', 'signup', 'lead')),
  order_amount NUMERIC(12,2),
  commission_amount NUMERIC(12,2),
  currency TEXT DEFAULT 'USD',
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_affiliate ON affiliate_conversions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_order ON affiliate_conversions(order_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_status ON affiliate_conversions(status);

-- ============================================================================
-- SECTION 6: RLS POLICIES
-- ============================================================================

ALTER TABLE legend_event_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE person_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ugc_hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE ugc_content_hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_booth_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_booth_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_booth_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_conversions ENABLE ROW LEVEL SECURITY;

-- Event-People policies
CREATE POLICY legend_event_people_select ON legend_event_people FOR SELECT USING (org_matches(organization_id));
CREATE POLICY legend_event_people_insert ON legend_event_people FOR INSERT WITH CHECK (org_matches(organization_id));
CREATE POLICY legend_event_people_update ON legend_event_people FOR UPDATE USING (org_matches(organization_id));
CREATE POLICY legend_event_people_delete ON legend_event_people FOR DELETE USING (org_matches(organization_id));

-- Person followers policies
CREATE POLICY person_followers_select ON person_followers FOR SELECT USING (true);
CREATE POLICY person_followers_insert ON person_followers FOR INSERT WITH CHECK (
  follower_id = current_platform_user_id() OR role_in('admin', 'super_admin')
);
CREATE POLICY person_followers_delete ON person_followers FOR DELETE USING (
  follower_id = current_platform_user_id() OR role_in('admin', 'super_admin')
);

-- UGC Hashtags policies
CREATE POLICY ugc_hashtags_select ON ugc_hashtags FOR SELECT USING (org_matches(organization_id));
CREATE POLICY ugc_hashtags_insert ON ugc_hashtags FOR INSERT WITH CHECK (org_matches(organization_id));
CREATE POLICY ugc_hashtags_update ON ugc_hashtags FOR UPDATE USING (org_matches(organization_id));
CREATE POLICY ugc_hashtags_delete ON ugc_hashtags FOR DELETE USING (org_matches(organization_id));

CREATE POLICY ugc_content_hashtags_select ON ugc_content_hashtags FOR SELECT USING (true);
CREATE POLICY ugc_content_hashtags_insert ON ugc_content_hashtags FOR INSERT WITH CHECK (true);
CREATE POLICY ugc_content_hashtags_delete ON ugc_content_hashtags FOR DELETE USING (true);

-- Photo booth policies
CREATE POLICY photo_booth_templates_select ON photo_booth_templates FOR SELECT USING (org_matches(organization_id));
CREATE POLICY photo_booth_templates_insert ON photo_booth_templates FOR INSERT WITH CHECK (org_matches(organization_id));
CREATE POLICY photo_booth_templates_update ON photo_booth_templates FOR UPDATE USING (org_matches(organization_id));
CREATE POLICY photo_booth_templates_delete ON photo_booth_templates FOR DELETE USING (org_matches(organization_id));

CREATE POLICY photo_booth_configs_select ON photo_booth_configs FOR SELECT USING (org_matches(organization_id));
CREATE POLICY photo_booth_configs_insert ON photo_booth_configs FOR INSERT WITH CHECK (org_matches(organization_id));
CREATE POLICY photo_booth_configs_update ON photo_booth_configs FOR UPDATE USING (org_matches(organization_id));
CREATE POLICY photo_booth_configs_delete ON photo_booth_configs FOR DELETE USING (org_matches(organization_id));

CREATE POLICY photo_booth_photos_select ON photo_booth_photos FOR SELECT USING (
  org_matches(organization_id) OR is_public = true OR creator_id = current_platform_user_id()
);
CREATE POLICY photo_booth_photos_insert ON photo_booth_photos FOR INSERT WITH CHECK (org_matches(organization_id));
CREATE POLICY photo_booth_photos_update ON photo_booth_photos FOR UPDATE USING (org_matches(organization_id));
CREATE POLICY photo_booth_photos_delete ON photo_booth_photos FOR DELETE USING (org_matches(organization_id));

-- Affiliate policies
CREATE POLICY influencer_affiliates_select ON influencer_affiliates FOR SELECT USING (
  org_matches(organization_id) OR person_id = current_platform_user_id()
);
CREATE POLICY influencer_affiliates_insert ON influencer_affiliates FOR INSERT WITH CHECK (org_matches(organization_id));
CREATE POLICY influencer_affiliates_update ON influencer_affiliates FOR UPDATE USING (org_matches(organization_id));
CREATE POLICY influencer_affiliates_delete ON influencer_affiliates FOR DELETE USING (org_matches(organization_id));

CREATE POLICY affiliate_clicks_select ON affiliate_clicks FOR SELECT USING (
  EXISTS (SELECT 1 FROM influencer_affiliates ia WHERE ia.id = affiliate_id AND (org_matches(ia.organization_id) OR ia.person_id = current_platform_user_id()))
);
CREATE POLICY affiliate_clicks_insert ON affiliate_clicks FOR INSERT WITH CHECK (true);

CREATE POLICY affiliate_conversions_select ON affiliate_conversions FOR SELECT USING (
  EXISTS (SELECT 1 FROM influencer_affiliates ia WHERE ia.id = affiliate_id AND (org_matches(ia.organization_id) OR ia.person_id = current_platform_user_id()))
);
CREATE POLICY affiliate_conversions_insert ON affiliate_conversions FOR INSERT WITH CHECK (true);
CREATE POLICY affiliate_conversions_update ON affiliate_conversions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM influencer_affiliates ia WHERE ia.id = affiliate_id AND org_matches(ia.organization_id))
);

-- ============================================================================
-- SECTION 7: GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON legend_event_people TO authenticated;
GRANT SELECT, INSERT, DELETE ON person_followers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ugc_hashtags TO authenticated;
GRANT SELECT, INSERT, DELETE ON ugc_content_hashtags TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON photo_booth_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON photo_booth_configs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON photo_booth_photos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON influencer_affiliates TO authenticated;
GRANT SELECT, INSERT ON affiliate_clicks TO authenticated;
GRANT SELECT, INSERT, UPDATE ON affiliate_conversions TO authenticated;

-- ============================================================================
-- SECTION 8: TRIGGERS
-- ============================================================================

CREATE TRIGGER legend_event_people_updated_at BEFORE UPDATE ON legend_event_people FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER ugc_hashtags_updated_at BEFORE UPDATE ON ugc_hashtags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER photo_booth_templates_updated_at BEFORE UPDATE ON photo_booth_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER photo_booth_configs_updated_at BEFORE UPDATE ON photo_booth_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER influencer_affiliates_updated_at BEFORE UPDATE ON influencer_affiliates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SECTION 9: HELPER FUNCTIONS
-- ============================================================================

-- Function to increment hashtag usage count
CREATE OR REPLACE FUNCTION increment_hashtag_usage(p_hashtag_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE ugc_hashtags SET usage_count = usage_count + 1 WHERE id = p_hashtag_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement hashtag usage count
CREATE OR REPLACE FUNCTION decrement_hashtag_usage(p_hashtag_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE ugc_hashtags SET usage_count = GREATEST(0, usage_count - 1) WHERE id = p_hashtag_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment affiliate clicks
CREATE OR REPLACE FUNCTION increment_affiliate_clicks(p_affiliate_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE influencer_affiliates SET total_clicks = total_clicks + 1 WHERE id = p_affiliate_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record affiliate conversion
CREATE OR REPLACE FUNCTION record_affiliate_conversion(
  p_affiliate_id UUID,
  p_order_amount NUMERIC,
  p_commission_amount NUMERIC
)
RETURNS void AS $$
BEGIN
  UPDATE influencer_affiliates 
  SET 
    total_conversions = total_conversions + 1,
    total_revenue = total_revenue + p_order_amount,
    total_commission = total_commission + p_commission_amount
  WHERE id = p_affiliate_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_hashtag_usage TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_hashtag_usage TO authenticated;
GRANT EXECUTE ON FUNCTION increment_affiliate_clicks TO authenticated;
GRANT EXECUTE ON FUNCTION record_affiliate_conversion TO authenticated;
