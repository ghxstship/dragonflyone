/**
 * Flex Primitive
 * Flexbox layout component
 */

import React, { forwardRef } from 'react';
import type { PolymorphicPropsWithRef } from '../../utils/polymorphic';
import { cn } from '../../utils/cn';

export interface FlexProps {
  /**
   * Flex direction
   */
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';

  /**
   * Flex wrap
   */
  wrap?: 'wrap' | 'nowrap' | 'wrap-reverse';

  /**
   * Gap between items
   */
  gap?: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12' | '16';

  /**
   * Alignment of items
   */
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';

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
  row: 'flex-row',
  'row-reverse': 'flex-row-reverse',
  column: 'flex-col',
  'column-reverse': 'flex-col-reverse',
};

const wrapStyles = {
  wrap: 'flex-wrap',
  nowrap: 'flex-nowrap',
  'wrap-reverse': 'flex-wrap-reverse',
};

const gapStyles = {
  '0': 'gap-0',
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
};

const alignStyles = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

const justifyStyles = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

export const Flex = forwardRef(function Flex<E extends React.ElementType = 'div'>(
  {
    as,
    direction = 'row',
    wrap,
    gap,
    align,
    justify,
    className,
    children,
    ...props
  }: PolymorphicPropsWithRef<E, FlexProps>,
  ref: React.ForwardedRef<Element>
) {
  const Component = as || 'div';

  const classes = cn(
    'flex',
    directionStyles[direction],
    wrap && wrapStyles[wrap],
    gap && gapStyles[gap],
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
  props: PolymorphicPropsWithRef<E, FlexProps>
) => React.ReactElement | null;
