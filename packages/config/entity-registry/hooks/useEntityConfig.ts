/**
 * useEntityConfig Hook
 * 
 * React hook for consuming entity configurations in list pages.
 * Provides all the necessary data and handlers for ListPage components.
 */

import { useMemo, useCallback } from 'react';
import type {
  EntityConfig,
  ColumnDefinition,
  FilterDefinition,
  RowActionDefinition,
  BulkActionDefinition,
  QuickActionDefinition,
  FormFieldDefinition,
  DetailSectionDefinition,
  StatDefinition,
} from '../types';
import {
  getEntity,
  getEntityColumns,
  getEntityFilters,
  getEntityRowActions,
  getEntityBulkActions,
  getEntityQuickActions,
  getEntityFormFields,
  getEntityDetailSections,
  getEntityStats,
  getEntityRoutes,
  buildEntityRoute,
  entityHasFeature,
} from '../registry';
import {
  buildActionRoute,
  isActionHidden,
  isActionDisabled,
  getActionConfirmMessage,
  generateStats,
  generateDetailSections,
} from '../generators';

// ============================================================================
// Types
// ============================================================================

export interface UseEntityConfigOptions {
  /** Entity name to load configuration for */
  entityName: string;
  /** User roles for permission filtering */
  userRoles?: string[];
  /** Override columns */
  columnsOverride?: ColumnDefinition[];
  /** Override filters */
  filtersOverride?: FilterDefinition[];
  /** Override row actions */
  rowActionsOverride?: RowActionDefinition[];
  /** Override bulk actions */
  bulkActionsOverride?: BulkActionDefinition[];
  /** Override quick actions */
  quickActionsOverride?: QuickActionDefinition[];
  /** Override form fields */
  formFieldsOverride?: FormFieldDefinition[];
  /** Columns to exclude */
  excludeColumns?: string[];
  /** Filters to exclude */
  excludeFilters?: string[];
  /** Actions to exclude */
  excludeActions?: string[];
  /** Include hidden columns */
  includeHiddenColumns?: boolean;
}

export interface UseEntityConfigResult {
  /** Full entity configuration */
  entity: EntityConfig | undefined;
  /** Whether entity exists */
  exists: boolean;
  /** Entity display names */
  names: {
    singular: string;
    plural: string;
  };
  /** Processed columns for ListPage */
  columns: ColumnDefinition[];
  /** Processed filters for ListPage */
  filters: FilterDefinition[];
  /** Processed row actions for ListPage */
  rowActions: RowActionDefinition[];
  /** Processed bulk actions for ListPage */
  bulkActions: BulkActionDefinition[];
  /** Processed quick actions for ListPage */
  quickActions: QuickActionDefinition[];
  /** Form fields for create/edit modals */
  formFields: FormFieldDefinition[];
  /** Detail sections for detail drawer */
  detailSections: DetailSectionDefinition[];
  /** Stat definitions */
  stats: StatDefinition[];
  /** Entity routes */
  routes: ReturnType<typeof getEntityRoutes>;
  /** Search configuration */
  search: EntityConfig['search'];
  /** Empty state configuration */
  emptyState: EntityConfig['emptyState'];
  /** Default sort configuration */
  defaultSort: EntityConfig['defaultSort'];
  /** Feature flags */
  features: {
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canExport: boolean;
    canImport: boolean;
    hasBulkActions: boolean;
    hasSearch: boolean;
    hasFilters: boolean;
  };
  /** Helper functions */
  helpers: {
    /** Build a route for a specific row */
    buildRoute: (routeType: 'detail' | 'edit', row: Record<string, unknown>) => string | undefined;
    /** Check if action is hidden for row */
    isActionHidden: (action: RowActionDefinition, row: Record<string, unknown>) => boolean;
    /** Check if action is disabled for row */
    isActionDisabled: (action: RowActionDefinition, row: Record<string, unknown>) => boolean;
    /** Get confirmation message for action */
    getConfirmMessage: (action: RowActionDefinition, row: Record<string, unknown>) => string | undefined;
    /** Generate stats from API response */
    generateStats: (statsData: Record<string, unknown>) => Array<{ label: string; value: string; key: string }>;
    /** Generate detail sections for a record */
    generateDetailSections: (record: Record<string, unknown>) => ReturnType<typeof generateDetailSections>;
  };
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for consuming entity configurations in list pages
 */
export function useEntityConfig(options: UseEntityConfigOptions): UseEntityConfigResult {
  const {
    entityName,
    userRoles = [],
    columnsOverride,
    filtersOverride,
    rowActionsOverride,
    bulkActionsOverride,
    quickActionsOverride,
    formFieldsOverride,
    excludeColumns = [],
    excludeFilters = [],
    excludeActions = [],
    includeHiddenColumns = false,
  } = options;

  // Get base entity configuration
  const entity = useMemo(() => getEntity(entityName), [entityName]);

  // Process columns
  const columns = useMemo(() => {
    if (columnsOverride) return columnsOverride;
    
    let cols = getEntityColumns(entityName, { includeHidden: includeHiddenColumns });
    
    if (excludeColumns.length > 0) {
      cols = cols.filter(col => !excludeColumns.includes(col.key));
    }
    
    return cols;
  }, [entityName, columnsOverride, excludeColumns, includeHiddenColumns]);

  // Process filters
  const filters = useMemo(() => {
    if (filtersOverride) return filtersOverride;
    
    let flts = getEntityFilters(entityName);
    
    if (excludeFilters.length > 0) {
      flts = flts.filter(f => !excludeFilters.includes(f.key));
    }
    
    return flts;
  }, [entityName, filtersOverride, excludeFilters]);

  // Process row actions
  const rowActions = useMemo(() => {
    if (rowActionsOverride) return rowActionsOverride;
    
    let actions = getEntityRowActions(entityName, { userRoles });
    
    if (excludeActions.length > 0) {
      actions = actions.filter(a => !excludeActions.includes(a.id));
    }
    
    return actions;
  }, [entityName, rowActionsOverride, userRoles, excludeActions]);

  // Process bulk actions
  const bulkActions = useMemo(() => {
    if (bulkActionsOverride) return bulkActionsOverride;
    return getEntityBulkActions(entityName, { userRoles });
  }, [entityName, bulkActionsOverride, userRoles]);

  // Process quick actions
  const quickActions = useMemo(() => {
    if (quickActionsOverride) return quickActionsOverride;
    return getEntityQuickActions(entityName, { userRoles });
  }, [entityName, quickActionsOverride, userRoles]);

  // Process form fields
  const formFields = useMemo(() => {
    if (formFieldsOverride) return formFieldsOverride;
    return getEntityFormFields(entityName, { mode: 'create' });
  }, [entityName, formFieldsOverride]);

  // Get detail sections
  const detailSections = useMemo(() => {
    return getEntityDetailSections(entityName);
  }, [entityName]);

  // Get stats
  const stats = useMemo(() => {
    return getEntityStats(entityName);
  }, [entityName]);

  // Get routes
  const routes = useMemo(() => {
    return getEntityRoutes(entityName);
  }, [entityName]);

  // Feature flags
  const features = useMemo(() => ({
    canCreate: entityHasFeature(entityName, 'create'),
    canEdit: entityHasFeature(entityName, 'edit'),
    canDelete: entityHasFeature(entityName, 'delete'),
    canExport: entityHasFeature(entityName, 'export'),
    canImport: entityHasFeature(entityName, 'import'),
    hasBulkActions: entityHasFeature(entityName, 'bulkActions'),
    hasSearch: entityHasFeature(entityName, 'search'),
    hasFilters: entityHasFeature(entityName, 'filters'),
  }), [entityName]);

  // Helper: Build route for row
  const buildRoute = useCallback((
    routeType: 'detail' | 'edit',
    row: Record<string, unknown>
  ): string | undefined => {
    const template = buildEntityRoute(entityName, routeType);
    if (!template) return undefined;
    return buildActionRoute(template, row);
  }, [entityName]);

  // Helper: Check if action is hidden
  const checkActionHidden = useCallback((
    action: RowActionDefinition,
    row: Record<string, unknown>
  ): boolean => {
    return isActionHidden(action, row);
  }, []);

  // Helper: Check if action is disabled
  const checkActionDisabled = useCallback((
    action: RowActionDefinition,
    row: Record<string, unknown>
  ): boolean => {
    return isActionDisabled(action, row);
  }, []);

  // Helper: Get confirmation message
  const getConfirmMessage = useCallback((
    action: RowActionDefinition,
    row: Record<string, unknown>
  ): string | undefined => {
    return getActionConfirmMessage(action, row);
  }, []);

  // Helper: Generate stats
  const genStats = useCallback((
    statsData: Record<string, unknown>
  ): Array<{ label: string; value: string; key: string }> => {
    return generateStats(entityName, statsData);
  }, [entityName]);

  // Helper: Generate detail sections
  const genDetailSections = useCallback((
    record: Record<string, unknown>
  ): ReturnType<typeof generateDetailSections> => {
    return generateDetailSections(entityName, record, { hideEmpty: true });
  }, [entityName]);

  return {
    entity,
    exists: !!entity,
    names: {
      singular: entity?.singular || entityName,
      plural: entity?.plural || entityName,
    },
    columns,
    filters,
    rowActions,
    bulkActions,
    quickActions,
    formFields,
    detailSections,
    stats,
    routes,
    search: entity?.search,
    emptyState: entity?.emptyState,
    defaultSort: entity?.defaultSort,
    features,
    helpers: {
      buildRoute,
      isActionHidden: checkActionHidden,
      isActionDisabled: checkActionDisabled,
      getConfirmMessage,
      generateStats: genStats,
      generateDetailSections: genDetailSections,
    },
  };
}

export default useEntityConfig;
