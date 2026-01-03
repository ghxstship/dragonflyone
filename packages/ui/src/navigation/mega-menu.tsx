'use client';

import * as React from 'react';
import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

/**
 * MegaMenu Component System
 * 
 * Industry best practice navigation menu built on Radix UI NavigationMenu.
 * Features:
 * - Smooth enter/exit animations (150-200ms)
 * - Hover intent delay to prevent flickering
 * - Proper keyboard navigation and accessibility
 * - Soft shadow for dropdown panels (not hard offset)
 * - Backdrop blur for elevated appearance
 * - Safe triangle pattern for diagonal mouse movement
 */

// ============================================================================
// ROOT
// ============================================================================

interface MegaMenuRootProps {
  children: React.ReactNode;
  className?: string;
  delayDuration?: number;
  skipDelayDuration?: number;
}

export function MegaMenuRoot({
  children,
  className,
  delayDuration = 100,
  skipDelayDuration = 300,
}: MegaMenuRootProps) {
  return (
    <NavigationMenuPrimitive.Root
      className={clsx('relative z-dropdown', className)}
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
    >
      <NavigationMenuPrimitive.List className="flex items-center gap-1">
        {children}
      </NavigationMenuPrimitive.List>
      <MegaMenuViewport />
    </NavigationMenuPrimitive.Root>
  );
}

// ============================================================================
// ITEM (Trigger + Content wrapper)
// ============================================================================

interface MegaMenuItemProps {
  children: React.ReactNode;
  className?: string;
}

export function MegaMenuItem({ children, className }: MegaMenuItemProps) {
  return (
    <NavigationMenuPrimitive.Item className={clsx('relative', className)}>
      {children}
    </NavigationMenuPrimitive.Item>
  );
}

// ============================================================================
// TRIGGER
// ============================================================================

interface MegaMenuTriggerProps {
  children: React.ReactNode;
  className?: string;
  inverted?: boolean;
}

export function MegaMenuTrigger({
  children,
  className,
  inverted = false,
}: MegaMenuTriggerProps) {
  return (
    <NavigationMenuPrimitive.Trigger
      className={clsx(
        'group inline-flex items-center gap-1 px-4 py-2 rounded-button',
        'text-body-sm font-weight-medium',
        'transition-colors duration-fast',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        inverted
          ? 'text-on-dark-secondary hover:text-on-dark-primary hover:bg-surface-elevated/50 focus-visible:ring-on-dark-primary'
          : 'text-foreground/80 hover:text-foreground hover:bg-muted/50 focus-visible:ring-primary',
        className
      )}
    >
      {children}
      <ChevronDown
        className={clsx(
          'h-4 w-4 transition-transform duration-base',
          'group-data-[state=open]:rotate-180'
        )}
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  );
}

// ============================================================================
// CONTENT (Dropdown Panel)
// ============================================================================

interface MegaMenuContentProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  inverted?: boolean;
}

const contentSizeClasses = {
  sm: 'min-w-dropdown-sm',
  md: 'min-w-dropdown-md',
  lg: 'min-w-dropdown-lg',
  xl: 'w-screen max-w-4xl',
};

export function MegaMenuContent({
  children,
  className,
  size = 'md',
  inverted = false,
}: MegaMenuContentProps) {
  return (
    <NavigationMenuPrimitive.Content
      className={clsx(
        'absolute left-0 top-0 w-full',
        'data-[motion=from-start]:animate-slide-in-bottom',
        'data-[motion=from-end]:animate-slide-in-bottom',
        'data-[motion=to-start]:animate-fade-out',
        'data-[motion=to-end]:animate-fade-out',
        className
      )}
    >
      <div
        className={clsx(
          'rounded-card p-6',
          'border border-border/50',
          'shadow-dropdown',
          'backdrop-blur-md',
          contentSizeClasses[size],
          inverted
            ? 'bg-surface-inverse/95 border-border'
            : 'bg-background/95'
        )}
      >
        {children}
      </div>
    </NavigationMenuPrimitive.Content>
  );
}

// ============================================================================
// VIEWPORT (Animation container)
// ============================================================================

function MegaMenuViewport() {
  return (
    <div className="absolute left-0 top-full flex justify-center perspective-[2000px]">
      <NavigationMenuPrimitive.Viewport
        className={clsx(
          'relative mt-2 origin-top-center overflow-hidden',
          'h-[var(--radix-navigation-menu-viewport-height)]',
          'w-[var(--radix-navigation-menu-viewport-width)]',
          'transition-[width,height] duration-base ease-out',
          'data-[state=open]:animate-zoom-in',
          'data-[state=closed]:animate-zoom-out'
        )}
      />
    </div>
  );
}

// ============================================================================
// LINK (For non-dropdown items)
// ============================================================================

interface MegaMenuLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  inverted?: boolean;
  active?: boolean;
}

export function MegaMenuLink({
  href,
  children,
  className,
  inverted = false,
  active = false,
}: MegaMenuLinkProps) {
  return (
    <NavigationMenuPrimitive.Link
      href={href}
      className={clsx(
        'inline-flex items-center px-4 py-2 rounded-button',
        'text-body-sm font-weight-medium',
        'transition-colors duration-fast',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        inverted
          ? [
              'text-on-dark-secondary hover:text-on-dark-primary hover:bg-surface-elevated/50',
              'focus-visible:ring-on-dark-primary',
              active && 'text-on-dark-primary bg-surface-elevated/50',
            ]
          : [
              'text-foreground/80 hover:text-foreground hover:bg-muted/50',
              'focus-visible:ring-primary',
              active && 'text-foreground bg-muted/50',
            ],
        className
      )}
    >
      {children}
    </NavigationMenuPrimitive.Link>
  );
}

// ============================================================================
// INDICATOR (Visual indicator for active item)
// ============================================================================

export function MegaMenuIndicator() {
  return (
    <NavigationMenuPrimitive.Indicator
      className={clsx(
        'top-full z-[1] flex h-2 items-end justify-center overflow-hidden',
        'data-[state=visible]:animate-fade-in',
        'data-[state=hidden]:animate-fade-out',
        'transition-[width,transform_250ms_ease]'
      )}
    >
      <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
    </NavigationMenuPrimitive.Indicator>
  );
}

// ============================================================================
// SUB-COMPONENTS FOR CONTENT
// ============================================================================

interface MegaMenuSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  inverted?: boolean;
}

export function MegaMenuSection({
  title,
  children,
  className,
  inverted = false,
}: MegaMenuSectionProps) {
  return (
    <div className={clsx('flex flex-col gap-2', className)}>
      {title && (
        <span
          className={clsx(
            'text-mono-xs font-weight-medium uppercase tracking-kicker',
            inverted ? 'text-on-dark-disabled' : 'text-muted-foreground'
          )}
        >
          {title}
        </span>
      )}
      {children}
    </div>
  );
}

interface MegaMenuItemLinkProps {
  href: string;
  children: React.ReactNode;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  inverted?: boolean;
}

export function MegaMenuItemLink({
  href,
  children,
  description,
  icon,
  className,
  inverted = false,
}: MegaMenuItemLinkProps) {
  return (
    <NavigationMenuPrimitive.Link
      href={href}
      className={clsx(
        'group flex items-start gap-3 p-3 rounded-card',
        'transition-colors duration-fast',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset',
        inverted
          ? [
              'hover:bg-surface-elevated/50',
              'focus-visible:ring-white/50',
            ]
          : [
              'hover:bg-muted/50',
              'focus-visible:ring-primary/50',
            ],
        className
      )}
    >
      {icon && (
        <div
          className={clsx(
            'shrink-0 p-2 rounded-card',
            inverted
              ? 'bg-surface-elevated text-brand-pink'
              : 'bg-primary/10 text-primary'
          )}
        >
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-0.5">
        <span
          className={clsx(
            'text-body-sm font-weight-medium',
            'transition-colors duration-fast',
            inverted
              ? 'text-white group-hover:text-brand-pink'
              : 'text-foreground group-hover:text-primary'
          )}
        >
          {children}
        </span>
        {description && (
          <span
            className={clsx(
              'text-body-xs',
              inverted ? 'text-on-dark-muted' : 'text-muted-foreground'
            )}
          >
            {description}
          </span>
        )}
      </div>
    </NavigationMenuPrimitive.Link>
  );
}

interface MegaMenuFooterProps {
  children: React.ReactNode;
  className?: string;
  inverted?: boolean;
}

export function MegaMenuFooter({
  children,
  className,
  inverted = false,
}: MegaMenuFooterProps) {
  return (
    <div
      className={clsx(
        'mt-6 pt-4 border-t',
        inverted ? 'border-border' : 'border-border',
        className
      )}
    >
      {children}
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export const MegaMenu = {
  Root: MegaMenuRoot,
  Item: MegaMenuItem,
  Trigger: MegaMenuTrigger,
  Content: MegaMenuContent,
  Link: MegaMenuLink,
  Indicator: MegaMenuIndicator,
  Section: MegaMenuSection,
  ItemLink: MegaMenuItemLink,
  Footer: MegaMenuFooter,
};

export default MegaMenu;
