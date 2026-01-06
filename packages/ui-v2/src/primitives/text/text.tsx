/**
 * Text Primitive
 * Polymorphic text component
 */

import React, { forwardRef } from 'react';
import type { PolymorphicPropsWithRef } from '../../utils/polymorphic';
import { cn } from '../../utils/cn';

export interface TextProps {
  /**
   * Visual size (independent of semantic element)
   */
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';

  /**
   * Font weight
   */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';

  /**
   * Text alignment
   */
  align?: 'left' | 'center' | 'right';

  /**
   * Additional class names
   */
  className?: string;

  /**
   * Children elements
   */
  children?: React.ReactNode;
}

const sizeStyles = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
};

const weightStyles = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const alignStyles = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export const Text = forwardRef(function Text<E extends React.ElementType = 'span'>(
  {
    as,
    size = 'base',
    weight = 'normal',
    align,
    className,
    children,
    ...props
  }: PolymorphicPropsWithRef<E, TextProps>,
  ref: React.ForwardedRef<Element>
) {
  const Component = as || 'span';

  const classes = cn(
    sizeStyles[size],
    weightStyles[weight],
    align && alignStyles[align],
    className
  );

  return (
    <Component ref={ref} className={classes} {...props}>
      {children}
    </Component>
  );
}) as <E extends React.ElementType = 'span'>(
  props: PolymorphicPropsWithRef<E, TextProps>
) => React.ReactElement | null;
