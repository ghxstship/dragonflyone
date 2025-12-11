-- Migration: 0045_saved_filters_views.sql
-- Description: Create saved_filters and saved_views tables for BACK-064
-- Created: 2024-12-10

-- ============================================================================
-- SAVED FILTERS TABLE
-- Stores user-defined filter presets for list pages
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.saved_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Filter identification
  name TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- e.g., 'contacts', 'invoices', 'crew', 'events'
  app TEXT NOT NULL CHECK (app IN ('atlvs', 'compvss', 'gvteway')),
  
  -- Filter configuration (JSONB for flexibility)
  conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Example: [{"field": "status", "operator": "equals", "value": "active"}]
  
  -- Sharing settings
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_default BOOLEAN NOT NULL DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT saved_filters_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
  CONSTRAINT saved_filters_entity_type_length CHECK (char_length(entity_type) >= 1 AND char_length(entity_type) <= 100)
);

-- Indexes for saved_filters
CREATE INDEX IF NOT EXISTS idx_saved_filters_user_id ON public.saved_filters(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_filters_organization_id ON public.saved_filters(organization_id);
CREATE INDEX IF NOT EXISTS idx_saved_filters_entity_type ON public.saved_filters(entity_type);
CREATE INDEX IF NOT EXISTS idx_saved_filters_app ON public.saved_filters(app);
CREATE INDEX IF NOT EXISTS idx_saved_filters_is_public ON public.saved_filters(is_public) WHERE is_public = true;

-- ============================================================================
-- SAVED VIEWS TABLE
-- Stores user-defined view configurations (columns, sort, etc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.saved_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- View identification
  name TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- e.g., 'contacts', 'invoices', 'crew', 'events'
  app TEXT NOT NULL CHECK (app IN ('atlvs', 'compvss', 'gvteway')),
  
  -- View configuration (JSONB for flexibility)
  visible_columns JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Example: ["id", "name", "email", "status", "created_at"]
  
  column_order JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Example: ["name", "status", "email", "created_at", "id"]
  
  column_widths JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Example: {"name": 200, "email": 250, "status": 100}
  
  sort_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Example: {"field": "created_at", "direction": "desc"}
  
  -- Optional: Link to a saved filter
  saved_filter_id UUID REFERENCES public.saved_filters(id) ON DELETE SET NULL,
  
  -- Sharing settings
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_default BOOLEAN NOT NULL DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT saved_views_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
  CONSTRAINT saved_views_entity_type_length CHECK (char_length(entity_type) >= 1 AND char_length(entity_type) <= 100)
);

-- Indexes for saved_views
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

-- Saved Filters RLS Policies
CREATE POLICY "Users can view their own saved filters"
  ON public.saved_filters FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public saved filters in their org"
  ON public.saved_filters FOR SELECT
  USING (is_public = true AND organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  ));

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

CREATE POLICY "Users can view public saved views in their org"
  ON public.saved_views FOR SELECT
  USING (is_public = true AND organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  ));

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
