/**
 * Card Component
 * Styled card container with brand-aware styling
 */

import React, { forwardRef } from 'react';
import { Box } from '../../primitives/box';
import type { BoxProps } from '../../primitives/box';
import { cn } from '../../utils/cn';

export interface CardProps extends Omit<BoxProps, 'as'> {
  /**
   * Card variant
   */
  variant?: 'elevated' | 'outlined' | 'filled';

  /**
   * Padding size
   */
  padding?: 'none' | 'sm' | 'base' | 'lg';

  /**
   * Whether the card is interactive (hover effects)
   */
  interactive?: boolean;

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
  elevated: 'bg-surface-elevated shadow-md border border-border-primary',
  outlined: 'bg-surface-primary border-2 border-border-primary',
  filled: 'bg-surface-secondary border border-border-primary',
};

const paddingStyles = {
  none: 'p-0',
  sm: 'p-4',
  base: 'p-6',
  lg: 'p-8',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    variant = 'elevated',
    padding = 'base',
    interactive = false,
    className,
    children,
    ...props
  },
  ref
) {
  const classes = cn(
    'rounded-lg transition-all duration-200',
    variantStyles[variant],
    paddingStyles[padding],
    interactive && 'hover:shadow-lg hover:scale-[1.02] cursor-pointer',
    className
  );

  return (
    <Box ref={ref} className={classes} {...props}>
      {children}
    </Box>
  );
});

/**
 * Card Header
 */
export interface CardHeaderProps {
  className?: string;
  children?: React.ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(function CardHeader(
  { className, children, ...props },
  ref
) {
  return (
    <Box ref={ref} className={cn('mb-4', className)} {...props}>
      {children}
    </Box>
  );
});

/**
 * Card Title
 */
export interface CardTitleProps {
  className?: string;
  children?: React.ReactNode;
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(function CardTitle(
  { className, children, ...props },
  ref
) {
  return (
    <Box
      ref={ref}
      as="h3"
      className={cn('text-lg font-semibold text-text-primary', className)}
      {...props}
    >
      {children}
    </Box>
  );
});

/**
 * Card Description
 */
export interface CardDescriptionProps {
  className?: string;
  children?: React.ReactNode;
}

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  function CardDescription({ className, children, ...props }, ref) {
    return (
      <Box
        ref={ref}
        as="p"
        className={cn('text-sm text-text-secondary', className)}
        {...props}
      >
        {children}
      </Box>
    );
  }
);

/**
 * Card Content
 */
export interface CardContentProps {
  className?: string;
  children?: React.ReactNode;
}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(function CardContent(
  { className, children, ...props },
  ref
) {
  return (
    <Box ref={ref} className={cn('', className)} {...props}>
      {children}
    </Box>
  );
});

/**
 * Card Footer
 */
export interface CardFooterProps {
  className?: string;
  children?: React.ReactNode;
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(function CardFooter(
  { className, children, ...props },
  ref
) {
  return (
    <Box ref={ref} className={cn('mt-4 flex items-center gap-2', className)} {...props}>
      {children}
    </Box>
  );
});
