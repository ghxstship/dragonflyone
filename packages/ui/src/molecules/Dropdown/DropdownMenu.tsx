import { forwardRef } from "react";
import { dropdownMenuVariants } from "./Dropdown.variants.js";
import type { DropdownMenuProps } from "./Dropdown.types.js";

/**
 * DropdownMenu component
 * 
 * The menu container for dropdown items.
 * 
 * @example
 * ```tsx
 * <DropdownMenu align="left">
 *   <DropdownItem>Item 1</DropdownItem>
 *   <DropdownItem>Item 2</DropdownItem>
 * </DropdownMenu>
 * ```
 */
export const DropdownMenu = forwardRef<HTMLDivElement, DropdownMenuProps>(
  function DropdownMenu({ inverted = true, className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={dropdownMenuVariants({ inverted, className })}
        {...props}
      >
        {children}
      </div>
    );
  }
);

DropdownMenu.displayName = "DropdownMenu";
