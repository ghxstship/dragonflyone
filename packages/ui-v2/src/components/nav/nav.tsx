/**
 * Nav Component
 * Primary navigation with active state support
 */

'use client';

import React, { forwardRef } from 'react';
import { Box } from '../../primitives/box';
import { cn } from '../../utils/cn';

export interface NavItem {
  /**
   * Item key
   */
  key: string;

  /**
   * Item label
   */
  label: React.ReactNode;

  /**
   * Item href (for links)
   */
  href?: string;

  /**
   * Item icon
   */
  icon?: React.ReactNode;

  /**
   * Whether item is disabled
   */
  disabled?: boolean;

  /**
   * Click handler
   */
  onClick?: () => void;
}

export interface NavProps {
  /**
   * Navigation items
   */
  items: NavItem[];

  /**
   * Active item key
   */
  activeKey?: string;

  /**
   * Orientation
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Additional class names
   */
  className?: string;
}

const orientationStyles = {
  horizontal: 'flex-row',
  vertical: 'flex-col',
};

const sizeStyles = {
  sm: 'text-sm gap-1',
  md: 'text-base gap-2',
  lg: 'text-lg gap-3',
};

const itemSizeStyles = {
  sm: 'px-3 py-1.5',
  md: 'px-4 py-2',
  lg: 'px-5 py-3',
};

export const Nav = forwardRef<HTMLElement, NavProps>(function Nav(
  { items, activeKey, orientation = 'horizontal', size = 'md', className },
  ref
) {
  return (
    <Box
      as="nav"
      ref={ref}
      className={cn(
        'flex',
        orientationStyles[orientation],
        sizeStyles[size],
        className
      )}
    >
      {items.map((item) => {
        const isActive = item.key === activeKey;
        const Component = item.href ? 'a' : 'button';

        return (
          <Component
            key={item.key}
            href={item.href}
            onClick={item.onClick}
            disabled={item.disabled}
            className={cn(
              'flex items-center gap-2 rounded-md transition-all',
              'font-medium',
              itemSizeStyles[size],
              isActive
                ? 'bg-surface-selected text-text-primary'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover',
              item.disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
              !item.href && 'border-none bg-transparent cursor-pointer'
            )}
          >
            {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
            <span>{item.label}</span>
          </Component>
        );
      })}
    </Box>
  );
});
