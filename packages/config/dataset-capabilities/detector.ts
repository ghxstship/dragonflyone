/**
 * Dataset Capability Detection System - Detector
 * 
 * Core detection logic that analyzes dataset schemas to determine
 * which capabilities are available based on field patterns.
 */

import type {
  DatasetCapability,
  DatasetSchema,
  DetectedCapabilities,
  CapabilityDetail,
  FieldPatternMatcher,
  CapabilityRequirement,
} from './types';
import { CAPABILITY_REGISTRY } from './capability-registry';
import { ENTITY_CAPABILITY_OVERRIDES } from './entity-overrides';

/**
 * Check if a field matches any of the patterns in a matcher
 */
function matchesPattern(fieldKey: string, matcher: FieldPatternMatcher): boolean {
  return matcher.patterns.some(pattern => pattern.test(fieldKey));
}

/**
 * Find the first field that matches any pattern in a matcher
 */
function findMatchingField(
  columns: DatasetSchema['columns'],
  matcher: FieldPatternMatcher
): string | undefined {
  const match = columns.find(col => matchesPattern(col.key, matcher));
  return match?.key;
}

/**
 * Find all fields that match any pattern in a matcher
 */
function findAllMatchingFields(
  columns: DatasetSchema['columns'],
  matcher: FieldPatternMatcher
): string[] {
  return columns
    .filter(col => matchesPattern(col.key, matcher))
    .map(col => col.key);
}

/**
 * Evaluate a single capability requirement against a schema
 */
function evaluateCapability(
  requirement: CapabilityRequirement,
  schema: DatasetSchema
): CapabilityDetail {
  const matchedFields: string[] = [];
  const missingFields: string[] = [];

  // Check required fields
  for (const matcher of requirement.requiredFields) {
    const matches = findAllMatchingFields(schema.columns, matcher);
    if (matches.length > 0) {
      matchedFields.push(...matches);
    } else {
      missingFields.push(matcher.description || matcher.patterns[0].source);
    }
  }

  // Check optional fields (for additional context, not for enabling)
  if (requirement.optionalFields) {
    for (const matcher of requirement.optionalFields) {
      const matches = findAllMatchingFields(schema.columns, matcher);
      if (matches.length > 0) {
        matchedFields.push(...matches);
      }
    }
  }

  // Determine if capability is enabled
  const minMatches = requirement.minRequiredMatches ?? requirement.requiredFields.length;
  const requiredMatchCount = requirement.requiredFields.filter(matcher =>
    findMatchingField(schema.columns, matcher) !== undefined
  ).length;

  // Capability is enabled if:
  // 1. No required fields (always available) OR
  // 2. Enough required field matchers matched
  const enabled = requirement.requiredFields.length === 0 || requiredMatchCount >= minMatches;

  return {
    enabled,
    matchedFields: Array.from(new Set(matchedFields)), // Deduplicate
    missingFields: enabled ? undefined : missingFields,
    requirement,
  };
}

/**
 * Detect all capabilities for a dataset schema
 */
export function detectDatasetCapabilities(schema: DatasetSchema): DetectedCapabilities {
  const capabilities: DatasetCapability[] = [];
  const capabilityDetails = new Map<DatasetCapability, CapabilityDetail>();

  // Get entity-specific overrides
  const overrides = ENTITY_CAPABILITY_OVERRIDES[schema.entityType];

  // Evaluate each capability in the registry
  for (const requirement of CAPABILITY_REGISTRY) {
    const detail = evaluateCapability(requirement, schema);

    // Apply overrides
    if (overrides?.enable?.includes(requirement.capability)) {
      detail.enabled = true;
      detail.missingFields = undefined;
    }
    if (overrides?.disable?.includes(requirement.capability)) {
      detail.enabled = false;
    }

    capabilityDetails.set(requirement.capability, detail);

    if (detail.enabled) {
      capabilities.push(requirement.capability);
    }
  }

  return {
    capabilities,
    capabilityDetails,
    schema,
  };
}

/**
 * Check if a specific capability is available for a schema
 */
export function hasCapability(
  schema: DatasetSchema,
  capability: DatasetCapability
): boolean {
  const detected = detectDatasetCapabilities(schema);
  return detected.capabilities.includes(capability);
}

/**
 * Get the fields that enable a specific capability
 */
export function getCapabilityFields(
  schema: DatasetSchema,
  capability: DatasetCapability
): string[] {
  const detected = detectDatasetCapabilities(schema);
  const detail = detected.capabilityDetails.get(capability);
  return detail?.matchedFields || [];
}

/**
 * Get all scanning capabilities for a schema
 */
export function getScanningCapabilities(schema: DatasetSchema): DatasetCapability[] {
  const detected = detectDatasetCapabilities(schema);
  return detected.capabilities.filter(cap => cap.startsWith('scannable:'));
}

/**
 * Get all view capabilities for a schema
 */
export function getViewCapabilities(schema: DatasetSchema): DatasetCapability[] {
  const detected = detectDatasetCapabilities(schema);
  return detected.capabilities.filter(cap => cap.startsWith('view:'));
}

/**
 * Get field mapping for a specific view capability
 */
export function getViewFieldMapping(
  schema: DatasetSchema,
  capability: DatasetCapability
): Record<string, string | undefined> {
  const detected = detectDatasetCapabilities(schema);
  const detail = detected.capabilityDetails.get(capability);
  
  if (!detail?.enabled) {
    return {};
  }

  const mapping: Record<string, string | undefined> = {};
  const requirement = detail.requirement;

  // Map fields based on capability type
  switch (capability) {
    case 'view:timeline':
    case 'view:gantt':
      if (requirement.requiredFields[0]) {
        mapping.startField = findMatchingField(schema.columns, requirement.requiredFields[0]);
      }
      if (requirement.requiredFields[1]) {
        mapping.endField = findMatchingField(schema.columns, requirement.requiredFields[1]);
      }
      if (requirement.optionalFields?.[0]) {
        mapping.progressField = findMatchingField(schema.columns, requirement.optionalFields[0]);
      }
      break;

    case 'view:calendar':
      if (requirement.requiredFields[0]) {
        mapping.dateField = findMatchingField(schema.columns, requirement.requiredFields[0]);
      }
      if (requirement.optionalFields?.[0]) {
        mapping.titleField = findMatchingField(schema.columns, requirement.optionalFields[0]);
      }
      break;

    case 'view:map':
      // Check for address first
      const addressField = schema.columns.find(col => 
        /^address$/i.test(col.key) || /^location$/i.test(col.key) || /^venue$/i.test(col.key)
      );
      if (addressField) {
        mapping.addressField = addressField.key;
      }
      // Check for lat/lng
      const latField = schema.columns.find(col => 
        /^latitude$/i.test(col.key) || /^lat$/i.test(col.key)
      );
      const lngField = schema.columns.find(col => 
        /^longitude$/i.test(col.key) || /^lng$/i.test(col.key) || /^lon$/i.test(col.key)
      );
      if (latField) mapping.latitudeField = latField.key;
      if (lngField) mapping.longitudeField = lngField.key;
      break;

    case 'view:gallery':
      if (requirement.requiredFields[0]) {
        mapping.imageField = findMatchingField(schema.columns, requirement.requiredFields[0]);
      }
      if (requirement.optionalFields?.[0]) {
        mapping.thumbnailField = findMatchingField(schema.columns, requirement.optionalFields[0]);
      }
      break;

    case 'view:kanban':
      if (requirement.requiredFields[0]) {
        mapping.groupByField = findMatchingField(schema.columns, requirement.requiredFields[0]);
      }
      break;
  }

  return mapping;
}

/**
 * Generate a route path for a capability action
 */
export function getCapabilityRoute(
  schema: DatasetSchema,
  capability: DatasetCapability
): string | undefined {
  const detected = detectDatasetCapabilities(schema);
  const detail = detected.capabilityDetails.get(capability);
  
  if (!detail?.enabled) {
    return undefined;
  }

  // Check for entity-specific route override
  const overrides = ENTITY_CAPABILITY_OVERRIDES[schema.entityType];
  if (overrides?.routes?.[capability]) {
    return overrides.routes[capability];
  }

  // Use route template from requirement
  const routeTemplate = detail.requirement.routeTemplate;
  if (routeTemplate) {
    return routeTemplate.replace(':entityType', schema.entityType);
  }

  return undefined;
}
