/**
 * Sidebar Component
 * Collapsible side navigation
 */

'use client';

import React, { forwardRef, useState } from 'react';
import { Box } from '../../primitives/box';
import { Flex } from '../../primitives/flex';
import { cn } from '../../utils/cn';

export interface SidebarItem {
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
   * Item href (for links)
   */
  href?: string;

  /**
   * Badge content
   */
  badge?: React.ReactNode;

  /**
   * Whether item is disabled
   */
  disabled?: boolean;

  /**
   * Child items
   */
  children?: SidebarItem[];

  /**
   * Click handler
   */
  onClick?: () => void;
}

export interface SidebarProps {
  /**
   * Sidebar items
   */
  items: SidebarItem[];

  /**
   * Active item key
   */
  activeKey?: string;

  /**
   * Whether sidebar is collapsed
   */
  collapsed?: boolean;

  /**
   * Collapse toggle handler
   */
  onCollapsedChange?: (collapsed: boolean) => void;

  /**
   * Width when expanded
   */
  width?: string;

  /**
   * Width when collapsed
   */
  collapsedWidth?: string;

  /**
   * Header content
   */
  header?: React.ReactNode;

  /**
   * Footer content
   */
  footer?: React.ReactNode;

  /**
   * Additional class names
   */
  className?: string;
}

const SidebarItemComponent = forwardRef<
  HTMLElement,
  {
    item: SidebarItem;
    active: boolean;
    collapsed: boolean;
    depth: number;
  }
>(function SidebarItemComponent({ item, active, collapsed, depth }, ref) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const Component = item.href ? 'a' : 'button';

  const handleClick = () => {
    if (hasChildren) {
      setExpanded(!expanded);
    }
    item.onClick?.();
  };

  return (
    <div>
      <Component
        ref={ref as any}
        href={item.href}
        onClick={handleClick}
        disabled={item.disabled}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-2.5 rounded-md transition-all',
          'text-sm font-medium',
          depth > 0 && 'ml-4',
          active
            ? 'bg-surface-selected text-text-primary'
            : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover',
          item.disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          !item.href && 'border-none bg-transparent cursor-pointer text-left'
        )}
      >
        {item.icon && <span className="flex-shrink-0 w-5 h-5">{item.icon}</span>}
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge && (
              <span className="flex-shrink-0 text-xs">{item.badge}</span>
            )}
            {hasChildren && (
              <span className="flex-shrink-0 text-xs transition-transform">
                {expanded ? '▼' : '▶'}
              </span>
            )}
          </>
        )}
      </Component>
      {hasChildren && expanded && !collapsed && (
        <div className="mt-1">
          {item.children!.map((child) => (
            <SidebarItemComponent
              key={child.key}
              item={child}
              active={false}
              collapsed={collapsed}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export const Sidebar = forwardRef<HTMLElement, SidebarProps>(function Sidebar(
  {
    items,
    activeKey,
    collapsed = false,
    onCollapsedChange,
    width = '256px',
    collapsedWidth = '64px',
    header,
    footer,
    className,
  },
  ref
) {
  return (
    <Box
      as="aside"
      ref={ref}
      className={cn(
        'flex flex-col bg-surface-elevated border-r border-border-primary',
        'transition-all duration-200',
        className
      )}
      style={{ width: collapsed ? collapsedWidth : width }}
    >
      {/* Header */}
      {header && (
        <Flex
          align="center"
          justify="between"
          className="px-4 py-3 border-b border-border-primary"
        >
          {!collapsed && header}
          {onCollapsedChange && (
            <button
              onClick={() => onCollapsedChange(!collapsed)}
              className={cn(
                'p-1 rounded-md hover:bg-surface-hover transition-colors',
                collapsed && 'mx-auto'
              )}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={collapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'}
                />
              </svg>
            </button>
          )}
        </Flex>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {items.map((item) => (
            <SidebarItemComponent
              key={item.key}
              item={item}
              active={item.key === activeKey}
              collapsed={collapsed}
              depth={0}
            />
          ))}
        </div>
      </nav>

      {/* Footer */}
      {footer && !collapsed && (
        <div className="px-4 py-3 border-t border-border-primary">{footer}</div>
      )}
    </Box>
  );
});
