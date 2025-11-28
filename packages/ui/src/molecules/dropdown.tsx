"use client";

import { forwardRef, useState, useRef, useEffect } from "react";
import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

export type DropdownProps = HTMLAttributes<HTMLDivElement> & {
  trigger: ReactNode;
  align?: "left" | "right";
  inverted?: boolean;
};

/**
 * Dropdown component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold 2px border
 * - Hard offset shadow
 * - Pop-in animation
 * - Clear item separation
 */
export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  function Dropdown({ trigger, align = "left", inverted = false, className, children }, ref) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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

    return (
      <div ref={dropdownRef} className={clsx("relative inline-block", className)}>
        <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
          {trigger}
        </div>

        {isOpen && (
          <div
            ref={ref}
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
  function DropdownItem({ href, inverted = false, className, children, ...props }, ref) {
    const baseClasses = clsx(
      "w-full px-4 py-3 text-left font-body text-sm",
      "transition-all duration-100 ease-[var(--ease-bounce)]",
      "first:rounded-t-[var(--radius-card)] last:rounded-b-[var(--radius-card)]",
      inverted 
        ? clsx(
            "text-grey-200 border-b border-grey-700 last:border-b-0",
            "hover:bg-grey-800 hover:-translate-x-0.5",
            "focus:bg-grey-800 focus:outline-none"
          )
        : clsx(
            "text-black border-b border-grey-200 last:border-b-0",
            "hover:bg-grey-100 hover:-translate-x-0.5",
            "focus:bg-grey-100 focus:outline-none"
          ),
      className
    );

    if (href) {
      return (
        <a href={href} className={baseClasses}>
          {children}
        </a>
      );
    }

    return (
      <button ref={ref} className={baseClasses} {...props}>
        {children}
      </button>
    );
  }
);
