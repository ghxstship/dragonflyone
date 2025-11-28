"use client";

import React from "react";
import clsx from "clsx";

export interface BulkAction {
  /** Unique action identifier */
  id: string;
  /** Display label */
  label: string;
  /** Icon (emoji or component) */
  icon?: React.ReactNode;
  /** Action variant for styling */
  variant?: "default" | "danger";
  /** Whether action is disabled */
  disabled?: boolean;
  /** Requires confirmation before executing */
  requiresConfirmation?: boolean;
  /** Confirmation message */
  confirmationMessage?: string;
}

export interface BulkActionBarProps {
  /** Number of selected items */
  selectedCount: number;
  /** Available bulk actions */
  actions: BulkAction[];
  /** Action click handler */
  onAction: (actionId: string) => void;
  /** Clear selection handler */
  onClearSelection: () => void;
  /** Entity name for display (e.g., "items", "records") */
  entityName?: string;
  /** Whether any action is currently loading */
  loading?: boolean;
  /** Currently loading action ID */
  loadingActionId?: string;
  /** Position of the bar */
  position?: "top" | "bottom" | "floating";
  /** Custom className */
  className?: string;
}

const positionClasses = {
  top: "sticky top-0 z-dropdown",
  bottom: "sticky bottom-0 z-dropdown",
  floating: "fixed bottom-8 left-1/2 -translate-x-1/2 z-fixed shadow-hard-lg",
};

export function BulkActionBar({
  selectedCount,
  actions,
  onAction,
  onClearSelection,
  entityName = "items",
  loading = false,
  loadingActionId,
  position = "top",
  className = "",
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={clsx(
        "flex items-center justify-between gap-gap-md px-spacing-4 py-spacing-3 bg-black text-white border-2 border-white rounded-[var(--radius-card)] shadow-[4px_4px_0_rgba(255,255,255,0.2)]",
        positionClasses[position],
        className
      )}
    >
      {/* Selection info */}
      <div className="flex items-center gap-gap-md">
        <span className="font-code text-mono-md tracking-wide">
          <strong className="font-weight-bold">{selectedCount}</strong> {entityName} selected
        </span>

        <button
          type="button"
          onClick={onClearSelection}
          disabled={loading}
          className={clsx(
            "px-spacing-2 py-spacing-1 font-code text-mono-sm tracking-wide uppercase bg-transparent text-grey-300 border-none underline transition-colors duration-fast",
            loading ? "cursor-not-allowed" : "cursor-pointer hover:text-white"
          )}
        >
          Clear
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-gap-xs flex-wrap">
        {actions.map((action) => {
          const isLoading = loading && loadingActionId === action.id;
          const isDisabled = action.disabled || loading;

          return (
            <button
              key={action.id}
              type="button"
              onClick={() => onAction(action.id)}
              disabled={isDisabled}
              className={clsx(
                "flex items-center gap-gap-xs px-spacing-3 py-spacing-2 font-code text-mono-sm tracking-wide uppercase border-2 rounded-[var(--radius-button)] whitespace-nowrap transition-all duration-100 ease-[var(--ease-bounce)]",
                action.variant === "danger"
                  ? "bg-white text-black border-white shadow-[2px_2px_0_rgba(255,255,255,0.2)] hover:bg-grey-100 hover:-translate-x-0.5 hover:-translate-y-0.5"
                  : "bg-grey-800 text-white border-grey-600 shadow-[2px_2px_0_rgba(255,255,255,0.1)] hover:bg-grey-700 hover:-translate-x-0.5 hover:-translate-y-0.5",
                isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
              )}
            >
              {isLoading ? (
                <span className="inline-block w-spacing-3 h-spacing-3 border-2 border-grey-500 border-t-white rounded-full animate-spin" />
              ) : action.icon ? (
                <span className="text-body-sm">{action.icon}</span>
              ) : null}
              {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default BulkActionBar;
