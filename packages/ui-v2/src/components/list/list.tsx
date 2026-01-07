/**
 * List Component
 * Flexible list with items and dividers
 */

import React, { forwardRef } from 'react';
import { Stack } from '../../primitives/stack';
import type { StackProps } from '../../primitives/stack';
import { cn } from '../../utils/cn';

export interface ListProps extends Omit<StackProps, 'direction'> {
  /**
   * Show dividers between items
   */
  dividers?: boolean;

  /**
   * Spacing between items
   */
  spacing?: '0' | '1' | '2' | '3' | '4';

  /**
   * Additional class names
   */
  className?: string;

  /**
   * Children elements
   */
  children?: React.ReactNode;
}

export const List = forwardRef<HTMLDivElement, ListProps>(function List(
  { dividers = false, spacing = '0', className, children, ...props },
  ref
) {
  return (
    <Stack
      ref={ref}
      direction="vertical"
      spacing={spacing}
      className={cn(
        dividers && '[&>*:not(:last-child)]:border-b [&>*:not(:last-child)]:border-border-primary',
        className
      )}
      {...props}
    >
      {children}
    </Stack>
  );
});

/**
 * List Item
 */
export interface ListItemProps {
  /**
   * Whether the item is interactive
   */
  interactive?: boolean;

  /**
   * Whether the item is selected
   */
  selected?: boolean;

  /**
   * Additional class names
   */
  className?: string;

  /**
   * Children elements
   */
  children?: React.ReactNode;

  /**
   * Click handler
   */
  onClick?: () => void;
}

export const ListItem = forwardRef<HTMLDivElement, ListItemProps>(function ListItem(
  { interactive = false, selected = false, className, children, onClick, ...props },
  ref
) {
  const Component = interactive ? 'button' : 'div';

  return (
    <Component
      ref={ref as any}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-4 py-3 text-left',
        interactive && 'transition-colors hover:bg-surface-secondary cursor-pointer',
        selected && 'bg-surface-brand-subtle border-l-4 border-border-brand',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
});
