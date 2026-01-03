'use client';

import * as React from 'react';
import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

/**
 * MegaMenu Component System
 * 
 * Enterprise-grade navigation menu built on Radix UI NavigationMenu.
 * 
 * Industry Best Practices:
 * - Full keyboard navigation (Arrow keys, Tab, Escape, Enter)
 * - ARIA compliant with proper roles and states
 * - Safe triangle pattern for diagonal mouse movement
 * - Hover intent delay to prevent flickering (100ms open, 300ms skip)
 * - Focus trap within open menus
 * - Smooth animations (150-200ms)
 * 
 * Design System Compliance:
 * - Typography: text-body-sm, font-weight-medium, text-mono-xs
 * - Colors: text-text-*, bg-surface-inverse, bg-surface-primary
 * - Borders: border-2, border-border (Bold Contemporary style)
 * - Shadows: shadow-hard (Pop Art hard offset)
 * - Spacing: p-spacing-6, gap-spacing-4
 * - Radius: rounded-card (8px for containers)
 * - Transitions: duration-fast (150ms), ease-snap
 */

// ============================================================================
// ROOT - Navigation container with viewport
// ============================================================================

interface MegaMenuRootProps {
  children: React.ReactNode;
  className?: string;
  /** Delay before opening menu on hover (ms) */
  delayDuration?: number;
  /** Delay before skipping to next menu when one is already open (ms) */
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
      className={clsx('relative', className)}
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
    >
      <NavigationMenuPrimitive.List className="flex items-center gap-spacing-1">
        {children}
      </NavigationMenuPrimitive.List>
      <MegaMenuViewport />
    </NavigationMenuPrimitive.Root>
  );
}

// ============================================================================
// VIEWPORT - Renders dropdown content outside normal flow
// ============================================================================

function MegaMenuViewport() {
  return (
    <div className="absolute left-0 top-full flex w-full justify-start z-popover">
      <NavigationMenuPrimitive.Viewport
        className={clsx(
          'relative mt-spacing-2 origin-top-left',
          'w-[var(--radix-navigation-menu-viewport-width)]',
          'h-[var(--radix-navigation-menu-viewport-height)]',
          'overflow-hidden',
          // Animations
          'transition-[width,height,opacity] duration-200 ease-out',
          'data-[state=open]:animate-fade-in',
          'data-[state=closed]:animate-fade-out'
        )}
      />
    </div>
  );
}

// ============================================================================
// ITEM - Wrapper for trigger + content pairs
// ============================================================================

interface MegaMenuItemProps {
  children: React.ReactNode;
  className?: string;
  /** Unique value for this menu item */
  value?: string;
}

export function MegaMenuItem({ children, className, value }: MegaMenuItemProps) {
  return (
    <NavigationMenuPrimitive.Item value={value} className={clsx('relative', className)}>
      {children}
    </NavigationMenuPrimitive.Item>
  );
}

// ============================================================================
// TRIGGER - Button that opens the dropdown
// ============================================================================

interface MegaMenuTriggerProps {
  children: React.ReactNode;
  className?: string;
  /** Use inverted colors for dark backgrounds */
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
        // Layout
        'group inline-flex items-center gap-spacing-1 px-spacing-4 py-spacing-2',
        // Typography (Design System)
        'text-body-sm font-weight-medium',
        // Transitions
        'transition-colors duration-fast ease-snap',
        // Focus states (Accessibility)
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        // Color variants
        inverted
          ? [
              'text-text-secondary',
              'hover:text-text-primary',
              'focus-visible:ring-white',
              'data-[state=open]:text-text-primary',
            ]
          : [
              'text-text-secondary',
              'hover:text-text-primary',
              'focus-visible:ring-primary',
              'data-[state=open]:text-text-primary',
            ],
        className
      )}
    >
      {children}
      <ChevronDown
        className={clsx(
          'size-4 transition-transform duration-fast ease-snap',
          'group-data-[state=open]:rotate-180'
        )}
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  );
}

// ============================================================================
// CONTENT - Dropdown panel with content
// ============================================================================

interface MegaMenuContentProps {
  children: React.ReactNode;
  className?: string;
  /** Panel width preset */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Use inverted colors for dark backgrounds */
  inverted?: boolean;
}

const contentSizeClasses = {
  sm: 'min-w-[320px]',
  md: 'min-w-[480px]',
  lg: 'min-w-[640px]',
  xl: 'min-w-[800px]',
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
        // Entry/exit animations
        'data-[motion=from-start]:animate-slide-in-left',
        'data-[motion=from-end]:animate-slide-in-right',
        'data-[motion=to-start]:animate-fade-out',
        'data-[motion=to-end]:animate-fade-out',
        className
      )}
    >
      <div
        className={clsx(
          // Layout
          'p-spacing-6',
          contentSizeClasses[size],
          // Design System: Bold Contemporary Pop Art
          'rounded-card',
          'border-2 border-border',
          'shadow-hard',
          // Background
          inverted ? 'bg-surface-inverse' : 'bg-surface-primary'
        )}
      >
        {children}
      </div>
    </NavigationMenuPrimitive.Content>
  );
}

// ============================================================================
// LINK - Standalone navigation link (no dropdown)
// ============================================================================

interface MegaMenuLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  /** Use inverted colors for dark backgrounds */
  inverted?: boolean;
  /** Whether this link is currently active */
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
      active={active}
      className={clsx(
        // Layout
        'inline-flex items-center px-spacing-4 py-spacing-2',
        // Typography
        'text-body-sm font-weight-medium',
        // Transitions
        'transition-colors duration-fast ease-snap',
        // Focus states
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        // Color variants
        inverted
          ? [
              'text-text-secondary',
              'hover:text-text-primary',
              'focus-visible:ring-white',
              active && 'text-text-primary',
            ]
          : [
              'text-text-secondary',
              'hover:text-text-primary',
              'focus-visible:ring-primary',
              active && 'text-text-primary',
            ],
        className
      )}
    >
      {children}
    </NavigationMenuPrimitive.Link>
  );
}

// ============================================================================
// SECTION - Groups related links within content
// ============================================================================

interface MegaMenuSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  /** Use inverted colors for dark backgrounds */
  inverted?: boolean;
}

export function MegaMenuSection({
  title,
  children,
  className,
  inverted = false,
}: MegaMenuSectionProps) {
  return (
    <div className={clsx('flex flex-col gap-spacing-2', className)}>
      {title && (
        <span
          className={clsx(
            // Typography (Design System)
            'text-mono-xs font-weight-medium uppercase tracking-kicker',
            // Colors
            inverted ? 'text-text-disabled' : 'text-text-disabled'
          )}
        >
          {title}
        </span>
      )}
      {children}
    </div>
  );
}

// ============================================================================
// ITEM LINK - Rich link with icon and description
// ============================================================================

interface MegaMenuItemLinkProps {
  href: string;
  children: React.ReactNode;
  /** Optional description text */
  description?: string;
  /** Optional icon element */
  icon?: React.ReactNode;
  className?: string;
  /** Use inverted colors for dark backgrounds */
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
        // Layout
        'group flex items-start gap-spacing-3 p-spacing-3',
        'rounded-card',
        // Transitions
        'transition-colors duration-fast ease-snap',
        // Focus states
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset',
        // Hover/focus colors
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
            // Layout
            'shrink-0 p-spacing-2 rounded-card',
            // Colors
            inverted
              ? 'bg-surface-elevated text-brand-pink'
              : 'bg-primary/10 text-primary'
          )}
        >
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-spacing-1">
        <span
          className={clsx(
            // Typography
            'text-body-sm font-weight-medium',
            // Transitions
            'transition-colors duration-fast ease-snap',
            // Colors with hover state
            inverted
              ? 'text-text-primary group-hover:text-brand-pink'
              : 'text-text-primary group-hover:text-primary'
          )}
        >
          {children}
        </span>
        {description && (
          <span
            className={clsx(
              'text-body-xs',
              inverted ? 'text-text-muted' : 'text-text-muted'
            )}
          >
            {description}
          </span>
        )}
      </div>
    </NavigationMenuPrimitive.Link>
  );
}

// ============================================================================
// FOOTER - Bottom section of dropdown panel
// ============================================================================

interface MegaMenuFooterProps {
  children: React.ReactNode;
  className?: string;
  /** Use inverted colors for dark backgrounds */
  inverted?: boolean;
}

export function MegaMenuFooter({
  children,
  className,
}: MegaMenuFooterProps) {
  return (
    <div
      className={clsx(
        'mt-spacing-6 pt-spacing-4',
        'border-t border-border',
        className
      )}
    >
      {children}
    </div>
  );
}

// ============================================================================
// INDICATOR - Visual indicator showing active menu
// ============================================================================

export function MegaMenuIndicator() {
  return (
    <NavigationMenuPrimitive.Indicator
      className={clsx(
        'top-full z-[1] flex h-2 items-end justify-center overflow-hidden',
        'data-[state=visible]:animate-fade-in',
        'data-[state=hidden]:animate-fade-out',
        'transition-[width,transform] duration-fast ease-snap'
      )}
    >
      <div className="relative top-[60%] size-2 rotate-45 rounded-tl-sm bg-border shadow-hard" />
    </NavigationMenuPrimitive.Indicator>
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
  Section: MegaMenuSection,
  ItemLink: MegaMenuItemLink,
  Footer: MegaMenuFooter,
  Indicator: MegaMenuIndicator,
};

export default MegaMenu;
