/**
 * Dialog Component
 * Accessible modal dialog
 */

'use client';

import React, { forwardRef, useEffect } from 'react';
import { Box } from '../../primitives/box';
import { Heading } from '../../primitives/heading';
import { Text } from '../../primitives/text';
import { Flex } from '../../primitives/flex';
import { cn } from '../../utils/cn';

export interface DialogProps {
  /**
   * Whether the dialog is open
   */
  open: boolean;

  /**
   * Close handler
   */
  onClose: () => void;

  /**
   * Dialog title
   */
  title?: string;

  /**
   * Dialog description
   */
  description?: string;

  /**
   * Footer content (usually actions)
   */
  footer?: React.ReactNode;

  /**
   * Size of the dialog
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';

  /**
   * Whether clicking overlay closes dialog
   */
  closeOnOverlayClick?: boolean;

  /**
   * Additional class names
   */
  className?: string;

  /**
   * Children (dialog content)
   */
  children?: React.ReactNode;
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full mx-4',
};

export const Dialog = forwardRef<HTMLDivElement, DialogProps>(function Dialog(
  {
    open,
    onClose,
    title,
    description,
    footer,
    size = 'md',
    closeOnOverlayClick = true,
    className,
    children,
  },
  ref
) {
  // Lock body scroll when dialog is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center p-4"
      aria-labelledby={title ? 'dialog-title' : undefined}
      aria-describedby={description ? 'dialog-description' : undefined}
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-modal-overlay animate-in fade-in-0"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      {/* Dialog */}
      <Box
        ref={ref}
        className={cn(
          'relative w-full bg-modal-bg rounded-lg shadow-modal',
          'animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4',
          sizeStyles[size],
          className
        )}
      >
        {/* Header */}
        {(title || description) && (
          <Flex direction="vertical" gap="2" className="p-6 pb-4">
            {title && (
              <Heading id="dialog-title" level="2" size="xl" className="text-text-primary">
                {title}
              </Heading>
            )}
            {description && (
              <Text id="dialog-description" size="sm" className="text-text-secondary">
                {description}
              </Text>
            )}
          </Flex>
        )}

        {/* Content */}
        {children && <div className="px-6 py-4">{children}</div>}

        {/* Footer */}
        {footer && (
          <Flex justify="end" gap="2" className="p-6 pt-4 border-t border-border-primary">
            {footer}
          </Flex>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-md hover:bg-surface-secondary transition-colors"
          aria-label="Close dialog"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </Box>
    </div>
  );
});
