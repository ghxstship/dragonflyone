-- Migration: 0174_saved_filters_views.sql
-- Description: Add organization_id and app columns to saved_filters and create saved_views table for BACK-064
-- Created: 2024-12-11

-- ============================================================================
-- ADD MISSING COLUMNS TO SAVED FILTERS TABLE
-- ============================================================================

-- Add organization_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'saved_filters' 
    AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE public.saved_filters 
    ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add app column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'saved_filters' 
    AND column_name = 'app'
  ) THEN
    ALTER TABLE public.saved_filters 
    ADD COLUMN app TEXT DEFAULT 'atlvs' CHECK (app IN ('atlvs', 'compvss', 'gvteway'));
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_saved_filters_organization_id ON public.saved_filters(organization_id);
CREATE INDEX IF NOT EXISTS idx_saved_filters_user_id ON public.saved_filters(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_filters_entity_type ON public.saved_filters(entity_type);
CREATE INDEX IF NOT EXISTS idx_saved_filters_app ON public.saved_filters(app);
CREATE INDEX IF NOT EXISTS idx_saved_filters_is_public ON public.saved_filters(is_public) WHERE is_public = true;

-- ============================================================================
-- ADD MISSING COLUMNS TO SAVED VIEWS TABLE
-- ============================================================================

-- Add organization_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'saved_views' 
    AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE public.saved_views 
    ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add app column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'saved_views' 
    AND column_name = 'app'
  ) THEN
    ALTER TABLE public.saved_views 
    ADD COLUMN app TEXT DEFAULT 'atlvs' CHECK (app IN ('atlvs', 'compvss', 'gvteway'));
  END IF;
END $$;

-- Add saved_filter_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'saved_views' 
    AND column_name = 'saved_filter_id'
  ) THEN
    ALTER TABLE public.saved_views 
    ADD COLUMN saved_filter_id UUID REFERENCES public.saved_filters(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add sort_config column if it doesn't exist (remote uses sort_by/sort_order instead)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'saved_views' 
    AND column_name = 'sort_config'
  ) THEN
    ALTER TABLE public.saved_views 
    ADD COLUMN sort_config JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_saved_views_user_id ON public.saved_views(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_views_organization_id ON public.saved_views(organization_id);
CREATE INDEX IF NOT EXISTS idx_saved_views_entity_type ON public.saved_views(entity_type);
CREATE INDEX IF NOT EXISTS idx_saved_views_app ON public.saved_views(app);
CREATE INDEX IF NOT EXISTS idx_saved_views_is_public ON public.saved_views(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_saved_views_saved_filter_id ON public.saved_views(saved_filter_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.saved_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_views ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own saved filters" ON public.saved_filters;
DROP POLICY IF EXISTS "Users can view public saved filters" ON public.saved_filters;
DROP POLICY IF EXISTS "Users can view public saved filters in their org" ON public.saved_filters;
DROP POLICY IF EXISTS "Users can create their own saved filters" ON public.saved_filters;
DROP POLICY IF EXISTS "Users can update their own saved filters" ON public.saved_filters;
DROP POLICY IF EXISTS "Users can delete their own saved filters" ON public.saved_filters;

DROP POLICY IF EXISTS "Users can view their own saved views" ON public.saved_views;
DROP POLICY IF EXISTS "Users can view public saved views" ON public.saved_views;
DROP POLICY IF EXISTS "Users can view public saved views in their org" ON public.saved_views;
DROP POLICY IF EXISTS "Users can create their own saved views" ON public.saved_views;
DROP POLICY IF EXISTS "Users can update their own saved views" ON public.saved_views;
DROP POLICY IF EXISTS "Users can delete their own saved views" ON public.saved_views;

-- Saved Filters RLS Policies
CREATE POLICY "Users can view their own saved filters"
  ON public.saved_filters FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public saved filters"
  ON public.saved_filters FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can create their own saved filters"
  ON public.saved_filters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved filters"
  ON public.saved_filters FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved filters"
  ON public.saved_filters FOR DELETE
  USING (auth.uid() = user_id);

-- Saved Views RLS Policies
CREATE POLICY "Users can view their own saved views"
  ON public.saved_views FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public saved views"
  ON public.saved_views FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can create their own saved views"
  ON public.saved_views FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved views"
  ON public.saved_views FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved views"
  ON public.saved_views FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS FOR updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_saved_filters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_saved_views_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_saved_filters_updated_at ON public.saved_filters;
CREATE TRIGGER trigger_saved_filters_updated_at
  BEFORE UPDATE ON public.saved_filters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_saved_filters_updated_at();

DROP TRIGGER IF EXISTS trigger_saved_views_updated_at ON public.saved_views;
CREATE TRIGGER trigger_saved_views_updated_at
  BEFORE UPDATE ON public.saved_views
  FOR EACH ROW
  EXECUTE FUNCTION public.update_saved_views_updated_at();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.saved_filters IS 'User-defined filter presets for list pages';
COMMENT ON TABLE public.saved_views IS 'User-defined view configurations (columns, sort, etc.)';

COMMENT ON COLUMN public.saved_filters.conditions IS 'JSONB array of filter conditions: [{field, operator, value}]';
COMMENT ON COLUMN public.saved_views.visible_columns IS 'JSONB array of column IDs to display';
COMMENT ON COLUMN public.saved_views.column_order IS 'JSONB array of column IDs in display order';
COMMENT ON COLUMN public.saved_views.column_widths IS 'JSONB object mapping column IDs to pixel widths';
COMMENT ON COLUMN public.saved_views.sort_config IS 'JSONB object with field and direction for sorting';
