/**
 * useEntityDetail Hook
 * 
 * SSOT-compliant single-entity data fetching hook that provides:
 * - entityId: string - The entity ID
 * - entity: T | null - The resolved entity
 * - entitySelector: (id: string) => T | null - O(1) lookup function
 * 
 * This pattern ensures DetailPage receives a single entity resolved on-demand,
 * maintaining a single source of truth for entity data.
 */

import { useMemo, useCallback } from 'react';
import type { EntityNameType } from '../entities';

// ============================================================================
// Types
// ============================================================================

export interface UseEntityDetailOptions<T extends { id: string }> {
  /** Entity type from entity registry */
  entityType: EntityNameType;
  
  /** Entity ID to fetch */
  entityId: string;
  
  /** Raw entity data from API/hook (single entity or from a list) */
  data: T | undefined | null;
  
  /** Loading state from data source */
  isLoading?: boolean;
  
  /** Error state from data source */
  error?: Error | null;
  
  /** Refetch function from data source */
  refetch?: () => void;
}

export interface UseEntityDetailResult<T extends { id: string }> {
  /** Entity ID */
  entityId: string;
  
  /** Entity type for Views */
  entityType: EntityNameType;
  
  /** The resolved entity (or null if not found/loading) */
  entity: T | null;
  
  /** O(1) entity lookup function (for consistency with list pattern) */
  entitySelector: (id: string) => T | null;
  
  /** Loading state */
  isLoading: boolean;
  
  /** Error state */
  error: Error | null;
  
  /** Refetch function */
  refetch: () => void;
  
  /** Whether entity exists */
  exists: boolean;
  
  /** Whether entity is not found (loaded but null) */
  notFound: boolean;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * SSOT-compliant detail hook for DetailPage
 * 
 * Provides a consistent interface for single-entity data access
 * that mirrors the list pattern (entityIds + entitySelector).
 * 
 * @example
 * ```tsx
 * // In a detail page component
 * const { data, isLoading, error, refetch } = useCrewMember(id);
 * 
 * const {
 *   entityId,
 *   entityType,
 *   entity,
 *   entitySelector,
 *   isLoading: loading,
 *   error: err,
 *   notFound,
 * } = useEntityDetail({
 *   entityType: 'crew',
 *   entityId: id,
 *   data,
 *   isLoading,
 *   error,
 *   refetch,
 * });
 * 
 * return (
 *   <DetailPage
 *     entityType={entityType}
 *     entityId={entityId}
 *     entitySelector={entitySelector}
 *     isLoading={loading}
 *     error={err}
 *     notFound={notFound}
 *   />
 * );
 * ```
 */
export function useEntityDetail<T extends { id: string }>({
  entityType,
  entityId,
  data,
  isLoading = false,
  error = null,
  refetch,
}: UseEntityDetailOptions<T>): UseEntityDetailResult<T> {
  
  // Create entity map for O(1) lookup (single entity, but consistent pattern)
  const entityMap = useMemo(() => {
    const map = new Map<string, T>();
    if (data && data.id) {
      map.set(data.id, data);
    }
    return map;
  }, [data]);
  
  // O(1) entity selector function
  const entitySelector = useCallback((id: string): T | null => {
    return entityMap.get(id) || null;
  }, [entityMap]);
  
  // Resolve the entity
  const entity = useMemo(() => {
    if (!data) return null;
    if (data.id === entityId) return data;
    return null;
  }, [data, entityId]);
  
  // Default refetch function
  const handleRefetch = useCallback(() => {
    refetch?.();
  }, [refetch]);
  
  // Determine not found state (finished loading but no entity)
  const notFound = !isLoading && !error && !entity;
  
  return {
    entityId,
    entityType,
    entity,
    entitySelector,
    isLoading,
    error,
    refetch: handleRefetch,
    exists: !!entity,
    notFound,
  };
}

export default useEntityDetail;
