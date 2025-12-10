"use client";

import React, { useState } from "react";
import clsx from "clsx";
import { Plus, X } from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================

export interface QuickAddAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: string;
}

export interface QuickAddFabProps {
  /** Actions to display when expanded */
  actions: QuickAddAction[];
  /** Position of the FAB */
  position?: "bottom-right" | "bottom-left" | "bottom-center";
  /** Whether the FAB is expanded */
  expanded?: boolean;
  /** Called when expanded state changes */
  onExpandedChange?: (expanded: boolean) => void;
  /** Additional class name */
  className?: string;
}

// =============================================================================
// QUICK ADD FAB
// =============================================================================

export function QuickAddFab({
  actions,
  position = "bottom-right",
  expanded: controlledExpanded,
  onExpandedChange,
  className,
}: QuickAddFabProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const expanded = controlledExpanded ?? internalExpanded;

  const handleToggle = () => {
    const newExpanded = !expanded;
    setInternalExpanded(newExpanded);
    onExpandedChange?.(newExpanded);
  };

  const handleActionClick = (action: QuickAddAction) => {
    action.onClick();
    setInternalExpanded(false);
    onExpandedChange?.(false);
  };

  const positionClasses = {
    "bottom-right": "bottom-spacing-6 right-spacing-6",
    "bottom-left": "bottom-spacing-6 left-spacing-6",
    "bottom-center": "bottom-spacing-6 left-1/2 -translate-x-1/2",
  };

  return (
    <div className={clsx(
      "fixed z-fab",
      positionClasses[position],
      className
    )}>
      {/* Action Buttons */}
      <div className={clsx(
        "flex flex-col-reverse gap-gap-sm mb-spacing-3 transition-all duration-200",
        expanded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-spacing-4 pointer-events-none"
      )}>
        {actions.map((action, index) => (
          <button
            key={action.id}
            onClick={() => handleActionClick(action)}
            className={clsx(
              "flex items-center gap-gap-sm px-spacing-4 py-spacing-3 bg-surface-primary border-2 border-border-primary rounded-button shadow-md cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-spacing-1",
              "animate-slide-up-bounce"
            )}
            style={{ 
              animationDelay: `${index * 50}ms`,
              animationFillMode: "backwards"
            }}
          >
            <span 
              className="flex items-center justify-center size-8 rounded-avatar text-white"
              style={{ backgroundColor: action.color || "var(--color-primary-500)" }}
            >
              {action.icon}
            </span>
            <span className="font-code text-mono-sm text-text-primary whitespace-nowrap">
              {action.label}
            </span>
          </button>
        ))}
      </div>

      {/* Main FAB Button */}
      <button
        onClick={handleToggle}
        className={clsx(
          "flex items-center justify-center size-14 rounded-avatar border-2 shadow-lg cursor-pointer transition-all duration-200",
          "hover:shadow-xl hover:scale-105 active:scale-95",
          expanded
            ? "bg-surface-inverse border-border-primary text-text-inverse rotate-45"
            : "bg-primary-500 border-primary-600 text-white rotate-0"
        )}
      >
        {expanded ? <X className="size-6" /> : <Plus className="size-6" />}
      </button>

      {/* Backdrop when expanded */}
      {expanded && (
        <div 
          className="fixed inset-0 bg-black/20 -z-10"
          onClick={handleToggle}
        />
      )}
    </div>
  );
}

export default QuickAddFab;
