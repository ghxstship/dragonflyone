/**
 * Code Primitive
 * Inline or block code component
 */

import React, { forwardRef } from 'react';
import type { PolymorphicPropsWithRef } from '../../utils/polymorphic';
import { cn } from '../../utils/cn';

export interface CodeProps {
  /**
   * Display variant
   */
  variant?: 'inline' | 'block';

  /**
   * Size of the code
   */
  size?: 'xs' | 'sm' | 'base' | 'lg';

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
  inline: 'inline-block px-1 py-0.5 rounded',
  block: 'block p-4 rounded-lg overflow-x-auto',
};

const sizeStyles = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
};

export const Code = forwardRef(function Code<E extends React.ElementType = 'code'>(
  {
    as,
    variant = 'inline',
    size = 'sm',
    className,
    children,
    ...props
  }: PolymorphicPropsWithRef<E, CodeProps>,
  ref: React.ForwardedRef<Element>
) {
  const Component = as || 'code';

  const classes = cn(
    'font-mono',
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  return (
    <Component ref={ref} className={classes} {...props}>
      {children}
    </Component>
  );
}) as <E extends React.ElementType = 'code'>(
  props: PolymorphicPropsWithRef<E, CodeProps>
) => React.ReactElement | null;
