-- Migration: Multilingual Support System
-- Description: i18n infrastructure for content translation and localization

-- Supported locales configuration
CREATE TABLE IF NOT EXISTS supported_locales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locale_code VARCHAR(10) NOT NULL UNIQUE,
  language_code VARCHAR(5) NOT NULL,
  region_code VARCHAR(5),
  name VARCHAR(100) NOT NULL,
  native_name VARCHAR(100),
  direction VARCHAR(3) DEFAULT 'ltr' CHECK (direction IN ('ltr', 'rtl')),
  date_format VARCHAR(50) DEFAULT 'MM/DD/YYYY',
  time_format VARCHAR(50) DEFAULT 'h:mm A',
  number_format JSONB DEFAULT '{"decimal": ".", "thousands": ",", "currency_symbol": "$"}',
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User locale preferences
CREATE TABLE IF NOT EXISTS user_locale_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE UNIQUE,
  preferred_locale VARCHAR(10) NOT NULL REFERENCES supported_locales(locale_code),
  fallback_locale VARCHAR(10) REFERENCES supported_locales(locale_code),
  timezone VARCHAR(100) DEFAULT 'America/New_York',
  date_format_override VARCHAR(50),
  time_format_override VARCHAR(50),
  currency_preference VARCHAR(3) DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Translation keys/strings
CREATE TABLE IF NOT EXISTS translation_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(500) NOT NULL UNIQUE,
  namespace VARCHAR(100) DEFAULT 'common',
  description TEXT,
  context TEXT,
  max_length INTEGER,
  placeholders JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Translations
CREATE TABLE IF NOT EXISTS translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_id UUID NOT NULL REFERENCES translation_keys(id) ON DELETE CASCADE,
  locale_code VARCHAR(10) NOT NULL REFERENCES supported_locales(locale_code),
  value TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  is_machine_translated BOOLEAN DEFAULT FALSE,
  translation_source VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES platform_users(id),
  UNIQUE(key_id, locale_code)
);

-- Content translations (for dynamic content like events, articles, etc.)
CREATE TABLE IF NOT EXISTS content_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type VARCHAR(100) NOT NULL,
  content_id UUID NOT NULL,
  field_name VARCHAR(100) NOT NULL,
  locale_code VARCHAR(10) NOT NULL REFERENCES supported_locales(locale_code),
  translated_value TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  is_machine_translated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES platform_users(id),
  UNIQUE(content_type, content_id, field_name, locale_code)
);

-- Translation memory (for reuse)
CREATE TABLE IF NOT EXISTS translation_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_text TEXT NOT NULL,
  source_locale VARCHAR(10) NOT NULL,
  target_text TEXT NOT NULL,
  target_locale VARCHAR(10) NOT NULL,
  domain VARCHAR(100),
  usage_count INTEGER DEFAULT 1,
  quality_score DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Glossary terms (for consistent translations)
CREATE TABLE IF NOT EXISTS translation_glossary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term VARCHAR(255) NOT NULL,
  locale_code VARCHAR(10) NOT NULL REFERENCES supported_locales(locale_code),
  translation VARCHAR(255) NOT NULL,
  definition TEXT,
  domain VARCHAR(100),
  is_case_sensitive BOOLEAN DEFAULT FALSE,
  do_not_translate BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(term, locale_code, domain)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_locale_preferences_user ON user_locale_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_translation_keys_namespace ON translation_keys(namespace);
CREATE INDEX IF NOT EXISTS idx_translations_key ON translations(key_id);
CREATE INDEX IF NOT EXISTS idx_translations_locale ON translations(locale_code);
CREATE INDEX IF NOT EXISTS idx_content_translations_content ON content_translations(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_translations_locale ON content_translations(locale_code);
CREATE INDEX IF NOT EXISTS idx_translation_memory_source ON translation_memory(source_text, source_locale);
CREATE INDEX IF NOT EXISTS idx_translation_glossary_term ON translation_glossary(term, locale_code);

-- RLS Policies
ALTER TABLE supported_locales ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_locale_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_glossary ENABLE ROW LEVEL SECURITY;

-- Public read access for locales and translations
CREATE POLICY "supported_locales_select" ON supported_locales FOR SELECT USING (true);
CREATE POLICY "translation_keys_select" ON translation_keys FOR SELECT USING (true);
CREATE POLICY "translations_select" ON translations FOR SELECT USING (true);
CREATE POLICY "content_translations_select" ON content_translations FOR SELECT USING (true);
CREATE POLICY "translation_glossary_select" ON translation_glossary FOR SELECT USING (true);

-- User locale preferences
CREATE POLICY "user_locale_preferences_select" ON user_locale_preferences
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "user_locale_preferences_insert" ON user_locale_preferences
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_locale_preferences_update" ON user_locale_preferences
  FOR UPDATE USING (user_id = auth.uid());

-- Admin policies for translation management
CREATE POLICY "translation_keys_manage" ON translation_keys
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

CREATE POLICY "translations_manage" ON translations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'ATLVS_TEAM_MEMBER', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

CREATE POLICY "content_translations_manage" ON content_translations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'ATLVS_TEAM_MEMBER', 'COMPVSS_ADMIN', 'GVTEWAY_ADMIN', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

CREATE POLICY "translation_memory_manage" ON translation_memory
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

CREATE POLICY "translation_glossary_manage" ON translation_glossary
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

CREATE POLICY "supported_locales_manage" ON supported_locales
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['LEGEND_SUPER_ADMIN']::text[]
    )
  );

-- Seed supported locales
INSERT INTO supported_locales (locale_code, language_code, region_code, name, native_name, direction, is_default, sort_order) VALUES
  ('en-US', 'en', 'US', 'English (US)', 'English (US)', 'ltr', TRUE, 1),
  ('en-GB', 'en', 'GB', 'English (UK)', 'English (UK)', 'ltr', FALSE, 2),
  ('es-ES', 'es', 'ES', 'Spanish (Spain)', 'Español (España)', 'ltr', FALSE, 3),
  ('es-MX', 'es', 'MX', 'Spanish (Mexico)', 'Español (México)', 'ltr', FALSE, 4),
  ('fr-FR', 'fr', 'FR', 'French (France)', 'Français (France)', 'ltr', FALSE, 5),
  ('fr-CA', 'fr', 'CA', 'French (Canada)', 'Français (Canada)', 'ltr', FALSE, 6),
  ('de-DE', 'de', 'DE', 'German', 'Deutsch', 'ltr', FALSE, 7),
  ('it-IT', 'it', 'IT', 'Italian', 'Italiano', 'ltr', FALSE, 8),
  ('pt-BR', 'pt', 'BR', 'Portuguese (Brazil)', 'Português (Brasil)', 'ltr', FALSE, 9),
  ('pt-PT', 'pt', 'PT', 'Portuguese (Portugal)', 'Português (Portugal)', 'ltr', FALSE, 10),
  ('zh-CN', 'zh', 'CN', 'Chinese (Simplified)', '简体中文', 'ltr', FALSE, 11),
  ('zh-TW', 'zh', 'TW', 'Chinese (Traditional)', '繁體中文', 'ltr', FALSE, 12),
  ('ja-JP', 'ja', 'JP', 'Japanese', '日本語', 'ltr', FALSE, 13),
  ('ko-KR', 'ko', 'KR', 'Korean', '한국어', 'ltr', FALSE, 14),
  ('ar-SA', 'ar', 'SA', 'Arabic', 'العربية', 'rtl', FALSE, 15),
  ('he-IL', 'he', 'IL', 'Hebrew', 'עברית', 'rtl', FALSE, 16),
  ('ru-RU', 'ru', 'RU', 'Russian', 'Русский', 'ltr', FALSE, 17),
  ('nl-NL', 'nl', 'NL', 'Dutch', 'Nederlands', 'ltr', FALSE, 18),
  ('pl-PL', 'pl', 'PL', 'Polish', 'Polski', 'ltr', FALSE, 19),
  ('sv-SE', 'sv', 'SE', 'Swedish', 'Svenska', 'ltr', FALSE, 20)
ON CONFLICT (locale_code) DO NOTHING;

-- Function to get translation with fallback
CREATE OR REPLACE FUNCTION get_translation(
  p_key VARCHAR,
  p_locale VARCHAR,
  p_fallback_locale VARCHAR DEFAULT 'en-US'
)
RETURNS TEXT AS $$
DECLARE
  v_translation TEXT;
BEGIN
  -- Try to get translation for requested locale
  SELECT t.value INTO v_translation
  FROM translations t
  JOIN translation_keys tk ON tk.id = t.key_id
  WHERE tk.key = p_key AND t.locale_code = p_locale;
  
  -- If not found, try fallback locale
  IF v_translation IS NULL AND p_fallback_locale IS NOT NULL THEN
    SELECT t.value INTO v_translation
    FROM translations t
    JOIN translation_keys tk ON tk.id = t.key_id
    WHERE tk.key = p_key AND t.locale_code = p_fallback_locale;
  END IF;
  
  -- If still not found, return the key itself
  RETURN COALESCE(v_translation, p_key);
END;
$$ LANGUAGE plpgsql;

-- Function to get content translation with fallback
CREATE OR REPLACE FUNCTION get_content_translation(
  p_content_type VARCHAR,
  p_content_id UUID,
  p_field_name VARCHAR,
  p_locale VARCHAR,
  p_fallback_locale VARCHAR DEFAULT 'en-US'
)
RETURNS TEXT AS $$
DECLARE
  v_translation TEXT;
BEGIN
  -- Try to get translation for requested locale
  SELECT translated_value INTO v_translation
  FROM content_translations
  WHERE content_type = p_content_type 
    AND content_id = p_content_id 
    AND field_name = p_field_name 
    AND locale_code = p_locale;
  
  -- If not found, try fallback locale
  IF v_translation IS NULL AND p_fallback_locale IS NOT NULL THEN
    SELECT translated_value INTO v_translation
    FROM content_translations
    WHERE content_type = p_content_type 
      AND content_id = p_content_id 
      AND field_name = p_field_name 
      AND locale_code = p_fallback_locale;
  END IF;
  
  RETURN v_translation;
END;
$$ LANGUAGE plpgsql;
