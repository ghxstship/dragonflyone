/**
 * Button Primitive
 * Unstyled button component with accessibility features
 */

import React, { forwardRef } from 'react';
import type { PolymorphicPropsWithRef } from '../../utils/polymorphic';
import { cn } from '../../utils/cn';

export interface ButtonProps {
  /**
   * Button type
   */
  type?: 'button' | 'submit' | 'reset';

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Loading state
   */
  loading?: boolean;

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
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const Button = forwardRef(function Button<E extends React.ElementType = 'button'>(
  {
    as,
    type = 'button',
    disabled = false,
    loading = false,
    className,
    children,
    onClick,
    ...props
  }: PolymorphicPropsWithRef<E, ButtonProps>,
  ref: React.ForwardedRef<Element>
) {
  const Component = as || 'button';
  const isDisabled = disabled || loading;

  const classes = cn(
    'inline-flex items-center justify-center',
    'transition-colors duration-200',
    'focus:outline-none focus-visible:ring-2',
    isDisabled && 'cursor-not-allowed opacity-50',
    className
  );

  return (
    <Component
      ref={ref}
      type={Component === 'button' ? type : undefined}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      className={classes}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
}) as <E extends React.ElementType = 'button'>(
  props: PolymorphicPropsWithRef<E, ButtonProps>
) => React.ReactElement | null;
