import type { ComponentProps, HTMLAttributes } from "react";

export interface TableHeaderProps extends Omit<ComponentProps<"thead">, "className"> {
  sticky?: boolean;
  className?: string;
}

export interface TableHeaderCellProps extends Omit<ComponentProps<"th">, "className" | "align"> {
  sortable?: boolean;
  onSort?: () => void;
  align?: "left" | "center" | "right";
  className?: string;
}
