/**
 * Dataset Capability Detection System - React Hook
 * 
 * Provides a React hook for detecting and using dataset capabilities
 * in components, particularly for ListPage toolbar actions.
 */

'use client';

import { useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import type {
  DatasetCapability,
  DatasetSchema,
  UseDatasetCapabilitiesResult,
  CapabilityQuickAction,
  CapabilityViewOption,
  CapabilityDetail,
} from '../types';
import { detectDatasetCapabilities, getViewFieldMapping, getCapabilityRoute } from '../detector';
import { getCapabilityRequirement } from '../capability-registry';

/**
 * Column definition interface (matches ListPageColumn)
 */
interface ColumnDefinition {
  key: string;
  label?: string;
  type?: 'string' | 'number' | 'date' | 'boolean' | 'json' | 'array';
}

/**
 * Icon component props for dynamic icon rendering
 */
interface IconProps {
  className?: string;
}

/**
 * Icon mapping for capabilities
 * These will be rendered by the consuming component
 */
export type CapabilityIconName = 
  | 'QrCode'
  | 'Barcode'
  | 'Radio'
  | 'Nfc'
  | 'Clock'
  | 'Calendar'
  | 'GanttChart'
  | 'MapPin'
  | 'Image'
  | 'Columns3'
  | 'List'
  | 'LayoutGrid'
  | 'Table';

/**
 * Map capability to icon name
 */
const CAPABILITY_ICONS: Record<string, CapabilityIconName> = {
  'scannable:qr': 'QrCode',
  'scannable:barcode': 'Barcode',
  'scannable:rfid': 'Radio',
  'scannable:nfc': 'Nfc',
  'view:timeline': 'Clock',
  'view:calendar': 'Calendar',
  'view:gantt': 'GanttChart',
  'view:map': 'MapPin',
  'view:gallery': 'Image',
  'view:kanban': 'Columns3',
};

/**
 * Map view capability to view icon type
 */
const VIEW_ICON_MAP: Record<string, CapabilityViewOption['icon']> = {
  'view:timeline': 'timeline',
  'view:calendar': 'calendar',
  'view:gantt': 'gantt',
  'view:map': 'map',
  'view:gallery': 'gallery',
  'view:kanban': 'kanban',
};

/**
 * Options for the useDatasetCapabilities hook
 */
export interface UseDatasetCapabilitiesOptions {
  /** Column definitions from the dataset */
  columns: ColumnDefinition[];
  /** Entity type identifier (e.g., 'crew', 'equipment', 'assets') */
  entityType: string;
  /** Optional: app context (e.g., 'atlvs', 'compvss', 'gvteway') */
  appContext?: string;
  /** Optional: callback to get icon component by name */
  getIcon?: (iconName: CapabilityIconName, props?: IconProps) => ReactNode;
  /** Optional: callback when a scan action is clicked */
  onScanAction?: (capability: DatasetCapability, route: string) => void;
  /** Optional: base path for routes (default: '') */
  basePath?: string;
}

/**
 * Hook for detecting and using dataset capabilities
 * 
 * @example
 * ```tsx
 * const { scanActions, viewOptions, hasCapability } = useDatasetCapabilities({
 *   columns: [{ key: 'barcode' }, { key: 'name' }, { key: 'status' }],
 *   entityType: 'equipment',
 *   getIcon: (name) => <LucideIcon name={name} className="size-4" />,
 *   onScanAction: (cap, route) => router.push(route),
 * });
 * ```
 */
export function useDatasetCapabilities({
  columns,
  entityType,
  appContext,
  getIcon,
  onScanAction,
  basePath = '',
}: UseDatasetCapabilitiesOptions): UseDatasetCapabilitiesResult {
  // Build schema from columns
  const schema: DatasetSchema = useMemo(() => ({
    columns: columns.map(c => ({
      key: c.key,
      type: c.type,
      label: c.label,
    })),
    entityType,
    appContext,
  }), [columns, entityType, appContext]);

  // Detect capabilities
  const detected = useMemo(() => detectDatasetCapabilities(schema), [schema]);

  // Check if a capability is available
  const hasCapability = useCallback(
    (cap: DatasetCapability): boolean => detected.capabilities.includes(cap),
    [detected.capabilities]
  );

  // Get fields that matched for a capability
  const getCapabilityFields = useCallback(
    (cap: DatasetCapability): string[] => {
      const detail = detected.capabilityDetails.get(cap);
      return detail?.matchedFields || [];
    },
    [detected.capabilityDetails]
  );

  // Get full capability detail
  const getCapabilityDetail = useCallback(
    (cap: DatasetCapability): CapabilityDetail | undefined => {
      return detected.capabilityDetails.get(cap);
    },
    [detected.capabilityDetails]
  );

  // Generate scan actions based on detected capabilities
  const scanActions: CapabilityQuickAction[] = useMemo(() => {
    const actions: CapabilityQuickAction[] = [];
    const scanCapabilities: DatasetCapability[] = [
      'scannable:qr',
      'scannable:barcode',
      'scannable:rfid',
      'scannable:nfc',
    ];

    for (const cap of scanCapabilities) {
      if (hasCapability(cap)) {
        const requirement = getCapabilityRequirement(cap);
        const route = getCapabilityRoute(schema, cap);
        const iconName = CAPABILITY_ICONS[cap];

        actions.push({
          id: cap.replace(':', '-'),
          label: requirement?.label || cap,
          icon: getIcon ? getIcon(iconName, { className: 'size-4' }) : null,
          capability: cap,
          onClick: () => {
            if (onScanAction && route) {
              onScanAction(cap, basePath + route);
            }
          },
          tooltip: requirement?.description,
        });
      }
    }

    return actions;
  }, [hasCapability, schema, getIcon, onScanAction, basePath]);

  // Generate view options based on detected capabilities
  const viewOptions: CapabilityViewOption[] = useMemo(() => {
    // Always include base views
    const views: CapabilityViewOption[] = [
      { id: 'list', label: 'List', icon: 'list' },
      { id: 'grid', label: 'Grid', icon: 'grid' },
      { id: 'table', label: 'Table', icon: 'table' },
    ];

    // Add capability-based views
    const viewCapabilities: DatasetCapability[] = [
      'view:kanban',
      'view:calendar',
      'view:timeline',
      'view:gantt',
      'view:map',
      'view:gallery',
    ];

    for (const cap of viewCapabilities) {
      if (hasCapability(cap)) {
        const requirement = getCapabilityRequirement(cap);
        const fieldMapping = getViewFieldMapping(schema, cap);

        views.push({
          id: cap.replace('view:', ''),
          label: requirement?.label.replace(' View', '').replace(' Chart', '') || cap,
          icon: VIEW_ICON_MAP[cap] || 'list',
          capability: cap,
          fieldMapping,
        });
      }
    }

    return views;
  }, [hasCapability, schema]);

  // Check if any scanning capability is available
  const hasScanningCapability = useMemo(() => {
    return detected.capabilities.some(cap => cap.startsWith('scannable:'));
  }, [detected.capabilities]);

  // Check if any advanced view capability is available
  const hasAdvancedViews = useMemo(() => {
    return detected.capabilities.some(cap => cap.startsWith('view:'));
  }, [detected.capabilities]);

  return {
    capabilities: detected.capabilities,
    hasCapability,
    getCapabilityFields,
    getCapabilityDetail,
    scanActions,
    viewOptions,
    allDetails: detected.capabilityDetails,
    hasScanningCapability,
    hasAdvancedViews,
  };
}

/**
 * Utility to create a schema from ListPage columns
 */
export function createSchemaFromColumns(
  columns: Array<{ key: string; label?: string }>,
  entityType: string,
  appContext?: string
): DatasetSchema {
  return {
    columns: columns.map(c => ({ key: c.key, label: c.label })),
    entityType,
    appContext,
  };
}

/**
 * Utility to merge user-provided quick actions with auto-detected scan actions
 */
export function mergeQuickActions(
  userActions: Array<{ id: string; label: string; icon?: ReactNode; onClick: () => void }>,
  scanActions: CapabilityQuickAction[]
): Array<{ id: string; label: string; icon?: ReactNode; onClick: () => void }> {
  // Filter out scan actions that user has already provided
  const userActionIds = new Set(userActions.map(a => a.id));
  const newScanActions = scanActions.filter(a => !userActionIds.has(a.id));

  return [...userActions, ...newScanActions];
}

export default useDatasetCapabilities;
