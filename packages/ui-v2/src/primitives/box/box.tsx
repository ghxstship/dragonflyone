/**
 * Box Primitive
 * The most basic building block - polymorphic container
 */

import React, { forwardRef } from 'react';
import type { PolymorphicPropsWithRef } from '../../utils/polymorphic';
import { cn } from '../../utils/cn';

export interface BoxProps {
  /**
   * Additional class names
   */
  className?: string;

  /**
   * Children elements
   */
  children?: React.ReactNode;
}

export const Box = forwardRef(function Box<E extends React.ElementType = 'div'>(
  { as, className, children, ...props }: PolymorphicPropsWithRef<E, BoxProps>,
  ref: React.ForwardedRef<Element>
) {
  const Component = as || 'div';

  return (
    <Component ref={ref} className={cn(className)} {...props}>
      {children}
    </Component>
  );
}) as <E extends React.ElementType = 'div'>(
  props: PolymorphicPropsWithRef<E, BoxProps>
) => React.ReactElement | null;
