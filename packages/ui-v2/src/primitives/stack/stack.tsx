/**
 * Stack Primitive
 * Vertical or horizontal stack with spacing
 */

import React, { forwardRef } from 'react';
import type { PolymorphicPropsWithRef } from '../../utils/polymorphic';
import { cn } from '../../utils/cn';

export interface StackProps {
  /**
   * Direction of the stack
   */
  direction?: 'horizontal' | 'vertical';

  /**
   * Spacing between items (uses spacing tokens)
   */
  spacing?: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12' | '16';

  /**
   * Alignment of items
   */
  align?: 'start' | 'center' | 'end' | 'stretch';

  /**
   * Justify content
   */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

  /**
   * Additional class names
   */
  className?: string;

  /**
   * Children elements
   */
  children?: React.ReactNode;
}

const directionStyles = {
  horizontal: 'flex flex-row',
  vertical: 'flex flex-col',
};

const spacingStyles = {
  horizontal: {
    '0': '',
    '1': 'gap-1',
    '2': 'gap-2',
    '3': 'gap-3',
    '4': 'gap-4',
    '5': 'gap-5',
    '6': 'gap-6',
    '8': 'gap-8',
    '10': 'gap-10',
    '12': 'gap-12',
    '16': 'gap-16',
  },
  vertical: {
    '0': '',
    '1': 'gap-1',
    '2': 'gap-2',
    '3': 'gap-3',
    '4': 'gap-4',
    '5': 'gap-5',
    '6': 'gap-6',
    '8': 'gap-8',
    '10': 'gap-10',
    '12': 'gap-12',
    '16': 'gap-16',
  },
};

const alignStyles = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const justifyStyles = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

export const Stack = forwardRef(function Stack<E extends React.ElementType = 'div'>(
  {
    as,
    direction = 'vertical',
    spacing = '4',
    align,
    justify,
    className,
    children,
    ...props
  }: PolymorphicPropsWithRef<E, StackProps>,
  ref: React.ForwardedRef<Element>
) {
  const Component = as || 'div';

  const classes = cn(
    directionStyles[direction],
    spacingStyles[direction][spacing],
    align && alignStyles[align],
    justify && justifyStyles[justify],
    className
  );

  return (
    <Component ref={ref} className={classes} {...props}>
      {children}
    </Component>
  );
}) as <E extends React.ElementType = 'div'>(
  props: PolymorphicPropsWithRef<E, StackProps>
) => React.ReactElement | null;
