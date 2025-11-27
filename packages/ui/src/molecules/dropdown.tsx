"use client";

import { forwardRef, useState, useRef, useEffect } from "react";
import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

export type DropdownProps = HTMLAttributes<HTMLDivElement> & {
  trigger: ReactNode;
  align?: "left" | "right";
  inverted?: boolean;
};

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
        <div onClick={() => setIsOpen(!isOpen)}>
          {trigger}
        </div>

        {isOpen && (
          <div
            className={clsx(
              "absolute z-dropdown mt-spacing-2 min-w-spacing-48 border-2",
              inverted 
                ? "bg-ink-900 border-grey-600 shadow-hard-white" 
                : "bg-white border-black shadow-hard",
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
      "w-full px-spacing-4 py-spacing-3 text-left font-body text-body-sm transition-colors duration-base",
      inverted 
        ? "text-grey-200 hover:bg-grey-800 focus:bg-grey-800 border-b border-grey-700 last:border-b-0"
        : "text-black hover:bg-grey-100 focus:bg-grey-100 border-b border-grey-200 last:border-b-0",
      "focus:outline-none",
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
