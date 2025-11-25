-- =====================================================
-- REVIEWS & RATINGS SYSTEM
-- =====================================================
-- Complete review and rating system for GVTEWAY
-- Tracks event reviews, venue reviews, artist reviews with moderation

-- =====================================================
-- REVIEWS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Review target
  review_type TEXT NOT NULL CHECK (review_type IN ('event', 'venue', 'artist', 'experience', 'merchandise')),
  target_id UUID NOT NULL, -- ID of the event, venue, artist, etc.
  
  -- Reviewer
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  order_id UUID, -- Optional: link to purchase order for verification
  
  -- Rating
  rating NUMERIC(2, 1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  
  -- Review content
  title TEXT,
  content TEXT NOT NULL,
  
  -- Detailed ratings (optional)
  venue_rating NUMERIC(2, 1) CHECK (venue_rating IS NULL OR (venue_rating >= 1 AND venue_rating <= 5)),
  production_rating NUMERIC(2, 1) CHECK (production_rating IS NULL OR (production_rating >= 1 AND production_rating <= 5)),
  value_rating NUMERIC(2, 1) CHECK (value_rating IS NULL OR (value_rating >= 1 AND value_rating <= 5)),
  
  -- Media
  photos TEXT[], -- URLs to review photos
  
  -- Moderation
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged', 'hidden')),
  moderation_notes TEXT,
  moderated_at TIMESTAMPTZ,
  moderated_by UUID REFERENCES platform_users(id),
  
  -- Engagement
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  report_count INTEGER DEFAULT 0,
  
  -- Verification
  verified_purchase BOOLEAN DEFAULT false,
  verified_attendee BOOLEAN DEFAULT false,
  
  -- Visibility
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadata
  event_date DATE, -- When the event occurred (for context)
  tags TEXT[]
);

-- =====================================================
-- REVIEW RESPONSES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS review_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  
  -- Responder (venue owner, artist, event organizer)
  user_id UUID NOT NULL REFERENCES platform_users(id),
  responder_type TEXT NOT NULL CHECK (responder_type IN ('venue_owner', 'artist', 'organizer', 'customer_service')),
  
  -- Response content
  content TEXT NOT NULL,
  
  -- Status
  is_public BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- REVIEW REACTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS review_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('helpful', 'not_helpful', 'report')),
  reason TEXT, -- For reports
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_user_review_reaction UNIQUE (review_id, user_id, reaction_type)
);

-- =====================================================
-- REVIEW STATISTICS TABLE (Aggregated)
-- =====================================================

CREATE TABLE IF NOT EXISTS review_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  
  -- Counts
  total_reviews INTEGER DEFAULT 0,
  approved_reviews INTEGER DEFAULT 0,
  
  -- Ratings
  average_rating NUMERIC(3, 2) DEFAULT 0,
  rating_1_count INTEGER DEFAULT 0,
  rating_2_count INTEGER DEFAULT 0,
  rating_3_count INTEGER DEFAULT 0,
  rating_4_count INTEGER DEFAULT 0,
  rating_5_count INTEGER DEFAULT 0,
  
  -- Detailed averages
  average_venue_rating NUMERIC(3, 2),
  average_production_rating NUMERIC(3, 2),
  average_value_rating NUMERIC(3, 2),
  
  -- Engagement
  total_helpful_votes INTEGER DEFAULT 0,
  verified_purchase_count INTEGER DEFAULT 0,
  
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_target_stats UNIQUE (target_type, target_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_reviews_target ON reviews(review_type, target_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created ON reviews(created_at DESC);
CREATE INDEX idx_reviews_verified ON reviews(verified_purchase) WHERE verified_purchase = true;
CREATE INDEX idx_reviews_featured ON reviews(is_featured) WHERE is_featured = true;

CREATE INDEX idx_review_responses_review ON review_responses(review_id);
CREATE INDEX idx_review_responses_user ON review_responses(user_id);

CREATE INDEX idx_review_reactions_review ON review_reactions(review_id);
CREATE INDEX idx_review_reactions_user ON review_reactions(user_id);
CREATE INDEX idx_review_reactions_type ON review_reactions(reaction_type);

CREATE INDEX idx_review_statistics_target ON review_statistics(target_type, target_id);

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_statistics ENABLE ROW LEVEL SECURITY;

-- Reviews policies
CREATE POLICY "Anyone can view approved public reviews"
  ON reviews FOR SELECT
  USING (status = 'approved' AND is_public = true);

CREATE POLICY "Users can view their own reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own pending reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND status = 'pending');

CREATE POLICY "Moderators can manage reviews"
  ON reviews FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM platform_users
      WHERE id = auth.uid()
      AND role_in('GVTEWAY_ADMIN', 'GVTEWAY_MODERATOR', 'LEGEND_SUPER_ADMIN')
    )
  );

-- Review responses policies
CREATE POLICY "Anyone can view public responses"
  ON review_responses FOR SELECT
  USING (is_public = true);

CREATE POLICY "Venue owners and organizers can respond"
  ON review_responses FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Review reactions policies
CREATE POLICY "Anyone can view reactions"
  ON review_reactions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can react"
  ON review_reactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own reactions"
  ON review_reactions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Review statistics policies (public read)
CREATE POLICY "Anyone can view review statistics"
  ON review_statistics FOR SELECT
  USING (true);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to calculate review statistics
CREATE OR REPLACE FUNCTION calculate_review_statistics(
  p_target_type TEXT,
  p_target_id UUID
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO review_statistics (
    target_type,
    target_id,
    total_reviews,
    approved_reviews,
    average_rating,
    rating_1_count,
    rating_2_count,
    rating_3_count,
    rating_4_count,
    rating_5_count,
    average_venue_rating,
    average_production_rating,
    average_value_rating,
    total_helpful_votes,
    verified_purchase_count,
    last_updated
  )
  SELECT
    p_target_type,
    p_target_id,
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'approved'),
    ROUND(AVG(rating) FILTER (WHERE status = 'approved'), 2),
    COUNT(*) FILTER (WHERE rating >= 1 AND rating < 2 AND status = 'approved'),
    COUNT(*) FILTER (WHERE rating >= 2 AND rating < 3 AND status = 'approved'),
    COUNT(*) FILTER (WHERE rating >= 3 AND rating < 4 AND status = 'approved'),
    COUNT(*) FILTER (WHERE rating >= 4 AND rating < 5 AND status = 'approved'),
    COUNT(*) FILTER (WHERE rating = 5 AND status = 'approved'),
    ROUND(AVG(venue_rating) FILTER (WHERE status = 'approved'), 2),
    ROUND(AVG(production_rating) FILTER (WHERE status = 'approved'), 2),
    ROUND(AVG(value_rating) FILTER (WHERE status = 'approved'), 2),
    COALESCE(SUM(helpful_count), 0),
    COUNT(*) FILTER (WHERE verified_purchase = true),
    NOW()
  FROM reviews
  WHERE review_type = p_target_type
    AND target_id = p_target_id
  ON CONFLICT (target_type, target_id)
  DO UPDATE SET
    total_reviews = EXCLUDED.total_reviews,
    approved_reviews = EXCLUDED.approved_reviews,
    average_rating = EXCLUDED.average_rating,
    rating_1_count = EXCLUDED.rating_1_count,
    rating_2_count = EXCLUDED.rating_2_count,
    rating_3_count = EXCLUDED.rating_3_count,
    rating_4_count = EXCLUDED.rating_4_count,
    rating_5_count = EXCLUDED.rating_5_count,
    average_venue_rating = EXCLUDED.average_venue_rating,
    average_production_rating = EXCLUDED.average_production_rating,
    average_value_rating = EXCLUDED.average_value_rating,
    total_helpful_votes = EXCLUDED.total_helpful_votes,
    verified_purchase_count = EXCLUDED.verified_purchase_count,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update reaction counts on review
CREATE OR REPLACE FUNCTION update_review_reaction_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.reaction_type = 'helpful' THEN
      UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = NEW.review_id;
    ELSIF NEW.reaction_type = 'not_helpful' THEN
      UPDATE reviews SET not_helpful_count = not_helpful_count + 1 WHERE id = NEW.review_id;
    ELSIF NEW.reaction_type = 'report' THEN
      UPDATE reviews SET report_count = report_count + 1 WHERE id = NEW.review_id;
      
      -- Auto-flag if reports exceed threshold
      UPDATE reviews 
      SET status = 'flagged'
      WHERE id = NEW.review_id 
        AND report_count >= 5 
        AND status = 'approved';
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.reaction_type = 'helpful' THEN
      UPDATE reviews SET helpful_count = GREATEST(0, helpful_count - 1) WHERE id = OLD.review_id;
    ELSIF OLD.reaction_type = 'not_helpful' THEN
      UPDATE reviews SET not_helpful_count = GREATEST(0, not_helpful_count - 1) WHERE id = OLD.review_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reaction_counts
  AFTER INSERT OR DELETE ON review_reactions
  FOR EACH ROW
  EXECUTE FUNCTION update_review_reaction_counts();

-- Trigger to update statistics when reviews change
CREATE OR REPLACE FUNCTION trigger_update_review_statistics()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM calculate_review_statistics(
    COALESCE(NEW.review_type, OLD.review_type),
    COALESCE(NEW.target_id, OLD.target_id)
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_statistics_on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_review_statistics();

-- Auto-update timestamp
CREATE TRIGGER update_reviews_timestamp
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_contracts_timestamp();

COMMENT ON TABLE reviews IS 'User reviews and ratings for events, venues, artists, and experiences';
COMMENT ON TABLE review_responses IS 'Official responses to reviews from venue owners, artists, or customer service';
COMMENT ON TABLE review_reactions IS 'User reactions to reviews (helpful, not helpful, report)';
COMMENT ON TABLE review_statistics IS 'Aggregated review statistics for quick access';
