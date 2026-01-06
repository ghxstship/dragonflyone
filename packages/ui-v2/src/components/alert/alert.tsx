/**
 * Alert Component
 * Alert/notification message with variants
 */

import React, { forwardRef } from 'react';
import { Box } from '../../primitives/box';
import type { BoxProps } from '../../primitives/box';
import { cn } from '../../utils/cn';

export interface AlertProps extends Omit<BoxProps, 'as'> {
  /**
   * Alert variant
   */
  variant?: 'info' | 'success' | 'warning' | 'error';

  /**
   * Title of the alert
   */
  title?: string;

  /**
   * Icon element
   */
  icon?: React.ReactNode;

  /**
   * Close button handler
   */
  onClose?: () => void;

  /**
   * Additional class names
   */
  className?: string;

  /**
   * Children elements
   */
  children?: React.ReactNode;
}

const variantStyles = {
  info: {
    container: 'bg-surface-info-subtle border-border-info text-text-info',
    title: 'text-text-info',
  },
  success: {
    container: 'bg-surface-success-subtle border-border-success text-text-success',
    title: 'text-text-success',
  },
  warning: {
    container: 'bg-surface-warning-subtle border-border-warning text-text-warning',
    title: 'text-text-warning',
  },
  error: {
    container: 'bg-surface-error-subtle border-border-error text-text-error',
    title: 'text-text-error',
  },
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { variant = 'info', title, icon, onClose, className, children, ...props },
  ref
) {
  const styles = variantStyles[variant];

  return (
    <Box
      ref={ref}
      role="alert"
      className={cn(
        'relative rounded-lg border p-4',
        'flex gap-3',
        styles.container,
        className
      )}
      {...props}
    >
      {icon && <div className="flex-shrink-0">{icon}</div>}

      <div className="flex-1">
        {title && <div className={cn('font-semibold mb-1', styles.title)}>{title}</div>}
        {children && <div className="text-sm">{children}</div>}
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Close alert"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </Box>
  );
});
