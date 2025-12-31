/**
 * Dataset Capability Detection System - Types
 * 
 * Defines types for automatic detection of dataset capabilities
 * based on schema analysis. This enables dynamic toolbar actions
 * and view options based on what the data supports.
 */

import type { ReactNode } from 'react';

/**
 * All possible dataset capabilities that can be detected
 */
export type DatasetCapability =
  // Scanning capabilities - require identifier fields
  | 'scannable:qr'
  | 'scannable:barcode'
  | 'scannable:rfid'
  | 'scannable:nfc'
  // View capabilities - require specific field patterns
  | 'view:timeline'
  | 'view:map'
  | 'view:calendar'
  | 'view:gantt'
  | 'view:gallery'
  | 'view:kanban'
  // Data operation capabilities
  | 'import:csv'
  | 'import:json'
  | 'import:excel'
  | 'export:csv'
  | 'export:json'
  | 'export:pdf'
  // Feature capabilities
  | 'bulk:edit'
  | 'bulk:delete'
  | 'bulk:assign'
  | 'bulk:status-change'
  | 'notifications:enabled'
  | 'audit:trail'
  | 'versioning:enabled';

/**
 * Capability categories for grouping
 */
export type CapabilityCategory = 
  | 'scanning'
  | 'views'
  | 'import'
  | 'export'
  | 'bulk-operations'
  | 'features';

/**
 * Field pattern matcher for detecting capabilities
 */
export interface FieldPatternMatcher {
  /** Regex patterns to match field names */
  patterns: readonly RegExp[] | RegExp[];
  /** Optional: also check column type */
  fieldTypes?: Array<'string' | 'number' | 'date' | 'boolean' | 'json' | 'array'>;
  /** Description of what this pattern matches */
  description?: string;
}

/**
 * Requirement definition for a capability
 */
export interface CapabilityRequirement {
  /** The capability being defined */
  capability: DatasetCapability;
  /** Category for grouping */
  category: CapabilityCategory;
  /** Human-readable label */
  label: string;
  /** Description of the capability */
  description: string;
  /** Icon name from Lucide */
  icon: string;
  /** Fields that MUST be present for this capability */
  requiredFields: FieldPatternMatcher[];
  /** Fields that enhance the capability but aren't required */
  optionalFields?: FieldPatternMatcher[];
  /** Minimum number of required field matchers that must match (default: all) */
  minRequiredMatches?: number;
  /** Route path template for the action (uses :entityType placeholder) */
  routeTemplate?: string;
}

/**
 * Schema representation for capability detection
 */
export interface DatasetSchema {
  /** Column definitions from the dataset */
  columns: Array<{
    key: string;
    type?: 'string' | 'number' | 'date' | 'boolean' | 'json' | 'array';
    label?: string;
  }>;
  /** Entity type identifier (e.g., 'crew', 'equipment', 'assets') */
  entityType: string;
  /** Optional: app context (e.g., 'atlvs', 'compvss', 'gvteway') */
  appContext?: string;
}

/**
 * Details about a detected capability
 */
export interface CapabilityDetail {
  /** Whether the capability is enabled */
  enabled: boolean;
  /** Fields that matched the requirement patterns */
  matchedFields: string[];
  /** Fields that are missing (if not enabled) */
  missingFields?: string[];
  /** The requirement that was evaluated */
  requirement: CapabilityRequirement;
}

/**
 * Result of capability detection
 */
export interface DetectedCapabilities {
  /** List of enabled capabilities */
  capabilities: DatasetCapability[];
  /** Detailed information about each capability evaluation */
  capabilityDetails: Map<DatasetCapability, CapabilityDetail>;
  /** Schema that was analyzed */
  schema: DatasetSchema;
}

/**
 * Override configuration for entity-specific capability rules
 */
export interface EntityCapabilityOverride {
  /** Capabilities to force-enable regardless of schema */
  enable?: DatasetCapability[];
  /** Capabilities to force-disable regardless of schema */
  disable?: DatasetCapability[];
  /** Custom route overrides for specific capabilities */
  routes?: Partial<Record<DatasetCapability, string>>;
}

/**
 * Quick action generated from capability detection
 */
export interface CapabilityQuickAction {
  id: string;
  label: string;
  icon: ReactNode;
  capability: DatasetCapability;
  onClick: () => void;
  disabled?: boolean;
  tooltip?: string;
}

/**
 * View option generated from capability detection
 */
export interface CapabilityViewOption {
  id: string;
  label: string;
  icon: 'list' | 'grid' | 'kanban' | 'calendar' | 'gantt' | 'table' | 'timeline' | 'map' | 'gallery';
  capability?: DatasetCapability;
  /** Fields used by this view */
  fieldMapping?: {
    dateField?: string;
    titleField?: string;
    startField?: string;
    endField?: string;
    progressField?: string;
    latitudeField?: string;
    longitudeField?: string;
    addressField?: string;
    imageField?: string;
    groupByField?: string;
  };
}

/**
 * Hook return type for useDatasetCapabilities
 */
export interface UseDatasetCapabilitiesResult {
  /** All detected capabilities */
  capabilities: DatasetCapability[];
  /** Check if a specific capability is available */
  hasCapability: (cap: DatasetCapability) => boolean;
  /** Get the fields that matched for a capability */
  getCapabilityFields: (cap: DatasetCapability) => string[];
  /** Get capability detail including requirement info */
  getCapabilityDetail: (cap: DatasetCapability) => CapabilityDetail | undefined;
  /** Auto-generated scan actions based on capabilities */
  scanActions: CapabilityQuickAction[];
  /** Auto-generated view options based on capabilities */
  viewOptions: CapabilityViewOption[];
  /** All capability details for debugging/display */
  allDetails: Map<DatasetCapability, CapabilityDetail>;
  /** Check if any scanning capability is available */
  hasScanningCapability: boolean;
  /** Check if any advanced view capability is available */
  hasAdvancedViews: boolean;
}
