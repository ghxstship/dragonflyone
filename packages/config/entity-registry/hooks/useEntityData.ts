/**
 * useEntityData Hook
 * 
 * SSOT-compliant data fetching hook that provides:
 * - entityIds: string[] - IDs only (never full objects)
 * - entitySelector: (id: string) => T | null - O(1) lookup function
 * 
 * This pattern ensures Views receive IDs and resolve entities on-demand,
 * maintaining a single source of truth for entity data.
 */

import { useMemo, useCallback } from 'react';
import type { EntityNameType } from '../entities';

// ============================================================================
// Types
// ============================================================================

export interface UseEntityDataOptions<T extends { id: string }> {
  /** Entity type from entity registry */
  entityType: EntityNameType;
  
  /** Raw data array from API/hook */
  data: T[] | undefined | null;
  
  /** Loading state from data source */
  isLoading?: boolean;
  
  /** Error state from data source */
  error?: Error | null;
  
  /** Refetch function from data source */
  refetch?: () => void;
}

export interface UseEntityDataResult<T extends { id: string }> {
  /** Entity IDs (SSOT - never full objects) */
  entityIds: string[];
  
  /** Entity type for Views */
  entityType: EntityNameType;
  
  /** O(1) entity lookup function */
  entitySelector: (id: string) => T | null;
  
  /** Loading state */
  isLoading: boolean;
  
  /** Error state */
  error: Error | null;
  
  /** Refetch function */
  refetch: () => void;
  
  /** Total count of entities */
  count: number;
  
  /** Check if an entity exists */
  hasEntity: (id: string) => boolean;
  
  /** Get multiple entities by IDs */
  getEntities: (ids: string[]) => T[];
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * SSOT-compliant data hook for ListPage and Views
 * 
 * Transforms raw data arrays into the entityIds + entitySelector pattern
 * required by BaseViewProps.
 * 
 * @example
 * ```tsx
 * // In a page component
 * const { items, isLoading, error, refetch } = useMyCredentials();
 * 
 * const {
 *   entityIds,
 *   entityType,
 *   entitySelector,
 *   isLoading: loading,
 *   error: err,
 * } = useEntityData({
 *   entityType: 'credentials',
 *   data: items,
 *   isLoading,
 *   error,
 *   refetch,
 * });
 * 
 * return (
 *   <ListPage
 *     entityType={entityType}
 *     entityIds={entityIds}
 *     entitySelector={entitySelector}
 *     isLoading={loading}
 *     error={err}
 *   />
 * );
 * ```
 */
export function useEntityData<T extends { id: string }>({
  entityType,
  data,
  isLoading = false,
  error = null,
  refetch,
}: UseEntityDataOptions<T>): UseEntityDataResult<T> {
  
  // Create entity map for O(1) lookup
  const entityMap = useMemo(() => {
    const map = new Map<string, T>();
    if (data) {
      data.forEach(item => {
        if (item && item.id) {
          map.set(item.id, item);
        }
      });
    }
    return map;
  }, [data]);
  
  // Extract IDs only (SSOT pattern)
  const entityIds = useMemo(() => {
    if (!data) return [];
    return data
      .filter(item => item && item.id)
      .map(item => item.id);
  }, [data]);
  
  // O(1) entity selector function
  const entitySelector = useCallback((id: string): T | null => {
    return entityMap.get(id) || null;
  }, [entityMap]);
  
  // Check if entity exists
  const hasEntity = useCallback((id: string): boolean => {
    return entityMap.has(id);
  }, [entityMap]);
  
  // Get multiple entities by IDs
  const getEntities = useCallback((ids: string[]): T[] => {
    return ids
      .map(id => entityMap.get(id))
      .filter((entity): entity is T => entity !== undefined);
  }, [entityMap]);
  
  // Default refetch function
  const handleRefetch = useCallback(() => {
    refetch?.();
  }, [refetch]);
  
  return {
    entityIds,
    entityType,
    entitySelector,
    isLoading,
    error,
    refetch: handleRefetch,
    count: entityIds.length,
    hasEntity,
    getEntities,
  };
}

export default useEntityData;
