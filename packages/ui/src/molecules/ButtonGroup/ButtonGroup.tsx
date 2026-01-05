import { forwardRef } from "react";
import { buttonGroupVariants } from "./ButtonGroup.variants.js";
import type { ButtonGroupProps } from "./ButtonGroup.types.js";

/**
 * ButtonGroup component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold borders between buttons
 * - Clear visual separation
 * - Flexible orientation and spacing
 * - CVA-based variants for consistent theming
 * - Accessibility support with proper ARIA attributes
 * 
 * @example
 * ```tsx
 * <ButtonGroup orientation="horizontal" spacing="md">
 *   <Button variant="solid">Primary</Button>
 *   <Button variant="outline">Secondary</Button>
 *   <Button variant="ghost">Tertiary</Button>
 * </ButtonGroup>
 * 
 * <ButtonGroup orientation="vertical" fullWidth>
 *   <Button variant="solid">Save</Button>
 *   <Button variant="outline">Cancel</Button>
 * </ButtonGroup>
 * ```
 */
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  function ButtonGroup({ 
    orientation = "horizontal", 
    fullWidth = false, 
    spacing = "none",
    className, 
    children, 
    ...props 
  }, ref) {
    return (
      <div
        ref={ref}
        className={buttonGroupVariants({ 
          orientation, 
          fullWidth, 
          spacing, 
          className 
        })}
        role="group"
        aria-label={orientation === "horizontal" ? "Button group" : "Vertical button group"}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ButtonGroup.displayName = "ButtonGroup";
