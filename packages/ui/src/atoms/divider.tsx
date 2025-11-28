import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

export type DividerProps = HTMLAttributes<HTMLHRElement> & {
  orientation?: "horizontal" | "vertical";
  weight?: "thin" | "medium" | "thick";
  inverted?: boolean;
};

/**
 * Divider component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Default 2px weight (medium) for bold aesthetic
 * - Thick option for maximum impact
 * - Clean geometric lines
 */
export const Divider = forwardRef<HTMLHRElement, DividerProps>(
  function Divider({ orientation = "horizontal", weight = "medium", inverted = false, className, ...props }, ref) {
    // Default to 2px (medium) for bold aesthetic
    const weightClasses = {
      thin: orientation === "horizontal" ? "border-t" : "border-l",
      medium: orientation === "horizontal" ? "border-t-2" : "border-l-2",
      thick: orientation === "horizontal" ? "border-t-4" : "border-l-4",
    };

    const orientationClasses = {
      horizontal: "w-full",
      vertical: "h-full",
    };

    return (
      <hr
        ref={ref}
        className={clsx(
          "border-0",
          inverted ? "border-grey-700" : "border-grey-300",
          orientationClasses[orientation],
          weightClasses[weight],
          className
        )}
        {...props}
      />
    );
  }
);
