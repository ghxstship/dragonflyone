/**
 * Dataset Capability Detection System - Entity Overrides
 * 
 * Entity-specific capability overrides for cases where pattern matching
 * isn't sufficient or where we want to force-enable/disable capabilities.
 */

import type { DatasetCapability, EntityCapabilityOverride } from './types';

/**
 * Entity-specific capability overrides
 * 
 * Use these to:
 * - Force-enable capabilities that aren't detected by patterns
 * - Force-disable capabilities that shouldn't be available
 * - Override default routes for capability actions
 */
export const ENTITY_CAPABILITY_OVERRIDES: Record<string, EntityCapabilityOverride> = {
  // =========================================================================
  // COMPVSS ENTITIES
  // =========================================================================
  
  crew: {
    enable: [
      'scannable:barcode',  // Crew badges have barcodes
      'scannable:qr',       // Crew badges may have QR codes
      'bulk:assign',        // Can assign crew to projects
    ],
    routes: {
      'scannable:barcode': '/credentials/scan',
      'scannable:qr': '/credentials/scan',
    },
  },

  equipment: {
    enable: [
      'scannable:qr',
      'scannable:barcode',
      'scannable:rfid',
      'view:map',           // Equipment has location
      'bulk:assign',        // Can assign to projects
      'bulk:status-change', // Can change status in bulk
    ],
    routes: {
      'scannable:qr': '/credentials/scan',
      'scannable:barcode': '/credentials/scan',
      'scannable:rfid': '/credentials/scan',
    },
  },

  vehicles: {
    enable: [
      'scannable:qr',
      'scannable:barcode',
      'view:map',
      'view:timeline',      // Vehicle schedules
    ],
    routes: {
      'scannable:qr': '/vehicles/scan',
      'scannable:barcode': '/vehicles/scan',
    },
  },

  credentials: {
    enable: [
      'scannable:qr',
      'scannable:barcode',
      'scannable:rfid',
      'scannable:nfc',
    ],
    routes: {
      'scannable:qr': '/credentials/scan',
      'scannable:barcode': '/credentials/scan',
      'scannable:rfid': '/credentials/scan',
      'scannable:nfc': '/credentials/scan',
    },
  },

  // =========================================================================
  // ATLVS ENTITIES
  // =========================================================================

  assets: {
    enable: [
      'scannable:qr',
      'scannable:barcode',
      'scannable:rfid',
      'view:map',
      'view:gallery',       // Assets may have images
      'view:timeline',      // Asset lifecycle
      'bulk:assign',
      'bulk:status-change',
    ],
    routes: {
      'scannable:qr': '/assets/scan',
      'scannable:barcode': '/assets/scan',
      'scannable:rfid': '/assets/scan',
    },
  },

  inventory: {
    enable: [
      'scannable:qr',
      'scannable:barcode',
      'view:map',           // Inventory locations
      'bulk:status-change',
    ],
    routes: {
      'scannable:qr': '/inventory/scan',
      'scannable:barcode': '/inventory/scan',
    },
  },

  locations: {
    enable: [
      'view:map',           // Always show map for locations
    ],
  },

  // =========================================================================
  // GVTEWAY ENTITIES
  // =========================================================================

  events: {
    enable: [
      'view:calendar',
      'view:timeline',
      'view:map',           // Event venues
      'view:gantt',         // Event schedules
    ],
  },

  productions: {
    enable: [
      'view:timeline',
      'view:gantt',
      'view:kanban',        // Production stages
    ],
  },

  projects: {
    enable: [
      'view:timeline',
      'view:gantt',
      'view:kanban',
      'bulk:assign',
      'bulk:status-change',
    ],
  },

  tasks: {
    enable: [
      'view:kanban',
      'view:calendar',
      'view:timeline',
      'bulk:assign',
      'bulk:status-change',
    ],
  },

  schedules: {
    enable: [
      'view:calendar',
      'view:timeline',
      'view:gantt',
    ],
  },

  contacts: {
    enable: [
      'view:map',           // Contact addresses
    ],
    disable: [
      'view:gallery',       // Don't show gallery for contacts
    ],
  },

  vendors: {
    enable: [
      'view:map',           // Vendor locations
    ],
  },

  // =========================================================================
  // SHARED ENTITIES
  // =========================================================================

  documents: {
    enable: [
      'view:gallery',       // Document previews
    ],
    disable: [
      'view:map',
      'view:timeline',
    ],
  },

  media: {
    enable: [
      'view:gallery',
    ],
  },

  users: {
    disable: [
      'bulk:delete',        // Don't allow bulk user deletion
      'view:gallery',
    ],
  },

  audit_logs: {
    enable: [
      'view:timeline',
    ],
    disable: [
      'bulk:edit',
      'bulk:delete',
      'import:csv',
      'import:json',
      'import:excel',
    ],
  },
};

/**
 * Get overrides for a specific entity type
 */
export function getEntityOverrides(entityType: string): EntityCapabilityOverride | undefined {
  return ENTITY_CAPABILITY_OVERRIDES[entityType];
}

/**
 * Check if a capability is force-enabled for an entity
 */
export function isCapabilityForceEnabled(
  entityType: string,
  capability: DatasetCapability
): boolean {
  const overrides = ENTITY_CAPABILITY_OVERRIDES[entityType];
  return overrides?.enable?.includes(capability) ?? false;
}

/**
 * Check if a capability is force-disabled for an entity
 */
export function isCapabilityForceDisabled(
  entityType: string,
  capability: DatasetCapability
): boolean {
  const overrides = ENTITY_CAPABILITY_OVERRIDES[entityType];
  return overrides?.disable?.includes(capability) ?? false;
}

/**
 * Get custom route for a capability on an entity
 */
export function getCapabilityRouteOverride(
  entityType: string,
  capability: DatasetCapability
): string | undefined {
  const overrides = ENTITY_CAPABILITY_OVERRIDES[entityType];
  return overrides?.routes?.[capability];
}
