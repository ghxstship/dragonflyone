-- Migration: Extended Social Tables
-- Description: Tables for photo booths, social templates, and content features

-- Photo booths table
CREATE TABLE IF NOT EXISTS photo_booths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  name VARCHAR(100) NOT NULL,
  location VARCHAR(200),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  settings JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Photo booth templates table
CREATE TABLE IF NOT EXISTS photo_booth_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  event_id UUID REFERENCES events(id),
  overlay_url TEXT,
  frame_url TEXT,
  filters JSONB,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Photo booth photos table
CREATE TABLE IF NOT EXISTS photo_booth_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  booth_id UUID REFERENCES photo_booths(id),
  user_id UUID REFERENCES platform_users(id),
  template_id UUID REFERENCES photo_booth_templates(id),
  photo_url TEXT NOT NULL,
  thumbnail_url TEXT,
  shared BOOLEAN DEFAULT FALSE,
  shared_to TEXT[],
  shared_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Photo booth shares table
CREATE TABLE IF NOT EXISTS photo_booth_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID NOT NULL REFERENCES photo_booth_photos(id),
  platform VARCHAR(50) NOT NULL,
  share_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Instagram story templates table
CREATE TABLE IF NOT EXISTS instagram_story_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id),
  name VARCHAR(100) NOT NULL,
  template_url TEXT NOT NULL,
  preview_url TEXT,
  category VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TikTok challenges table
CREATE TABLE IF NOT EXISTS tiktok_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id),
  name VARCHAR(200) NOT NULL,
  hashtag VARCHAR(100) NOT NULL,
  description TEXT,
  instructions TEXT,
  prize_description TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'active',
  submission_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_photo_booths_event ON photo_booths(event_id);
CREATE INDEX IF NOT EXISTS idx_photo_booth_templates_event ON photo_booth_templates(event_id);
CREATE INDEX IF NOT EXISTS idx_photo_booth_photos_event ON photo_booth_photos(event_id);
CREATE INDEX IF NOT EXISTS idx_photo_booth_photos_user ON photo_booth_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_instagram_templates_event ON instagram_story_templates(event_id);
CREATE INDEX IF NOT EXISTS idx_tiktok_challenges_event ON tiktok_challenges(event_id);

-- RLS Policies
ALTER TABLE photo_booths ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_booth_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_booth_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_booth_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_story_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tiktok_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY photo_booths_view ON photo_booths FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY photo_booth_templates_view ON photo_booth_templates FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY photo_booth_photos_view ON photo_booth_photos FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY instagram_templates_view ON instagram_story_templates FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY tiktok_challenges_view ON tiktok_challenges FOR SELECT USING (auth.uid() IS NOT NULL);
