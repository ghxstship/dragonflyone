/**
 * Heading Primitive
 * Semantic heading component (h1-h6)
 */

import React, { forwardRef } from 'react';
import type { PolymorphicPropsWithRef } from '../../utils/polymorphic';
import { cn } from '../../utils/cn';

export interface HeadingProps {
  /**
   * Heading level (semantic)
   */
  level?: '1' | '2' | '3' | '4' | '5' | '6';

  /**
   * Visual size (independent of semantic level)
   */
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';

  /**
   * Font weight
   */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';

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
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
  '5xl': 'text-5xl',
  '6xl': 'text-6xl',
};

const weightStyles = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
};

const alignStyles = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

// Default size mapping for each heading level
const defaultSizes: Record<string, keyof typeof sizeStyles> = {
  '1': '5xl',
  '2': '4xl',
  '3': '3xl',
  '4': '2xl',
  '5': 'xl',
  '6': 'lg',
};

export const Heading = forwardRef(function Heading<E extends React.ElementType = 'h2'>(
  {
    as,
    level = '2',
    size,
    weight = 'bold',
    align,
    className,
    children,
    ...props
  }: PolymorphicPropsWithRef<E, HeadingProps>,
  ref: React.ForwardedRef<Element>
) {
  // If no 'as' prop, use semantic heading based on level
  const Component = as || (`h${level}` as React.ElementType);

  // Use explicit size or default based on level
  const effectiveSize = size || defaultSizes[level];

  const classes = cn(
    sizeStyles[effectiveSize],
    weightStyles[weight],
    align && alignStyles[align],
    className
  );

  return (
    <Component ref={ref} className={classes} {...props}>
      {children}
    </Component>
  );
}) as <E extends React.ElementType = 'h2'>(
  props: PolymorphicPropsWithRef<E, HeadingProps>
) => React.ReactElement | null;
