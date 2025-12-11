-- Migration: Organization Custom Catalog System
-- Description: Enables organizations to duplicate global catalog items into custom/locked variations
-- Also includes catalog visibility settings and asset request permissions
-- Date: 2025-12-11

-- ============================================================================
-- ORGANIZATION CATALOG ITEMS TABLE
-- Stores custom/duplicated catalog items specific to an organization
-- ============================================================================

CREATE TABLE IF NOT EXISTS organization_catalog_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Reference to the original global catalog item (if duplicated from global)
  source_catalog_item_id UUID REFERENCES production_advancing_catalog(id) ON DELETE SET NULL,
  
  -- Core item details (can be customized from source)
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  
  -- Pricing (can override global pricing)
  base_price_low DECIMAL(12,2),
  base_price_high DECIMAL(12,2),
  standard_unit TEXT NOT NULL DEFAULT 'Per Unit',
  
  -- Industry and procurement settings
  industry_verticals TEXT[] DEFAULT ARRAY['universal']::TEXT[],
  procurement_type TEXT DEFAULT 'purchase',
  
  -- Custom fields for organization-specific data
  custom_fields JSONB DEFAULT '{}'::JSONB,
  internal_notes TEXT,
  preferred_vendors UUID[] DEFAULT ARRAY[]::UUID[],
  
  -- Lock settings
  is_locked BOOLEAN DEFAULT FALSE,
  locked_by UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  locked_at TIMESTAMPTZ,
  lock_reason TEXT,
  
  -- Visibility and status
  enabled BOOLEAN DEFAULT TRUE,
  is_preferred BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  
  -- Audit fields
  created_by UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for organization catalog items
CREATE INDEX IF NOT EXISTS idx_org_catalog_items_org ON organization_catalog_items(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_catalog_items_source ON organization_catalog_items(source_catalog_item_id);
CREATE INDEX IF NOT EXISTS idx_org_catalog_items_category ON organization_catalog_items(category);
CREATE INDEX IF NOT EXISTS idx_org_catalog_items_enabled ON organization_catalog_items(enabled) WHERE enabled = TRUE;
CREATE UNIQUE INDEX IF NOT EXISTS idx_org_catalog_items_org_item_id ON organization_catalog_items(organization_id, item_id);

-- ============================================================================
-- CATALOG VISIBILITY SETTINGS TABLE
-- Controls catalog visibility at project/team/workspace/user levels
-- ============================================================================

CREATE TABLE IF NOT EXISTS catalog_visibility_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Scope of the visibility setting
  scope_type TEXT NOT NULL CHECK (scope_type IN ('organization', 'project', 'team', 'workspace', 'user')),
  scope_id UUID, -- References the specific project/team/workspace/user (NULL for org-wide)
  
  -- What this setting applies to
  target_type TEXT NOT NULL CHECK (target_type IN ('category', 'subcategory', 'item', 'procurement_type')),
  target_value TEXT NOT NULL, -- Category name, item ID, etc.
  
  -- Visibility control
  is_visible BOOLEAN DEFAULT TRUE,
  is_requestable BOOLEAN DEFAULT TRUE,
  requires_approval BOOLEAN DEFAULT FALSE,
  approval_role TEXT,
  
  -- Budget controls
  max_quantity_per_request INTEGER,
  max_value_per_request DECIMAL(12,2),
  budget_period TEXT CHECK (budget_period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'per_project')),
  budget_limit DECIMAL(12,2),
  
  -- Metadata
  notes TEXT,
  created_by UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for catalog visibility settings
CREATE INDEX IF NOT EXISTS idx_catalog_visibility_org ON catalog_visibility_settings(organization_id);
CREATE INDEX IF NOT EXISTS idx_catalog_visibility_scope ON catalog_visibility_settings(scope_type, scope_id);
CREATE INDEX IF NOT EXISTS idx_catalog_visibility_target ON catalog_visibility_settings(target_type, target_value);

-- ============================================================================
-- ASSET REQUEST PERMISSIONS TABLE
-- Fine-grained control over who can request specific asset categories
-- ============================================================================

CREATE TABLE IF NOT EXISTS asset_request_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- What this permission applies to
  category TEXT NOT NULL,
  subcategory TEXT,
  
  -- Who can request
  allowed_roles TEXT[] NOT NULL DEFAULT ARRAY['COMPVSS_TEAM_MEMBER']::TEXT[],
  allowed_user_ids UUID[] DEFAULT ARRAY[]::UUID[],
  denied_user_ids UUID[] DEFAULT ARRAY[]::UUID[],
  
  -- Request limits
  max_quantity INTEGER,
  max_value DECIMAL(12,2),
  requires_justification BOOLEAN DEFAULT FALSE,
  justification_min_length INTEGER DEFAULT 0,
  
  -- Approval workflow
  auto_approve_below_value DECIMAL(12,2),
  approval_chain TEXT[] DEFAULT ARRAY[]::TEXT[],
  escalation_after_hours INTEGER DEFAULT 48,
  
  -- Time restrictions
  request_window_start TIME,
  request_window_end TIME,
  blackout_dates DATE[] DEFAULT ARRAY[]::DATE[],
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_by UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for asset request permissions
CREATE INDEX IF NOT EXISTS idx_asset_request_perms_org ON asset_request_permissions(organization_id);
CREATE INDEX IF NOT EXISTS idx_asset_request_perms_category ON asset_request_permissions(category);
CREATE INDEX IF NOT EXISTS idx_asset_request_perms_active ON asset_request_permissions(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Organization Catalog Items RLS
ALTER TABLE organization_catalog_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org_catalog_items_select" ON organization_catalog_items;
CREATE POLICY "org_catalog_items_select" ON organization_catalog_items
  FOR SELECT USING (
    org_matches(organization_id)
  );

DROP POLICY IF EXISTS "org_catalog_items_insert" ON organization_catalog_items;
CREATE POLICY "org_catalog_items_insert" ON organization_catalog_items
  FOR INSERT WITH CHECK (
    org_matches(organization_id)
    AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

DROP POLICY IF EXISTS "org_catalog_items_update" ON organization_catalog_items;
CREATE POLICY "org_catalog_items_update" ON organization_catalog_items
  FOR UPDATE USING (
    org_matches(organization_id)
    AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

DROP POLICY IF EXISTS "org_catalog_items_delete" ON organization_catalog_items;
CREATE POLICY "org_catalog_items_delete" ON organization_catalog_items
  FOR DELETE USING (
    org_matches(organization_id)
    AND role_in('ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

-- Catalog Visibility Settings RLS
ALTER TABLE catalog_visibility_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "catalog_visibility_select" ON catalog_visibility_settings;
CREATE POLICY "catalog_visibility_select" ON catalog_visibility_settings
  FOR SELECT USING (
    org_matches(organization_id)
  );

DROP POLICY IF EXISTS "catalog_visibility_manage" ON catalog_visibility_settings;
CREATE POLICY "catalog_visibility_manage" ON catalog_visibility_settings
  FOR ALL USING (
    org_matches(organization_id)
    AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

-- Asset Request Permissions RLS
ALTER TABLE asset_request_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "asset_request_perms_select" ON asset_request_permissions;
CREATE POLICY "asset_request_perms_select" ON asset_request_permissions
  FOR SELECT USING (
    org_matches(organization_id)
  );

DROP POLICY IF EXISTS "asset_request_perms_manage" ON asset_request_permissions;
CREATE POLICY "asset_request_perms_manage" ON asset_request_permissions
  FOR ALL USING (
    org_matches(organization_id)
    AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to duplicate a global catalog item to an organization's custom catalog
CREATE OR REPLACE FUNCTION duplicate_catalog_item_to_org(
  p_source_item_id UUID,
  p_organization_id UUID,
  p_custom_item_id TEXT DEFAULT NULL,
  p_custom_name TEXT DEFAULT NULL,
  p_is_locked BOOLEAN DEFAULT FALSE,
  p_created_by UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_source_item RECORD;
  v_new_item_id UUID;
  v_item_id TEXT;
BEGIN
  -- Get the source item
  SELECT * INTO v_source_item
  FROM production_advancing_catalog
  WHERE id = p_source_item_id AND enabled = TRUE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Source catalog item not found or disabled';
  END IF;
  
  -- Generate item ID if not provided
  v_item_id := COALESCE(p_custom_item_id, 'ORG-' || v_source_item.item_id);
  
  -- Check if item already exists for this org
  IF EXISTS (
    SELECT 1 FROM organization_catalog_items 
    WHERE organization_id = p_organization_id AND item_id = v_item_id
  ) THEN
    RAISE EXCEPTION 'Item with ID % already exists for this organization', v_item_id;
  END IF;
  
  -- Insert the duplicated item
  INSERT INTO organization_catalog_items (
    organization_id,
    source_catalog_item_id,
    item_id,
    item_name,
    description,
    category,
    subcategory,
    base_price_low,
    base_price_high,
    standard_unit,
    industry_verticals,
    procurement_type,
    is_locked,
    locked_by,
    locked_at,
    created_by
  )
  VALUES (
    p_organization_id,
    p_source_item_id,
    v_item_id,
    COALESCE(p_custom_name, v_source_item.item_name),
    v_source_item.description,
    v_source_item.category,
    v_source_item.subcategory,
    v_source_item.base_price_low,
    v_source_item.base_price_high,
    v_source_item.standard_unit,
    v_source_item.industry_verticals,
    v_source_item.procurement_type,
    p_is_locked,
    CASE WHEN p_is_locked THEN p_created_by ELSE NULL END,
    CASE WHEN p_is_locked THEN NOW() ELSE NULL END,
    p_created_by
  )
  RETURNING id INTO v_new_item_id;
  
  RETURN v_new_item_id;
END;
$$;

-- Function to check if a user can request a specific category
CREATE OR REPLACE FUNCTION can_request_category(
  p_user_id UUID,
  p_organization_id UUID,
  p_category TEXT,
  p_subcategory TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_permission RECORD;
  v_user_roles TEXT[];
BEGIN
  -- Get user's roles
  SELECT ARRAY_AGG(role_name) INTO v_user_roles
  FROM user_roles ur
  JOIN role_definitions rd ON ur.role_id = rd.id
  WHERE ur.user_id = p_user_id;
  
  -- Check for explicit permission
  SELECT * INTO v_permission
  FROM asset_request_permissions
  WHERE organization_id = p_organization_id
    AND category = p_category
    AND (subcategory IS NULL OR subcategory = p_subcategory)
    AND is_active = TRUE
  ORDER BY subcategory NULLS LAST
  LIMIT 1;
  
  -- If no permission record exists, allow by default
  IF NOT FOUND THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user is explicitly denied
  IF p_user_id = ANY(v_permission.denied_user_ids) THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user is explicitly allowed
  IF p_user_id = ANY(v_permission.allowed_user_ids) THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user has an allowed role
  IF v_user_roles && v_permission.allowed_roles THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Function to get effective catalog for an organization (global + org-specific)
CREATE OR REPLACE FUNCTION get_effective_catalog(
  p_organization_id UUID,
  p_category TEXT DEFAULT NULL,
  p_include_global BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
  id UUID,
  item_id TEXT,
  item_name TEXT,
  description TEXT,
  category TEXT,
  subcategory TEXT,
  base_price_low DECIMAL,
  base_price_high DECIMAL,
  standard_unit TEXT,
  source_type TEXT,
  is_locked BOOLEAN,
  is_preferred BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  -- Organization-specific items (take precedence)
  SELECT 
    oci.id,
    oci.item_id,
    oci.item_name,
    oci.description,
    oci.category,
    oci.subcategory,
    oci.base_price_low,
    oci.base_price_high,
    oci.standard_unit,
    'organization'::TEXT AS source_type,
    oci.is_locked,
    oci.is_preferred
  FROM organization_catalog_items oci
  WHERE oci.organization_id = p_organization_id
    AND oci.enabled = TRUE
    AND (p_category IS NULL OR oci.category = p_category)
  
  UNION ALL
  
  -- Global catalog items (if not overridden by org-specific)
  SELECT 
    pac.id,
    pac.item_id,
    pac.item_name,
    pac.description,
    pac.category,
    pac.subcategory,
    pac.base_price_low,
    pac.base_price_high,
    pac.standard_unit,
    'global'::TEXT AS source_type,
    FALSE AS is_locked,
    FALSE AS is_preferred
  FROM production_advancing_catalog pac
  WHERE pac.enabled = TRUE
    AND p_include_global = TRUE
    AND (p_category IS NULL OR pac.category = p_category)
    AND NOT EXISTS (
      SELECT 1 FROM organization_catalog_items oci2
      WHERE oci2.organization_id = p_organization_id
        AND oci2.source_catalog_item_id = pac.id
        AND oci2.enabled = TRUE
    )
  
  ORDER BY category, subcategory, item_name;
END;
$$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamp trigger for organization_catalog_items
CREATE OR REPLACE FUNCTION update_org_catalog_items_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_org_catalog_items_updated ON organization_catalog_items;
CREATE TRIGGER trg_org_catalog_items_updated
  BEFORE UPDATE ON organization_catalog_items
  FOR EACH ROW
  EXECUTE FUNCTION update_org_catalog_items_timestamp();

DROP TRIGGER IF EXISTS trg_catalog_visibility_updated ON catalog_visibility_settings;
CREATE TRIGGER trg_catalog_visibility_updated
  BEFORE UPDATE ON catalog_visibility_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_org_catalog_items_timestamp();

DROP TRIGGER IF EXISTS trg_asset_request_perms_updated ON asset_request_permissions;
CREATE TRIGGER trg_asset_request_perms_updated
  BEFORE UPDATE ON asset_request_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_org_catalog_items_timestamp();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE organization_catalog_items IS 'Organization-specific catalog items, either custom or duplicated from global catalog';
COMMENT ON TABLE catalog_visibility_settings IS 'Controls catalog visibility at project/team/workspace/user levels';
COMMENT ON TABLE asset_request_permissions IS 'Fine-grained permissions for who can request specific asset categories';
COMMENT ON FUNCTION duplicate_catalog_item_to_org IS 'Duplicates a global catalog item to an organization custom catalog';
COMMENT ON FUNCTION can_request_category IS 'Checks if a user can request items from a specific category';
COMMENT ON FUNCTION get_effective_catalog IS 'Returns the effective catalog for an organization (global + org-specific)';
