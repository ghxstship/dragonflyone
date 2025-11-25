// packages/config/types/advancing.ts
// TypeScript types for Universal Multi-Industry Advancing Catalog

export type AdvanceStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'in_progress'
  | 'fulfilled'
  | 'rejected'
  | 'cancelled';

export type FulfillmentStatus = 'pending' | 'partial' | 'complete';

export type IndustryVertical =
  | 'events_entertainment'
  | 'corporate_meetings'
  | 'construction'
  | 'healthcare'
  | 'hospitality'
  | 'film_television'
  | 'retail'
  | 'sports'
  | 'education'
  | 'government'
  | 'nonprofit'
  | 'manufacturing'
  | 'logistics'
  | 'universal';

export type ProcurementType =
  | 'rental'
  | 'purchase'
  | 'service'
  | 'labor'
  | 'consumable'
  | 'license'
  | 'subscription';

export type LeadTimeUnit = 'hours' | 'days' | 'weeks' | 'months';

export interface ProductionCatalogItem {
  id: string;
  item_id: string;
  category: string;
  subcategory: string;
  item_name: string;
  common_variations: string[];
  related_accessories: string[];
  specifications: string | null;
  standard_unit: string;
  metadata: Record<string, any>;
  enabled: boolean;
  created_at: string;
  updated_at: string;
  // Enhanced universal fields
  industry_verticals?: IndustryVertical[];
  procurement_type?: ProcurementType;
  typical_lead_time?: number | null;
  lead_time_unit?: LeadTimeUnit;
  requires_certification?: boolean;
  certification_types?: string[];
  hazard_class?: string | null;
  insurance_required?: boolean;
  min_insurance_coverage?: number | null;
  regulatory_codes?: string[];
  sustainability_rating?: string | null;
  carbon_footprint_kg?: number | null;
  typical_vendors?: string[];
  alternative_items?: string[];
  bundle_items?: string[];
  min_quantity?: number;
  max_quantity?: number | null;
  quantity_increment?: number;
  base_price_low?: number | null;
  base_price_high?: number | null;
  price_currency?: string;
  price_includes_labor?: boolean;
  setup_time_minutes?: number | null;
  teardown_time_minutes?: number | null;
  power_requirements?: string | null;
  weight_kg?: number | null;
  dimensions_cm?: { length?: number; width?: number; height?: number } | null;
  storage_requirements?: string | null;
  weather_rating?: string | null;
  indoor_outdoor?: 'indoor' | 'outdoor' | 'both';
  accessibility_compliant?: boolean;
  search_keywords?: string[];
  display_order?: number;
  featured?: boolean;
  deprecated?: boolean;
  deprecated_replacement_id?: string | null;
}

export interface ProductionAdvanceItem {
  id: string;
  advance_id: string;
  catalog_item_id: string | null;
  item_name: string;
  description: string | null;
  quantity: number;
  unit: string;
  unit_cost: number | null;
  total_cost: number | null;
  quantity_fulfilled: number;
  fulfillment_status: FulfillmentStatus;
  notes: string | null;
  metadata: Record<string, any>;
  created_at: string;
  catalog_item?: ProductionCatalogItem;
}

export interface ProductionAdvance {
  id: string;
  organization_id: string;
  project_id: string | null;
  team_workspace: string | null;
  activation_name: string | null;
  submitter_id: string;
  submitted_at: string | null;
  status: AdvanceStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  reviewer_notes: string | null;
  fulfilled_by: string | null;
  fulfilled_at: string | null;
  fulfillment_notes: string | null;
  estimated_cost: number | null;
  approved_cost: number | null;
  actual_cost: number | null;
  currency: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  // Relations
  items?: ProductionAdvanceItem[];
  project?: {
    id: string;
    name: string;
    code: string;
    budget?: number;
  };
  submitter?: {
    id: string;
    full_name: string;
    email: string;
  };
  reviewed_by_user?: {
    id: string;
    full_name: string;
    email: string;
  };
  fulfilled_by_user?: {
    id: string;
    full_name: string;
    email: string;
  };
  organization?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface CreateAdvancePayload {
  project_id?: string;
  team_workspace?: string;
  activation_name?: string;
  items: {
    catalog_item_id?: string;
    item_name: string;
    description?: string;
    quantity: number;
    unit: string;
    unit_cost?: number;
    notes?: string;
  }[];
  estimated_cost?: number;
}

export interface UpdateAdvancePayload {
  status?: 'draft' | 'submitted' | 'cancelled';
  team_workspace?: string;
  activation_name?: string;
  estimated_cost?: number;
}

export interface ApproveAdvancePayload {
  reviewer_notes?: string;
  approved_cost?: number;
}

export interface RejectAdvancePayload {
  reviewer_notes: string;
}

export interface FulfillAdvancePayload {
  items: {
    item_id: string;
    quantity_fulfilled: number;
    notes?: string;
  }[];
  fulfillment_notes?: string;
  actual_cost?: number;
}

export interface CatalogFilters {
  category?: string;
  subcategory?: string;
  search?: string;
  industry_vertical?: IndustryVertical;
  procurement_type?: ProcurementType;
  featured?: boolean;
  price_min?: number;
  price_max?: number;
  limit?: number;
  offset?: number;
}

export interface AdvanceFilters {
  project_id?: string;
  status?: AdvanceStatus;
  submitter_id?: string;
  priority?: 'high' | 'medium' | 'low';
  limit?: number;
  offset?: number;
}

// ============================================================================
// CATALOG CATEGORY TYPES
// ============================================================================

export interface CatalogCategory {
  id: string;
  category_code: string;
  category_name: string;
  parent_category_id: string | null;
  description: string | null;
  icon_name: string | null;
  color_hex: string | null;
  industry_verticals: IndustryVertical[];
  display_order: number;
  enabled: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  // Nested children for tree structure
  children?: CatalogCategory[];
  item_count?: number;
}

export interface CatalogTag {
  id: string;
  tag_name: string;
  tag_type: 'general' | 'industry' | 'compliance' | 'feature';
  description: string | null;
  color_hex: string | null;
  created_at: string;
}

export interface CatalogPricingTier {
  id: string;
  catalog_item_id: string;
  min_quantity: number;
  max_quantity: number | null;
  price_per_unit: number;
  currency: string;
  effective_from: string | null;
  effective_to: string | null;
  created_at: string;
}

export interface CatalogComplianceRequirement {
  id: string;
  catalog_item_id: string;
  requirement_type: 'certification' | 'license' | 'permit' | 'insurance' | 'training';
  requirement_name: string;
  description: string | null;
  issuing_authority: string | null;
  validity_period_days: number | null;
  renewal_required: boolean;
  documentation_required: boolean;
  created_at: string;
}

export interface CatalogVendor {
  id: string;
  vendor_name: string;
  vendor_code: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website: string | null;
  regions: string[];
  certifications: string[];
  rating: number | null;
  preferred: boolean;
  enabled: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CatalogItemVendor {
  catalog_item_id: string;
  vendor_id: string;
  vendor_sku: string | null;
  vendor_price: number | null;
  lead_time_days: number | null;
  min_order_quantity: number | null;
  preferred: boolean;
  vendor?: CatalogVendor;
}

// ============================================================================
// INDUSTRY VERTICAL DISPLAY HELPERS
// ============================================================================

export const INDUSTRY_VERTICAL_LABELS: Record<IndustryVertical, string> = {
  events_entertainment: 'Events & Entertainment',
  corporate_meetings: 'Corporate Meetings',
  construction: 'Construction',
  healthcare: 'Healthcare',
  hospitality: 'Hospitality',
  film_television: 'Film & Television',
  retail: 'Retail',
  sports: 'Sports',
  education: 'Education',
  government: 'Government',
  nonprofit: 'Nonprofit',
  manufacturing: 'Manufacturing',
  logistics: 'Logistics',
  universal: 'Universal',
};

export const PROCUREMENT_TYPE_LABELS: Record<ProcurementType, string> = {
  rental: 'Rental',
  purchase: 'Purchase',
  service: 'Service',
  labor: 'Labor',
  consumable: 'Consumable',
  license: 'License',
  subscription: 'Subscription',
};

// ============================================================================
// CATALOG STATISTICS
// ============================================================================

export interface CatalogStatistics {
  total_items: number;
  items_by_category: Record<string, number>;
  items_by_industry: Record<IndustryVertical, number>;
  items_by_procurement_type: Record<ProcurementType, number>;
  featured_count: number;
  deprecated_count: number;
}
