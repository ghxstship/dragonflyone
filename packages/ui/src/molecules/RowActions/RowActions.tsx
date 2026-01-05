"use client";

import React, { useState, useRef, useEffect } from "react";
import { Settings, ChevronUp, ChevronDown, MoreVertical } from "lucide-react";
import { 
  rowActionsVariants,
  rowActionsTriggerVariants,
  rowActionsDropdownVariants,
  rowActionsDropdownContentVariants,
  rowActionsActionVariants,
  rowActionsActionIconVariants,
  rowActionsActionLabelVariants,
  rowActionsShortcutVariants,
  rowActionsDividerVariants 
} from "./RowActions.variants.js";
import type { 
  RowActionsProps, 
  RowAction,
  RowActionsTriggerVariant,
  RowActionsAlignment,
  RowActionsSize 
} from "./RowActions.types.js";

/**
 * RowActions component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Row actions dropdown with keyboard navigation
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <RowActions
 *   row={rowData}
 *   actions={actions}
 *   onAction={(id, row) => console.log('Action:', id, row)}
 *   triggerVariant="dots"
 *   inverted={false}
 * />
 * ```
 */
export function RowActions<T = unknown>({
  row,
  actions,
  onAction,
  triggerVariant = "dots" as RowActionsTriggerVariant,
  triggerLabel,
  align = "right" as RowActionsAlignment,
  size = "sm" as RowActionsSize,
  inverted = false,
  className,
}: RowActionsProps<T>) {
  // State
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter visible actions
  const visibleActions = actions.filter(action => {
    if (typeof action.hidden === 'function') {
      return !action.hidden(row);
    }
    return !action.hidden;
  });

  // Check if action is disabled
  const isActionDisabled = (action: RowAction<T>) => {
    if (typeof action.disabled === 'function') {
      return action.disabled(row);
    }
    return action.disabled || false;
  };

  // Handle trigger click
  const handleTriggerClick = () => {
    setIsOpen(!isOpen);
    setFocusedIndex(-1);
  };

  // Handle action click
  const handleActionClick = (action: RowAction<T>) => {
    if (!isActionDisabled(action)) {
      onAction(action.id, row);
      setIsOpen(false);
      setFocusedIndex(-1);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => {
          const nextIndex = prev + 1;
          return nextIndex < visibleActions.length ? nextIndex : 0;
        });
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => {
          const nextIndex = prev - 1;
          return nextIndex >= 0 ? nextIndex : visibleActions.length - 1;
        });
        break;
      
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < visibleActions.length) {
          const action = visibleActions[focusedIndex];
          if (!isActionDisabled(action)) {
            handleActionClick(action);
          }
        }
        break;
      
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        triggerRef.current?.focus();
        break;
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle focus management
  useEffect(() => {
    if (isOpen && focusedIndex >= 0) {
      const actionElements = dropdownRef.current?.querySelectorAll('[data-action-index]');
      const element = actionElements?.[focusedIndex] as HTMLElement;
      element?.focus();
    }
  }, [focusedIndex, isOpen]);

  // Get trigger icon
  const getTriggerIcon = () => {
    switch (triggerVariant) {
      case 'icon':
        return <Settings className="w-4 h-4" />;
      case 'dots':
        return <MoreVertical className="w-4 h-4" />;
      default:
        return isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
    }
  };

  return (
    <div className={rowActionsVariants({ inverted, className })}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        className={rowActionsTriggerVariants({ 
          variant: triggerVariant, 
          size, 
          open: isOpen, 
          inverted 
        })}
        onClick={handleTriggerClick}
        onKeyDown={handleKeyDown}
        aria-label="Actions"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {triggerLabel && (
          <span className="mr-2">{triggerLabel}</span>
        )}
        {getTriggerIcon()}
      </button>

      {/* Dropdown */}
      <div
        ref={dropdownRef}
        className={rowActionsDropdownVariants({ 
          align, 
          open: isOpen, 
          inverted 
        })}
        role="menu"
      >
        <div className={rowActionsDropdownContentVariants({ inverted })}>
          {visibleActions.map((action, index) => {
            const disabled = isActionDisabled(action);
            
            return (
              <React.Fragment key={action.id}>
                {/* Divider */}
                {action.divider && index > 0 && (
                  <div className={rowActionsDividerVariants({ inverted })} />
                )}
                
                {/* Action */}
                <button
                  data-action-index={index}
                  className={rowActionsActionVariants({ 
                    variant: action.variant, 
                    disabled, 
                    size, 
                    inverted 
                  })}
                  onClick={() => handleActionClick(action)}
                  disabled={disabled}
                  role="menuitem"
                  aria-disabled={disabled}
                >
                  {/* Icon */}
                  {action.icon && (
                    <div className={rowActionsActionIconVariants({ inverted })}>
                      {action.icon}
                    </div>
                  )}
                  
                  {/* Label */}
                  <span className={rowActionsActionLabelVariants({ inverted })}>
                    {action.label}
                  </span>
                  
                  {/* Shortcut */}
                  {action.shortcut && (
                    <span className={rowActionsShortcutVariants({ inverted })}>
                      {action.shortcut}
                    </span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
