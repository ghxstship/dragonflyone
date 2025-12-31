/**
 * Entity Registry Generators
 * 
 * Functions that generate React components and UI configurations
 * from entity definitions. These bridge the gap between the
 * declarative entity configs and the actual React components.
 */

import type {
  ColumnDefinition,
  FilterDefinition,
  RowActionDefinition,
  BulkActionDefinition,
  QuickActionDefinition,
  DetailFieldDefinition,
  StatDefinition,
  StatusVariant,
} from './types';
import { getEntity } from './registry';
import { formatDate, formatDateTime, formatCurrency, formatPhone, formatBoolean } from './formatters';

// ============================================================================
// Column Value Formatters
// ============================================================================

/**
 * Format a column value based on its data type
 */
export function formatColumnValue(
  value: unknown,
  column: ColumnDefinition,
  row: Record<string, unknown>
): string {
  // Use custom render if provided
  if (column.render) {
    const rendered = column.render(value, row);
    if (typeof rendered === 'string') return rendered;
    if (rendered === null || rendered === undefined) return '—';
    return String(rendered);
  }
  
  // Handle null/undefined
  if (value === null || value === undefined) return '—';
  
  // Format based on data type
  switch (column.dataType) {
    case 'date':
      return formatDate(value as string, column.formatOptions);
    case 'datetime':
      return formatDateTime(value as string, column.formatOptions);
    case 'currency':
      return formatCurrency(value as number, {
        currency: column.formatOptions?.currency || 'USD',
      });
    case 'number':
      return typeof value === 'number' ? value.toLocaleString() : String(value);
    case 'boolean':
      return formatBoolean(value as boolean);
    case 'status':
    case 'badge':
      return String(value);
    default:
      return String(value);
  }
}

/**
 * Get status color for a column value
 */
export function getColumnStatusColor(
  value: unknown,
  column: ColumnDefinition
): StatusVariant | undefined {
  if (column.dataType !== 'status' && column.dataType !== 'badge') {
    return undefined;
  }
  
  if (!value) return 'ghost';
  
  const status = String(value).toLowerCase();
  
  if (column.statusColors) {
    return column.statusColors[status] || column.statusColors[value as string] || 'ghost';
  }
  
  return 'ghost';
}

// ============================================================================
// Detail Field Formatters
// ============================================================================

/**
 * Get the value of a detail field
 */
export function getDetailFieldValue(
  field: DetailFieldDefinition,
  record: Record<string, unknown>
): unknown {
  if (typeof field.accessor === 'function') {
    return field.accessor(record);
  }
  
  // Handle nested accessors like 'contact.email'
  const parts = field.accessor.split('.');
  let value: unknown = record;
  
  for (const part of parts) {
    if (value === null || value === undefined) return undefined;
    value = (value as Record<string, unknown>)[part];
  }
  
  return value;
}

/**
 * Format a detail field value
 */
export function formatDetailFieldValue(
  field: DetailFieldDefinition,
  record: Record<string, unknown>
): string {
  const value = getDetailFieldValue(field, record);
  
  if (value === null || value === undefined) return '—';
  
  switch (field.dataType) {
    case 'date':
      return formatDate(value as string, field.formatOptions);
    case 'datetime':
      return formatDateTime(value as string, field.formatOptions);
    case 'currency':
      return formatCurrency(value as number, {
        currency: field.formatOptions?.currency || 'USD',
      });
    case 'boolean':
      return formatBoolean(value as boolean);
    case 'phone':
      return formatPhone(value as string);
    case 'email':
      return String(value);
    case 'status':
    case 'badge':
      return String(value);
    default:
      return String(value);
  }
}

/**
 * Get status color for a detail field
 */
export function getDetailFieldStatusColor(
  field: DetailFieldDefinition,
  record: Record<string, unknown>
): StatusVariant | undefined {
  if (field.dataType !== 'status' && field.dataType !== 'badge') {
    return undefined;
  }
  
  const value = getDetailFieldValue(field, record);
  if (!value) return 'ghost';
  
  const status = String(value).toLowerCase();
  
  if (field.statusColors) {
    return field.statusColors[status] || field.statusColors[value as string] || 'ghost';
  }
  
  return 'ghost';
}

// ============================================================================
// Stats Formatters
// ============================================================================

/**
 * Get the value of a stat
 */
export function getStatValue(
  stat: StatDefinition,
  statsData: Record<string, unknown>
): unknown {
  if (typeof stat.accessor === 'function') {
    return stat.accessor(statsData);
  }
  
  return statsData[stat.accessor];
}

/**
 * Format a stat value
 */
export function formatStatValue(
  stat: StatDefinition,
  statsData: Record<string, unknown>
): string {
  const value = getStatValue(stat, statsData);
  
  if (value === null || value === undefined) return '0';
  
  switch (stat.dataType) {
    case 'currency':
      return formatCurrency(value as number, {
        currency: stat.formatOptions?.currency || 'USD',
      });
    case 'percentage':
      return `${value}%`;
    case 'number':
    default:
      return typeof value === 'number' ? value.toLocaleString() : String(value);
  }
}

// ============================================================================
// Action Route Builders
// ============================================================================

/**
 * Build a route from a template and row data
 */
export function buildActionRoute(
  routeTemplate: string,
  row: Record<string, unknown>
): string {
  return routeTemplate.replace(/\[(\w+)\]/g, (_, key) => {
    const value = row[key];
    return value !== undefined ? String(value) : '';
  });
}

/**
 * Check if an action should be hidden for a row
 */
export function isActionHidden<T extends Record<string, unknown>>(
  action: RowActionDefinition<T>,
  row: T
): boolean {
  if (typeof action.hidden === 'function') {
    return action.hidden(row);
  }
  return action.hidden === true;
}

/**
 * Check if an action should be disabled for a row
 */
export function isActionDisabled<T extends Record<string, unknown>>(
  action: RowActionDefinition<T>,
  row: T
): boolean {
  if (typeof action.disabled === 'function') {
    return action.disabled(row);
  }
  return action.disabled === true;
}

/**
 * Get confirmation message for an action
 */
export function getActionConfirmMessage<T extends Record<string, unknown>>(
  action: RowActionDefinition<T>,
  row: T
): string | undefined {
  if (!action.confirm) return undefined;
  
  if (typeof action.confirm.message === 'function') {
    return action.confirm.message(row);
  }
  
  return action.confirm.message;
}

// ============================================================================
// Entity Helpers
// ============================================================================

/**
 * Get visible columns for an entity
 */
export function getVisibleColumns(
  entityName: string,
  options: { includeHidden?: boolean } = {}
): ColumnDefinition[] {
  const entity = getEntity(entityName);
  if (!entity) return [];
  
  if (options.includeHidden) {
    return entity.columns;
  }
  
  return entity.columns.filter(col => !col.hidden);
}

/**
 * Get visible filters for an entity
 */
export function getVisibleFilters(
  entityName: string,
  options: { includeHidden?: boolean } = {}
): FilterDefinition[] {
  const entity = getEntity(entityName);
  if (!entity) return [];
  
  if (options.includeHidden) {
    return entity.filters;
  }
  
  return entity.filters.filter(f => !f.hidden);
}

/**
 * Get available row actions for a specific row
 */
export function getAvailableRowActions<T extends Record<string, unknown>>(
  entityName: string,
  row: T,
  userRoles?: string[]
): RowActionDefinition<T>[] {
  const entity = getEntity<T>(entityName);
  if (!entity) return [];
  
  return entity.rowActions.filter(action => {
    // Check role permission
    if (action.requiredRole && userRoles && !userRoles.includes(action.requiredRole)) {
      return false;
    }
    
    // Check if hidden
    if (isActionHidden(action, row)) {
      return false;
    }
    
    return true;
  });
}

/**
 * Get available bulk actions
 */
export function getAvailableBulkActions(
  entityName: string,
  userRoles?: string[]
): BulkActionDefinition[] {
  const entity = getEntity(entityName);
  if (!entity) return [];
  
  return entity.bulkActions.filter(action => {
    if (action.requiredRole && userRoles && !userRoles.includes(action.requiredRole)) {
      return false;
    }
    return true;
  });
}

/**
 * Get available quick actions
 */
export function getAvailableQuickActions(
  entityName: string,
  userRoles?: string[]
): QuickActionDefinition[] {
  const entity = getEntity(entityName);
  if (!entity) return [];
  
  return entity.quickActions.filter(action => {
    if (action.requiredRole && userRoles && !userRoles.includes(action.requiredRole)) {
      return false;
    }
    return true;
  });
}

/**
 * Generate stats from data
 */
export function generateStats(
  entityName: string,
  statsData: Record<string, unknown>
): Array<{ label: string; value: string; key: string }> {
  const entity = getEntity(entityName);
  if (!entity) return [];
  
  return entity.stats.map(stat => ({
    key: stat.key,
    label: stat.label,
    value: formatStatValue(stat, statsData),
  }));
}

/**
 * Generate detail sections with formatted values
 */
export function generateDetailSections(
  entityName: string,
  record: Record<string, unknown>,
  options: { hideEmpty?: boolean } = {}
): Array<{
  id: string;
  title: string;
  fields: Array<{
    key: string;
    label: string;
    value: string;
    statusColor?: StatusVariant;
    colSpan?: 1 | 2;
  }>;
}> {
  const entity = getEntity(entityName);
  if (!entity) return [];
  
  return entity.detailSections.map(section => ({
    id: section.id,
    title: section.title,
    fields: section.fields
      .map(field => {
        const value = formatDetailFieldValue(field, record);
        const statusColor = getDetailFieldStatusColor(field, record);
        
        // Skip empty fields if hideEmpty is true
        if (options.hideEmpty && field.hideEmpty && value === '—') {
          return null;
        }
        
        return {
          key: field.key,
          label: field.label,
          value,
          statusColor,
          colSpan: field.colSpan,
        };
      })
      .filter((f): f is NonNullable<typeof f> => f !== null),
  }));
}

// ============================================================================
// Export All Generators
// ============================================================================

export const generators = {
  formatColumnValue,
  getColumnStatusColor,
  getDetailFieldValue,
  formatDetailFieldValue,
  getDetailFieldStatusColor,
  getStatValue,
  formatStatValue,
  buildActionRoute,
  isActionHidden,
  isActionDisabled,
  getActionConfirmMessage,
  getVisibleColumns,
  getVisibleFilters,
  getAvailableRowActions,
  getAvailableBulkActions,
  getAvailableQuickActions,
  generateStats,
  generateDetailSections,
};
