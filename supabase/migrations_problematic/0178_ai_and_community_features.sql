-- Migration: AI and Community Features (Phase 3)
-- Description: Tables for AI forecasting, predictive maintenance, scheduling, recommendations, and community

-- Asset usage logs for predictive maintenance
CREATE TABLE IF NOT EXISTS asset_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id),
  metric_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_asset_usage_logs_asset ON asset_usage_logs(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_usage_logs_recorded ON asset_usage_logs(recorded_at);

-- Scheduled maintenance
CREATE TABLE IF NOT EXISTS scheduled_maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id),
  scheduled_date DATE NOT NULL,
  maintenance_type TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_maintenance_asset ON scheduled_maintenance(asset_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_maintenance_date ON scheduled_maintenance(scheduled_date);

-- Crew profiles for scheduling
CREATE TABLE IF NOT EXISTS crew_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) UNIQUE,
  skills TEXT[],
  hourly_rate NUMERIC(10,2),
  location TEXT,
  is_available BOOLEAN DEFAULT true,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crew_profiles_user ON crew_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_crew_profiles_available ON crew_profiles(is_available);

-- Crew availability
CREATE TABLE IF NOT EXISTS crew_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id UUID NOT NULL REFERENCES crew_profiles(id),
  available_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crew_availability_crew ON crew_availability(crew_id);
CREATE INDEX IF NOT EXISTS idx_crew_availability_date ON crew_availability(available_date);

-- Project shifts
CREATE TABLE IF NOT EXISTS project_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES compvss_projects(id),
  role TEXT NOT NULL,
  required_skills TEXT[],
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'filled', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_shifts_project ON project_shifts(project_id);
CREATE INDEX IF NOT EXISTS idx_project_shifts_status ON project_shifts(status);

-- Recommendation interactions for learning
CREATE TABLE IF NOT EXISTS recommendation_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  event_id UUID NOT NULL REFERENCES events(id),
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'click', 'purchase', 'dismiss')),
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recommendation_interactions_user ON recommendation_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_interactions_event ON recommendation_interactions(event_id);

-- Recommendation dismissals
CREATE TABLE IF NOT EXISTS recommendation_dismissals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  event_id UUID NOT NULL REFERENCES events(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- Community posts
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  content TEXT NOT NULL,
  event_id UUID REFERENCES events(id),
  artist_id UUID REFERENCES artists(id),
  group_id UUID,
  media_urls TEXT[],
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'group')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'deleted', 'hidden')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_posts_user ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_event ON community_posts(event_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_status ON community_posts(status);

-- Community comments
CREATE TABLE IF NOT EXISTS community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  content TEXT NOT NULL,
  parent_id UUID REFERENCES community_comments(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'deleted', 'hidden')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_comments_post ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_user ON community_comments(user_id);

-- Community likes
CREATE TABLE IF NOT EXISTS community_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_community_likes_post ON community_likes(post_id);

-- User follows
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES platform_users(id),
  following_id UUID NOT NULL REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);

-- Community groups
CREATE TABLE IF NOT EXISTS community_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_private BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  member_count INT DEFAULT 0,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_groups_active ON community_groups(is_active);

-- Community group members
CREATE TABLE IF NOT EXISTS community_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES community_groups(id),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_community_group_members_group ON community_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_community_group_members_user ON community_group_members(user_id);

-- Community reports
CREATE TABLE IF NOT EXISTS community_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('post', 'comment', 'user', 'group')),
  entity_id UUID NOT NULL,
  reason TEXT NOT NULL,
  reported_by UUID NOT NULL REFERENCES platform_users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_reports_status ON community_reports(status);

-- Add bio to platform_users
ALTER TABLE platform_users ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add assignment_score to crew_assignments
ALTER TABLE crew_assignments ADD COLUMN IF NOT EXISTS assignment_score INT;

-- Functions for group member count
CREATE OR REPLACE FUNCTION increment_group_member_count(p_group_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE community_groups
  SET member_count = member_count + 1
  WHERE id = p_group_id;
END;
$$;

CREATE OR REPLACE FUNCTION decrement_group_member_count(p_group_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE community_groups
  SET member_count = GREATEST(0, member_count - 1)
  WHERE id = p_group_id;
END;
$$;

-- RLS policies
ALTER TABLE asset_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_dismissals ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_reports ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT ON asset_usage_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON scheduled_maintenance TO authenticated;
GRANT SELECT, INSERT, UPDATE ON crew_profiles TO authenticated;
GRANT SELECT, INSERT, DELETE ON crew_availability TO authenticated;
GRANT SELECT, INSERT, UPDATE ON project_shifts TO authenticated;
GRANT SELECT, INSERT ON recommendation_interactions TO authenticated;
GRANT SELECT, INSERT, DELETE ON recommendation_dismissals TO authenticated;
GRANT SELECT, INSERT, UPDATE ON community_posts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON community_comments TO authenticated;
GRANT SELECT, INSERT, DELETE ON community_likes TO authenticated;
GRANT SELECT, INSERT, DELETE ON user_follows TO authenticated;
GRANT SELECT, INSERT, UPDATE ON community_groups TO authenticated;
GRANT SELECT, INSERT, DELETE ON community_group_members TO authenticated;
GRANT SELECT, INSERT ON community_reports TO authenticated;
GRANT EXECUTE ON FUNCTION increment_group_member_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_group_member_count(UUID) TO authenticated;
