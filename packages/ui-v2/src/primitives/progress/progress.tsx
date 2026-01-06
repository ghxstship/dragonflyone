/**
 * Progress Primitive
 * Progress bar component
 */

import React, { forwardRef } from 'react';
import type { PolymorphicPropsWithRef } from '../../utils/polymorphic';
import { cn } from '../../utils/cn';

export interface ProgressProps {
  /**
   * Progress value (0-100)
   */
  value: number;

  /**
   * Maximum value
   */
  max?: number;

  /**
   * Size of the progress bar
   */
  size?: 'sm' | 'base' | 'lg';

  /**
   * Label for screen readers
   */
  label?: string;

  /**
   * Additional class names
   */
  className?: string;
}

const sizeStyles = {
  sm: 'h-1',
  base: 'h-2',
  lg: 'h-3',
};

export const Progress = forwardRef(function Progress<E extends React.ElementType = 'div'>(
  {
    as,
    value,
    max = 100,
    size = 'base',
    label,
    className,
    ...props
  }: PolymorphicPropsWithRef<E, ProgressProps>,
  ref: React.ForwardedRef<Element>
) {
  const Component = as || 'div';
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const containerClasses = cn(
    'w-full overflow-hidden rounded-full bg-border-primary',
    sizeStyles[size],
    className
  );

  return (
    <Component
      ref={ref}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      className={containerClasses}
      {...props}
    >
      <div
        className="h-full bg-interactive-primary transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </Component>
  );
}) as <E extends React.ElementType = 'div'>(
  props: PolymorphicPropsWithRef<E, ProgressProps>
) => React.ReactElement | null;
