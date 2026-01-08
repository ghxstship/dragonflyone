/**
 * Menu Component
 * Context menu or action menu
 */

'use client';

import React, { forwardRef, useRef, useEffect, useState } from 'react';
import { Box } from '../../primitives/box';
import { cn } from '../../utils/cn';

export interface MenuItem {
  /**
   * Item key
   */
  key: string;

  /**
   * Item label
   */
  label: React.ReactNode;

  /**
   * Item icon
   */
  icon?: React.ReactNode;

  /**
   * Item type
   */
  type?: 'item' | 'divider';

  /**
   * Whether item is disabled
   */
  disabled?: boolean;

  /**
   * Whether item is danger variant
   */
  danger?: boolean;

  /**
   * Keyboard shortcut
   */
  shortcut?: string;

  /**
   * Click handler
   */
  onClick?: () => void;

  /**
   * Sub menu items
   */
  children?: MenuItem[];
}

export interface MenuProps {
  /**
   * Menu items
   */
  items: MenuItem[];

  /**
   * Trigger element
   */
  trigger?: React.ReactElement;

  /**
   * Whether menu is open (controlled)
   */
  open?: boolean;

  /**
   * Open change handler
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Trigger type
   */
  triggerType?: 'click' | 'contextmenu';

  /**
   * Additional class names
   */
  className?: string;
}

const MenuItemComponent = forwardRef<
  HTMLButtonElement,
  {
    item: MenuItem;
    onSelect: () => void;
  }
>(function MenuItemComponent({ item, onSelect }, ref) {
  const [showSubmenu, setShowSubmenu] = useState(false);

  if (item.type === 'divider') {
    return <div className="h-px bg-border-primary my-1" />;
  }

  const hasChildren = item.children && item.children.length > 0;

  return (
    <div
      className="relative"
      onMouseEnter={() => hasChildren && setShowSubmenu(true)}
      onMouseLeave={() => hasChildren && setShowSubmenu(false)}
    >
      <button
        ref={ref}
        onClick={() => {
          if (!hasChildren) {
            item.onClick?.();
            onSelect();
          }
        }}
        disabled={item.disabled}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2 text-sm',
          'text-left transition-colors rounded-md',
          item.danger
            ? 'text-feedback-error hover:bg-feedback-error-bg'
            : 'text-text-primary hover:bg-surface-hover',
          item.disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
        )}
      >
        {item.icon && <span className="flex-shrink-0 w-4 h-4">{item.icon}</span>}
        <span className="flex-1">{item.label}</span>
        {item.shortcut && (
          <span className="text-xs text-text-secondary">{item.shortcut}</span>
        )}
        {hasChildren && (
          <span className="flex-shrink-0 text-xs text-text-secondary">▶</span>
        )}
      </button>

      {/* Submenu */}
      {hasChildren && showSubmenu && (
        <Box
          className={cn(
            'absolute left-full top-0 ml-1',
            'min-w-[200px] p-1',
            'bg-dropdown-bg border border-dropdown-border rounded-lg shadow-lg',
            'animate-in fade-in-0 zoom-in-95'
          )}
        >
          {item.children!.map((child) => (
            <MenuItemComponent
              key={child.key}
              item={child}
              onSelect={onSelect}
            />
          ))}
        </Box>
      )}
    </div>
  );
});

export const Menu = forwardRef<HTMLDivElement, MenuProps>(function Menu(
  {
    items,
    trigger,
    open: controlledOpen,
    onOpenChange,
    triggerType = 'click',
    className,
  },
  ref
) {
  const [internalOpen, setInternalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = (value: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(value);
    }
    onOpenChange?.(value);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleTrigger = (event: React.MouseEvent) => {
    if (triggerType === 'contextmenu') {
      event.preventDefault();
    }
    setOpen(!isOpen);
  };

  const handleSelect = () => {
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative inline-block">
      {trigger &&
        React.cloneElement(trigger, {
          ref: triggerRef,
          onClick: triggerType === 'click' ? handleTrigger : undefined,
          onContextMenu:
            triggerType === 'contextmenu' ? handleTrigger : undefined,
        })}

      {isOpen && (
        <Box
          ref={menuRef}
          role="menu"
          className={cn(
            'absolute z-dropdown mt-1',
            'min-w-[200px] p-1',
            'bg-dropdown-bg border border-dropdown-border rounded-lg shadow-lg',
            'animate-in fade-in-0 zoom-in-95',
            className
          )}
        >
          {items.map((item) => (
            <MenuItemComponent key={item.key} item={item} onSelect={handleSelect} />
          ))}
        </Box>
      )}
    </div>
  );
});
