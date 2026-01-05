"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { 
  quickAddFabVariants,
  quickAddFabActionsContainerVariants,
  quickAddFabActionVariants,
  quickAddFabActionLabelVariants,
  quickAddFabMainButtonVariants,
  quickAddFabIconVariants 
} from "./QuickAddFab.variants.js";
import type { 
  QuickAddFabProps, 
  QuickAddAction,
  QuickAddFabPosition 
} from "./QuickAddFab.types.js";

/**
 * QuickAddFab component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Floating action button with expandable actions
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <QuickAddFab
 *   actions={[
 *     { id: '1', label: 'Add Item', icon: <Plus />, onClick: () => {} },
 *     { id: '2', label: 'Upload', icon: <Upload />, onClick: () => {} }
 *   ]}
 *   position="bottom-right"
 *   inverted={false}
 * />
 * ```
 */
export function QuickAddFab({
  actions,
  position = "bottom-right" as QuickAddFabPosition,
  expanded: controlledExpanded,
  onExpandedChange,
  inverted = false,
  className,
}: QuickAddFabProps) {
  // State
  const [internalExpanded, setInternalExpanded] = useState(false);
  const expanded = controlledExpanded ?? internalExpanded;

  // Handle toggle
  const handleToggle = () => {
    const newExpanded = !expanded;
    setInternalExpanded(newExpanded);
    onExpandedChange?.(newExpanded);
  };

  // Handle action click
  const handleActionClick = (action: QuickAddAction) => {
    action.onClick();
    // Close the FAB after action is clicked
    if (controlledExpanded === undefined) {
      setInternalExpanded(false);
      onExpandedChange?.(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && expanded) {
      handleToggle();
    }
  };

  return (
    <div 
      className={quickAddFabVariants({ position, inverted, className })}
      onKeyDown={handleKeyDown}
    >
      {/* Actions */}
      <div className={quickAddFabActionsContainerVariants({ expanded, inverted })}>
        {actions.map((action, index) => (
          <button
            key={action.id}
            className={quickAddFabActionVariants({ inverted })}
            onClick={() => handleActionClick(action)}
            style={{
              animationDelay: expanded ? `${index * 50}ms` : '0ms',
              animation: expanded ? 'slideUp 0.3s ease-out forwards' : 'none',
            }}
            title={action.label}
            aria-label={action.label}
          >
            {/* Action Icon */}
            <div 
              className="flex items-center justify-center w-8 h-8 rounded-full text-white"
              style={{ backgroundColor: action.color || 'var(--color-brand-primary)' }}
            >
              {action.icon}
            </div>
            
            {/* Action Label */}
            <span className={quickAddFabActionLabelVariants({ inverted })}>
              {action.label}
            </span>
          </button>
        ))}
      </div>

      {/* Main FAB Button */}
      <button
        className={quickAddFabMainButtonVariants({ expanded, inverted })}
        onClick={handleToggle}
        title={expanded ? "Close quick add" : "Open quick add"}
        aria-label={expanded ? "Close quick add" : "Open quick add"}
        aria-expanded={expanded}
        aria-haspopup="true"
      >
        <div className={quickAddFabIconVariants({ inverted })}>
          {expanded ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </div>
      </button>

      {/* Add slide up animation styles */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
