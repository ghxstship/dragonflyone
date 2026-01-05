import type { HTMLAttributes, ReactNode } from "react";

export type TextElement = "span" | "div" | "strong" | "em" | "small";

export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: TextElement;
  variant?: "default" | "muted" | "mono" | "accent";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  weight?: "normal" | "medium" | "semibold" | "bold";
  inverted?: boolean;
  children?: ReactNode;
}

export interface TextVariants {
  variant?: "default" | "muted" | "mono" | "accent";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  weight?: "normal" | "medium" | "semibold" | "bold";
  inverted?: boolean;
  className?: string;
}
