/**
 * Separator Primitive
 * Visual divider (horizontal or vertical)
 */

import React, { forwardRef } from 'react';
import type { PolymorphicPropsWithRef } from '../../utils/polymorphic';
import { cn } from '../../utils/cn';

export interface SeparatorProps {
  /**
   * Orientation of the separator
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * Additional class names
   */
  className?: string;
}

export const Separator = forwardRef(function Separator<E extends React.ElementType = 'hr'>(
  { as, orientation = 'horizontal', className, ...props }: PolymorphicPropsWithRef<E, SeparatorProps>,
  ref: React.ForwardedRef<Element>
) {
  const Component = as || 'hr';

  const classes = cn(
    'shrink-0 bg-border-primary',
    orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
    className
  );

  return (
    <Component
      ref={ref}
      role="separator"
      aria-orientation={orientation}
      className={classes}
      {...props}
    />
  );
}) as <E extends React.ElementType = 'hr'>(
  props: PolymorphicPropsWithRef<E, SeparatorProps>
) => React.ReactElement | null;
