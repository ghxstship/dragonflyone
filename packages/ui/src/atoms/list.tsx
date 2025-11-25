import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes, LiHTMLAttributes } from "react";

export interface ListProps extends HTMLAttributes<HTMLUListElement | HTMLOListElement> {
  as?: "ul" | "ol";
  variant?: "default" | "none" | "disc" | "decimal" | "check";
  spacing?: "none" | "sm" | "md" | "lg";
}

export const List = forwardRef<HTMLUListElement | HTMLOListElement, ListProps>(
  function List({ as: Component = "ul", variant = "default", spacing = "sm", className, children, ...props }, ref) {
    const variantClasses = {
      default: Component === "ol" ? "list-decimal" : "list-disc",
      none: "list-none",
      disc: "list-disc",
      decimal: "list-decimal",
      check: "list-none",
    };

    const spacingClasses = {
      none: "space-y-0",
      sm: "space-y-1",
      md: "space-y-2",
      lg: "space-y-4",
    };

    return (
      <Component
        ref={ref as any}
        className={clsx(
          variantClasses[variant],
          spacingClasses[spacing],
          variant !== "none" && variant !== "check" && "pl-4",
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

export interface ListItemProps extends LiHTMLAttributes<HTMLLIElement> {
  icon?: React.ReactNode;
}

export const ListItem = forwardRef<HTMLLIElement, ListItemProps>(
  function ListItem({ icon, className, children, ...props }, ref) {
    if (icon) {
      return (
        <li
          ref={ref}
          className={clsx("flex gap-2 items-start", className)}
          {...props}
        >
          <span className="flex-shrink-0 text-ink-500">{icon}</span>
          <span>{children}</span>
        </li>
      );
    }

    return (
      <li
        ref={ref}
        className={className}
        {...props}
      >
        {children}
      </li>
    );
  }
);
