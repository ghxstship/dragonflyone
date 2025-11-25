-- Migration: Language and Specialty Filtering System
-- Description: Support for language preferences and specialty filtering across crew and vendors

-- Languages reference table
CREATE TABLE IF NOT EXISTS languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  native_name VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User language proficiencies
CREATE TABLE IF NOT EXISTS user_languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  language_id UUID NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
  proficiency_level VARCHAR(50) NOT NULL CHECK (proficiency_level IN ('native', 'fluent', 'professional', 'conversational', 'basic')),
  is_primary BOOLEAN DEFAULT FALSE,
  can_translate BOOLEAN DEFAULT FALSE,
  can_interpret BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, language_id)
);

-- Specialties/skills taxonomy
CREATE TABLE IF NOT EXISTS specialty_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE,
  parent_category_id UUID REFERENCES specialty_categories(id) ON DELETE SET NULL,
  description TEXT,
  icon VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual specialties
CREATE TABLE IF NOT EXISTS specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES specialty_categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE,
  description TEXT,
  required_certifications JSONB DEFAULT '[]',
  experience_levels JSONB DEFAULT '["entry", "intermediate", "senior", "expert"]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User specialties
CREATE TABLE IF NOT EXISTS user_specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  specialty_id UUID NOT NULL REFERENCES specialties(id) ON DELETE CASCADE,
  experience_level VARCHAR(50) DEFAULT 'intermediate' CHECK (experience_level IN ('entry', 'intermediate', 'senior', 'expert', 'master')),
  years_experience INTEGER,
  is_primary BOOLEAN DEFAULT FALSE,
  portfolio_url TEXT,
  certifications JSONB DEFAULT '[]',
  notes TEXT,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, specialty_id)
);

-- Vendor specialties
CREATE TABLE IF NOT EXISTS vendor_specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  specialty_id UUID NOT NULL REFERENCES specialties(id) ON DELETE CASCADE,
  service_description TEXT,
  pricing_info JSONB DEFAULT '{}',
  portfolio_url TEXT,
  certifications JSONB DEFAULT '[]',
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vendor_id, specialty_id)
);

-- Vendor languages
CREATE TABLE IF NOT EXISTS vendor_languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  language_id UUID NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
  service_available BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vendor_id, language_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_languages_user ON user_languages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_languages_language ON user_languages(language_id);
CREATE INDEX IF NOT EXISTS idx_user_languages_proficiency ON user_languages(proficiency_level);
CREATE INDEX IF NOT EXISTS idx_specialty_categories_parent ON specialty_categories(parent_category_id);
CREATE INDEX IF NOT EXISTS idx_specialties_category ON specialties(category_id);
CREATE INDEX IF NOT EXISTS idx_user_specialties_user ON user_specialties(user_id);
CREATE INDEX IF NOT EXISTS idx_user_specialties_specialty ON user_specialties(specialty_id);
CREATE INDEX IF NOT EXISTS idx_user_specialties_level ON user_specialties(experience_level);
CREATE INDEX IF NOT EXISTS idx_vendor_specialties_vendor ON vendor_specialties(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_specialties_specialty ON vendor_specialties(specialty_id);
CREATE INDEX IF NOT EXISTS idx_vendor_languages_vendor ON vendor_languages(vendor_id);

-- RLS Policies
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialty_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_languages ENABLE ROW LEVEL SECURITY;

-- Public read access for reference tables
CREATE POLICY "languages_select" ON languages FOR SELECT USING (true);
CREATE POLICY "specialty_categories_select" ON specialty_categories FOR SELECT USING (true);
CREATE POLICY "specialties_select" ON specialties FOR SELECT USING (true);

-- User languages policies
CREATE POLICY "user_languages_select" ON user_languages FOR SELECT USING (true);
CREATE POLICY "user_languages_insert" ON user_languages
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_languages_update" ON user_languages
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "user_languages_delete" ON user_languages
  FOR DELETE USING (user_id = auth.uid());

-- User specialties policies
CREATE POLICY "user_specialties_select" ON user_specialties FOR SELECT USING (true);
CREATE POLICY "user_specialties_insert" ON user_specialties
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_specialties_update" ON user_specialties
  FOR UPDATE USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );
CREATE POLICY "user_specialties_delete" ON user_specialties
  FOR DELETE USING (user_id = auth.uid());

-- Vendor specialties/languages policies
CREATE POLICY "vendor_specialties_select" ON vendor_specialties FOR SELECT USING (true);
CREATE POLICY "vendor_languages_select" ON vendor_languages FOR SELECT USING (true);

CREATE POLICY "vendor_specialties_manage" ON vendor_specialties
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'ATLVS_TEAM_MEMBER', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

CREATE POLICY "vendor_languages_manage" ON vendor_languages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'ATLVS_TEAM_MEMBER', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

-- Admin policies for reference tables
CREATE POLICY "languages_manage" ON languages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

CREATE POLICY "specialty_categories_manage" ON specialty_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

CREATE POLICY "specialties_manage" ON specialties
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

-- Seed common languages
INSERT INTO languages (code, name, native_name) VALUES
  ('en', 'English', 'English'),
  ('es', 'Spanish', 'Español'),
  ('fr', 'French', 'Français'),
  ('de', 'German', 'Deutsch'),
  ('it', 'Italian', 'Italiano'),
  ('pt', 'Portuguese', 'Português'),
  ('zh', 'Chinese', '中文'),
  ('ja', 'Japanese', '日本語'),
  ('ko', 'Korean', '한국어'),
  ('ar', 'Arabic', 'العربية'),
  ('ru', 'Russian', 'Русский'),
  ('hi', 'Hindi', 'हिन्दी'),
  ('nl', 'Dutch', 'Nederlands'),
  ('pl', 'Polish', 'Polski'),
  ('sv', 'Swedish', 'Svenska'),
  ('da', 'Danish', 'Dansk'),
  ('no', 'Norwegian', 'Norsk'),
  ('fi', 'Finnish', 'Suomi'),
  ('he', 'Hebrew', 'עברית'),
  ('th', 'Thai', 'ไทย')
ON CONFLICT (code) DO NOTHING;

-- Seed specialty categories
INSERT INTO specialty_categories (name, code, sort_order) VALUES
  ('Audio', 'audio', 1),
  ('Lighting', 'lighting', 2),
  ('Video', 'video', 3),
  ('Staging', 'staging', 4),
  ('Rigging', 'rigging', 5),
  ('Production Management', 'production_mgmt', 6),
  ('Technical Direction', 'tech_direction', 7),
  ('Stage Management', 'stage_mgmt', 8),
  ('Backline', 'backline', 9),
  ('Special Effects', 'sfx', 10),
  ('Scenic', 'scenic', 11),
  ('Wardrobe', 'wardrobe', 12),
  ('Hair & Makeup', 'hair_makeup', 13),
  ('Catering', 'catering', 14),
  ('Transportation', 'transportation', 15),
  ('Security', 'security', 16)
ON CONFLICT (code) DO NOTHING;

-- Seed some specialties
INSERT INTO specialties (category_id, name, code) 
SELECT sc.id, s.name, s.code
FROM specialty_categories sc
CROSS JOIN (VALUES
  ('audio', 'FOH Engineer', 'foh_engineer'),
  ('audio', 'Monitor Engineer', 'monitor_engineer'),
  ('audio', 'Systems Engineer', 'systems_engineer'),
  ('audio', 'RF Coordinator', 'rf_coordinator'),
  ('audio', 'Audio Tech', 'audio_tech'),
  ('lighting', 'Lighting Designer', 'ld'),
  ('lighting', 'Lighting Programmer', 'lighting_programmer'),
  ('lighting', 'Lighting Tech', 'lighting_tech'),
  ('lighting', 'Follow Spot Operator', 'follow_spot'),
  ('video', 'Video Director', 'video_director'),
  ('video', 'Camera Operator', 'camera_op'),
  ('video', 'LED Tech', 'led_tech'),
  ('video', 'Playback Operator', 'playback_op'),
  ('staging', 'Stage Hand', 'stage_hand'),
  ('staging', 'Carpenter', 'carpenter'),
  ('staging', 'Deck Chief', 'deck_chief'),
  ('rigging', 'Head Rigger', 'head_rigger'),
  ('rigging', 'Rigger', 'rigger'),
  ('rigging', 'Ground Rigger', 'ground_rigger'),
  ('production_mgmt', 'Production Manager', 'pm'),
  ('production_mgmt', 'Production Coordinator', 'pc'),
  ('production_mgmt', 'Tour Manager', 'tour_manager'),
  ('tech_direction', 'Technical Director', 'td'),
  ('stage_mgmt', 'Stage Manager', 'sm'),
  ('stage_mgmt', 'Assistant Stage Manager', 'asm')
) AS s(category_code, name, code)
WHERE sc.code = s.category_code
ON CONFLICT (code) DO NOTHING;
