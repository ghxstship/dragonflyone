/**
 * Capability Bridge
 * 
 * Bridges the Entity Registry with the Dataset Capability Detection System.
 * Provides functions to sync entity configurations with capability overrides.
 */

import type { EntityConfig, DatasetCapabilityType } from './types';
import type { DatasetCapability, EntityCapabilityOverride } from '../dataset-capabilities/types';
import { getEntity, getAllEntities } from './registry';

// ============================================================================
// Type Mapping
// ============================================================================

/**
 * Maps entity registry capability types to dataset-capabilities types
 */
export function mapToDatasetCapability(capability: DatasetCapabilityType): DatasetCapability {
  return capability as DatasetCapability;
}

/**
 * Maps dataset-capabilities types to entity registry capability types
 */
export function mapFromDatasetCapability(capability: DatasetCapability): DatasetCapabilityType | undefined {
  const validTypes: DatasetCapabilityType[] = [
    'scannable:qr', 'scannable:barcode', 'scannable:rfid', 'scannable:nfc',
    'view:timeline', 'view:map', 'view:calendar', 'view:gantt', 'view:gallery', 'view:kanban',
    'import:csv', 'import:json', 'import:excel',
    'export:csv', 'export:json', 'export:pdf',
    'bulk:edit', 'bulk:delete', 'bulk:assign', 'bulk:status-change',
    'notifications:enabled', 'audit:trail', 'versioning:enabled',
  ];
  
  return validTypes.includes(capability as DatasetCapabilityType) 
    ? (capability as DatasetCapabilityType) 
    : undefined;
}

// ============================================================================
// Entity to Capability Override Conversion
// ============================================================================

/**
 * Generates EntityCapabilityOverride from an EntityConfig
 * This allows the entity registry to feed into the capability detection system
 */
export function entityToCapabilityOverride(entity: EntityConfig): EntityCapabilityOverride {
  const override: EntityCapabilityOverride = {};
  
  // Map capabilities to enable list
  if (entity.capabilities && entity.capabilities.length > 0) {
    override.enable = entity.capabilities.map(mapToDatasetCapability);
  }
  
  // Map capability routes
  if (entity.capabilityRoutes) {
    override.routes = {} as Record<DatasetCapability, string>;
    for (const [cap, route] of Object.entries(entity.capabilityRoutes)) {
      if (route) {
        (override.routes as Record<string, string>)[cap] = route;
      }
    }
  }
  
  return override;
}

/**
 * Generates capability overrides for all registered entities
 * Can be used to sync entity registry with ENTITY_CAPABILITY_OVERRIDES
 */
export function generateAllCapabilityOverrides(): Record<string, EntityCapabilityOverride> {
  const overrides: Record<string, EntityCapabilityOverride> = {};
  
  for (const entity of getAllEntities()) {
    const override = entityToCapabilityOverride(entity);
    if (override.enable?.length || override.routes) {
      overrides[entity.name] = override;
    }
  }
  
  return overrides;
}

// ============================================================================
// Capability Detection Integration
// ============================================================================

/**
 * Gets capabilities for an entity from the registry
 */
export function getEntityCapabilities(entityName: string): DatasetCapability[] {
  const entity = getEntity(entityName);
  if (!entity?.capabilities) return [];
  
  return entity.capabilities.map(mapToDatasetCapability);
}

/**
 * Gets capability route for an entity
 */
export function getEntityCapabilityRoute(
  entityName: string, 
  capability: DatasetCapabilityType
): string | undefined {
  const entity = getEntity(entityName);
  return entity?.capabilityRoutes?.[capability];
}

/**
 * Checks if an entity has a specific capability
 */
export function entityHasCapability(
  entityName: string, 
  capability: DatasetCapabilityType
): boolean {
  const entity = getEntity(entityName);
  return entity?.capabilities?.includes(capability) ?? false;
}

/**
 * Gets all scanning capabilities for an entity
 */
export function getEntityScanCapabilities(entityName: string): DatasetCapabilityType[] {
  const entity = getEntity(entityName);
  if (!entity?.capabilities) return [];
  
  return entity.capabilities.filter(cap => cap.startsWith('scannable:'));
}

/**
 * Gets all view capabilities for an entity
 */
export function getEntityViewCapabilities(entityName: string): DatasetCapabilityType[] {
  const entity = getEntity(entityName);
  if (!entity?.capabilities) return [];
  
  return entity.capabilities.filter(cap => cap.startsWith('view:'));
}

// ============================================================================
// Legend Schema Integration
// ============================================================================

/**
 * Gets the Legend table name for an entity
 */
export function getEntityLegendTable(entityName: string): string | undefined {
  const entity = getEntity(entityName);
  return entity?.legendMapping?.table;
}

/**
 * Gets the Legend type discriminator for an entity
 */
export function getEntityLegendType(entityName: string): { column?: string; value?: string } | undefined {
  const entity = getEntity(entityName);
  if (!entity?.legendMapping) return undefined;
  
  return {
    column: entity.legendMapping.typeColumn,
    value: entity.legendMapping.typeValue,
  };
}

/**
 * Builds a Legend query filter for an entity
 */
export function buildLegendQueryFilter(entityName: string): Record<string, unknown> {
  const entity = getEntity(entityName);
  if (!entity?.legendMapping) return {};
  
  const filter: Record<string, unknown> = {};
  
  if (entity.legendMapping.typeColumn && entity.legendMapping.typeValue) {
    filter[entity.legendMapping.typeColumn] = entity.legendMapping.typeValue;
  }
  
  if (entity.legendMapping.filters) {
    Object.assign(filter, entity.legendMapping.filters);
  }
  
  return filter;
}

/**
 * Gets all entities that map to a specific Legend table
 */
export function getEntitiesByLegendTable(table: string): EntityConfig[] {
  return getAllEntities().filter(entity => entity.legendMapping?.table === table);
}

// ============================================================================
// Exports
// ============================================================================

const capabilityBridge = {
  mapToDatasetCapability,
  mapFromDatasetCapability,
  entityToCapabilityOverride,
  generateAllCapabilityOverrides,
  getEntityCapabilities,
  getEntityCapabilityRoute,
  entityHasCapability,
  getEntityScanCapabilities,
  getEntityViewCapabilities,
  getEntityLegendTable,
  getEntityLegendType,
  buildLegendQueryFilter,
  getEntitiesByLegendTable,
};

export default capabilityBridge;
