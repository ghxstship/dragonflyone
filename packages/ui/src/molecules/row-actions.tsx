"use client";

import React, { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import { Settings, ChevronUp, ChevronDown, MoreVertical } from "lucide-react";

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
  /** Inverted theme (dark background) */
  inverted?: boolean;
  /** Custom className */
  className?: string;
}

const sizeClasses = {
  sm: {
    trigger: "p-spacing-1",
    item: "px-spacing-3 py-spacing-2 text-mono-xs",
    icon: "text-body-sm",
    triggerIcon: "text-mono-sm",
  },
  md: {
    trigger: "p-spacing-1",
    item: "px-spacing-4 py-spacing-2 text-mono-sm",
    icon: "text-body-sm",
    triggerIcon: "text-body-lg",
  },
};

export function RowActions<T = unknown>({
  row,
  actions,
  onAction,
  triggerVariant = "dots",
  triggerLabel = "Actions",
  align = "right",
  size = "md",
  inverted = false,
  className = "",
}: RowActionsProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const config = sizeClasses[size];

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

  const renderTrigger = () => {
    const baseClasses = clsx(
      "flex items-center justify-center border-none cursor-pointer transition-colors duration-fast",
      config.trigger,
      isOpen
        ? inverted ? "bg-grey-800" : "bg-grey-100"
        : inverted ? "bg-transparent hover:bg-grey-800" : "bg-transparent hover:bg-grey-100"
    );

    if (triggerVariant === "dots") {
      return (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className={baseClasses}
          aria-label="Row actions"
          aria-expanded={isOpen}
          aria-haspopup="menu"
        >
          <MoreVertical className={clsx(config.triggerIcon, "w-4 h-4")} />
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
          className={baseClasses}
          aria-label="Row actions"
          aria-expanded={isOpen}
          aria-haspopup="menu"
        >
          <Settings className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />
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
        className={clsx(
          baseClasses,
          "px-spacing-3 font-code tracking-wide uppercase border border-grey-300",
          size === "sm" ? "text-mono-xs" : "text-mono-sm"
        )}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {triggerLabel}
        {isOpen ? <ChevronUp className="ml-spacing-1 w-3 h-3" /> : <ChevronDown className="ml-spacing-1 w-3 h-3" />}
      </button>
    );
  };

  if (visibleActions.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className={clsx("relative inline-block", className)}
    >
      {renderTrigger()}

      {/* Dropdown menu */}
      {isOpen && (
        <div
          role="menu"
          className={clsx(
            "absolute top-full mt-spacing-1 min-w-container-sm border-2 shadow-hard z-dropdown",
            inverted ? "bg-ink-900 border-grey-600" : "bg-white border-black",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {visibleActions.map((action, index) => {
            const isDisabled =
              typeof action.disabled === "function" ? action.disabled(row) : action.disabled;

            return (
              <React.Fragment key={action.id}>
                {action.divider && index > 0 && (
                  <div className={clsx("h-px my-spacing-1", inverted ? "bg-grey-700" : "bg-grey-200")} />
                )}
                <button
                  type="button"
                  role="menuitem"
                  onClick={(e) => !isDisabled && handleActionClick(action.id, e)}
                  disabled={isDisabled}
                  className={clsx(
                    "flex items-center justify-between w-full text-left border-none border-b transition-colors duration-fast",
                    inverted ? "bg-ink-900 border-grey-700" : "bg-white border-grey-200",
                    config.item,
                    action.variant === "danger"
                      ? inverted ? "text-grey-400" : "text-grey-700"
                      : inverted ? "text-grey-200" : "text-grey-800",
                    isDisabled
                      ? "cursor-not-allowed opacity-50"
                      : inverted ? "cursor-pointer hover:bg-grey-800" : "cursor-pointer hover:bg-grey-100"
                  )}
                >
                  <span className="flex items-center gap-gap-xs">
                    {action.icon && <span className="text-mono-sm">{action.icon}</span>}
                    {action.label}
                  </span>
                  {action.shortcut && (
                    <span className={clsx("font-code text-mono-xs", inverted ? "text-grey-500" : "text-grey-500")}>
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
