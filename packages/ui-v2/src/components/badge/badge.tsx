/**
 * Badge Component
 * Small status indicator with brand-aware styling
 */

import React, { forwardRef } from 'react';
import type { PolymorphicPropsWithRef } from '../../utils/polymorphic';
import { cn } from '../../utils/cn';

export interface BadgeProps {
  /**
   * Visual variant
   */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';

  /**
   * Size of the badge
   */
  size?: 'sm' | 'base' | 'lg';

  /**
   * Additional class names
   */
  className?: string;

  /**
   * Children elements
   */
  children?: React.ReactNode;
}

const variantStyles = {
  default: 'bg-surface-brand text-text-on-brand',
  success: 'bg-surface-success text-white',
  warning: 'bg-surface-warning text-white',
  error: 'bg-surface-error text-white',
  info: 'bg-surface-info text-white',
  outline: 'bg-transparent border-2 border-border-brand text-text-primary',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  base: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export const Badge = forwardRef(function Badge<E extends React.ElementType = 'span'>(
  {
    as,
    variant = 'default',
    size = 'base',
    className,
    children,
    ...props
  }: PolymorphicPropsWithRef<E, BadgeProps>,
  ref: React.ForwardedRef<Element>
) {
  const Component = as || 'span';

  const classes = cn(
    'inline-flex items-center justify-center font-medium rounded-full',
    'transition-colors duration-200',
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  return (
    <Component ref={ref} className={classes} {...props}>
      {children}
    </Component>
  );
}) as <E extends React.ElementType = 'span'>(
  props: PolymorphicPropsWithRef<E, BadgeProps>
) => React.ReactElement | null;
