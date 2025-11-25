-- Migration: Crew Social Features System
-- Description: Social features for crew including roster, photos, connections, and activity

-- Crew connections (following/connections between crew members)
CREATE TABLE IF NOT EXISTS crew_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  connection_type VARCHAR(50) DEFAULT 'follow' CHECK (connection_type IN ('follow', 'connection', 'colleague', 'mentor', 'mentee')),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'blocked')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Crew photos/media
CREATE TABLE IF NOT EXISTS crew_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  photo_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  location VARCHAR(255),
  photo_date DATE,
  tags JSONB DEFAULT '[]',
  tagged_users JSONB DEFAULT '[]',
  visibility VARCHAR(50) DEFAULT 'connections' CHECK (visibility IN ('public', 'connections', 'private')),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_profile_photo BOOLEAN DEFAULT FALSE,
  is_cover_photo BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Photo likes
CREATE TABLE IF NOT EXISTS crew_photo_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID NOT NULL REFERENCES crew_photos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(photo_id, user_id)
);

-- Photo comments
CREATE TABLE IF NOT EXISTS crew_photo_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID NOT NULL REFERENCES crew_photos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES crew_photo_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crew roster (event/project specific)
CREATE TABLE IF NOT EXISTS crew_rosters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  roster_date DATE,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  visibility VARCHAR(50) DEFAULT 'crew' CHECK (visibility IN ('public', 'crew', 'management')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id),
  CONSTRAINT roster_target CHECK (project_id IS NOT NULL OR event_id IS NOT NULL)
);

-- Roster entries
CREATE TABLE IF NOT EXISTS crew_roster_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roster_id UUID NOT NULL REFERENCES crew_rosters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  role VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  call_time TIME,
  end_time TIME,
  location VARCHAR(255),
  notes TEXT,
  contact_info JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'declined', 'no_show')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(roster_id, user_id)
);

-- Crew activity feed
CREATE TABLE IF NOT EXISTS crew_activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN (
    'joined_project', 'completed_project', 'photo_upload', 'connection_made',
    'skill_added', 'certification_earned', 'milestone_reached', 'kudos_received',
    'event_completed', 'roster_published', 'profile_updated', 'achievement_unlocked'
  )),
  target_type VARCHAR(50),
  target_id UUID,
  content TEXT,
  metadata JSONB DEFAULT '{}',
  visibility VARCHAR(50) DEFAULT 'connections' CHECK (visibility IN ('public', 'connections', 'private')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crew kudos/recognition
CREATE TABLE IF NOT EXISTS crew_kudos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  kudos_type VARCHAR(50) NOT NULL CHECK (kudos_type IN (
    'great_work', 'team_player', 'problem_solver', 'leadership', 'creativity',
    'reliability', 'mentorship', 'safety_champion', 'above_beyond', 'technical_excellence'
  )),
  message TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crew achievements/badges
CREATE TABLE IF NOT EXISTS crew_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE,
  description TEXT,
  icon VARCHAR(100),
  category VARCHAR(50) CHECK (category IN ('experience', 'skills', 'social', 'safety', 'leadership', 'special')),
  criteria JSONB DEFAULT '{}',
  points INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User achievements
CREATE TABLE IF NOT EXISTS crew_user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES crew_achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, achievement_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_crew_connections_follower ON crew_connections(follower_id);
CREATE INDEX IF NOT EXISTS idx_crew_connections_following ON crew_connections(following_id);
CREATE INDEX IF NOT EXISTS idx_crew_photos_user ON crew_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_crew_photos_project ON crew_photos(project_id);
CREATE INDEX IF NOT EXISTS idx_crew_photos_event ON crew_photos(event_id);
CREATE INDEX IF NOT EXISTS idx_crew_rosters_project ON crew_rosters(project_id);
CREATE INDEX IF NOT EXISTS idx_crew_rosters_event ON crew_rosters(event_id);
CREATE INDEX IF NOT EXISTS idx_crew_roster_entries_roster ON crew_roster_entries(roster_id);
CREATE INDEX IF NOT EXISTS idx_crew_roster_entries_user ON crew_roster_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_crew_activity_user ON crew_activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_crew_activity_created ON crew_activity_feed(created_at);
CREATE INDEX IF NOT EXISTS idx_crew_kudos_to_user ON crew_kudos(to_user_id);
CREATE INDEX IF NOT EXISTS idx_crew_kudos_from_user ON crew_kudos(from_user_id);

-- RLS Policies
ALTER TABLE crew_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_photo_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_photo_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_rosters ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_roster_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_kudos ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_user_achievements ENABLE ROW LEVEL SECURITY;

-- Connection policies
CREATE POLICY "connections_select" ON crew_connections
  FOR SELECT USING (
    follower_id = auth.uid() OR following_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

CREATE POLICY "connections_insert" ON crew_connections
  FOR INSERT WITH CHECK (follower_id = auth.uid());

CREATE POLICY "connections_delete" ON crew_connections
  FOR DELETE USING (follower_id = auth.uid() OR following_id = auth.uid());

-- Photo policies
CREATE POLICY "photos_select" ON crew_photos
  FOR SELECT USING (
    visibility = 'public'
    OR user_id = auth.uid()
    OR (visibility = 'connections' AND EXISTS (
      SELECT 1 FROM crew_connections cc
      WHERE cc.follower_id = auth.uid() AND cc.following_id = user_id AND cc.status = 'active'
    ))
  );

CREATE POLICY "photos_insert" ON crew_photos
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "photos_update" ON crew_photos
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "photos_delete" ON crew_photos
  FOR DELETE USING (user_id = auth.uid());

-- Roster policies
CREATE POLICY "rosters_select" ON crew_rosters
  FOR SELECT USING (
    visibility = 'public'
    OR EXISTS (
      SELECT 1 FROM crew_roster_entries cre
      WHERE cre.roster_id = id AND cre.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['COMPVSS_ADMIN', 'COMPVSS_TEAM_MEMBER', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

CREATE POLICY "rosters_manage" ON crew_rosters
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['COMPVSS_ADMIN', 'COMPVSS_TEAM_MEMBER', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

-- Activity feed policies
CREATE POLICY "activity_select" ON crew_activity_feed
  FOR SELECT USING (
    visibility = 'public'
    OR user_id = auth.uid()
    OR (visibility = 'connections' AND EXISTS (
      SELECT 1 FROM crew_connections cc
      WHERE cc.follower_id = auth.uid() AND cc.following_id = user_id AND cc.status = 'active'
    ))
  );

CREATE POLICY "activity_insert" ON crew_activity_feed
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Kudos policies
CREATE POLICY "kudos_select" ON crew_kudos
  FOR SELECT USING (
    is_public = TRUE
    OR from_user_id = auth.uid()
    OR to_user_id = auth.uid()
  );

CREATE POLICY "kudos_insert" ON crew_kudos
  FOR INSERT WITH CHECK (from_user_id = auth.uid() AND from_user_id != to_user_id);

-- Achievement policies
CREATE POLICY "achievements_select" ON crew_achievements FOR SELECT USING (true);
CREATE POLICY "user_achievements_select" ON crew_user_achievements FOR SELECT USING (true);

-- Triggers for counts
CREATE OR REPLACE FUNCTION update_photo_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE crew_photos SET likes_count = likes_count + 1 WHERE id = NEW.photo_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE crew_photos SET likes_count = likes_count - 1 WHERE id = OLD.photo_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER photo_likes_count_trigger
  AFTER INSERT OR DELETE ON crew_photo_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_photo_likes_count();

CREATE OR REPLACE FUNCTION update_photo_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE crew_photos SET comments_count = comments_count + 1 WHERE id = NEW.photo_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE crew_photos SET comments_count = comments_count - 1 WHERE id = OLD.photo_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER photo_comments_count_trigger
  AFTER INSERT OR DELETE ON crew_photo_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_photo_comments_count();

-- Seed some achievements
INSERT INTO crew_achievements (name, code, description, icon, category, points) VALUES
  ('First Project', 'first_project', 'Completed your first project', 'trophy', 'experience', 10),
  ('Veteran', 'veteran_50', 'Completed 50 projects', 'medal', 'experience', 100),
  ('Safety First', 'safety_first', 'Zero safety incidents for 1 year', 'shield', 'safety', 50),
  ('Team Builder', 'team_builder', 'Connected with 25 crew members', 'users', 'social', 25),
  ('Mentor', 'mentor', 'Mentored 5 new crew members', 'graduation-cap', 'leadership', 75),
  ('Photo Pro', 'photo_pro', 'Uploaded 100 project photos', 'camera', 'social', 30),
  ('Kudos King', 'kudos_king', 'Received 50 kudos', 'star', 'social', 50),
  ('Multi-Skilled', 'multi_skilled', 'Certified in 5+ skills', 'award', 'skills', 40),
  ('Early Bird', 'early_bird', 'Never late to call time for 20 events', 'clock', 'experience', 35),
  ('Problem Solver', 'problem_solver', 'Resolved 10 critical issues', 'lightbulb', 'skills', 45)
ON CONFLICT (code) DO NOTHING;
