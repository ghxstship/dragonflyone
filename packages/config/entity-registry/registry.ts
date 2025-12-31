/**
 * Entity Registry
 * 
 * Central registry for all entity configurations.
 * Provides lookup functions and utilities for accessing entity metadata.
 */

import type { 
  EntityConfig, 
  EntityRegistry, 
  ColumnDefinition,
  FilterDefinition,
  RowActionDefinition,
  BulkActionDefinition,
  QuickActionDefinition,
  FormFieldDefinition,
  DetailSectionDefinition,
  StatDefinition,
  ColumnGeneratorOptions,
  FilterGeneratorOptions,
  ActionGeneratorOptions,
  FormFieldGeneratorOptions,
} from './types';

// ============================================================================
// Registry Storage
// ============================================================================

/**
 * Internal registry storage
 */
const registry: EntityRegistry = {};

// ============================================================================
// Registration Functions
// ============================================================================

/**
 * Register an entity configuration
 */
export function registerEntity<T = Record<string, unknown>>(
  config: EntityConfig<T>
): void {
  registry[config.name] = config as EntityConfig;
}

/**
 * Register multiple entity configurations
 */
export function registerEntities(
  configs: EntityConfig[]
): void {
  configs.forEach(config => registerEntity(config));
}

/**
 * Unregister an entity
 */
export function unregisterEntity(name: string): void {
  delete registry[name];
}

// ============================================================================
// Lookup Functions
// ============================================================================

/**
 * Get an entity configuration by name
 */
export function getEntity<T = Record<string, unknown>>(
  name: string
): EntityConfig<T> | undefined {
  return registry[name] as EntityConfig<T> | undefined;
}

/**
 * Get an entity configuration by name (throws if not found)
 */
export function getEntityOrThrow<T = Record<string, unknown>>(
  name: string
): EntityConfig<T> {
  const entity = getEntity<T>(name);
  if (!entity) {
    throw new Error(`Entity "${name}" not found in registry`);
  }
  return entity;
}

/**
 * Check if an entity exists
 */
export function hasEntity(name: string): boolean {
  return name in registry;
}

/**
 * Get all registered entity names
 */
export function getEntityNames(): string[] {
  return Object.keys(registry);
}

/**
 * Get all registered entities
 */
export function getAllEntities(): EntityConfig[] {
  return Object.values(registry);
}

// ============================================================================
// Column Utilities
// ============================================================================

/**
 * Get columns for an entity with optional filtering
 */
export function getEntityColumns<T = Record<string, unknown>>(
  entityName: string,
  options: ColumnGeneratorOptions = {}
): ColumnDefinition<T>[] {
  const entity = getEntity<T>(entityName);
  if (!entity) return [];
  
  let columns = [...entity.columns];
  
  // Filter by hidden
  if (!options.includeHidden) {
    columns = columns.filter(col => !col.hidden);
  }
  
  // Filter by groups
  if (options.groups?.length) {
    columns = columns.filter(col => 
      !col.group || options.groups!.includes(col.group)
    );
  }
  
  // Filter by include/exclude
  if (options.include?.length) {
    columns = columns.filter(col => options.include!.includes(col.key));
  } else if (options.exclude?.length) {
    columns = columns.filter(col => !options.exclude!.includes(col.key));
  }
  
  return columns;
}

// ============================================================================
// Filter Utilities
// ============================================================================

/**
 * Get filters for an entity with optional filtering
 */
export function getEntityFilters(
  entityName: string,
  options: FilterGeneratorOptions = {}
): FilterDefinition[] {
  const entity = getEntity(entityName);
  if (!entity) return [];
  
  let filters = [...entity.filters];
  
  // Filter by hidden
  if (!options.includeHidden) {
    filters = filters.filter(f => !f.hidden);
  }
  
  // Filter by groups
  if (options.groups?.length) {
    filters = filters.filter(f => 
      !f.group || options.groups!.includes(f.group)
    );
  }
  
  // Filter by include/exclude
  if (options.include?.length) {
    filters = filters.filter(f => options.include!.includes(f.key));
  } else if (options.exclude?.length) {
    filters = filters.filter(f => !options.exclude!.includes(f.key));
  }
  
  return filters;
}

// ============================================================================
// Action Utilities
// ============================================================================

/**
 * Get row actions for an entity with optional filtering
 */
export function getEntityRowActions<T = Record<string, unknown>>(
  entityName: string,
  options: ActionGeneratorOptions = {}
): RowActionDefinition<T>[] {
  const entity = getEntity<T>(entityName);
  if (!entity) return [];
  
  let actions = [...entity.rowActions];
  
  // Filter by roles
  if (options.userRoles?.length) {
    actions = actions.filter(action => 
      !action.requiredRole || options.userRoles!.includes(action.requiredRole)
    );
  }
  
  // Filter by include/exclude
  if (options.include?.length) {
    actions = actions.filter(a => options.include!.includes(a.id));
  } else if (options.exclude?.length) {
    actions = actions.filter(a => !options.exclude!.includes(a.id));
  }
  
  return actions;
}

/**
 * Get bulk actions for an entity with optional filtering
 */
export function getEntityBulkActions(
  entityName: string,
  options: ActionGeneratorOptions = {}
): BulkActionDefinition[] {
  const entity = getEntity(entityName);
  if (!entity) return [];
  
  let actions = [...entity.bulkActions];
  
  // Filter by roles
  if (options.userRoles?.length) {
    actions = actions.filter(action => 
      !action.requiredRole || options.userRoles!.includes(action.requiredRole)
    );
  }
  
  // Filter by include/exclude
  if (options.include?.length) {
    actions = actions.filter(a => options.include!.includes(a.id));
  } else if (options.exclude?.length) {
    actions = actions.filter(a => !options.exclude!.includes(a.id));
  }
  
  return actions;
}

/**
 * Get quick actions for an entity with optional filtering
 */
export function getEntityQuickActions(
  entityName: string,
  options: ActionGeneratorOptions = {}
): QuickActionDefinition[] {
  const entity = getEntity(entityName);
  if (!entity) return [];
  
  let actions = [...entity.quickActions];
  
  // Filter by roles
  if (options.userRoles?.length) {
    actions = actions.filter(action => 
      !action.requiredRole || options.userRoles!.includes(action.requiredRole)
    );
  }
  
  // Filter by include/exclude
  if (options.include?.length) {
    actions = actions.filter(a => options.include!.includes(a.id));
  } else if (options.exclude?.length) {
    actions = actions.filter(a => !options.exclude!.includes(a.id));
  }
  
  return actions;
}

// ============================================================================
// Form Field Utilities
// ============================================================================

/**
 * Get form fields for an entity with optional filtering
 */
export function getEntityFormFields(
  entityName: string,
  options: FormFieldGeneratorOptions
): FormFieldDefinition[] {
  const entity = getEntity(entityName);
  if (!entity) return [];
  
  let fields = [...entity.formFields];
  
  // Filter by groups
  if (options.groups?.length) {
    fields = fields.filter(f => 
      !f.group || options.groups!.includes(f.group)
    );
  }
  
  // Filter by include/exclude
  if (options.include?.length) {
    fields = fields.filter(f => options.include!.includes(f.name));
  } else if (options.exclude?.length) {
    fields = fields.filter(f => !options.exclude!.includes(f.name));
  }
  
  // Handle mode-specific adjustments
  if (options.mode === 'edit') {
    // In edit mode, some fields might be read-only
    fields = fields.map(f => ({
      ...f,
      // ID fields are typically read-only in edit mode
      readOnly: f.name === 'id' ? true : f.readOnly,
    }));
  }
  
  return fields;
}

// ============================================================================
// Detail Section Utilities
// ============================================================================

/**
 * Get detail sections for an entity
 */
export function getEntityDetailSections(
  entityName: string,
  options: { exclude?: string[]; include?: string[] } = {}
): DetailSectionDefinition[] {
  const entity = getEntity(entityName);
  if (!entity) return [];
  
  let sections = [...entity.detailSections];
  
  // Filter by include/exclude
  if (options.include?.length) {
    sections = sections.filter(s => options.include!.includes(s.id));
  } else if (options.exclude?.length) {
    sections = sections.filter(s => !options.exclude!.includes(s.id));
  }
  
  return sections;
}

// ============================================================================
// Stats Utilities
// ============================================================================

/**
 * Get stat definitions for an entity
 */
export function getEntityStats(
  entityName: string,
  options: { exclude?: string[]; include?: string[] } = {}
): StatDefinition[] {
  const entity = getEntity(entityName);
  if (!entity) return [];
  
  let stats = [...entity.stats];
  
  // Filter by include/exclude
  if (options.include?.length) {
    stats = stats.filter(s => options.include!.includes(s.key));
  } else if (options.exclude?.length) {
    stats = stats.filter(s => !options.exclude!.includes(s.key));
  }
  
  return stats;
}

// ============================================================================
// Route Utilities
// ============================================================================

/**
 * Get entity routes
 */
export function getEntityRoutes(entityName: string) {
  const entity = getEntity(entityName);
  return entity?.routes;
}

/**
 * Build a route with ID substitution
 */
export function buildEntityRoute(
  entityName: string,
  routeType: 'list' | 'detail' | 'create' | 'edit',
  id?: string
): string | undefined {
  const routes = getEntityRoutes(entityName);
  if (!routes) return undefined;
  
  const template = routes[routeType];
  if (!template) return undefined;
  
  if (id) {
    return template.replace('[id]', id);
  }
  
  return template;
}

// ============================================================================
// API Utilities
// ============================================================================

/**
 * Get entity API configuration
 */
export function getEntityApi(entityName: string) {
  const entity = getEntity(entityName);
  return entity?.api;
}

/**
 * Get entity API endpoint
 */
export function getEntityEndpoint(entityName: string): string | undefined {
  return getEntityApi(entityName)?.endpoint;
}

// ============================================================================
// Feature Utilities
// ============================================================================

/**
 * Check if an entity has a specific feature enabled
 */
export function entityHasFeature(
  entityName: string,
  feature: keyof NonNullable<EntityConfig['features']>
): boolean {
  const entity = getEntity(entityName);
  if (!entity?.features) return true; // Default to enabled
  return entity.features[feature] !== false;
}

// ============================================================================
// Permission Utilities
// ============================================================================

/**
 * Check if user has permission for an entity operation
 */
export function hasEntityPermission(
  entityName: string,
  operation: keyof NonNullable<EntityConfig['permissions']>,
  userRoles: string[]
): boolean {
  const entity = getEntity(entityName);
  if (!entity?.permissions) return true; // Default to allowed
  
  const requiredRoles = entity.permissions[operation];
  if (!requiredRoles?.length) return true;
  
  return requiredRoles.some(role => userRoles.includes(role));
}

// ============================================================================
// Search Configuration
// ============================================================================

/**
 * Get search configuration for an entity
 */
export function getEntitySearchConfig(entityName: string) {
  const entity = getEntity(entityName);
  return entity?.search;
}

// ============================================================================
// Empty State Configuration
// ============================================================================

/**
 * Get empty state configuration for an entity
 */
export function getEntityEmptyState(entityName: string) {
  const entity = getEntity(entityName);
  return entity?.emptyState;
}

// ============================================================================
// Export Registry
// ============================================================================

export const entityRegistry = {
  register: registerEntity,
  registerMany: registerEntities,
  unregister: unregisterEntity,
  get: getEntity,
  getOrThrow: getEntityOrThrow,
  has: hasEntity,
  names: getEntityNames,
  all: getAllEntities,
  columns: getEntityColumns,
  filters: getEntityFilters,
  rowActions: getEntityRowActions,
  bulkActions: getEntityBulkActions,
  quickActions: getEntityQuickActions,
  formFields: getEntityFormFields,
  detailSections: getEntityDetailSections,
  stats: getEntityStats,
  routes: getEntityRoutes,
  buildRoute: buildEntityRoute,
  api: getEntityApi,
  endpoint: getEntityEndpoint,
  hasFeature: entityHasFeature,
  hasPermission: hasEntityPermission,
  searchConfig: getEntitySearchConfig,
  emptyState: getEntityEmptyState,
};
