/**
 * Input Primitive
 * Text input component with accessibility
 */

import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Input type
   */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';

  /**
   * Size of the input
   */
  inputSize?: 'sm' | 'base' | 'lg';

  /**
   * Error state
   */
  error?: boolean;

  /**
   * Additional class names
   */
  className?: string;
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  base: 'px-4 py-2 text-base',
  lg: 'px-5 py-3 text-lg',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    type = 'text',
    inputSize = 'base',
    error = false,
    disabled = false,
    className,
    ...props
  },
  ref
) {
  const classes = cn(
    'w-full rounded-md border transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-offset-1',
    'disabled:cursor-not-allowed disabled:opacity-50',
    sizeStyles[inputSize],
    error
      ? 'border-error-500 focus:border-error-500 focus:ring-error-200'
      : 'border-border-primary focus:border-border-focus focus:ring-brand-200',
    className
  );

  return (
    <input
      ref={ref}
      type={type}
      disabled={disabled}
      aria-invalid={error}
      className={classes}
      {...props}
    />
  );
});
