-- Migration: Reviews & Ratings System
-- Description: Tables for reviews, ratings, moderation, and feedback

-- Reviews table (unified)
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  review_type TEXT NOT NULL CHECK (review_type IN ('event', 'venue', 'artist', 'experience', 'merchandise', 'service')),
  target_id UUID NOT NULL,
  order_id UUID REFERENCES orders(id),
  ticket_id UUID REFERENCES tickets(id),
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  content TEXT NOT NULL,
  venue_rating INT CHECK (venue_rating BETWEEN 1 AND 5),
  production_rating INT CHECK (production_rating BETWEEN 1 AND 5),
  value_rating INT CHECK (value_rating BETWEEN 1 AND 5),
  sound_rating INT CHECK (sound_rating BETWEEN 1 AND 5),
  atmosphere_rating INT CHECK (atmosphere_rating BETWEEN 1 AND 5),
  service_rating INT CHECK (service_rating BETWEEN 1 AND 5),
  photos TEXT[],
  videos TEXT[],
  tags TEXT[],
  pros TEXT[],
  cons TEXT[],
  event_date DATE,
  verified_purchase BOOLEAN DEFAULT false,
  verified_attendee BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_anonymous BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged', 'hidden')),
  helpful_count INT DEFAULT 0,
  not_helpful_count INT DEFAULT 0,
  report_count INT DEFAULT 0,
  view_count INT DEFAULT 0,
  moderation_notes TEXT,
  moderated_at TIMESTAMPTZ,
  moderated_by UUID REFERENCES platform_users(id),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, review_type, target_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_type ON reviews(review_type);
CREATE INDEX IF NOT EXISTS idx_reviews_target ON reviews(target_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_featured ON reviews(is_featured);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at);

-- Review responses (from organizers/venues)
CREATE TABLE IF NOT EXISTS review_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id),
  responder_type TEXT NOT NULL CHECK (responder_type IN ('organizer', 'venue', 'artist', 'support')),
  content TEXT NOT NULL,
  is_public BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'hidden')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_responses_review ON review_responses(review_id);

-- Review votes (helpful/not helpful)
CREATE TABLE IF NOT EXISTS review_helpful_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id),
  vote_type TEXT NOT NULL CHECK (vote_type IN ('helpful', 'not_helpful')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_review_helpful_votes_review ON review_helpful_votes(review_id);

-- Review reports
CREATE TABLE IF NOT EXISTS review_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id),
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'inappropriate', 'fake', 'harassment', 'off_topic', 'other')),
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES platform_users(id),
  reviewed_at TIMESTAMPTZ,
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_review_reports_review ON review_reports(review_id);
CREATE INDEX IF NOT EXISTS idx_review_reports_status ON review_reports(status);

-- Review statistics (aggregated per target)
CREATE TABLE IF NOT EXISTS review_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type TEXT NOT NULL CHECK (target_type IN ('event', 'venue', 'artist', 'experience', 'merchandise', 'service')),
  target_id UUID NOT NULL,
  total_reviews INT DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 0,
  rating_distribution JSONB DEFAULT '{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}',
  verified_reviews INT DEFAULT 0,
  featured_reviews INT DEFAULT 0,
  average_venue_rating NUMERIC(3,2),
  average_production_rating NUMERIC(3,2),
  average_value_rating NUMERIC(3,2),
  average_sound_rating NUMERIC(3,2),
  average_atmosphere_rating NUMERIC(3,2),
  average_service_rating NUMERIC(3,2),
  recommendation_rate NUMERIC(5,2),
  response_rate NUMERIC(5,2),
  last_review_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(target_type, target_id)
);

CREATE INDEX IF NOT EXISTS idx_review_statistics_target ON review_statistics(target_type, target_id);

-- Review prompts (for soliciting reviews)
CREATE TABLE IF NOT EXISTS review_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  order_id UUID REFERENCES orders(id),
  event_id UUID REFERENCES events(id),
  prompt_type TEXT NOT NULL CHECK (prompt_type IN ('post_event', 'post_purchase', 'follow_up', 'reminder')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'completed', 'dismissed', 'expired')),
  sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  review_id UUID REFERENCES reviews(id),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_prompts_user ON review_prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_review_prompts_status ON review_prompts(status);

-- Function to update review statistics
CREATE OR REPLACE FUNCTION update_review_statistics()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_target_type TEXT;
  v_target_id UUID;
BEGIN
  v_target_type := COALESCE(NEW.review_type, OLD.review_type);
  v_target_id := COALESCE(NEW.target_id, OLD.target_id);
  
  -- Recalculate statistics
  INSERT INTO review_statistics (target_type, target_id, total_reviews, average_rating, rating_distribution, verified_reviews, last_review_at)
  SELECT 
    v_target_type,
    v_target_id,
    COUNT(*),
    ROUND(AVG(rating), 2),
    jsonb_build_object(
      '1', COUNT(*) FILTER (WHERE rating = 1),
      '2', COUNT(*) FILTER (WHERE rating = 2),
      '3', COUNT(*) FILTER (WHERE rating = 3),
      '4', COUNT(*) FILTER (WHERE rating = 4),
      '5', COUNT(*) FILTER (WHERE rating = 5)
    ),
    COUNT(*) FILTER (WHERE verified_purchase = TRUE),
    MAX(created_at)
  FROM reviews
  WHERE review_type = v_target_type
    AND target_id = v_target_id
    AND status = 'approved'
  ON CONFLICT (target_type, target_id) DO UPDATE SET
    total_reviews = EXCLUDED.total_reviews,
    average_rating = EXCLUDED.average_rating,
    rating_distribution = EXCLUDED.rating_distribution,
    verified_reviews = EXCLUDED.verified_reviews,
    last_review_at = EXCLUDED.last_review_at,
    updated_at = NOW();
  
  -- Update average sub-ratings
  UPDATE review_statistics SET
    average_venue_rating = (SELECT ROUND(AVG(venue_rating), 2) FROM reviews WHERE review_type = v_target_type AND target_id = v_target_id AND status = 'approved' AND venue_rating IS NOT NULL),
    average_production_rating = (SELECT ROUND(AVG(production_rating), 2) FROM reviews WHERE review_type = v_target_type AND target_id = v_target_id AND status = 'approved' AND production_rating IS NOT NULL),
    average_value_rating = (SELECT ROUND(AVG(value_rating), 2) FROM reviews WHERE review_type = v_target_type AND target_id = v_target_id AND status = 'approved' AND value_rating IS NOT NULL),
    average_sound_rating = (SELECT ROUND(AVG(sound_rating), 2) FROM reviews WHERE review_type = v_target_type AND target_id = v_target_id AND status = 'approved' AND sound_rating IS NOT NULL),
    average_atmosphere_rating = (SELECT ROUND(AVG(atmosphere_rating), 2) FROM reviews WHERE review_type = v_target_type AND target_id = v_target_id AND status = 'approved' AND atmosphere_rating IS NOT NULL),
    average_service_rating = (SELECT ROUND(AVG(service_rating), 2) FROM reviews WHERE review_type = v_target_type AND target_id = v_target_id AND status = 'approved' AND service_rating IS NOT NULL)
  WHERE target_type = v_target_type AND target_id = v_target_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS review_statistics_trigger ON reviews;
CREATE TRIGGER review_statistics_trigger
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_review_statistics();

-- Function to update helpful counts
CREATE OR REPLACE FUNCTION update_review_helpful_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE reviews SET
    helpful_count = (SELECT COUNT(*) FROM review_helpful_votes WHERE review_id = COALESCE(NEW.review_id, OLD.review_id) AND vote_type = 'helpful'),
    not_helpful_count = (SELECT COUNT(*) FROM review_helpful_votes WHERE review_id = COALESCE(NEW.review_id, OLD.review_id) AND vote_type = 'not_helpful')
  WHERE id = COALESCE(NEW.review_id, OLD.review_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS review_helpful_counts_trigger ON review_helpful_votes;
CREATE TRIGGER review_helpful_counts_trigger
  AFTER INSERT OR DELETE ON review_helpful_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_review_helpful_counts();

-- Function to update report count
CREATE OR REPLACE FUNCTION update_review_report_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE reviews SET
    report_count = (SELECT COUNT(*) FROM review_reports WHERE review_id = COALESCE(NEW.review_id, OLD.review_id))
  WHERE id = COALESCE(NEW.review_id, OLD.review_id);
  
  -- Auto-flag if report count exceeds threshold
  IF (SELECT report_count FROM reviews WHERE id = COALESCE(NEW.review_id, OLD.review_id)) >= 3 THEN
    UPDATE reviews SET status = 'flagged' WHERE id = COALESCE(NEW.review_id, OLD.review_id) AND status = 'approved';
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS review_report_count_trigger ON review_reports;
CREATE TRIGGER review_report_count_trigger
  AFTER INSERT OR DELETE ON review_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_review_report_count();

-- RLS policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpful_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_prompts ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON reviews TO authenticated;
GRANT SELECT, INSERT, UPDATE ON review_responses TO authenticated;
GRANT SELECT, INSERT, DELETE ON review_helpful_votes TO authenticated;
GRANT SELECT, INSERT ON review_reports TO authenticated;
GRANT SELECT ON review_statistics TO authenticated;
GRANT SELECT, INSERT, UPDATE ON review_prompts TO authenticated;
