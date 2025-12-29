-- Migration: Productions Schema Alignment
-- Description: Adds columns required by ATLVS frontend/API that are missing from productions table
-- This aligns the database schema with the API contract

-- Add missing columns to productions table
ALTER TABLE IF EXISTS productions 
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS tagline TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS format TEXT,
  ADD COLUMN IF NOT EXISTS genre TEXT,
  ADD COLUMN IF NOT EXISTS announcement_date DATE,
  ADD COLUMN IF NOT EXISTS on_sale_date DATE,
  ADD COLUMN IF NOT EXISTS preview_start DATE,
  ADD COLUMN IF NOT EXISTS opening_date DATE,
  ADD COLUMN IF NOT EXISTS closing_date DATE,
  ADD COLUMN IF NOT EXISTS capacity_per_show INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shows_per_day INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS runtime_minutes INT DEFAULT 90,
  ADD COLUMN IF NOT EXISTS operating_budget_weekly NUMERIC(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ticket_price_min NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ticket_price_max NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS projected_gross NUMERIC(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS break_even_percentage NUMERIC(5,2) DEFAULT 70,
  ADD COLUMN IF NOT EXISTS sponsorship_target NUMERIC(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS blueprint_id UUID;

-- Sync existing 'name' to 'title' for data consistency
UPDATE productions SET title = name WHERE title IS NULL AND name IS NOT NULL;

-- Create index on title for search performance
CREATE INDEX IF NOT EXISTS idx_productions_title ON productions(title);
CREATE INDEX IF NOT EXISTS idx_productions_format ON productions(format);
CREATE INDEX IF NOT EXISTS idx_productions_opening_date ON productions(opening_date);

-- Add format check constraint if column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'productions_format_check' AND table_name = 'productions'
  ) THEN
    ALTER TABLE productions ADD CONSTRAINT productions_format_check 
      CHECK (format IS NULL OR format IN ('immersive', 'festival', 'activation', 'installation', 'theater', 'concert', 'conference', 'corporate', 'private', 'other'));
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Constraint may already exist or column doesn't exist, ignore
  NULL;
END $$;

-- Comment on new columns
COMMENT ON COLUMN productions.title IS 'Display title for the production (synced from name)';
COMMENT ON COLUMN productions.tagline IS 'Marketing tagline for the production';
COMMENT ON COLUMN productions.format IS 'Production format type';
COMMENT ON COLUMN productions.genre IS 'Production genre';
COMMENT ON COLUMN productions.announcement_date IS 'Date production is announced publicly';
COMMENT ON COLUMN productions.on_sale_date IS 'Date tickets go on sale';
COMMENT ON COLUMN productions.preview_start IS 'Date preview performances begin';
COMMENT ON COLUMN productions.opening_date IS 'Official opening date';
COMMENT ON COLUMN productions.closing_date IS 'Final performance date';
COMMENT ON COLUMN productions.capacity_per_show IS 'Maximum audience capacity per show';
COMMENT ON COLUMN productions.shows_per_day IS 'Number of shows scheduled per day';
COMMENT ON COLUMN productions.runtime_minutes IS 'Duration of each show in minutes';
COMMENT ON COLUMN productions.operating_budget_weekly IS 'Weekly operating budget';
COMMENT ON COLUMN productions.ticket_price_min IS 'Minimum ticket price';
COMMENT ON COLUMN productions.ticket_price_max IS 'Maximum ticket price';
COMMENT ON COLUMN productions.projected_gross IS 'Projected gross revenue';
COMMENT ON COLUMN productions.break_even_percentage IS 'Required occupancy percentage to break even';
COMMENT ON COLUMN productions.sponsorship_target IS 'Target sponsorship revenue';
COMMENT ON COLUMN productions.blueprint_id IS 'Reference to AI-generated blueprint if created from generator';
