/**
 * Spinner Primitive
 * Loading spinner component
 */

import React, { forwardRef } from 'react';
import type { PolymorphicPropsWithRef } from '../../utils/polymorphic';
import { cn } from '../../utils/cn';

export interface SpinnerProps {
  /**
   * Size of the spinner
   */
  size?: 'sm' | 'base' | 'lg' | 'xl';

  /**
   * Loading label for screen readers
   */
  label?: string;

  /**
   * Additional class names
   */
  className?: string;
}

const sizeStyles = {
  sm: 'h-4 w-4 border-2',
  base: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-3',
  xl: 'h-12 w-12 border-4',
};

export const Spinner = forwardRef(function Spinner<E extends React.ElementType = 'div'>(
  {
    as,
    size = 'base',
    label = 'Loading',
    className,
    ...props
  }: PolymorphicPropsWithRef<E, SpinnerProps>,
  ref: React.ForwardedRef<Element>
) {
  const Component = as || 'div';

  const classes = cn(
    'inline-block animate-spin rounded-full',
    'border-current border-r-transparent',
    sizeStyles[size],
    className
  );

  return (
    <Component
      ref={ref}
      role="status"
      aria-label={label}
      className={classes}
      {...props}
    >
      <span className="sr-only">{label}</span>
    </Component>
  );
}) as <E extends React.ElementType = 'div'>(
  props: PolymorphicPropsWithRef<E, SpinnerProps>
) => React.ReactElement | null;
