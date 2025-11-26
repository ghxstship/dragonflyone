"use client";

import { forwardRef, useState, useRef, useEffect } from "react";
import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

export type DropdownProps = HTMLAttributes<HTMLDivElement> & {
  trigger: ReactNode;
  align?: "left" | "right";
};

export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  function Dropdown({ trigger, align = "left", className, children }, ref) {
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
              "absolute z-dropdown mt-2 min-w-[200px] bg-white border-2 border-black shadow-hard",
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

export const DropdownItem = forwardRef<HTMLButtonElement, HTMLAttributes<HTMLButtonElement> & { href?: string }>(
  function DropdownItem({ href, className, children, ...props }, ref) {
    const baseClasses = clsx(
      "w-full px-4 py-3 text-left font-body text-body-sm transition-colors duration-base",
      "hover:bg-grey-100 focus:bg-grey-100 focus:outline-none",
      "border-b border-grey-200 last:border-b-0",
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
