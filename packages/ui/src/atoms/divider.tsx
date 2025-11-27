import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

export type DividerProps = HTMLAttributes<HTMLHRElement> & {
  orientation?: "horizontal" | "vertical";
  weight?: "thin" | "medium" | "thick";
  inverted?: boolean;
};

export const Divider = forwardRef<HTMLHRElement, DividerProps>(
  function Divider({ orientation = "horizontal", weight = "thin", inverted = false, className, ...props }, ref) {
    const weightClasses = {
      thin: orientation === "horizontal" ? "border-t" : "border-l",
      medium: orientation === "horizontal" ? "border-t-2" : "border-l-2",
      thick: orientation === "horizontal" ? "border-t-3" : "border-l-3",
    };

    const orientationClasses = {
      horizontal: "w-full",
      vertical: "h-full",
    };

    return (
      <hr
        ref={ref}
        className={clsx(
          inverted ? "border-grey-700" : "border-black",
          orientationClasses[orientation],
          weightClasses[weight],
          className
        )}
        {...props}
      />
    );
  }
);
