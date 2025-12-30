"use client";

import { forwardRef, useState, useRef, useEffect, useCallback, useId } from "react";
import clsx from "clsx";
import type { HTMLAttributes, ReactNode, KeyboardEvent } from "react";

export type DropdownProps = HTMLAttributes<HTMLDivElement> & {
  trigger: ReactNode;
  align?: "left" | "right";
  inverted?: boolean;
  /** Accessible label for the dropdown menu */
  label?: string;
};

/**
 * Dropdown component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold 2px border
 * - Hard offset shadow
 * - Pop-in animation
 * - Clear item separation
 * - Full keyboard navigation (Escape to close, Arrow keys)
 * - ARIA attributes for screen readers
 */
export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  function Dropdown({ trigger, align = "left", inverted = true, label, className, children }, ref) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const menuId = useId();

    // Handle click outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isOpen]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          setIsOpen(false);
          break;
        case 'ArrowDown':
          if (!isOpen) {
            event.preventDefault();
            setIsOpen(true);
          } else if (menuRef.current) {
            event.preventDefault();
            const items = menuRef.current.querySelectorAll<HTMLElement>('button, a');
            if (items.length > 0) {
              items[0].focus();
            }
          }
          break;
        case 'ArrowUp':
          if (isOpen && menuRef.current) {
            event.preventDefault();
            const items = menuRef.current.querySelectorAll<HTMLElement>('button, a');
            if (items.length > 0) {
              items[items.length - 1].focus();
            }
          }
          break;
      }
    }, [isOpen]);

    // Handle menu item keyboard navigation
    const handleMenuKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
      if (!menuRef.current) return;
      
      const items = Array.from(menuRef.current.querySelectorAll<HTMLElement>('button, a'));
      const currentIndex = items.findIndex(item => item === document.activeElement);
      
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          if (currentIndex < items.length - 1) {
            items[currentIndex + 1].focus();
          } else {
            items[0].focus();
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (currentIndex > 0) {
            items[currentIndex - 1].focus();
          } else {
            items[items.length - 1].focus();
          }
          break;
        case 'Escape':
          event.preventDefault();
          setIsOpen(false);
          break;
        case 'Tab':
          setIsOpen(false);
          break;
      }
    }, []);

    return (
      <div 
        ref={dropdownRef} 
        className={clsx("relative inline-block", className)}
        onKeyDown={handleKeyDown}
      >
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          aria-controls={isOpen ? menuId : undefined}
          className="cursor-pointer"
        >
          {trigger}
        </button>

        {isOpen && (
          <div
            ref={(node) => {
              (menuRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
              if (typeof ref === 'function') ref(node);
              else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
            }}
            id={menuId}
            role="menu"
            aria-label={label}
            onKeyDown={handleMenuKeyDown}
            className={clsx(
              "absolute z-dropdown mt-2 min-w-48 border-2 rounded-[var(--radius-card)]",
              "animate-pop-in",
              inverted 
                ? "bg-ink-900 border-grey-600 shadow-[4px_4px_0_rgba(255,255,255,0.15)]" 
                : "bg-white border-black shadow-[4px_4px_0_rgba(0,0,0,0.15)]",
              align === "left" ? "left-0" : "right-0"
            )}
          >
            {children}
          </div>
        )}
      </div>
    );
  }
);

export type DropdownItemProps = HTMLAttributes<HTMLButtonElement> & { 
  href?: string;
  inverted?: boolean;
};

export const DropdownItem = forwardRef<HTMLButtonElement, DropdownItemProps>(
  function DropdownItem({ href, inverted = true, className, children, ...props }, ref) {
    const baseClasses = clsx(
      "w-full px-4 py-3 text-left font-body text-sm",
      "transition-all duration-100 ease-[var(--ease-bounce)]",
      "first:rounded-t-[var(--radius-card)] last:rounded-b-[var(--radius-card)]",
      inverted 
        ? clsx(
            "text-on-dark-secondary border-b border-grey-700 last:border-b-0",
            "hover:bg-grey-800 hover:-translate-x-0.5",
            "focus:bg-grey-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
          )
        : clsx(
            "text-black border-b border-grey-200 last:border-b-0",
            "hover:bg-grey-100 hover:-translate-x-0.5",
            "focus:bg-grey-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
          ),
      className
    );

    if (href) {
      return (
        <a href={href} role="menuitem" className={baseClasses}>
          {children}
        </a>
      );
    }

    return (
      <button ref={ref} role="menuitem" className={baseClasses} {...props}>
        {children}
      </button>
    );
  }
);
