/**
 * Query Builder for Legend 3NF Schema
 * 
 * Generates Supabase queries that properly join core Legend tables
 * with their profile extension tables, maintaining 3NF normalization
 * while providing denormalized views for the UI.
 */

import type { EntityConfig, EntityRelationship } from './types';
import { getEntity, getAllEntities } from './registry';

// ============================================================================
// Types
// ============================================================================

/**
 * Query configuration for Supabase
 */
export interface SupabaseQueryConfig {
  /** Main table to query */
  table: string;
  /** Select columns/relations */
  select: string;
  /** Filter conditions */
  filters: Record<string, unknown>;
  /** Order by configuration */
  orderBy?: { column: string; ascending: boolean };
  /** Pagination */
  pagination?: { page: number; pageSize: number };
}

/**
 * Composite entity query result
 */
export interface CompositeQueryResult {
  /** The generated select query string */
  selectQuery: string;
  /** The base table name */
  baseTable: string;
  /** Filter conditions to apply */
  filters: Record<string, unknown>;
  /** Profile table join info */
  profileJoin?: {
    table: string;
    foreignKey: string;
  };
}

// ============================================================================
// Query Builders
// ============================================================================

/**
 * Builds a Supabase select query for an entity
 * Handles core table + profile table joins automatically
 */
export function buildEntitySelectQuery(entityName: string): CompositeQueryResult {
  const entity = getEntity(entityName);
  if (!entity?.legendMapping) {
    return {
      selectQuery: '*',
      baseTable: entityName,
      filters: {},
    };
  }

  const { table, profileTable, profileForeignKey, typeColumn, typeValue, filters, selectQuery } = entity.legendMapping;

  // If a custom select query is provided, use it
  if (selectQuery) {
    return {
      selectQuery,
      baseTable: table,
      filters: buildTypeFilter(typeColumn, typeValue, filters),
      profileJoin: profileTable ? { table: profileTable, foreignKey: profileForeignKey || 'person_id' } : undefined,
    };
  }

  // Build automatic select query
  const selectParts: string[] = ['*'];

  // Add profile table join if exists
  if (profileTable) {
    const fk = profileForeignKey || getDefaultForeignKey(table);
    selectParts.push(`${profileTable}!${fk}(*)`);
  }

  // Add relationship joins
  if (entity.legendMapping.relationships) {
    for (const rel of entity.legendMapping.relationships) {
      if (rel.eager) {
        const relatedEntity = getEntity(rel.entity);
        if (relatedEntity?.legendMapping) {
          selectParts.push(`${rel.foreignKey.replace('_id', '')}:${relatedEntity.legendMapping.table}(*)`);
        }
      }
    }
  }

  return {
    selectQuery: selectParts.join(', '),
    baseTable: table,
    filters: buildTypeFilter(typeColumn, typeValue, filters),
    profileJoin: profileTable ? { table: profileTable, foreignKey: profileForeignKey || getDefaultForeignKey(table) } : undefined,
  };
}

/**
 * Builds type discriminator filter
 */
function buildTypeFilter(
  typeColumn?: string,
  typeValue?: string,
  additionalFilters?: Record<string, unknown>
): Record<string, unknown> {
  const filters: Record<string, unknown> = {};

  if (typeColumn && typeValue) {
    filters[typeColumn] = typeValue;
  }

  if (additionalFilters) {
    Object.assign(filters, additionalFilters);
  }

  return filters;
}

/**
 * Gets the default foreign key name for a Legend table
 */
function getDefaultForeignKey(table: string): string {
  const mapping: Record<string, string> = {
    legend_people: 'person_id',
    legend_places: 'place_id',
    legend_organizations: 'organization_id',
    legend_products: 'product_id',
    legend_events: 'event_id',
    legend_documents: 'document_id',
  };
  return mapping[table] || 'id';
}

/**
 * Builds a full Supabase query configuration for an entity
 */
export function buildSupabaseQueryConfig(
  entityName: string,
  options?: {
    page?: number;
    pageSize?: number;
    sortField?: string;
    sortDirection?: 'asc' | 'desc';
    additionalFilters?: Record<string, unknown>;
  }
): SupabaseQueryConfig {
  const queryResult = buildEntitySelectQuery(entityName);
  const entity = getEntity(entityName);

  const config: SupabaseQueryConfig = {
    table: queryResult.baseTable,
    select: queryResult.selectQuery,
    filters: { ...queryResult.filters, ...options?.additionalFilters },
  };

  // Add sorting
  if (options?.sortField) {
    config.orderBy = {
      column: options.sortField,
      ascending: options.sortDirection !== 'desc',
    };
  } else if (entity?.defaultSort) {
    config.orderBy = {
      column: entity.defaultSort.field,
      ascending: entity.defaultSort.direction !== 'desc',
    };
  }

  // Add pagination
  if (options?.page !== undefined && options?.pageSize !== undefined) {
    config.pagination = {
      page: options.page,
      pageSize: options.pageSize,
    };
  }

  return config;
}

// ============================================================================
// Insert/Update Builders
// ============================================================================

/**
 * Splits form data into core table and profile table data
 * for proper 3NF insert/update operations
 */
export function splitEntityData(
  entityName: string,
  data: Record<string, unknown>
): {
  coreData: Record<string, unknown>;
  profileData: Record<string, unknown> | null;
  coreTable: string;
  profileTable: string | null;
} {
  const entity = getEntity(entityName);
  if (!entity?.legendMapping) {
    return {
      coreData: data,
      profileData: null,
      coreTable: entityName,
      profileTable: null,
    };
  }

  const { table, profileTable, typeColumn, typeValue } = entity.legendMapping;

  // Get core table columns (simplified - in production, this would come from schema)
  const coreColumns = getCoreTableColumns(table);
  const profileColumns = profileTable ? getProfileTableColumns(profileTable) : new Set<string>();

  const coreData: Record<string, unknown> = {};
  const profileData: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (coreColumns.has(key)) {
      coreData[key] = value;
    } else if (profileColumns.has(key)) {
      profileData[key] = value;
    } else {
      // Default to core data for unknown fields
      coreData[key] = value;
    }
  }

  // Add type discriminator to core data
  if (typeColumn && typeValue) {
    coreData[typeColumn] = typeValue;
  }

  return {
    coreData,
    profileData: Object.keys(profileData).length > 0 ? profileData : null,
    coreTable: table,
    profileTable: profileTable || null,
  };
}

/**
 * Gets core table columns (simplified implementation)
 */
function getCoreTableColumns(table: string): Set<string> {
  const commonColumns = new Set([
    'id', 'organization_id', 'name', 'status', 'tags', 'metadata', 'notes',
    'created_at', 'updated_at', 'created_by', 'updated_by',
  ]);

  const tableSpecificColumns: Record<string, string[]> = {
    legend_people: ['first_name', 'last_name', 'display_name', 'preferred_name', 'email', 'phone', 'mobile', 'avatar_url', 'bio', 'title', 'platform_user_id'],
    legend_places: ['code', 'description', 'place_type', 'parent_place_id', 'capacity', 'square_footage', 'latitude', 'longitude', 'timezone', 'image_url', 'floor_plan_url'],
    legend_organizations: ['legal_name', 'code', 'description', 'org_type', 'email', 'phone', 'website', 'tax_id', 'duns_number', 'industry', 'company_size', 'primary_contact_id', 'logo_url'],
    legend_products: ['sku', 'barcode', 'description', 'product_type', 'unit_price', 'cost_price', 'currency', 'quantity_on_hand', 'quantity_reserved', 'reorder_point', 'reorder_quantity', 'weight', 'weight_unit', 'length', 'width', 'height', 'dimension_unit', 'vendor_id', 'image_url', 'thumbnail_url', 'specifications'],
    legend_events: ['code', 'description', 'event_type', 'start_datetime', 'end_datetime', 'timezone', 'is_all_day', 'place_id', 'parent_event_id', 'capacity', 'expected_attendance', 'actual_attendance', 'image_url', 'banner_url'],
    legend_documents: ['document_number', 'description', 'document_type', 'file_url', 'file_name', 'file_size', 'file_type', 'issue_date', 'effective_date', 'expiration_date', 'amount', 'currency', 'related_person_id', 'related_org_id', 'related_event_id', 'requires_signature', 'signed_at', 'signed_by'],
  };

  const columns = new Set(commonColumns);
  if (tableSpecificColumns[table]) {
    tableSpecificColumns[table].forEach(col => columns.add(col));
  }

  return columns;
}

/**
 * Gets profile table columns (simplified implementation)
 */
function getProfileTableColumns(table: string): Set<string> {
  const profileColumnMap: Record<string, string[]> = {
    people_profile_crew: ['crew_type', 'department', 'position', 'skills', 'certifications', 'union_affiliation', 'union_local', 'hourly_rate', 'day_rate', 'overtime_rate', 'rate_currency', 'availability_status', 'travel_willing', 'equipment_owned', 'portfolio_url', 'rating', 'rating_count'],
    people_profile_employee: ['employee_number', 'hire_date', 'termination_date', 'employment_type', 'position_id', 'department_id', 'team_id', 'manager_id', 'salary', 'salary_currency', 'pay_frequency', 'work_location_id', 'is_remote'],
    people_profile_contact: ['contact_type', 'company', 'job_title', 'department', 'source', 'lead_status', 'lead_score', 'last_contacted_at', 'next_follow_up_at', 'preferred_contact_method', 'do_not_contact', 'subscribed_to_newsletter', 'subscribed_to_marketing', 'linkedin_url', 'twitter_handle', 'lifetime_value'],
    places_profile_venue: ['venue_type', 'address_id', 'capacity_seated', 'capacity_standing', 'capacity_theater', 'capacity_banquet', 'stage_dimensions', 'loading_dock', 'green_room', 'dressing_rooms', 'parking_spaces', 'accessibility_features', 'technical_specs', 'house_sound', 'house_lights', 'backline_available', 'catering_kitchen', 'alcohol_license', 'curfew_time', 'load_in_time', 'sound_check_time', 'doors_time', 'rental_rate_hourly', 'rental_rate_daily', 'rental_rate_event', 'rate_currency', 'deposit_required', 'insurance_required', 'contact_name', 'contact_email', 'contact_phone', 'booking_url', 'virtual_tour_url'],
  };

  return new Set(profileColumnMap[table] || []);
}

// ============================================================================
// Relationship Helpers
// ============================================================================

/**
 * Gets all relationships for an entity
 */
export function getEntityRelationships(entityName: string): EntityRelationship[] {
  const entity = getEntity(entityName);
  return entity?.legendMapping?.relationships || [];
}

/**
 * Gets entities that have a relationship to the given entity
 */
export function getRelatedEntities(entityName: string): string[] {
  const relationships = getEntityRelationships(entityName);
  return relationships.map(r => r.entity);
}

/**
 * Checks if two entities are related
 */
export function areEntitiesRelated(entity1: string, entity2: string): boolean {
  const rel1 = getEntityRelationships(entity1);
  const rel2 = getEntityRelationships(entity2);
  
  return rel1.some(r => r.entity === entity2) || rel2.some(r => r.entity === entity1);
}

// ============================================================================
// Schema Introspection
// ============================================================================

/**
 * Gets all entities that use a specific Legend table
 */
export function getEntitiesForTable(table: string): EntityConfig[] {
  return getAllEntities().filter(e => e.legendMapping?.table === table);
}

/**
 * Gets all entities that use a specific profile table
 */
export function getEntitiesForProfileTable(profileTable: string): EntityConfig[] {
  return getAllEntities().filter(e => e.legendMapping?.profileTable === profileTable);
}

/**
 * Generates a schema map showing all entity-to-table relationships
 */
export function generateSchemaMap(): Map<string, { core: string; profile?: string; type?: string }> {
  const map = new Map<string, { core: string; profile?: string; type?: string }>();
  
  for (const entity of getAllEntities()) {
    if (entity.legendMapping) {
      map.set(entity.name, {
        core: entity.legendMapping.table,
        profile: entity.legendMapping.profileTable,
        type: entity.legendMapping.typeValue,
      });
    }
  }
  
  return map;
}

// ============================================================================
// Exports
// ============================================================================

const queryBuilder = {
  buildEntitySelectQuery,
  buildSupabaseQueryConfig,
  splitEntityData,
  getEntityRelationships,
  getRelatedEntities,
  areEntitiesRelated,
  getEntitiesForTable,
  getEntitiesForProfileTable,
  generateSchemaMap,
};

export default queryBuilder;
