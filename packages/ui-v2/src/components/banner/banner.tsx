/**
 * Banner Component
 * Full-width banner for important messages
 */

import React, { forwardRef } from 'react';
import { Flex } from '../../primitives/flex';
import { cn } from '../../utils/cn';

export interface BannerProps {
  /**
   * Banner variant
   */
  variant?: 'info' | 'success' | 'warning' | 'error';

  /**
   * Icon element
   */
  icon?: React.ReactNode;

  /**
   * Close button handler
   */
  onClose?: () => void;

  /**
   * Action button
   */
  action?: React.ReactNode;

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
  info: 'bg-surface-info text-white',
  success: 'bg-surface-success text-white',
  warning: 'bg-surface-warning text-white',
  error: 'bg-surface-error text-white',
};

export const Banner = forwardRef<HTMLDivElement, BannerProps>(function Banner(
  { variant = 'info', icon, onClose, action, className, children, ...props },
  ref
) {
  return (
    <Flex
      ref={ref}
      align="center"
      justify="between"
      gap="4"
      className={cn('px-4 py-3', variantStyles[variant], className)}
      role="alert"
      {...props}
    >
      <Flex align="center" gap="3" className="flex-1">
        {icon && <div className="flex-shrink-0">{icon}</div>}
        <div className="text-sm font-medium">{children}</div>
      </Flex>

      <Flex align="center" gap="2" className="flex-shrink-0">
        {action && <div>{action}</div>}

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:opacity-80 transition-opacity rounded"
            aria-label="Close banner"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </Flex>
    </Flex>
  );
});
