/**
 * Container Primitive
 * Max-width container with centered content
 */

import React, { forwardRef } from 'react';
import type { PolymorphicPropsWithRef } from '../../utils/polymorphic';
import { cn } from '../../utils/cn';

export interface ContainerProps {
  /**
   * Maximum width
   */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';

  /**
   * Padding on x-axis
   */
  px?: '0' | '2' | '4' | '6' | '8' | '10' | '12' | '16';

  /**
   * Center the container
   */
  center?: boolean;

  /**
   * Additional class names
   */
  className?: string;

  /**
   * Children elements
   */
  children?: React.ReactNode;
}

const maxWidthStyles = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  '3xl': 'max-w-7xl',
  '4xl': 'max-w-6xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-4xl',
  '7xl': 'max-w-3xl',
  full: 'max-w-full',
};

const paddingXStyles = {
  '0': 'px-0',
  '2': 'px-2',
  '4': 'px-4',
  '6': 'px-6',
  '8': 'px-8',
  '10': 'px-10',
  '12': 'px-12',
  '16': 'px-16',
};

export const Container = forwardRef(function Container<E extends React.ElementType = 'div'>(
  {
    as,
    maxWidth = 'xl',
    px = '4',
    center = true,
    className,
    children,
    ...props
  }: PolymorphicPropsWithRef<E, ContainerProps>,
  ref: React.ForwardedRef<Element>
) {
  const Component = as || 'div';

  const classes = cn(
    'w-full',
    maxWidthStyles[maxWidth],
    paddingXStyles[px],
    center && 'mx-auto',
    className
  );

  return (
    <Component ref={ref} className={classes} {...props}>
      {children}
    </Component>
  );
}) as <E extends React.ElementType = 'div'>(
  props: PolymorphicPropsWithRef<E, ContainerProps>
) => React.ReactElement | null;
