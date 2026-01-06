import { forwardRef } from "react";
import { listVariants, listItemVariants } from "./List.variants.js";
import type { ListProps, ListItemProps } from "./List.types.js";

/**
 * List component - Design system wrapper for native list elements.
 * Provides consistent styling and variant support.
 * 
 * @example
 * ```tsx
 * <List variant="disc" spacing="md">
 *   <ListItem>Item 1</ListItem>
 *   <ListItem>Item 2</ListItem>
 * </List>
 * ```
 */
export const List = forwardRef<HTMLElement, ListProps>(
  function List({ as: Component = "ul", variant = "default", spacing = "sm", className, children, ...props }, ref) {
    const variantClasses = {
      default: Component === "ol" ? "list-decimal" : "list-disc",
      none: "list-none",
      disc: "list-disc",
      decimal: "list-decimal",
      check: "list-none",
    };

    return (
      <Component
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Polymorphic ref requires type assertion
        ref={ref as unknown as React.Ref<HTMLElement>}
        className={`${listVariants({ variant, spacing, className })} ${variantClasses[variant]}`}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

/**
 * ListItem component - Design system wrapper for native list item elements.
 * Supports optional icons and consistent styling.
 * 
 * @example
 * ```tsx
 * <ListItem icon={<CheckIcon />}>Completed task</ListItem>
 * <ListItem>Simple item</ListItem>
 * ```
 */
export const ListItem = forwardRef<HTMLLIElement, ListItemProps>(
  function ListItem({ icon, className, children, ...props }, ref) {
    if (icon) {
      return (
        <li
          ref={ref}
          className={listItemVariants({ hasIcon: true, className })}
          {...props}
        >
          <span className={`flex-shrink-0 text-[var(--color-text-muted)]`}>{icon}</span>
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
