-- Seed Default Platform Themes
-- This migration adds default theme configurations for GVTEWAY, ATLVS, and COMPVSS

-- Create organizer_themes table if it doesn't exist
CREATE TABLE IF NOT EXISTS organizer_themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id UUID NOT NULL UNIQUE,
  platform VARCHAR(50) NOT NULL,

  -- Branding
  logo_url TEXT NOT NULL,
  primary_color VARCHAR(7) NOT NULL,
  secondary_color VARCHAR(7),
  accent_color VARCHAR(7),
  display_font VARCHAR(255),
  body_font VARCHAR(255),
  custom_domain VARCHAR(255),

  -- Features
  booking_enabled BOOLEAN DEFAULT true,
  reviews_enabled BOOLEAN DEFAULT true,
  social_sharing_enabled BOOLEAN DEFAULT true,
  chat_enabled BOOLEAN DEFAULT false,

  -- Content
  custom_nav_links JSONB,
  footer_content TEXT,
  legal_links JSONB,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on organizer_id
CREATE INDEX IF NOT EXISTS idx_organizer_themes_organizer ON organizer_themes(organizer_id);
CREATE INDEX IF NOT EXISTS idx_organizer_themes_platform ON organizer_themes(platform);

-- Insert GVTEWAY Default Theme
INSERT INTO organizer_themes (
  organizer_id,
  platform,
  logo_url,
  primary_color,
  secondary_color,
  accent_color,
  display_font,
  body_font,
  custom_domain,
  booking_enabled,
  reviews_enabled,
  social_sharing_enabled,
  chat_enabled,
  custom_nav_links,
  footer_content,
  legal_links
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'gvteway',
  '/assets/gvteway/logo.svg',
  '#7B68EE', -- Medium Purple
  '#49CCF9', -- Sky Blue
  '#10B981', -- Emerald Green
  'Outfit, sans-serif',
  'Inter, system-ui',
  'gvteway.com',
  true,
  true,
  true,
  false,
  '[
    {"id": "nav-1", "label": "Experiences", "href": "/experiences", "order": 1},
    {"id": "nav-2", "label": "Organizers", "href": "/organizers", "order": 2},
    {"id": "nav-3", "label": "How It Works", "href": "/how-it-works", "order": 3}
  ]'::jsonb,
  'GVTEWAY - Your Experience Marketplace',
  '[
    {"id": "legal-1", "type": "terms", "label": "Terms of Service", "href": "/legal/terms"},
    {"id": "legal-2", "type": "privacy", "label": "Privacy Policy", "href": "/legal/privacy"},
    {"id": "legal-3", "type": "refund", "label": "Refund Policy", "href": "/legal/refund"}
  ]'::jsonb
)
ON CONFLICT (organizer_id) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  primary_color = EXCLUDED.primary_color,
  secondary_color = EXCLUDED.secondary_color,
  accent_color = EXCLUDED.accent_color,
  updated_at = NOW();

-- Insert ATLVS Default Theme
INSERT INTO organizer_themes (
  organizer_id,
  platform,
  logo_url,
  primary_color,
  secondary_color,
  accent_color,
  display_font,
  body_font,
  custom_domain,
  booking_enabled,
  reviews_enabled,
  social_sharing_enabled,
  chat_enabled,
  custom_nav_links,
  footer_content,
  legal_links
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'atlvs',
  '/assets/atlvs/logo.svg',
  '#7B68EE', -- Medium Purple
  '#49CCF9', -- Sky Blue
  '#F59E0B', -- Amber
  'Anton, sans-serif',
  'Inter, system-ui',
  'atlvs.io',
  true,
  true,
  true,
  true,
  '[
    {"id": "nav-1", "label": "Packages", "href": "/packages", "order": 1},
    {"id": "nav-2", "label": "Solutions", "href": "/solutions", "order": 2},
    {"id": "nav-3", "label": "Pricing", "href": "/pricing", "order": 3}
  ]'::jsonb,
  'ATLVS - Your Business Operations Hub',
  '[
    {"id": "legal-1", "type": "terms", "label": "Terms of Service", "href": "/legal/terms"},
    {"id": "legal-2", "type": "privacy", "label": "Privacy Policy", "href": "/legal/privacy"}
  ]'::jsonb
)
ON CONFLICT (organizer_id) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  primary_color = EXCLUDED.primary_color,
  secondary_color = EXCLUDED.secondary_color,
  accent_color = EXCLUDED.accent_color,
  updated_at = NOW();

-- Insert COMPVSS Default Theme
INSERT INTO organizer_themes (
  organizer_id,
  platform,
  logo_url,
  primary_color,
  secondary_color,
  accent_color,
  display_font,
  body_font,
  custom_domain,
  booking_enabled,
  reviews_enabled,
  social_sharing_enabled,
  chat_enabled,
  custom_nav_links,
  footer_content,
  legal_links
) VALUES (
  '00000000-0000-0000-0000-000000000003',
  'compvss',
  '/assets/compvss/logo.svg',
  '#EF4444', -- Red
  '#3B82F6', -- Blue
  '#F59E0B', -- Amber
  'Bebas Neue, sans-serif',
  'Inter, system-ui',
  'compvss.com',
  true,
  true,
  true,
  true,
  '[
    {"id": "nav-1", "label": "Competitions", "href": "/competitions", "order": 1},
    {"id": "nav-2", "label": "Events", "href": "/events", "order": 2},
    {"id": "nav-3", "label": "Leaderboard", "href": "/leaderboard", "order": 3}
  ]'::jsonb,
  'COMPVSS - Competition Management Platform',
  '[
    {"id": "legal-1", "type": "terms", "label": "Terms of Service", "href": "/legal/terms"},
    {"id": "legal-2", "type": "privacy", "label": "Privacy Policy", "href": "/legal/privacy"}
  ]'::jsonb
)
ON CONFLICT (organizer_id) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  primary_color = EXCLUDED.primary_color,
  secondary_color = EXCLUDED.secondary_color,
  accent_color = EXCLUDED.accent_color,
  updated_at = NOW();

-- Add Row Level Security (RLS)
ALTER TABLE organizer_themes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read default themes
CREATE POLICY "Default themes are publicly readable"
  ON organizer_themes FOR SELECT
  USING (organizer_id IN (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003'
  ));

-- Policy: Organizers can view their own themes
CREATE POLICY "Organizers can view own themes"
  ON organizer_themes FOR SELECT
  USING (auth.uid() = organizer_id);

-- Policy: Organizers can update their own themes
CREATE POLICY "Organizers can update own themes"
  ON organizer_themes FOR UPDATE
  USING (auth.uid() = organizer_id);

-- Policy: Organizers can insert their own themes
CREATE POLICY "Organizers can insert own themes"
  ON organizer_themes FOR INSERT
  WITH CHECK (auth.uid() = organizer_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_organizer_themes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_organizer_themes_timestamp ON organizer_themes;
CREATE TRIGGER update_organizer_themes_timestamp
  BEFORE UPDATE ON organizer_themes
  FOR EACH ROW
  EXECUTE FUNCTION update_organizer_themes_updated_at();

-- Add comments
COMMENT ON TABLE organizer_themes IS 'Stores white-label theme configurations for organizers';
COMMENT ON COLUMN organizer_themes.organizer_id IS 'UUID of the organizer who owns this theme';
COMMENT ON COLUMN organizer_themes.platform IS 'Platform this theme is for (gvteway, atlvs, compvss)';
COMMENT ON COLUMN organizer_themes.primary_color IS 'Primary brand color in hex format';
