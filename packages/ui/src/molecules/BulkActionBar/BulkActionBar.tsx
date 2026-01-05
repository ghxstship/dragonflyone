"use client";

import React, { useState } from "react";
import { bulkActionBarVariants, bulkActionBarActionVariants } from "./BulkActionBar.variants.js";
import type { BulkActionBarProps } from "./BulkActionBar.types.js";

/**
 * BulkActionBar component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Floating positioning support
 * - Confirmation dialogs for dangerous actions
 * - Loading states
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <BulkActionBar
 *   selectedCount={5}
 *   entityName="records"
 *   actions={[
 *     { id: 'delete', label: 'Delete', variant: 'danger', requiresConfirmation: true },
 *     { id: 'export', label: 'Export', variant: 'default' }
 *   ]}
 *   onAction={(id) => console.log('Action:', id)}
 *   onClearSelection={() => console.log('Clear')}
 * />
 * ```
 */
export function BulkActionBar({
  selectedCount,
  actions,
  onAction,
  onClearSelection,
  entityName = "items",
  loading = false,
  loadingActionId,
  position = "bottom",
  inverted = false,
  className,
}: BulkActionBarProps) {
  const [confirmingAction, setConfirmingAction] = useState<string | null>(null);

  const handleActionClick = (actionId: string) => {
    const action = actions.find(a => a.id === actionId);
    if (!action) return;

    if (action.requiresConfirmation) {
      setConfirmingAction(actionId);
    } else {
      onAction(actionId);
    }
  };

  const handleConfirmAction = () => {
    if (confirmingAction) {
      onAction(confirmingAction);
      setConfirmingAction(null);
    }
  };

  const handleCancelAction = () => {
    setConfirmingAction(null);
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className={bulkActionBarVariants({ position, inverted, className })}>
      {/* Selection Info */}
      <div className="flex items-center gap-2">
        <span className="font-medium">
          {selectedCount} {entityName} selected
        </span>
        <button
          onClick={onClearSelection}
          className="text-sm text-text-muted hover:text-text-primary transition-colors duration-[var(--duration-fast)]"
        >
          Clear selection
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {actions.map((action) => {
          const isLoading = loading && loadingActionId === action.id;
          const isConfirming = confirmingAction === action.id;

          return (
            <React.Fragment key={action.id}>
              {isConfirming ? (
                // Confirmation dialog
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {action.confirmationMessage || `Are you sure you want to ${action.label.toLowerCase()}?`}
                  </span>
                  <button
                    onClick={handleConfirmAction}
                    className={bulkActionBarActionVariants({ 
                      variant: action.variant === "danger" ? "danger" : "primary",
                      disabled: isLoading,
                      inverted 
                    })}
                  >
                    Confirm
                  </button>
                  <button
                    onClick={handleCancelAction}
                    className={bulkActionBarActionVariants({ 
                      variant: "default",
                      disabled: isLoading,
                      inverted 
                    })}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                // Regular action button
                <button
                  onClick={() => handleActionClick(action.id)}
                  disabled={action.disabled || isLoading}
                  className={bulkActionBarActionVariants({ 
                    variant: action.variant,
                    disabled: action.disabled || isLoading,
                    loading: isLoading,
                    inverted 
                  })}
                >
                  {action.icon && <span>{action.icon}</span>}
                  <span>{action.label}</span>
                  {isLoading && (
                    <span className="animate-spin">⏳</span>
                  )}
                </button>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
