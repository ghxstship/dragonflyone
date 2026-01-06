/**
 * Skeleton Primitive
 * Loading skeleton component
 */

import React, { forwardRef } from 'react';
import type { PolymorphicPropsWithRef } from '../../utils/polymorphic';
import { cn } from '../../utils/cn';

export interface SkeletonProps {
  /**
   * Variant of skeleton
   */
  variant?: 'text' | 'circular' | 'rectangular';

  /**
   * Width (CSS value)
   */
  width?: string;

  /**
   * Height (CSS value)
   */
  height?: string;

  /**
   * Animation
   */
  animate?: boolean;

  /**
   * Additional class names
   */
  className?: string;
}

const variantStyles = {
  text: 'rounded',
  circular: 'rounded-full',
  rectangular: 'rounded-md',
};

export const Skeleton = forwardRef(function Skeleton<E extends React.ElementType = 'div'>(
  {
    as,
    variant = 'rectangular',
    width,
    height,
    animate = true,
    className,
    ...props
  }: PolymorphicPropsWithRef<E, SkeletonProps>,
  ref: React.ForwardedRef<Element>
) {
  const Component = as || 'div';

  const classes = cn(
    'bg-border-primary',
    variantStyles[variant],
    animate && 'animate-pulse',
    className
  );

  const style: React.CSSProperties = {
    width: width || (variant === 'circular' ? '40px' : '100%'),
    height: height || (variant === 'text' ? '1em' : variant === 'circular' ? '40px' : '20px'),
  };

  return (
    <Component
      ref={ref}
      aria-busy="true"
      aria-live="polite"
      className={classes}
      style={style}
      {...props}
    />
  );
}) as <E extends React.ElementType = 'div'>(
  props: PolymorphicPropsWithRef<E, SkeletonProps>
) => React.ReactElement | null;
