/**
 * Switch Primitive
 * Toggle switch component
 */

import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /**
   * Additional class names
   */
  className?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { checked = false, disabled = false, className, ...props },
  ref
) {
  const trackClasses = cn(
    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
    'focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-1 focus-within:ring-brand-200',
    checked ? 'bg-interactive-primary' : 'bg-border-secondary',
    disabled && 'cursor-not-allowed opacity-50',
    className
  );

  const thumbClasses = cn(
    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
    checked ? 'translate-x-6' : 'translate-x-1'
  );

  return (
    <label className={trackClasses}>
      <input
        ref={ref}
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        aria-checked={checked}
        className="sr-only"
        {...props}
      />
      <span className={thumbClasses} aria-hidden="true" />
    </label>
  );
});
