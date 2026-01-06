/**
 * ButtonGroup Component
 * Group of buttons with connected styling
 */

import React, { forwardRef } from 'react';
import type { PolymorphicPropsWithRef } from '../../utils/polymorphic';
import { cn } from '../../utils/cn';

export interface ButtonGroupProps {
  /**
   * Orientation of the button group
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * Size of buttons in the group
   */
  size?: 'sm' | 'base' | 'lg';

  /**
   * Whether buttons are attached (no gap)
   */
  attached?: boolean;

  /**
   * Additional class names
   */
  className?: string;

  /**
   * Children elements (buttons)
   */
  children?: React.ReactNode;
}

export const ButtonGroup = forwardRef(function ButtonGroup<E extends React.ElementType = 'div'>(
  {
    as,
    orientation = 'horizontal',
    size = 'base',
    attached = true,
    className,
    children,
    ...props
  }: PolymorphicPropsWithRef<E, ButtonGroupProps>,
  ref: React.ForwardedRef<Element>
) {
  const Component = as || 'div';

  const classes = cn(
    'inline-flex',
    orientation === 'horizontal' ? 'flex-row' : 'flex-col',
    attached
      ? orientation === 'horizontal'
        ? '[&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none [&>*:not(:first-child)]:-ml-px'
        : '[&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none [&>*:not(:first-child)]:-mt-px'
      : 'gap-2',
    className
  );

  return (
    <Component ref={ref} role="group" className={classes} {...props}>
      {children}
    </Component>
  );
}) as <E extends React.ElementType = 'div'>(
  props: PolymorphicPropsWithRef<E, ButtonGroupProps>
) => React.ReactElement | null;
