// ============================================================================
// ORGANIZATION CATALOG TYPES
// Types for organization-specific catalog items and visibility settings
// ============================================================================

import type { IndustryVertical, ProcurementType } from './advancing';

export interface OrganizationCatalogItem {
  id: string;
  organization_id: string;
  source_catalog_item_id: string | null;
  item_id: string;
  item_name: string;
  description: string | null;
  category: string;
  subcategory: string | null;
  base_price_low: number | null;
  base_price_high: number | null;
  standard_unit: string;
  industry_verticals: IndustryVertical[];
  procurement_type: ProcurementType;
  custom_fields: Record<string, unknown>;
  internal_notes: string | null;
  preferred_vendors: string[];
  is_locked: boolean;
  locked_by: string | null;
  locked_at: string | null;
  lock_reason: string | null;
  enabled: boolean;
  is_preferred: boolean;
  display_order: number;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateOrgCatalogItemPayload {
  source_catalog_item_id?: string;
  item_id?: string;
  item_name: string;
  description?: string;
  category: string;
  subcategory?: string;
  base_price_low?: number;
  base_price_high?: number;
  standard_unit?: string;
  industry_verticals?: IndustryVertical[];
  procurement_type?: ProcurementType;
  custom_fields?: Record<string, unknown>;
  internal_notes?: string;
  is_locked?: boolean;
  lock_reason?: string;
}

export interface UpdateOrgCatalogItemPayload {
  item_name?: string;
  description?: string;
  base_price_low?: number;
  base_price_high?: number;
  standard_unit?: string;
  custom_fields?: Record<string, unknown>;
  internal_notes?: string;
  is_locked?: boolean;
  lock_reason?: string;
  enabled?: boolean;
  is_preferred?: boolean;
  display_order?: number;
}

// ============================================================================
// CATALOG VISIBILITY TYPES
// ============================================================================

export type VisibilityScopeType = 'organization' | 'project' | 'team' | 'workspace' | 'user';
export type VisibilityTargetType = 'category' | 'subcategory' | 'item' | 'procurement_type';
export type BudgetPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'per_project';

export interface CatalogVisibilitySetting {
  id: string;
  organization_id: string;
  scope_type: VisibilityScopeType;
  scope_id: string | null;
  target_type: VisibilityTargetType;
  target_value: string;
  is_visible: boolean;
  is_requestable: boolean;
  requires_approval: boolean;
  approval_role: string | null;
  max_quantity_per_request: number | null;
  max_value_per_request: number | null;
  budget_period: BudgetPeriod | null;
  budget_limit: number | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateVisibilitySettingPayload {
  scope_type: VisibilityScopeType;
  scope_id?: string;
  target_type: VisibilityTargetType;
  target_value: string;
  is_visible?: boolean;
  is_requestable?: boolean;
  requires_approval?: boolean;
  approval_role?: string;
  max_quantity_per_request?: number;
  max_value_per_request?: number;
  budget_period?: BudgetPeriod;
  budget_limit?: number;
  notes?: string;
}

export interface UpdateVisibilitySettingPayload {
  is_visible?: boolean;
  is_requestable?: boolean;
  requires_approval?: boolean;
  approval_role?: string;
  max_quantity_per_request?: number;
  max_value_per_request?: number;
  budget_period?: BudgetPeriod;
  budget_limit?: number;
  notes?: string;
}

// ============================================================================
// ASSET REQUEST PERMISSION TYPES
// ============================================================================

export interface AssetRequestPermission {
  id: string;
  organization_id: string;
  category: string;
  subcategory: string | null;
  allowed_roles: string[];
  allowed_user_ids: string[];
  denied_user_ids: string[];
  max_quantity: number | null;
  max_value: number | null;
  requires_justification: boolean;
  justification_min_length: number;
  auto_approve_below_value: number | null;
  approval_chain: string[];
  escalation_after_hours: number;
  request_window_start: string | null;
  request_window_end: string | null;
  blackout_dates: string[];
  is_active: boolean;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAssetPermissionPayload {
  category: string;
  subcategory?: string;
  allowed_roles?: string[];
  allowed_user_ids?: string[];
  denied_user_ids?: string[];
  max_quantity?: number;
  max_value?: number;
  requires_justification?: boolean;
  justification_min_length?: number;
  auto_approve_below_value?: number;
  approval_chain?: string[];
  escalation_after_hours?: number;
  request_window_start?: string;
  request_window_end?: string;
  blackout_dates?: string[];
  notes?: string;
}

export interface UpdateAssetPermissionPayload {
  allowed_roles?: string[];
  allowed_user_ids?: string[];
  denied_user_ids?: string[];
  max_quantity?: number;
  max_value?: number;
  requires_justification?: boolean;
  justification_min_length?: number;
  auto_approve_below_value?: number;
  approval_chain?: string[];
  escalation_after_hours?: number;
  request_window_start?: string;
  request_window_end?: string;
  blackout_dates?: string[];
  is_active?: boolean;
  notes?: string;
}

// ============================================================================
// ADVANCE TEMPLATE TYPES
// ============================================================================

export type TemplateType = 'reorder' | 'standard' | 'emergency' | 'event_specific' | 'department';

export interface AdvanceTemplate {
  id: string;
  organization_id: string | null;
  name: string;
  description: string | null;
  category: string | null;
  template_type: TemplateType;
  default_items: AdvanceTemplateItemData[];
  is_global: boolean;
  is_active: boolean;
  is_favorite: boolean;
  usage_count: number;
  last_used_at: string | null;
  tags: string[];
  estimated_cost: number | null;
  project_id: string | null;
  team_id: string | null;
  created_by: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AdvanceTemplateItem {
  id: string;
  template_id: string;
  catalog_item_id: string | null;
  org_catalog_item_id: string | null;
  item_name: string;
  description: string | null;
  category: string | null;
  subcategory: string | null;
  default_quantity: number;
  unit: string;
  estimated_unit_cost: number | null;
  is_required: boolean;
  is_locked: boolean;
  notes: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface AdvanceTemplateItemData {
  catalog_item_id?: string;
  org_catalog_item_id?: string;
  item_name: string;
  description?: string;
  category?: string;
  subcategory?: string;
  default_quantity: number;
  unit: string;
  estimated_unit_cost?: number;
  is_required?: boolean;
  notes?: string;
}

export interface CreateAdvanceTemplatePayload {
  name: string;
  description?: string;
  category?: string;
  template_type?: TemplateType;
  is_global?: boolean;
  tags?: string[];
  project_id?: string;
  team_id?: string;
  items: AdvanceTemplateItemData[];
}

export interface UpdateAdvanceTemplatePayload {
  name?: string;
  description?: string;
  category?: string;
  template_type?: TemplateType;
  is_global?: boolean;
  is_active?: boolean;
  tags?: string[];
}

export interface AdvanceTemplateWithItems extends AdvanceTemplate {
  items: AdvanceTemplateItem[];
  item_count: number;
}

export interface AdvanceTemplateListItem {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  template_type: TemplateType;
  is_global: boolean;
  is_favorite: boolean;
  usage_count: number;
  last_used_at: string | null;
  estimated_cost: number | null;
  item_count: number;
  created_at: string;
}

// ============================================================================
// EFFECTIVE CATALOG TYPES
// ============================================================================

export type CatalogSourceType = 'global' | 'organization';

export interface EffectiveCatalogItem {
  id: string;
  item_id: string;
  item_name: string;
  description: string | null;
  category: string;
  subcategory: string | null;
  base_price_low: number | null;
  base_price_high: number | null;
  standard_unit: string;
  source_type: CatalogSourceType;
  is_locked: boolean;
  is_preferred: boolean;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface OrgCatalogFilters {
  category?: string;
  subcategory?: string;
  search?: string;
  is_locked?: boolean;
  is_preferred?: boolean;
  enabled?: boolean;
  limit?: number;
  offset?: number;
}

export interface TemplateFilters {
  category?: string;
  template_type?: TemplateType;
  is_global?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface VisibilityFilters {
  scope_type?: VisibilityScopeType;
  scope_id?: string;
  target_type?: VisibilityTargetType;
  limit?: number;
  offset?: number;
}

export interface PermissionFilters {
  category?: string;
  is_active?: boolean;
  limit?: number;
  offset?: number;
}
