/**
 * Label Primitive
 * Form label component with accessibility
 */

import React, { forwardRef } from 'react';
import type { PolymorphicPropsWithRef } from '../../utils/polymorphic';
import { cn } from '../../utils/cn';

export interface LabelProps {
  /**
   * ID of the form element this label is for
   */
  htmlFor?: string;

  /**
   * Size of the label
   */
  size?: 'sm' | 'base' | 'lg';

  /**
   * Font weight
   */
  weight?: 'normal' | 'medium' | 'semibold';

  /**
   * Required indicator
   */
  required?: boolean;

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
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
};

const weightStyles = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
};

export const Label = forwardRef(function Label<E extends React.ElementType = 'label'>(
  {
    as,
    htmlFor,
    size = 'base',
    weight = 'medium',
    required = false,
    className,
    children,
    ...props
  }: PolymorphicPropsWithRef<E, LabelProps>,
  ref: React.ForwardedRef<Element>
) {
  const Component = as || 'label';

  const classes = cn(
    'inline-block',
    sizeStyles[size],
    weightStyles[weight],
    className
  );

  return (
    <Component ref={ref} htmlFor={htmlFor} className={classes} {...props}>
      {children}
      {required && (
        <span className="text-error-500 ml-1" aria-label="required">
          *
        </span>
      )}
    </Component>
  );
}) as <E extends React.ElementType = 'label'>(
  props: PolymorphicPropsWithRef<E, LabelProps>
) => React.ReactElement | null;
