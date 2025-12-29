-- Migration: Recommendations Engine System
-- Description: Tables for personalized recommendations, collaborative filtering, and AI suggestions

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) UNIQUE,
  preferred_genres TEXT[],
  preferred_artists UUID[],
  preferred_venues UUID[],
  preferred_event_types TEXT[],
  preferred_price_range JSONB,
  preferred_days TEXT[],
  preferred_times TEXT[],
  preferred_locations JSONB,
  max_travel_distance INT,
  accessibility_needs TEXT[],
  dietary_restrictions TEXT[],
  language_preferences TEXT[],
  notification_preferences JSONB,
  discovery_quiz_completed BOOLEAN DEFAULT false,
  discovery_quiz_results JSONB,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);

-- User interaction history
CREATE TABLE IF NOT EXISTS user_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'click', 'search', 'purchase', 'favorite', 'share', 'review', 'dismiss', 'not_interested')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('event', 'artist', 'venue', 'genre', 'collection')),
  entity_id UUID NOT NULL,
  session_id TEXT,
  duration_seconds INT,
  scroll_depth NUMERIC(5,2),
  source TEXT,
  context JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_interactions_user ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_entity ON user_interactions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON user_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_created ON user_interactions(created_at);

-- Recommendation scores (pre-computed)
CREATE TABLE IF NOT EXISTS recommendation_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  event_id UUID NOT NULL REFERENCES events(id),
  score NUMERIC(5,4) NOT NULL,
  score_breakdown JSONB,
  algorithm_version TEXT,
  factors JSONB,
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(user_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_recommendation_scores_user ON recommendation_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_scores_score ON recommendation_scores(user_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_recommendation_scores_expires ON recommendation_scores(expires_at);

-- Similar events (collaborative filtering)
CREATE TABLE IF NOT EXISTS similar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  similar_event_id UUID NOT NULL REFERENCES events(id),
  similarity_score NUMERIC(5,4) NOT NULL,
  similarity_factors JSONB,
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, similar_event_id)
);

CREATE INDEX IF NOT EXISTS idx_similar_events_event ON similar_events(event_id);
CREATE INDEX IF NOT EXISTS idx_similar_events_score ON similar_events(event_id, similarity_score DESC);

-- "Fans also bought" data
CREATE TABLE IF NOT EXISTS fans_also_bought (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  related_event_id UUID NOT NULL REFERENCES events(id),
  co_purchase_count INT DEFAULT 0,
  co_purchase_score NUMERIC(5,4),
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, related_event_id)
);

CREATE INDEX IF NOT EXISTS idx_fans_also_bought_event ON fans_also_bought(event_id);
CREATE INDEX IF NOT EXISTS idx_fans_also_bought_score ON fans_also_bought(event_id, co_purchase_score DESC);

-- Curated collections
CREATE TABLE IF NOT EXISTS curated_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  collection_type TEXT NOT NULL CHECK (collection_type IN ('editorial', 'algorithmic', 'seasonal', 'trending', 'genre', 'location', 'custom')),
  event_ids UUID[],
  criteria JSONB,
  sort_order INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_curated_collections_org ON curated_collections(organization_id);
CREATE INDEX IF NOT EXISTS idx_curated_collections_type ON curated_collections(collection_type);
CREATE INDEX IF NOT EXISTS idx_curated_collections_featured ON curated_collections(is_featured);

-- Trending events
CREATE TABLE IF NOT EXISTS trending_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) UNIQUE,
  trending_score NUMERIC(10,4) NOT NULL,
  view_count INT DEFAULT 0,
  view_velocity NUMERIC(10,4),
  purchase_count INT DEFAULT 0,
  purchase_velocity NUMERIC(10,4),
  social_mentions INT DEFAULT 0,
  search_volume INT DEFAULT 0,
  rank INT,
  region TEXT,
  computed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trending_events_score ON trending_events(trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_trending_events_rank ON trending_events(rank);
CREATE INDEX IF NOT EXISTS idx_trending_events_region ON trending_events(region);

-- Discovery quiz questions
CREATE TABLE IF NOT EXISTS discovery_quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('single_choice', 'multiple_choice', 'slider', 'ranking')),
  options JSONB NOT NULL,
  category TEXT,
  weight NUMERIC(3,2) DEFAULT 1,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Discovery quiz responses
CREATE TABLE IF NOT EXISTS discovery_quiz_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  question_id UUID NOT NULL REFERENCES discovery_quiz_questions(id),
  response JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_discovery_quiz_responses_user ON discovery_quiz_responses(user_id);

-- Function to get personalized recommendations
CREATE OR REPLACE FUNCTION get_personalized_recommendations(
  p_user_id UUID,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  event_id UUID,
  event_name TEXT,
  score NUMERIC,
  reason TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rs.event_id,
    e.name as event_name,
    rs.score,
    CASE 
      WHEN rs.factors->>'genre_match' = 'true' THEN 'Based on your favorite genres'
      WHEN rs.factors->>'artist_follow' = 'true' THEN 'From artists you follow'
      WHEN rs.factors->>'venue_favorite' = 'true' THEN 'At a venue you love'
      WHEN rs.factors->>'similar_purchase' = 'true' THEN 'Similar to events you attended'
      ELSE 'Recommended for you'
    END as reason
  FROM recommendation_scores rs
  JOIN events e ON e.id = rs.event_id
  WHERE rs.user_id = p_user_id
    AND e.status = 'on_sale'
    AND e.start_date > NOW()
    AND (rs.expires_at IS NULL OR rs.expires_at > NOW())
  ORDER BY rs.score DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Function to record user interaction
CREATE OR REPLACE FUNCTION record_user_interaction(
  p_user_id UUID,
  p_interaction_type TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_session_id TEXT DEFAULT NULL,
  p_context JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_interaction_id UUID;
BEGIN
  INSERT INTO user_interactions (user_id, interaction_type, entity_type, entity_id, session_id, context)
  VALUES (p_user_id, p_interaction_type, p_entity_type, p_entity_id, p_session_id, p_context)
  RETURNING id INTO v_interaction_id;
  
  RETURN v_interaction_id;
END;
$$;

-- Function to compute trending score
CREATE OR REPLACE FUNCTION compute_trending_score(p_event_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
  v_view_score NUMERIC;
  v_purchase_score NUMERIC;
  v_recency_factor NUMERIC;
  v_total_score NUMERIC;
BEGIN
  -- Views in last 24 hours
  SELECT COUNT(*) * 0.1 INTO v_view_score
  FROM user_interactions
  WHERE entity_id = p_event_id
    AND entity_type = 'event'
    AND interaction_type = 'view'
    AND created_at > NOW() - INTERVAL '24 hours';
  
  -- Purchases in last 24 hours
  SELECT COUNT(*) * 10 INTO v_purchase_score
  FROM orders
  WHERE event_id = p_event_id
    AND created_at > NOW() - INTERVAL '24 hours';
  
  -- Recency factor (events sooner get boost)
  SELECT CASE 
    WHEN start_date < NOW() + INTERVAL '7 days' THEN 2.0
    WHEN start_date < NOW() + INTERVAL '30 days' THEN 1.5
    ELSE 1.0
  END INTO v_recency_factor
  FROM events WHERE id = p_event_id;
  
  v_total_score := (COALESCE(v_view_score, 0) + COALESCE(v_purchase_score, 0)) * COALESCE(v_recency_factor, 1);
  
  RETURN v_total_score;
END;
$$;

-- Insert default discovery quiz questions
INSERT INTO discovery_quiz_questions (question_text, question_type, options, category, sort_order)
VALUES 
  ('What types of events do you enjoy most?', 'multiple_choice', '["Concerts", "Festivals", "Theater", "Sports", "Comedy", "Nightlife", "Conferences"]', 'event_types', 1),
  ('What music genres do you like?', 'multiple_choice', '["Pop", "Rock", "Hip-Hop", "Electronic", "Country", "R&B", "Jazz", "Classical", "Indie", "Latin"]', 'genres', 2),
  ('How far are you willing to travel for an event?', 'single_choice', '["Under 10 miles", "10-25 miles", "25-50 miles", "50-100 miles", "Anywhere"]', 'travel', 3),
  ('What''s your typical budget for tickets?', 'single_choice', '["Under $50", "$50-100", "$100-200", "$200-500", "No limit"]', 'budget', 4),
  ('When do you prefer to attend events?', 'multiple_choice', '["Weekday evenings", "Friday nights", "Saturday nights", "Sunday afternoons", "Any time"]', 'timing', 5)
ON CONFLICT DO NOTHING;

-- RLS policies
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE similar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE fans_also_bought ENABLE ROW LEVEL SECURITY;
ALTER TABLE curated_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE trending_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_quiz_responses ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON user_preferences TO authenticated;
GRANT SELECT, INSERT ON user_interactions TO authenticated;
GRANT SELECT ON recommendation_scores TO authenticated;
GRANT SELECT ON similar_events TO authenticated;
GRANT SELECT ON fans_also_bought TO authenticated;
GRANT SELECT ON curated_collections TO authenticated;
GRANT SELECT ON trending_events TO authenticated;
GRANT SELECT ON discovery_quiz_questions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON discovery_quiz_responses TO authenticated;
GRANT EXECUTE ON FUNCTION get_personalized_recommendations(UUID, INT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION record_user_interaction(UUID, TEXT, TEXT, UUID, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION compute_trending_score(UUID) TO authenticated;
