/**
 * Chip Component
 * Removable tag/chip component
 */

import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface ChipProps {
  /**
   * Chip label
   */
  label: string;

  /**
   * Remove handler
   */
  onRemove?: () => void;

  /**
   * Visual variant
   */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';

  /**
   * Size of the chip
   */
  size?: 'sm' | 'base' | 'lg';

  /**
   * Icon element
   */
  icon?: React.ReactNode;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Additional class names
   */
  className?: string;
}

const variantStyles = {
  default: 'bg-surface-brand text-text-on-brand',
  success: 'bg-surface-success text-white',
  warning: 'bg-surface-warning text-white',
  error: 'bg-surface-error text-white',
  info: 'bg-surface-info text-white',
  outline: 'bg-transparent border-2 border-border-brand text-text-primary',
};

const sizeStyles = {
  sm: 'px-2 py-1 text-xs gap-1',
  base: 'px-3 py-1.5 text-sm gap-1.5',
  lg: 'px-4 py-2 text-base gap-2',
};

export const Chip = forwardRef<HTMLDivElement, ChipProps>(function Chip(
  { label, onRemove, variant = 'default', size = 'base', icon, disabled = false, className },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        'transition-all duration-200',
        variantStyles[variant],
        sizeStyles[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{label}</span>
      {onRemove && !disabled && (
        <button
          onClick={onRemove}
          disabled={disabled}
          className={cn(
            'flex-shrink-0 rounded-full p-0.5',
            'hover:bg-black/10 dark:hover:bg-white/10',
            'transition-colors focus:outline-none focus-visible:ring-2'
          )}
          aria-label={`Remove ${label}`}
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
