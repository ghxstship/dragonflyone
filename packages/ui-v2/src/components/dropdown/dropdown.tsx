/**
 * Dropdown Component
 * Accessible dropdown menu
 */

'use client';

import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { Box } from '../../primitives/box';
import { cn } from '../../utils/cn';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  danger?: boolean;
}

export interface DropdownProps {
  /**
   * Dropdown items
   */
  items: DropdownItem[];

  /**
   * Trigger element
   */
  trigger: React.ReactElement;

  /**
   * Placement of dropdown
   */
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

  /**
   * Additional class names for dropdown
   */
  className?: string;
}

const placementStyles = {
  'bottom-start': 'top-full left-0 mt-1',
  'bottom-end': 'top-full right-0 mt-1',
  'top-start': 'bottom-full left-0 mb-1',
  'top-end': 'bottom-full right-0 mb-1',
};

export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(function Dropdown(
  { items, trigger, placement = 'bottom-start', className },
  ref
) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  const handleItemClick = (item: DropdownItem) => {
    if (!item.disabled && item.onClick) {
      item.onClick();
      setIsOpen(false);
    }
  };

  return (
    <div ref={dropdownRef} className="relative inline-block">
      {React.cloneElement(trigger, {
        onClick: () => setIsOpen(!isOpen),
        'aria-expanded': isOpen,
        'aria-haspopup': 'menu',
      })}

      {isOpen && (
        <Box
          role="menu"
          className={cn(
            'absolute z-dropdown min-w-[200px]',
            'bg-dropdown-bg border border-dropdown-border rounded-lg shadow-lg',
            'py-1',
            'animate-in fade-in-0 zoom-in-95',
            placementStyles[placement],
            className
          )}
        >
          {items.map((item) => (
            <button
              key={item.id}
              role="menuitem"
              disabled={item.disabled}
              onClick={() => handleItemClick(item)}
              className={cn(
                'w-full flex items-center gap-2 px-4 py-2 text-sm text-left',
                'transition-colors',
                item.disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : cn(
                      'hover:bg-dropdown-item-hover cursor-pointer',
                      item.danger
                        ? 'text-text-error hover:bg-surface-error-subtle'
                        : 'text-text-primary'
                    )
              )}
            >
              {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
              <span className="flex-1">{item.label}</span>
            </button>
          ))}
        </Box>
      )}
    </div>
  );
});
