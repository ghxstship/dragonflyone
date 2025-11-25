-- Migration: Marketplace Features
-- Description: COMPVSS opportunities marketplace, GVTEWAY experience discovery, vendor/crew ratings

-- Opportunities marketplace (COMPVSS)
CREATE TABLE IF NOT EXISTS marketplace_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  opportunity_type VARCHAR(50) NOT NULL CHECK (opportunity_type IN ('gig', 'job', 'rfp', 'contract', 'freelance', 'volunteer')),
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  
  -- Requirements
  required_skills JSONB DEFAULT '[]',
  required_certifications JSONB DEFAULT '[]',
  experience_level VARCHAR(50) CHECK (experience_level IN ('entry', 'intermediate', 'senior', 'expert')),
  
  -- Location
  location_type VARCHAR(50) CHECK (location_type IN ('onsite', 'remote', 'hybrid')),
  location_city VARCHAR(100),
  location_state VARCHAR(100),
  location_country VARCHAR(100),
  venue_name VARCHAR(255),
  
  -- Dates
  start_date DATE,
  end_date DATE,
  application_deadline DATE,
  
  -- Compensation
  compensation_type VARCHAR(50) CHECK (compensation_type IN ('hourly', 'daily', 'flat', 'negotiable', 'volunteer')),
  compensation_min DECIMAL(12,2),
  compensation_max DECIMAL(12,2),
  compensation_currency VARCHAR(3) DEFAULT 'USD',
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'filled', 'cancelled', 'expired')),
  published_at TIMESTAMPTZ,
  
  -- Stats
  view_count INTEGER DEFAULT 0,
  application_count INTEGER DEFAULT 0,
  
  -- Contact
  contact_name VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  
  is_featured BOOLEAN DEFAULT FALSE,
  is_urgent BOOLEAN DEFAULT FALSE,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id)
);

-- Opportunity applications
CREATE TABLE IF NOT EXISTS marketplace_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES marketplace_opportunities(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  
  cover_letter TEXT,
  resume_url TEXT,
  portfolio_urls JSONB DEFAULT '[]',
  
  -- Availability
  available_start_date DATE,
  hourly_rate DECIMAL(10,2),
  
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'interviewed', 'offered', 'accepted', 'rejected', 'withdrawn')),
  
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES platform_users(id),
  reviewer_notes TEXT,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(opportunity_id, applicant_id)
);

-- Experience discovery (GVTEWAY)
CREATE TABLE IF NOT EXISTS experience_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  short_description VARCHAR(500),
  
  -- Categorization
  experience_type VARCHAR(50) NOT NULL CHECK (experience_type IN ('concert', 'festival', 'theater', 'sports', 'conference', 'workshop', 'tour', 'dining', 'nightlife', 'other')),
  categories JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  
  -- Media
  cover_image_url TEXT,
  gallery_urls JSONB DEFAULT '[]',
  video_url TEXT,
  
  -- Location
  venue_name VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Dates
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule TEXT,
  
  -- Pricing
  price_min DECIMAL(10,2),
  price_max DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  is_free BOOLEAN DEFAULT FALSE,
  
  -- Capacity
  total_capacity INTEGER,
  available_capacity INTEGER,
  
  -- Ratings
  average_rating DECIMAL(3,2),
  review_count INTEGER DEFAULT 0,
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'sold_out', 'cancelled', 'completed')),
  published_at TIMESTAMPTZ,
  
  -- Discovery
  is_featured BOOLEAN DEFAULT FALSE,
  is_trending BOOLEAN DEFAULT FALSE,
  popularity_score DECIMAL(10,2) DEFAULT 0,
  
  -- SEO
  slug VARCHAR(255) UNIQUE,
  meta_title VARCHAR(255),
  meta_description VARCHAR(500),
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id)
);

-- Vendor/Crew ratings
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- What is being rated
  entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('vendor', 'crew_member', 'experience', 'event', 'venue', 'service')),
  entity_id UUID NOT NULL,
  
  -- Who is rating
  rater_id UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  rater_type VARCHAR(50) CHECK (rater_type IN ('client', 'crew', 'guest', 'vendor', 'admin')),
  
  -- Context
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  
  -- Rating
  overall_rating DECIMAL(3,2) NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  
  -- Category ratings
  category_ratings JSONB DEFAULT '{}',
  
  -- Review
  title VARCHAR(255),
  review_text TEXT,
  
  -- Pros/Cons
  pros JSONB DEFAULT '[]',
  cons JSONB DEFAULT '[]',
  
  -- Media
  photo_urls JSONB DEFAULT '[]',
  
  -- Verification
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES platform_users(id),
  
  -- Moderation
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')),
  moderated_at TIMESTAMPTZ,
  moderated_by UUID REFERENCES platform_users(id),
  moderation_notes TEXT,
  
  -- Response
  response_text TEXT,
  response_at TIMESTAMPTZ,
  response_by UUID REFERENCES platform_users(id),
  
  -- Helpfulness
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  
  is_anonymous BOOLEAN DEFAULT FALSE,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rating aggregates (cached)
CREATE TABLE IF NOT EXISTS rating_aggregates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  
  total_ratings INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2),
  
  -- Distribution
  rating_1_count INTEGER DEFAULT 0,
  rating_2_count INTEGER DEFAULT 0,
  rating_3_count INTEGER DEFAULT 0,
  rating_4_count INTEGER DEFAULT 0,
  rating_5_count INTEGER DEFAULT 0,
  
  -- Category averages
  category_averages JSONB DEFAULT '{}',
  
  -- Recent trend
  recent_average DECIMAL(3,2),
  trend_direction VARCHAR(10) CHECK (trend_direction IN ('up', 'down', 'stable')),
  
  last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(entity_type, entity_id)
);

-- Saved/favorited items
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  
  entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('opportunity', 'experience', 'vendor', 'crew_member', 'event')),
  entity_id UUID NOT NULL,
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, entity_type, entity_id)
);

-- Search history (for recommendations)
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES platform_users(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  
  search_type VARCHAR(50) NOT NULL CHECK (search_type IN ('opportunity', 'experience', 'vendor', 'crew', 'general')),
  query TEXT,
  filters JSONB DEFAULT '{}',
  
  result_count INTEGER,
  clicked_results JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_marketplace_opportunities_org ON marketplace_opportunities(organization_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_opportunities_type ON marketplace_opportunities(opportunity_type);
CREATE INDEX IF NOT EXISTS idx_marketplace_opportunities_status ON marketplace_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_opportunities_category ON marketplace_opportunities(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_applications_opportunity ON marketplace_applications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_applications_applicant ON marketplace_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_experience_listings_org ON experience_listings(organization_id);
CREATE INDEX IF NOT EXISTS idx_experience_listings_type ON experience_listings(experience_type);
CREATE INDEX IF NOT EXISTS idx_experience_listings_status ON experience_listings(status);
CREATE INDEX IF NOT EXISTS idx_experience_listings_dates ON experience_listings(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_experience_listings_location ON experience_listings(city, state, country);
CREATE INDEX IF NOT EXISTS idx_experience_listings_slug ON experience_listings(slug);
CREATE INDEX IF NOT EXISTS idx_ratings_entity ON ratings(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_ratings_rater ON ratings(rater_id);
CREATE INDEX IF NOT EXISTS idx_ratings_status ON ratings(status);
CREATE INDEX IF NOT EXISTS idx_rating_aggregates_entity ON rating_aggregates(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_entity ON user_favorites(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_search_history_user ON search_history(user_id);

-- RLS Policies
ALTER TABLE marketplace_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rating_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- Opportunities - public read for published
CREATE POLICY "marketplace_opportunities_select" ON marketplace_opportunities
  FOR SELECT USING (
    status = 'published'
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.organization_id = marketplace_opportunities.organization_id
    )
  );

CREATE POLICY "marketplace_opportunities_manage" ON marketplace_opportunities
  FOR ALL USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.organization_id = marketplace_opportunities.organization_id
      AND pu.platform_roles && ARRAY['COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

-- Applications - applicants can see their own, opportunity owners can see all
CREATE POLICY "marketplace_applications_select" ON marketplace_applications
  FOR SELECT USING (
    applicant_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM marketplace_opportunities mo
      WHERE mo.id = marketplace_applications.opportunity_id
      AND mo.created_by = auth.uid()
    )
  );

CREATE POLICY "marketplace_applications_insert" ON marketplace_applications
  FOR INSERT WITH CHECK (applicant_id = auth.uid());

-- Experience listings - public read for published
CREATE POLICY "experience_listings_select" ON experience_listings
  FOR SELECT USING (
    status = 'published'
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.organization_id = experience_listings.organization_id
    )
  );

CREATE POLICY "experience_listings_manage" ON experience_listings
  FOR ALL USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.organization_id = experience_listings.organization_id
      AND pu.platform_roles && ARRAY['GVTEWAY_ADMIN', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

-- Ratings - public read for approved
CREATE POLICY "ratings_select" ON ratings
  FOR SELECT USING (status = 'approved' OR rater_id = auth.uid());

CREATE POLICY "ratings_insert" ON ratings
  FOR INSERT WITH CHECK (rater_id = auth.uid());

CREATE POLICY "ratings_update" ON ratings
  FOR UPDATE USING (rater_id = auth.uid());

-- Rating aggregates - public read
CREATE POLICY "rating_aggregates_select" ON rating_aggregates
  FOR SELECT USING (true);

-- Favorites - users can manage their own
CREATE POLICY "user_favorites_select" ON user_favorites
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_favorites_manage" ON user_favorites
  FOR ALL USING (user_id = auth.uid());

-- Search history - users can see their own
CREATE POLICY "search_history_select" ON search_history
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "search_history_insert" ON search_history
  FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Function to update rating aggregates
CREATE OR REPLACE FUNCTION update_rating_aggregates()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO rating_aggregates (entity_type, entity_id, total_ratings, average_rating, 
    rating_1_count, rating_2_count, rating_3_count, rating_4_count, rating_5_count)
  SELECT 
    COALESCE(NEW.entity_type, OLD.entity_type),
    COALESCE(NEW.entity_id, OLD.entity_id),
    COUNT(*),
    AVG(overall_rating),
    COUNT(*) FILTER (WHERE overall_rating >= 1 AND overall_rating < 2),
    COUNT(*) FILTER (WHERE overall_rating >= 2 AND overall_rating < 3),
    COUNT(*) FILTER (WHERE overall_rating >= 3 AND overall_rating < 4),
    COUNT(*) FILTER (WHERE overall_rating >= 4 AND overall_rating < 5),
    COUNT(*) FILTER (WHERE overall_rating >= 5)
  FROM ratings
  WHERE entity_type = COALESCE(NEW.entity_type, OLD.entity_type)
  AND entity_id = COALESCE(NEW.entity_id, OLD.entity_id)
  AND status = 'approved'
  ON CONFLICT (entity_type, entity_id) 
  DO UPDATE SET
    total_ratings = EXCLUDED.total_ratings,
    average_rating = EXCLUDED.average_rating,
    rating_1_count = EXCLUDED.rating_1_count,
    rating_2_count = EXCLUDED.rating_2_count,
    rating_3_count = EXCLUDED.rating_3_count,
    rating_4_count = EXCLUDED.rating_4_count,
    rating_5_count = EXCLUDED.rating_5_count,
    last_calculated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rating_aggregate_update
  AFTER INSERT OR UPDATE OR DELETE ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_rating_aggregates();
