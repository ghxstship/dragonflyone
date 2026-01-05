import { cva } from "class-variance-authority";

/**
 * ButtonGroup variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders between buttons
 * - Clear visual separation
 * - Flexible orientation and spacing
 */
export const buttonGroupVariants = cva(
  [
    // Base styles
    "inline-flex",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Group orientation
       */
      orientation: {
        horizontal: "flex-row",
        vertical: "flex-col",
      },
      
      /**
       * Full width
       */
      fullWidth: {
        true: "w-full",
        false: "",
      },
      
      /**
       * Spacing between buttons
       */
      spacing: {
        none: "",
        sm: "",
        md: "",
        lg: "",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
      fullWidth: false,
      spacing: "none",
    },
    
    compoundVariants: [
      // Horizontal orientation with border styling
      {
        orientation: "horizontal",
        spacing: "none",
        class: "[&>button]:border-2 [&>button:not(:first-child)]:border-l-0",
      },
      {
        orientation: "horizontal",
        spacing: "sm",
        class: "[&>button]:border-2 [&>button:not(:first-child)]:border-l-0 [&>button:not(:first-child)]:ml-1",
      },
      {
        orientation: "horizontal",
        spacing: "md",
        class: "[&>button]:border-2 [&>button:not(:first-child)]:border-l-0 [&>button:not(:first-child)]:ml-2",
      },
      {
        orientation: "horizontal",
        spacing: "lg",
        class: "[&>button]:border-2 [&>button:not(:first-child)]:border-l-0 [&>button:not(:first-child)]:ml-4",
      },
      
      // Vertical orientation with border styling
      {
        orientation: "vertical",
        spacing: "none",
        class: "[&>button]:border-2 [&>button:not(:first-child)]:border-l-2 [&>button:not(:first-child)]:border-t-0",
      },
      {
        orientation: "vertical",
        spacing: "sm",
        class: "[&>button]:border-2 [&>button:not(:first-child)]:border-l-2 [&>button:not(:first-child)]:border-t-0 [&>button:not(:first-child)]:mt-1",
      },
      {
        orientation: "vertical",
        spacing: "md",
        class: "[&>button]:border-2 [&>button:not(:first-child)]:border-l-2 [&>button:not(:first-child)]:border-t-0 [&>button:not(:first-child)]:mt-2",
      },
      {
        orientation: "vertical",
        spacing: "lg",
        class: "[&>button]:border-2 [&>button:not(:first-child)]:border-l-2 [&>button:not(:first-child)]:border-t-0 [&>button:not(:first-child)]:mt-4",
      },
    ],
  }
);
