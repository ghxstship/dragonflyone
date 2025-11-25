-- Migration: Scale & Polish Features (Month 11-12)
-- Description: Tables for cross-platform analytics, marketplace, experience discovery, and ratings

-- Activity logs for cross-platform analytics
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES platform_users(id),
  platform TEXT NOT NULL CHECK (platform IN ('atlvs', 'compvss', 'gvteway')),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_platform ON activity_logs(platform);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at);

-- Marketplace categories
CREATE TABLE IF NOT EXISTS marketplace_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketplace listings
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('gig', 'job', 'rfp', 'equipment_rental', 'service')),
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  location_type TEXT CHECK (location_type IN ('onsite', 'remote', 'hybrid')),
  compensation JSONB,
  requirements TEXT[],
  skills TEXT[],
  start_date DATE,
  end_date DATE,
  deadline DATE,
  is_featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'filled', 'closed', 'expired')),
  view_count INT DEFAULT 0,
  posted_by UUID NOT NULL REFERENCES platform_users(id),
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_type ON marketplace_listings(type);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_posted_by ON marketplace_listings(posted_by);

-- Marketplace applications
CREATE TABLE IF NOT EXISTS marketplace_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES marketplace_listings(id),
  applicant_id UUID NOT NULL REFERENCES platform_users(id),
  cover_letter TEXT,
  resume_url TEXT,
  portfolio_url TEXT,
  availability TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'accepted', 'rejected')),
  reviewer_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(listing_id, applicant_id)
);

CREATE INDEX IF NOT EXISTS idx_marketplace_applications_listing ON marketplace_applications(listing_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_applications_applicant ON marketplace_applications(applicant_id);

-- Marketplace saved listings
CREATE TABLE IF NOT EXISTS marketplace_saved (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  listing_id UUID NOT NULL REFERENCES marketplace_listings(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- Experience collections
CREATE TABLE IF NOT EXISTS experience_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Experience collection items
CREATE TABLE IF NOT EXISTS experience_collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES experience_collections(id),
  event_id UUID NOT NULL REFERENCES events(id),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_experience_collection_items_collection ON experience_collection_items(collection_id);

-- User collections
CREATE TABLE IF NOT EXISTS user_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_collections_user ON user_collections(user_id);

-- User collection items
CREATE TABLE IF NOT EXISTS user_collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES user_collections(id),
  event_id UUID NOT NULL REFERENCES events(id),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event shares
CREATE TABLE IF NOT EXISTS event_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  user_id UUID REFERENCES platform_users(id),
  platform TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_shares_event ON event_shares(event_id);

-- Event artists
CREATE TABLE IF NOT EXISTS event_artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  artist_id UUID NOT NULL REFERENCES artists(id),
  is_headliner BOOLEAN DEFAULT false,
  performance_order INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_artists_event ON event_artists(event_id);
CREATE INDEX IF NOT EXISTS idx_event_artists_artist ON event_artists(artist_id);

-- Ratings
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('vendor', 'crew', 'client', 'venue')),
  entity_id UUID NOT NULL,
  project_id UUID REFERENCES projects(id),
  reviewer_id UUID NOT NULL REFERENCES platform_users(id),
  overall_rating NUMERIC(2,1) NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  categories JSONB,
  review TEXT,
  would_recommend BOOLEAN,
  is_public BOOLEAN DEFAULT false,
  response TEXT,
  response_at TIMESTAMPTZ,
  response_by UUID REFERENCES platform_users(id),
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ratings_entity ON ratings(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_ratings_reviewer ON ratings(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_ratings_project ON ratings(project_id);

-- Rating summaries
CREATE TABLE IF NOT EXISTS rating_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  average_rating NUMERIC(2,1),
  total_ratings INT DEFAULT 0,
  recommendation_rate NUMERIC(5,2),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_rating_summaries_entity ON rating_summaries(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_rating_summaries_rating ON rating_summaries(average_rating);

-- Rating helpful votes
CREATE TABLE IF NOT EXISTS rating_helpful (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rating_id UUID NOT NULL REFERENCES ratings(id),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(rating_id, user_id)
);

-- Rating flags
CREATE TABLE IF NOT EXISTS rating_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rating_id UUID NOT NULL REFERENCES ratings(id),
  flagged_by UUID NOT NULL REFERENCES platform_users(id),
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'removed', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rating_flags_rating ON rating_flags(rating_id);

-- Add fields to events
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS venue_lat NUMERIC(10,7);
ALTER TABLE events ADD COLUMN IF NOT EXISTS venue_lng NUMERIC(10,7);

-- Add total_revenue to contacts
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS total_revenue NUMERIC(14,2) DEFAULT 0;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ;

-- RLS policies
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_saved ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rating_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE rating_helpful ENABLE ROW LEVEL SECURITY;
ALTER TABLE rating_flags ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT ON activity_logs TO authenticated;
GRANT SELECT ON marketplace_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE ON marketplace_listings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON marketplace_applications TO authenticated;
GRANT SELECT, INSERT, DELETE ON marketplace_saved TO authenticated;
GRANT SELECT ON experience_collections TO authenticated;
GRANT SELECT ON experience_collection_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_collections TO authenticated;
GRANT SELECT, INSERT, DELETE ON user_collection_items TO authenticated;
GRANT SELECT, INSERT ON event_shares TO authenticated;
GRANT SELECT ON event_artists TO authenticated;
GRANT SELECT, INSERT, UPDATE ON ratings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON rating_summaries TO authenticated;
GRANT SELECT, INSERT, UPDATE ON rating_helpful TO authenticated;
GRANT SELECT, INSERT ON rating_flags TO authenticated;

-- Insert default marketplace categories
INSERT INTO marketplace_categories (name, slug, sort_order) VALUES
('Audio Engineering', 'audio-engineering', 1),
('Lighting Design', 'lighting-design', 2),
('Video Production', 'video-production', 3),
('Stage Management', 'stage-management', 4),
('Rigging', 'rigging', 5),
('Backline', 'backline', 6),
('Transportation', 'transportation', 7),
('Catering', 'catering', 8),
('Security', 'security', 9),
('Other', 'other', 99)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample experience collections
INSERT INTO experience_collections (name, slug, description, sort_order) VALUES
('Staff Picks', 'staff-picks', 'Hand-picked events by our team', 1),
('Hot This Week', 'hot-this-week', 'Trending events this week', 2),
('Family Friendly', 'family-friendly', 'Great events for the whole family', 3),
('Date Night', 'date-night', 'Perfect for a night out', 4)
ON CONFLICT (slug) DO NOTHING;
