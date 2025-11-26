"use client";

import React, { useState, useRef, useEffect } from "react";
import clsx from "clsx";

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

const sizeClasses = {
  sm: {
    trigger: "p-1",
    item: "px-3 py-2 text-mono-xs",
    icon: "text-base",
    triggerIcon: "text-sm",
  },
  md: {
    trigger: "p-1.5",
    item: "px-4 py-2.5 text-mono-sm",
    icon: "text-base",
    triggerIcon: "text-xl",
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
      isOpen ? "bg-grey-100" : "bg-transparent hover:bg-grey-100"
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
          <span className={clsx(config.triggerIcon, "tracking-widest")}>⋮</span>
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
          <span className={size === "sm" ? "text-sm" : "text-base"}>⚙️</span>
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
          "px-3 font-code tracking-wide uppercase border border-grey-300",
          size === "sm" ? "text-mono-xs" : "text-mono-sm"
        )}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {triggerLabel}
        <span className="ml-1 text-[10px]">{isOpen ? "▲" : "▼"}</span>
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
            "absolute top-full mt-1 min-w-[160px] bg-white border-2 border-black shadow-hard z-dropdown",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {visibleActions.map((action, index) => {
            const isDisabled =
              typeof action.disabled === "function" ? action.disabled(row) : action.disabled;

            return (
              <React.Fragment key={action.id}>
                {action.divider && index > 0 && (
                  <div className="h-px bg-grey-200 my-1" />
                )}
                <button
                  type="button"
                  role="menuitem"
                  onClick={(e) => !isDisabled && handleActionClick(action.id, e)}
                  disabled={isDisabled}
                  className={clsx(
                    "flex items-center justify-between w-full text-left bg-white border-none border-b border-grey-200 transition-colors duration-fast",
                    config.item,
                    action.variant === "danger" ? "text-grey-700" : "text-grey-800",
                    isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-grey-100"
                  )}
                >
                  <span className="flex items-center gap-2">
                    {action.icon && <span className="text-sm">{action.icon}</span>}
                    {action.label}
                  </span>
                  {action.shortcut && (
                    <span className="font-code text-mono-xs text-grey-500">
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
