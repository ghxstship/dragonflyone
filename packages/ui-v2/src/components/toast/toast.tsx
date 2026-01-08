/**
 * Toast Component
 * Toast notification system
 */

'use client';

import React, { forwardRef, useEffect } from 'react';
import { Flex } from '../../primitives/flex';
import { Text } from '../../primitives/text';
import { cn } from '../../utils/cn';

export interface ToastProps {
  /**
   * Toast variant
   */
  variant?: 'info' | 'success' | 'warning' | 'error';

  /**
   * Toast title
   */
  title?: string;

  /**
   * Toast description
   */
  description?: string;

  /**
   * Icon element
   */
  icon?: React.ReactNode;

  /**
   * Action button
   */
  action?: React.ReactNode;

  /**
   * Close handler
   */
  onClose?: () => void;

  /**
   * Auto-dismiss duration (ms), 0 to disable
   */
  duration?: number;

  /**
   * Additional class names
   */
  className?: string;
}

const variantStyles = {
  info: 'bg-surface-info text-white border-info-600',
  success: 'bg-surface-success text-white border-success-600',
  warning: 'bg-surface-warning text-white border-warning-600',
  error: 'bg-surface-error text-white border-error-600',
};

export const Toast = forwardRef<HTMLDivElement, ToastProps>(function Toast(
  {
    variant = 'info',
    title,
    description,
    icon,
    action,
    onClose,
    duration = 5000,
    className,
  },
  ref
) {
  useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg shadow-lg border-l-4',
        'animate-in slide-in-from-right-full',
        'min-w-[300px] max-w-[450px]',
        variantStyles[variant],
        className
      )}
    >
      {icon && <div className="flex-shrink-0 mt-0.5">{icon}</div>}

      <Flex direction="vertical" gap="1" className="flex-1 min-w-0">
        {title && (
          <Text size="sm" weight="semibold" className="leading-tight">
            {title}
          </Text>
        )}
        {description && (
          <Text size="sm" className="opacity-90 leading-tight">
            {description}
          </Text>
        )}
        {action && <div className="mt-2">{action}</div>}
      </Flex>

      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 hover:opacity-80 transition-opacity rounded"
          aria-label="Close notification"
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
    </div>
  );
});

/**
 * ToastContainer - Container for managing toast notifications
 */
export interface ToastContainerProps {
  /**
   * Position of toasts
   */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

  /**
   * Children (toast components)
   */
  children: React.ReactNode;
}

const positionStyles = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
};

export const ToastContainer = forwardRef<HTMLDivElement, ToastContainerProps>(
  function ToastContainer({ position = 'top-right', children }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          'fixed z-notification flex flex-col gap-2',
          positionStyles[position]
        )}
      >
        {children}
      </div>
    );
  }
);
