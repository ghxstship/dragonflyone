-- Migration: Advance Templates Enhancement
-- Description: Enhances advance_templates table and adds template items table
-- Date: 2025-12-11

-- ============================================================================
-- ENHANCE ADVANCE_TEMPLATES TABLE
-- Add additional fields for better template management
-- ============================================================================

-- Add new columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'advance_templates' AND column_name = 'template_type') THEN
    ALTER TABLE advance_templates ADD COLUMN template_type TEXT DEFAULT 'reorder' CHECK (template_type IN ('reorder', 'standard', 'emergency', 'event_specific', 'department'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'advance_templates' AND column_name = 'usage_count') THEN
    ALTER TABLE advance_templates ADD COLUMN usage_count INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'advance_templates' AND column_name = 'last_used_at') THEN
    ALTER TABLE advance_templates ADD COLUMN last_used_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'advance_templates' AND column_name = 'tags') THEN
    ALTER TABLE advance_templates ADD COLUMN tags TEXT[] DEFAULT ARRAY[]::TEXT[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'advance_templates' AND column_name = 'estimated_cost') THEN
    ALTER TABLE advance_templates ADD COLUMN estimated_cost DECIMAL(12,2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'advance_templates' AND column_name = 'project_id') THEN
    ALTER TABLE advance_templates ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'advance_templates' AND column_name = 'team_id') THEN
    ALTER TABLE advance_templates ADD COLUMN team_id UUID;
  END IF;
END $$;

-- ============================================================================
-- TEMPLATE ITEMS TABLE
-- Stores the individual items within a template
-- ============================================================================

CREATE TABLE IF NOT EXISTS advance_template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES advance_templates(id) ON DELETE CASCADE,
  
  -- Item reference (can be global catalog, org catalog, or custom)
  catalog_item_id UUID REFERENCES production_advancing_catalog(id) ON DELETE SET NULL,
  org_catalog_item_id UUID REFERENCES organization_catalog_items(id) ON DELETE SET NULL,
  
  -- Item details (stored for custom items or as snapshot)
  item_name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  subcategory TEXT,
  
  -- Quantity and pricing
  default_quantity INTEGER NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'Per Unit',
  estimated_unit_cost DECIMAL(12,2),
  
  -- Item settings
  is_required BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  notes TEXT,
  display_order INTEGER DEFAULT 0,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for template items
CREATE INDEX IF NOT EXISTS idx_template_items_template ON advance_template_items(template_id);
CREATE INDEX IF NOT EXISTS idx_template_items_catalog ON advance_template_items(catalog_item_id);
CREATE INDEX IF NOT EXISTS idx_template_items_org_catalog ON advance_template_items(org_catalog_item_id);

-- ============================================================================
-- USER TEMPLATE FAVORITES TABLE
-- Tracks which templates users have favorited
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_template_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES advance_templates(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, template_id)
);

CREATE INDEX IF NOT EXISTS idx_user_template_favorites_user ON user_template_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_template_favorites_template ON user_template_favorites(template_id);

-- ============================================================================
-- ADD TEMPLATE_ID TO PRODUCTION_ADVANCES IF NOT EXISTS
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'production_advances' AND column_name = 'template_id') THEN
    ALTER TABLE production_advances ADD COLUMN template_id UUID REFERENCES advance_templates(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_production_advances_template ON production_advances(template_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Template Items RLS
ALTER TABLE advance_template_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "template_items_select" ON advance_template_items;
CREATE POLICY "template_items_select" ON advance_template_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM advance_templates at
      WHERE at.id = template_id
      AND (
        org_matches(at.organization_id) 
        OR at.is_global = TRUE
      )
    )
  );

DROP POLICY IF EXISTS "template_items_manage" ON advance_template_items;
CREATE POLICY "template_items_manage" ON advance_template_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM advance_templates at
      WHERE at.id = template_id
      AND org_matches(at.organization_id)
      AND role_in('COMPVSS_ADMIN', 'COMPVSS_SUPER_ADMIN', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
    )
  );

-- User Template Favorites RLS
ALTER TABLE user_template_favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_favorites_own" ON user_template_favorites;
CREATE POLICY "user_favorites_own" ON user_template_favorites
  FOR ALL USING (user_id = current_platform_user_id());

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to create an advance from a template
CREATE OR REPLACE FUNCTION create_advance_from_template(
  p_template_id UUID,
  p_organization_id UUID,
  p_project_id UUID DEFAULT NULL,
  p_team_workspace TEXT DEFAULT NULL,
  p_activation_name TEXT DEFAULT NULL,
  p_submitter_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_template RECORD;
  v_advance_id UUID;
  v_total_cost DECIMAL(12,2) := 0;
BEGIN
  -- Get the template
  SELECT * INTO v_template
  FROM advance_templates
  WHERE id = p_template_id AND is_active = TRUE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template not found or inactive';
  END IF;
  
  -- Calculate total estimated cost from template items
  SELECT COALESCE(SUM(default_quantity * COALESCE(estimated_unit_cost, 0)), 0)
  INTO v_total_cost
  FROM advance_template_items
  WHERE template_id = p_template_id;
  
  -- Create the advance
  INSERT INTO production_advances (
    organization_id,
    project_id,
    team_workspace,
    activation_name,
    submitter_id,
    status,
    estimated_cost,
    currency,
    template_id
  )
  VALUES (
    p_organization_id,
    p_project_id,
    COALESCE(p_team_workspace, v_template.name),
    p_activation_name,
    p_submitter_id,
    'draft',
    v_total_cost,
    'USD',
    p_template_id
  )
  RETURNING id INTO v_advance_id;
  
  -- Copy template items to advance items
  INSERT INTO production_advance_items (
    advance_id,
    catalog_item_id,
    item_name,
    description,
    quantity,
    unit,
    unit_cost,
    total_cost,
    notes
  )
  SELECT
    v_advance_id,
    ati.catalog_item_id,
    ati.item_name,
    ati.description,
    ati.default_quantity,
    ati.unit,
    ati.estimated_unit_cost,
    ati.default_quantity * COALESCE(ati.estimated_unit_cost, 0),
    ati.notes
  FROM advance_template_items ati
  WHERE ati.template_id = p_template_id
  ORDER BY ati.display_order;
  
  -- Update template usage stats
  UPDATE advance_templates
  SET usage_count = usage_count + 1,
      last_used_at = NOW()
  WHERE id = p_template_id;
  
  RETURN v_advance_id;
END;
$$;

-- Function to create a template from an existing advance
CREATE OR REPLACE FUNCTION create_template_from_advance(
  p_advance_id UUID,
  p_template_name TEXT,
  p_description TEXT DEFAULT NULL,
  p_category TEXT DEFAULT NULL,
  p_is_global BOOLEAN DEFAULT FALSE,
  p_created_by UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_advance RECORD;
  v_template_id UUID;
BEGIN
  -- Get the advance
  SELECT * INTO v_advance
  FROM production_advances
  WHERE id = p_advance_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Advance not found';
  END IF;
  
  -- Create the template
  INSERT INTO advance_templates (
    organization_id,
    name,
    description,
    category,
    is_global,
    is_active,
    created_by,
    project_id,
    estimated_cost
  )
  VALUES (
    v_advance.organization_id,
    p_template_name,
    p_description,
    p_category,
    p_is_global,
    TRUE,
    p_created_by,
    v_advance.project_id,
    v_advance.estimated_cost
  )
  RETURNING id INTO v_template_id;
  
  -- Copy advance items to template items
  INSERT INTO advance_template_items (
    template_id,
    catalog_item_id,
    item_name,
    description,
    category,
    default_quantity,
    unit,
    estimated_unit_cost,
    notes,
    display_order
  )
  SELECT
    v_template_id,
    pai.catalog_item_id,
    pai.item_name,
    pai.description,
    pac.category,
    pai.quantity,
    pai.unit,
    pai.unit_cost,
    pai.notes,
    ROW_NUMBER() OVER (ORDER BY pai.created_at)
  FROM production_advance_items pai
  LEFT JOIN production_advancing_catalog pac ON pai.catalog_item_id = pac.id
  WHERE pai.advance_id = p_advance_id;
  
  RETURN v_template_id;
END;
$$;

-- Function to get templates for a user (including favorites)
CREATE OR REPLACE FUNCTION get_user_templates(
  p_user_id UUID,
  p_organization_id UUID,
  p_category TEXT DEFAULT NULL,
  p_include_global BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  category TEXT,
  template_type TEXT,
  is_global BOOLEAN,
  is_favorite BOOLEAN,
  usage_count INTEGER,
  last_used_at TIMESTAMPTZ,
  estimated_cost DECIMAL,
  item_count BIGINT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    at.id,
    at.name,
    at.description,
    at.category,
    at.template_type,
    at.is_global,
    COALESCE(utf.id IS NOT NULL, FALSE) AS is_favorite,
    at.usage_count,
    at.last_used_at,
    at.estimated_cost,
    (SELECT COUNT(*) FROM advance_template_items ati WHERE ati.template_id = at.id) AS item_count,
    at.created_at
  FROM advance_templates at
  LEFT JOIN user_template_favorites utf ON utf.template_id = at.id AND utf.user_id = p_user_id
  WHERE at.is_active = TRUE
    AND (
      at.organization_id = p_organization_id
      OR (at.is_global = TRUE AND p_include_global = TRUE)
    )
    AND (p_category IS NULL OR at.category = p_category)
  ORDER BY 
    COALESCE(utf.id IS NOT NULL, FALSE) DESC,
    at.usage_count DESC,
    at.name;
END;
$$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_template_items_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_template_items_updated ON advance_template_items;
CREATE TRIGGER trg_template_items_updated
  BEFORE UPDATE ON advance_template_items
  FOR EACH ROW
  EXECUTE FUNCTION update_template_items_timestamp();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE advance_template_items IS 'Individual items within an advance template';
COMMENT ON TABLE user_template_favorites IS 'User favorites for advance templates';
COMMENT ON FUNCTION create_advance_from_template IS 'Creates a new advance from a template with all items';
COMMENT ON FUNCTION create_template_from_advance IS 'Creates a reusable template from an existing advance';
COMMENT ON FUNCTION get_user_templates IS 'Gets templates available to a user including favorites';
