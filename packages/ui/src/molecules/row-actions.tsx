"use client";

import React, { useState, useRef, useEffect } from "react";
import { colors, typography, fontSizes, letterSpacing, transitions, borderWidths } from "../tokens.js";

export interface RowAction<T = unknown> {
  /** Unique action identifier */
  id: string;
  /** Display label */
  label: string;
  /** Icon (emoji or component) */
  icon?: React.ReactNode;
  /** Action variant for styling */
  variant?: "default" | "danger";
  /** Whether action is disabled */
  disabled?: boolean | ((row: T) => boolean);
  /** Whether action is hidden */
  hidden?: boolean | ((row: T) => boolean);
  /** Keyboard shortcut hint */
  shortcut?: string;
  /** Divider before this action */
  divider?: boolean;
}

export interface RowActionsProps<T = unknown> {
  /** Row data */
  row: T;
  /** Available actions */
  actions: RowAction<T>[];
  /** Action click handler */
  onAction: (actionId: string, row: T) => void;
  /** Trigger button variant */
  triggerVariant?: "icon" | "text" | "dots";
  /** Trigger button label (for text variant) */
  triggerLabel?: string;
  /** Dropdown alignment */
  align?: "left" | "right";
  /** Size variant */
  size?: "sm" | "md";
  /** Custom className */
  className?: string;
}

export function RowActions<T = unknown>({
  row,
  actions,
  onAction,
  triggerVariant = "dots",
  triggerLabel = "Actions",
  align = "right",
  size = "md",
  className = "",
}: RowActionsProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter visible actions
  const visibleActions = actions.filter((action) => {
    if (typeof action.hidden === "function") {
      return !action.hidden(row);
    }
    return !action.hidden;
  });

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleActionClick = (actionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setIsOpen(false);
    onAction(actionId, row);
  };

  const sizeStyles = {
    sm: {
      triggerPadding: "0.25rem",
      itemPadding: "0.5rem 0.75rem",
      fontSize: fontSizes.monoXS,
    },
    md: {
      triggerPadding: "0.375rem",
      itemPadding: "0.625rem 1rem",
      fontSize: fontSizes.monoSM,
    },
  }[size];

  const renderTrigger = () => {
    const baseStyle: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: sizeStyles.triggerPadding,
      backgroundColor: isOpen ? colors.grey100 : "transparent",
      border: "none",
      cursor: "pointer",
      transition: transitions.fast,
      borderRadius: 0,
    };

    if (triggerVariant === "dots") {
      return (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          style={baseStyle}
          aria-label="Row actions"
          aria-expanded={isOpen}
          aria-haspopup="menu"
        >
          <span style={{ fontSize: size === "sm" ? "16px" : "20px", letterSpacing: "2px" }}>⋮</span>
        </button>
      );
    }

    if (triggerVariant === "icon") {
      return (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          style={baseStyle}
          aria-label="Row actions"
          aria-expanded={isOpen}
          aria-haspopup="menu"
        >
          <span style={{ fontSize: size === "sm" ? "14px" : "16px" }}>⚙️</span>
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        style={{
          ...baseStyle,
          padding: `${sizeStyles.triggerPadding} 0.75rem`,
          fontFamily: typography.mono,
          fontSize: sizeStyles.fontSize,
          letterSpacing: letterSpacing.wide,
          textTransform: "uppercase",
          border: `1px solid ${colors.grey300}`,
        }}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {triggerLabel}
        <span style={{ marginLeft: "0.25rem", fontSize: "10px" }}>{isOpen ? "▲" : "▼"}</span>
      </button>
    );
  };

  if (visibleActions.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "relative",
        display: "inline-block",
      }}
    >
      {renderTrigger()}

      {/* Dropdown menu */}
      {isOpen && (
        <div
          role="menu"
          style={{
            position: "absolute",
            top: "100%",
            [align === "right" ? "right" : "left"]: 0,
            marginTop: "4px",
            minWidth: "160px",
            backgroundColor: colors.white,
            border: `${borderWidths.medium} solid ${colors.black}`,
            boxShadow: "4px 4px 0 0 #000000",
            zIndex: 100,
          }}
        >
          {visibleActions.map((action, index) => {
            const isDisabled =
              typeof action.disabled === "function" ? action.disabled(row) : action.disabled;

            return (
              <React.Fragment key={action.id}>
                {action.divider && index > 0 && (
                  <div
                    style={{
                      height: "1px",
                      backgroundColor: colors.grey200,
                      margin: "0.25rem 0",
                    }}
                  />
                )}
                <button
                  type="button"
                  role="menuitem"
                  onClick={(e) => !isDisabled && handleActionClick(action.id, e)}
                  disabled={isDisabled}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: sizeStyles.itemPadding,
                    fontFamily: typography.body,
                    fontSize: sizeStyles.fontSize,
                    textAlign: "left",
                    backgroundColor: colors.white,
                    color: action.variant === "danger" ? colors.grey700 : colors.grey800,
                    border: "none",
                    borderBottom: `1px solid ${colors.grey200}`,
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    opacity: isDisabled ? 0.5 : 1,
                    transition: transitions.fast,
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {action.icon && <span style={{ fontSize: "14px" }}>{action.icon}</span>}
                    {action.label}
                  </span>
                  {action.shortcut && (
                    <span
                      style={{
                        fontFamily: typography.mono,
                        fontSize: fontSizes.monoXS,
                        color: colors.grey500,
                      }}
                    >
                      {action.shortcut}
                    </span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default RowActions;
