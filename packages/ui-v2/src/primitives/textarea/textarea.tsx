/**
 * Textarea Primitive
 * Multi-line text input component
 */

import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Error state
   */
  error?: boolean;

  /**
   * Resize behavior
   */
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';

  /**
   * Additional class names
   */
  className?: string;
}

const resizeStyles = {
  none: 'resize-none',
  vertical: 'resize-y',
  horizontal: 'resize-x',
  both: 'resize',
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { error = false, resize = 'vertical', disabled = false, className, ...props },
  ref
) {
  const classes = cn(
    'w-full px-4 py-2 rounded-md border transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-offset-1',
    'disabled:cursor-not-allowed disabled:opacity-50',
    resizeStyles[resize],
    error
      ? 'border-error-500 focus:border-error-500 focus:ring-error-200'
      : 'border-border-primary focus:border-border-focus focus:ring-brand-200',
    className
  );

  return (
    <textarea
      ref={ref}
      disabled={disabled}
      aria-invalid={error}
      className={classes}
      {...props}
    />
  );
});
