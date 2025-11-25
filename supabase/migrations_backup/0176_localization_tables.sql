-- Migration: Localization Tables
-- Description: Tables for multi-language support and translations

-- Event translations table
CREATE TABLE IF NOT EXISTS event_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  language_code VARCHAR(10) NOT NULL,
  title VARCHAR(500),
  description TEXT,
  venue_name VARCHAR(300),
  additional_info TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, language_code)
);

-- UI translations table
CREATE TABLE IF NOT EXISTS ui_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  language_code VARCHAR(10) NOT NULL,
  key VARCHAR(200) NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(language_code, key)
);

-- Add preferred_language to platform_users if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'platform_users' AND column_name = 'preferred_language') THEN
    ALTER TABLE platform_users ADD COLUMN preferred_language VARCHAR(10) DEFAULT 'en';
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_event_translations_event ON event_translations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_translations_lang ON event_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_ui_translations_lang ON ui_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_ui_translations_key ON ui_translations(key);

-- RLS Policies
ALTER TABLE event_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ui_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY event_translations_view ON event_translations FOR SELECT USING (TRUE);
CREATE POLICY ui_translations_view ON ui_translations FOR SELECT USING (TRUE);

CREATE POLICY event_translations_manage ON event_translations FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND 'GVTEWAY_ADMIN' = ANY(platform_roles))
);

CREATE POLICY ui_translations_manage ON ui_translations FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND 'GVTEWAY_ADMIN' = ANY(platform_roles))
);
