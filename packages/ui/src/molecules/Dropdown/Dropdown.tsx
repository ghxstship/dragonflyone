"use client";

import { forwardRef, useState, useRef, useEffect, useCallback, useId } from "react";
import { dropdownVariants } from "./Dropdown.variants.js";
import type { DropdownProps } from "./Dropdown.types.js";

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
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <Dropdown trigger={<Button>Menu</Button>}>
 *   <DropdownMenu>
 *     <DropdownItem onClick={() => console.log('Item 1')}>Item 1</DropdownItem>
 *     <DropdownItem onClick={() => console.log('Item 2')}>Item 2</DropdownItem>
 *   </DropdownMenu>
 * </Dropdown>
 * ```
 */
export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  function Dropdown({ trigger, align = "left", inverted = true, label, className, children, ...props }, ref) {
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
    const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        dropdownRef.current?.querySelector("button")?.focus();
      }
    }, []);

    // Handle trigger click
    const handleTriggerClick = useCallback(() => {
      setIsOpen(!isOpen);
    }, [isOpen]);

    return (
      <div
        ref={ref}
        className={dropdownVariants({ align, inverted, className })}
        {...props}
      >
        {/* Trigger */}
        <div
          onClick={handleTriggerClick}
          onKeyDown={handleKeyDown}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          aria-controls={menuId}
          role="button"
          tabIndex={0}
          className="cursor-pointer"
        >
          {trigger}
        </div>

        {/* Menu */}
        {isOpen && (
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-label={label}
            className="absolute z-50"
          >
            {children}
          </div>
        )}
      </div>
    );
  }
);

Dropdown.displayName = "Dropdown";
