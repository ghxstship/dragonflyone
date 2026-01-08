/**
 * Sheet Component
 * Slide-in panel from side of screen
 */

'use client';

import React, { forwardRef, useEffect } from 'react';
import { Box } from '../../primitives/box';
import { Heading } from '../../primitives/heading';
import { Text } from '../../primitives/text';
import { Flex } from '../../primitives/flex';
import { cn } from '../../utils/cn';

export interface SheetProps {
  /**
   * Whether the sheet is open
   */
  open: boolean;

  /**
   * Close handler
   */
  onClose: () => void;

  /**
   * Sheet title
   */
  title?: string;

  /**
   * Sheet description
   */
  description?: string;

  /**
   * Side to slide from
   */
  side?: 'left' | 'right' | 'top' | 'bottom';

  /**
   * Size of the sheet
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';

  /**
   * Footer content
   */
  footer?: React.ReactNode;

  /**
   * Whether clicking overlay closes sheet
   */
  closeOnOverlayClick?: boolean;

  /**
   * Additional class names
   */
  className?: string;

  /**
   * Children (sheet content)
   */
  children?: React.ReactNode;
}

const sideStyles = {
  left: 'inset-y-0 left-0 animate-in slide-in-from-left',
  right: 'inset-y-0 right-0 animate-in slide-in-from-right',
  top: 'inset-x-0 top-0 animate-in slide-in-from-top',
  bottom: 'inset-x-0 bottom-0 animate-in slide-in-from-bottom',
};

const sizeStyles = {
  left: {
    sm: 'w-64',
    md: 'w-80',
    lg: 'w-96',
    xl: 'w-[480px]',
    full: 'w-full',
  },
  right: {
    sm: 'w-64',
    md: 'w-80',
    lg: 'w-96',
    xl: 'w-[480px]',
    full: 'w-full',
  },
  top: {
    sm: 'h-64',
    md: 'h-80',
    lg: 'h-96',
    xl: 'h-[480px]',
    full: 'h-full',
  },
  bottom: {
    sm: 'h-64',
    md: 'h-80',
    lg: 'h-96',
    xl: 'h-[480px]',
    full: 'h-full',
  },
};

export const Sheet = forwardRef<HTMLDivElement, SheetProps>(function Sheet(
  {
    open,
    onClose,
    title,
    description,
    side = 'right',
    size = 'md',
    footer,
    closeOnOverlayClick = true,
    className,
    children,
  },
  ref
) {
  // Lock body scroll when sheet is open
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
    <div className="fixed inset-0 z-modal" role="dialog" aria-modal="true">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-modal-overlay animate-in fade-in-0"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      {/* Sheet */}
      <Box
        ref={ref}
        className={cn(
          'fixed bg-modal-bg shadow-xl flex flex-col',
          sideStyles[side],
          sizeStyles[side][size],
          className
        )}
      >
        {/* Header */}
        {(title || description) && (
          <Flex direction="vertical" gap="2" className="p-6 pb-4 border-b border-border-primary">
            {title && (
              <Heading level="2" size="xl" className="text-text-primary pr-8">
                {title}
              </Heading>
            )}
            {description && (
              <Text size="sm" className="text-text-secondary">
                {description}
              </Text>
            )}
          </Flex>
        )}

        {/* Content */}
        {children && <div className="flex-1 overflow-y-auto p-6">{children}</div>}

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
          aria-label="Close sheet"
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
