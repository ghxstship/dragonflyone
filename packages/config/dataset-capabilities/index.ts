/**
 * Dataset Capability Detection System
 * 
 * Automatically detects which toolbar actions and views should be enabled
 * based on dataset schema analysis. This eliminates hardcoding and ensures
 * features are only available when the data supports them.
 * 
 * @example
 * ```tsx
 * import { useDatasetCapabilities } from '@ghxstship/config';
 * 
 * function MyListPage() {
 *   const { scanActions, viewOptions, hasCapability } = useDatasetCapabilities({
 *     columns: [{ key: 'barcode' }, { key: 'name' }, { key: 'status' }],
 *     entityType: 'equipment',
 *   });
 *   
 *   // scanActions will include 'Barcode Scan' because 'barcode' column exists
 *   // viewOptions will include 'Board View' because 'status' column exists
 * }
 * ```
 */

// Types
export type {
  DatasetCapability,
  CapabilityCategory,
  FieldPatternMatcher,
  CapabilityRequirement,
  DatasetSchema,
  CapabilityDetail,
  DetectedCapabilities,
  EntityCapabilityOverride,
  CapabilityQuickAction,
  CapabilityViewOption,
  UseDatasetCapabilitiesResult,
} from './types';

// Capability Registry
export {
  FIELD_PATTERNS,
  CAPABILITY_REGISTRY,
  getCapabilityRequirement,
  getCapabilitiesByCategory,
  getScanningCapabilities as getScanningCapabilityRequirements,
  getViewCapabilities as getViewCapabilityRequirements,
} from './capability-registry';

// Entity Overrides
export {
  ENTITY_CAPABILITY_OVERRIDES,
  getEntityOverrides,
  isCapabilityForceEnabled,
  isCapabilityForceDisabled,
  getCapabilityRouteOverride,
} from './entity-overrides';

// Detector Functions
export {
  detectDatasetCapabilities,
  hasCapability,
  getCapabilityFields,
  getScanningCapabilities,
  getViewCapabilities,
  getViewFieldMapping,
  getCapabilityRoute,
} from './detector';

// React Hook
export {
  useDatasetCapabilities,
  createSchemaFromColumns,
  mergeQuickActions,
  type UseDatasetCapabilitiesOptions,
  type CapabilityIconName,
} from './hooks/useDatasetCapabilities';
