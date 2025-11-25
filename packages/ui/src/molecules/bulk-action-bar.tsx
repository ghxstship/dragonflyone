"use client";

import React from "react";
import { colors, typography, fontSizes, letterSpacing, transitions, borderWidths } from "../tokens.js";

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

  const positionStyles: React.CSSProperties = {
    top: { position: "sticky", top: 0, zIndex: 100 },
    bottom: { position: "sticky", bottom: 0, zIndex: 100 },
    floating: {
      position: "fixed",
      bottom: "2rem",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 1000,
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
    },
  }[position] as React.CSSProperties;

  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        padding: "0.75rem 1rem",
        backgroundColor: colors.black,
        color: colors.white,
        border: `${borderWidths.medium} solid ${colors.black}`,
        ...positionStyles,
      }}
    >
      {/* Selection info */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <span
          style={{
            fontFamily: typography.mono,
            fontSize: fontSizes.monoMD,
            letterSpacing: letterSpacing.wide,
          }}
        >
          <strong style={{ fontWeight: 700 }}>{selectedCount}</strong> {entityName} selected
        </span>

        <button
          type="button"
          onClick={onClearSelection}
          disabled={loading}
          style={{
            padding: "0.25rem 0.5rem",
            fontFamily: typography.mono,
            fontSize: fontSizes.monoSM,
            letterSpacing: letterSpacing.wide,
            textTransform: "uppercase",
            backgroundColor: "transparent",
            color: colors.grey400,
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            textDecoration: "underline",
            transition: transitions.fast,
          }}
        >
          Clear
        </button>
      </div>

      {/* Actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          flexWrap: "wrap",
        }}
      >
        {actions.map((action) => {
          const isLoading = loading && loadingActionId === action.id;
          const isDisabled = action.disabled || loading;

          return (
            <button
              key={action.id}
              type="button"
              onClick={() => onAction(action.id)}
              disabled={isDisabled}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                padding: "0.5rem 0.75rem",
                fontFamily: typography.mono,
                fontSize: fontSizes.monoSM,
                letterSpacing: letterSpacing.wide,
                textTransform: "uppercase",
                backgroundColor: action.variant === "danger" ? colors.white : colors.grey800,
                color: action.variant === "danger" ? colors.black : colors.white,
                border: `1px solid ${action.variant === "danger" ? colors.white : colors.grey600}`,
                cursor: isDisabled ? "not-allowed" : "pointer",
                opacity: isDisabled ? 0.5 : 1,
                transition: transitions.fast,
                whiteSpace: "nowrap",
              }}
            >
              {isLoading ? (
                <span
                  style={{
                    display: "inline-block",
                    width: "12px",
                    height: "12px",
                    border: `2px solid ${colors.grey500}`,
                    borderTopColor: colors.white,
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
              ) : action.icon ? (
                <span style={{ fontSize: "14px" }}>{action.icon}</span>
              ) : null}
              {action.label}
            </button>
          );
        })}
      </div>

      <style>
        {`@keyframes spin { to { transform: rotate(360deg); } }`}
      </style>
    </div>
  );
}

export default BulkActionBar;
