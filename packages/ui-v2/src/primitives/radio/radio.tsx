/**
 * Radio Primitive
 * Radio button input with accessibility
 */

import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /**
   * Error state
   */
  error?: boolean;

  /**
   * Additional class names
   */
  className?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { error = false, disabled = false, className, ...props },
  ref
) {
  const classes = cn(
    'h-4 w-4 rounded-full border transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-offset-1',
    'disabled:cursor-not-allowed disabled:opacity-50',
    error
      ? 'border-error-500 focus:ring-error-200'
      : 'border-border-primary focus:ring-brand-200',
    className
  );

  return (
    <input
      ref={ref}
      type="radio"
      disabled={disabled}
      aria-invalid={error}
      className={classes}
      {...props}
    />
  );
});
