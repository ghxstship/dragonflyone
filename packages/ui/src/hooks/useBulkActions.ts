"use client";

import { useState, useCallback } from "react";

export interface BulkActionResult {
  entityId: string;
  success: boolean;
  error?: string;
}

export interface UseBulkActionsOptions<T> {
  /** Function to get entity ID from row */
  getEntityId: (row: T) => string;
  /** Callback when action starts */
  onActionStart?: (actionId: string, entityIds: string[]) => void;
  /** Callback when action completes */
  onActionComplete?: (actionId: string, results: BulkActionResult[]) => void;
  /** Callback when action fails */
  onActionError?: (actionId: string, error: Error) => void;
  /** Confirmation handler - return true to proceed */
  onConfirm?: (actionId: string, entityIds: string[], message?: string) => Promise<boolean>;
}

export interface BulkActionConfig {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "danger";
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
  handler: (entityIds: string[]) => Promise<BulkActionResult[]>;
}

export interface UseBulkActionsReturn<T> {
  // Selection
  selectedIds: string[];
  selectedCount: number;
  isSelected: (row: T) => boolean;
  toggleSelection: (row: T) => void;
  selectAll: (rows: T[]) => void;
  clearSelection: () => void;
  selectRows: (rows: T[]) => void;
  
  // Actions
  executeAction: (actionId: string) => Promise<void>;
  isExecuting: boolean;
  currentActionId: string | null;
  
  // Results
  lastResults: BulkActionResult[] | null;
  successCount: number;
  failureCount: number;
  
  // Registration
  registerAction: (config: BulkActionConfig) => void;
  unregisterAction: (actionId: string) => void;
  getActions: () => BulkActionConfig[];
}

export function useBulkActions<T>({
  getEntityId,
  onActionStart,
  onActionComplete,
  onActionError,
  onConfirm,
}: UseBulkActionsOptions<T>): UseBulkActionsReturn<T> {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentActionId, setCurrentActionId] = useState<string | null>(null);
  const [lastResults, setLastResults] = useState<BulkActionResult[] | null>(null);
  const [actions, setActions] = useState<Map<string, BulkActionConfig>>(new Map());

  // Selection handlers
  const isSelected = useCallback((row: T): boolean => {
    return selectedIds.includes(getEntityId(row));
  }, [selectedIds, getEntityId]);

  const toggleSelection = useCallback((row: T) => {
    const id = getEntityId(row);
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      return [...prev, id];
    });
  }, [getEntityId]);

  const selectAll = useCallback((rows: T[]) => {
    setSelectedIds(rows.map(getEntityId));
  }, [getEntityId]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const selectRows = useCallback((rows: T[]) => {
    setSelectedIds(rows.map(getEntityId));
  }, [getEntityId]);

  // Action registration
  const registerAction = useCallback((config: BulkActionConfig) => {
    setActions(prev => {
      const next = new Map(prev);
      next.set(config.id, config);
      return next;
    });
  }, []);

  const unregisterAction = useCallback((actionId: string) => {
    setActions(prev => {
      const next = new Map(prev);
      next.delete(actionId);
      return next;
    });
  }, []);

  const getActions = useCallback((): BulkActionConfig[] => {
    return Array.from(actions.values());
  }, [actions]);

  // Execute action
  const executeAction = useCallback(async (actionId: string) => {
    const action = actions.get(actionId);
    if (!action) {
      console.error(`Action ${actionId} not found`);
      return;
    }

    if (selectedIds.length === 0) {
      console.warn("No items selected");
      return;
    }

    // Confirmation
    if (action.requiresConfirmation && onConfirm) {
      const confirmed = await onConfirm(
        actionId,
        selectedIds,
        action.confirmationMessage
      );
      if (!confirmed) return;
    }

    setIsExecuting(true);
    setCurrentActionId(actionId);
    setLastResults(null);

    try {
      onActionStart?.(actionId, selectedIds);
      
      const results = await action.handler(selectedIds);
      
      setLastResults(results);
      onActionComplete?.(actionId, results);
      
      // Clear selection for successful items
      const successfulIds = results
        .filter(r => r.success)
        .map(r => r.entityId);
      
      setSelectedIds(prev => prev.filter(id => !successfulIds.includes(id)));
    } catch (error) {
      onActionError?.(actionId, error as Error);
    } finally {
      setIsExecuting(false);
      setCurrentActionId(null);
    }
  }, [actions, selectedIds, onConfirm, onActionStart, onActionComplete, onActionError]);

  // Computed values
  const successCount = lastResults?.filter(r => r.success).length ?? 0;
  const failureCount = lastResults?.filter(r => !r.success).length ?? 0;

  return {
    selectedIds,
    selectedCount: selectedIds.length,
    isSelected,
    toggleSelection,
    selectAll,
    clearSelection,
    selectRows,
    executeAction,
    isExecuting,
    currentActionId,
    lastResults,
    successCount,
    failureCount,
    registerAction,
    unregisterAction,
    getActions,
  };
}

export default useBulkActions;
