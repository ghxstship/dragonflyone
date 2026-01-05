import { forwardRef } from "react";
import { dropdownItemVariants } from "./Dropdown.variants.js";
import type { DropdownItemProps } from "./Dropdown.types.js";

/**
 * DropdownItem component
 * 
 * An individual dropdown item.
 * 
 * @example
 * ```tsx
 * <DropdownItem onClick={() => console.log('Clicked')}>
 *   Menu Item
 * </DropdownItem>
 * 
 * <DropdownItem disabled>
 *   Disabled Item
 * </DropdownItem>
 * ```
 */
export const DropdownItem = forwardRef<HTMLDivElement, DropdownItemProps>(
  function DropdownItem({ disabled = false, inverted = true, className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        role="menuitem"
        className={dropdownItemVariants({ disabled, inverted, className })}
        {...props}
      >
        {children}
      </div>
    );
  }
);

DropdownItem.displayName = "DropdownItem";
